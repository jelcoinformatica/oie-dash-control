import { Order } from '../types/order';
import ordersData from '../data/orders.json';

// Simulação de estado em memória para os dados JSON
let orders: Order[] = [];

// Função para inicializar com dados do JSON (chamada apenas quando necessário)
export const initializeWithDefaultOrders = (): void => {
  orders = ordersData.orders.map(order => ({
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
};

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
export const addSimulatedOrder = async (allowedModules?: string[]): Promise<Order> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const defaultModules = ['balcao', 'mesa', 'entrega', 'ficha'] as const;
  const modules = allowedModules && allowedModules.length > 0 
    ? allowedModules 
    : defaultModules;
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

  const selectedModule = modules[Math.floor(Math.random() * modules.length)] as 'balcao' | 'mesa' | 'entrega' | 'ficha';
  
  // Função para obter o nome da plataforma de delivery
  const getDeliveryPlatformName = (orderNumber: string): string => {
    if (orderNumber.startsWith('IF-')) return 'iFood Delivery';
    if (orderNumber.startsWith('DD-')) return 'Delivery Direto';
    if (orderNumber.startsWith('RA-')) return 'Rappi Delivery';
    if (orderNumber.startsWith('UB-')) return 'Uber Eats';
    return 'Delivery Online';
  };

  // Função para obter itens específicos da plataforma
  const getDeliveryPlatformItems = (orderNumber: string): string => {
    if (orderNumber.startsWith('IF-')) return 'Combo iFood';
    if (orderNumber.startsWith('DD-')) return 'Combo Delivery Direto';
    if (orderNumber.startsWith('RA-')) return 'Combo Rappi';
    if (orderNumber.startsWith('UB-')) return 'Combo Uber Eats';
    return 'Combo Delivery';
  };
  
  // Para pedidos de entrega, 70% devem ter prefixo de delivery online
  let orderNumber: string;
  if (selectedModule === 'entrega' && Math.random() < 0.7) {
    // Gerar número com 5 dígitos para delivery online
    const deliveryTypes = ['IF', 'DD', 'RA', 'UB']; // iFood, Delivery Direto, Rappi, Uber
    const randomType = deliveryTypes[Math.floor(Math.random() * deliveryTypes.length)];
    orderNumber = `${randomType}-${Math.floor(Math.random() * 90000) + 10000}`;
  } else {
    // Número padrão de 3 dígitos
    orderNumber = (Math.floor(Math.random() * 900) + 100).toString();
  }

  const selectedNickname = nicknames[Math.floor(Math.random() * nicknames.length)];

  const newOrder: Order = {
    id: `sim-${Date.now()}`,
    numeroPedido: orderNumber,
    ticket: orderNumber,
    modulo: selectedModule,
    status: 'production',
    ultimoConsumo: new Date(),
    dataContabil: new Date(),
    localEntrega: selectedModule === 'entrega' && (orderNumber.startsWith('IF-') || orderNumber.startsWith('DD-') || orderNumber.startsWith('RA-') || orderNumber.startsWith('UB-'))
      ? getDeliveryPlatformName(orderNumber)
      : `Local ${Math.floor(Math.random() * 20) + 1}`,
    nomeCliente: selectedNickname,
    // Campos de compatibilidade
    number: orderNumber,
    nickname: selectedNickname,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: selectedModule === 'entrega' && (orderNumber.startsWith('IF-') || orderNumber.startsWith('DD-') || orderNumber.startsWith('RA-') || orderNumber.startsWith('UB-'))
      ? [getDeliveryPlatformItems(orderNumber), 'Taxa de Entrega']
      : Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
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

// Função para limpar todos os pedidos no service
export const clearAllOrdersService = (): void => {
  orders = [];
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