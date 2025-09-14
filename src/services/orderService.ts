import { Order } from '../types/order';
import ordersData from '../data/orders.json';

// Simulação de estado em memória para os dados JSON
let orders: Order[] = ordersData.orders.map(order => ({
  ...order,
  modulo: order.modulo as 'balcao' | 'mesa' | 'entrega' | 'ficha',
  status: order.status as 'production' | 'ready' | 'delivered',
  ultimoConsumo: new Date(order.ultimoConsumo),
  dataContabil: new Date(order.dataContabil),
  // Campos de compatibilidade para não quebrar componentes existentes
  number: order.numeroPedido,
  nickname: order.nomeCliente,
  createdAt: new Date(order.ultimoConsumo),
  updatedAt: new Date(order.ultimoConsumo),
  items: [`Local: ${order.localEntrega}`],
  totalValue: 0
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
    numeroPedido: (Math.floor(Math.random() * 900) + 100).toString(),
    ticket: (Math.floor(Math.random() * 900) + 100).toString(),
    modulo: modules[Math.floor(Math.random() * modules.length)],
    status: 'production',
    ultimoConsumo: new Date(),
    dataContabil: new Date(),
    localEntrega: `Local ${Math.floor(Math.random() * 20) + 1}`,
    nomeCliente: nicknames[Math.floor(Math.random() * nicknames.length)],
    // Campos de compatibilidade
    number: (Math.floor(Math.random() * 900) + 100).toString(),
    nickname: nicknames[Math.floor(Math.random() * nicknames.length)],
    createdAt: new Date(),
    updatedAt: new Date(),
    items: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
      items[Math.floor(Math.random() * items.length)]
    ),
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