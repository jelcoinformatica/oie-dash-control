import { useState, useEffect } from 'react';
import { useOrders } from '../hooks/useOrders';
import { OrderColumn } from '../components/OrderColumn';
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
    refresh,
    startSimulation,
    stopSimulation,
    isSimulationActive
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
          cards: { ...defaultConfig.cards, ...parsedConfig.cards },
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

  const handleToggleSimulation = () => {
    if (isSimulationActive) {
      stopSimulation();
    } else {
      startSimulation();
    }
  };

  return (
    <div 
      className="h-screen flex flex-col"
      style={{ backgroundColor: config.backgroundColor }}
    >
      <div className="flex-1 flex overflow-hidden">
        {/* Coluna Produção */}
        {config.production.visible && (
          <div 
            className="border-r flex flex-col"
            style={{ 
              width: `${config.production.width}%`,
              backgroundColor: config.production.headerBg // Adiciona cor de fundo aqui
            }}
          >
            <OrderColumn
              title={config.production.title}
              orders={productionOrders}
              onOrderClick={handleOrderClick}
              variant="production"
              showNickname={config.cards?.showNickname ?? true}
              showItems={config.cards?.showItems ?? true}
            />
          </div>
        )}

        {/* Coluna Prontos */}
        {config.ready.visible && (
          <div 
            className="border-r flex flex-col"
            style={{
              width: `${config.ready.width}%`,
              backgroundColor: config.ready.headerBg // Adiciona cor de fundo aqui
            }}
          >
            {/* Header Fixo */}
            <div 
              className="bg-ready text-ready-foreground px-4 py-3 font-bold text-lg shadow-sm border-b flex items-center justify-between flex-shrink-0"
              style={{ backgroundColor: config.ready.headerBg, color: config.ready.headerColor }}
            >
              <span>{config.ready.title}</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                {readyOrders.length}
              </span>
            </div>
            
            {/* Último Pedido Fixo */}
            {lastOrderNumber && config.lastOrder.highlight && (
              <div 
                className="flex-shrink-0"
                style={{ backgroundColor: config.lastOrder.backgroundColor, color: config.lastOrder.textColor, fontSize: `${config.lastOrder.fontSize}rem` }}
              >
                <LastOrderDisplay
                  orderNumber={lastOrderNumber}
                  animate={config.lastOrder.pulseAnimation}
                  className={`min-h-[${config.lastOrder.height}px]`}
                />
              </div>
            )}
            
            {/* Cards de Pedidos Prontos com Scroll */}
            <div className="flex-1 bg-ready-light/50 p-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {readyOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-order-card border border-order-card-border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] animate-card-appear min-h-[120px]"
                    style={{
                      backgroundColor: config.ready.cardConfig.backgroundColor,
                      color: config.ready.cardConfig.textColor,
                      fontFamily: config.ready.cardConfig.fontFamily,
                      fontSize: `${config.ready.cardConfig.fontSize}rem`
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-order-card-foreground">
                          #{order.number}
                        </span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          order.module === 'balcao' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          order.module === 'mesa' ? 'bg-green-100 text-green-800 border-green-200' :
                          order.module === 'entrega' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                          'bg-purple-100 text-purple-800 border-purple-200'
                        }`}>
                          {order.module === 'balcao' ? 'Balcão' :
                           order.module === 'mesa' ? 'Mesa' :
                           order.module === 'entrega' ? 'Entrega' : 'Ficha'}
                        </div>
                      </div>
                    </div>
                    
                    {config.cards?.showNickname && order.nickname && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-order-card-foreground">
                          {order.nickname}
                        </span>
                      </div>
                    )}
                    
                    {config.cards?.showItems && (
                      <div className="text-xs text-muted-foreground mb-2">
                        {order.items.slice(0, 2).join(', ')}
                        {order.items.length > 2 && ` +${order.items.length - 2} mais`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {readyOrders.length === 0 && (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <div className="text-center">
                    <div className="text-2xl mb-2">✅</div>
                    <p>Nenhum pedido pronto</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Coluna Publicidade */}
        {config.advertising.visible && (
          <div 
            className="flex-1 flex flex-col"
            style={{ 
              width: `${config.advertising.width}%`,
              backgroundColor: config.advertising.backgroundColor // Adiciona cor de fundo aqui
            }}
          >
            <AdvertisingColumn
              title={config.advertising.headerTitle}
              imageUrl={config.advertising.imageUrl}
              showHeader={config.advertising.headerVisible}
            />
          </div>
        )}
      </div>

      {/* Painel de Controle Fixo */}
      <div className="flex-shrink-0">
        <ControlPanel
          onConfigClick={() => setConfigOpen(true)}
          onExpedite={handleExpedite}
          onRefresh={refresh}
          loading={loading}
          onToggleSimulation={handleToggleSimulation}
          isSimulationActive={isSimulationActive}
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
