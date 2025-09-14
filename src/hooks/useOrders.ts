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
  textType?: 'number_only' | 'name_ready' | 'order_ready';
  customText?: string;
}

export const useOrders = (ttsConfig?: TTSConfig) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastOrderNumber, setLastOrderNumber] = useState<string>('');
  const [lastOrderData, setLastOrderData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [expeditionLog, setExpeditionLog] = useState<string[]>([]);
  
  const { speak } = useTextToSpeech();
  const previousLastOrderNumber = useRef<string>('');

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
        if (newLastOrderNumber !== previousLastOrderNumber.current && previousLastOrderNumber.current !== '' && ttsConfig?.enabled) {
          const nickname = lastReadyOrder.nomeCliente;
          const textToSpeak = nickname ? `Pedido ${newLastOrderNumber}, ${nickname}` : `Pedido ${newLastOrderNumber}`;
          speak(textToSpeak, newLastOrderNumber, nickname || '', ttsConfig);
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
  }, [ttsConfig, speak]);

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
      if (ttsConfig?.enabled && newOrderNumber !== previousLastOrderNumber.current) {
        const nickname = updatedOrder.nomeCliente;
        const textToSpeak = nickname ? `Pedido ${newOrderNumber}, ${nickname}` : `Pedido ${newOrderNumber}`;
        speak(textToSpeak, newOrderNumber, nickname || '', ttsConfig);
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
  }, [orders, lastOrderNumber, ttsConfig, speak]);

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
          setExpeditionLog(prev => [...prev.slice(-4), `${order.numeroPedido || order.number} → PRODUÇÃO`]);
          
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
        setExpeditionLog(prev => [...prev.slice(-4), `${order.numeroPedido || order.number} → EXPEDIDO`]);
        
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
    expeditionLog
  };
};