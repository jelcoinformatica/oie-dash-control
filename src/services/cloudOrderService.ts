import { supabase } from '@/integrations/supabase/client';
import { Order } from '../types/order';

// Converter Order do app para formato do banco
const toDbOrder = (order: Order, panelId: number = 1) => ({
  id: order.id,
  numero_pedido: order.numeroPedido || order.number || '',
  ticket: order.ticket || '',
  modulo: order.modulo,
  status: order.status,
  ultimo_consumo: order.ultimoConsumo?.toISOString() || new Date().toISOString(),
  data_contabil: order.dataContabil?.toISOString() || new Date().toISOString(),
  local_entrega: order.localEntrega || '',
  nome_cliente: order.nomeCliente || order.nickname || '',
  items: order.items || [],
  total_value: order.totalValue || 0,
  panel_id: panelId,
});

// Converter formato do banco para Order do app
const fromDbOrder = (row: any): Order => ({
  id: row.id,
  numeroPedido: row.numero_pedido,
  ticket: row.ticket,
  modulo: row.modulo as 'balcao' | 'mesa' | 'entrega' | 'ficha',
  status: row.status as 'production' | 'ready' | 'delivered',
  ultimoConsumo: new Date(row.ultimo_consumo),
  dataContabil: new Date(row.data_contabil),
  localEntrega: row.local_entrega,
  nomeCliente: row.nome_cliente,
  number: row.numero_pedido,
  nickname: row.nome_cliente,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  items: row.items || [],
  totalValue: row.total_value || 0,
});

// Inserir pedido no Cloud
export const cloudInsertOrder = async (order: Order, panelId?: number): Promise<void> => {
  const { error } = await supabase.from('orders').upsert(toDbOrder(order, panelId));
  if (error) console.error('Erro ao inserir pedido no Cloud:', error);
};

// Inserir múltiplos pedidos
export const cloudInsertOrders = async (orders: Order[], panelId?: number): Promise<void> => {
  const rows = orders.map(o => toDbOrder(o, panelId));
  const { error } = await supabase.from('orders').upsert(rows);
  if (error) console.error('Erro ao inserir pedidos no Cloud:', error);
};

// Atualizar status de um pedido
export const cloudUpdateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) console.error('Erro ao atualizar status no Cloud:', error);
};

// Remover pedido (expedição)
export const cloudDeleteOrder = async (orderId: string): Promise<void> => {
  const { error } = await supabase.from('orders').delete().eq('id', orderId);
  if (error) console.error('Erro ao deletar pedido no Cloud:', error);
};

// Limpar todos os pedidos
export const cloudClearAllOrders = async (panelId?: number): Promise<void> => {
  let query = supabase.from('orders').delete();
  if (panelId) {
    query = query.eq('panel_id', panelId);
  } else {
    // Delete all - need a condition, use gte on created_at
    query = query.gte('created_at', '1970-01-01');
  }
  const { error } = await query;
  if (error) console.error('Erro ao limpar pedidos no Cloud:', error);
};

// Buscar pedidos em produção
export const cloudFetchProductionOrders = async (panelId?: number): Promise<Order[]> => {
  let query = supabase.from('orders').select('*').eq('status', 'production').order('created_at', { ascending: false });
  if (panelId) query = query.eq('panel_id', panelId);
  const { data, error } = await query;
  if (error) { console.error('Erro ao buscar produção no Cloud:', error); return []; }
  return (data || []).map(fromDbOrder);
};

// Buscar pedidos prontos
export const cloudFetchReadyOrders = async (panelId?: number): Promise<Order[]> => {
  let query = supabase.from('orders').select('*').eq('status', 'ready').order('created_at', { ascending: false });
  if (panelId) query = query.eq('panel_id', panelId);
  const { data, error } = await query;
  if (error) { console.error('Erro ao buscar prontos no Cloud:', error); return []; }
  return (data || []).map(fromDbOrder);
};

// Subscrever para atualizações realtime
export const cloudSubscribeOrders = (
  onInsert: (order: Order) => void,
  onUpdate: (order: Order) => void,
  onDelete: (id: string) => void,
) => {
  const channel = supabase
    .channel('orders-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
      onInsert(fromDbOrder(payload.new));
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
      onUpdate(fromDbOrder(payload.new));
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders' }, (payload) => {
      onDelete((payload.old as any).id);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
