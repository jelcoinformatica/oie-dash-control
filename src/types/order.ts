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
  moduleIndicator?: 'none' | 'bullet' | 'tag' | 'border';
  // Novos controles de ajuste fino
  gapHorizontal?: number; // Gap horizontal entre cards (px)
  gapVertical?: number;   // Gap vertical entre cards (px)
  cardMinHeight?: number; // Altura mínima dos cards (px)
  cardMaxHeight?: number; // Altura máxima dos cards (px)
  cardWidth?: number;     // Largura dos cards (px)
}

export interface PanelIdentification {
  id: number;
  name: string;
  location: string;
  displayLocation: 'column3' | 'above-headers' | 'none';
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
  showShadow?: boolean;
  showCardBorder?: boolean;
  cardConfig: OrderCardConfig;
}

export interface PanelConfig {
  backgroundColor: string;
  resizableColumns?: boolean;
  panel: PanelIdentification;
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
    websiteUrl?: string;
    newsMode?: boolean; // Nova propriedade para modo notícias
    newsSource?: 'g1' | 'uol' | 'cnn' | 'panelinha' | 'cybercook' | 'tudogostoso' | 'foodnetwork'; // Fontes expandidas
    newsFontSize?: number; // Tamanho da fonte das notícias
    showBorder?: boolean;
    showShadow?: boolean;
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
    readySoundType?: 'padrao' | 'padrao2';
    airportTones?: 1 | 2;
  };
  textToSpeech: {
    enabled: boolean;
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    textType?: 'number_only' | 'name_ready' | 'order_ready' | 'name_order_ready' | 'custom';
    customText?: string;
    numberMode?: 'spelled' | 'normal'; // soletrado ou normal
    repeatEnabled?: boolean;
    repeatCount?: number;
    repeatInterval?: number;
  };
  autoExpedition: {
    enabled: boolean;
    minutes: number;
  };
  simulation?: {
    enabled: boolean;
    intervalSeconds: number;
    ordersPerInterval: number;
  };
  modules: {
    balcao: {
      enabled: boolean;
      displayOption: 'numeroVenda' | 'numeroChamada' | 'apelido' | 'apelidoNumeroVenda';
      showIndicator?: boolean;
    };
    mesa: {
      enabled: boolean;
      displayOption: 'numeroMesa' | 'apelidoNumeroMesa';
      showIndicator?: boolean;
    };
    entrega: {
      enabled: boolean;
      displayOption: 'numeroEntrega' | 'numeroVenda';
      showIndicator?: boolean;
    };
    ficha: {
      enabled: boolean;
      displayOption: 'numeroFicha' | 'numeroChamada' | 'nomeCliente' | 'fichaCliente' | 'localEntregaFicha';
      showIndicator?: boolean;
    };
  };
  database?: {
    type: 'none' | 'mssql' | 'mysql' | 'postgre' | 'other';
    host?: string;
    database?: string;
    username?: string;
    password?: string;
    port?: string;
    kdsIntegration?: boolean;
  };
  store?: {
    cnpj?: string;
    razaoSocial?: string;
    nomeFantasia?: string;
    numeroLicenca?: string;
  };
  splash?: {
    enabled: boolean;
  };
  overlayControls?: {
    enabled: boolean;
  };
}