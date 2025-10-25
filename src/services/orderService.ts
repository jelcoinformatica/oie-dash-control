import { Order } from '../types/order';
import ordersData from '../data/orders.json';
import { apiConfig } from '../config/api.config';

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
export const fetchOrders = async (apiBaseUrl: string, useMockData: boolean): Promise<Order[]> => {
  if (useMockData) {
    return [...orders];
  }

  try {
    const url = `${apiBaseUrl}/lista_producao`;
    console.log('Fazendo requisição para:', url);

    const response = await fetch(url);
    console.log('Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na resposta:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Dados brutos da API:', data);

    // Verificar se data é um array
    if (!Array.isArray(data)) {
      console.error('Resposta da API não é um array:', data);
      return [];
    }

    // Mapear os dados da API para o formato correto
    return data.map(item => ({
      id: item.id?.toString() || '',
      numeroPedido: item.numeroPedido || '',
      ticket: item.ticket || '',
      modulo: determineModulo(item.modulo),
      // Correção aqui: verifica o status corretamente
      status: item.status === 'N' ? 'production' : 'ready',
      ultimoConsumo: new Date(item.ultimoConsumo || Date.now()),
      dataContabil: new Date(item.dataContabil || Date.now()),
      localEntrega: item.localEntrega || '',
      nomeCliente: item.nomeCliente || '',
      // Campos de compatibilidade
      number: item.numeroPedido || '',
      nickname: item.nomeCliente || '',
      createdAt: new Date(item.ultimoConsumo || Date.now()),
      updatedAt: new Date(item.ultimoConsumo || Date.now()),
      items: item.items || [`Local: ${item.localEntrega || ''}`],
      totalValue: item.totalValue || 0
    }));

  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return [];
  }
};

// Função auxiliar para determinar o módulo
const determineModulo = (modulo: any): 'balcao' | 'mesa' | 'entrega' | 'ficha' => {
  if (typeof modulo === 'number') {
    switch (modulo) {
      case 1: return 'balcao';
      case 2: return 'mesa';
      case 3: return 'entrega';
      case 4: return 'ficha';
      default: return 'balcao';
    }
  }
  return modulo || 'balcao';
};

