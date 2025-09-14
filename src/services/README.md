# Serviço de Pedidos

## Estrutura Atual

Os dados das colunas de Produção e Prontos agora são carregados do arquivo JSON `src/data/orders.json` através do serviço `orderService.ts`.

## Arquivos:
- `src/data/orders.json` - Dados dos pedidos em formato JSON
- `src/services/orderService.ts` - Serviço que simula chamadas de API
- `src/hooks/useOrders.ts` - Hook que usa o serviço (já atualizado)

## Migração para API Real

Para migrar para uma API do backend, você precisará:

1. **Atualizar orderService.ts:**
   - Descomente e adapte as funções da API no final do arquivo
   - Substitua as funções atuais pelas chamadas HTTP reais
   - Configure a `BASE_URL` no `API_CONFIG`

2. **Exemplo de migração:**
```typescript
// Trocar isto:
export const fetchOrders = async (): Promise<Order[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...orders];
};

// Por isto:
export const fetchOrders = async (): Promise<Order[]> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}`);
  if (!response.ok) throw new Error('Falha ao buscar pedidos');
  const data = await response.json();
  return data.orders.map((order: any) => ({
    ...order,
    createdAt: new Date(order.createdAt),
    updatedAt: new Date(order.updatedAt)
  }));
};
```

3. **Nenhuma alteração será necessária nos componentes** - eles continuarão funcionando normalmente.

## Vantagens desta estrutura:
- Separação clara entre dados (JSON) e lógica (serviço)
- Fácil migração para API real sem mudanças nos componentes
- Melhor organização e manutenibilidade do código