import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { PanelConfig } from '../types/order';
import { Settings, Palette, Factory, CheckCircle, Monitor, Volume2, Clock, Puzzle, Cog, X, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConfigurationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: PanelConfig;
  onConfigChange: (config: PanelConfig) => void;
  onSave: () => void;
  onCancel: () => void;
}

interface ConfigSectionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  colorClass?: string;
}

const ConfigSection = ({ title, icon, isOpen, onToggle, children, colorClass = "text-blue-600" }: ConfigSectionProps) => (
  <div className="border-b border-gray-200">
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-4 h-4", colorClass)}>
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-700">{title}</span>
      </div>
      {isOpen ? (
        <ChevronDown className="w-4 h-4 text-gray-400" />
      ) : (
        <ChevronRight className="w-4 h-4 text-gray-400" />
      )}
    </button>
    {isOpen && (
      <div className="px-6 pb-4 space-y-4 bg-gray-50">
        {children}
      </div>
    )}
  </div>
);

export const ConfigurationPanel = ({
  open,
  onOpenChange,
  config,
  onConfigChange,
  onSave,
  onCancel
}: ConfigurationPanelProps) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    background: false,
    production: false,
    ready: false,
    advertising: false,
    sounds: false,
    tts: false,
    autoExpedition: false,
    modules: false,
    cards: false
  });


  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateConfig = (path: string, value: any) => {
    const keys = path.split('.');
    const newConfig = { ...config };
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onConfigChange(newConfig);
  };


  if (!open) return null;

  return (
    <div 
      className="fixed top-0 right-0 w-[400px] h-full bg-white/95 backdrop-blur-sm shadow-xl z-50 flex flex-col border-l border-gray-200"
    >
        <div className="flex items-center justify-between p-3 border-b bg-gray-50/80">
          <h2 className="text-lg font-semibold">Configurações</h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
        {/* Fundo da Aplicação */}
        <ConfigSection
          title="Fundo da Aplicação"
          icon={<Palette className="w-4 h-4" />}
          isOpen={openSections.background}
          onToggle={() => toggleSection('background')}
          colorClass="text-purple-600"
        >
          <div>
            <Label className="text-sm font-medium">Cor de Fundo</Label>
            <Input
              type="color"
              value={config.backgroundColor}
              onChange={(e) => updateConfig('backgroundColor', e.target.value)}
              className="h-10 mt-1"
            />
          </div>
        </ConfigSection>

        {/* Coluna 1 - Produção */}
        <ConfigSection
          title="Coluna 1 - Produção"
          icon={<Factory className="w-4 h-4" />}
          isOpen={openSections.production}
          onToggle={() => toggleSection('production')}
          colorClass="text-blue-600"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Switch 
                checked={config.production.visible} 
                onCheckedChange={(checked) => updateConfig('production.visible', checked)}
                className="scale-75"
              />
              <Label className="text-sm">Exibir Coluna</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={config.production.showBorder || false} 
                onCheckedChange={(checked) => updateConfig('production.showBorder', checked)}
                className="scale-75"
              />
              <Label className="text-sm">Tem Borda</Label>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Título da Coluna</Label>
            <Input
              value={config.production.title}
              onChange={(e) => updateConfig('production.title', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Largura (%): {config.production.width}</Label>
            <Slider
              value={[config.production.width]}
              onValueChange={([value]) => updateConfig('production.width', value)}
              max={50}
              min={10}
              step={1}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Altura do Cabeçalho: {config.production.headerHeight}px</Label>
            <Slider
              value={[config.production.headerHeight]}
              onValueChange={([value]) => updateConfig('production.headerHeight', value)}
              max={180}
              min={32}
              step={4}
              className="mt-1"
            />
          </div>

          <div className="space-y-3 border-t pt-3">
            <Label className="text-sm font-medium">Configuração dos Cards - Produção</Label>
            
            <div>
              <Label className="text-xs">Tamanho da Fonte: {config.production.cardConfig.fontSize}rem</Label>
              <Slider
                value={[config.production.cardConfig.fontSize]}
              onValueChange={([value]) => updateConfig('production.cardConfig.fontSize', value)}
              max={8}
              min={0.5}
                step={0.1}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Família da Fonte</Label>
              <select
                value={config.production.cardConfig.fontFamily}
                onChange={(e) => updateConfig('production.cardConfig.fontFamily', e.target.value)}
                className="w-full mt-1 px-3 py-1 text-xs border border-gray-300 rounded-md bg-white"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Calibri">Calibri</option>
                <option value="Verdana">Verdana</option>
                <option value="Georgia">Georgia</option>
                <option value="Tahoma">Tahoma</option>
                <option value="Impact">Impact</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Cor da Fonte</Label>
                <Input
                  type="color"
                  value={config.production.cardConfig.textColor}
                  onChange={(e) => updateConfig('production.cardConfig.textColor', e.target.value)}
                  className="h-6 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Cor de Fundo</Label>
                <Input
                  type="color"
                  value={config.production.cardConfig.backgroundColor}
                  onChange={(e) => updateConfig('production.cardConfig.backgroundColor', e.target.value)}
                  className="h-6 mt-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Cor de Fundo</Label>
              <Input
                type="color"
                value={config.production.headerBg}
                onChange={(e) => updateConfig('production.headerBg', e.target.value)}
                className="h-8 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Cor da Fonte</Label>
              <Input
                type="color"
                value={config.production.headerColor}
                onChange={(e) => updateConfig('production.headerColor', e.target.value)}
                className="h-8 mt-1"
              />
            </div>
          </div>
        </ConfigSection>

        {/* Coluna 2 - Prontos */}
        <ConfigSection
          title="Coluna 2 - Prontos (Obrigatória)"
          icon={<CheckCircle className="w-4 h-4" />}
          isOpen={openSections.ready}
          onToggle={() => toggleSection('ready')}
          colorClass="text-green-600"
        >
          <div className="flex items-center gap-2">
            <Switch 
              checked={config.ready.showBorder || false} 
              onCheckedChange={(checked) => updateConfig('ready.showBorder', checked)}
              className="scale-75"
            />
            <Label className="text-sm">Tem Borda</Label>
          </div>

          <div>
            <Label className="text-sm font-medium">Título da Coluna</Label>
            <Input
              value={config.ready.title}
              onChange={(e) => updateConfig('ready.title', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Largura (%): {config.ready.width}</Label>
            <Slider
              value={[config.ready.width]}
              onValueChange={([value]) => updateConfig('ready.width', value)}
              max={60}
              min={10}
              step={1}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Altura do Cabeçalho: {config.ready.headerHeight}px</Label>
            <Slider
              value={[config.ready.headerHeight]}
              onValueChange={([value]) => updateConfig('ready.headerHeight', value)}
              max={180}
              min={32}
              step={4}
              className="mt-1"
            />
          </div>

          <div className="space-y-3 border-t pt-3">
            <Label className="text-sm font-medium">Configuração dos Cards - Prontos</Label>
            
            <div>
              <Label className="text-xs">Tamanho da Fonte: {config.ready.cardConfig.fontSize}rem</Label>
              <Slider
                value={[config.ready.cardConfig.fontSize]}
              onValueChange={([value]) => updateConfig('ready.cardConfig.fontSize', value)}
              max={8}
              min={0.5}
                step={0.1}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Família da Fonte</Label>
              <select
                value={config.ready.cardConfig.fontFamily}
                onChange={(e) => updateConfig('ready.cardConfig.fontFamily', e.target.value)}
                className="w-full mt-1 px-3 py-1 text-xs border border-gray-300 rounded-md bg-white"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Calibri">Calibri</option>
                <option value="Verdana">Verdana</option>
                <option value="Georgia">Georgia</option>
                <option value="Tahoma">Tahoma</option>
                <option value="Impact">Impact</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Cor da Fonte</Label>
                <Input
                  type="color"
                  value={config.ready.cardConfig.textColor}
                  onChange={(e) => updateConfig('ready.cardConfig.textColor', e.target.value)}
                  className="h-6 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Cor de Fundo</Label>
                <Input
                  type="color"
                  value={config.ready.cardConfig.backgroundColor}
                  onChange={(e) => updateConfig('ready.cardConfig.backgroundColor', e.target.value)}
                  className="h-6 mt-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Último Pedido</Label>
            <div>
              <Label className="text-xs">Altura: {config.lastOrder.height}px</Label>
              <Slider
                value={[config.lastOrder.height]}
                onValueChange={([value]) => updateConfig('lastOrder.height', value)}
                max={360}
                min={40}
                step={10}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Tamanho da Fonte: {config.lastOrder.fontSize}rem</Label>
              <Slider
                value={[config.lastOrder.fontSize]}
                onValueChange={([value]) => updateConfig('lastOrder.fontSize', value)}
                max={30}
                min={1}
                step={0.5}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Família da Fonte</Label>
              <select
                value={config.lastOrder.fontFamily || 'Arial'}
                onChange={(e) => updateConfig('lastOrder.fontFamily', e.target.value)}
                className="w-full mt-1 px-3 py-1 text-xs border border-gray-300 rounded-md bg-white"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Calibri">Calibri</option>
                <option value="Verdana">Verdana</option>
                <option value="Georgia">Georgia</option>
                <option value="Tahoma">Tahoma</option>
                <option value="Impact">Impact</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Cor da Fonte</Label>
                <Input
                  type="color"
                  value={config.lastOrder.textColor || '#000000'}
                  onChange={(e) => updateConfig('lastOrder.textColor', e.target.value)}
                  className="h-6 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Cor de Fundo</Label>
                <Input
                  type="color"
                  value={config.lastOrder.backgroundColor || '#ffffff'}
                  onChange={(e) => updateConfig('lastOrder.backgroundColor', e.target.value)}
                  className="h-6 mt-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.lastOrder.pulseAnimation}
                  onCheckedChange={(checked) => updateConfig('lastOrder.pulseAnimation', checked)}
                />
                <Label className="text-xs">Animação Pulsante</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.lastOrder.highlight}
                  onCheckedChange={(checked) => updateConfig('lastOrder.highlight', checked)}
                />
                <Label className="text-xs">Destacar Último Pedido</Label>
              </div>
            </div>
          </div>
        </ConfigSection>

        {/* Coluna 3 - Publicidade */}
        <ConfigSection
          title="Coluna 3 - Publicidade"
          icon={<Monitor className="w-4 h-4" />}
          isOpen={openSections.advertising}
          onToggle={() => toggleSection('advertising')}
          colorClass="text-cyan-600"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Switch 
                checked={config.advertising.visible} 
                onCheckedChange={(checked) => updateConfig('advertising.visible', checked)}
                className="scale-75"
              />
              <Label className="text-sm">Exibir Coluna</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={config.advertising.showBorder || false} 
                onCheckedChange={(checked) => updateConfig('advertising.showBorder', checked)}
                className="scale-75"
              />
              <Label className="text-sm">Tem Borda</Label>
            </div>
          </div>

            <div>
              <Label className="text-sm font-medium">Largura (%): {config.advertising.width}</Label>
              <Slider
                value={[config.advertising.width]}
                onValueChange={([value]) => updateConfig('advertising.width', value)}
                max={50}
                min={10}
                step={1}
                className="mt-1"
              />
            </div>

          <div>
            <Label className="text-sm font-medium">Altura do Cabeçalho: {config.advertising.headerHeight}px</Label>
            <Slider
              value={[config.advertising.headerHeight]}
              onValueChange={([value]) => updateConfig('advertising.headerHeight', value)}
              max={180}
              min={32}
              step={4}
              className="mt-1"
            />
            <div className="text-xs text-gray-500 mt-1">
              Dimensões sugeridas: {Math.round((window.innerWidth || 1920) * config.advertising.width / 100)} x {Math.round((window.innerHeight || 1080) * 0.6)}px
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">URL ou Path da Imagem</Label>
            <Input
              value={config.advertising.imageUrl || ''}
              onChange={(e) => updateConfig('advertising.imageUrl', e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg ou /assets/imagem.jpg"
              className="mt-1 text-sm"
            />
          </div>
        </ConfigSection>

        {/* Efeitos Sonoros */}
        <ConfigSection
          title="Efeitos Sonoros"
          icon={<Volume2 className="w-4 h-4" />}
          isOpen={openSections.sounds}
          onToggle={() => toggleSection('sounds')}
          colorClass="text-yellow-600"
        >
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.sounds.production}
              onCheckedChange={(checked) => updateConfig('sounds.production', checked)}
            />
            <Label className="text-sm">Som para Produção</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.sounds.ready}
              onCheckedChange={(checked) => updateConfig('sounds.ready', checked)}
            />
            <Label className="text-sm">Som para Pronto</Label>
          </div>
        </ConfigSection>

        {/* Auto Expedição */}
        <ConfigSection
          title="Auto Expedição"
          icon={<Clock className="w-4 h-4" />}
          isOpen={openSections.autoExpedition}
          onToggle={() => toggleSection('autoExpedition')}
          colorClass="text-orange-600"
        >
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.autoExpedition.enabled}
              onCheckedChange={(checked) => updateConfig('autoExpedition.enabled', checked)}
            />
            <Label className="text-sm">Utilizar Auto Expedição</Label>
          </div>
          <div>
            <Label className="text-sm font-medium">Após quantos minutos: {config.autoExpedition.minutes}</Label>
            <Slider
              value={[config.autoExpedition.minutes]}
              onValueChange={([value]) => updateConfig('autoExpedition.minutes', value)}
              max={60}
              min={1}
              step={1}
              className="mt-1"
            />
          </div>
        </ConfigSection>

        {/* Text-to-Speech */}
        <ConfigSection
          title="Controle de Voz"
          icon={<div className="w-4 h-4 bg-current rounded-full opacity-60" />}
          isOpen={openSections.tts}
          onToggle={() => toggleSection('tts')}
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.textToSpeech.enabled}
                onCheckedChange={(checked) => updateConfig('textToSpeech.enabled', checked)}
              />
              <Label className="text-xs">Ativar Voz</Label>
            </div>
            
            {config.textToSpeech.enabled && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Volume</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[config.textToSpeech.volume || 0.8]}
                      onValueChange={(value) => updateConfig('textToSpeech.volume', value[0])}
                      min={0}
                      max={1}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-8">
                      {Math.round((config.textToSpeech.volume || 0.8) * 100)}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Velocidade</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[config.textToSpeech.rate || 1]}
                      onValueChange={(value) => updateConfig('textToSpeech.rate', value[0])}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-8">
                      {config.textToSpeech.rate || 1}x
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </ConfigSection>

        {/* Módulos */}
        <ConfigSection
          title="Módulos"
          icon={<Puzzle className="w-4 h-4" />}
          isOpen={openSections.modules}
          onToggle={() => toggleSection('modules')}
          colorClass="text-indigo-600"
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.modules.balcao}
                onCheckedChange={(checked) => updateConfig('modules.balcao', checked)}
              />
              <Label className="text-xs">Balcão</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.modules.mesa}
                onCheckedChange={(checked) => updateConfig('modules.mesa', checked)}
              />
              <Label className="text-xs">Mesa</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.modules.entrega}
                onCheckedChange={(checked) => updateConfig('modules.entrega', checked)}
              />
              <Label className="text-xs">Entrega</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.modules.ficha}
                onCheckedChange={(checked) => updateConfig('modules.ficha', checked)}
              />
              <Label className="text-xs">Ficha</Label>
            </div>
          </div>
        </ConfigSection>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/80">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Fechar
            </Button>
            <Button onClick={onSave} className="flex-1">
              Salvar
            </Button>
          </div>
        </div>
      </div>
    );
};