import { useState, useEffect, useCallback, useRef } from 'react';
import { Order } from '../types/order';
import { getSimulatedOrdersFromStorage } from '../services/orderService';
import { cloudFetchProductionOrders, cloudFetchReadyOrders, cloudSubscribeOrders } from '../services/cloudOrderService';
import { defaultConfig } from '../data/defaultConfig';
import { PanelConfig } from '../types/order';

// Helper to manage marked orders in localStorage (per-device)
const MARKED_KEY = 'oie-marked-orders';
const getMarkedOrders = (): string[] => {
  try { return JSON.parse(localStorage.getItem(MARKED_KEY) || '[]'); } catch { return []; }
};
const saveMarkedOrders = (ids: string[]) => {
  localStorage.setItem(MARKED_KEY, JSON.stringify(ids));
};

const Acompanhar = () => {
  const [productionOrders, setProductionOrders] = useState<Order[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [markedIds, setMarkedIds] = useState<string[]>(getMarkedOrders);
  const [alertOrder, setAlertOrder] = useState<Order | null>(null);
  const loadingRef = useRef(false);
  const alertAudioRef = useRef<HTMLAudioElement | null>(null);
  const productionIdsRef = useRef<Set<string>>(new Set());

  // Keep refs in sync
  const markedIdsRef = useRef(markedIds);
  useEffect(() => { markedIdsRef.current = markedIds; }, [markedIds]);

  const config: PanelConfig = (() => {
    try {
      const saved = localStorage.getItem('oie-config');
      if (saved) return { ...defaultConfig, ...JSON.parse(saved) };
    } catch {}
    return defaultConfig;
  })();

  // Mark/unmark an order
  const toggleMark = useCallback((orderId: string) => {
    setMarkedIds(prev => {
      const next = prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId];
      saveMarkedOrders(next);
      return next;
    });
  }, []);

  // Trigger alert when a marked order becomes ready
  const triggerAlert = useCallback((order: Order) => {
    setAlertOrder(order);
    // Vibrate if supported
    if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300]);
    // Play sound
    try {
      const audio = new Audio('/sounds/kds_sound_bell1.wav');
      audio.volume = 1;
      audio.play().catch(() => {});
      alertAudioRef.current = audio;
    } catch {}
    // Auto-dismiss after 8 seconds
    setTimeout(() => setAlertOrder(null), 8000);
  }, []);

  // Check if an order moving to ready is one we marked
  const checkMarkedOrderReady = useCallback((order: Order) => {
    if (markedIdsRef.current.includes(order.id)) {
      triggerAlert(order);
      // Remove from marked since it's now ready
      setMarkedIds(prev => {
        const next = prev.filter(id => id !== order.id);
        saveMarkedOrders(next);
        return next;
      });
    }
  }, [triggerAlert]);

  // Load orders
  const loadOrders = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const [prod, ready] = await Promise.all([
        cloudFetchProductionOrders(),
        cloudFetchReadyOrders()
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

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  // Realtime subscription
  useEffect(() => {
    const unsubscribe = cloudSubscribeOrders(
      (order) => {
        if (order.status === 'production') {
          setProductionOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
          productionIdsRef.current.add(order.id);
        } else if (order.status === 'ready') {
          setReadyOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
          // Check if this was a marked production order
          if (productionIdsRef.current.has(order.id)) {
            checkMarkedOrderReady(order);
            productionIdsRef.current.delete(order.id);
          }
        }
      },
      (order) => {
        if (order.status === 'ready') {
          setProductionOrders(prev => prev.filter(o => o.id !== order.id));
          setReadyOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
          checkMarkedOrderReady(order);
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
      }
    );
    return unsubscribe;
  }, [checkMarkedOrderReady]);

  // Cleanup stale marked IDs (orders that no longer exist)
  useEffect(() => {
    const allIds = new Set([...productionOrders.map(o => o.id), ...readyOrders.map(o => o.id)]);
    setMarkedIds(prev => {
      const cleaned = prev.filter(id => allIds.has(id));
      if (cleaned.length !== prev.length) saveMarkedOrders(cleaned);
      return cleaned;
    });
  }, [productionOrders, readyOrders]);

  // Block navigation
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname !== '/acompanhar') {
        window.history.pushState(null, '', '/acompanhar');
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', '/acompanhar');
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const displayNumber = (order: Order) => {
    const num = String(order.numeroPedido || order.number || '');
    const isDelivery = num.match(/^(IF|DD|RA|UB)-/);
    if (isDelivery) return num.split('-')[1];
    return num;
  };

  const displayName = (order: Order) => order.nomeCliente || order.nickname || '';

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 overflow-hidden select-none" 
         style={{ touchAction: 'none' }}>

      {/* ALERT OVERLAY */}
      {alertOrder && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center animate-pulse"
          style={{ backgroundColor: 'rgba(0, 180, 50, 0.92)' }}
          onClick={() => setAlertOrder(null)}
        >
          <div className="text-center text-white px-6">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-2xl font-bold mb-2">SEU PEDIDO ESTÁ PRONTO!</div>
            <div className="text-7xl font-black my-6" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              {displayNumber(alertOrder)}
            </div>
            {displayName(alertOrder) && (
              <div className="text-2xl font-semibold opacity-90">{displayName(alertOrder)}</div>
            )}
            <div className="mt-8 text-sm opacity-70">Toque para fechar</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-shrink-0 bg-gray-800 px-4 py-3 text-center border-b border-gray-700">
        <h1 className="text-white text-lg font-bold tracking-wide">
          📋 Acompanhe seu Pedido
        </h1>
        {markedIds.length > 0 && (
          <p className="text-amber-400 text-xs mt-0.5">
            ⭐ {markedIds.length} pedido{markedIds.length > 1 ? 's' : ''} marcado{markedIds.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Ready section */}
      <div className="flex-1 flex flex-col min-h-0 px-3 pt-3 pb-1">
        <div className="flex-shrink-0 rounded-t-xl px-4 py-2.5 flex items-center justify-between"
             style={{ backgroundColor: config.ready.headerBg || '#0011FA' }}>
          <span className="text-white font-bold text-base tracking-wider">
            ✅ {config.ready.title || 'PRONTOS'}
          </span>
          <span className="bg-white/20 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
            {readyOrders.length}
          </span>
        </div>
        <div className="flex-1 bg-white rounded-b-xl p-2 min-h-0 overflow-hidden">
          <MobileCardGrid orders={readyOrders} variant="ready" displayNumber={displayNumber} displayName={displayName} markedIds={[]} onToggleMark={() => {}} />
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
            {productionOrders.length}
          </span>
        </div>
        <div className="flex-1 bg-gray-100 rounded-b-xl p-2 overflow-hidden" style={{ height: 'calc(100% - 36px)' }}>
          <MobileCardGrid 
            orders={productionOrders} 
            variant="production" 
            displayNumber={displayNumber} 
            displayName={displayName}
            markedIds={markedIds}
            onToggleMark={toggleMark}
          />
        </div>
        {markedIds.length === 0 && productionOrders.length > 0 && (
          <div className="text-center mt-1">
            <span className="text-gray-500 text-[10px]">💡 Toque no seu pedido para ser avisado quando ficar pronto</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 bg-gray-800 px-4 py-1.5 text-center border-t border-gray-700">
        <span className="text-gray-500 text-xs">Oie! Painel de Acompanhamento • Realtime ⚡</span>
      </div>
    </div>
  );
};

// Grid component
const MobileCardGrid = ({ 
  orders, variant, displayNumber, displayName, markedIds, onToggleMark
}: { 
  orders: Order[]; 
  variant: 'ready' | 'production';
  displayNumber: (o: Order) => string;
  displayName: (o: Order) => string;
  markedIds: string[];
  onToggleMark: (id: string) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxCards, setMaxCards] = useState(20);
  const isReady = variant === 'ready';

  useEffect(() => {
    const updateMax = () => {
      if (!containerRef.current) return;
      const h = containerRef.current.clientHeight;
      const cardH = isReady ? 72 : 56;
      const gap = 8;
      const rows = Math.max(1, Math.floor((h + gap) / (cardH + gap)));
      setMaxCards(rows * 2);
    };
    updateMax();
    window.addEventListener('resize', updateMax);
    return () => window.removeEventListener('resize', updateMax);
  }, [isReady]);

  const visibleOrders = orders.slice(0, maxCards);

  if (orders.length === 0) {
    return (
      <div ref={containerRef} className="h-full flex items-center justify-center">
        <span className="text-sm text-gray-400">
          {isReady ? 'Nenhum pedido pronto' : 'Nenhum pedido em produção'}
        </span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full">
      <div className="grid grid-cols-2 gap-2 h-full" style={{ gridAutoRows: isReady ? '72px' : '56px' }}>
        {visibleOrders.map((order) => {
          const num = displayNumber(order);
          const name = displayName(order);
          const isMarked = markedIds.includes(order.id);
          const canMark = !isReady; // Only production orders can be marked

          return (
            <div
              key={order.id}
              onClick={() => canMark && onToggleMark(order.id)}
              className={`rounded-lg flex flex-col items-center justify-center p-1.5 border transition-all relative ${
                isReady 
                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                  : isMarked
                    ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-300'
                    : 'bg-white border-gray-200 active:scale-95'
              }`}
              style={{ cursor: canMark ? 'pointer' : 'default' }}
            >
              {isMarked && (
                <span className="absolute top-0.5 right-1 text-amber-500 text-xs">⭐</span>
              )}
              <span className={`font-bold leading-none ${
                isReady ? 'text-blue-700' 
                  : isMarked ? 'text-amber-700' : 'text-gray-600'
              }`} style={{ fontSize: isReady ? '1.6rem' : '1.2rem' }}>
                {num}
              </span>
              {name && (
                <span className={`text-xs mt-0.5 truncate max-w-full ${
                  isReady ? 'text-blue-500' 
                    : isMarked ? 'text-amber-500' : 'text-gray-400'
                }`}>
                  {name}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {orders.length > maxCards && (
        <div className="absolute bottom-1 right-2 text-xs text-gray-400">
          +{orders.length - maxCards} mais
        </div>
      )}
    </div>
  );
};

export default Acompanhar;
