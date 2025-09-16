import { PanelConfig } from '../types/order';

export const defaultConfig: PanelConfig = {
  backgroundColor: '#ffffff',
  production: {
    visible: true,
    title: 'EM PRODUÇÃO',
    width: 30,
    headerHeight: 72,
    headerBg: '#636363',
    headerColor: '#ffffff',
    headerFontFamily: 'Tahoma',
    headerFontSize: 2,
    showBorder: false,
    cardConfig: {
      columns: 2,
      rows: 4,
      height: 60,
      backgroundColor: '#f3f4f6',
      textColor: '#8C8C8C',
      fontFamily: 'Tahoma',
      fontSize: 3,
      showNickname: true,
      showItems: true
    }
  },
  ready: {
    visible: true,
    title: 'PRONTOS',
    width: 40,
    headerHeight: 72,
    headerBg: '#0011FA',
    headerColor: '#ffffff',
    headerFontFamily: 'Tahoma',
    headerFontSize: 2,
    showBorder: true,
    cardConfig: {
      columns: 10,
      rows: 2,
      height: 60,
      backgroundColor: '#FAFAFA',
      textColor: '#000000',
      fontFamily: 'Tahoma',
      fontSize: 4,
      showNickname: true,
      showItems: true
    }
  },
  advertising: {
    visible: true,
    width: 30,
    headerVisible: true,
    headerHeight: 72,
    headerTitle: 'PUBLICIDADE',
    headerBg: '#636363',
    headerColor: '#ffffff',
    headerFontFamily: 'Tahoma',
    headerFontSize: 2,
    backgroundColor: '#ffffff',
    imageUrl: undefined,
    showBorder: false
  },
  lastOrder: {
    height: 180,
    fontSize: 8,
    backgroundColor: '#ffffff',
    textColor: '#0011FA',
    pulseAnimation: true,
    highlight: true,
    fontFamily: 'Tahoma'
  },
  sounds: {
    production: false,
    ready: true,
    productionFile: '/sounds/kds_sound_bell1.wav',
    readyFile: '/sounds/kds_sound_bell2.wav'
  },
  textToSpeech: {
    enabled: false,
    voice: 'Microsoft Heloisa',
    rate: 1.5,
    pitch: 1,
    volume: 1.0,
    textType: 'name_order_ready',
    customText: '',
    repeatEnabled: false,
    repeatCount: 2,
    repeatInterval: 15
  },
  autoExpedition: {
    enabled: false,
    minutes: 10
  },
  modules: {
    balcao: {
      enabled: true,
      displayOption: 'numeroVenda'
    },
    mesa: {
      enabled: true,
      displayOption: 'apelidoNumeroMesa'
    },
    entrega: {
      enabled: true,
      displayOption: 'numeroVenda'
    },
    ficha: {
      enabled: true,
      displayOption: 'fichaCliente'
    }
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