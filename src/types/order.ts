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

export interface OrderCardConfig {
  columns: number;
  rows: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: number;
  showNickname?: boolean;
  showItems?: boolean;
}

export interface ColumnConfig {
  visible: boolean;
  title: string;
  width: number;
  headerHeight: number;
  headerBg: string;
  headerColor: string;
  headerFontFamily: string;
  headerFontSize: number;
  showBorder?: boolean;
  cardConfig: OrderCardConfig;
}

export interface PanelConfig {
  backgroundColor: string;
  production: ColumnConfig;
  ready: ColumnConfig;
  advertising: {
    visible: boolean;
    width: number;
    headerVisible: boolean;
    headerHeight: number;
    headerTitle: string;
    headerBg: string;
    headerColor: string;
    headerFontFamily: string;
    headerFontSize: number;
    backgroundColor: string;
    imageUrl?: string;
    showBorder?: boolean;
  };
  lastOrder: {
    height: number;
    fontSize: number;
    backgroundColor: string;
    textColor: string;
    pulseAnimation: boolean;
    highlight: boolean;
    fontFamily?: string;
  };
  sounds: {
    production: boolean;
    ready: boolean;
    productionFile?: string;
    readyFile?: string;
  };
  textToSpeech: {
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
  };
  autoExpedition: {
    enabled: boolean;
    minutes: number;
  };
  modules: {
    activeModule: 'balcao' | 'mesa' | 'entrega' | 'ficha';
    balcao: {
      numeroVenda: boolean;
      numeroChamada: boolean;
      apelido: boolean;
      apelidoNumeroVenda: boolean;
    };
    mesa: {
      numeroMesa: boolean;
      apelidoNumeroMesa: boolean;
    };
    entrega: {
      numeroEntrega: boolean;
      numeroVenda: boolean;
    };
    ficha: {
      selectedOption: 'numeroFicha' | 'numeroChamada' | 'nomeCliente' | 'fichaCliente' | 'localEntregaFicha';
    };
  };
  database?: {
    type: 'none' | 'mssql' | 'mysql' | 'postgre' | 'other';
    host?: string;
    database?: string;
    username?: string;
    password?: string;
    port?: string;
  };
  store?: {
    cnpj?: string;
    razaoSocial?: string;
    nomeFantasia?: string;
    numeroLicenca?: string;
  };
}