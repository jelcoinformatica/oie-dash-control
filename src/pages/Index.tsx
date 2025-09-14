import { useState, useEffect } from 'react';
import { useOrders } from '../hooks/useOrders';
import { OrderColumn } from '../components/OrderColumn';
import { OrderCard } from '../components/OrderCard';
import { LastOrderDisplay } from '../components/LastOrderDisplay';
import { AdvertisingColumn } from '../components/AdvertisingColumn';
import { ControlPanel } from '../components/ControlPanel';
import { ConfigurationPanel } from '../components/ConfigurationPanel';
import { defaultConfig } from '../data/defaultConfig';
import { PanelConfig } from '../types/order';
import { toast } from '../hooks/use-toast';

const Index = () => {
  const { 
    productionOrders, 
    readyOrders, 
    lastOrderNumber, 
    loading, 
    moveToReady, 
    expedite,
    startSimulation,
    stopSimulation,
    isSimulationActive,
    expeditionLog
  } = useOrders();

  const [config, setConfig] = useState<PanelConfig>(defaultConfig);
  const [originalConfig, setOriginalConfig] = useState<PanelConfig>(defaultConfig);
  const [configOpen, setConfigOpen] = useState(false);

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

  const handleOrderClick = (order: any) => {
    if (order.status === 'production') {
      moveToReady(order.id);
    }
  };

  const handleExpedite = (orderNumber: string) => {
    expedite(orderNumber);
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
      description: "As configurações foram atualizadas com sucesso"
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
  
  const getSmartColumnCount = (fontSize: number) => {
    // Se a fonte for muito grande, usar 2 colunas, senão 3
    return fontSize >= 2.5 ? 2 : 3;
  };
  
  const columnWidths = getColumnWidths();

  return (
    <div 
      className="h-screen flex flex-col"
      style={{ backgroundColor: config.backgroundColor }}
    >
      <div className="flex-1 flex gap-0.5 p-1 pt-4">
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
              enabledModules={config.modules}
              cardConfig={{
                fontSize: config.production.cardConfig.fontSize,
                fontFamily: config.production.cardConfig.fontFamily,
                textColor: config.production.cardConfig.textColor,
                backgroundColor: config.production.cardConfig.backgroundColor
              }}
              smartColumns={getSmartColumnCount(config.production.cardConfig.fontSize)}
            />
          </div>
        )}

        {/* Coluna 2 - Prontos */}
        <div style={{ width: `${columnWidths.ready}%` }}>
          <div className="bg-white rounded-lg shadow-lg border border-gray-300 flex flex-col overflow-hidden h-full">
            {/* Header Fixo */}
            <div 
              className="bg-ready text-ready-foreground px-4 font-bold text-lg shadow-sm border-b flex items-center justify-between flex-shrink-0 rounded-t-lg"
              style={{ 
                backgroundColor: config.ready.headerBg, 
                color: config.ready.headerColor,
                height: `${config.ready.headerHeight}px`
              }}
            >
              <span>{config.ready.title}</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                {readyOrders.length + (lastOrderNumber && !config.lastOrder.highlight ? 0 : 1)}
              </span>
            </div>
            
            {/* Último Pedido Fixo */}
            {lastOrderNumber && config.lastOrder.highlight && (
              <div className="flex-shrink-0">
                <LastOrderDisplay
                  orderNumber={lastOrderNumber}
                  config={config.lastOrder}
                />
              </div>
            )}
            
            {/* Cards de Pedidos Prontos sem Scroll */}
            <div className="flex-1 bg-gray-50 p-2 overflow-hidden">
              <div 
                className="grid gap-1 h-full"
                style={{ 
                  gridTemplateColumns: `repeat(${getSmartColumnCount(config.ready.cardConfig.fontSize)}, 1fr)` 
                }}
              >
                {readyOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onClick={() => expedite(order.numeroPedido || order.number || '')}
                    className="flex-shrink-0"
                    showNickname={config.ready?.cardConfig?.showNickname ?? true}
                    showItems={config.ready?.cardConfig?.showItems ?? true}
                    enabledModules={config.modules}
                    fontSize={config.ready?.cardConfig?.fontSize}
                    fontFamily={config.ready?.cardConfig?.fontFamily}
                    textColor={config.ready?.cardConfig?.textColor}
                    backgroundColor={config.ready?.cardConfig?.backgroundColor}
                  />
                ))}
              </div>
              
              {readyOrders.length === 0 && !lastOrderNumber && (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <div className="text-center">
                    <div className="text-2xl mb-2">✅</div>
                    <p>Nenhum pedido pronto</p>
                  </div>
                </div>
              )}
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
            />
          </div>
        )}
      </div>

      {/* Painel de Controle Fixo */}
      <div className="flex-shrink-0" style={{ height: '22px' }}>
        <ControlPanel
          onConfigClick={() => setConfigOpen(true)}
          onExpedite={expedite}
          expeditionLog={expeditionLog}
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
