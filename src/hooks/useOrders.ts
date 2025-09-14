import { useState, useEffect, useCallback } from 'react';
import { Order } from '../types/order';
import { fetchOrders, updateOrderStatus, expediteOrder, addSimulatedOrder } from '../services/orderService';
import { toast } from './use-toast';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastOrderNumber, setLastOrderNumber] = useState<string>('');
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [simulationIntervalId, setSimulationIntervalId] = useState<NodeJS.Timeout | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
      
      // Encontra o último pedido pronto
      const readyOrders = data.filter(order => order.status === 'ready');
      if (readyOrders.length > 0) {
        const latest = readyOrders.reduce((latest, current) => 
          (current.ultimoConsumo || current.updatedAt) > (latest.ultimoConsumo || latest.updatedAt) ? current : latest
        );
        setLastOrderNumber(latest.numeroPedido || latest.number);
      } else {
        setLastOrderNumber('');
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
  }, []);

  const moveToReady = useCallback(async (orderId: string) => {
    try {
      // Encontrar o pedido atual
      const currentOrder = orders.find(o => o.id === orderId);
      if (!currentOrder) return;

      // Se já há um último pedido, mover para ready orders
      if (lastOrderNumber) {
        const currentLastOrder = orders.find(o => 
          (o.numeroPedido || o.number) === lastOrderNumber
        );
        if (currentLastOrder) {
          const movedToReady = await updateOrderStatus(currentLastOrder.id, 'ready');
          setOrders(prev => prev.map(order => 
            order.id === currentLastOrder.id ? movedToReady : order
          ));
        }
      }

      // Mover o pedido clicado para ready e definir como último pedido
      const updatedOrder = await updateOrderStatus(orderId, 'ready');
      setOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      setLastOrderNumber(updatedOrder.numeroPedido || updatedOrder.number);
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao mover pedido",
        variant: "destructive"
      });
    }
  }, [orders, lastOrderNumber]);

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
          
          // Se era o último pedido, atualizar
          if ((order.numeroPedido || order.number) === lastOrderNumber) {
            const remainingReady = orders.filter(o => o.status === 'ready' && o.id !== order.id);
            if (remainingReady.length > 0) {
              const latest = remainingReady.reduce((latest, current) => 
                (current.ultimoConsumo || current.updatedAt) > (latest.ultimoConsumo || latest.updatedAt) ? current : latest
              );
              setLastOrderNumber(latest.numeroPedido || latest.number);
            } else {
              setLastOrderNumber('');
            }
          }
        }
        return;
      }

      // Lógica normal de expedição
      let order = orders.find(o => (o.numeroPedido || o.number) === orderNumber);
      
      // Se não encontrou, tentar buscar apenas pelos números (para pedidos como IF-1234)
      if (!order) {
        order = orders.find(o => {
          const orderNum = o.numeroPedido || o.number || '';
          return orderNum.replace(/[^\d]/g, '') === orderNumber;
        });
      }

      if (!order) {
        toast({
          title: "Erro",
          description: "Pedido não encontrado",
          variant: "destructive"
        });
        return;
      }

      await expediteOrder(order.id);
      setOrders(prev => prev.filter(o => o.id !== order.id));
      
      // Se foi o último pedido expedido, mover o primeiro da coluna ready para último pedido
      if ((order.numeroPedido || order.number) === lastOrderNumber) {
        const remainingReady = orders.filter(o => o.status === 'ready' && o.id !== order.id);
        if (remainingReady.length > 0) {
          const latest = remainingReady.reduce((latest, current) => 
            (current.ultimoConsumo || current.updatedAt) > (latest.ultimoConsumo || latest.updatedAt) ? current : latest
          );
          setLastOrderNumber(latest.numeroPedido || latest.number);
        } else {
          setLastOrderNumber('');
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao processar pedido",
        variant: "destructive"
      });
    }
  }, [orders, lastOrderNumber]);

  const startSimulation = useCallback(() => {
    if (simulationIntervalId) return; // Already active

    setIsSimulationActive(true);
    toast({
      title: "Simulação Iniciada",
      description: "Novos pedidos serão gerados automaticamente",
    });

    const interval = setInterval(async () => {
      try {
        await addSimulatedOrder();
        loadOrders(); // Recarrega os pedidos para exibir o novo
      } catch (error) {
        toast({
          title: "Erro na Simulação",
          description: "Falha ao gerar pedido simulado",
          variant: "destructive"
        });
      }
    }, 5000); // Gera um novo pedido a cada 5 segundos

    setSimulationIntervalId(interval);
  }, [loadOrders, simulationIntervalId]);

  const stopSimulation = useCallback(() => {
    if (simulationIntervalId) {
      clearInterval(simulationIntervalId);
      setSimulationIntervalId(null);
      setIsSimulationActive(false);
      toast({
        title: "Simulação Parada",
        description: "A geração automática de pedidos foi interrompida",
      });
    }
  }, [simulationIntervalId]);

  useEffect(() => {
    loadOrders();
    
    // Simula atualização em tempo real
    const interval = setInterval(loadOrders, 30000); // 30 segundos
    
    return () => {
      clearInterval(interval);
      if (simulationIntervalId) {
        clearInterval(simulationIntervalId);
      }
    };
  }, [loadOrders, simulationIntervalId]);

  const productionOrders = orders.filter(order => order.status === 'production');
  const readyOrders = orders.filter(order => order.status === 'ready');

  return {
    orders,
    productionOrders,
    readyOrders,
    lastOrderNumber,
    loading,
    moveToReady,
    expedite,
    refresh: loadOrders,
    startSimulation,
    stopSimulation,
    isSimulationActive
  };
};