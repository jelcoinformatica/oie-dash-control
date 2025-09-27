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
    // Segunda linha - Col 1 vertical; col 2 vertical
    {
      id: 'col1-vertical',
      label: 'Col1 Vertical',
      icon: <ArrowUpDown className="w-4 h-4" />,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'col2-vertical',
      label: 'Col2 Vertical',
      icon: <ArrowUpDown className="w-4 h-4" />,
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    // Terceira linha - Col 1 horizontal; Col2 horizontal
    {
      id: 'col1-horizontal',
      label: 'Col1 Horizontal',
      icon: <ArrowLeftRight className="w-4 h-4" />,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'col2-horizontal',
      label: 'Col2 Horizontal',
      icon: <ArrowLeftRight className="w-4 h-4" />,
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    // Quarta linha - Ultimo pedido (abaixo de Col2 horizontal)
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

            {/* Segunda linha - Col 1 vertical; col 2 vertical */}
            <div className="grid grid-cols-2 gap-2">
              {controlButtons.filter(btn => ['col1-vertical', 'col2-vertical'].includes(btn.id)).map((button) => (
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

            {/* Terceira linha - Col 1 horizontal; Col2 horizontal */}
            <div className="grid grid-cols-2 gap-2">
              {controlButtons.filter(btn => ['col1-horizontal', 'col2-horizontal'].includes(btn.id)).map((button) => (
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

            {/* Quarta linha - Ultimo pedido */}
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

            {activeControl === 'col1-vertical' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-green-600" />
                  Coluna 1 - Vertical & Fonte
                </h4>
                <div className="space-y-3">
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
            )}

            {activeControl === 'col1-horizontal' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-green-600" />
                  Coluna 1 - Horizontal
                </h4>
                <div className="space-y-3">
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
                </div>
              </div>
            )}

            {activeControl === 'col2-vertical' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-indigo-600" />
                  Coluna 2 - Vertical & Fonte
                </h4>
                <div className="space-y-3">
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
            )}

            {activeControl === 'col2-horizontal' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
                  Coluna 2 - Horizontal
                </h4>
                <div className="space-y-3">
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