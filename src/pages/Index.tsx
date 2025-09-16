import { useState, useEffect, useMemo } from 'react';
import { useOrders } from '../hooks/useOrders';
import { OrderColumn } from '../components/OrderColumn';
import { OrderCard } from '../components/OrderCard';
import { OrderColumnGrid } from '../components/OrderColumnGrid';
import { LastOrderDisplay } from '../components/LastOrderDisplay';
import { AdvertisingColumn } from '../components/AdvertisingColumn';
import { ControlPanel } from '../components/ControlPanel';
import { ConfigurationPanel } from '../components/ConfigurationPanel';
import { defaultConfig } from '../data/defaultConfig';
import { PanelConfig } from '../types/order';
import { toast } from '../hooks/use-toast';

const Index = () => {
  const [config, setConfig] = useState<PanelConfig>(defaultConfig);
  const [originalConfig, setOriginalConfig] = useState<PanelConfig>(defaultConfig);
  const [configOpen, setConfigOpen] = useState(false);
  
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

  useEffect(() => {
    const savedConfig = localStorage.getItem('oie-config');
    if (savedConfig) {
      try {
        const parsedConfig: PanelConfig = JSON.parse(savedConfig);
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
          modules: { ...defaultConfig.modules, ...parsedConfig.modules },
        };
        setConfig(mergedConfig);
        setOriginalConfig(mergedConfig);
      } catch (error) {
        console.error("Error parsing saved config from localStorage", error);
        setConfig(defaultConfig);
        setOriginalConfig(defaultConfig);
      }
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

  const getColumnWidths = () => {
    const production = config.production.visible ? config.production.width : 0;
    const ready = config.ready.width;
    const advertising = config.advertising.visible ? config.advertising.width : 0;
    const total = production + ready + advertising;
    
    return {
      production: production > 0 ? (production / total) * 100 : 0,
      ready: (ready / total) * 100,
      advertising: advertising > 0 ? (advertising / total) * 100 : 0
    };
  };
  
  
  const columnWidths = getColumnWidths();

  return (
    <div 
      className="min-h-screen h-screen flex flex-col"
      style={{ backgroundColor: config.backgroundColor, position: 'relative' }}
    >
      <div className="flex-1 flex gap-0.5 p-1 pt-1">
        {/* Coluna 1 - Produção */}
        {config.production.visible && (
          <div style={{ width: `${columnWidths.production}%` }}>
            <OrderColumn
              title={config.production.title}
              orders={productionOrders}
              onOrderClick={(order) => moveToReady(order.id)}
              variant="production"
              headerBg={config.production.headerBg}
              headerColor={config.production.headerColor}
              headerHeight={config.production.headerHeight}
              headerFontSize={config.production.headerFontSize}
              headerFontFamily={config.production.headerFontFamily}
              enabledModules={config.modules}
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
        <div style={{ width: `${columnWidths.ready}%` }}>
          <div className={`bg-white rounded-lg shadow-lg border border-gray-300 flex flex-col overflow-hidden h-full ${config.ready.showBorder ? 'ring-2 ring-blue-200' : ''}`}>
            {/* Header Fixo */}
            <div 
              className="bg-ready text-ready-foreground px-4 font-bold text-lg shadow-sm border-b flex items-center justify-center flex-shrink-0 rounded-t-lg relative"
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
                <div 
                  className="absolute left-4 bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold cursor-help"
                  style={{ fontSize: '16px' }}
                  title="Pedidos em Produção"
                >
                  {productionOrders.length}
                </div>
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
            
            {/* Cards de Pedidos Prontos sem Scroll */}
            <div className="flex-1 bg-gray-50 p-2" style={{ overflow: 'hidden' }}>
              <OrderColumnGrid
                orders={readyOrders}
                columns={config.ready.cardConfig.columns}
                onOrderClick={(order) => expedite(order.numeroPedido || order.number || '')}
                showNickname={config.ready?.cardConfig?.showNickname ?? true}
                showItems={config.ready?.cardConfig?.showItems ?? true}
                enabledModules={config.modules}
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

        {/* Coluna 3 - Publicidade */}
        {config.advertising.visible && (
          <div style={{ width: `${columnWidths.advertising}%` }}>
            <AdvertisingColumn
              title={config.advertising.headerTitle}
              showHeader={config.advertising.headerVisible}
              headerBg={config.advertising.headerBg}
              headerColor={config.advertising.headerColor}
              headerHeight={config.advertising.headerHeight}
              backgroundColor={config.advertising.backgroundColor}
              imageUrl={config.advertising.imageUrl}
              fillImage={config.advertising.fillImage}
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

      {/* Painel de Controle Fixo */}
      <div className="flex-shrink-0 z-10" style={{ height: '32px', backgroundColor: 'var(--background)', borderTop: '1px solid var(--border)' }}>
        <ControlPanel
          onConfigClick={() => setConfigOpen(true)}
          onExpedite={handleExpedite}
          expeditionLog={expeditionLog}
          configOpen={configOpen}
        />
      </div>

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
  );
};

export default Index;
