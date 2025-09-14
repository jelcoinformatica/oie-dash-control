import { useState, useEffect, useCallback } from 'react';
import { Order } from '../types/order';
import { fetchOrders, updateOrderStatus, expediteOrder, addSimulatedOrder } from '../data/mockOrders';
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
          current.updatedAt > latest.updatedAt ? current : latest
        );
        setLastOrderNumber(latest.number);
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
      const updatedOrder = await updateOrderStatus(orderId, 'ready');
      setOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      setLastOrderNumber(updatedOrder.number);
      
      toast({
        title: "Pedido Pronto",
        description: `Pedido #${updatedOrder.number} movido para prontos`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao mover pedido",
        variant: "destructive"
      });
    }
  }, []);

  const expedite = useCallback(async (orderNumber: string) => {
    try {
      const order = orders.find(o => o.number === orderNumber);
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
      
      toast({
        title: "Pedido Expedido",
        description: `Pedido #${orderNumber} foi expedido`
      });

      // Atualiza último pedido se necessário
      const remainingReady = orders.filter(o => o.status === 'ready' && o.id !== order.id);
      if (remainingReady.length > 0) {
        const latest = remainingReady.reduce((latest, current) => 
          current.updatedAt > latest.updatedAt ? current : latest
        );
        setLastOrderNumber(latest.number);
      } else {
        setLastOrderNumber('');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao expedir pedido",
        variant: "destructive"
      });
    }
  }, [orders]);

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