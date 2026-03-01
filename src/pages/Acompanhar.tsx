import { useState, useEffect, useCallback, useRef } from 'react';
import { Order } from '../types/order';
import { fetchProductionOrders, fetchReadyOrders } from '../services/orderService';
import { defaultConfig } from '../data/defaultConfig';
import { PanelConfig } from '../types/order';

const Acompanhar = () => {
  const [productionOrders, setProductionOrders] = useState<Order[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);

  // Load config from localStorage (same as main panel)
  const config: PanelConfig = (() => {
    try {
      const saved = localStorage.getItem('oie-config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultConfig, ...parsed };
      }
    } catch {}
    return defaultConfig;
  })();

  const apiBaseUrl = config.database?.apiBaseUrl || defaultConfig.database.apiBaseUrl;
  const useMockData = config.database?.useMockData ?? defaultConfig.database.useMockData;
  const forceMockSimulation = localStorage.getItem('simulation-force-mock') === 'true';
  const isLocalApi = /localhost|127\.0\.0\.1/i.test(apiBaseUrl);
  const shouldUseMockData = useMockData || forceMockSimulation;

  const loadOrders = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const [prod, ready] = await Promise.all([
        fetchProductionOrders(apiBaseUrl, shouldUseMockData),
        fetchReadyOrders(apiBaseUrl, shouldUseMockData)
      ]);
      setProductionOrders(prod);
      setReadyOrders(ready);
    } catch (e) {
      console.error('Erro ao carregar pedidos:', e);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [apiBaseUrl, shouldUseMockData]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  // Block navigation to main panel
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

  // Calculate how many cards fit without scrolling
  const getMaxCards = (containerHeight: number, isReady: boolean) => {
    const cardHeight = isReady ? 72 : 56;
    const gap = 8;
    const cols = isReady ? 2 : 2;
    const rows = Math.floor((containerHeight + gap) / (cardHeight + gap));
    return rows * cols;
  };

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
      {/* Header */}
      <div className="flex-shrink-0 bg-gray-800 px-4 py-3 text-center border-b border-gray-700">
        <h1 className="text-white text-lg font-bold tracking-wide">
          📋 Acompanhe seu Pedido
        </h1>
      </div>

      {(forceMockSimulation || isLocalApi) && (
        <div className="mx-3 mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
          <strong>Modo Simulação/Local ativo:</strong> chamadas à API externa estão desativadas ou indisponíveis neste dispositivo.
          Em celular, pedidos gerados localmente no painel não são sincronizados sem API pública.
        </div>
      )}

      {/* Ready section - DESTAQUE */}
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
          <MobileCardGrid orders={readyOrders} variant="ready" displayNumber={displayNumber} displayName={displayName} />
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
          <MobileCardGrid orders={productionOrders} variant="production" displayNumber={displayNumber} displayName={displayName} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 bg-gray-800 px-4 py-1.5 text-center border-t border-gray-700">
        <span className="text-gray-500 text-xs">Oie! Painel de Acompanhamento</span>
      </div>
    </div>
  );
};

// Grid component that auto-fits cards without scrolling
const MobileCardGrid = ({ 
  orders, 
  variant, 
  displayNumber, 
  displayName 
}: { 
  orders: Order[]; 
  variant: 'ready' | 'production';
  displayNumber: (o: Order) => string;
  displayName: (o: Order) => string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxCards, setMaxCards] = useState(20);

  useEffect(() => {
    const updateMax = () => {
      if (!containerRef.current) return;
      const h = containerRef.current.clientHeight;
      const cardH = variant === 'ready' ? 72 : 56;
      const gap = 8;
      const cols = 2;
      const rows = Math.max(1, Math.floor((h + gap) / (cardH + gap)));
      setMaxCards(rows * cols);
    };
    updateMax();
    window.addEventListener('resize', updateMax);
    return () => window.removeEventListener('resize', updateMax);
  }, [variant]);

  const visibleOrders = orders.slice(0, maxCards);
  const isReady = variant === 'ready';

  if (orders.length === 0) {
    return (
      <div ref={containerRef} className="h-full flex items-center justify-center">
        <span className={`text-sm ${isReady ? 'text-gray-400' : 'text-gray-400'}`}>
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
          return (
            <div
              key={order.id}
              className={`rounded-lg flex flex-col items-center justify-center p-1.5 border transition-all ${
                isReady 
                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <span className={`font-bold leading-none ${
                isReady ? 'text-blue-700' : 'text-gray-600'
              }`} style={{ fontSize: isReady ? '1.6rem' : '1.2rem' }}>
                {num}
              </span>
              {name && (
                <span className={`text-xs mt-0.5 truncate max-w-full ${
                  isReady ? 'text-blue-500' : 'text-gray-400'
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
