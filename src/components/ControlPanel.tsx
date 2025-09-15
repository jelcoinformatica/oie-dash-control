import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Settings, Send } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ControlPanelProps {
  onConfigClick: () => void;
  onExpedite: (orderNumber: string) => void;
  expeditionLog?: string[];
  configOpen?: boolean;
}

export const ControlPanel = ({ 
  onConfigClick, 
  onExpedite,
  expeditionLog = [],
  configOpen = false
}: ControlPanelProps) => {
  const [expeditionInput, setExpeditionInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus no campo de expedição quando não estiver em configuração
  useEffect(() => {
    if (!configOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [configOpen]);

  const handleExpedite = () => {
    if (!expeditionInput.trim()) {
      // Não exibe toast para erro de expedição
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
          Oie! v.5.0 | Jelco Informática (2025)
        </div>
        
        {/* Prompt fixo no centro */}
        <div className="fixed left-1/2 transform -translate-x-1/2 flex items-center gap-1">
          <Input
            ref={inputRef}
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
        </div>
        
        {/* Log visual dos últimos pedidos expedidos - posição fixa à direita do prompt */}
        {expeditionLog.length > 0 && (
          <div className="fixed left-1/2 transform -translate-x-1/2 ml-32 text-xs" style={{ color: 'rgba(0,0,0,0.5)' }}>
            {expeditionLog.map((order, index) => order.replace(/[^\d]/g, '')).join(', ')}
          </div>
        )}
        
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