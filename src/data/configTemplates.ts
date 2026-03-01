import { PanelConfig } from '../types/order';
import { defaultConfig } from './defaultConfig';

export interface ConfigTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  preview: {
    bgColor: string;
    col1Color: string;
    col2Color: string;
    col2TextColor: string;
    col3Color: string;
  };
  apply: (current: PanelConfig) => PanelConfig;
}

export const configTemplates: ConfigTemplate[] = [
  {
    id: 'default',
    name: 'Padrão',
    description: 'Layout clássico com cores neutras',
    icon: '⬜',
    preview: {
      bgColor: '#ffffff',
      col1Color: '#636363',
      col2Color: '#0011FA',
      col2TextColor: '#ffffff',
      col3Color: '#636363',
    },
    apply: (current) => ({
      ...defaultConfig,
      panel: current.panel,
      database: current.database,
      store: current.store,
      modules: current.modules,
      simulation: current.simulation,
    }),
  },
  {
    id: 'jps-dark',
    name: 'JPS Black & Gold',
    description: 'Modo escuro inspirado na Lotus John Player Special',
    icon: '🏎️',
    preview: {
      bgColor: '#0a0a0a',
      col1Color: '#1a1a1a',
      col2Color: '#1a1a1a',
      col2TextColor: '#D4AF37',
      col3Color: '#1a1a1a',
    },
    apply: (current) => ({
      ...current,
      backgroundColor: '#0a0a0a',
      production: {
        ...current.production,
        headerBg: '#1a1a1a',
        headerColor: '#a0a0a0',
        columnBackground: '#141414',
        cardConfig: {
          ...current.production.cardConfig,
          backgroundColor: '#1e1e1e',
          textColor: '#c0c0c0',
        },
      },
      ready: {
        ...current.ready,
        headerBg: '#D4AF37',
        headerColor: '#0a0a0a',
        showBorder: false,
        columnBackground: '#000000',
        cardConfig: {
          ...current.ready.cardConfig,
          backgroundColor: '#000000',
          textColor: '#D4AF37',
        },
      },
      lastOrder: {
        ...current.lastOrder,
        backgroundColor: '#000000',
        textColor: '#D4AF37',
      },
    }),
  },
  {
    id: 'high-contrast',
    name: 'Alto Contraste',
    description: 'Máxima visibilidade para distância',
    icon: '👁️',
    preview: {
      bgColor: '#000000',
      col1Color: '#333333',
      col2Color: '#0033CC',
      col2TextColor: '#FFFF00',
      col3Color: '#333333',
    },
    apply: (current) => ({
      ...current,
      backgroundColor: '#000000',
      production: {
        ...current.production,
        headerBg: '#333333',
        headerColor: '#ffffff',
        columnBackground: '#1a1a1a',
        cardConfig: {
          ...current.production.cardConfig,
          backgroundColor: '#1a1a1a',
          textColor: '#ffffff',
          fontSize: 4,
        },
      },
      ready: {
        ...current.ready,
        headerBg: '#0033CC',
        headerColor: '#FFFF00',
        showBorder: true,
        columnBackground: '#001166',
        cardConfig: {
          ...current.ready.cardConfig,
          backgroundColor: '#001166',
          textColor: '#FFFF00',
          fontSize: 4,
        },
      },
      lastOrder: {
        ...current.lastOrder,
        backgroundColor: '#000000',
        textColor: '#FFFF00',
      },
    }),
  },
  {
    id: 'clean-light',
    name: 'Clean Branco',
    description: 'Minimalista, ideal para ambientes claros',
    icon: '🤍',
    preview: {
      bgColor: '#f5f5f5',
      col1Color: '#e0e0e0',
      col2Color: '#2196F3',
      col2TextColor: '#ffffff',
      col3Color: '#e0e0e0',
    },
    apply: (current) => ({
      ...current,
      backgroundColor: '#f5f5f5',
      production: {
        ...current.production,
        headerBg: '#e0e0e0',
        headerColor: '#333333',
        columnBackground: '#f0f0f0',
        cardConfig: {
          ...current.production.cardConfig,
          backgroundColor: '#ffffff',
          textColor: '#555555',
        },
      },
      ready: {
        ...current.ready,
        headerBg: '#2196F3',
        headerColor: '#ffffff',
        showBorder: false,
        columnBackground: '#f0f0f0',
        cardConfig: {
          ...current.ready.cardConfig,
          backgroundColor: '#ffffff',
          textColor: '#1565C0',
        },
      },
      lastOrder: {
        ...current.lastOrder,
        backgroundColor: '#f5f5f5',
        textColor: '#1565C0',
      },
    }),
  },
  {
    id: 'restaurant-warm',
    name: 'Restaurante Clássico',
    description: 'Tons quentes, aconchegante',
    icon: '🍽️',
    preview: {
      bgColor: '#2C1810',
      col1Color: '#3E2723',
      col2Color: '#BF360C',
      col2TextColor: '#FFF8E1',
      col3Color: '#3E2723',
    },
    apply: (current) => ({
      ...current,
      backgroundColor: '#2C1810',
      production: {
        ...current.production,
        headerBg: '#3E2723',
        headerColor: '#BCAAA4',
        columnBackground: '#2C1810',
        cardConfig: {
          ...current.production.cardConfig,
          backgroundColor: '#3E2723',
          textColor: '#D7CCC8',
        },
      },
      ready: {
        ...current.ready,
        headerBg: '#BF360C',
        headerColor: '#FFF8E1',
        showBorder: true,
        columnBackground: '#2C1810',
        cardConfig: {
          ...current.ready.cardConfig,
          backgroundColor: '#4E342E',
          textColor: '#FFE0B2',
        },
      },
      lastOrder: {
        ...current.lastOrder,
        backgroundColor: '#2C1810',
        textColor: '#FF6E40',
      },
    }),
  },
];