// Função para atualizar status do pedido
export const updateOrderStatus = async (orderId: string, newStatus: 'production' | 'ready' | 'delivered', apiBaseUrl: string): Promise<Order> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  try {
    const response = await fetch(`${apiBaseUrl}/atualiza_status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: orderId, status: newStatus }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const updatedOrder = await response.json();
    return {
      ...updatedOrder,
      id: updatedOrder.id.toString(),
      modulo: updatedOrder.modulo as 'balcao' | 'mesa' | 'entrega' | 'ficha',
      status: updatedOrder.status as 'production' | 'ready' | 'delivered',
      ultimoConsumo: new Date(updatedOrder.ultimoConsumo),
      dataContabil: new Date(updatedOrder.dataContabil),
      number: updatedOrder.numeroPedido,
      nickname: updatedOrder.nomeCliente,
      createdAt: new Date(updatedOrder.ultimoConsumo),
      updatedAt: new Date(updatedOrder.ultimoConsumo),
      items: updatedOrder.items || [],
      totalValue: updatedOrder.totalValue || 0
    };
  } catch (error) {
    console.error("Error updating order status via API:", error);
    throw error;
  }
};

// Função para adicionar pedido simulado
export const addSimulatedOrder = async (allowedModules: string[] | undefined, apiBaseUrl: string, useMockData: boolean): Promise<Order> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  if (useMockData) {
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
  } else {
    try {
      const response = await fetch(`${apiBaseUrl}/gera_pedido`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modules: allowedModules }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newOrder = await response.json();
      return {
        ...newOrder,
        id: newOrder.id.toString(),
        modulo: newOrder.modulo as 'balcao' | 'mesa' | 'entrega' | 'ficha',
        status: newOrder.status as 'production' | 'ready' | 'delivered',
        ultimoConsumo: new Date(newOrder.ultimoConsumo),
        dataContabil: new Date(newOrder.dataContabil),
        number: newOrder.numeroPedido,
        nickname: newOrder.nomeCliente,
        createdAt: new Date(newOrder.ultimoConsumo),
        updatedAt: new Date(newOrder.ultimoConsumo),
        items: newOrder.items || [],
        totalValue: newOrder.totalValue || 0
      };
    } catch (error) {
      console.error("Error adding simulated order via API:", error);
      throw error;
    }
  }
};

// Função para remover pedido (expedição)
export const expediteOrder = async (orderId: string, apiBaseUrl: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  try {
    const response = await fetch(`${apiBaseUrl}/expede_pedido`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: orderId }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // No content expected for successful expedite
  } catch (error) {
    console.error("Error expediting order via API:", error);
    throw error;
  }
};

// Função para limpar todos os pedidos no service
export const clearAllOrdersService = async (apiBaseUrl: string, useMockData: boolean): Promise<void> => {
  if (useMockData) {
    orders = [];
  } else {
    try {
      const response = await fetch(`${apiBaseUrl}/limpa_pedidos`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error clearing orders via API:", error);
      throw error;
    }
  }
};

// Função para buscar pedidos em produção
export const fetchProductionOrders = async (apiBaseUrl: string, useMockData: boolean): Promise<Order[]> => {
  if (useMockData) {
    return [...orders].filter(order => order.status === 'production');
  }

  try {
    const url = `${apiBaseUrl}${apiConfig.endpoints.PRODUCAO}`;
    console.log('Buscando pedidos em produção:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Dados de produção:', data);

    if (!Array.isArray(data)) {
      console.error('Resposta da API de produção não é um array:', data);
      return [];
    }

    return data.map(item => ({
      id: item.id?.toString() || '',
      numeroPedido: item.numeroPedido || '',
      ticket: item.ticket || '',
      modulo: determineModulo(item.modulo),
      status: 'production', // Força o status como production
      ultimoConsumo: new Date(item.ultimoConsumo || Date.now()),
      dataContabil: new Date(item.dataContabil || Date.now()),
      localEntrega: item.localEntrega || '',
      nomeCliente: item.nomeCliente || '',
      number: item.numeroPedido || '',
      nickname: item.nomeCliente || '',
      createdAt: new Date(item.ultimoConsumo || Date.now()),
      updatedAt: new Date(item.ultimoConsumo || Date.now()),
      items: item.items || [`Local: ${item.localEntrega || ''}`],
      totalValue: item.totalValue || 0
    }));
  } catch (error) {
    console.error('Erro ao buscar pedidos em produção:', error);
    return [];
  }
};

// Função para buscar pedidos prontos
export const fetchReadyOrders = async (apiBaseUrl: string, useMockData: boolean): Promise<Order[]> => {
  if (useMockData) {
    return [...orders].filter(order => order.status === 'ready');
  }

  try {
    const url = `${apiBaseUrl}${apiConfig.endpoints.PRONTOS}`;
    console.log('Buscando pedidos prontos:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Dados prontos:', data);

    if (!Array.isArray(data)) {
      console.error('Resposta da API de prontos não é um array:', data);
      return [];
    }

    return data.map(item => ({
      id: item.id?.toString() || '',
      numeroPedido: item.numeroPedido || '',
      ticket: item.ticket || '',
      modulo: determineModulo(item.modulo),
      status: 'ready', // Força o status como ready
      ultimoConsumo: new Date(item.ultimoConsumo || Date.now()),
      dataContabil: new Date(item.dataContabil || Date.now()),
      localEntrega: item.localEntrega || '',
      nomeCliente: item.nomeCliente || '',
      number: item.numeroPedido || '',
      nickname: item.nomeCliente || '',
      createdAt: new Date(item.ultimoConsumo || Date.now()),
      updatedAt: new Date(item.ultimoConsumo || Date.now()),
      items: item.items || [`Local: ${item.localEntrega || ''}`],
      totalValue: item.totalValue || 0
    }));
  } catch (error) {
    console.error('Erro ao buscar pedidos prontos:', error);
    return [];
  }
};