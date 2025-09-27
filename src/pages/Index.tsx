import { useState, useEffect, useMemo } from 'react';
import { useOrders } from '../hooks/useOrders';
import { OrderColumn } from '../components/OrderColumn';
import { OrderCard } from '../components/OrderCard';
import { OrderColumnGrid } from '../components/OrderColumnGrid';
import { LastOrderDisplay } from '../components/LastOrderDisplay';
import { AdvertisingColumn } from '../components/AdvertisingColumn';
import { ControlPanel } from '../components/ControlPanel';
import { ConfigurationPanel } from '../components/ConfigurationPanel';
import { SplashScreen } from '../components/SplashScreen';
import { defaultConfig } from '../data/defaultConfig';
import { PanelConfig } from '../types/order';
import { toast } from '../hooks/use-toast';
import { useIsTablet } from '../hooks/use-mobile';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/resizable';

const Index = () => {
  const isTablet = useIsTablet();
  const [config, setConfig] = useState<PanelConfig>(() => {
    return defaultConfig;
  });
  const [originalConfig, setOriginalConfig] = useState<PanelConfig>(defaultConfig);
  const [configOpen, setConfigOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [isKioskMode, setIsKioskMode] = useState(true);
  const [productionPopupOpen, setProductionPopupOpen] = useState(false);
  
  // Estabilizar ttsConfig para evitar recriações desnecessárias
  const ttsConfig = useMemo(() => 
    config?.textToSpeech || defaultConfig.textToSpeech, 
    [config?.textToSpeech]
  );
  
  const autoExpeditionConfig = useMemo(() => 
    config?.autoExpedition || defaultConfig.autoExpedition, 
    [config?.autoExpedition]
  );
  
  const { 
    productionOrders, 
    readyOrders, 
    lastOrderNumber, 
    lastOrderData, // Usar dados completos do último pedido
    loading, 
    moveToReady, 
    expedite,
    startSimulation,
    stopSimulation,
    isSimulationActive,
    expeditionLog,
    clearAllOrders,
    generateOrders
  } = useOrders(ttsConfig, autoExpeditionConfig, config);

  // Simulação automática
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isSimulationActive && config.simulation?.enabled) {
      const intervalSeconds = config.simulation.intervalSeconds || 30;
      const ordersPerInterval = config.simulation.ordersPerInterval || 1;
      
      // Calcular intervalo individual: se quer 3 pedidos em 30s, cada um a cada 10s
      const individualInterval = (intervalSeconds / ordersPerInterval) * 1000;
      
      intervalId = setInterval(() => {
        generateOrders(1, config);
      }, individualInterval);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isSimulationActive, config.simulation?.enabled, config.simulation?.intervalSeconds, config.simulation?.ordersPerInterval, generateOrders, config]);

  useEffect(() => {
    const savedConfig = localStorage.getItem('oie-config');
    console.log('=== Loading saved config ===');
    console.log('Saved config found:', !!savedConfig);
    
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig) as PanelConfig;
        console.log('Parsed config advertising:', parsedConfig.advertising);
        
        // Merge com defaultConfig para garantir que todas as propriedades existam
        const mergedConfig: PanelConfig = { 
          ...defaultConfig, 
          ...parsedConfig, 
          production: { ...defaultConfig.production, ...parsedConfig.production, cardConfig: { ...defaultConfig.production.cardConfig, ...parsedConfig.production?.cardConfig } },
          ready: { ...defaultConfig.ready, ...parsedConfig.ready, cardConfig: { ...defaultConfig.ready.cardConfig, ...parsedConfig.ready?.cardConfig } },
          advertising: { ...defaultConfig.advertising, ...parsedConfig.advertising },
          lastOrder: { ...defaultConfig.lastOrder, ...parsedConfig.lastOrder },
          sounds: { ...defaultConfig.sounds, ...parsedConfig.sounds },
          textToSpeech: { ...defaultConfig.textToSpeech, ...parsedConfig.textToSpeech },
          autoExpedition: { ...defaultConfig.autoExpedition, ...parsedConfig.autoExpedition },
          modules: { 
            // Sempre usar configuração padrão de fábrica para módulos (todos habilitados)
            balcao: { 
              enabled: defaultConfig.modules.balcao.enabled, // Sempre true
              displayOption: parsedConfig.modules?.balcao?.displayOption || defaultConfig.modules.balcao.displayOption 
            },
            mesa: { 
              enabled: defaultConfig.modules.mesa.enabled, // Sempre true
              displayOption: parsedConfig.modules?.mesa?.displayOption || defaultConfig.modules.mesa.displayOption 
            },
            entrega: { 
              enabled: defaultConfig.modules.entrega.enabled, // Sempre true
              displayOption: parsedConfig.modules?.entrega?.displayOption || defaultConfig.modules.entrega.displayOption 
            },
            ficha: { 
              enabled: defaultConfig.modules.ficha.enabled, // Sempre true
              displayOption: parsedConfig.modules?.ficha?.displayOption || defaultConfig.modules.ficha.displayOption 
            }
          },
          splash: { ...defaultConfig.splash, ...parsedConfig.splash },
        };
        
        console.log('Setting merged config from localStorage...');
        setConfig(mergedConfig);
        setOriginalConfig(mergedConfig);
        setShowSplash(mergedConfig.splash?.enabled ?? true);
      } catch (error) {
        console.error('Erro ao carregar configuração salva:', error);
        console.log('Using default config due to error');
        setConfig(defaultConfig);
        setOriginalConfig(defaultConfig);
        setShowSplash(defaultConfig.splash?.enabled ?? true);
        toast({
          title: "Erro",
          description: "Erro ao carregar configuração salva. Usando configuração padrão.",
          variant: "destructive"
        });
      }
    } else {
      console.log('No saved config, using default');
      setShowSplash(defaultConfig.splash?.enabled ?? true);
    }
  }, []);

  // Modo Kiosk automático
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

    // Pequeno delay para garantir que a página carregou completamente
    const timer = setTimeout(enterKioskMode, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Atalho de teclado para abrir configurações
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+K para abrir configurações
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        setConfigOpen(true);
        toast({
          title: "Configurações abertas",
          description: "Use Ctrl+K para abrir as configurações rapidamente",
          duration: 2000,
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOrderClick = (order: any) => {
    if (order.status === 'production') {
      moveToReady(order.id);
    }
  };

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

  const handleConfigChange = (newConfig: PanelConfig) => {
    setConfig(newConfig);
    // Não salva no localStorage aqui para permitir visualização em tempo real
  };

  const handleSaveConfig = () => {
    localStorage.setItem('oie-config', JSON.stringify(config));
    setOriginalConfig(config); // Atualiza a config original com a salva
    setConfigOpen(false);
    toast({
      title: "Configurações Salvas",
      description: "As configurações foram atualizadas com sucesso",
      duration: 1000 // Desaparece automaticamente após 1 segundo
    });
  };

  const handleCancelConfig = () => {
    setConfig(originalConfig); // Reverte para a config original
    setConfigOpen(false);
  };

  const handleToggleKiosk = async () => {
    try {
      if (isKioskMode) {
        // Sair do modo kiosk
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
        setIsKioskMode(false);
      } else {
        // Entrar no modo kiosk
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        setIsKioskMode(true);
      }
    } catch (error) {
      console.warn('Erro ao alternar modo kiosk:', error);
    }
  };

  // Listener para detectar mudanças no fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsKioskMode(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleResizeColumn = (sizes: number[]) => {
    const totalSize = 100;
    let newConfig = { ...config };
    
    // Mapear os tamanhos para as colunas visíveis
    const visibleColumns = [];
    if (config.production.visible) visibleColumns.push('production');
    visibleColumns.push('ready');
    if (config.advertising.visible) visibleColumns.push('advertising');
    
    visibleColumns.forEach((column, index) => {
      if (column === 'production') {
        newConfig.production.width = Math.round(sizes[index]);
      } else if (column === 'ready') {
        newConfig.ready.width = Math.round(sizes[index]);
      } else if (column === 'advertising') {
        newConfig.advertising.width = Math.round(sizes[index]);
      }
    });
    
    setConfig(newConfig);
    // Salvar imediatamente no localStorage para persistir
    localStorage.setItem('oie-config', JSON.stringify(newConfig));
  };

  const getInitialSizes = () => {
    const sizes = [];
    if (config.production.visible) sizes.push(config.production.width);
    sizes.push(config.ready.width);
    if (config.advertising.visible) sizes.push(config.advertising.width);
    return sizes;
  };

  return (
    <>
      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      <div
        className="min-h-screen h-screen flex flex-col"
        style={{ backgroundColor: config.backgroundColor, position: 'relative' }}
      >
        {/* Header de Identificação do Painel */}
        {config.panel.displayLocation === 'above-headers' && (
          <div 
            className="w-full flex items-center justify-center py-4 border-b flex-shrink-0"
            style={{
              backgroundColor: config.ready.headerBg,
              color: config.ready.headerColor,
              height: `${config.ready.headerHeight}px`,
              fontFamily: config.ready.headerFontFamily,
              fontSize: `${config.ready.headerFontSize}rem`
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-current rounded-full animate-pulse opacity-80"></div>
              <div className="text-center font-bold">
                PAINEL {config.panel.id} - {config.panel.name.toUpperCase()}
                {config.panel.location && (
                  <span className="ml-3 opacity-80">• {config.panel.location.toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>
        )}
      <div className={`flex-1 p-1 pt-1 h-full overflow-hidden ${isTablet ? 'pb-12' : ''}`}>
        {config.resizableColumns !== false ? (
          <ResizablePanelGroup 
            direction="horizontal" 
            className="h-full gap-0.5"
            onLayout={handleResizeColumn}
          >
            {/* Coluna 1 - Produção */}
            {config.production.visible && (
              <>
                <ResizablePanel 
                  defaultSize={config.production.width}
                  minSize={15}
                  maxSize={60}
                  className="h-full"
                >
                  <div className="h-full relative">
                    <OrderColumn
                      title={config.production.title}
                      orders={productionOrders}
                      onOrderClick={(order) => moveToReady(order.id)}
                      variant="production"
                      showNickname={config.production?.cardConfig?.showNickname ?? true}
                      showItems={config.production?.cardConfig?.showItems ?? true}
                      moduleIndicator={config.production?.cardConfig?.moduleIndicator ?? 'bullet'}
                      headerBg={config.production.headerBg}
                      headerColor={config.production.headerColor}
                      headerHeight={config.production.headerHeight}
                      headerFontSize={config.production.headerFontSize}
                      headerFontFamily={config.production.headerFontFamily}
                      config={config}
                      cardConfig={{
                        fontSize: config.production.cardConfig.fontSize,
                        fontFamily: config.production.cardConfig.fontFamily,
                        textColor: config.production.cardConfig.textColor,
                        backgroundColor: config.production.cardConfig.backgroundColor
                      }}
                      columns={config.production.cardConfig.columns}
                      showBorder={config.production.showBorder}
                    />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
              </>
            )}

            {/* Coluna 2 - Prontos */}
            <ResizablePanel 
              defaultSize={config.ready.width}
              minSize={30}
              maxSize={70}
              className="h-full"
            >
              <div className="h-full relative">
                <div className="flex flex-col h-full">
                  <div 
                    className={`bg-white rounded-lg shadow-lg flex flex-col overflow-hidden h-full ${config.ready.showBorder ? 'ring-2 ring-blue-200' : ''}`}
                  >
                    <div 
                      className="flex items-center justify-center px-4 font-bold shadow-sm border-b rounded-t-lg relative"
                      style={{
                        backgroundColor: config.ready.headerBg,
                        color: config.ready.headerColor,
                        height: `${config.ready.headerHeight}px`,
                        fontSize: `${config.ready.headerFontSize}rem`,
                        fontFamily: config.ready.headerFontFamily
                      }}
                    >
                      {/* Contador de produção quando coluna 1 está desativada */}
                      {!config.production.visible && (
                        <Popover open={productionPopupOpen} onOpenChange={setProductionPopupOpen}>
                          <PopoverTrigger asChild>
                            <div 
                              className="absolute left-4 bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold cursor-pointer hover:bg-gray-700 transition-colors"
                              style={{ fontSize: '16px' }}
                              title="Clique para ver pedidos em produção"
                            >
                              {productionOrders.length}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-60 max-h-96 overflow-y-auto" align="start">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-sm text-center">Pedidos em Produção ({productionOrders.length})</h4>
                              {productionOrders.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center">Nenhum pedido em produção</p>
                              ) : (
                                <div className="grid grid-cols-2 gap-2">
                                  {productionOrders.map((order) => (
                                    <div
                                      key={order.id}
                                      onClick={() => {
                                        moveToReady(order.id);
                                        setProductionPopupOpen(false);
                                      }}
                                      className="bg-gray-100 rounded-lg p-3 cursor-pointer hover:bg-gray-200 transition-colors flex flex-col items-center justify-center text-center min-h-[80px]"
                                    >
                                      <div className="text-2xl font-bold text-gray-800 mb-1">
                                        {order.numeroPedido || order.number || '---'}
                                      </div>
                                      <div className="text-xs text-gray-600 truncate max-w-full">
                                        {order.nomeCliente || order.nickname || ''}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                      
                      <span>{config.ready.title}</span>
                      
                      <div className="absolute right-4 bg-white/20 px-2 py-1 rounded-full font-bold" style={{ fontSize: '16px' }}>
                        {readyOrders.length + (lastOrderNumber && config.lastOrder.highlight ? 1 : 0)}
                      </div>
                    </div>
                    
                    {/* Último Pedido Fixo */}
                    {lastOrderNumber && config.lastOrder.highlight && (
                      <div className="flex-shrink-0">
                        <LastOrderDisplay
                          orderNumber={lastOrderNumber}
                          nickname={lastOrderData?.nomeCliente}
                          config={config.lastOrder}
                          onExpedite={handleExpedite}
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 p-2 bg-gray-50" style={{ overflow: 'hidden' }}>
                      <OrderColumnGrid
                        orders={readyOrders}
                        columns={config.ready.cardConfig.columns}
                        onOrderClick={(order) => expedite(order.numeroPedido || order.number || '')}
                        showNickname={config.ready?.cardConfig?.showNickname ?? true}
                        showItems={config.ready?.cardConfig?.showItems ?? true}
                        moduleIndicator={config.ready?.cardConfig?.moduleIndicator ?? 'bullet'}
                        config={config}
                        cardConfig={{
                          fontSize: config.ready?.cardConfig?.fontSize,
                          fontFamily: config.ready?.cardConfig?.fontFamily,
                          textColor: config.ready?.cardConfig?.textColor,
                          backgroundColor: config.ready?.cardConfig?.backgroundColor
                        }}
                        lastOrderNumber={lastOrderNumber}
                        lastOrderConfig={config.lastOrder}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>

            {/* Coluna 3 - Publicidade */}
            {config.advertising.visible && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel 
                  defaultSize={config.advertising.width}
                  minSize={15}
                  maxSize={50}
                  className="h-full"
                >
                  <div className="h-full relative">
                    {config.panel.displayLocation === 'column3' && (
                      <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm text-primary-foreground rounded px-2 py-1 text-xs font-medium shadow-sm z-10">
                        P{config.panel.id}
                      </div>
                    )}
                    <AdvertisingColumn
                      title={config.advertising.headerTitle}
                      showHeader={config.advertising.headerVisible}
                      headerBg={config.advertising.headerBg}
                      headerColor={config.advertising.headerColor}
                      headerHeight={config.advertising.headerHeight}
                      backgroundColor={config.advertising.backgroundColor}
                      imageUrl={config.advertising.imageUrl}
                      websiteUrl={config.advertising.websiteUrl}
                      newsMode={config.advertising.newsMode}
                      newsSource={config.advertising.newsSource}
                      newsFontSize={config.advertising.newsFontSize || 2.5}
                      className="h-full"
                      onToggleHeader={() => {
                        const newConfig = {
                          ...config,
                          advertising: {
                            ...config.advertising,
                            headerVisible: !config.advertising.headerVisible
                          }
                        };
                        setConfig(newConfig);
                        localStorage.setItem('oie-config', JSON.stringify(newConfig));
                      }}
                    />
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        ) : (
          <div className={`flex gap-0.5 h-full`}>
            {/* Layout fixo quando redimensionamento está desabilitado */}
            {config.production.visible && (
              <div style={{ width: `${(config.production.width / (config.production.width + config.ready.width + (config.advertising.visible ? config.advertising.width : 0))) * 100}%` }} className="h-full relative">
                <OrderColumn
                  title={config.production.title}
                  orders={productionOrders}
                  onOrderClick={(order) => moveToReady(order.id)}
                  variant="production"
                  showNickname={config.production?.cardConfig?.showNickname ?? true}
                  showItems={config.production?.cardConfig?.showItems ?? true}
                  moduleIndicator={config.production?.cardConfig?.moduleIndicator ?? 'bullet'}
                  headerBg={config.production.headerBg}
                  headerColor={config.production.headerColor}
                  headerHeight={config.production.headerHeight}
                  headerFontSize={config.production.headerFontSize}
                  headerFontFamily={config.production.headerFontFamily}
                  config={config}
                  cardConfig={{
                    fontSize: config.production.cardConfig.fontSize,
                    fontFamily: config.production.cardConfig.fontFamily,
                    textColor: config.production.cardConfig.textColor,
                    backgroundColor: config.production.cardConfig.backgroundColor
                  }}
                  columns={config.production.cardConfig.columns}
                  showBorder={config.production.showBorder}
                />
              </div>
            )}

            {/* Coluna 2 - Prontos */}
            <div style={{ width: `${(config.ready.width / (config.production.width + config.ready.width + (config.advertising.visible ? config.advertising.width : 0))) * 100}%` }} className="h-full relative">
              <div className="flex flex-col h-full">
                <div 
                  className={`bg-white rounded-lg shadow-lg flex flex-col overflow-hidden h-full ${config.ready.showBorder ? 'ring-2 ring-blue-200' : ''}`}
                >
                  <div 
                    className="flex items-center justify-center px-4 font-bold shadow-sm border-b rounded-t-lg relative"
                    style={{
                      backgroundColor: config.ready.headerBg,
                      color: config.ready.headerColor,
                      height: `${config.ready.headerHeight}px`,
                      fontSize: `${config.ready.headerFontSize}rem`,
                      fontFamily: config.ready.headerFontFamily
                    }}
                  >
                    {/* Contador de produção quando coluna 1 está desativada */}
                    {!config.production.visible && (
                      <Popover open={productionPopupOpen} onOpenChange={setProductionPopupOpen}>
                        <PopoverTrigger asChild>
                          <div 
                            className="absolute left-4 bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold cursor-pointer hover:bg-gray-700 transition-colors"
                            style={{ fontSize: '16px' }}
                            title="Clique para ver pedidos em produção"
                          >
                            {productionOrders.length}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 max-h-96 overflow-y-auto" align="start">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-center">Pedidos em Produção ({productionOrders.length})</h4>
                            {productionOrders.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center">Nenhum pedido em produção</p>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                {productionOrders.map((order) => (
                                  <div
                                    key={order.id}
                                    onClick={() => {
                                      moveToReady(order.id);
                                      setProductionPopupOpen(false);
                                    }}
                                    className="bg-gray-100 rounded-lg p-3 cursor-pointer hover:bg-gray-200 transition-colors flex flex-col items-center justify-center text-center min-h-[80px]"
                                  >
                                    <div className="text-2xl font-bold text-gray-800 mb-1">
                                      {order.numeroPedido || order.number || '---'}
                                    </div>
                                    <div className="text-xs text-gray-600 truncate max-w-full">
                                      {order.nomeCliente || order.nickname || ''}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                    
                    <span>{config.ready.title}</span>
                    
                    <div className="absolute right-4 bg-white/20 px-2 py-1 rounded-full font-bold" style={{ fontSize: '16px' }}>
                      {readyOrders.length + (lastOrderNumber && config.lastOrder.highlight ? 1 : 0)}
                    </div>
                  </div>
                  
                  {/* Último Pedido Fixo */}
                  {lastOrderNumber && config.lastOrder.highlight && (
                    <div className="flex-shrink-0">
                      <LastOrderDisplay
                        orderNumber={lastOrderNumber}
                        nickname={lastOrderData?.nomeCliente}
                        config={config.lastOrder}
                        onExpedite={handleExpedite}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 p-2 bg-gray-50" style={{ overflow: 'hidden' }}>
                    <OrderColumnGrid
                      orders={readyOrders}
                      columns={config.ready.cardConfig.columns}
                      onOrderClick={(order) => expedite(order.numeroPedido || order.number || '')}
                      showNickname={config.ready?.cardConfig?.showNickname ?? true}
                      showItems={config.ready?.cardConfig?.showItems ?? true}
                      moduleIndicator={config.ready?.cardConfig?.moduleIndicator ?? 'bullet'}
                      config={config}
                      cardConfig={{
                        fontSize: config.ready?.cardConfig?.fontSize,
                        fontFamily: config.ready?.cardConfig?.fontFamily,
                        textColor: config.ready?.cardConfig?.textColor,
                        backgroundColor: config.ready?.cardConfig?.backgroundColor
                      }}
                      lastOrderNumber={lastOrderNumber}
                      lastOrderConfig={config.lastOrder}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna 3 - Publicidade */}
            {config.advertising.visible && (
              <div style={{ width: `${(config.advertising.width / (config.production.width + config.ready.width + config.advertising.width)) * 100}%` }} className="h-full relative">
                {config.panel.displayLocation === 'column3' && (
                  <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm text-primary-foreground rounded px-2 py-1 text-xs font-medium shadow-sm z-10">
                    P{config.panel.id}
                  </div>
                )}
                <AdvertisingColumn
                  title={config.advertising.headerTitle}
                  showHeader={config.advertising.headerVisible}
                  headerBg={config.advertising.headerBg}
                  headerColor={config.advertising.headerColor}
                  headerHeight={config.advertising.headerHeight}
                  backgroundColor={config.advertising.backgroundColor}
                  imageUrl={config.advertising.imageUrl}
                  websiteUrl={config.advertising.websiteUrl}
                  newsMode={config.advertising.newsMode}
                  newsSource={config.advertising.newsSource}
                  newsFontSize={config.advertising.newsFontSize || 2.5}
                  className="h-full"
                  onToggleHeader={() => {
                    const newConfig = {
                      ...config,
                      advertising: {
                        ...config.advertising,
                        headerVisible: !config.advertising.headerVisible
                      }
                    };
                    setConfig(newConfig);
                    localStorage.setItem('oie-config', JSON.stringify(newConfig));
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Painel de Controle Fixo */}
      {!isTablet && (
        <div className="flex-shrink-0 z-50 bg-card border-t shadow-sm" style={{ height: '32px', minHeight: '32px' }}>
          <ControlPanel
            onConfigClick={() => setConfigOpen(true)}
            onExpedite={handleExpedite}
            expeditionLog={expeditionLog}
            configOpen={configOpen}
            isKioskMode={isKioskMode}
            onToggleKiosk={handleToggleKiosk}
          />
        </div>
      )}

      {/* Painel de Controle para Tablet (fixo na tela) */}
      {isTablet && (
        <ControlPanel
          onConfigClick={() => setConfigOpen(true)}
          onExpedite={handleExpedite}
          expeditionLog={expeditionLog}
          configOpen={configOpen}
          isKioskMode={isKioskMode}
          onToggleKiosk={handleToggleKiosk}
        />
      )}

      {/* Painel de Configuração */}
      <ConfigurationPanel
        open={configOpen}
        onOpenChange={handleCancelConfig} // Usa handleCancelConfig para fechar sem salvar
        config={config}
        onConfigChange={handleConfigChange}
        onSave={handleSaveConfig}
        onCancel={handleCancelConfig}
        clearAllOrders={clearAllOrders}
        generateOrders={(count) => generateOrders(count, config)}
      />
      
      {/* Overlay */}
      {configOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleCancelConfig}
        />
      )}
    </div>
    </>
  );
};

export default Index;
