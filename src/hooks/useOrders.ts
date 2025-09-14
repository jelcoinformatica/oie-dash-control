import { useState, useCallback, useEffect, useRef } from 'react';
import { Order } from '../types/order';
import { fetchOrders, updateOrderStatus, expediteOrder, addSimulatedOrder } from '../services/orderService';
import { useTextToSpeech } from './useTextToSpeech';
import { toast } from './use-toast';

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

export const useOrders = (ttsConfig?: TTSConfig, autoExpeditionConfig?: AutoExpeditionConfig) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastOrderNumber, setLastOrderNumber] = useState<string>('');
  const [lastOrderData, setLastOrderData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [expeditionLog, setExpeditionLog] = useState<string[]>([]);
  
  const { speak } = useTextToSpeech();
  const previousLastOrderNumber = useRef<string>('');
  const ttsConfigRef = useRef(ttsConfig);
  const autoExpeditionConfigRef = useRef(autoExpeditionConfig);
  
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
          speak(textToSpeak, newLastOrderNumber, nickname || '', ttsConfigRef.current);
        }
        
        previousLastOrderNumber.current = newLastOrderNumber;
        setLastOrderNumber(newLastOrderNumber);
      } else {
        setLastOrderNumber('');
        setLastOrderData(null);
        previousLastOrderNumber.current = '';
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar pedidos",
        variant: "destructive"
      });
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
        speak(textToSpeak, newOrderNumber, nickname || '', ttsConfigRef.current);
      }
      
      previousLastOrderNumber.current = newOrderNumber;
      setLastOrderNumber(newOrderNumber);
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao mover pedido",
        variant: "destructive"
      });
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
          
        // Adicionar ao log de expedição
        setExpeditionLog(prev => [...prev.slice(-4), `${order.numeroPedido || order.number}`]);
          
          toast({
            title: "Pedido Retornado",
            description: `Pedido ${order.numeroPedido || order.number} voltou para produção`
          });
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
        
        // Adicionar ao log de expedição
        setExpeditionLog(prev => [...prev.slice(-4), `${order.numeroPedido || order.number}`]);
        
        toast({
          title: "Pedido Expedido",
          description: `Pedido ${order.numeroPedido || order.number} foi entregue`
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao expedir pedido",
        variant: "destructive"
      });
    }
  }, [orders, lastOrderNumber]);
  
  // Auto-expedição
  useEffect(() => {
    if (!autoExpeditionConfigRef.current?.enabled || !lastOrderData) return;
    
    const autoExpediteTimeout = setTimeout(() => {
      if (lastOrderNumber && lastOrderData) {
        expedite(lastOrderNumber);
        toast({
          title: "Auto Expedição",
          description: `Pedido ${lastOrderNumber} foi automaticamente expedido`,
          variant: "default"
        });
      }
    }, (autoExpeditionConfigRef.current.minutes || 10) * 60 * 1000);
    
    return () => clearTimeout(autoExpediteTimeout);
  }, [lastOrderData, expedite]);
  
  // Funções para simulação
  const clearAllOrders = useCallback(async () => {
    setOrders([]);
    setLastOrderNumber('');
    setLastOrderData(null);
    setExpeditionLog([]);
    toast({
      title: "Pedidos Zerados",
      description: "Todos os pedidos foram removidos",
      variant: "default"
    });
  }, []);
  
  const generateOrders = useCallback(async (count: number, config?: any) => {
    try {
      const newOrders: Order[] = [];
      
      // Verificar módulos ativos
      const activeModules = [];
      if (config?.modules) {
        if (config.modules.balcao) activeModules.push('balcao');
        if (config.modules.mesa) activeModules.push('mesa');
        if (config.modules.entrega) activeModules.push('entrega');
        if (config.modules.ficha) activeModules.push('ficha');
      }
      
      // Se nenhum módulo ativo, usar todos
      const modulesToUse = activeModules.length > 0 ? activeModules : ['balcao', 'mesa', 'entrega', 'ficha'];
      
      for (let i = 0; i < count; i++) {
        // 30% dos pedidos de entrega serão iFood (IF-XXXXX) se entrega estiver ativa
        const isEntregaActive = modulesToUse.includes('entrega');
        const isIfoodOrder = isEntregaActive && Math.random() < 0.3;
        
        if (isIfoodOrder) {
          // Gerar pedido iFood simulado
          const ifoodNumber = `IF-${Math.floor(Math.random() * 90000) + 10000}`;
          const ifoodOrder = await addSimulatedOrder();
          ifoodOrder.numeroPedido = ifoodNumber;
          ifoodOrder.number = ifoodNumber;
          ifoodOrder.modulo = 'entrega' as 'balcao' | 'mesa' | 'entrega' | 'ficha';
          newOrders.push(ifoodOrder);
        } else {
          const newOrder = await addSimulatedOrder();
          // Definir módulo baseado nos módulos ativos
          newOrder.modulo = modulesToUse[Math.floor(Math.random() * modulesToUse.length)] as 'balcao' | 'mesa' | 'entrega' | 'ficha';
          newOrders.push(newOrder);
        }
      }
      
      await loadOrders(); // Recarregar para sincronizar
      toast({
        title: "Pedidos Gerados",
        description: `${count} novos pedidos foram criados`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao gerar pedidos",
        variant: "destructive"
      });
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

  // Filtrar pedidos por status, excluindo o último pedido dos prontos se for destacado
  const productionOrders = orders.filter(order => order.status === 'production');
  const readyOrders = orders.filter(order => 
    order.status === 'ready' && 
    (order.numeroPedido || order.number) !== lastOrderNumber
  );

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