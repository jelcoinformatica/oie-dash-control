import { useState, useCallback, useEffect, useRef } from 'react';
import { Order } from '../types/order';
import { fetchOrders, updateOrderStatus, expediteOrder, addSimulatedOrder, fetchProductionOrders, fetchReadyOrders } from '../services/orderService';
import { cloudInsertOrder, cloudInsertOrders, cloudUpdateOrderStatus, cloudDeleteOrder, cloudClearAllOrders } from '../services/cloudOrderService';
import { useTextToSpeech } from './useTextToSpeech';

interface TTSConfig {
  enabled: boolean;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  textType?: 'number_only' | 'name_ready' | 'order_ready' | 'name_order_ready' | 'custom';
  customText?: string;
  repeatEnabled?: boolean;
  repeatCount?: number;
  repeatInterval?: number;
}

interface AutoExpeditionConfig {
  enabled: boolean;
  minutes: number;
}

export const useOrders = (ttsConfig: TTSConfig, autoExpeditionConfig: AutoExpeditionConfig, apiBaseUrl: string, useMockData: boolean, config?: any) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastOrderNumber, setLastOrderNumber] = useState<string>('');
  const [lastOrderData, setLastOrderData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [expeditionLog, setExpeditionLog] = useState<Array<{orderNumber: string, nickname?: string, expeditionTime: Date, createdAt?: Date, isAutoExpedition?: boolean}>>([]);
  const [productionOrders, setProductionOrders] = useState<Order[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  
  const { speak } = useTextToSpeech();
  const previousLastOrderNumber = useRef<string>('');
  const ttsConfigRef = useRef(ttsConfig);
  const autoExpeditionConfigRef = useRef(autoExpeditionConfig);
  const autoExpeditionTimeoutRef = useRef<NodeJS.Timeout>();
  const apiBaseUrlRef = useRef(apiBaseUrl);
  const useMockDataRef = useRef(useMockData);
  const cloudCleanedRef = useRef(false);
  
  // Atualizar refs quando configs mudarem
  useEffect(() => {
    ttsConfigRef.current = ttsConfig;
    autoExpeditionConfigRef.current = autoExpeditionConfig;
    apiBaseUrlRef.current = apiBaseUrl;
    useMockDataRef.current = useMockData;
  }, [ttsConfig, autoExpeditionConfig, apiBaseUrl, useMockData]);

  const loadOrders = useCallback(async () => {
    if (loading) return;
    
    try {
      setLoading(true);

      const forceMockSimulation = localStorage.getItem('simulation-force-mock') === 'true';
      const shouldUseMock = useMockDataRef.current || forceMockSimulation;

      // Busca os pedidos em produção e prontos simultaneamente
      const [productionData, readyData] = await Promise.all([
        fetchProductionOrders(apiBaseUrlRef.current, shouldUseMock),
        fetchReadyOrders(apiBaseUrlRef.current, shouldUseMock)
      ]);

      console.log('Pedidos em produção:', productionData);
      console.log('Pedidos prontos:', readyData);

      // Atualiza os estados
      setProductionOrders(productionData);
      setReadyOrders(readyData);

      // Processa o último pedido pronto (se houver)
      if (readyData.length > 0) {
        const lastReady = readyData[0];
        if (lastReady.numeroPedido !== lastOrderNumber) {
          setLastOrderData(lastReady);
          setLastOrderNumber(lastReady.numeroPedido);
        }
      }


      console.log('Estados atualizados:', {
        producao: productionData.length,
        prontos: readyData.length
      });

    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, lastOrderNumber]); // Manter lastOrderNumber para a lógica interna de comparação
  
  const moveToReady = useCallback(async (orderId: string) => {
    const forceMock = localStorage.getItem('simulation-force-mock') === 'true';
    const isMock = useMockDataRef.current || forceMock;
    
    try {
      let updatedOrder: Order;
      
      if (isMock) {
        // Modo local: atualizar diretamente no estado
        const existingOrder = productionOrders.find(o => o.id === orderId);
        if (!existingOrder) return;
        updatedOrder = { ...existingOrder, status: 'ready' as const, updatedAt: new Date() };
      } else {
        updatedOrder = await updateOrderStatus(orderId, 'ready', apiBaseUrlRef.current);
      }
      
      // Atualizar estados diretamente
      setProductionOrders(prev => prev.filter(o => o.id !== orderId));
      setReadyOrders(prev => [updatedOrder, ...prev]);
      
      // Sincronizar com Cloud
      cloudUpdateOrderStatus(orderId, 'ready').catch(() => {});
      
      const newOrderNumber = updatedOrder.numeroPedido || updatedOrder.number || '';
      
      // Armazenar dados completos do último pedido
      setLastOrderData(updatedOrder);
      
      // Falar o novo pedido se TTS habilitado
      if (ttsConfigRef.current?.enabled && newOrderNumber !== previousLastOrderNumber.current) {
        const nickname = updatedOrder.nomeCliente;
        const textToSpeak = nickname ? `Pedido ${newOrderNumber}, ${nickname}` : `Pedido ${newOrderNumber}`;
        const soundFile = autoExpeditionConfigRef.current?.enabled && config?.sounds?.ready && config?.sounds?.readyFile 
          ? config.sounds.readyFile 
          : undefined;
        const readySoundType = config?.sounds?.readySoundType || 'padrao';
        const airportTones = config?.sounds?.airportTones || 2;
        const deliveryPlatform = updatedOrder.localEntrega || '';
        speak(textToSpeak, newOrderNumber, nickname || '', ttsConfigRef.current, soundFile, readySoundType, airportTones, deliveryPlatform);
      }
      
      previousLastOrderNumber.current = newOrderNumber;
      setLastOrderNumber(newOrderNumber);
      
    } catch (error) {
      console.error('Erro ao mover pedido:', error);
    }
  }, [productionOrders, lastOrderNumber, speak, apiBaseUrlRef.current]);

  const expedite = useCallback(async (orderNumber: string) => {
    const forceMock = localStorage.getItem('simulation-force-mock') === 'true';
    const isMock = useMockDataRef.current || forceMock;
    
    try {
      // Verificar se começa com "-" para retornar para produção
      if (orderNumber.startsWith('-')) {
        const numOnly = orderNumber.slice(1);
        const order = readyOrders.find(o => {
          const orderNum = o.numeroPedido || o.number || '';
          return orderNum === numOnly || orderNum.replace(/[^\d]/g, '') === numOnly;
        });
        
        if (order) {
          if (!isMock) {
            await updateOrderStatus(order.id, 'production', apiBaseUrlRef.current);
          }
          
          // Atualizar estados diretamente
          setReadyOrders(prev => prev.filter(o => o.id !== order.id));
          setProductionOrders(prev => [{ ...order, status: 'production' as const }, ...prev]);
          
          // Se era o último pedido, atualizar dados
          if ((order.numeroPedido || order.number) === lastOrderNumber) {
            const remainingReady = readyOrders.filter(o => o.id !== order.id);
            if (remainingReady.length > 0) {
              const newLastOrder = remainingReady[0];
              setLastOrderNumber(newLastOrder.numeroPedido || newLastOrder.number || '');
              setLastOrderData(newLastOrder);
            } else {
              setLastOrderNumber('');
              setLastOrderData(null);
            }
          }
          
          setExpeditionLog(prev => [{
            orderNumber: order.numeroPedido || order.number || '',
            nickname: order.nomeCliente,
            expeditionTime: new Date(),
            createdAt: order.createdAt || order.ultimoConsumo || new Date(),
            isAutoExpedition: false
          }, ...prev].slice(0, 10));
        }
        return;
      }
      
      // Expedição normal
      const order = readyOrders.find(o => {
        const orderNum = o.numeroPedido || o.number || '';
        return orderNum === orderNumber || orderNum.replace(/[^\d]/g, '') === orderNumber;
      });
      
      if (order) {
        if (!isMock) {
            await expediteOrder(order.id, apiBaseUrlRef.current);
          }
          
          // Sincronizar com Cloud
          cloudDeleteOrder(order.id).catch(() => {});
        
        // Remover do estado
        setReadyOrders(prev => prev.filter(o => o.id !== order.id));
        
        // Se foi expedido o último pedido, encontrar novo último pedido
        if (orderNumber === lastOrderNumber) {
          const remainingReady = readyOrders.filter(o => o.id !== order.id);
          if (remainingReady.length > 0) {
            const newLastOrder = remainingReady[0];
            setLastOrderNumber(newLastOrder.numeroPedido || newLastOrder.number || '');
            setLastOrderData(newLastOrder);
          } else {
            setLastOrderNumber('');
            setLastOrderData(null);
          }
        }
        
        setExpeditionLog(prev => [{
          orderNumber: order.numeroPedido || order.number || '',
          nickname: order.nomeCliente,
          expeditionTime: new Date(),
          createdAt: order.createdAt || order.ultimoConsumo || new Date(),
          isAutoExpedition: false
        }, ...prev].slice(0, 10));
      }
    } catch (error) {
      console.error('Erro ao expedir pedido:', error);
    }
  }, [readyOrders, lastOrderNumber, apiBaseUrlRef.current]);
  
  // Auto-expedição otimizada
  useEffect(() => {
    // Limpar timeout anterior
    if (autoExpeditionTimeoutRef.current) {
      clearTimeout(autoExpeditionTimeoutRef.current);
    }
    
    const autoConfig = autoExpeditionConfigRef.current;
    if (!autoConfig?.enabled || !lastOrderNumber || !lastOrderData) return;
    
    const expediteTime = (autoConfig.minutes || 10) * 60 * 1000;
    
    autoExpeditionTimeoutRef.current = setTimeout(async () => {
      // Verificar se o pedido ainda existe antes de expedir
      if (orders.some(o => o.status === 'ready' && (o.numeroPedido || o.number) === lastOrderNumber)) {
        try {
          console.log('Auto-expedindo pedido:', lastOrderNumber);
          await expedite(lastOrderNumber);
        } catch (error) {
          console.error('Erro na auto-expedição:', error);
        }
      }
    }, expediteTime);
    
    return () => {
      if (autoExpeditionTimeoutRef.current) {
        clearTimeout(autoExpeditionTimeoutRef.current);
      }
    };
  }, [lastOrderNumber, autoExpeditionConfigRef.current?.enabled, autoExpeditionConfigRef.current?.minutes, expedite]);
  
  // Funções para simulação
  const clearAllOrders = useCallback(async () => {
    setOrders([]);
    setProductionOrders([]);
    setReadyOrders([]);
    setLastOrderNumber('');
    setLastOrderData(null);
    setExpeditionLog([]);
    
    // Desativar modo simulação
    localStorage.removeItem('simulation-force-mock');
    setIsSimulationActive(false);
    console.log('🔴 Modo SIMULAÇÃO desativado — API restaurada.');
    
    try {
      const { clearAllOrdersService } = await import('../services/orderService');
      await clearAllOrdersService(apiBaseUrlRef.current, true);
      // Limpar Cloud também
      await cloudClearAllOrders().catch(() => {});
    } catch (error) {
      console.error('Erro ao zerar pedidos:', error);
    }
    
    localStorage.setItem('orders-cleared', 'true');
  }, []);
  
  const generateOrders = useCallback(async (count: number, config?: any) => {
    try {
      console.log(`🎯 Iniciando geração de ${count} pedidos...`);
      
      // Ativar modo simulação automaticamente
      localStorage.removeItem('orders-cleared');
      localStorage.setItem('simulation-force-mock', 'true');
      setIsSimulationActive(true);
      console.log('🟢 Modo SIMULAÇÃO ativado — chamadas à API ignoradas.');
      // Verificar módulos da simulação (prioridade) ou módulos ativos
      const simModules = config?.simulation?.modules;
      const activeModules = simModules && simModules.length > 0
        ? simModules
        : (() => {
            const m: string[] = [];
            if (config?.modules?.balcao?.enabled) m.push('balcao');
            if (config?.modules?.mesa?.enabled) m.push('mesa');
            if (config?.modules?.entrega?.enabled) m.push('entrega');
            if (config?.modules?.ficha?.enabled) m.push('ficha');
            return m;
          })();
      
      // Se nenhum módulo ativo, usar ficha como padrão
      const modulesToUse = activeModules.length > 0 ? activeModules : ['ficha'];
      
      console.log(`📋 Módulos ativos: ${modulesToUse.join(', ')}`);
      
      // Simulação SEMPRE usa mock data (independente da config de API)
      
      // Gerar todos os pedidos sequencialmente
      for (let i = 0; i < count; i++) {
        console.log(`⚙️ Gerando pedido ${i + 1}/${count}...`);
        
        try {
          const allowedPlatforms = config?.simulation?.deliveryPlatforms || ['IF', 'RA', 'DD', 'KE', '99'];
          const newOrder = await addSimulatedOrder(modulesToUse, apiBaseUrlRef.current, true, allowedPlatforms);
          console.log(`🆕 Pedido criado: ${newOrder.numeroPedido} (${newOrder.modulo})`);
          // Sincronizar com Cloud em background
          cloudInsertOrder(newOrder).catch(() => {});
        } catch (error) {
          console.error(`❌ Erro ao criar pedido ${i + 1}:`, error);
        }
      }
      
      console.log(`✅ Processo de geração concluído`);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      await loadOrders();
      
      console.log(`🔄 Estado recarregado completo`);
      
    } catch (error) {
      console.error('❌ Erro geral ao gerar pedidos:', error);
    }
  }, [loadOrders, apiBaseUrlRef.current, useMockDataRef.current]);

  const startSimulation = useCallback(() => {
    setIsSimulationActive(true);
  }, []);

  const stopSimulation = useCallback(() => {
    setIsSimulationActive(false);
  }, []);

  // Ref para a função loadOrders para evitar "stale closure" no setInterval
  const loadOrdersRef = useRef(loadOrders);
  useEffect(() => {
    loadOrdersRef.current = loadOrders;
  }, [loadOrders]);

  // Sincronizar pedidos com localStorage para o preview mobile (iframe /acompanhar)
  useEffect(() => {
    const forceMock = localStorage.getItem('simulation-force-mock') === 'true';
    if (forceMock || isSimulationActive) {
      try {
        localStorage.setItem('sim-production-orders', JSON.stringify(productionOrders));
        localStorage.setItem('sim-ready-orders', JSON.stringify(readyOrders));
      } catch (e) {
        console.warn('Erro ao sincronizar pedidos com localStorage:', e);
      }
    }
  }, [productionOrders, readyOrders, isSimulationActive]);

  // Ao montar, se NÃO há simulação ativa, limpar pedidos órfãos do Cloud
  useEffect(() => {
    if (cloudCleanedRef.current) return;
    const forceMock = localStorage.getItem('simulation-force-mock') === 'true';
    if (!forceMock && !isSimulationActive) {
      cloudCleanedRef.current = true;
      cloudClearAllOrders().catch(() => {});
      console.log('🧹 Cloud limpo na inicialização (sem simulação ativa).');
    }
  }, []);

  // IMPORTANTE: Em modo simulação, o polling é completamente desativado.
  useEffect(() => {
    const forceMock = localStorage.getItem('simulation-force-mock') === 'true';
    
    if (forceMock || isSimulationActive) {
      // Modo simulação: NÃO fazer polling à API
      console.log('🎮 Modo SIMULAÇÃO ativo — polling desativado, sem chamadas à API.');
      return;
    }

    // 1. Carrega os pedidos imediatamente ao montar o componente.
    loadOrdersRef.current();

    // 2. Configura um intervalo para atualizações periódicas a cada 10 segundos.
    const intervalId = setInterval(() => {
      console.log('Polling for new orders...');
      loadOrdersRef.current();
    }, 10000);

    // 3. Limpa o intervalo quando o componente é desmontado.
    return () => {
      clearInterval(intervalId);
    }
  }, [isSimulationActive]);

  return {
    orders,
    productionOrders,
    readyOrders,
    lastOrderNumber,
    lastOrderData,
    loading,
    moveToReady,
    expedite,
    startSimulation,
    stopSimulation,
    isSimulationActive,
    expeditionLog,
    clearAllOrders,
    generateOrders
  };
};