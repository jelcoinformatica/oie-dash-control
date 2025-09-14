import { Order } from '../types/order';
import ordersData from '../data/orders.json';

// Simulação de estado em memória para os dados JSON
let orders: Order[] = ordersData.orders.map(order => ({
  ...order,
  module: order.module as 'balcao' | 'mesa' | 'entrega' | 'ficha',
  status: order.status as 'production' | 'ready' | 'delivered',
  createdAt: new Date(order.createdAt),
  updatedAt: new Date(order.updatedAt)
}));

// Função para buscar pedidos (simula chamada de API)
export const fetchOrders = async (): Promise<Order[]> => {
  // Simula delay de API
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...orders]; // Retorna cópia para evitar mutação
};

// Função para atualizar status do pedido
export const updateOrderStatus = async (orderId: string, newStatus: 'production' | 'ready' | 'delivered'): Promise<Order> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const orderIndex = orders.findIndex(order => order.id === orderId);
  if (orderIndex === -1) {
    throw new Error('Pedido não encontrado');
  }

  orders[orderIndex] = {
    ...orders[orderIndex],
    status: newStatus,
    updatedAt: new Date()
  };

  return { ...orders[orderIndex] };
};

// Função para adicionar pedido simulado
export const addSimulatedOrder = async (): Promise<Order> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const modules = ['balcao', 'mesa', 'entrega', 'ficha'] as const;
  const nicknames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Lucia', 'Rafael', 'Fernanda'];
  const items = [
    'Pizza Margherita',
    'Hamburger Clássico', 
    'Batata Frita',
    'Refrigerante Cola',
    'Suco Natural',
    'Sanduíche Natural',
    'Salada Caesar',
    'Pasta Carbonara'
  ];

  const newOrder: Order = {
    id: `sim-${Date.now()}`,
    number: (Math.floor(Math.random() * 900) + 100).toString(),
    module: modules[Math.floor(Math.random() * modules.length)],
    status: 'production',
    items: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
      items[Math.floor(Math.random() * items.length)]
    ),
    createdAt: new Date(),
    updatedAt: new Date(),
    nickname: nicknames[Math.floor(Math.random() * nicknames.length)],
    totalValue: Math.floor(Math.random() * 5000) + 1000
  };

  orders.unshift(newOrder); // Adiciona no início
  return { ...newOrder };
};

// Função para remover pedido (expedição)
export const expediteOrder = async (orderId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const orderIndex = orders.findIndex(order => order.id === orderId);
  if (orderIndex !== -1) {
    orders.splice(orderIndex, 1);
  }
};

// Para facilitar futura migração para API real, você pode criar uma configuração
export const API_CONFIG = {
  BASE_URL: 'https://api.exemplo.com', // Futura URL da API
  ENDPOINTS: {
    ORDERS: '/orders',
    UPDATE_STATUS: '/orders/{id}/status',
    EXPEDITE: '/orders/{id}/expedite'
  }
};

// Exemplo de como ficaria com API real (comentado para referência futura):
/*
export const fetchOrdersFromAPI = async (): Promise<Order[]> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}`);
  if (!response.ok) {
    throw new Error('Falha ao buscar pedidos');
  }
  const data = await response.json();
  return data.orders.map((order: any) => ({
    ...order,
    createdAt: new Date(order.createdAt),
    updatedAt: new Date(order.updatedAt)
  }));
};
*/