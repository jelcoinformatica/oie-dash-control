# Sistema Completo de Gerenciamento de Pedidos (Oie! v.5.0)

## Resumo Executivo
Sistema completo de painel digital KDS (Kitchen Display System) para restaurantes, desenvolvido em React + TypeScript + Tailwind CSS, com funcionalidades avançadas de gerenciamento de pedidos, TTS, auto-expedição, simulação e configuração em tempo real.

## Arquitetura e Stack Tecnológica

### Tecnologias Base
- **Frontend**: React 18.3.1 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Roteamento**: React Router DOM
- **State Management**: React Hooks (useState, useEffect, useMemo, useCallback)
- **UI Components**: shadcn/ui library completa
- **Animações**: Tailwind CSS animations + CSS transitions

### Estrutura de Arquivos
```
src/
├── components/
│   ├── ui/ (shadcn components completos)
│   ├── AdvertisingColumn.tsx
│   ├── ConfigurationPanel.tsx (1338 linhas)
│   ├── ControlPanel.tsx
│   ├── LastOrderDisplay.tsx
│   ├── OrderCard.tsx
│   ├── OrderColumn.tsx
│   └── OrderColumnGrid.tsx
├── data/
│   ├── defaultConfig.ts
│   ├── mockOrders.ts
│   ├── orders.json
│   └── producao.sql
├── hooks/
│   ├── useOrders.ts (345 linhas)
│   ├── useTextToSpeech.ts
│   └── use-toast.ts
├── pages/
│   ├── Index.tsx (283 linhas - arquivo principal)
│   └── NotFound.tsx
├── services/
│   └── orderService.ts
├── types/
│   └── order.ts
└── lib/
    └── utils.ts
```

## Funcionalidades Principais

### 1. Sistema de Colunas Configuráveis
- **Coluna 1**: Produção (opcional, configurável)
- **Coluna 2**: Prontos (obrigatória, sempre visível)  
- **Coluna 3**: Publicidade (opcional, suporte a imagens)

### 2. Gestão de Status de Pedidos
- **Status**: `production` | `ready` | `delivered`
- **Módulos**: `balcao` | `mesa` | `entrega` | `ficha`
- **Fluxo**: Produção → Prontos → Expedição
- **Interface de expedição**: Campo de input no rodapé + logs visuais

### 3. Sistema de "Último Pedido"
- Display destacado do último pedido movido para "prontos"
- Configuração completa (altura, fonte, cores, animação pulse)
- Auto-expedição configurável por tempo
- Click para expedição manual

### 4. Text-to-Speech (TTS) Avançado
```typescript
interface TTSConfig {
  enabled: boolean;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  textType?: 'number_only' | 'name_ready' | 'order_ready' | 'name_order_ready' | 'custom';
  customText?: string;
  repeatEnabled?: boolean;
  repeatCount?: number;
  repeatInterval?: number;
}
```
- Suporte a múltiplas vozes português-BR
- Tipos de texto configuráveis
- Sistema de repetição
- Integração com sons

### 5. Sistema de Sons
- Sons para produção e prontos
- Arquivos: `kds_sound_bell1.wav`, `kds_sound_bell2.wav`
- Configuração independente por evento

### 6. Auto-Expedição Inteligente
- Configuração por minutos
- Monitoramento automático do último pedido
- Expedição automática após tempo configurado

### 7. Modo Kiosk Automático
```typescript
useEffect(() => {
  const enterKioskMode = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.warn('Não foi possível entrar em modo tela cheia:', error);
    }
  };
  const timer = setTimeout(enterKioskMode, 1000);
  return () => clearTimeout(timer);
}, []);
```

