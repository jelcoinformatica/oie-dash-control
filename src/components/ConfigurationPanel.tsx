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
}

const ConfigSection = ({ title, icon, isOpen, onToggle, children }: ConfigSectionProps) => (
  <div>
    <button
      onClick={onToggle}
      className="w-full p-4 bg-white hover:bg-gray-50 flex items-center justify-between transition-colors border-b border-gray-100"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium text-gray-700">{title}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </button>
    {isOpen && (
      <div className="p-4 bg-gray-50 border-b border-gray-100">
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
    background: false,
    production: false,
    ready: false,
    lastOrder: false,
    advertising: false,
    sounds: false,
    autoExpedition: false,
    voiceControl: false
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

  const handleBackupExport = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `oie-config-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Backup exportado",
      description: "Configurações exportadas com sucesso",
      duration: 1000,
    });
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
            toast({
              title: "Backup importado",
              description: "Configurações restauradas com sucesso",
              duration: 1000,
            });
          } catch (error) {
            toast({
              title: "Erro no backup",
              description: "Arquivo de backup inválido",
              variant: "destructive",
              duration: 1000,
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleFactoryReset = () => {
    onConfigChange(defaultConfig);
    toast({
      title: "Configurações restauradas",
      description: "Todas as configurações foram restauradas para os valores de fábrica",
      duration: 1000,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-96 max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Configurações</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackupExport}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
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
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-0">
            {/* Fundo da Aplicação */}
            <ConfigSection
              title="Fundo da Aplicação"
              icon={<div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>}
              isOpen={openSections.background}
              onToggle={() => toggleSection('background')}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Cor de Fundo</Label>
                  <Input
                    type="color"
                    value={config.backgroundColor || '#f8fafc'}
                    onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            </ConfigSection>

            {/* Coluna 1 - Produção */}
            <ConfigSection
              title="Coluna 1 - Produção"
              icon={<div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center text-white">
                <Factory className="w-3 h-3" />
              </div>}
              isOpen={openSections.production}
              onToggle={() => toggleSection('production')}
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
                  <Label>Título</Label>
                  <Input
                    value={config.production?.title || 'Produção'}
                    onChange={(e) => updateConfig('production.title', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Largura</Label>
                  <Slider
                    value={[config.production?.width || 300]}
                    onValueChange={([value]) => updateConfig('production.width', value)}
                    min={200}
                    max={500}
                    step={10}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{config.production?.width || 300}px</span>
                </div>
              </div>
            </ConfigSection>

            {/* Coluna 2 - Prontos (Obrigatória) */}
            <ConfigSection
              title="Coluna 2 - Prontos (Obrigatória)"
              icon={<div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>}
              isOpen={openSections.ready}
              onToggle={() => toggleSection('ready')}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={config.ready?.title || 'Prontos'}
                    onChange={(e) => updateConfig('ready.title', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Largura</Label>
                  <Slider
                    value={[config.ready?.width || 300]}
                    onValueChange={([value]) => updateConfig('ready.width', value)}
                    min={200}
                    max={500}
                    step={10}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{config.ready?.width || 300}px</span>
                </div>
              </div>
            </ConfigSection>

            {/* Último Pedido */}
            <ConfigSection
              title="Último Pedido"
              icon={<div className="w-4 h-4 bg-orange-500 rounded flex items-center justify-center">
                <Clock className="w-3 h-3 text-white" />
              </div>}
              isOpen={openSections.lastOrder}
              onToggle={() => toggleSection('lastOrder')}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Altura</Label>
                  <Input
                    type="number"
                    value={config.lastOrder?.height || 60}
                    onChange={(e) => updateConfig('lastOrder.height', parseInt(e.target.value))}
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tamanho da Fonte</Label>
                  <Input
                    type="number"
                    value={config.lastOrder?.fontSize || 16}
                    onChange={(e) => updateConfig('lastOrder.fontSize', parseInt(e.target.value))}
                    className="h-8"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Animação de Pulso</Label>
                  <Switch
                    checked={config.lastOrder?.pulseAnimation || false}
                    onCheckedChange={(checked) => updateConfig('lastOrder.pulseAnimation', checked)}
                  />
                </div>
              </div>
            </ConfigSection>

            {/* Coluna 3 - Publicidade */}
            <ConfigSection
              title="Coluna 3 - Publicidade"
              icon={<div className="w-4 h-4 bg-cyan-500 rounded flex items-center justify-center">
                <Monitor className="w-3 h-3 text-white" />
              </div>}
              isOpen={openSections.advertising}
              onToggle={() => toggleSection('advertising')}
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
                  <Label>Largura</Label>
                  <Slider
                    value={[config.advertising?.width || 200]}
                    onValueChange={([value]) => updateConfig('advertising.width', value)}
                    min={100}
                    max={400}
                    step={10}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{config.advertising?.width || 200}px</span>
                </div>
              </div>
            </ConfigSection>

            {/* Efeitos Sonoros */}
            <ConfigSection
              title="Efeitos Sonoros"
              icon={<div className="w-4 h-4 bg-orange-500 rounded flex items-center justify-center">
                <Volume2 className="w-3 h-3 text-white" />
              </div>}
              isOpen={openSections.sounds}
              onToggle={() => toggleSection('sounds')}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Som Produção</Label>
                  <Switch
                    checked={config.sounds?.production || false}
                    onCheckedChange={(checked) => updateConfig('sounds.production', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Som Pronto</Label>
                  <Switch
                    checked={config.sounds?.ready || false}
                    onCheckedChange={(checked) => updateConfig('sounds.ready', checked)}
                  />
                </div>
              </div>
            </ConfigSection>

            {/* Auto Expedição */}
            <ConfigSection
              title="Auto Expedição"
              icon={<div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center">
                <Clock className="w-3 h-3 text-white" />
              </div>}
              isOpen={openSections.autoExpedition}
              onToggle={() => toggleSection('autoExpedition')}
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

            {/* Controle de Voz */}
            <ConfigSection
              title="Controle de Voz"
              icon={<div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                <Volume2 className="w-3 h-3 text-white" />
              </div>}
              isOpen={openSections.voiceControl}
              onToggle={() => toggleSection('voiceControl')}
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
                  <Label>Velocidade</Label>
                  <Slider
                    value={[config.textToSpeech?.rate || 1]}
                    onValueChange={([value]) => updateConfig('textToSpeech.rate', value)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{config.textToSpeech?.rate || 1}x</span>
                </div>
                <div className="space-y-2">
                  <Label>Volume</Label>
                  <Slider
                    value={[config.textToSpeech?.volume || 1]}
                    onValueChange={([value]) => updateConfig('textToSpeech.volume', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{Math.round((config.textToSpeech?.volume || 1) * 100)}%</span>
                </div>
              </div>
            </ConfigSection>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
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