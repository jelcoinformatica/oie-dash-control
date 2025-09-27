import React, { useState } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { PanelConfig } from '../types/order';
import { Settings, X, Move3D, ArrowUpDown, ArrowLeftRight, Target, Monitor } from 'lucide-react';

interface OverlayControlsProps {
  config: PanelConfig;
  onConfigChange: (config: PanelConfig) => void;
  visible: boolean;
  onToggle: () => void;
}

export const OverlayControls = ({ config, onConfigChange, visible, onToggle }: OverlayControlsProps) => {
  const [activeControl, setActiveControl] = useState<string | null>(null);

  const updateConfig = (newConfig: Partial<PanelConfig>) => {
    onConfigChange({ ...config, ...newConfig });
  };

  const controlButtons = [
    // Primeira linha - Cabeçalhos
    {
      id: 'headers',
      label: 'Cabeçalhos',
      icon: <Monitor className="w-4 h-4" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      fullWidth: true
    },
    // Segunda linha - Col 1; col 2
    {
      id: 'col1',
      label: 'Coluna 1',
      icon: <ArrowUpDown className="w-4 h-4" />,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'col2',
      label: 'Coluna 2',
      icon: <ArrowUpDown className="w-4 h-4" />,
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    // Terceira linha - Ultimo pedido
    {
      id: 'last-order',
      label: 'Último Pedido',
      icon: <Target className="w-4 h-4" />,
      color: 'bg-orange-500 hover:bg-orange-600',
      fullWidth: true
    }
  ];

  if (!visible) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={onToggle}
          variant="secondary"
          size="sm"
          className="bg-white/90 hover:bg-white shadow-lg border"
        >
          <Move3D className="w-4 h-4" />
          <span className="ml-2">Controles</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Controles principais */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Move3D className="w-4 h-4" />
              Controles Diretos
            </h3>
            <Button
              onClick={onToggle}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {/* Primeira linha - Cabeçalhos */}
            <div className="grid grid-cols-1 gap-2">
              {controlButtons.filter(btn => btn.id === 'headers').map((button) => (
                <Button
                  key={button.id}
                  onClick={() => setActiveControl(activeControl === button.id ? null : button.id)}
                  variant={activeControl === button.id ? "default" : "outline"}
                  size="sm"
                  className={`text-xs ${activeControl === button.id ? button.color : ''}`}
                >
                  {button.icon}
                  <span className="ml-1">{button.label}</span>
                </Button>
              ))}
            </div>

            {/* Segunda linha - Col 1; col 2 */}
            <div className="grid grid-cols-2 gap-2">
              {controlButtons.filter(btn => ['col1', 'col2'].includes(btn.id)).map((button) => (
                <Button
                  key={button.id}
                  onClick={() => setActiveControl(activeControl === button.id ? null : button.id)}
                  variant={activeControl === button.id ? "default" : "outline"}
                  size="sm"
                  className={`text-xs ${activeControl === button.id ? button.color : ''}`}
                >
                  {button.icon}
                  <span className="ml-1">{button.label}</span>
                </Button>
              ))}
            </div>

            {/* Terceira linha - Ultimo pedido */}
            <div className="grid grid-cols-1 gap-2">
              {controlButtons.filter(btn => btn.id === 'last-order').map((button) => (
                <Button
                  key={button.id}
                  onClick={() => setActiveControl(activeControl === button.id ? null : button.id)}
                  variant={activeControl === button.id ? "default" : "outline"}
                  size="sm"
                  className={`text-xs ${activeControl === button.id ? button.color : ''}`}
                >
                  {button.icon}
                  <span className="ml-1">{button.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Painel de controle ativo */}
      {activeControl && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border p-4 min-w-80">
            
            {activeControl === 'headers' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Altura dos Cabeçalhos
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Altura: {config.production.headerHeight}px</Label>
                    <Slider
                      value={[config.production.headerHeight]}
                      onValueChange={([value]) => {
                        updateConfig({
                          production: { ...config.production, headerHeight: value },
                          ready: { ...config.ready, headerHeight: value },
                          advertising: { ...config.advertising, headerHeight: value }
                        });
                      }}
                      min={40}
                      max={120}
                      step={4}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeControl === 'col1' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-green-600" />
                  Coluna 1 - Em Produção
                </h4>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">Colunas</h5>
                    <div>
                      <Label className="text-sm">Quantidade: {config.production.cardConfig.columns} colunas</Label>
                      <Slider
                        value={[config.production.cardConfig.columns]}
                        onValueChange={([value]) => {
                          updateConfig({
                            production: { 
                              ...config.production, 
                              cardConfig: { ...config.production.cardConfig, columns: value }
                            }
                          });
                        }}
                        min={1}
                        max={3}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">Layout Vertical</h5>
                    <div>
                      <Label className="text-sm">Gap Vertical: {config.production.cardConfig.gapVertical}px</Label>
                      <Slider
                        value={[config.production.cardConfig.gapVertical || 4]}
                        onValueChange={([value]) => {
                          updateConfig({
                            production: { 
                              ...config.production, 
                              cardConfig: { ...config.production.cardConfig, gapVertical: value }
                            }
                          });
                        }}
                        min={0}
                        max={20}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Altura do Card: {config.production.cardConfig.cardMinHeight}px</Label>
                      <Slider
                        value={[config.production.cardConfig.cardMinHeight]}
                        onValueChange={([value]) => {
                          updateConfig({
                            production: { 
                              ...config.production, 
                              cardConfig: { 
                                ...config.production.cardConfig, 
                                cardMinHeight: value,
                                cardMaxHeight: Math.max(value, config.production.cardConfig.cardMaxHeight)
                              }
                            }
                          });
                        }}
                        min={40}
                        max={200}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">Layout Horizontal</h5>
                    <div>
                      <Label className="text-sm">Gap Horizontal: {config.production.cardConfig.gapHorizontal}px</Label>
                      <Slider
                        value={[config.production.cardConfig.gapHorizontal || 4]}
                        onValueChange={([value]) => {
                          updateConfig({
                            production: { 
                              ...config.production, 
                              cardConfig: { ...config.production.cardConfig, gapHorizontal: value }
                            }
                          });
                        }}
                        min={0}
                        max={20}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Largura do Card: {config.production.cardConfig.cardWidth || 200}px</Label>
                      <Slider
                        value={[config.production.cardConfig.cardWidth || 200]}
                        onValueChange={([value]) => {
                          updateConfig({
                            production: { 
                              ...config.production, 
                              cardConfig: { ...config.production.cardConfig, cardWidth: value }
                            }
                          });
                        }}
                        min={120}
                        max={400}
                        step={10}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">Tipografia</h5>
                    <div>
                      <Label className="text-sm">Tamanho da Fonte: {config.production.cardConfig.fontSize}</Label>
                      <Slider
                        value={[config.production.cardConfig.fontSize]}
                        onValueChange={([value]) => {
                          updateConfig({
                            production: { 
                              ...config.production, 
                              cardConfig: { ...config.production.cardConfig, fontSize: value }
                            }
                          });
                        }}
                        min={1.5}
                        max={6}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeControl === 'col2' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-indigo-600" />
                  Coluna 2 - Prontos
                </h4>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">Colunas</h5>
                    <div>
                      <Label className="text-sm">Quantidade: {config.ready.cardConfig.columns} colunas</Label>
                      <Slider
                        value={[config.ready.cardConfig.columns]}
                        onValueChange={([value]) => {
                          updateConfig({
                            ready: { 
                              ...config.ready, 
                              cardConfig: { ...config.ready.cardConfig, columns: value }
                            }
                          });
                        }}
                        min={3}
                        max={8}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">Layout Vertical</h5>
                    <div>
                      <Label className="text-sm">Gap Vertical: {config.ready.cardConfig.gapVertical}px</Label>
                      <Slider
                        value={[config.ready.cardConfig.gapVertical || 4]}
                        onValueChange={([value]) => {
                          updateConfig({
                            ready: { 
                              ...config.ready, 
                              cardConfig: { ...config.ready.cardConfig, gapVertical: value }
                            }
                          });
                        }}
                        min={0}
                        max={20}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Altura do Card: {config.ready.cardConfig.cardMinHeight}px</Label>
                      <Slider
                        value={[config.ready.cardConfig.cardMinHeight]}
                        onValueChange={([value]) => {
                          updateConfig({
                            ready: { 
                              ...config.ready, 
                              cardConfig: { 
                                ...config.ready.cardConfig, 
                                cardMinHeight: value,
                                cardMaxHeight: Math.max(value, config.ready.cardConfig.cardMaxHeight)
                              }
                            }
                          });
                        }}
                        min={40}
                        max={200}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">Layout Horizontal</h5>
                    <div>
                      <Label className="text-sm">Gap Horizontal: {config.ready.cardConfig.gapHorizontal}px</Label>
                      <Slider
                        value={[config.ready.cardConfig.gapHorizontal || 4]}
                        onValueChange={([value]) => {
                          updateConfig({
                            ready: { 
                              ...config.ready, 
                              cardConfig: { ...config.ready.cardConfig, gapHorizontal: value }
                            }
                          });
                        }}
                        min={0}
                        max={20}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Largura do Card: {config.ready.cardConfig.cardWidth || 200}px</Label>
                      <Slider
                        value={[config.ready.cardConfig.cardWidth || 200]}
                        onValueChange={([value]) => {
                          updateConfig({
                            ready: { 
                              ...config.ready, 
                              cardConfig: { ...config.ready.cardConfig, cardWidth: value }
                            }
                          });
                        }}
                        min={120}
                        max={400}
                        step={10}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">Tipografia</h5>
                    <div>
                      <Label className="text-sm">Tamanho da Fonte: {config.ready.cardConfig.fontSize}</Label>
                      <Slider
                        value={[config.ready.cardConfig.fontSize]}
                        onValueChange={([value]) => {
                          updateConfig({
                            ready: { 
                              ...config.ready, 
                              cardConfig: { ...config.ready.cardConfig, fontSize: value }
                            }
                          });
                        }}
                        min={1.5}
                        max={6}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeControl === 'last-order' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Último Pedido
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Altura: {config.lastOrder.height}px</Label>
                    <Slider
                      value={[config.lastOrder.height]}
                      onValueChange={([value]) => {
                        updateConfig({
                          lastOrder: { ...config.lastOrder, height: value }
                        });
                      }}
                      min={50}
                      max={500}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Tamanho da Fonte: {config.lastOrder.fontSize}</Label>
                    <Slider
                      value={[config.lastOrder.fontSize]}
                      onValueChange={([value]) => {
                        updateConfig({
                          lastOrder: { ...config.lastOrder, fontSize: value }
                        });
                      }}
                      min={2}
                      max={20}
                      step={0.2}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button
                onClick={() => setActiveControl(null)}
                variant="outline"
                size="sm"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};