import { PanelConfig } from '../types/order';

export const defaultConfig: PanelConfig = {
  backgroundColor: '#ffffff',
  production: {
    visible: true,
    title: 'PRODUÇÃO',
    width: 30,
    headerHeight: 6,
    headerBg: '#3b82f6',
    headerColor: '#ffffff',
    headerFontFamily: 'Arial',
    headerFontSize: 1.2,
    showBorder: false,
    cardConfig: {
      columns: 2,
      rows: 4,
      height: 60,
      backgroundColor: '#f3f4f6',
      textColor: '#374151',
      fontFamily: 'Arial',
      fontSize: 2
    }
  },
  ready: {
    visible: true,
    title: 'PRONTOS',
    width: 40,
    headerHeight: 6,
    headerBg: '#10b981',
    headerColor: '#ffffff',
    headerFontFamily: 'Arial',
    headerFontSize: 1.2,
    showBorder: false,
    cardConfig: {
      columns: 3,
      rows: 2,
      height: 60,
      backgroundColor: '#f3f4f6',
      textColor: '#374151',
      fontFamily: 'Arial',
      fontSize: 1.6
    }
  },
  advertising: {
    visible: true,
    width: 22,
    headerVisible: true,
    headerHeight: 6,
    headerTitle: 'PUBLICIDADE',
    headerBg: '#8b5cf6',
    headerColor: '#ffffff',
    headerFontFamily: 'Arial',
    headerFontSize: 1.2,
    backgroundColor: '#ffffff',
    imageUrl: undefined
  },
  lastOrder: {
    height: 120,
    fontSize: 5,
    backgroundColor: '#f59e0b',
    textColor: '#ffffff',
    pulseAnimation: true,
    highlight: true
  },
  cards: {
    showNickname: true,
    showItems: true
  },
  sounds: {
    production: true,
    ready: true,
    productionFile: undefined,
    readyFile: undefined
  },
  autoExpedition: {
    enabled: true,
    minutes: 10
  },
  modules: {
    balcao: true,
    mesa: true,
    entrega: true,
    ficha: true
  }
};