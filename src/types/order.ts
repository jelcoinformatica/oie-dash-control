export interface Order {
  id: string;
  number: string;
  module: 'balcao' | 'mesa' | 'entrega' | 'ficha';
  status: 'production' | 'ready' | 'delivered';
  items: string[];
  createdAt: Date;
  updatedAt: Date;
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
  showBorder: boolean;
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
  };
  lastOrder: {
    height: number;
    fontSize: number;
    backgroundColor: string;
    textColor: string;
    pulseAnimation: boolean;
    highlight: boolean;
  };
  cards: {
    showNickname: boolean;
    showItems: boolean;
  };
  sounds: {
    production: boolean;
    ready: boolean;
    productionFile?: File;
    readyFile?: File;
  };
  autoExpedition: {
    enabled: boolean;
    minutes: number;
  };
  modules: {
    balcao: boolean;
    mesa: boolean;
    entrega: boolean;
    ficha: boolean;
  };
}