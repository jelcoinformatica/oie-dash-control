import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Order } from '../types/order';
import { getSimulatedOrdersFromStorage } from '../services/orderService';
import { 
  cloudFetchProductionOrders, cloudFetchReadyOrders, cloudSubscribeOrders,
  cloudMarkOrder, cloudUnmarkOrder
} from '../services/cloudOrderService';
import { defaultConfig } from '../data/defaultConfig';
import { PanelConfig } from '../types/order';

const MARKED_KEY = 'oie-my-orders';
const getStoredMarked = (): string[] => {
  try { return JSON.parse(localStorage.getItem(MARKED_KEY) || '[]'); } catch { return []; }
};
const saveStoredMarked = (ids: string[]) => localStorage.setItem(MARKED_KEY, JSON.stringify(ids));

const Acompanhar = () => {
  const [searchParams] = useSearchParams();
  const moduloFilter = searchParams.get('modulo') as Order['modulo'] | null;
  const moduloExclude = searchParams.get('excluir') as Order['modulo'] | null;
  
  const [productionOrders, setProductionOrders] = useState<Order[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [myOrderIds, setMyOrderIds] = useState<string[]>(getStoredMarked);
  const [personalMode, setPersonalMode] = useState(() => getStoredMarked().length > 0);
  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);
  const [alreadyMarkedWarning, setAlreadyMarkedWarning] = useState(false);
  const [alertOrder, setAlertOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState(0); // for multiple orders cycling
  const loadingRef = useRef(false);
  const myOrderIdsRef = useRef(myOrderIds);
  const productionIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => { myOrderIdsRef.current = myOrderIds; saveStoredMarked(myOrderIds); }, [myOrderIds]);

  const config: PanelConfig = (() => {
    try {
      const saved = localStorage.getItem('oie-config');
      if (saved) return { ...defaultConfig, ...JSON.parse(saved) };
    } catch {}
    return defaultConfig;
  })();

  // --- DATA LOADING ---
  const loadOrders = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const [prod, ready] = await Promise.all([
        cloudFetchProductionOrders(), cloudFetchReadyOrders()
      ]);
      if (prod.length > 0 || ready.length > 0) {
        setProductionOrders(prod);
        setReadyOrders(ready);
        productionIdsRef.current = new Set(prod.map(o => o.id));
      } else {
        const stored = getSimulatedOrdersFromStorage();
        setProductionOrders(stored.production);
        setReadyOrders(stored.ready);
        productionIdsRef.current = new Set(stored.production.map(o => o.id));
      }
    } catch {
      const stored = getSimulatedOrdersFromStorage();
      setProductionOrders(stored.production);
      setReadyOrders(stored.ready);
      productionIdsRef.current = new Set(stored.production.map(o => o.id));
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); const i = setInterval(loadOrders, 5000); return () => clearInterval(i); }, [loadOrders]);

  // --- ALERT ---
  const playAlertSound = useCallback(() => {
    try {
      // Gerar tom de alerta chamativo via Web Audio API (mais alto e penetrante)
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.6, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      // Padrão: 3 bips agudos rápidos, pausa, repete 2x
      const now = ctx.currentTime;
      for (let rep = 0; rep < 3; rep++) {
        const base = now + rep * 1.2;
        playTone(1200, base, 0.15);
        playTone(1500, base + 0.2, 0.15);
        playTone(1800, base + 0.4, 0.25);
      }
    } catch {}
    // Também tocar o WAV como backup
    try {
      const a = new Audio('/sounds/kds_sound_bell1.wav');
      a.volume = 1;
      a.play().catch(() => {});
    } catch {}
  }, []);

  const triggerAlert = useCallback((order: Order) => {
    setAlertOrder(order);
    if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 500, 200, 300, 100, 300]);
    playAlertSound();
    // Repetir som após 3s para chamar mais atenção
    const repeat = setTimeout(() => playAlertSound(), 3000);
    setTimeout(() => { setAlertOrder(null); clearTimeout(repeat); }, 10000);
  }, [playAlertSound]);

  const checkMyOrderReady = useCallback((order: Order) => {
    if (myOrderIdsRef.current.includes(order.id)) {
      triggerAlert(order);
    }
  }, [triggerAlert]);

  // --- REALTIME ---
  useEffect(() => {
    const unsubscribe = cloudSubscribeOrders(
      (order) => {
        if (order.status === 'production') {
          setProductionOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
          productionIdsRef.current.add(order.id);
        } else if (order.status === 'ready') {
          setReadyOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
          if (productionIdsRef.current.has(order.id)) {
            checkMyOrderReady(order);
            productionIdsRef.current.delete(order.id);
          }
        }
      },
      (order) => {
        if (order.status === 'ready') {
          setProductionOrders(prev => prev.filter(o => o.id !== order.id));
          setReadyOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
          checkMyOrderReady(order);
          productionIdsRef.current.delete(order.id);
        } else if (order.status === 'production') {
          setReadyOrders(prev => prev.filter(o => o.id !== order.id));
          setProductionOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
          productionIdsRef.current.add(order.id);
        }
      },
      (id) => {
        setProductionOrders(prev => prev.filter(o => o.id !== id));
        setReadyOrders(prev => prev.filter(o => o.id !== id));
        productionIdsRef.current.delete(id);
        // Remove from my orders if expedited
        setMyOrderIds(prev => prev.filter(i => i !== id));
      }
    );
    return unsubscribe;
  }, [checkMyOrderReady]);

  // Clean up stale marked orders
  useEffect(() => {
    const allIds = new Set([...productionOrders.map(o => o.id), ...readyOrders.map(o => o.id)]);
    setMyOrderIds(prev => {
      const cleaned = prev.filter(id => allIds.has(id));
      if (cleaned.length === 0 && personalMode) setPersonalMode(false);
      return cleaned.length !== prev.length ? cleaned : prev;
    });
  }, [productionOrders, readyOrders, personalMode]);

  // Block navigation
  useEffect(() => {
    const fullPath = `/acompanhar${window.location.search}`;
    const h = () => { if (window.location.pathname !== '/acompanhar') window.history.pushState(null, '', fullPath); };
    window.addEventListener('popstate', h);
    window.history.pushState(null, '', fullPath);
    return () => window.removeEventListener('popstate', h);
  }, [moduloFilter, moduloExclude]);

  // --- MARKING FLOW ---
  const handleTapOrder = (order: Order) => {
    if (myOrderIds.includes(order.id)) return; // already mine
    setConfirmOrder(order);
    setAlreadyMarkedWarning(false);
  };

  const handleConfirmMark = async () => {
    if (!confirmOrder) return;
    const { alreadyMarked } = await cloudMarkOrder(confirmOrder.id);
    if (alreadyMarked && !alreadyMarkedWarning) {
      setAlreadyMarkedWarning(true);
      return; // show second-level warning
    }
    // Confirmed
    setMyOrderIds(prev => [...prev, confirmOrder.id]);
    setPersonalMode(true);
    setConfirmOrder(null);
    setAlreadyMarkedWarning(false);
  };

  const handleCancelMark = () => {
    setConfirmOrder(null);
    setAlreadyMarkedWarning(false);
  };

  const handleExitPersonalMode = async () => {
    setPersonalMode(false);
  };

  // --- TIME TICKER ---
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  // --- HELPERS ---
  const displayNumber = (order: Order) => {
    const num = String(order.numeroPedido || order.number || '');
    const m = num.match(/^(IF|DD|RA|UB)-/);
    if (m) return num.split('-')[1];
    return num;
  };
  const displayName = (order: Order) => order.nomeCliente || order.nickname || '';
  const elapsedText = (order: Order) => {
    const created = order.createdAt;
    if (!created) return '';
    const diffMs = now - new Date(created).getTime();
    if (diffMs < 0) return '';
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}min`;
    const h = Math.floor(mins / 60);
    return `${h}h${String(mins % 60).padStart(2, '0')}`;
  };

  // My orders data
  const myProductionOrders = productionOrders.filter(o => myOrderIds.includes(o.id));
  const myReadyOrders = readyOrders.filter(o => myOrderIds.includes(o.id));

  // --- LOADING ---
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl animate-pulse">Carregando...</div>
      </div>
    );
  }

  // Apply module filter from query param (e.g. ?modulo=entrega or ?excluir=entrega)
  const applyFilter = (orders: Order[]) => {
    if (moduloFilter) return orders.filter(o => o.modulo === moduloFilter);
    if (moduloExclude) return orders.filter(o => o.modulo !== moduloExclude);
    return orders;
  };
  const filteredProduction = applyFilter(productionOrders);
  const filteredReady = applyFilter(readyOrders);

  // Reversed production orders (últimos primeiro)
  const reversedProduction = [...filteredProduction].reverse();

  const isDeliveryMode = moduloFilter === 'entrega';
  const isExcludeDeliveryMode = moduloExclude === 'entrega';

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 overflow-hidden select-none" style={{ touchAction: 'none' }}>

      {/* === ALERT OVERLAY === */}
      {alertOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={() => setAlertOrder(null)}>
          <div className="absolute inset-0 bg-green-600 animate-pulse" />
          <div className="relative text-center text-white px-6 z-10">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-2xl font-bold mb-2">SEU PEDIDO ESTÁ PRONTO!</div>
            <div className="text-8xl font-black my-6" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              {displayNumber(alertOrder)}
            </div>
            {displayName(alertOrder) && (
              <div className="text-2xl font-semibold opacity-90">{displayName(alertOrder)}</div>
            )}
            <div className="mt-6 text-lg font-medium">🔔 Retire seu pedido!</div>
            <div className="mt-8 text-sm opacity-60">Toque para fechar</div>
          </div>
        </div>
      )}

      {/* === CONFIRM DIALOG === */}
      {confirmOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 px-6" onClick={handleCancelMark}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            {!alreadyMarkedWarning ? (
              <>
                <h2 className="text-lg font-bold text-gray-800 text-center mb-4">Este é seu pedido?</h2>
                <div className="bg-gray-50 rounded-xl p-6 text-center mb-4">
                  <div className="text-5xl font-black text-gray-800">{displayNumber(confirmOrder)}</div>
                  {displayName(confirmOrder) && (
                    <div className="text-lg text-gray-500 mt-2">{displayName(confirmOrder)}</div>
                  )}
                </div>
                <p className="text-sm text-gray-500 text-center mb-6">
                  📋 Confira o número no seu cupom fiscal antes de confirmar.
                </p>
                <div className="flex gap-3">
                  <button onClick={handleCancelMark} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold">
                    Cancelar
                  </button>
                  <button onClick={handleConfirmMark} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg active:scale-95 transition-transform">
                    É meu! ✅
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-3">
                  <span className="text-4xl">⚠️</span>
                </div>
                <h2 className="text-lg font-bold text-amber-700 text-center mb-3">Atenção</h2>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center mb-4">
                  <p className="text-amber-800 text-sm">
                    O pedido <strong>#{displayNumber(confirmOrder)}</strong> já está sendo acompanhado por outro dispositivo.
                  </p>
                  <p className="text-amber-600 text-xs mt-2">
                    Confira se este é realmente o seu pedido verificando o número no cupom fiscal.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleCancelMark} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold">
                    Voltar
                  </button>
                  <button onClick={handleConfirmMark} className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold shadow-lg active:scale-95 transition-transform">
                    É meu sim!
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* === HEADER === */}
      <div className="flex-shrink-0 bg-gray-800 px-4 py-3 text-center border-b border-gray-700">
        <h1 className="text-white text-lg font-bold tracking-wide">
          {personalMode ? '⭐ Meu Pedido' : isDeliveryMode ? '🏍️ Entregas' : isExcludeDeliveryMode ? '📋 Pedidos (sem delivery)' : '📋 Acompanhe seu Pedido'}
        </h1>
        {personalMode && (
          <button 
            onClick={handleExitPersonalMode}
            className="text-blue-400 text-xs mt-0.5 underline"
          >
            ← Ver todos os pedidos
          </button>
        )}
      </div>

      {/* === PERSONAL MODE === */}
      {personalMode ? (
        <div className="flex-1 flex flex-col min-h-0 px-4 py-4 gap-4">
          {/* My production orders */}
          {myProductionOrders.length > 0 && (
            <div className="flex-1 flex flex-col items-center justify-center">
              {myProductionOrders.map((order, idx) => (
                <div key={order.id} className={`w-full max-w-xs ${idx > 0 ? 'mt-4' : ''}`}>
                  <div className="bg-gray-800 rounded-2xl p-8 text-center border-2 border-gray-600 shadow-xl">
                    <div className="text-gray-400 text-sm font-semibold mb-2 tracking-wider">🔥 EM PREPARO</div>
                    <div className="text-6xl font-black text-white my-4">{displayNumber(order)}</div>
                    {displayName(order) && (
                      <div className="text-xl text-gray-300 font-medium">{displayName(order)}</div>
                    )}
                    <div className="mt-6 flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                      <span className="text-amber-400 text-sm font-medium">Aguardando {elapsedText(order) || '...'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* My ready orders */}
          {myReadyOrders.length > 0 && (
            <div className="flex-shrink-0">
              {myReadyOrders.map((order) => (
                <div key={order.id} className="w-full max-w-xs mx-auto mb-3">
                  <div className="bg-green-600 rounded-2xl p-8 text-center border-2 border-green-400 shadow-xl animate-pulse">
                    <div className="text-green-100 text-sm font-semibold mb-2 tracking-wider">✅ PRONTO!</div>
                    <div className="text-6xl font-black text-white my-4">{displayNumber(order)}</div>
                    {displayName(order) && (
                      <div className="text-xl text-green-100 font-medium">{displayName(order)}</div>
                    )}
                    <div className="mt-4 text-white text-lg font-bold">🔔 Retire seu pedido!</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* All my orders gone */}
          {myProductionOrders.length === 0 && myReadyOrders.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-lg">Todos os seus pedidos foram entregues!</p>
                <button onClick={handleExitPersonalMode} className="mt-4 text-blue-400 underline text-sm">
                  Ver todos os pedidos
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* === NORMAL MODE === */
        <>
          {/* Ready section */}
          <div className="flex-1 flex flex-col min-h-0 px-3 pt-3 pb-1">
            <div className="flex-shrink-0 rounded-t-xl px-4 py-2.5 flex items-center justify-between"
                 style={{ backgroundColor: config.ready.headerBg || '#0011FA' }}>
              <span className="text-white font-bold text-base tracking-wider">
                ✅ {config.ready.title || 'PRONTOS'}
              </span>
              <span className="bg-white/20 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
                {filteredReady.length}
              </span>
            </div>
            <div className="flex-1 bg-white rounded-b-xl p-2 min-h-0 overflow-hidden">
              <MobileCardGrid orders={filteredReady} variant="ready" displayNumber={displayNumber} displayName={displayName} onTap={() => {}} myOrderIds={myOrderIds} elapsedText={elapsedText} />
            </div>
          </div>

          {/* Production section */}
          <div className="flex-shrink-0 px-3 pb-3 pt-1" style={{ height: '35%' }}>
            <div className="flex-shrink-0 rounded-t-xl px-4 py-2 flex items-center justify-between"
                 style={{ backgroundColor: config.production.headerBg || '#636363' }}>
              <span className="text-white font-bold text-sm tracking-wider">
                🔥 {config.production.title || 'EM PRODUÇÃO'}
              </span>
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {filteredProduction.length}
              </span>
            </div>
            <div className="flex-1 bg-gray-100 rounded-b-xl p-2 overflow-hidden" style={{ height: 'calc(100% - 36px)' }}>
              <MobileCardGrid 
                orders={reversedProduction} 
                variant="production" 
                displayNumber={displayNumber} 
                displayName={displayName}
                onTap={handleTapOrder}
                myOrderIds={myOrderIds}
                elapsedText={elapsedText}
              />
            </div>
            {myOrderIds.length === 0 && filteredProduction.length > 0 && (
              <div className="text-center mt-1">
                <span className="text-gray-500 text-[10px]">💡 Toque no seu pedido para acompanhar individualmente</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="flex-shrink-0 bg-gray-800 px-4 py-1.5 text-center border-t border-gray-700">
        <span className="text-gray-500 text-xs">Oie! Painel de Acompanhamento • Realtime ⚡</span>
      </div>
    </div>
  );
};

// --- GRID COMPONENT ---
const MobileCardGrid = ({ orders, variant, displayNumber, displayName, onTap, myOrderIds, elapsedText }: { 
  orders: Order[]; variant: 'ready' | 'production';
  displayNumber: (o: Order) => string; displayName: (o: Order) => string;
  onTap: (o: Order) => void; myOrderIds: string[]; elapsedText: (o: Order) => string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxCards, setMaxCards] = useState(20);
  const isReady = variant === 'ready';

  useEffect(() => {
    const updateMax = () => {
      if (!containerRef.current) return;
      const h = containerRef.current.clientHeight;
      const cardH = isReady ? 72 : 56;
      const rows = Math.max(1, Math.floor((h + 8) / (cardH + 8)));
      setMaxCards(rows * 2);
    };
    updateMax();
    window.addEventListener('resize', updateMax);
    return () => window.removeEventListener('resize', updateMax);
  }, [isReady]);

  const visible = orders.slice(0, maxCards);

  if (orders.length === 0) {
    return (
      <div ref={containerRef} className="h-full flex items-center justify-center">
        <span className="text-sm text-gray-400">{isReady ? 'Nenhum pedido pronto' : 'Nenhum pedido em produção'}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full">
      <div className="grid grid-cols-2 gap-2 h-full" style={{ gridAutoRows: isReady ? '72px' : '56px' }}>
        {visible.map((order) => {
          const num = displayNumber(order);
          const name = displayName(order);
          const isMine = myOrderIds.includes(order.id);
          return (
            <div
              key={order.id}
              onClick={() => !isReady && onTap(order)}
              className={`rounded-lg flex flex-col items-center justify-center p-1.5 border transition-all relative ${
                isReady
                  ? 'bg-blue-50 border-blue-200 shadow-sm'
                  : isMine
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
                    : 'bg-white border-gray-200 active:scale-95'
              }`}
              style={{ cursor: !isReady ? 'pointer' : 'default' }}
            >
              {isMine && <span className="absolute top-0.5 right-1 text-amber-500 text-xs">⭐</span>}
              <span className={`font-bold leading-none ${
                isReady ? 'text-blue-700' : isMine ? 'text-amber-700' : 'text-gray-600'
              }`} style={{ fontSize: isReady ? '1.6rem' : '1.2rem' }}>
                {num}
              </span>
              {name && (
                <span className={`text-xs mt-0.5 truncate max-w-full ${
                  isReady ? 'text-blue-500' : isMine ? 'text-amber-500' : 'text-gray-400'
                }`}>{name}</span>
              )}
              {!isReady && elapsedText(order) && (
                <span className="text-[10px] text-gray-400 mt-0.5">⏱ {elapsedText(order)}</span>
              )}
            </div>
          );
        })}
      </div>
      {orders.length > maxCards && (
        <div className="absolute bottom-1 right-2 text-xs text-gray-400">+{orders.length - maxCards} mais</div>
      )}
    </div>
  );
};

export default Acompanhar;
