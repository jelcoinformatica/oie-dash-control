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
    
    toast({
      title: "Backup exportado",
      description: "Configurações exportadas com sucesso",
      duration: 3000,
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
              duration: 3000,
            });
          } catch (error) {
            toast({
              title: "Erro no backup",
              description: "Arquivo de backup inválido",
              variant: "destructive",
              duration: 3000,
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
      duration: 3000,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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
                  <Label className="text-xs">Database</Label>
                  <Input
                    value={config.database?.database || ''}
                    onChange={(e) => updateConfig('database.database', e.target.value)}
                    className="h-8"
                    placeholder="nome_banco"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">User</Label>
                  <Input
                    value={config.database?.username || ''}
                    onChange={(e) => updateConfig('database.username', e.target.value)}
                    className="h-8"
                    placeholder="usuario"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Password</Label>
                  <Input
                    type="password"
                    value={config.database?.password || ''}
                    onChange={(e) => updateConfig('database.password', e.target.value)}
                    className="h-8"
                    placeholder="senha"
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
              </div>
            </div>

            {/* Backup */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-medium">Backup</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleBackupExport}
                  className="h-8 flex-1"
                >
                  Exportar Configurações
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBackupImport}
                  className="h-8 flex-1"
                >
                  Restaurar Backup
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="h-8 flex-1">
                      Restaurar Configurações de Fábrica
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Restaurar Configurações de Fábrica</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação irá apagar todas as configurações personalizadas e restaurar os valores padrão. Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleFactoryReset}>
                        Restaurar Configurações de Fábrica
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
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