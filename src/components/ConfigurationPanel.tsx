import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { PanelConfig } from '../types/order';
import { Settings, Palette, Factory, CheckCircle, Monitor, Volume2, Clock, Puzzle, Cog, X, ChevronRight, ChevronDown, Plus, Minus, ChevronLeft, ArrowLeft, ArrowRight, Mic, Database, Download, Upload, Store, Eye, RotateCcw, Lightbulb, Zap, History, Megaphone, Wrench } from 'lucide-react';
import { cn } from '../lib/utils';
import { defaultConfig } from '../data/defaultConfig';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
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
  <div className="border-b border-gray-200">
    <button
      onClick={onToggle}
      className={cn(
        "w-full px-4 py-2 flex items-center justify-between transition-all duration-200",
        isOpen 
          ? "bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm border-l-4 border-blue-400" 
          : "bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-4 h-4", colorClass)}>
          {icon}
        </div>
        <span className="text-xs font-semibold text-gray-800">{title}</span>
      </div>
      {isOpen ? (
        <ChevronDown className="w-4 h-4 text-gray-600" />
      ) : (
        <ChevronRight className="w-4 h-4 text-gray-600" />
      )}
    </button>
    {isOpen && (
      <div className="px-3 pb-2 pt-1 space-y-1 bg-gradient-to-b from-blue-25 to-white border-t border-blue-100">
        {children}
      </div>
    )}
  </div>
);

