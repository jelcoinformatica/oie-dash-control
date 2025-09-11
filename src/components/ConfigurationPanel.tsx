import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { PanelConfig } from '../types/order';
import { Settings, Palette, Factory, CheckCircle, Monitor, Volume2, Clock, Puzzle, Cog } from 'lucide-react';

interface ConfigurationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: PanelConfig;
  onConfigChange: (config: PanelConfig) => void;
}

const fontOptions = [
  'Arial', 'Arial Black', 'Calibri', 'Cambria', 'Candara',
  'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel',
  'Courier New', 'Georgia', 'Impact', 'Lucida Console',
  'Segoe UI', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'
];

export const ConfigurationPanel = ({
  open,
  onOpenChange,
  config,
  onConfigChange
}: ConfigurationPanelProps) => {
  const [activeTab, setActiveTab] = useState('production');

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações do Sistema
          </DialogTitle>
        </DialogHeader>

        <Accordion type="multiple" className="w-full">
          {/* Fundo da Aplicação */}
          <AccordionItem value="background">
            <AccordionTrigger className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Fundo da Aplicação
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cor de Fundo</Label>
                  <Input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Coluna Produção */}
          <AccordionItem value="production">
            <AccordionTrigger className="flex items-center gap-2">
              <Factory className="w-4 h-4" />
              Coluna 1 - Produção
            </AccordionTrigger>
            <AccordionContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.production.visible}
                  onCheckedChange={(checked) => updateConfig('production.visible', checked)}
                />
                <Label>Exibir Coluna</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Título da Coluna</Label>
                  <Input
                    value={config.production.title}
                    onChange={(e) => updateConfig('production.title', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Largura (%): {config.production.width}</Label>
                  <Slider
                    value={[config.production.width]}
                    onValueChange={([value]) => updateConfig('production.width', value)}
                    max={50}
                    min={10}
                    step={1}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Cabeçalho</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cor de Fundo</Label>
                    <Input
                      type="color"
                      value={config.production.headerBg}
                      onChange={(e) => updateConfig('production.headerBg', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Cor da Fonte</Label>
                    <Input
                      type="color"
                      value={config.production.headerColor}
                      onChange={(e) => updateConfig('production.headerColor', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Configurações dos Cards</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Colunas: {config.production.cardConfig.columns}</Label>
                    <Slider
                      value={[config.production.cardConfig.columns]}
                      onValueChange={([value]) => updateConfig('production.cardConfig.columns', value)}
                      max={4}
                      min={1}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label>Linhas: {config.production.cardConfig.rows}</Label>
                    <Slider
                      value={[config.production.cardConfig.rows]}
                      onValueChange={([value]) => updateConfig('production.cardConfig.rows', value)}
                      max={8}
                      min={1}
                      step={1}
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Coluna Prontos */}
          <AccordionItem value="ready">
            <AccordionTrigger className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Coluna 2 - Prontos
            </AccordionTrigger>
            <AccordionContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.ready.visible}
                  onCheckedChange={(checked) => updateConfig('ready.visible', checked)}
                />
                <Label>Exibir Coluna</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Título da Coluna</Label>
                  <Input
                    value={config.ready.title}
                    onChange={(e) => updateConfig('ready.title', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Largura (%): {config.ready.width}</Label>
                  <Slider
                    value={[config.ready.width]}
                    onValueChange={([value]) => updateConfig('ready.width', value)}
                    max={60}
                    min={10}
                    step={1}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Último Pedido</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Altura: {config.lastOrder.height}px</Label>
                    <Slider
                      value={[config.lastOrder.height]}
                      onValueChange={([value]) => updateConfig('lastOrder.height', value)}
                      max={360}
                      min={40}
                      step={10}
                    />
                  </div>
                  <div>
                    <Label>Tamanho da Fonte: {config.lastOrder.fontSize}rem</Label>
                    <Slider
                      value={[config.lastOrder.fontSize]}
                      onValueChange={([value]) => updateConfig('lastOrder.fontSize', value)}
                      max={30}
                      min={1}
                      step={0.5}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.lastOrder.pulseAnimation}
                      onCheckedChange={(checked) => updateConfig('lastOrder.pulseAnimation', checked)}
                    />
                    <Label>Animação Pulsante</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.lastOrder.highlight}
                      onCheckedChange={(checked) => updateConfig('lastOrder.highlight', checked)}
                    />
                    <Label>Destacar Último Pedido</Label>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Publicidade */}
          <AccordionItem value="advertising">
            <AccordionTrigger className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Coluna 3 - Publicidade
            </AccordionTrigger>
            <AccordionContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.advertising.visible}
                  onCheckedChange={(checked) => updateConfig('advertising.visible', checked)}
                />
                <Label>Exibir Coluna</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Largura (%): {config.advertising.width}</Label>
                  <Slider
                    value={[config.advertising.width]}
                    onValueChange={([value]) => updateConfig('advertising.width', value)}
                    max={50}
                    min={10}
                    step={1}
                  />
                </div>
                <div>
                  <Label>URL da Imagem</Label>
                  <Input
                    value={config.advertising.imageUrl || ''}
                    onChange={(e) => updateConfig('advertising.imageUrl', e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Efeitos Sonoros */}
          <AccordionItem value="sounds">
            <AccordionTrigger className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Efeitos Sonoros
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.sounds.production}
                  onCheckedChange={(checked) => updateConfig('sounds.production', checked)}
                />
                <Label>Som para Produção</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.sounds.ready}
                  onCheckedChange={(checked) => updateConfig('sounds.ready', checked)}
                />
                <Label>Som para Pronto</Label>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Auto Expedição */}
          <AccordionItem value="auto-expedition">
            <AccordionTrigger className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Auto Expedição
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.autoExpedition.enabled}
                  onCheckedChange={(checked) => updateConfig('autoExpedition.enabled', checked)}
                />
                <Label>Utilizar Auto Expedição</Label>
              </div>
              <div>
                <Label>Após quantos minutos: {config.autoExpedition.minutes}</Label>
                <Slider
                  value={[config.autoExpedition.minutes]}
                  onValueChange={([value]) => updateConfig('autoExpedition.minutes', value)}
                  max={60}
                  min={1}
                  step={1}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Módulos */}
          <AccordionItem value="modules">
            <AccordionTrigger className="flex items-center gap-2">
              <Puzzle className="w-4 h-4" />
              Módulos
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.modules.balcao}
                    onCheckedChange={(checked) => updateConfig('modules.balcao', checked)}
                  />
                  <Label>Balcão</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.modules.mesa}
                    onCheckedChange={(checked) => updateConfig('modules.mesa', checked)}
                  />
                  <Label>Mesa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.modules.entrega}
                    onCheckedChange={(checked) => updateConfig('modules.entrega', checked)}
                  />
                  <Label>Entrega</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.modules.ficha}
                    onCheckedChange={(checked) => updateConfig('modules.ficha', checked)}
                  />
                  <Label>Ficha</Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};