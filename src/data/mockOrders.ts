import { Order } from '../types/order';

const generateRandomOrder = (id: string, status: 'production' | 'ready'): Order => {
  const modules = ['balcao', 'mesa', 'entrega', 'ficha'] as const;
  const nicknames = [
    'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Lucia', 'Rafael', 'Fernanda',
    'Alessandro', 'Cristiane', 'Rodrigo', 'Mariana', 'Fernando', 'Gabriela',
    'Leonardo', 'Stephanie', 'Francisco', 'Alessandra', 'Guilherme', 'Caroline',
    'Marcelo', 'Patricia', 'Eduardo', 'Juliana', 'Alexandre', 'Andressa',
    'Mauricio', 'Daniela', 'Henrique', 'Franciele', 'Leandro', 'Priscila'
  ];
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

  const selectedModule = modules[Math.floor(Math.random() * modules.length)];
  
  // Para pedidos de entrega, 70% devem ter prefixo "IF-" com 5 dígitos
  let orderNumber: string;
  if (selectedModule === 'entrega' && Math.random() < 0.7) {
    // Gerar número com 5 dígitos para iFood
    orderNumber = `IF-${Math.floor(Math.random() * 90000) + 10000}`;
  } else {
    // Número padrão de 3 dígitos
    orderNumber = (Math.floor(Math.random() * 900) + 100).toString();
  }

  const selectedNickname = nicknames[Math.floor(Math.random() * nicknames.length)];

  return {
    id,
    numeroPedido: orderNumber,
    ticket: orderNumber,
    modulo: selectedModule,
    status,
    ultimoConsumo: new Date(Date.now() - Math.random() * 3600000),
    dataContabil: new Date(),
    localEntrega: selectedModule === 'entrega' && orderNumber.startsWith('IF-') 
      ? 'iFood Delivery' 
      : `Local ${Math.floor(Math.random() * 20) + 1}`,
    nomeCliente: selectedNickname,
    // Campos de compatibilidade
    number: orderNumber,
    nickname: selectedNickname,
    createdAt: new Date(Date.now() - Math.random() * 3600000),
    updatedAt: new Date(),
    items: selectedModule === 'entrega' && orderNumber.startsWith('IF-')
      ? ['Combo iFood', 'Taxa de Entrega']
      : Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
          items[Math.floor(Math.random() * items.length)]
        ),
    totalValue: Math.floor(Math.random() * 5000) + 1000 // R$ 10,00 - R$ 60,00
  };
};

// Gerar pedidos específicos do iFood
const generateIfoodOrder = (id: string, status: 'production' | 'ready', orderNumber: string, customerName: string): Order => {
  return {
    id,
    numeroPedido: orderNumber,
    ticket: orderNumber,
    modulo: 'entrega', // iFood é sempre entrega
    status,
    ultimoConsumo: new Date(Date.now() - Math.random() * 1800000), // Últimas 30min
    dataContabil: new Date(),
    localEntrega: 'iFood Delivery',
    nomeCliente: customerName,
    // Campos de compatibilidade
    number: orderNumber,
    nickname: customerName,
    createdAt: new Date(Date.now() - Math.random() * 1800000),
    updatedAt: new Date(),
    items: ['Combo iFood', 'Taxa de Entrega'],
    totalValue: Math.floor(Math.random() * 4000) + 2000 // R$ 20,00 - R$ 60,00
  };
};

export const mockOrders: Order[] = [
  // Pedidos iFood de exemplo
  generateIfoodOrder('ifood-1', 'production', 'IF-12345', 'Marina'),
  generateIfoodOrder('ifood-2', 'production', 'IF-67890', 'Roberto'),
  generateIfoodOrder('ifood-3', 'ready', 'IF-54321', 'Amanda'),
  generateIfoodOrder('ifood-4', 'ready', 'IF-98765', 'Diego'),
  generateIfoodOrder('ifood-5', 'production', 'IF-11223', 'Patricia'),
  
  // Pedidos em produção
  ...Array.from({ length: 10 }, (_, i) => generateRandomOrder(`prod-${i + 1}`, 'production')),
  // Pedidos prontos
  ...Array.from({ length: 4 }, (_, i) => generateRandomOrder(`ready-${i + 1}`, 'ready'))
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