const SubConfigSection = ({ title, isOpen, onToggle, children, icon }: { 
  title: string; 
  isOpen: boolean; 
  onToggle: () => void; 
  children: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <div className="border border-gray-200 rounded-md mb-2">
    <button
      onClick={onToggle}
      className={cn(
        "w-full px-3 py-2 flex items-center justify-between transition-colors",
        isOpen ? "bg-gray-100" : "bg-white hover:bg-gray-50"
      )}
    >
      <div className="flex items-center gap-2">
        {icon && <div className="w-3 h-3 text-gray-500">{icon}</div>}
        <span className="text-xs font-medium text-gray-700">{title}</span>
      </div>
      {isOpen ? (
        <ChevronDown className="w-3 h-3 text-gray-500" />
      ) : (
        <ChevronRight className="w-3 h-3 text-gray-500" />
      )}
    </button>
    {isOpen && (
      <div className="px-3 pb-3 bg-gray-50">
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
    overlayControls: false,
    background: false,
    panel: false,
    production: false,
    ready: false,
    lastOrder: false,
    advertising: false,
    sounds: false,
    tts: false,
    autoExpedition: false,
    modules: false,
    cards: false,
    diversos: false,
    simulation: false
  });

  // Estado para subseções das colunas
  const [openSubSections, setOpenSubSections] = useState<Record<string, boolean>>({
    productionGeneral: false,
    productionHeader: false,
    productionCards: false,
    readyGeneral: false,
    readyHeader: false,
    readyCards: false,
    advertisingGeneral: false,
    advertisingHeader: false,
    advertisingContent: false,
    diversosDatabase: false,
    diversosBackup: false,
    diversosStore: false,
    diversosPanel: false,
    diversosScreen: false
  });

  // Reset todas as seções para fechadas sempre que abrir o painel
  useEffect(() => {
    if (open) {
      setOpenSections({
        overlayControls: false,
        background: false,
        panel: false,
        production: false,
        ready: false,
        lastOrder: false,
        advertising: false,
        sounds: false,
        tts: false,
        autoExpedition: false,
        modules: false,
        cards: false,
        diversos: false,
        simulation: false
      });
    }
  }, [open]);

  const [showClearDialog, setShowClearDialog] = useState(false);
  const [panelPosition, setPanelPosition] = useState<'left' | 'right'>('right');

  const toggleAllSections = () => {
    const allOpen = Object.values(openSections).every(Boolean);
    const newState = !allOpen;
    setOpenSections({
      overlayControls: newState,
      background: newState,
      panel: newState,
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

  const toggleSubSection = (section: string) => {
    setOpenSubSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Colapse automaticamente as colunas quando elas estão inativas
  useEffect(() => {
    if (!config.production.visible && openSections.production) {
      // Fecha a seção quando a coluna é desabilitada
      setOpenSections(prev => ({
        ...prev,
        production: false
      }));
      // Também fecha as subseções
      setOpenSubSections(prev => ({
        ...prev,
        productionGeneral: false,
        productionHeader: false,
        productionCards: false
      }));
    }
  }, [config.production.visible]);

  // Colapse automaticamente a Coluna 2 quando ela está inativa
  useEffect(() => {
    if (!config.ready.visible && openSections.ready) {
      // Fecha a seção quando a coluna é desabilitada
      setOpenSections(prev => ({
        ...prev,
        ready: false
      }));
      // Também fecha as subseções
      setOpenSubSections(prev => ({
        ...prev,
        readyGeneral: false,
        readyHeader: false,
        readyCards: false
      }));
    }
  }, [config.ready.visible]);

  // Colapse automaticamente a Coluna 3 quando ela está inativa
  useEffect(() => {
    if (!config.advertising.visible && openSections.advertising) {
      // Fecha a seção quando a coluna é desabilitada
      setOpenSections(prev => ({
        ...prev,
        advertising: false
      }));
      // Também fecha as subseções
      setOpenSubSections(prev => ({
        ...prev,
        advertisingGeneral: false,
        advertisingHeader: false,
        advertisingContent: false
      }));
    }
  }, [config.advertising.visible]);

  const updateConfig = (path: string, value: any) => {    
    // Validação para módulos - pelo menos um deve estar ativo
    if (path.includes('modules.') && path.includes('.enabled') && value === false) {
      const moduleKeys = ['balcao', 'mesa', 'entrega', 'ficha'];
      const currentModuleName = path.split('.')[1];
      
      // Verifica se outros módulos estão ativos
      const otherModulesActive = moduleKeys
        .filter(key => key !== currentModuleName)
        .some(key => config.modules[key as keyof typeof config.modules].enabled);
      
      if (!otherModulesActive) {
        // Não permite desativar se for o último módulo ativo
        toast({
          title: "Atenção",
          description: "Pelo menos um módulo deve permanecer ativo.",
          variant: "destructive"
        });
        return;
      }
    }
    
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
      className={cn(
        "fixed top-0 w-[30%] h-full bg-white shadow-xl z-50 flex flex-col border-gray-200",
        panelPosition === 'right' ? 'right-0 border-l' : 'left-0 border-r'
      )}
    >
        <div className="flex items-center justify-between p-3 border-b bg-gray-50/30">
          <h2 className="text-lg font-semibold">Configurações</h2>
          <div className="flex items-center gap-2">
            {/* Controles de posição */}
            <div className="flex items-center bg-gray-100 rounded-md overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPanelPosition('left')}
                className={cn(
                  "h-6 w-6 p-0 rounded-none",
                  panelPosition === 'left' ? "bg-gray-200" : ""
                )}
                title="Mover para esquerda"
              >
                <ArrowLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPanelPosition('right')}
                className={cn(
                  "h-6 w-6 p-0 rounded-none",
                  panelPosition === 'right' ? "bg-gray-200" : ""
                )}
                title="Mover para direita"
              >
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            
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
        
        
        {/* Controles Diretos */}
        <ConfigSection
          title="Controles Diretos"
          icon={<Zap className="w-4 h-4" />}
          isOpen={openSections.overlayControls}
          onToggle={() => toggleSection('overlayControls')}
          colorClass="text-blue-600"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={config.overlayControls?.enabled || false}
                onCheckedChange={(checked) => updateConfig('overlayControls.enabled', checked)}
                className="scale-50"
              />
              <Label className="text-xs">Ajustes em tempo real</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={config.resizableColumns ?? true} 
                onCheckedChange={(checked) => updateConfig('resizableColumns', checked)}
                className="scale-50"
              />
              <Label className="text-xs">Ajuste fino Colunas</Label>
            </div>
          </div>
        </ConfigSection>
        
        {/* Fundo da Aplicação */}
        <ConfigSection
          title="Fundo da Aplicação"
          icon={<Palette className="w-4 h-4" />}
          isOpen={openSections.background}
          onToggle={() => toggleSection('background')}
          colorClass="text-blue-600"
        >
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-medium">Cor de Fundo</Label>
              <Input
                type="color"
                value={config.backgroundColor}
                onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                className="h-8 mt-1 border-2"
              />
            </div>
          </div>
        </ConfigSection>

        {/* Identificação do Painel */}
        <ConfigSection
          title="Identificação do Painel"
          icon={<Monitor className="w-4 h-4" />}
          isOpen={openSections.panel}
          onToggle={() => toggleSection('panel')}
          colorClass="text-blue-600"
        >
          <div className="space-y-2">
            <div>
              <Label className="text-xs font-medium">Número do Painel</Label>
              <Input
                type="number"
                min="1"
                value={config.panel.id}
                onChange={(e) => onConfigChange({
                  ...config,
                  panel: { ...config.panel, id: parseInt(e.target.value) || 1 }
                })}
                className="mt-1 h-8"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Nome do Painel</Label>
              <Input
                type="text"
                value={config.panel.name}
                onChange={(e) => onConfigChange({
                  ...config,
                  panel: { ...config.panel, name: e.target.value }
                })}
                className="mt-1 h-8"
                placeholder="Ex: Painel Principal"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Localização</Label>
              <Input
                type="text"
                value={config.panel.location}
                onChange={(e) => onConfigChange({
                  ...config,
                  panel: { ...config.panel, location: e.target.value }
                })}
                className="mt-1 h-8"
                placeholder="Ex: Balcão Principal"
              />
            </div>
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
          <SubConfigSection
            title="Gerais"
            isOpen={openSubSections.productionGeneral}
            onToggle={() => toggleSubSection('productionGeneral')}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={config.production.visible} 
                  onCheckedChange={(checked) => updateConfig('production.visible', checked)}
                  className="scale-50"
                />
                <Label className="text-xs">Exibir Coluna</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={config.production.showBorder || false} 
                  onCheckedChange={(checked) => updateConfig('production.showBorder', checked)}
                  className="scale-50"
                />
                <Label className="text-xs">Tem Borda</Label>
              </div>

              <div>
                <Label className="text-xs font-medium">Título da Coluna</Label>
                <Input
                  value={config.production.title}
                  onChange={(e) => updateConfig('production.title', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-medium">Largura (%): {config.production.width}</Label>
                <Slider
                  value={[config.production.width]}
                  onValueChange={([value]) => updateConfig('production.width', value)}
                  max={50}
                  min={10}
                  step={1}
                  className="mt-1"
                />
              </div>
            </div>
          </SubConfigSection>

          <SubConfigSection
            title="Cabeçalho"
            isOpen={openSubSections.productionHeader}
            onToggle={() => toggleSubSection('productionHeader')}
          >
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Altura: {config.production.headerHeight}px</Label>
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
                <Label className="text-sm font-medium">Tamanho da Fonte: {config.production.headerFontSize}rem</Label>
                <Slider
                  value={[config.production.headerFontSize]}
                  onValueChange={([value]) => updateConfig('production.headerFontSize', value)}
                  max={3}
                  min={0.8}
                  step={0.1}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Cor Fundo Cabeçalho</Label>
                  <Input
                    type="color"
                    value={config.production.headerBg}
                    onChange={(e) => updateConfig('production.headerBg', e.target.value)}
                    className="h-8 mt-1 border-2"
                  />
                </div>
                <div>
                  <Label className="text-xs">Cor Fonte Cabeçalho</Label>
                  <Input
                    type="color"
                    value={config.production.headerColor}
                    onChange={(e) => updateConfig('production.headerColor', e.target.value)}
                    className="h-8 mt-1 border-2"
                  />
                </div>
              </div>
            </div>
          </SubConfigSection>

          <SubConfigSection
            title="Cards e Indicadores"
            isOpen={openSubSections.productionCards}
            onToggle={() => toggleSubSection('productionCards')}
          >
            <div className="space-y-3">
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
                  <Label className="text-xs">Cor Fonte Cards</Label>
                  <Input
                    type="color"
                    value={config.production.cardConfig.textColor}
                    onChange={(e) => updateConfig('production.cardConfig.textColor', e.target.value)}
                    className="h-8 mt-1 border-2"
                  />
                </div>
                <div>
                  <Label className="text-xs">Cor Fundo Cards</Label>
                  <Input
                    type="color"
                    value={config.production.cardConfig.backgroundColor}
                    onChange={(e) => updateConfig('production.cardConfig.backgroundColor', e.target.value)}
                    className="h-8 mt-1 border-2"
                  />
                </div>
               </div>

               {/* Controles de Ajuste Fino */}
               <div className="pt-2 border-t border-gray-200">
                 <Label className="text-xs font-semibold text-gray-600">Ajuste Fino de Espaçamentos</Label>
               </div>

               <div className="grid grid-cols-2 gap-2">
                 <div>
                   <Label className="text-xs">Gap Horizontal: {config.production.cardConfig.gapHorizontal || 4}px</Label>
                   <Slider
                     value={[config.production.cardConfig.gapHorizontal || 4]}
                     onValueChange={([value]) => updateConfig('production.cardConfig.gapHorizontal', value)}
                     max={20}
                     min={0}
                     step={1}
                     className="mt-1"
                   />
                 </div>
                 <div>
                   <Label className="text-xs">Gap Vertical: {config.production.cardConfig.gapVertical || 4}px</Label>
                   <Slider
                     value={[config.production.cardConfig.gapVertical || 4]}
                     onValueChange={([value]) => updateConfig('production.cardConfig.gapVertical', value)}
                     max={20}
                     min={0}
                     step={1}
                     className="mt-1"
                   />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-2">
                 <div>
                   <Label className="text-xs">Altura Mín: {config.production.cardConfig.cardMinHeight || 60}px</Label>
                   <Slider
                     value={[config.production.cardConfig.cardMinHeight || 60]}
                     onValueChange={([value]) => updateConfig('production.cardConfig.cardMinHeight', value)}
                     max={150}
                     min={40}
                     step={5}
                     className="mt-1"
                   />
                 </div>
                 <div>
                   <Label className="text-xs">Altura Máx: {config.production.cardConfig.cardMaxHeight || 120}px</Label>
                   <Slider
                     value={[config.production.cardConfig.cardMaxHeight || 120]}
                     onValueChange={([value]) => updateConfig('production.cardConfig.cardMaxHeight', value)}
                     max={200}
                     min={60}
                     step={5}
                     className="mt-1"
                   />
                 </div>
               </div>
            </div>
          </SubConfigSection>
        </ConfigSection>

        {/* Coluna 2 - Prontos */}
        <ConfigSection
          title="Coluna 2 - Prontos"
          icon={<CheckCircle className="w-4 h-4" />}
          isOpen={openSections.ready}
          onToggle={() => toggleSection('ready')}
          colorClass="text-blue-600"
        >
          <SubConfigSection
            title="Gerais"
            isOpen={openSubSections.readyGeneral}
            onToggle={() => toggleSubSection('readyGeneral')}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={config.ready.visible} 
                  onCheckedChange={(checked) => updateConfig('ready.visible', checked)}
                  className="scale-50"
                />
                <Label className="text-xs">Exibir Coluna</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={config.ready.showBorder || false} 
                  onCheckedChange={(checked) => updateConfig('ready.showBorder', checked)}
                  className="scale-50"
                />
                <Label className="text-xs">Tem Borda</Label>
              </div>

              <div>
                <Label className="text-xs font-medium">Título da Coluna</Label>
                <Input
                  value={config.ready.title}
                  onChange={(e) => updateConfig('ready.title', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-medium">Largura (%): {config.ready.width}</Label>
                <Slider
                  value={[config.ready.width]}
                  onValueChange={([value]) => updateConfig('ready.width', value)}
                  max={60}
                  min={10}
                  step={1}
                  className="mt-1"
                />
              </div>
            </div>
          </SubConfigSection>

          <SubConfigSection
            title="Cabeçalho"
            isOpen={openSubSections.readyHeader}
            onToggle={() => toggleSubSection('readyHeader')}
          >
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Altura: {config.ready.headerHeight}px</Label>
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
                <Label className="text-sm font-medium">Tamanho da Fonte: {config.ready.headerFontSize}rem</Label>
                <Slider
                  value={[config.ready.headerFontSize]}
                  onValueChange={([value]) => updateConfig('ready.headerFontSize', value)}
                  max={3}
                  min={0.8}
                  step={0.1}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Cor Fundo Cabeçalho</Label>
                  <Input
                    type="color"
                    value={config.ready.headerBg}
                    onChange={(e) => updateConfig('ready.headerBg', e.target.value)}
                    className="h-8 mt-1 border-2"
                  />
                </div>
                <div>
                  <Label className="text-xs">Cor Fonte Cabeçalho</Label>
                  <Input
                    type="color"
                    value={config.ready.headerColor}
                    onChange={(e) => updateConfig('ready.headerColor', e.target.value)}
                    className="h-8 mt-1 border-2"
                  />
                </div>
              </div>
            </div>
          </SubConfigSection>

          <SubConfigSection
            title="Cards e Indicadores"
            isOpen={openSubSections.readyCards}
            onToggle={() => toggleSubSection('readyCards')}
          >
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Colunas: {config.ready.cardConfig.columns}</Label>
                <Slider
                  value={[config.ready.cardConfig.columns]}
                  onValueChange={([value]) => updateConfig('ready.cardConfig.columns', value)}
                  max={10}
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
                  <Label className="text-xs">Cor Fonte Cards</Label>
                  <Input
                    type="color"
                    value={config.ready.cardConfig.textColor}
                    onChange={(e) => updateConfig('ready.cardConfig.textColor', e.target.value)}
                    className="h-8 mt-1 border-2"
                  />
                </div>
                <div>
                  <Label className="text-xs">Cor Fundo Cards</Label>
                  <Input
                    type="color"
                    value={config.ready.cardConfig.backgroundColor}
                    onChange={(e) => updateConfig('ready.cardConfig.backgroundColor', e.target.value)}
                    className="h-8 mt-1 border-2"
                  />
                </div>
              </div>
              

               {/* Controles de Ajuste Fino */}
               <div className="pt-2 border-t border-gray-200">
                 <Label className="text-xs font-semibold text-gray-600">Ajuste Fino de Espaçamentos</Label>
               </div>

               <div className="grid grid-cols-2 gap-2">
                 <div>
                   <Label className="text-xs">Gap Horizontal: {config.ready.cardConfig.gapHorizontal || 4}px</Label>
                   <Slider
                     value={[config.ready.cardConfig.gapHorizontal || 4]}
                     onValueChange={([value]) => updateConfig('ready.cardConfig.gapHorizontal', value)}
                     max={20}
                     min={0}
                     step={1}
                     className="mt-1"
                   />
                 </div>
                 <div>
                   <Label className="text-xs">Gap Vertical: {config.ready.cardConfig.gapVertical || 4}px</Label>
                   <Slider
                     value={[config.ready.cardConfig.gapVertical || 4]}
                     onValueChange={([value]) => updateConfig('ready.cardConfig.gapVertical', value)}
                     max={20}
                     min={0}
                     step={1}
                     className="mt-1"
                   />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-2">
                 <div>
                   <Label className="text-xs">Altura Mín: {config.ready.cardConfig.cardMinHeight || 70}px</Label>
                   <Slider
                     value={[config.ready.cardConfig.cardMinHeight || 70]}
                     onValueChange={([value]) => updateConfig('ready.cardConfig.cardMinHeight', value)}
                     max={150}
                     min={40}
                     step={5}
                     className="mt-1"
                   />
                 </div>
                 <div>
                   <Label className="text-xs">Altura Máx: {config.ready.cardConfig.cardMaxHeight || 150}px</Label>
                   <Slider
                     value={[config.ready.cardConfig.cardMaxHeight || 150]}
                     onValueChange={([value]) => updateConfig('ready.cardConfig.cardMaxHeight', value)}
                     max={200}
                     min={60}
                     step={5}
                     className="mt-1"
                   />
                 </div>
               </div>
            </div>
          </SubConfigSection>
        </ConfigSection>

        {/* Coluna 2 - Ultimo Pedido */}
        <ConfigSection
          title="Coluna 2 - Ultimo Pedido"
          icon={<History className="w-4 h-4" />}
          isOpen={openSections.lastOrder}
          onToggle={() => toggleSection('lastOrder')}
          colorClass="text-blue-600"
        >
          {/* Gerais */}
          <div className="pb-3 mb-3 border-b-2 border-gray-300">
            <h4 className="text-sm font-semibold mb-2 text-gray-700">Gerais</h4>
            
            <div>
              <Label className="text-xs font-medium">Altura: {config.lastOrder.height}px</Label>
              <Slider
                value={[config.lastOrder.height]}
                onValueChange={([value]) => updateConfig('lastOrder.height', value)}
                max={1000}
                min={40}
                step={10}
                className="mt-1"
              />
            </div>
          </div>

          {/* Aparência */}
          <div className="pb-3 mb-3 border-b-2 border-gray-300">
            <h4 className="text-sm font-semibold mb-2 text-gray-700">Aparência</h4>
            
            <div>
              <Label className="text-xs font-medium">Tamanho da Fonte: {config.lastOrder.fontSize}rem</Label>
              <Slider
                value={[config.lastOrder.fontSize]}
                onValueChange={([value]) => updateConfig('lastOrder.fontSize', value)}
                max={80}
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
                  className="h-8 mt-1 border-2"
                />
              </div>
              <div>
                <Label className="text-xs">Cor de Fundo</Label>
                <Input
                  type="color"
                  value={config.lastOrder.backgroundColor || '#ffffff'}
                  onChange={(e) => updateConfig('lastOrder.backgroundColor', e.target.value)}
                  className="h-8 mt-1 border-2"
                />
              </div>
            </div>
          </div>

          {/* Controles */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-gray-700">Controles</h4>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.lastOrder.pulseAnimation}
                  onCheckedChange={(checked) => updateConfig('lastOrder.pulseAnimation', checked)}
                  className="scale-50"
                />
                <Label className="text-xs">Animação Pulsante</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.lastOrder.highlight}
                  onCheckedChange={(checked) => updateConfig('lastOrder.highlight', checked)}
                  className="scale-50"
                />
                <Label className="text-xs">Destacar Último Pedido</Label>
              </div>
            </div>
          </div>
        </ConfigSection>

        {/* Coluna 3 - Publicidade */}
        <ConfigSection
          title="Coluna 3 - Publicidade"
          icon={<Megaphone className="w-4 h-4" />}
          isOpen={openSections.advertising}
          onToggle={() => toggleSection('advertising')}
          colorClass="text-blue-600"
        >
          <SubConfigSection
            title="Gerais"
            isOpen={openSubSections.advertisingGeneral}
            onToggle={() => toggleSubSection('advertisingGeneral')}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={config.advertising.visible} 
                  onCheckedChange={(checked) => updateConfig('advertising.visible', checked)}
                  className="scale-50"
                />
                <Label className="text-xs">Exibir Coluna</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={config.advertising.headerVisible} 
                  onCheckedChange={(checked) => updateConfig('advertising.headerVisible', checked)}
                  className="scale-50"
                />
                <Label className="text-xs">Exibir Cabeçalho</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={config.advertising.showBorder || false} 
                  onCheckedChange={(checked) => updateConfig('advertising.showBorder', checked)}
                  className="scale-50"
                />
                <Label className="text-xs">Tem Borda</Label>
              </div>

              <div>
                <Label className="text-xs font-medium">Largura (%): {config.advertising.width}</Label>
                <Slider
                  value={[config.advertising.width]}
                  onValueChange={([value]) => updateConfig('advertising.width', value)}
                  max={50}
                  min={10}
                  step={1}
                  className="mt-1"
                />
              </div>
            </div>
          </SubConfigSection>

          <SubConfigSection
            title="Cabeçalho"
            isOpen={openSubSections.advertisingHeader}
            onToggle={() => toggleSubSection('advertisingHeader')}
          >
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium">Altura do Cabeçalho: {config.advertising.headerHeight}px</Label>
                <Slider
                  value={[config.advertising.headerHeight]}
                  onValueChange={([value]) => updateConfig('advertising.headerHeight', value)}
                  max={180}
                  min={32}
                  step={4}
                  className="mt-1"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Dimensões baseadas no espaço real disponível (calculadas dinamicamente)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Cor Fundo Cabeçalho</Label>
                  <Input
                    type="color"
                    value={config.advertising.headerBg}
                    onChange={(e) => updateConfig('advertising.headerBg', e.target.value)}
                    className="h-8 mt-1 border-2"
                  />
                </div>
                <div>
                  <Label className="text-xs">Cor Fonte Cabeçalho</Label>
                  <Input
                    type="color"
                    value={config.advertising.headerColor}
                    onChange={(e) => updateConfig('advertising.headerColor', e.target.value)}
                    className="h-8 mt-1 border-2"
                  />
                </div>
              </div>
            </div>
          </SubConfigSection>

          <SubConfigSection
            title="Conteúdo"
            isOpen={openSubSections.advertisingContent}
            onToggle={() => toggleSubSection('advertisingContent')}
          >
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium">URL do Website</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={config.advertising.websiteUrl || ''}
                    onChange={(e) => updateConfig('advertising.websiteUrl', e.target.value)}
                    placeholder="https://exemplo.com/pagina"
                    className="text-xs flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (config.advertising.websiteUrl) {
                        window.open(config.advertising.websiteUrl, '_blank');
                      } else {
                        toast({
                          title: "Atenção",
                          description: "Digite uma URL primeiro",
                          variant: "destructive"
                        });
                      }
                    }}
                    disabled={!config.advertising.websiteUrl}
                    title="Testar URL em nova aba"
                  >
                    Testar
                  </Button>
                </div>
                <div className="text-xs text-black font-medium mt-1">
                  Se preenchido, será exibido como iframe (tem prioridade sobre imagem)
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium">URL ou Path da Imagem</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={config.advertising.imageUrl || ''}
                    onChange={(e) => updateConfig('advertising.imageUrl', e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg ou /assets/imagem.jpg"
                    className="text-xs flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          // Criar URL temporária para visualização
                          const fileUrl = URL.createObjectURL(file);
                          updateConfig('advertising.imageUrl', fileUrl);
                        }
                      };
                      input.click();
                    }}
                  >
                    ...
                  </Button>
                </div>
              </div>

              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={Boolean(config.advertising.newsMode)} 
                    onCheckedChange={(checked) => {
                      console.log('Toggle changed to:', checked);
                      updateConfig('advertising.newsMode', checked);
                      
                      // Limpar outras configurações quando ativar notícias
                      if (checked) {
                        setTimeout(() => {
                          updateConfig('advertising.websiteUrl', '');
                          updateConfig('advertising.imageUrl', '');
                        }, 100);
                      }
                    }}
                    className="scale-75"
                  />
                  <Label 
                    className="text-xs font-medium cursor-pointer flex-1"
                    onClick={() => {
                      const newValue = !Boolean(config.advertising.newsMode);
                      console.log('Label clicked, toggling to:', newValue);
                      updateConfig('advertising.newsMode', newValue);
                    }}
                  >
                    Exibir Feed de Conteúdo
                  </Label>
                </div>
                {config.advertising.newsMode && (
                  <div className="space-y-3">
                    <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-md border border-blue-200">
                      <div className="space-y-1">
                        <div>✓ Feed automático será exibido</div>
                        <div>✓ Rotação automática a cada 25 segundos</div>
                        <div>✓ Layout otimizado para espaço disponível</div>
                        <div>🍽️ Perfeito para restaurantes: sites gastronômicos disponíveis</div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium">Fonte de Conteúdo</Label>
                      <Select 
                        value={config.advertising.newsSource || 'g1'} 
                        onValueChange={(value) => updateConfig('advertising.newsSource', value)}
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Selecione a fonte" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="panelinha">Panelinha - Receitas e Culinária</SelectItem>
                          <SelectItem value="cybercook">CyberCook - Receitas e Dicas</SelectItem>
                          <SelectItem value="tudogostoso">TudoGostoso - Receitas</SelectItem>
                          <SelectItem value="foodnetwork">Food Network - Gastronomia</SelectItem>
                          <SelectItem value="g1">G1 - Notícias Globo</SelectItem>
                          <SelectItem value="uol">UOL - Notícias</SelectItem>
                          <SelectItem value="cnn">CNN Brasil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium">Tamanho da Fonte: {config.advertising.newsFontSize || 2.5}rem</Label>
                      <Slider
                        value={[config.advertising.newsFontSize || 2.5]}
                        onValueChange={([value]) => updateConfig('advertising.newsFontSize', value)}
                        max={6}
                        min={1}
                        step={0.5}
                        className="mt-1"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Ideal para visualização à distância na praça de alimentação
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      🌐 <strong>URL Standalone:</strong> <code>{window.location.origin}/news</code>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`${window.location.origin}/news`, '_blank')}
                      className="text-xs h-8"
                    >
                      Abrir URL de Notícias ↗
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs font-medium">Cor do Fundo da Coluna</Label>
                <Input
                  type="color"
                  value={config.advertising.backgroundColor}
                  onChange={(e) => updateConfig('advertising.backgroundColor', e.target.value)}
                  className="h-8 mt-1 border-2"
                />
              </div>
            </div>
          </SubConfigSection>
        </ConfigSection>

        {/* Efeitos Sonoros */}
        <ConfigSection
          title="Efeitos Sonoros"
          icon={<Volume2 className="w-4 h-4" />}
          isOpen={openSections.sounds}
          onToggle={() => toggleSection('sounds')}
          colorClass="text-blue-600"
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.sounds.production}
                  onCheckedChange={(checked) => updateConfig('sounds.production', checked)}
                  className="scale-50"
                />
                <Label className="text-xs">Som para Produção</Label>
              </div>
              
              {config.sounds.production && (
                <div className="ml-6 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={config.sounds.productionFile}
                      onChange={(e) => updateConfig('sounds.productionFile', e.target.value)}
                      placeholder="Caminho do arquivo de som"
                      className="text-xs flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'audio/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            updateConfig('sounds.productionFile', file.name);
                          }
                        };
                        input.click();
                      }}
                      className="px-2"
                    >
                      ...
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (config.sounds.productionFile) {
                          try {
                            const audio = new Audio(config.sounds.productionFile);
                            audio.play().catch(error => {
                              console.error('Erro ao tocar som:', error);
                              alert('Erro ao tocar o som. Verifique se o arquivo existe e é válido.');
                            });
                          } catch (error) {
                            console.error('Erro ao criar Audio:', error);
                            alert('Caminho do arquivo inválido.');
                          }
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
                  className="scale-50"
                />
                <Label className="text-xs">Som para Pronto</Label>
              </div>
              
              {config.sounds.ready && (
                <div className="ml-6 space-y-2">
                  <div className="flex gap-2 items-center">
                    <select
                      value={config.sounds.readyFile}
                      onChange={(e) => updateConfig('sounds.readyFile', e.target.value)}
                      className="text-xs border rounded px-2 py-1 flex-1"
                    >
                      <option value="generated">Som Integrado</option>
                      <option value="/sounds/kds_sound_bell2.wav">Arquivo Padrão</option>
                      <option value="">Personalizar...</option>
                    </select>
                  </div>
                   
                  {config.sounds.readyFile === 'generated' && (
                    <div className="space-y-2">
                      <Label className="text-xs">Tipo de Som Integrado</Label>
                      <select
                        value={config.sounds.readySoundType || 'padrao'}
                        onChange={(e) => updateConfig('sounds.readySoundType', e.target.value)}
                        className="text-xs border rounded px-2 py-1 w-full"
                      >
                        <option value="padrao">Padrão (Estilo Aeroporto)</option>
                        <option value="padrao2">Padrão 2 (Sino Duplo)</option>
                      </select>
                       <div className="text-xs text-muted-foreground">
                         {config.sounds.readySoundType === 'padrao' ? 
                           '1-2 tons estilo aeroporto, claro e profissional' :
                           'Som de sino duplo, potente para ambientes ruidosos'
                         }
                       </div>
                       
                       {config.sounds.readySoundType === 'padrao' && (
                         <div className="space-y-2">
                           <Label className="text-xs">Quantidade de Tons (Aeroporto)</Label>
                           <select
                             value={config.sounds.airportTones || 2}
                             onChange={(e) => updateConfig('sounds.airportTones', parseInt(e.target.value))}
                             className="text-xs border rounded px-2 py-1 w-full"
                           >
                             <option value={1}>1 Tom</option>
                             <option value={2}>2 Tons</option>
                           </select>
                           <div className="text-xs text-muted-foreground">
                             {config.sounds.airportTones === 1 ? 
                               'Única nota, ideal para ambientes com muitas notificações' :
                               'Duas notas descendentes, som clássico de aeroporto'
                             }
                           </div>
                         </div>
                       )}
                     </div>
                  )}
                  
                  {config.sounds.readyFile && config.sounds.readyFile !== 'generated' && (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={config.sounds.readyFile}
                        onChange={(e) => updateConfig('sounds.readyFile', e.target.value)}
                        placeholder="Caminho do arquivo de som"
                        className="text-xs flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'audio/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              updateConfig('sounds.readyFile', url);
                            }
                          };
                          input.click();
                        }}
                      >
                        ...
                      </Button>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground mb-2">
                    {config.sounds.readyFile === 'generated' ? 
                      `Som ${config.sounds.readySoundType === 'padrao' ? 
                        `estilo aeroporto (${config.sounds.airportTones || 2} ${config.sounds.airportTones === 1 ? 'tom' : 'tons'})` : 
                        'sino duplo'} otimizado para praças de alimentação` :
                      'Usando arquivo de som personalizado'
                    }
                  </div>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={async () => {
                         if (config.sounds.readyFile) {
                           if (config.sounds.readyFile === 'generated') {
                             // Usar som gerado com tipo específico
                             try {
                               const { notificationSound } = await import('../utils/audioGenerator');
                               await notificationSound.playOrderReadySound(config.sounds.readySoundType || 'padrao', config.sounds.airportTones || 2);
                             } catch (error) {
                               console.error('Erro ao tocar som gerado:', error);
                               alert('Erro ao tocar o som gerado.');
                             }
                           } else {
                             // Usar arquivo de som
                             try {
                               const audio = new Audio(config.sounds.readyFile);
                               audio.play().catch(async (error) => {
                                 console.error('Erro ao tocar som:', error);
                                 // Fallback para som gerado
                                  try {
                                    const { notificationSound } = await import('../utils/audioGenerator');
                                    await notificationSound.playOrderReadySound('padrao', 2);
                                    alert('Arquivo de som indisponível. Usando som gerado integrado.');
                                  } catch (fallbackError) {
                                   alert('Erro ao tocar o som. Verifique se o arquivo existe e é válido.');
                                 }
                               });
                             } catch (error) {
                               console.error('Erro ao criar Audio:', error);
                               alert('Caminho do arquivo inválido.');
                             }
                           }
                         }
                       }}
                       disabled={!config.sounds.readyFile}
                     >
                       Testar
                     </Button>
                </div>
              )}
            </div>
          </div>
        </ConfigSection>

        {/* Text-to-Speech */}
        <ConfigSection
          title="Controle de Voz"
          icon={<Mic className="w-4 h-4" />}
          isOpen={openSections.tts}
          onToggle={() => toggleSection('tts')}
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.textToSpeech.enabled}
                onCheckedChange={(checked) => updateConfig('textToSpeech.enabled', checked)}
                className="scale-50"
              />
              <Label className="text-xs">Ativar Voz</Label>
            </div>
            
            {config.textToSpeech.enabled && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Tipo de Voz</Label>
                  <Select value={config.textToSpeech.voice || 'auto'} onValueChange={(value) => updateConfig('textToSpeech.voice', value)}>
                    <SelectTrigger className="h-6">
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
                    <SelectTrigger className="h-6">
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
                  <Label className="text-xs">Formato dos Números</Label>
                  <Select value={config.textToSpeech.numberMode || 'normal'} onValueChange={(value) => updateConfig('textToSpeech.numberMode', value)}>
                    <SelectTrigger className="h-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal (123)</SelectItem>
                      <SelectItem value="spelled">Soletrado (um dois três)</SelectItem>
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
                      className="h-6"
                    />
                  </div>
                )}

                {/* Configurações de Repetição */}
                <div className="space-y-4 pt-2 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.textToSpeech.repeatEnabled || false}
                      onCheckedChange={(checked) => updateConfig('textToSpeech.repeatEnabled', checked)}
                      className="scale-50"
                    />
                    <Label className="text-xs">Repetir fala</Label>
                  </div>

                  {config.textToSpeech.repeatEnabled && (
                    <div className="grid grid-cols-2 gap-4 ml-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Repetições</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={config.textToSpeech.repeatCount || 2}
                          onChange={(e) => updateConfig('textToSpeech.repeatCount', parseInt(e.target.value))}
                          className="h-6"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Intervalo (s)</Label>
                        <Input
                          type="number"
                          min="5"
                          max="60"
                          value={config.textToSpeech.repeatInterval || 15}
                          onChange={(e) => updateConfig('textToSpeech.repeatInterval', parseInt(e.target.value))}
                          className="h-6"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ConfigSection>

        {/* Auto Expedição */}
        <ConfigSection
          title="Auto Expedição"
          icon={<Clock className="w-4 h-4" />}
          isOpen={openSections.autoExpedition}
          onToggle={() => toggleSection('autoExpedition')}
          colorClass="text-blue-600"
        >
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.autoExpedition.enabled}
              onCheckedChange={(checked) => updateConfig('autoExpedition.enabled', checked)}
              className="scale-50"
            />
            <Label className="text-xs">Utilizar Auto Expedição</Label>
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

        {/* Módulos */}
        <ConfigSection
          title="Indicador de módulos"
          icon={<Puzzle className="w-4 h-4" />}
          isOpen={openSections.modules}
          onToggle={() => toggleSection('modules')}
          colorClass="text-blue-600"
        >
          <div className="pb-2 mb-2 border-b border-gray-200">
            <h4 className="text-sm font-medium mb-1 text-gray-700">Configuração por Módulo</h4>
            <p className="text-xs text-gray-500 mb-2">Configure quais módulos exibirão indicadores nos cards.</p>
          </div>
          
          {Object.entries(config.modules).map(([moduleKey, moduleConfig]) => {
            const moduleLabels = {
              balcao: 'Balcão',
              mesa: 'Mesa', 
              entrega: 'Entrega',
              ficha: 'Ficha'
            };
            
            const moduleColors = {
              balcao: 'bg-green-500',
              mesa: 'bg-blue-500',
              entrega: 'bg-red-500',
              ficha: 'bg-purple-500'
            };
            
            return (
              <div key={moduleKey} className="space-y-1 p-2 rounded-lg border bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center">
                      <div className={cn("w-2.5 h-2.5 rounded-full", moduleColors[moduleKey as keyof typeof moduleColors])}></div>
                    </div>
                    <Switch 
                      checked={moduleConfig.enabled} 
                      onCheckedChange={(checked) => updateConfig(`modules.${moduleKey}.enabled`, checked)}
                      className="scale-50"
                    />
                    <Label className="text-sm font-medium text-gray-700">
                      {moduleLabels[moduleKey as keyof typeof moduleLabels]}
                    </Label>
                  </div>
                </div>
                
                {moduleConfig.enabled && (
                  <div className="flex items-center gap-2 ml-6 mt-1">
                    <Switch 
                      checked={moduleConfig.showIndicator || false} 
                      onCheckedChange={(checked) => updateConfig(`modules.${moduleKey}.showIndicator`, checked)}
                      className="scale-50"
                    />
                    <Label className="text-xs text-gray-600">Exibir indicador</Label>
                  </div>
                )}

                {moduleConfig.enabled && (
                  <div className="ml-6 space-y-1 border-l-2 border-gray-200 pl-3">
                    <Label className="text-xs text-gray-500">Opção de Exibição:</Label>
                    {moduleKey === 'balcao' && (
                      <RadioGroup
                        value={moduleConfig.displayOption}
                        onValueChange={(value: 'numeroVenda' | 'numeroChamada' | 'apelido' | 'apelidoNumeroVenda') => 
                          updateConfig(`modules.${moduleKey}.displayOption`, value)}
                        className="space-y-1"
                      >
                        <div className="flex items-center space-x-1.5">
                          <RadioGroupItem value="numeroVenda" id="balcao-num-venda" />
                          <Label htmlFor="balcao-num-venda" className="text-xs">No. de venda</Label>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <RadioGroupItem value="numeroChamada" id="balcao-num-chamada" />
                          <Label htmlFor="balcao-num-chamada" className="text-xs">No. da chamada</Label>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <RadioGroupItem value="apelido" id="balcao-apelido" />
                          <Label htmlFor="balcao-apelido" className="text-xs">Apelido</Label>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <RadioGroupItem value="apelidoNumeroVenda" id="balcao-apelido-num-venda" />
                          <Label htmlFor="balcao-apelido-num-venda" className="text-xs">Apelido + No. de venda</Label>
                        </div>
                      </RadioGroup>
                    )}
                    
                    {moduleKey === 'entrega' && (
                      <RadioGroup
                        value={moduleConfig.displayOption}
                        onValueChange={(value: 'numeroEntrega' | 'numeroVenda') => 
                          updateConfig(`modules.${moduleKey}.displayOption`, value)}
                        className="space-y-1"
                      >
                        <div className="flex items-center space-x-1.5">
                          <RadioGroupItem value="numeroEntrega" id="entrega-num-entrega" />
                          <Label htmlFor="entrega-num-entrega" className="text-xs">No. de entrega</Label>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <RadioGroupItem value="numeroVenda" id="entrega-num-venda" />
                          <Label htmlFor="entrega-num-venda" className="text-xs">No. da venda (iFood, Rappi...)</Label>
                        </div>
                      </RadioGroup>
                    )}
                    
                    {moduleKey === 'mesa' && (
                      <RadioGroup
                        value={moduleConfig.displayOption}
                        onValueChange={(value: 'numeroMesa' | 'apelidoNumeroMesa') => 
                          updateConfig(`modules.${moduleKey}.displayOption`, value)}
                        className="space-y-1"
                      >
                        <div className="flex items-center space-x-1.5">
                          <RadioGroupItem value="numeroMesa" id="mesa-num-mesa" />
                          <Label htmlFor="mesa-num-mesa" className="text-xs">No. da Mesa</Label>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <RadioGroupItem value="apelidoNumeroMesa" id="mesa-apelido-num-mesa" />
                          <Label htmlFor="mesa-apelido-num-mesa" className="text-xs">Apelido + No. da Mesa</Label>
                        </div>
                      </RadioGroup>
                    )}
                    
                    {moduleKey === 'ficha' && (
                      <RadioGroup
                        value={moduleConfig.displayOption}
                        onValueChange={(value: 'numeroFicha' | 'numeroChamada' | 'nomeCliente' | 'fichaCliente' | 'localEntregaFicha') => 
                          updateConfig(`modules.${moduleKey}.displayOption`, value)}
                        className="space-y-1"
                      >
                        <div className="flex items-center space-x-1.5">
                          <RadioGroupItem value="numeroFicha" id="ficha-num-ficha" />
                          <Label htmlFor="ficha-num-ficha" className="text-xs">No. da ficha</Label>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <RadioGroupItem value="numeroChamada" id="ficha-num-chamada" />
                          <Label htmlFor="ficha-num-chamada" className="text-xs">No. da chamada</Label>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <RadioGroupItem value="nomeCliente" id="ficha-nome-cliente" />
                          <Label htmlFor="ficha-nome-cliente" className="text-xs">Nome do Cliente</Label>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <RadioGroupItem value="fichaCliente" id="ficha-ficha-cliente" />
                          <Label htmlFor="ficha-ficha-cliente" className="text-xs">No.Ficha + Nome do Cliente</Label>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <RadioGroupItem value="localEntregaFicha" id="ficha-local-entrega" />
                          <Label htmlFor="ficha-local-entrega" className="text-xs">Local Entrega + No. da ficha</Label>
                        </div>
                      </RadioGroup>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Tipo de indicador global */}
          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-800">Tipo de Indicador</Label>
              <Select
                value={config.production.cardConfig.moduleIndicator || 'tag'}
                onValueChange={(value) => {
                  console.log('Selecionando tipo de indicador:', value);
                  console.log('Config antes:', config.production.cardConfig);
                  updateConfig('production.cardConfig.moduleIndicator', value);
                  updateConfig('ready.cardConfig.moduleIndicator', value);
                  console.log('Config depois:', config.production.cardConfig);
                }}
              >
                <SelectTrigger className="w-full h-8 bg-white">
                  <SelectValue placeholder="Selecione o tipo de indicador" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                  <SelectItem value="bullet" className="hover:bg-gray-100">Bullets (bolinhas coloridas)</SelectItem>
                  <SelectItem value="tag" className="hover:bg-gray-100">Etiquetas discretas</SelectItem>
                  <SelectItem value="border" className="hover:bg-gray-100">Bordas coloridas</SelectItem>
                  <SelectItem value="none" className="hover:bg-gray-100">Nenhum indicador</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-600">
                {config.production.cardConfig.moduleIndicator === 'bullet' 
                  ? "Bolinhas coloridas no canto superior direito" 
                  : config.production.cardConfig.moduleIndicator === 'tag'
                  ? "Etiquetas com cores pastel e nome do módulo/plataforma"
                  : config.production.cardConfig.moduleIndicator === 'border'
                  ? "Bordas coloridas em volta do cartão"
                  : "Nenhum indicador será exibido"
                }
              </div>
            </div>
          </div>
            
          {/* Resumo visual do status da coluna */}
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                Object.values(config.modules).some(m => m.enabled && m.showIndicator) 
                  ? "bg-green-500" 
                  : "bg-gray-400"
              )}></div>
              <span className="text-sm font-medium text-gray-700">
                Status: {
                  Object.values(config.modules).some(m => m.enabled && m.showIndicator)
                    ? "Alguns módulos exibirão indicadores"
                    : "Nenhum módulo exibirá indicadores"
                }
              </span>
            </div>
          </div>
        </ConfigSection>

        {/* Diversos */}
        <ConfigSection
          title="Diversos"
          icon={<Wrench className="w-4 h-4" />}
          isOpen={openSections.diversos}
          onToggle={() => toggleSection('diversos')}
          colorClass="text-blue-600"
        >
          <SubConfigSection
            title="Conexão com Banco"
            isOpen={openSubSections.diversosDatabase}
            onToggle={() => toggleSubSection('diversosDatabase')}
            icon={<Database className="w-3 h-3" />}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Integrado com kds da hora</Label>
                <Switch
                  checked={config.database?.kdsIntegration || false}
                  onCheckedChange={(checked) => updateConfig('database.kdsIntegration', checked)}
                  className="scale-75"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Tipo de Banco</Label>
                <Select
                  value={config.database?.type || 'none'}
                  onValueChange={(value) => updateConfig('database.type', value)}
                >
                  <SelectTrigger className="h-6">
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
                      className="h-6"
                      placeholder="localhost"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Porta</Label>
                    <Input
                      value={config.database?.port || ''}
                      onChange={(e) => updateConfig('database.port', e.target.value)}
                      className="h-6"
                      placeholder="5432"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Database</Label>
                    <Input
                      value={config.database?.database || ''}
                      onChange={(e) => updateConfig('database.database', e.target.value)}
                      className="h-6"
                      placeholder="database_name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Usuário</Label>
                    <Input
                      value={config.database?.username || ''}
                      onChange={(e) => updateConfig('database.username', e.target.value)}
                      className="h-6"
                      placeholder="username"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Senha</Label>
                    <Input
                      type="password"
                      value={config.database?.password || ''}
                      onChange={(e) => updateConfig('database.password', e.target.value)}
                      className="h-6"
                      placeholder="password"
                    />
                  </div>
                </div>
              )}
            </div>
          </SubConfigSection>

          <SubConfigSection
            title="Backup & Config"
            isOpen={openSubSections.diversosBackup}
            onToggle={() => toggleSubSection('diversosBackup')}
            icon={<Download className="w-3 h-3" />}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
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
                  className="text-xs h-8"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Exportar
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
                  className="text-xs h-8"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Restaurar
                </Button>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full text-xs h-8"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Config. de Fábrica
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Restaurar Configurações</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja restaurar as configurações de fábrica? 
                      Todas as suas configurações personalizadas serão perdidas.
                      Os pedidos existentes não serão afetados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onConfigChange(defaultConfig);
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Restaurar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </SubConfigSection>

          <SubConfigSection
            title="Dados da Loja"
            isOpen={openSubSections.diversosStore}
            onToggle={() => toggleSubSection('diversosStore')}
            icon={<Store className="w-3 h-3" />}
          >
            <div className="space-y-1">
              <div className="space-y-1">
                <Label className="text-xs">CNPJ</Label>
                <Input
                  value={config.store?.cnpj || ''}
                  onChange={(e) => {
                    // Remove formatação e valida
                    const cnpj = e.target.value.replace(/\D/g, '');
                    updateConfig('store.cnpj', cnpj);
                  }}
                  className="h-6"
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  onBlur={(e) => {
                    // Formatação para exibição
                    const cnpj = e.target.value.replace(/\D/g, '');
                    if (cnpj.length === 14) {
                      const formatted = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
                      e.target.value = formatted;
                    }
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Razão Social</Label>
                <Input
                  value={config.store?.razaoSocial || ''}
                  onChange={(e) => updateConfig('store.razaoSocial', e.target.value)}
                  className="h-6"
                  placeholder="Empresa Ltda"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Nome Fantasia</Label>
                <Input
                  value={config.store?.nomeFantasia || ''}
                  onChange={(e) => updateConfig('store.nomeFantasia', e.target.value)}
                  className="h-6"
                  placeholder="Nome da Loja"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Número da Licença</Label>
                <Input
                  value={config.store?.numeroLicenca || ''}
                  onChange={(e) => updateConfig('store.numeroLicenca', e.target.value)}
                  className="h-6"
                  placeholder="LIC-12345"
                />
              </div>
            </div>
          </SubConfigSection>

          <SubConfigSection
            title="Identificação do Painel"
            isOpen={openSubSections.diversosPanel}
            onToggle={() => toggleSubSection('diversosPanel')}
            icon={<Monitor className="w-3 h-3" />}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Número do Painel</Label>
                  <Input
                    type="number"
                    min="1"
                    value={config.panel.id}
                    onChange={(e) => onConfigChange({
                      ...config,
                      panel: { ...config.panel, id: parseInt(e.target.value) || 1 }
                    })}
                    className="h-6"
                  />
                </div>
                <div>
                  <Label className="text-xs">Onde Exibir</Label>
                  <Select
                    value={config.panel.displayLocation}
                     onValueChange={(value: 'column3' | 'above-headers' | 'none') => 
                       onConfigChange({
                         ...config,
                         panel: { ...config.panel, displayLocation: value }
                       })
                     }
                  >
                    <SelectTrigger className="h-6">
                      <SelectValue />
                    </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="none">Não exibir</SelectItem>
                       <SelectItem value="column3">Coluna 3</SelectItem>
                       <SelectItem value="above-headers">Header</SelectItem>
                     </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Nome do Painel</Label>
                <Input
                  type="text"
                  value={config.panel.name}
                  onChange={(e) => onConfigChange({
                    ...config,
                    panel: { ...config.panel, name: e.target.value }
                  })}
                  className="h-6"
                  placeholder="Ex: Painel Principal"
                />
              </div>
              <div>
                <Label className="text-xs">Localização</Label>
                <Input
                  type="text"
                  value={config.panel.location}
                  onChange={(e) => onConfigChange({
                    ...config,
                    panel: { ...config.panel, location: e.target.value }
                  })}
                  className="h-6"
                  placeholder="Ex: Balcão Principal"
                />
              </div>
            </div>
          </SubConfigSection>

          <SubConfigSection
            title="Tela Inicial"
            isOpen={openSubSections.diversosScreen}
            onToggle={() => toggleSubSection('diversosScreen')}
            icon={<Eye className="w-3 h-3" />}
          >
            <div className="flex items-center justify-between">
              <Label className="text-xs">Exibir tela de splash</Label>
              <Switch
                checked={config.splash?.enabled ?? true}
                onCheckedChange={(checked) => updateConfig('splash.enabled', checked)}
                className="scale-75"
              />
            </div>
          </SubConfigSection>
        </ConfigSection>

        
        {/* Simulação */}
        <ConfigSection
          title="Simulação"
          icon={<Cog className="w-4 h-4" />}
          isOpen={openSections.simulation}
          onToggle={() => toggleSection('simulation')}
          colorClass="text-blue-600"
        >
          <div className="space-y-4">
            {/* Resumo Dinâmico da Simulação */}
            <div className="bg-teal-50 border border-teal-200 rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold text-teal-800">Resumo da Configuração</Label>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 text-teal-600 hover:text-teal-800"
                      title="Ver dicas sobre simulação"
                    >
                      <Lightbulb className="w-3 h-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        Dicas de Simulação
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-left space-y-2">
                        <div><strong>Simulação Manual:</strong> Use os botões para gerar pedidos específicos na quantidade desejada.</div>
                        <div><strong>Simulação Automática:</strong> Ativa geração contínua de pedidos baseado no intervalo e quantidade configurados.</div>
                        <div><strong>Módulos Ativos:</strong> Apenas os módulos habilitados receberão pedidos simulados.</div>
                        <div><strong>Distribuição:</strong> Os pedidos são distribuídos aleatoriamente entre os módulos ativos.</div>
                        <div className="text-amber-600"><strong>⚠️ Importante:</strong> A simulação automática continuará gerando pedidos até ser desativada.</div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction>Entendi</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              
              <div className="space-y-1 text-xs text-teal-700">
                {config.simulation?.enabled ? (
                  <>
                    <div>📍 <strong>Automática:</strong> Gera {config.simulation?.ordersPerInterval || 1} pedido(s) a cada {config.simulation?.intervalSeconds || 30} segundos</div>
                    <div>🎯 <strong>Distribuição:</strong> Entre {Object.entries(config.modules || {}).filter(([_, mod]) => mod.enabled).length || 0} módulos ativos</div>
                  </>
                ) : (
                  <div>📍 <strong>Manual:</strong> Use os botões para gerar pedidos conforme necessário</div>
                )}
                
                <div className="mt-2 pt-2 border-t border-teal-200">
                  <div className="font-medium mb-1">Módulos Ativos:</div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(config.modules || {})
                      .filter(([_, mod]) => mod.enabled)
                      .map(([key, mod]) => {
                        const colors = {
                          balcao: 'bg-blue-100 text-blue-800',
                          entrega: 'bg-green-100 text-green-800', 
                          mesa: 'bg-purple-100 text-purple-800',
                          ficha: 'bg-orange-100 text-orange-800'
                        };
                        return (
                          <span key={key} className={`px-1.5 py-0.5 rounded text-xs font-medium ${colors[key as keyof typeof colors]}`}>
                            {key.toUpperCase()} ({mod.displayOption})
                          </span>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

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
                <Button
                  onClick={() => {
                    const input = document.getElementById('newOrdersCount') as HTMLInputElement;
                    const count = parseInt(input?.value || '30');
                    generateOrders?.(count);
                  }}
                  variant="default"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Gerar Pedidos
                </Button>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  defaultValue="30"
                  id="newOrdersCount"
                  className="h-8 w-16 text-center"
                />
                <span className="text-gray-500">-</span>
              </div>
            </div>
            
            <div className="space-y-3 border-t pt-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Simulação Automática:</Label>
                <div className="flex items-center space-x-1.5">
                  <Switch
                    checked={config.simulation?.enabled || false}
                    onCheckedChange={(checked) => updateConfig('simulation.enabled', checked)}
                    className="scale-50"
                  />
                  <Label className="text-xs">Ativar geração automática</Label>
                </div>
                
                {config.simulation?.enabled && (
                  <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                    <div>
                      <Label className="text-xs font-medium">Gerar a cada: {config.simulation?.intervalSeconds || 30} segundos</Label>
                      <Slider
                        value={[config.simulation?.intervalSeconds || 30]}
                        onValueChange={([value]) => updateConfig('simulation.intervalSeconds', value)}
                        max={180}
                        min={15}
                        step={15}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium">Quantidade no intervalo: {config.simulation?.ordersPerInterval || 1}</Label>
                      <Slider
                        value={[config.simulation?.ordersPerInterval || 1]}
                        onValueChange={([value]) => updateConfig('simulation.ordersPerInterval', value)}
                        max={10}
                        min={1}
                        step={1}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {config.autoExpedition.enabled && (
                <div className="space-y-1 bg-orange-50 p-2 rounded border">
                  <Label className="text-xs font-medium text-orange-700">Auto Expedição Ativa</Label>
                  <div className="text-xs text-orange-600">
                    Pedidos serão expedidos após {config.autoExpedition.minutes} minutos
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2 border-t pt-3">
              <Label className="text-xs font-medium">Módulos Ativos:</Label>
              <div className="flex flex-col gap-1 text-xs">
                {config.modules.balcao.enabled && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>BALCÃO ({config.modules.balcao.displayOption})</span>
                  </div>
                )}
                {config.modules.entrega.enabled && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>ENTREGA ({config.modules.entrega.displayOption})</span>
                  </div>
                )}
                {config.modules.mesa.enabled && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span>MESA ({config.modules.mesa.displayOption})</span>
                  </div>
                )}
                {config.modules.ficha.enabled && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span>FICHA ({config.modules.ficha.displayOption})</span>
                  </div>
                )}
                {!config.modules.balcao.enabled && !config.modules.entrega.enabled && !config.modules.mesa.enabled && !config.modules.ficha.enabled && (
                  <span className="text-gray-500 italic">Nenhum módulo ativo</span>
                )}
              </div>
            </div>
          </div>
        </ConfigSection>

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