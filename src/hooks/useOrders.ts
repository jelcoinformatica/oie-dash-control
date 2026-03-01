import { useState, useCallback, useEffect, useRef } from 'react';
import { Order } from '../types/order';
import { fetchOrders, updateOrderStatus, expediteOrder, addSimulatedOrder, fetchProductionOrders, fetchReadyOrders } from '../services/orderService';
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
      
      // Busca os pedidos em produção e prontos simultaneamente
      let productionData: Order[] = [];
      let readyData: Order[] = [];
      
      try {
        [productionData, readyData] = await Promise.all([
          fetchProductionOrders(apiBaseUrlRef.current, useMockDataRef.current),
          fetchReadyOrders(apiBaseUrlRef.current, useMockDataRef.current)
        ]);
      } catch {
        // Se a API falhar, tenta com mock data (para simulação funcionar)
        if (!useMockDataRef.current) {
          [productionData, readyData] = await Promise.all([
            fetchProductionOrders(apiBaseUrlRef.current, true),
            fetchReadyOrders(apiBaseUrlRef.current, true)
          ]);
        }
      }

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
    try {
      const updatedOrder = await updateOrderStatus(orderId, 'ready', apiBaseUrlRef.current);
      setOrders(prev => prev.map(o => 
        o.id === orderId ? updatedOrder : o
      ));
      
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
      // toast({
      //   title: "Erro",
      //   description: "Falha ao mover pedido",
      //   variant: "destructive"
      // });
    }
  }, [orders, lastOrderNumber, speak, apiBaseUrlRef.current]);

  const expedite = useCallback(async (orderNumber: string) => {
    try {
      // Verificar se começa com "-" para retornar para produção
      if (orderNumber.startsWith('-')) {
        const numOnly = orderNumber.slice(1);
        const order = orders.find(o => {
          const orderNum = o.numeroPedido || o.number || '';
          return orderNum === numOnly || orderNum.replace(/[^\d]/g, '') === numOnly;
        });
        
        if (order) {
          const updatedOrder = await updateOrderStatus(order.id, 'production', apiBaseUrlRef.current);
          setOrders(prev => prev.map(o => 
            o.id === order.id ? updatedOrder : o
          ));
          
          // Se era o último pedido, atualizar dados
          if ((order.numeroPedido || order.number) === lastOrderNumber) {
            const remainingReady = orders.filter(o => o.status === 'ready' && o.id !== order.id);
            if (remainingReady.length > 0) {
              const newLastOrder = remainingReady.sort((a, b) => {
                const dateA = new Date(a.updatedAt || a.ultimoConsumo || 0);
                const dateB = new Date(b.updatedAt || b.ultimoConsumo || 0);
                return dateB.getTime() - dateA.getTime();
              })[0];
              const newLastOrderNumber = newLastOrder.numeroPedido || newLastOrder.number || '';
              setLastOrderNumber(newLastOrderNumber);
              setLastOrderData(newLastOrder);
            } else {
              setLastOrderNumber('');
              setLastOrderData(null);
            }
          }
          
        // Adicionar ao log de expedição (no início da lista) - manter últimos 10
        setExpeditionLog(prev => [{
          orderNumber: order.numeroPedido || order.number || '',
          nickname: order.nomeCliente,
          expeditionTime: new Date(),
          createdAt: order.createdAt || order.ultimoConsumo || new Date(),
          isAutoExpedition: false
        }, ...prev].slice(0, 10));
          
          // toast({
          //   title: "Pedido Retornado",
          //   description: `Pedido ${order.numeroPedido || order.number} voltou para produção`
          // });
        }
        return;
      }
      
      // Expedição normal
      const order = orders.find(o => {
        const orderNum = o.numeroPedido || o.number || '';
        return orderNum === orderNumber || orderNum.replace(/[^\d]/g, '') === orderNumber;
      });
      
      if (order) {
        await expediteOrder(order.id, apiBaseUrlRef.current);
        setOrders(prev => prev.filter(o => o.id !== order.id));
        
        // Se foi expedido o último pedido, encontrar novo último pedido
        if (orderNumber === lastOrderNumber) {
          const remainingReady = orders.filter(o => o.status === 'ready' && (o.numeroPedido || o.number) !== orderNumber);
          if (remainingReady.length > 0) {
            const newLastOrder = remainingReady.sort((a, b) => {
              const dateA = new Date(a.updatedAt || a.ultimoConsumo || 0);
              const dateB = new Date(b.updatedAt || b.ultimoConsumo || 0);
              return dateB.getTime() - dateA.getTime();
            })[0];
            const newLastOrderNumber = newLastOrder.numeroPedido || newLastOrder.number || '';
            setLastOrderNumber(newLastOrderNumber);
            setLastOrderData(newLastOrder);
          } else {
            setLastOrderNumber('');
            setLastOrderData(null);
          }
        }
        
        // Adicionar ao log de expedição (no início da lista) - manter últimos 10
        setExpeditionLog(prev => [{
          orderNumber: order.numeroPedido || order.number || '',
          nickname: order.nomeCliente,
          expeditionTime: new Date(),
          createdAt: order.createdAt || order.ultimoConsumo || new Date(),
          isAutoExpedition: false
        }, ...prev].slice(0, 10));
        
        // toast({
        //   title: "Pedido Expedido",
        //   description: `Pedido ${order.numeroPedido || order.number} foi entregue`
        // });
      }
    } catch (error) {
      // toast({
      //   title: "Erro",
      //   description: "Falha ao expedir pedido",
      //   variant: "destructive"
      // });
    }
  }, [orders, lastOrderNumber, apiBaseUrlRef.current]);
  
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
    setLastOrderNumber('');
    setLastOrderData(null);
    setExpeditionLog([]);
    
    // Importar e usar a função de clear do service
    const { clearAllOrdersService } = await import('../services/orderService');
    clearAllOrdersService(apiBaseUrlRef.current, useMockDataRef.current);
    
    // Marcar no localStorage que os pedidos foram zerados
    localStorage.setItem('orders-cleared', 'true');
    
    // toast({
    //   title: "Pedidos Zerados",
    //   description: "Todos os pedidos foram removidos",
    //   variant: "default"
    // });
  }, []);
  
  const generateOrders = useCallback(async (count: number, config?: any) => {
    try {
      console.log(`🎯 Iniciando geração de ${count} pedidos...`);
      
      // Limpar a flag de pedidos zerados quando gerar novos pedidos
      localStorage.removeItem('orders-cleared');
      
      // Verificar módulos ativos
      const activeModules = [];
      if (config?.modules?.balcao?.enabled) activeModules.push('balcao');
      if (config?.modules?.mesa?.enabled) activeModules.push('mesa');
      if (config?.modules?.entrega?.enabled) activeModules.push('entrega');
      if (config?.modules?.ficha?.enabled) activeModules.push('ficha');
      
      // Se nenhum módulo ativo, usar ficha como padrão
      const modulesToUse = activeModules.length > 0 ? activeModules : ['ficha'];
      
      console.log(`📋 Módulos ativos: ${modulesToUse.join(', ')}`);
      
      // Simulação SEMPRE usa mock data (independente da config de API)
      
      // Gerar todos os pedidos sequencialmente
      for (let i = 0; i < count; i++) {
        console.log(`⚙️ Gerando pedido ${i + 1}/${count}...`);
        
        try {
          const newOrder = await addSimulatedOrder(modulesToUse, apiBaseUrlRef.current, true);
          console.log(`🆕 Pedido criado: ${newOrder.numeroPedido} (${newOrder.modulo})`);
        } catch (error) {
          console.error(`❌ Erro ao criar pedido ${i + 1}:`, error);
        }
      }
      
      console.log(`✅ Processo de geração concluído`);
      
      // Aguardar um pouco antes de recarregar para garantir que todos foram salvos
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Recarregar para sincronizar o estado React
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

  // Efeito para carregar os pedidos inicial e periodicamente.
  useEffect(() => {
    // 1. Carrega os pedidos imediatamente ao montar o componente.
    loadOrdersRef.current();

    // 2. Configura um intervalo para atualizações periódicas a cada 10 segundos.
    const intervalId = setInterval(() => {
      console.log('Polling for new orders...');
      // Chama a versão mais recente da função loadOrders através da ref.
      loadOrdersRef.current();
    }, 10000); // 10 segundos

    // 3. Limpa o intervalo quando o componente é desmontado.
    return () => {
      clearInterval(intervalId);
    }
  }, []); // Executa apenas uma vez, na montagem do componente.

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