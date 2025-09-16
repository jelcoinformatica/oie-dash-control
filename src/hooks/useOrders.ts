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
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
      
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
        speak(textToSpeak, newLastOrderNumber, nickname || '', ttsConfigRef.current, soundFile, readySoundType, airportTones);
        }
        
        previousLastOrderNumber.current = newLastOrderNumber;
        setLastOrderNumber(newLastOrderNumber);
      } else {
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
  }, [speak]);

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
        speak(textToSpeak, newOrderNumber, nickname || '', ttsConfigRef.current, soundFile, readySoundType, airportTones);
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
  
  // Auto-expedição
  useEffect(() => {
    // Limpar timeout anterior
    if (autoExpeditionTimeoutRef.current) {
      clearTimeout(autoExpeditionTimeoutRef.current);
    }
    
    if (!autoExpeditionConfigRef.current?.enabled || !lastOrderNumber || !lastOrderData) return;
    
    const expediteTime = (autoExpeditionConfigRef.current.minutes || 10) * 60 * 1000;
    
    autoExpeditionTimeoutRef.current = setTimeout(async () => {
      // Buscar o pedido atual novamente para garantir que ainda existe
      const currentOrders = orders.filter(o => o.status === 'ready');
      const currentOrder = currentOrders.find(o => {
        const orderNum = o.numeroPedido || o.number || '';
        return orderNum === lastOrderNumber;
      });
      
      if (currentOrder && currentOrder.status === 'ready') {
        try {
          console.log('Auto-expedindo pedido:', lastOrderNumber);
          await expediteOrder(currentOrder.id);
          
          // Atualizar lista de pedidos
          setOrders(prev => prev.filter(o => o.id !== currentOrder.id));
          
          // Encontrar próximo último pedido
          const remainingReady = orders.filter(o => 
            o.status === 'ready' && 
            o.id !== currentOrder.id
          );
          
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
          
          // Adicionar ao log de expedição como autoexpedição (no início da lista)
          setExpeditionLog(prev => [{
            orderNumber: currentOrder.numeroPedido || currentOrder.number || '',
            nickname: currentOrder.nomeCliente,
            expeditionTime: new Date(),
            isAutoExpedition: true
          }, ...prev.slice(0, 9)]);
          
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
  }, [lastOrderNumber, lastOrderData, autoExpeditionConfigRef.current?.enabled, autoExpeditionConfigRef.current?.minutes]);
  
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

  // Carregar pedidos inicialmente e periodicamente
  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000); // Atualizar a cada 5 segundos
    return () => clearInterval(interval);
  }, [loadOrders]);

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