import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Settings, RefreshCw, Play, Pause } from 'lucide-react';
import { toast } from '../hooks/use-toast';

interface ControlPanelProps {
  onConfigClick: () => void;
  onExpedite: (orderNumber: string) => void;
  onRefresh: () => void;
  loading?: boolean;
  onToggleSimulation: () => void;
  isSimulationActive: boolean;
}

export const ControlPanel = ({ 
  onConfigClick, 
  onExpedite, 
  onRefresh,
  loading = false,
  onToggleSimulation,
  isSimulationActive
}: ControlPanelProps) => {
  const [expeditionInput, setExpeditionInput] = useState('');

  const handleExpedite = () => {
    if (!expeditionInput.trim()) {
      toast({
        title: "Erro",
        description: "Digite o número do pedido para expedir",
        variant: "destructive"
      });
      return;
    }

    onExpedite(expeditionInput.trim());
    setExpeditionInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleExpedite();
    }
  };

  return (
    <div className="bg-card border-t shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            OIE! v.5.0 - Jelco Informática (2025)
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Número do pedido"
                value={expeditionInput}
                onChange={(e) => setExpeditionInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-40"
              />
              <Button 
                onClick={handleExpedite}
                size="sm"
                disabled={!expeditionInput.trim()}
              >
                Expedir
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              variant={isSimulationActive ? "destructive" : "outline"}
              size="sm"
              onClick={onToggleSimulation}
            >
              {isSimulationActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onConfigClick}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};