### 8. Sistema de Configuração Avançado
Painel lateral com 12+ seções configuráveis:
- **Fundo da Aplicação**: Cor personalizada
- **Coluna Produção**: Visibilidade, título, largura, header, cards
- **Coluna Prontos**: Título, largura, header, cards (obrigatória)
- **Último Pedido**: Altura, fonte, cores, animação
- **Publicidade**: Header, imagem, dimensões
- **Sons**: Arquivos por evento
- **Text-to-Speech**: Configuração completa
- **Auto-Expedição**: Tempo e habilitação
- **Módulos**: Ativação por tipo
- **Cards**: Layout, cores, fontes por coluna
- **Simulação**: Ferramentas de teste
- **Diversos**: Configurações extras

### 9. Sistema de Cards Responsivo
```typescript
// Cálculo automático de dimensões
const { visibleOrders, cardHeight, cardWidth, adjustedFontSize } = useMemo(() => {
  // Usa largura REAL do container
  const gap = 4;
  const totalGaps = gap * (columns - 1);
  const availableWidth = containerDimensions.width - totalGaps;
  const cardWidth = Math.floor(availableWidth / columns);
  
  // Altura fixa + ajuste de fonte automático
  const cardHeight = 90;
  let adjustedFontSize = requestedFontSize;
  const estimatedTextWidth = 4 * adjustedFontSize * baseFontSize * 0.6;
  if (estimatedTextWidth > cardWidth - 16) {
    adjustedFontSize = Math.max(0.8, (cardWidth - 16) / (4 * baseFontSize * 0.6));
  }
  
  // Limitar cards para não haver cortes
  const maxRows = Math.floor(availableHeight / (cardHeight + gap));
  const maxVisibleCards = Math.max(0, maxRows * columns);
  const visibleOrders = orders.slice(0, maxVisibleCards);
  
  return { visibleOrders, cardHeight, cardWidth, adjustedFontSize };
}, [orders, columns, cardConfig?.fontSize, containerDimensions]);
```

### 10. Interface de Tipos Completa
```typescript
export interface Order {
  id: string;
  numeroPedido: string;
  ticket: string;
  modulo: 'balcao' | 'mesa' | 'entrega' | 'ficha';
  status: 'production' | 'ready' | 'delivered';
  ultimoConsumo: Date;
  dataContabil: Date;
  localEntrega: string;
  nomeCliente: string;
  // Campos legados para compatibilidade
  number?: string;
  items?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  nickname?: string;
  totalValue?: number;
}

export interface PanelConfig {
  backgroundColor: string;
  production: ColumnConfig;
  ready: ColumnConfig;
  advertising: AdvertisingConfig;
  lastOrder: LastOrderConfig;
  sounds: SoundsConfig;
  textToSpeech: TTSConfig;
  autoExpedition: AutoExpeditionConfig;
  modules: ModulesConfig;
  database?: DatabaseConfig;
  store?: StoreConfig;
}
```

### 11. Persistência e Storage
- **LocalStorage**: Configurações persistentes
- **Merge inteligente**: Mescla com configuração padrão
- **Backup/Restore**: Sistema de configuração original vs atual

### 12. Sistema de Simulação
- Geração de pedidos mock
- Limpeza de dados
- Ferramentas de teste integradas
- Controle de módulos ativos na simulação

### 13. Controles de Interface
- **Campo de expedição**: Input centralizado no rodapé
- **Auto-focus**: Campo sempre focado quando não em configuração
- **Log visual**: Últimos 5 pedidos expedidos com tooltips
- **Tooltips informativos**: Sistema completo com tempos de expedição

### 14. Sistema de Grid Inteligente
- **ResizeObserver**: Medição real do container
- **Cálculo dinâmico**: Ajuste automático de colunas/linhas
- **Overflow control**: Sem barras de rolagem, corte inteligente
- **Responsive**: Adaptação automática a qualquer resolução

