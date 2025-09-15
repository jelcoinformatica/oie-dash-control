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
import { CNPJInput } from './CNPJInput';

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
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full p-3 bg-white hover:bg-gray-50 flex items-center justify-between transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className={colorClass}>{icon}</span>
        <span className="font-medium text-gray-700">{title}</span>
      </div>
      {isOpen ? (
        <ChevronDown className="w-4 h-4 text-gray-400" />
      ) : (
        <ChevronRight className="w-4 h-4 text-gray-400" />
      )}
    </button>
    {isOpen && (
      <div className="p-4 bg-white border-t border-gray-200">
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
  const [orderCount, setOrderCount] = useState(15);
  const [openSections, setOpenSections] = useState({
    general: false,
    production: false,
    ready: false,
    lastOrder: false,
    advertising: false,
    sounds: false,
    textToSpeech: false,
    autoExpedition: false,
    modules: false,
    diversos: false,
    simulation: false
  });

  const updateConfig = (path: string, value: any) => {
    const keys = path.split('.');
    const newConfig = { ...config };
    let current = newConfig as any;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onConfigChange(newConfig);
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleAllSections = () => {
    const allOpen = Object.values(openSections).every(isOpen => isOpen);
    const newState = Object.keys(openSections).reduce((acc, key) => {
      acc[key as keyof typeof openSections] = !allOpen;
      return acc;
    }, {} as typeof openSections);
    setOpenSections(newState);
  };

  const handleBackupExport = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `oie-config-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    // Backup exportado silenciosamente
  };

  const handleBackupImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedConfig = JSON.parse(e.target?.result as string);
            onConfigChange(importedConfig);
            // Backup importado silenciosamente
          } catch (error) {
            // Erro silencioso
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleFactoryReset = () => {
    onConfigChange(defaultConfig);
    // Configurações restauradas silenciosamente
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-end p-4">
      <div className="bg-white rounded-lg w-96 max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50/80">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Configurações</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAllSections}
              className="flex items-center gap-1 h-8"
            >
              {Object.values(openSections).every(isOpen => isOpen) ? (
                <>
                  <Minus className="w-3 h-3" />
                  Colapsar Tudo
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  Expandir Tudo
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"  
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">

            {/* Coluna Produção */}
            <ConfigSection
              title="Coluna Produção"
              icon={<Factory className="w-4 h-4" />}
              isOpen={openSections.production}
              onToggle={() => toggleSection('production')}
              colorClass="text-orange-600"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Exibir Coluna</Label>
                  <Switch
                    checked={config.production?.visible || false}
                    onCheckedChange={(checked) => updateConfig('production.visible', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Título da Coluna</Label>
                  <Input
                    value={config.production?.title || 'Produção'}
                    onChange={(e) => updateConfig('production.title', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Largura (%): {config.production?.width || 30}</Label>
                  <Slider
                    value={[config.production?.width || 30]}
                    onValueChange={([value]) => updateConfig('production.width', value)}
                    min={20}
                    max={60}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Altura do Cabeçalho: {config.production?.headerHeight || 72}px</Label>
                  <Slider
                    value={[config.production?.headerHeight || 72]}
                    onValueChange={([value]) => updateConfig('production.headerHeight', value)}
                    min={40}
                    max={120}
                    step={4}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tamanho da Fonte do Cabeçalho: {config.production?.headerFontSize || 2.5}rem</Label>
                  <Slider
                    value={[config.production?.headerFontSize || 2.5]}
                    onValueChange={([value]) => updateConfig('production.headerFontSize', value)}
                    min={1}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Configuração dos Cards - Produção</Label>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Colunas: {config.production?.cardConfig?.columns || 2}</Label>
                      <Slider
                        value={[config.production?.cardConfig?.columns || 2]}
                        onValueChange={([value]) => updateConfig('production.cardConfig.columns', value)}
                        min={1}
                        max={5}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tamanho da Fonte: {config.production?.cardConfig?.fontSize || 2}rem</Label>
                      <Slider
                        value={[config.production?.cardConfig?.fontSize || 2]}
                        onValueChange={([value]) => updateConfig('production.cardConfig.fontSize', value)}
                        min={1}
                        max={6}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Família da Fonte</Label>
                      <Select 
                        value={config.production?.cardConfig?.fontFamily || 'Tahoma'} 
                        onValueChange={(value) => updateConfig('production.cardConfig.fontFamily', value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tahoma">Tahoma</SelectItem>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Cor da Fonte</Label>
                        <Input
                          type="color"
                          value={config.production?.cardConfig?.textColor || '#374151'}
                          onChange={(e) => updateConfig('production.cardConfig.textColor', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cor de Fundo</Label>
                        <Input
                          type="color"
                          value={config.production?.cardConfig?.backgroundColor || '#f3f4f6'}
                          onChange={(e) => updateConfig('production.cardConfig.backgroundColor', e.target.value)}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ConfigSection>

            {/* Coluna Pronto */}
            <ConfigSection
              title="Coluna Pronto"
              icon={<CheckCircle className="w-4 h-4" />}
              isOpen={openSections.ready}
              onToggle={() => toggleSection('ready')}
              colorClass="text-green-600"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Exibir Coluna</Label>
                  <Switch
                    checked={config.ready?.visible || false}
                    onCheckedChange={(checked) => updateConfig('ready.visible', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Título da Coluna</Label>
                  <Input
                    value={config.ready?.title || 'Pronto'}
                    onChange={(e) => updateConfig('ready.title', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Largura (%): {config.ready?.width || 40}</Label>
                  <Slider
                    value={[config.ready?.width || 40]}
                    onValueChange={([value]) => updateConfig('ready.width', value)}
                    min={20}
                    max={60}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Altura do Cabeçalho: {config.ready?.headerHeight || 72}px</Label>
                  <Slider
                    value={[config.ready?.headerHeight || 72]}
                    onValueChange={([value]) => updateConfig('ready.headerHeight', value)}
                    min={40}
                    max={120}
                    step={4}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tamanho da Fonte do Cabeçalho: {config.ready?.headerFontSize || 2.5}rem</Label>
                  <Slider
                    value={[config.ready?.headerFontSize || 2.5]}
                    onValueChange={([value]) => updateConfig('ready.headerFontSize', value)}
                    min={1}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Configuração dos Cards - Prontos</Label>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Colunas: {config.ready?.cardConfig?.columns || 3}</Label>
                      <Slider
                        value={[config.ready?.cardConfig?.columns || 3]}
                        onValueChange={([value]) => updateConfig('ready.cardConfig.columns', value)}
                        min={1}
                        max={5}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tamanho da Fonte: {config.ready?.cardConfig?.fontSize || 4}rem</Label>
                      <Slider
                        value={[config.ready?.cardConfig?.fontSize || 4]}
                        onValueChange={([value]) => updateConfig('ready.cardConfig.fontSize', value)}
                        min={1}
                        max={6}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Família da Fonte</Label>
                      <Select 
                        value={config.ready?.cardConfig?.fontFamily || 'Tahoma'} 
                        onValueChange={(value) => updateConfig('ready.cardConfig.fontFamily', value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tahoma">Tahoma</SelectItem>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Cor da Fonte</Label>
                        <Input
                          type="color"
                          value={config.ready?.cardConfig?.textColor || '#000000'}
                          onChange={(e) => updateConfig('ready.cardConfig.textColor', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cor de Fundo</Label>
                        <Input
                          type="color"
                          value={config.ready?.cardConfig?.backgroundColor || '#FAFAFA'}
                          onChange={(e) => updateConfig('ready.cardConfig.backgroundColor', e.target.value)}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ConfigSection>

            {/* Último Pedido */}
            <ConfigSection
              title="Último Pedido"
              icon={<Clock className="w-4 h-4" />}
              isOpen={openSections.lastOrder}
              onToggle={() => toggleSection('lastOrder')}
              colorClass="text-purple-600"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Altura: {config.lastOrder?.height || 180}px</Label>
                  <Slider
                    value={[config.lastOrder?.height || 180]}
                    onValueChange={([value]) => updateConfig('lastOrder.height', value)}
                    min={60}
                    max={300}
                    step={10}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tamanho da Fonte: {config.lastOrder?.fontSize || 8}rem</Label>
                  <Slider
                    value={[config.lastOrder?.fontSize || 8]}
                    onValueChange={([value]) => updateConfig('lastOrder.fontSize', value)}
                    min={2}
                    max={12}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Família da Fonte</Label>
                  <Select 
                    value={config.lastOrder?.fontFamily || 'Tahoma'} 
                    onValueChange={(value) => updateConfig('lastOrder.fontFamily', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tahoma">Tahoma</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Cor do Texto</Label>
                    <Input
                      type="color"
                      value={config.lastOrder?.textColor || '#0011FA'}
                      onChange={(e) => updateConfig('lastOrder.textColor', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor de Fundo</Label>
                    <Input
                      type="color"
                      value={config.lastOrder?.backgroundColor || '#ffffff'}
                      onChange={(e) => updateConfig('lastOrder.backgroundColor', e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Animação de Pulso</Label>
                  <Switch
                    checked={config.lastOrder?.pulseAnimation || false}
                    onCheckedChange={(checked) => updateConfig('lastOrder.pulseAnimation', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Destacar</Label>
                  <Switch
                    checked={config.lastOrder?.highlight || false}
                    onCheckedChange={(checked) => updateConfig('lastOrder.highlight', checked)}
                  />
                </div>
              </div>
            </ConfigSection>

            {/* Publicidade */}
            <ConfigSection
              title="Publicidade"
              icon={<Palette className="w-4 h-4" />}
              isOpen={openSections.advertising}
              onToggle={() => toggleSection('advertising')}
              colorClass="text-pink-600"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Exibir Publicidade</Label>
                  <Switch
                    checked={config.advertising?.visible || false}
                    onCheckedChange={(checked) => updateConfig('advertising.visible', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Largura (%): {config.advertising?.width || 30}</Label>
                  <Slider
                    value={[config.advertising?.width || 30]}
                    onValueChange={([value]) => updateConfig('advertising.width', value)}
                    min={20}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Título do Cabeçalho</Label>
                  <Input
                    value={config.advertising?.headerTitle || 'Publicidade'}
                    onChange={(e) => updateConfig('advertising.headerTitle', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Exibir Cabeçalho</Label>
                  <Switch
                    checked={config.advertising?.headerVisible || false}
                    onCheckedChange={(checked) => updateConfig('advertising.headerVisible', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL da Imagem</Label>
                  <Input
                    value={config.advertising?.imageUrl || ''}
                    onChange={(e) => updateConfig('advertising.imageUrl', e.target.value)}
                    className="h-8"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </ConfigSection>

            {/* Sons */}
            <ConfigSection
              title="Sons"
              icon={<Volume2 className="w-4 h-4" />}
              isOpen={openSections.sounds}
              onToggle={() => toggleSection('sounds')}
              colorClass="text-blue-600"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Som Produção</Label>
                  <Switch
                    checked={config.sounds?.production || false}
                    onCheckedChange={(checked) => updateConfig('sounds.production', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Arquivo de Som - Produção</Label>
                  <Input
                    value={config.sounds?.productionFile || ''}
                    onChange={(e) => updateConfig('sounds.productionFile', e.target.value)}
                    className="h-8"
                    placeholder="arquivo.wav"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Som Pronto</Label>
                  <Switch
                    checked={config.sounds?.ready || false}
                    onCheckedChange={(checked) => updateConfig('sounds.ready', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Arquivo de Som - Pronto</Label>
                  <Input
                    value={config.sounds?.readyFile || ''}
                    onChange={(e) => updateConfig('sounds.readyFile', e.target.value)}
                    className="h-8"
                    placeholder="arquivo.wav"
                  />
                </div>
              </div>
            </ConfigSection>

            {/* Text-to-Speech */}
            <ConfigSection
              title="Text-to-Speech"
              icon={<Volume2 className="w-4 h-4" />}
              isOpen={openSections.textToSpeech}
              onToggle={() => toggleSection('textToSpeech')}
              colorClass="text-indigo-600"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ativar TTS</Label>
                  <Switch
                    checked={config.textToSpeech?.enabled || false}
                    onCheckedChange={(checked) => updateConfig('textToSpeech.enabled', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Voz</Label>
                  <Input
                    value={config.textToSpeech?.voice || ''}
                    onChange={(e) => updateConfig('textToSpeech.voice', e.target.value)}
                    className="h-8"
                    placeholder="Voz do sistema"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Velocidade: {config.textToSpeech?.rate || 1}x</Label>
                  <Slider
                    value={[config.textToSpeech?.rate || 1]}
                    onValueChange={([value]) => updateConfig('textToSpeech.rate', value)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Volume: {Math.round((config.textToSpeech?.volume || 1) * 100)}%</Label>
                  <Slider
                    value={[config.textToSpeech?.volume || 1]}
                    onValueChange={([value]) => updateConfig('textToSpeech.volume', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Texto</Label>
                  <Select 
                    value={config.textToSpeech?.textType || 'number_only'} 
                    onValueChange={(value) => updateConfig('textToSpeech.textType', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="number_only">Apenas Número</SelectItem>
                      <SelectItem value="name_ready">Nome + Pronto</SelectItem>
                      <SelectItem value="order_ready">Pedido + Pronto</SelectItem>
                      <SelectItem value="name_order_ready">Nome + Pedido + Pronto</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {config.textToSpeech?.textType === 'custom' && (
                  <div className="space-y-2">
                    <Label>Texto Personalizado</Label>
                    <Input
                      value={config.textToSpeech?.customText || ''}
                      onChange={(e) => updateConfig('textToSpeech.customText', e.target.value)}
                      className="h-8"
                      placeholder="Seu pedido está pronto"
                    />
                  </div>
                )}
              </div>
            </ConfigSection>

            {/* Auto Expedição */}
            <ConfigSection
              title="Auto Expedição"
              icon={<CheckCircle className="w-4 h-4" />}
              isOpen={openSections.autoExpedition}
              onToggle={() => toggleSection('autoExpedition')}
              colorClass="text-green-600"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ativar Auto Expedição</Label>
                  <Switch
                    checked={config.autoExpedition?.enabled || false}
                    onCheckedChange={(checked) => updateConfig('autoExpedition.enabled', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tempo para Auto Expedição (minutos)</Label>
                  <Input
                    type="number"
                    value={config.autoExpedition?.minutes || 30}
                    onChange={(e) => updateConfig('autoExpedition.minutes', parseInt(e.target.value))}
                    className="h-8"
                  />
                </div>
              </div>
            </ConfigSection>

            {/* Módulos */}
            <ConfigSection
              title="Módulos"
              icon={<Puzzle className="w-4 h-4" />}
              isOpen={openSections.modules}
              onToggle={() => toggleSection('modules')}
              colorClass="text-cyan-600"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Módulo Balcão</Label>
                  <Switch
                    checked={config.modules?.balcao || false}
                    onCheckedChange={(checked) => updateConfig('modules.balcao', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Módulo Mesa</Label>
                  <Switch
                    checked={config.modules?.mesa || false}
                    onCheckedChange={(checked) => updateConfig('modules.mesa', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Módulo Entrega</Label>
                  <Switch
                    checked={config.modules?.entrega || false}
                    onCheckedChange={(checked) => updateConfig('modules.entrega', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Módulo Ficha</Label>
                  <Switch
                    checked={config.modules?.ficha || false}
                    onCheckedChange={(checked) => updateConfig('modules.ficha', checked)}
                  />
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
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Tipo</Label>
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
                    <div className="space-y-2">
                      <Label className="text-xs">Host</Label>
                      <Input
                        value={config.database?.host || ''}
                        onChange={(e) => updateConfig('database.host', e.target.value)}
                        className="h-8"
                        placeholder="localhost"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Banco</Label>
                      <Input
                        value={config.database?.database || ''}
                        onChange={(e) => updateConfig('database.database', e.target.value)}
                        className="h-8"
                        placeholder="oie"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Porta</Label>
                      <Input
                        value={config.database?.port || ''}
                        onChange={(e) => updateConfig('database.port', e.target.value)}
                        className="h-8"
                        placeholder="1433"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Usuário</Label>
                      <Input
                        value={config.database?.username || ''}
                        onChange={(e) => updateConfig('database.username', e.target.value)}
                        className="h-8"
                        placeholder="user"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Senha</Label>
                      <Input
                        type="password"
                        value={config.database?.password || ''}
                        onChange={(e) => updateConfig('database.password', e.target.value)}
                        className="h-8"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                {/* Backup e Restauração */}
                <div className="space-y-3 border-t pt-4">
                  <Label className="text-sm font-medium">Backup e Restauração</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleBackupExport}
                      className="flex-1 h-8"
                    >
                      Exportar Backup
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleBackupImport}
                      className="flex-1 h-8"
                    >
                      Importar Backup
                    </Button>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full h-8">
                        Restaurar Configurações de Fábrica
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Restaurar Configurações de Fábrica</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação irá restaurar todas as configurações para os valores padrão. Todas as personalizações serão perdidas.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleFactoryReset}>
                          Restaurar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Dados da Loja */}
                <div className="space-y-3 border-t pt-4">
                  <Label className="text-sm font-medium">Dados da Loja</Label>
                  <div className="space-y-3">
                    <CNPJInput
                      value={config.store?.cnpj || ''}
                      onValueChange={(value) => updateConfig('store.cnpj', value)}
                      onDataLoaded={(data) => {
                        updateConfig('store.razaoSocial', data.razaoSocial);
                        updateConfig('store.nomeFantasia', data.nomeFantasia);
                      }}
                      onError={(error) => updateConfig('store.cnpjError', error)}
                      onLoading={(loading) => updateConfig('store.cnpjLoading', loading)}
                      error={config.store?.cnpjError}
                      loading={config.store?.cnpjLoading}
                    />
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
              colorClass="text-yellow-600"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Quantidade de Pedidos para Gerar</Label>
                  <Input
                    type="number"
                    value={orderCount}
                    onChange={(e) => setOrderCount(parseInt(e.target.value) || 1)}
                    min={1}
                    max={100}
                    className="h-8"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => generateOrders?.(orderCount)}
                    className="flex-1 h-8"
                  >
                    Gerar Pedidos
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex-1 h-8">
                        Limpar Todos os Pedidos
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Limpar Todos os Pedidos</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação irá remover todos os pedidos atuais da tela. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={clearAllOrders}>
                          Limpar Pedidos
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </ConfigSection>

          </div>
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
    </div>
  );
};