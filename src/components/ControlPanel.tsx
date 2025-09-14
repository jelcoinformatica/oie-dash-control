import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Settings, Send } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ControlPanelProps {
  onConfigClick: () => void;
  onExpedite: (orderNumber: string) => void;
}

export const ControlPanel = ({ 
  onConfigClick, 
  onExpedite
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
    <div className="bg-card border-t shadow-sm" style={{ height: '29px' }}>
      <div className="container mx-auto px-4 py-0.5 flex items-center justify-between h-full">
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1">
            <Input
              placeholder="Pedido"
              value={expeditionInput}
              onChange={(e) => setExpeditionInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-24 h-6 text-xs text-center"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleExpedite}
                    size="sm"
                    disabled={!expeditionInput.trim()}
                    variant="ghost"
                    className="h-6 w-6 p-0"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Expedir</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onConfigClick}
          className="h-6 w-6 p-0"
        >
          <Settings className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};