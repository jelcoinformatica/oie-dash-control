import { Order } from '../types/order';

const generateRandomOrder = (id: string, status: 'production' | 'ready'): Order => {
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

  return {
    id,
    number: (Math.floor(Math.random() * 900) + 100).toString(),
    module: modules[Math.floor(Math.random() * modules.length)],
    status,
    items: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
      items[Math.floor(Math.random() * items.length)]
    ),
    createdAt: new Date(Date.now() - Math.random() * 3600000),
    updatedAt: new Date(),
    nickname: nicknames[Math.floor(Math.random() * nicknames.length)],
    totalValue: Math.floor(Math.random() * 5000) + 1000 // R$ 10,00 - R$ 60,00
  };
};

export const mockOrders: Order[] = [
  // Pedidos em produção
  ...Array.from({ length: 12 }, (_, i) => generateRandomOrder(`prod-${i + 1}`, 'production')),
  // Pedidos prontos
  ...Array.from({ length: 6 }, (_, i) => generateRandomOrder(`ready-${i + 1}`, 'ready'))
];

// Função para buscar pedidos via API (simulação)
export const fetchOrders = async (): Promise<Order[]> => {
  // Simula delay de API
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockOrders;
};

// Função para atualizar status do pedido
export const updateOrderStatus = async (orderId: string, newStatus: 'production' | 'ready' | 'delivered'): Promise<Order> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const orderIndex = mockOrders.findIndex(order => order.id === orderId);
  if (orderIndex === -1) {
    throw new Error('Pedido não encontrado');
  }

  mockOrders[orderIndex] = {
    ...mockOrders[orderIndex],
    status: newStatus,
    updatedAt: new Date()
  };

  return mockOrders[orderIndex];
};

// Função para adicionar pedido simulado
export const addSimulatedOrder = async (): Promise<Order> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const newId = `prod-${mockOrders.length + 1}`;
  const newOrder = generateRandomOrder(newId, 'production');
  mockOrders.unshift(newOrder); // Adiciona no início para aparecer primeiro
  return newOrder;
};

// Função para remover pedido (expedição)
export const expediteOrder = async (orderId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const orderIndex = mockOrders.findIndex(order => order.id === orderId);
  if (orderIndex !== -1) {
    mockOrders.splice(orderIndex, 1);
  }
};