
-- Tabela de pedidos para sincronização cross-device (KDS)
CREATE TABLE public.orders (
  id TEXT NOT NULL PRIMARY KEY,
  numero_pedido TEXT NOT NULL DEFAULT '',
  ticket TEXT NOT NULL DEFAULT '',
  modulo TEXT NOT NULL DEFAULT 'balcao',
  status TEXT NOT NULL DEFAULT 'production',
  ultimo_consumo TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_contabil TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  local_entrega TEXT NOT NULL DEFAULT '',
  nome_cliente TEXT NOT NULL DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_value NUMERIC NOT NULL DEFAULT 0,
  panel_id INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies: leitura pública (clientes veem pedidos no celular) e escrita pública (painel KDS sem auth)
CREATE POLICY "Anyone can read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete orders" ON public.orders FOR DELETE USING (true);

-- Enable realtime for cross-device sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
