import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { PanelConfig } from '../types/order';
import { Settings, Palette, Factory, CheckCircle, Monitor, Volume2, Clock, Puzzle, Cog, X, ChevronRight, ChevronDown, Plus, Minus } from 'lucide-react';
import { cn } from '../lib/utils';
import { defaultConfig } from '../data/defaultConfig';
import { toast } from '../hooks/use-toast';

interface ConfigurationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: PanelConfig;
  onConfigChange: (config: PanelConfig) => void;
  onSave: () => void;
  onCancel: () => void;
  clearAllOrders?: () => void;
  generateOrders?: (count: number) => void;
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
  <div className="border-b-2 border-gray-300 shadow-sm">
    <button
      onClick={onToggle}
      className={cn(
        "w-full px-4 py-4 flex items-center justify-between transition-all duration-200",
        isOpen 
          ? "bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg border-l-4 border-blue-400" 
          : "bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-5 h-5", colorClass)}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-gray-800">{title}</span>
      </div>
      {isOpen ? (
        <ChevronDown className="w-5 h-5 text-gray-600" />
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-600" />
      )}
    </button>
    {isOpen && (
      <div className="px-6 pb-6 pt-4 space-y-4 bg-gradient-to-b from-blue-25 to-white border-t border-blue-200 shadow-inner">
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
  onCancel,
  clearAllOrders,
  generateOrders
}: ConfigurationPanelProps) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    background: false,
    production: false,
    ready: false,
    lastOrder: false,
    advertising: false,
    sounds: false,
    tts: true, // Deixar aberto por padrão para facilitar encontrar as opções
    autoExpedition: false,
    modules: false,
    cards: false,
    diversos: false,
    simulation: false
  });

  const [showClearDialog, setShowClearDialog] = useState(false);

  const toggleAllSections = () => {
    const allOpen = Object.values(openSections).every(Boolean);
    const newState = !allOpen;
    setOpenSections({
      background: newState,
      production: newState,
      ready: newState,
      lastOrder: newState,
      advertising: newState,
      sounds: newState,
      tts: newState,
      autoExpedition: newState,
      modules: newState,
      cards: newState,
      diversos: newState,
      simulation: newState
    });
  };


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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAllSections}
              className="h-6 w-6 p-0"
              title={Object.values(openSections).every(Boolean) ? "Colapsar todas" : "Expandir todas"}
            >
              {Object.values(openSections).every(Boolean) ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
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
              className="h-12 mt-1 border-2"
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

          <div>
            <Label className="text-sm font-medium">Tamanho da Fonte do Cabeçalho: {config.production.headerFontSize}rem</Label>
            <Slider
              value={[config.production.headerFontSize]}
              onValueChange={([value]) => updateConfig('production.headerFontSize', value)}
              max={3}
              min={0.8}
              step={0.1}
              className="mt-1"
            />
          </div>

            <div className="space-y-3 border-t pt-3">
            <Label className="text-sm font-medium">Configuração dos Cards - Produção</Label>
            
            <div>
              <Label className="text-xs">Colunas: {config.production.cardConfig.columns}</Label>
              <Slider
                value={[config.production.cardConfig.columns]}
                onValueChange={([value]) => updateConfig('production.cardConfig.columns', value)}
                max={5}
                min={2}
                step={1}
                className="mt-1"
              />
            </div>
            
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
                  className="h-10 mt-1 border-2"
                />
              </div>
              <div>
                <Label className="text-xs">Cor de Fundo</Label>
                <Input
                  type="color"
                  value={config.production.cardConfig.backgroundColor}
                  onChange={(e) => updateConfig('production.cardConfig.backgroundColor', e.target.value)}
                  className="h-10 mt-1 border-2"
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
                  className="h-12 mt-1 border-2"
                />
              </div>
              <div>
                <Label className="text-xs">Cor da Fonte</Label>
                <Input
                  type="color"
                  value={config.production.headerColor}
                  onChange={(e) => updateConfig('production.headerColor', e.target.value)}
                  className="h-12 mt-1 border-2"
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

          <div>
            <Label className="text-sm font-medium">Tamanho da Fonte do Cabeçalho: {config.ready.headerFontSize}rem</Label>
            <Slider
              value={[config.ready.headerFontSize]}
              onValueChange={([value]) => updateConfig('ready.headerFontSize', value)}
              max={3}
              min={0.8}
              step={0.1}
              className="mt-1"
            />
          </div>

          <div className="space-y-3 border-t pt-3">
            <Label className="text-sm font-medium">Configuração dos Cards - Prontos</Label>
            
            <div>
              <Label className="text-xs">Colunas: {config.ready.cardConfig.columns}</Label>
              <Slider
                value={[config.ready.cardConfig.columns]}
                onValueChange={([value]) => updateConfig('ready.cardConfig.columns', value)}
                max={5}
                min={2}
                step={1}
                className="mt-1"
              />
            </div>
            
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
                  className="h-10 mt-1 border-2"
                />
              </div>
              <div>
                <Label className="text-xs">Cor de Fundo</Label>
                <Input
                  type="color"
                  value={config.ready.cardConfig.backgroundColor}
                  onChange={(e) => updateConfig('ready.cardConfig.backgroundColor', e.target.value)}
                  className="h-10 mt-1 border-2"
                />
              </div>
            </div>
          </div>

        </ConfigSection>

        {/* Último Pedido */}
        <ConfigSection
          title="Último Pedido"
          icon={<Monitor className="w-4 h-4" />}
          isOpen={openSections.lastOrder}
          onToggle={() => toggleSection('lastOrder')}
          colorClass="text-amber-600"
        >
          <div>
            <Label className="text-sm font-medium">Altura: {config.lastOrder.height}px</Label>
            <Slider
              value={[config.lastOrder.height]}
              onValueChange={([value]) => updateConfig('lastOrder.height', value)}
              max={360}
              min={40}
              step={10}
              className="mt-1 h-3"
              style={{
                '--tw-bg-opacity': '1',
                background: `linear-gradient(to right, ${config.lastOrder.backgroundColor} 0%, ${config.lastOrder.backgroundColor} 100%)`
              } as React.CSSProperties}
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium">Tamanho da Fonte: {config.lastOrder.fontSize}rem</Label>
            <Slider
              value={[config.lastOrder.fontSize]}
              onValueChange={([value]) => updateConfig('lastOrder.fontSize', value)}
              max={30}
              min={1}
              step={0.5}
              className="mt-1 h-3"
              style={{
                '--tw-bg-opacity': '1',
                background: `linear-gradient(to right, ${config.lastOrder.textColor || '#000000'} 0%, ${config.lastOrder.textColor || '#000000'} 100%)`
              } as React.CSSProperties}
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Família da Fonte</Label>
            <select
              value={config.lastOrder.fontFamily || 'Arial'}
              onChange={(e) => updateConfig('lastOrder.fontFamily', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white"
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
              <Label className="text-sm font-medium">Cor da Fonte</Label>
              <Input
                type="color"
                value={config.lastOrder.textColor || '#000000'}
                onChange={(e) => updateConfig('lastOrder.textColor', e.target.value)}
                className="h-12 mt-1 border-2"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Cor de Fundo</Label>
              <Input
                type="color"
                value={config.lastOrder.backgroundColor || '#ffffff'}
                onChange={(e) => updateConfig('lastOrder.backgroundColor', e.target.value)}
                className="h-12 mt-1 border-2"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.lastOrder.pulseAnimation}
                onCheckedChange={(checked) => updateConfig('lastOrder.pulseAnimation', checked)}
                className="scale-75"
              />
              <Label className="text-sm">Animação Pulsante</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.lastOrder.highlight}
                onCheckedChange={(checked) => updateConfig('lastOrder.highlight', checked)}
                className="scale-75"
              />
              <Label className="text-sm">Destacar Último Pedido</Label>
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
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.sounds.production}
                  onCheckedChange={(checked) => updateConfig('sounds.production', checked)}
                  className="scale-75"
                />
                <Label className="text-sm">Som para Produção</Label>
              </div>
              
              {config.sounds.production && (
                <div className="ml-6 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          updateConfig('sounds.productionFile', url);
                        }
                      }}
                      className="text-xs bg-muted hover:bg-background border-2 border-dashed"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (config.sounds.productionFile) {
                          const audio = new Audio(config.sounds.productionFile);
                          audio.play();
                        }
                      }}
                      disabled={!config.sounds.productionFile}
                    >
                      Testar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.sounds.ready}
                  onCheckedChange={(checked) => updateConfig('sounds.ready', checked)}
                  className="scale-75"
                />
                <Label className="text-sm">Som para Pronto</Label>
              </div>
              
              {config.sounds.ready && (
                <div className="ml-6 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          updateConfig('sounds.readyFile', url);
                        }
                      }}
                      className="text-xs bg-muted hover:bg-background border-2 border-dashed"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (config.sounds.readyFile) {
                          const audio = new Audio(config.sounds.readyFile);
                          audio.play();
                        }
                      }}
                      disabled={!config.sounds.readyFile}
                    >
                      Testar
                    </Button>
                  </div>
                </div>
              )}
            </div>
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
              className="scale-75"
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
                className="scale-75"
              />
              <Label className="text-sm">Ativar Voz</Label>
            </div>
            
            {config.textToSpeech.enabled && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Tipo de Voz</Label>
                  <Select value={config.textToSpeech.voice || 'auto'} onValueChange={(value) => updateConfig('textToSpeech.voice', value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Automática (Português-BR)</SelectItem>
                      <SelectItem value="Microsoft Maria">Maria (Feminino)</SelectItem>
                      <SelectItem value="Microsoft Heloisa">Heloísa (Feminino)</SelectItem>
                      <SelectItem value="Microsoft Daniel">Daniel (Masculino)</SelectItem>
                      <SelectItem value="Google português">Google Português (Masculino)</SelectItem>
                      <SelectItem value="Google português do Brasil">Google Português BR (Feminino)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Tipo de Mensagem</Label>
                  <Select value={config.textToSpeech.textType || 'name_ready'} onValueChange={(value) => updateConfig('textToSpeech.textType', value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="number_only">Só Número</SelectItem>
                      <SelectItem value="name_ready">[Nome], seu pedido está pronto!</SelectItem>
                      <SelectItem value="order_ready">O pedido [número] está pronto.</SelectItem>
                      <SelectItem value="name_order_ready">[Nome], o pedido [número] está pronto!</SelectItem>
                      <SelectItem value="custom">Texto Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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

                {config.textToSpeech.textType === 'custom' && (
                  <div className="space-y-2">
                    <Label className="text-xs">Texto Personalizado</Label>
                    <Input
                      value={config.textToSpeech.customText || ''}
                      onChange={(e) => updateConfig('textToSpeech.customText', e.target.value)}
                      placeholder="Digite o texto personalizado..."
                      className="h-8"
                    />
                  </div>
                )}

                {/* Configurações de Repetição */}
                <div className="space-y-4 pt-2 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.textToSpeech.repeatEnabled || false}
                      onCheckedChange={(checked) => updateConfig('textToSpeech.repeatEnabled', checked)}
                      className="scale-75"
                    />
                    <Label className="text-sm">Repetir fala</Label>
                  </div>

                  {config.textToSpeech.repeatEnabled && (
                    <div className="grid grid-cols-2 gap-4 ml-4">
                      <div className="space-y-1">
                        <Label className="text-sm">Repetições</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={config.textToSpeech.repeatCount || 2}
                          onChange={(e) => updateConfig('textToSpeech.repeatCount', parseInt(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Intervalo (s)</Label>
                        <Input
                          type="number"
                          min="5"
                          max="60"
                          value={config.textToSpeech.repeatInterval || 15}
                          onChange={(e) => updateConfig('textToSpeech.repeatInterval', parseInt(e.target.value))}
                          className="h-8"
                        />
                      </div>
                    </div>
                  )}
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
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.modules.balcao}
                onCheckedChange={(checked) => updateConfig('modules.balcao', checked)}
                className="scale-75"
              />
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <Label className="text-sm">Balcão</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.modules.mesa}
                onCheckedChange={(checked) => updateConfig('modules.mesa', checked)}
                className="scale-75"
              />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <Label className="text-sm">Mesa</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.modules.entrega}
                onCheckedChange={(checked) => updateConfig('modules.entrega', checked)}
                className="scale-75"
              />
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
              <Label className="text-sm">Entrega</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.modules.ficha}
                onCheckedChange={(checked) => updateConfig('modules.ficha', checked)}
                className="scale-75"
              />
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <Label className="text-sm">Ficha</Label>
            </div>
          </div>
        </ConfigSection>

        {/* Diversos */}
        <ConfigSection
          title="Diversos"
          icon={<Settings className="w-4 h-4" />}
          isOpen={openSections.diversos}
          onToggle={() => toggleSection('diversos')}
          colorClass="text-gray-600"
        >
          <div className="space-y-6">
            {/* Conexão com Banco de Dados */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Conexão com Banco de Dados</Label>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Tipo de Banco</Label>
                  <Select
                    value={config.database?.type || 'none'}
                    onValueChange={(value) => updateConfig('database.type', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="mssql">MSSQL</SelectItem>
                      <SelectItem value="mysql">MYSQL</SelectItem>
                      <SelectItem value="postgre">POSTGRE</SelectItem>
                      <SelectItem value="other">OUTRO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {config.database?.type && config.database.type !== 'none' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Host</Label>
                      <Input
                        value={config.database?.host || ''}
                        onChange={(e) => updateConfig('database.host', e.target.value)}
                        className="h-8"
                        placeholder="localhost"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Porta</Label>
                      <Input
                        value={config.database?.port || ''}
                        onChange={(e) => updateConfig('database.port', e.target.value)}
                        className="h-8"
                        placeholder="5432"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Database</Label>
                      <Input
                        value={config.database?.database || ''}
                        onChange={(e) => updateConfig('database.database', e.target.value)}
                        className="h-8"
                        placeholder="database_name"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Usuário</Label>
                      <Input
                        value={config.database?.username || ''}
                        onChange={(e) => updateConfig('database.username', e.target.value)}
                        className="h-8"
                        placeholder="username"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Senha</Label>
                      <Input
                        type="password"
                        value={config.database?.password || ''}
                        onChange={(e) => updateConfig('database.password', e.target.value)}
                        className="h-8"
                        placeholder="password"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Backup */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-medium">Backup</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const dataStr = JSON.stringify(config, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `oie-config-${new Date().toISOString().split('T')[0]}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Exportar Configurações
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const importedConfig = JSON.parse(event.target?.result as string);
                          onConfigChange(importedConfig);
                        } catch (error) {
                          console.error('Erro ao importar configurações:', error);
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  style={{ display: 'none' }}
                  id="import-config"
                />
                <Button
                  onClick={() => document.getElementById('import-config')?.click()}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Restaurar Backup
                </Button>
              </div>
              
              <Button
                onClick={() => {
                  onConfigChange(defaultConfig);
                }}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                Restaurar Configurações de Fábrica
              </Button>
            </div>

            {/* Dados da Loja */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-medium">Dados da Loja</Label>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">CNPJ</Label>
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <Input
                        value={config.store?.cnpj || ''}
                        onChange={(e) => {
                          // Permite edição livre
                          let value = e.target.value;
                          
                          // Se o usuário digitou apenas números ou está formatado, permite
                          if (/^[\d.\-/]*$/.test(value)) {
                            // Remove formatação para armazenar apenas números
                            const cnpj = value.replace(/\D/g, '');
                            updateConfig('store.cnpj', value); // Mantém o valor como digitado
                            updateConfig('store.cnpjError', null);
                            updateConfig('store.cnpjLoading', false);
                          }
                        }}
                        className={`h-8 flex-1 ${config.store?.cnpjError ? 'border-red-500' : ''}`}
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                        onBlur={async (e) => {
                          let inputValue = e.target.value;
                          const cnpj = inputValue.replace(/\D/g, '');
                          
                          // Formatar visualmente se tiver 14 dígitos
                          if (cnpj.length === 14) {
                            const formatted = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
                            updateConfig('store.cnpj', formatted);
                            
                            // Validação DV
                            const validateCnpj = (cnpj: string) => {
                              if (cnpj.length !== 14) return false;
                              
                              // Verifica se todos os dígitos são iguais
                              if (/^(\d)\1{13}$/.test(cnpj)) return false;
                              
                              // Cálculo do primeiro dígito verificador
                              const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
                              let sum1 = 0;
                              for (let i = 0; i < 12; i++) {
                                sum1 += parseInt(cnpj[i]) * weights1[i];
                              }
                              const remainder1 = sum1 % 11;
                              const dv1 = remainder1 < 2 ? 0 : 11 - remainder1;
                              
                              // Cálculo do segundo dígito verificador
                              const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
                              let sum2 = 0;
                              for (let i = 0; i < 13; i++) {
                                sum2 += parseInt(cnpj[i]) * weights2[i];
                              }
                              const remainder2 = sum2 % 11;
                              const dv2 = remainder2 < 2 ? 0 : 11 - remainder2;
                              
                              return parseInt(cnpj[12]) === dv1 && parseInt(cnpj[13]) === dv2;
                            };
                            
                            if (!validateCnpj(cnpj)) {
                              updateConfig('store.cnpjError', 'CNPJ inválido - Dígitos verificadores incorretos');
                              return;
                            }
                            
                            // Consulta à Receita Federal
                            updateConfig('store.cnpjLoading', true);
                            updateConfig('store.cnpjError', null);
                            
                            try {
                              const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
                              
                              if (response.ok) {
                                const data = await response.json();
                                
                                // Preenche os dados automaticamente
                                updateConfig('store.razaoSocial', data.legal_name || data.company_name || '');
                                updateConfig('store.nomeFantasia', data.trade_name || data.fantasy_name || '');
                                updateConfig('store.cnpjError', null);
                                
                                // Toast de sucesso
                                toast({
                                  title: "CNPJ consultado com sucesso",
                                  description: `Dados da empresa ${data.legal_name || data.company_name} foram preenchidos automaticamente.`,
                                  duration: 3000,
                                });
                              } else {
                                throw new Error('CNPJ não encontrado na Receita Federal');
                              }
                            } catch (error) {
                              updateConfig('store.cnpjError', `Erro ao consultar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
                            } finally {
                              updateConfig('store.cnpjLoading', false);
                            }
                          } else if (cnpj.length > 0) {
                            updateConfig('store.cnpjError', 'CNPJ deve ter 14 dígitos');
                          } else {
                            updateConfig('store.cnpjError', null);
                          }
                        }}
                      />
                      {config.store?.cnpjLoading && (
                        <div className="flex items-center px-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>
                    {config.store?.cnpjError && (
                      <span className="text-xs text-red-500">{config.store.cnpjError}</span>
                    )}
                    {config.store?.cnpjLoading && (
                      <span className="text-xs text-blue-500">Consultando Receita Federal...</span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Razão Social</Label>
                  <Input
                    value={config.store?.razaoSocial || ''}
                    onChange={(e) => updateConfig('store.razaoSocial', e.target.value)}
                    className="h-8"
                    placeholder="Empresa Ltda"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Nome Fantasia</Label>
                  <Input
                    value={config.store?.nomeFantasia || ''}
                    onChange={(e) => updateConfig('store.nomeFantasia', e.target.value)}
                    className="h-8"
                    placeholder="Nome da Loja"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Número da Licença</Label>
                  <Input
                    value={config.store?.numeroLicenca || ''}
                    onChange={(e) => updateConfig('store.numeroLicenca', e.target.value)}
                    className="h-8"
                    placeholder="LIC-12345"
                  />
                </div>
              </div>
            </div>
          </div>
        </ConfigSection>

        
        {/* Simulação */}
        <ConfigSection
          title="Simulação"
          icon={<Cog className="w-4 h-4" />}
          isOpen={openSections.simulation}
          onToggle={() => toggleSection('simulation')}
          colorClass="text-teal-600"
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    Zerar Todos os Pedidos
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Ação</AlertDialogTitle>
                    <AlertDialogDescription>
                      Deseja zerar todos os pedidos das 2 colunas? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        clearAllOrders?.();
                        setShowClearDialog(false);
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Zerar Pedidos
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="50"
                  defaultValue="15"
                  id="newOrdersCount"
                  className="h-8 w-20"
                />
                <Button
                  onClick={() => {
                    const input = document.getElementById('newOrdersCount') as HTMLInputElement;
                    const count = parseInt(input?.value || '15');
                    generateOrders?.(count);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Gerar Novos Pedidos
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 border-t pt-3">
              <Label className="text-xs font-medium">Módulos Ativos:</Label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {config.modules.balcao && (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Balcão</span>
                  </div>
                )}
                {config.modules.mesa && (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Mesa</span>
                  </div>
                )}
                {config.modules.entrega && (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    <span>Entrega</span>
                  </div>
                )}
                {config.modules.ficha && (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span>Ficha</span>
                  </div>
                )}
              </div>
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