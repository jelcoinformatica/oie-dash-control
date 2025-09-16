import { useState, useCallback, useEffect, useRef } from 'react';
import { Order } from '../types/order';
import { fetchOrders, updateOrderStatus, expediteOrder, addSimulatedOrder } from '../services/orderService';
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

export const useOrders = (ttsConfig?: TTSConfig, autoExpeditionConfig?: AutoExpeditionConfig, config?: any) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastOrderNumber, setLastOrderNumber] = useState<string>('');
  const [lastOrderData, setLastOrderData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [expeditionLog, setExpeditionLog] = useState<Array<{orderNumber: string, nickname?: string, expeditionTime: Date, isAutoExpedition?: boolean}>>([]);
  
  const { speak } = useTextToSpeech();
  const previousLastOrderNumber = useRef<string>('');
  const ttsConfigRef = useRef(ttsConfig);
  const autoExpeditionConfigRef = useRef(autoExpeditionConfig);
  const autoExpeditionTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Atualizar refs quando configs mudarem
  useEffect(() => {
    ttsConfigRef.current = ttsConfig;
    autoExpeditionConfigRef.current = autoExpeditionConfig;
  }, [ttsConfig, autoExpeditionConfig]);

  const loadOrders = useCallback(async () => {
    // Evitar múltiplas chamadas simultâneas
    if (loading) return;
    
    try {
      setLoading(true);
      const data = await fetchOrders();
      
      // Só atualizar se os dados realmente mudaram
      setOrders(prevOrders => {
        const hasChanged = JSON.stringify(prevOrders) !== JSON.stringify(data);
        return hasChanged ? data : prevOrders;
      });
      
      // Encontrar o último pedido 'ready' - busca mais robusta
      const readyOrders = data.filter(order => order.status === 'ready');
      if (readyOrders.length > 0) {
        // Ordenar por data de atualização mais recente
        const sortedReadyOrders = readyOrders.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.ultimoConsumo || 0);
          const dateB = new Date(b.updatedAt || b.ultimoConsumo || 0);
          return dateB.getTime() - dateA.getTime();
        });
        
        const lastReadyOrder = sortedReadyOrders[0];
        const newLastOrderNumber = lastReadyOrder.numeroPedido || lastReadyOrder.number || '';
        
        // Só atualizar se realmente mudou
        if (newLastOrderNumber !== lastOrderNumber) {
          // Armazenar dados completos do último pedido
          setLastOrderData(lastReadyOrder);
          
          // Verificar se é um novo pedido e falar se TTS habilitado
          if (newLastOrderNumber !== previousLastOrderNumber.current && previousLastOrderNumber.current !== '' && ttsConfigRef.current?.enabled) {
            const nickname = lastReadyOrder.nomeCliente;
            const textToSpeak = nickname ? `Pedido ${newLastOrderNumber}, ${nickname}` : `Pedido ${newLastOrderNumber}`;
            const soundFile = config?.sounds?.ready && config?.sounds?.readyFile 
              ? config.sounds.readyFile 
              : undefined;
            const readySoundType = config?.sounds?.readySoundType || 'padrao';
            const airportTones = config?.sounds?.airportTones || 2;
            const deliveryPlatform = lastReadyOrder.localEntrega || '';
            speak(textToSpeak, newLastOrderNumber, nickname || '', ttsConfigRef.current, soundFile, readySoundType, airportTones, deliveryPlatform);
          }
          
          previousLastOrderNumber.current = newLastOrderNumber;
          setLastOrderNumber(newLastOrderNumber);
        }
      } else if (lastOrderNumber) {
        // Só limpar se havia um último pedido
        setLastOrderNumber('');
        setLastOrderData(null);
        previousLastOrderNumber.current = '';
      }
    } catch (error) {
      // toast({
      //   title: "Erro",
      //   description: "Falha ao carregar pedidos",
      //   variant: "destructive"
      // });
    } finally {
      setLoading(false);
    }
  }, [speak, loading, lastOrderNumber]);

  const moveToReady = useCallback(async (orderId: string) => {
    try {
      const updatedOrder = await updateOrderStatus(orderId, 'ready');
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
  }, [orders, lastOrderNumber, speak]);

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
          const updatedOrder = await updateOrderStatus(order.id, 'production');
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
          
        // Adicionar ao log de expedição (no início da lista)
        setExpeditionLog(prev => [{
          orderNumber: order.numeroPedido || order.number || '',
          nickname: order.nomeCliente,
          expeditionTime: new Date(),
          isAutoExpedition: false
        }, ...prev.slice(0, 9)]);
          
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
        await expediteOrder(order.id);
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
        
        // Adicionar ao log de expedição (no início da lista)
        setExpeditionLog(prev => [{
          orderNumber: order.numeroPedido || order.number || '',
          nickname: order.nomeCliente,
          expeditionTime: new Date(),
          isAutoExpedition: false
        }, ...prev.slice(0, 9)]);
        
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
  }, [orders, lastOrderNumber]);
  
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
    clearAllOrdersService();
    
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
      // Limpar a flag de pedidos zerados quando gerar novos pedidos
      localStorage.removeItem('orders-cleared');
      
      const newOrders: Order[] = [];
      
      // Verificar módulos ativos
      const activeModules = [];
      if (config?.modules?.balcao?.enabled) activeModules.push('balcao');
      if (config?.modules?.mesa?.enabled) activeModules.push('mesa');
      if (config?.modules?.entrega?.enabled) activeModules.push('entrega');
      if (config?.modules?.ficha?.enabled) activeModules.push('ficha');
      
      // Se nenhum módulo ativo, usar ficha como padrão
      const modulesToUse = activeModules.length > 0 ? activeModules : ['ficha'];
      
      for (let i = 0; i < count; i++) {
        // 60% dos pedidos de entrega serão de delivery online se entrega estiver ativa
        const isEntregaActive = modulesToUse.includes('entrega');
        const isDeliveryOnline = isEntregaActive && Math.random() < 0.6;
        
        if (isDeliveryOnline) {
          // Gerar pedido de delivery online com diferentes siglas
          const deliveryTypes = ['IF', 'DD', 'RA', 'UB']; // iFood, Delivery Direto, Rappi, Uber
          const randomType = deliveryTypes[Math.floor(Math.random() * deliveryTypes.length)];
          const deliveryNumber = `${randomType}-${Math.floor(Math.random() * 90000) + 10000}`;
          
          const deliveryOrder = await addSimulatedOrder(['entrega']);
          deliveryOrder.numeroPedido = deliveryNumber;
          deliveryOrder.number = deliveryNumber;
          deliveryOrder.modulo = 'entrega' as 'balcao' | 'mesa' | 'entrega' | 'ficha';
          newOrders.push(deliveryOrder);
        } else {
          const newOrder = await addSimulatedOrder(modulesToUse);
          newOrders.push(newOrder);
        }
      }
      
      await loadOrders(); // Recarregar para sincronizar
      // toast({
      //   title: "Pedidos Gerados",
      //   description: `${count} novos pedidos foram criados respeitando os módulos ativos`,
      //   variant: "default"
      // });
    } catch (error) {
      // toast({
      //   title: "Erro",
      //   description: "Falha ao gerar pedidos",
      //   variant: "destructive"
      // });
    }
  }, [loadOrders]);

  const startSimulation = useCallback(() => {
    setIsSimulationActive(true);
  }, []);

  const stopSimulation = useCallback(() => {
    setIsSimulationActive(false);
  }, []);

  // Carregar pedidos inicialmente e periodicamente com otimização
  useEffect(() => {
    loadOrders();
    
    // Polling mais inteligente - apenas se necessário
    const interval = setInterval(() => {
      // Só fazer polling se não estiver em uma operação ativa
      if (!loading) {
        loadOrders();
      }
    }, 10000); // Reduzir frequência para 10 segundos
    
    return () => clearInterval(interval);
  }, []); // Remover loadOrders das dependências para evitar re-criação do interval

  // Separar a lógica de loadOrders para não recriar o interval constantemente
  useEffect(() => {
    if (orders.length === 0 && !loading) {
      loadOrders();
    }
  }, [loadOrders, orders.length, loading]);

  // Filtrar pedidos por status, excluindo o último pedido dos prontos apenas se for destacado
  const productionOrders = orders.filter(order => order.status === 'production');
  const readyOrders = orders.filter(order => {
    if (order.status !== 'ready') return false;
    
    // Se highlight está ativado, excluir o último pedido (será exibido no container especial)
    // Se highlight está desativado, incluir o último pedido na lista normal
    const isLastOrder = (order.numeroPedido || order.number) === lastOrderNumber;
    const shouldHighlight = config?.lastOrder?.highlight ?? true;
    
    return shouldHighlight ? !isLastOrder : true;
  });

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