### 15. Animações e Transições
```css
.animate-card-appear {
  animation: cardAppear 0.3s ease-out;
}

@keyframes cardAppear {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

### 16. Sistema de Cores por Módulo
```typescript
const moduleColors = {
  balcao: 'bg-green-500',
  mesa: 'bg-blue-500', 
  entrega: 'bg-red-500',
  ficha: 'bg-purple-500'
};
```
- Indicadores visuais quando múltiplos módulos ativos
- Bullets coloridos nos cards

### 17. Tratamento de Imagens na Publicidade
```typescript
// Controle de overflow e adaptação
<div className="w-full h-full overflow-hidden flex items-center justify-center">
  <img 
    src={imageUrl} 
    alt="Publicidade" 
    className="max-w-full max-h-full object-contain"
    style={{ maxHeight: '100%', maxWidth: '100%' }}
  />
</div>
```

### 18. Sistema de Expedição Duplo
```typescript
const handleExpedite = (orderNumber: string) => {
  // Primeiro, verificar se o pedido está em produção
  const productionOrder = productionOrders.find(order => {
    const orderNum = order.numeroPedido || order.number || '';
    return orderNum === orderNumber || orderNum.replace(/[^\d]/g, '') === orderNumber;
  });
  
  if (productionOrder) {
    // Se está em produção, mover para prontos
    moveToReady(productionOrder.id);
  } else {
    // Se não está em produção, fazer expedição normal
    expedite(orderNumber);
  }
};
```

### 19. Sistema de Loading e Estados
- **Loading states**: Controle de estado de carregamento
- **Auto-refresh**: Atualização automática a cada 5 segundos
- **Error handling**: Tratamento de erros e fallbacks

### 20. Configuração de Database (Preparado)
```typescript
database?: {
  type: 'none' | 'mssql' | 'mysql' | 'postgre' | 'other';
  host?: string;
  database?: string;
  username?: string;
  password?: string;
  port?: string;
}
```

## Fluxo de Funcionamento

### 1. Inicialização
1. Carregamento da configuração do localStorage
2. Merge com configuração padrão
3. Entrada automática em modo kiosk
4. Início do hook `useOrders`
5. Carregamento inicial dos pedidos

### 2. Ciclo de Pedidos
1. **Carregamento**: Mock service ou futuramente API real
2. **Exibição**: Cards na coluna de produção
3. **Movimentação**: Click ou comando move para prontos
4. **Último Pedido**: Display especial + TTS + Sons
5. **Auto-Expedição**: Timer automático ou manual
6. **Log**: Registro visual das expedições

### 3. Configuração em Tempo Real
1. **Preview Live**: Mudanças aplicadas instantaneamente
2. **Não salva automaticamente**: Permite preview sem commit
3. **Salvar/Cancelar**: Controle explícito de persistência
4. **Toast feedback**: Confirmação de salvamento

## Performance e Otimizações

### 1. Memoização Inteligente
- `useMemo` para cálculos pesados de layout
- `useCallback` para funções que são props
- Evita re-renderizações desnecessárias

### 2. Virtualização de Cards
- Mostra apenas cards que cabem na tela
- Corte inteligente sem scroll
- Medição real do container

### 3. Debounce e Throttling
- ResizeObserver com cleanup adequado
- Timers controlados adequadamente

## Integração e Extensibilidade

### 1. API Ready
- Service layer preparado
- Interfaces tipadas
- Configuração de database pronta

### 2. Modular Design
- Componentes independentes
- Configuração centralizada
- Hooks reutilizáveis

### 3. i18n Ready
- Textos concentrados
- Estrutura preparada para múltiplos idiomas

## Comandos e Uso

### 1. Operação Normal
- **Mouse**: Click nos cards para mover status
- **Teclado**: Campo de expedição sempre focado
- **Automático**: Timers e auto-expedição

### 2. Configuração
- **Painel lateral**: Botão settings no rodapé
- **Seções expansíveis**: 12+ categorias
- **Preview live**: Mudanças em tempo real
- **Persistência**: Salvar/Cancelar explícito

### 3. Simulação
- **Gerar pedidos**: Quantidade configurável
- **Limpar dados**: Reset completo
- **Módulos**: Controle dos tipos ativos

## Estrutura de Dados

### Configuração Padrão Completa
```typescript
export const defaultConfig: PanelConfig = {
  backgroundColor: '#f3f4f6',
  production: {
    visible: true,
    title: 'EM PRODUÇÃO',
    width: 25,
    headerHeight: 48,
    headerBg: '#1f2937',
    headerColor: '#ffffff',
    headerFontFamily: 'Arial',
    headerFontSize: 1.2,
    showBorder: false,
    cardConfig: {
      columns: 3,
      rows: 10,
      height: 90,
      backgroundColor: '#ffffff',
      textColor: '#374151',
      fontFamily: 'Arial',
      fontSize: 1.2,
      showNickname: true,
      showItems: true
    }
  },
  ready: {
    visible: true,
    title: 'PRONTOS',
    width: 40,
    headerHeight: 48,
    headerBg: '#059669',
    headerColor: '#ffffff',
    headerFontFamily: 'Arial',
    headerFontSize: 1.2,
    showBorder: false,
    cardConfig: {
      columns: 4,
      rows: 10,
      height: 90,
      backgroundColor: '#ffffff',
      textColor: '#374151',
      fontFamily: 'Arial',
      fontSize: 1.2,
      showNickname: true,
      showItems: true
    }
  },
  advertising: {
    visible: true,
    width: 35,
    headerVisible: true,
    headerHeight: 48,
    headerTitle: 'PUBLICIDADE',
    headerBg: '#7c3aed',
    headerColor: '#ffffff',
    headerFontFamily: 'Arial',
    headerFontSize: 1.2,
    backgroundColor: '#ffffff',
    imageUrl: '',
    showBorder: false
  },
  lastOrder: {
    height: 120,
    fontSize: 5,
    backgroundColor: '#fef3c7',
    textColor: '#000000',
    pulseAnimation: false,
    highlight: true,
    fontFamily: 'Arial'
  },
  sounds: {
    production: false,
    ready: true,
    productionFile: '/sounds/kds_sound_bell1.wav',
    readyFile: '/sounds/kds_sound_bell2.wav'
  },
  textToSpeech: {
    enabled: false,
    voice: 'auto',
    rate: 1,
    pitch: 1,
    volume: 0.8,
    textType: 'number_only',
    customText: '',
    repeatEnabled: false,
    repeatCount: 1,
    repeatInterval: 2
  },
  autoExpedition: {
    enabled: false,
    minutes: 5
  },
  modules: {
    balcao: true,
    mesa: true,
    entrega: true,
    ficha: true
  },
  database: {
    type: 'none',
    host: '',
    database: '',
    username: '',
    password: '',
    port: ''
  },
  store: {
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    numeroLicenca: ''
  }
};
```

## Exemplo de Pedido
```typescript
{
  id: "1",
  numeroPedido: "001",
  ticket: "T001", 
  modulo: "balcao",
  status: "production",
  ultimoConsumo: new Date(),
  dataContabil: new Date(),
  localEntrega: "Balcão",
  nomeCliente: "João Silva",
  number: "001",
  items: ["Hambúrguer", "Batata Frita"],
  nickname: "João"
}
```

## Futuras Implementações Preparadas
1. **Integração com banco de dados real** (MSSQL, MySQL, PostgreSQL)
2. **API REST** para comunicação com sistemas POS
3. **WebSocket** para updates em tempo real
4. **Multi-tenant** com configuração por loja
5. **Relatórios** e analytics
6. **Mobile app** para gerenciamento
7. **Impressão** de tickets
8. **Integração** com delivery apps

## Considerações Técnicas
- **Performance**: Otimizado para displays grandes e uso contínuo
- **Acessibilidade**: Tooltips, focus management, keyboard navigation
- **Responsive**: Adaptação automática a qualquer resolução
- **Browser Support**: Moderno (ES6+, Web APIs)
- **Memory Management**: Cleanup adequado de timers e observers
- **Error Boundaries**: Tratamento de erros robusto

Este sistema representa uma solução completa e profissional para gerenciamento de pedidos em restaurantes, com foco em usabilidade, performance e configurabilidade máxima.