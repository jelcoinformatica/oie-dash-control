import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Settings, Send } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ControlPanelProps {
  onConfigClick: () => void;
  onExpedite: (orderNumber: string) => void;
  expeditionLog?: string[];
}

export const ControlPanel = ({ 
  onConfigClick, 
  onExpedite,
  expeditionLog = []
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
    <div className="bg-card border-t shadow-sm" style={{ height: '26px' }}>
      <div className="container mx-auto px-2 py-0.5 flex items-center justify-between h-full">
        <div className="text-xs text-muted-foreground">
          Oie! v.5.0
        </div>
        
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1">
            <Input
              placeholder="No.Pedido"
              value={expeditionInput}
              onChange={(e) => setExpeditionInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-20 h-5 text-xs text-center placeholder:opacity-30"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleExpedite}
                    size="sm"
                    disabled={!expeditionInput.trim()}
                    variant="ghost"
                    className="h-5 w-5 p-0 border-0"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Expedir</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Log visual dos últimos pedidos expedidos */}
            {expeditionLog.length > 0 && (
              <div className="flex items-center gap-1 ml-2">
                {expeditionLog.map((order, index) => (
                  <span 
                    key={`${order}-${index}`}
                    className="text-xs bg-muted px-1 rounded opacity-50"
                    style={{ opacity: 0.8 - (index * 0.2) }}
                  >
                    {order}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onConfigClick}
          className="h-5 w-5 p-0 border-0"
        >
          <Settings className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};