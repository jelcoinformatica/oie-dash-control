import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Settings, Send, Maximize, Minimize, BookOpen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useIsTablet } from '../hooks/use-mobile';
import { UserManual } from './UserManual';

interface ControlPanelProps {
  onConfigClick: () => void;
  onExpedite: (orderNumber: string) => void;
  expeditionLog?: Array<{orderNumber: string, nickname?: string, expeditionTime: Date, isAutoExpedition?: boolean}>;
  configOpen?: boolean;
  isKioskMode?: boolean;
  onToggleKiosk: () => void;
}

export const ControlPanel = ({ 
  onConfigClick, 
  onExpedite,
  expeditionLog = [],
  configOpen = false,
  isKioskMode = true,
  onToggleKiosk
}: ControlPanelProps) => {
  const [expeditionInput, setExpeditionInput] = useState('');
  const [recentAutoExpedited, setRecentAutoExpedited] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const isTablet = useIsTablet();

  // Focus inicial no input quando componente monta
  useEffect(() => {
    if (inputRef.current && !configOpen) {
      inputRef.current.focus();
    }
  }, []);

  // Rastrear últimos pedidos expedidos para efeito de 2s
  useEffect(() => {
    if (expeditionLog.length > 0) {
      const latestExpedited = expeditionLog[0]; // Primeiro da lista (mais recente)
      const key = `${latestExpedited.orderNumber}-${latestExpedited.expeditionTime.getTime()}`;
      
      setRecentAutoExpedited(prev => new Set(prev).add(key));
      
      // Remover o efeito após 2 segundos
      setTimeout(() => {
        setRecentAutoExpedited(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }, 2000);
    }
  }, [expeditionLog]);

  const handleExpedite = () => {
    if (!expeditionInput.trim()) {
      return;
    }

    // Comando especial para fechar o sistema no modo kiosk
    if (expeditionInput.trim() === '000') {
      if (window.confirm('Deseja realmente fechar o sistema?')) {
        window.close();
        // Fallback para tentar sair do fullscreen se window.close() não funcionar
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
      setExpeditionInput('');
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
    <div 
      className={`bg-card border-t shadow-sm relative ${isTablet ? 'fixed bottom-0 left-0 right-0 z-[100]' : ''}`} 
      style={{ 
        height: isTablet ? '48px' : '32px', 
        minHeight: isTablet ? '48px' : '32px',
        boxShadow: isTablet ? '0 -4px 12px rgba(0, 0, 0, 0.1)' : undefined
      }}
    >
      <div className={`container mx-auto px-2 flex items-center justify-between h-full relative ${isTablet ? 'py-2' : 'py-1'}`}>
        <div className="text-xs text-muted-foreground flex-shrink-0 flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleKiosk}
                  className="h-4 w-4 p-0 border-0"
                >
                  {isKioskMode ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isKioskMode ? 'Sair do modo kiosk' : 'Entrar no modo kiosk'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="flex items-center gap-1">
            <span>Oie! <span className="font-mono text-xs">v.5.0.1</span></span>
            <span className="text-muted-foreground/60">|</span>
            <span>Host: <span className="font-mono text-xs">servidor</span></span>
            <span className="text-muted-foreground/60">|</span>
            <span>Database: <span className="font-mono text-xs">colibri</span></span>
            <span className="text-muted-foreground/60">|</span>
          </div>
          
          <UserManual>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 border-0 flex items-center justify-center"
            >
              <BookOpen className="w-3 h-3 text-muted-foreground" />
            </Button>
          </UserManual>
        </div>
        
        {/* Prompt de expedição perfeitamente centralizado */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1">
          <Input
            ref={inputRef}
            placeholder="No.Pedido"
            value={expeditionInput}
            onChange={(e) => setExpeditionInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-20 h-5 text-xs text-center placeholder:opacity-30 border-black/60 shadow-sm ring-1 ring-primary/20 focus:ring-primary/40 transition-all duration-300 animate-pulse hover:animate-none focus:animate-none"
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

        {/* Log dos últimos pedidos expedidos - posicionado à direita do centro */}
        {expeditionLog.length > 0 && (
          <div className="absolute left-1/2 transform translate-x-16 flex items-center max-w-[300px] overflow-hidden">
            <div className="flex items-center gap-0.5 whitespace-nowrap">
              {expeditionLog.slice(0, 8).map((logEntry, index) => {
                const entryKey = `${logEntry.orderNumber}-${logEntry.expeditionTime.getTime()}`;
                const hasRecentEffect = recentAutoExpedited.has(entryKey);
                
                return (
                  <div key={`${logEntry.orderNumber}-${index}`} className="flex items-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span 
                            className={`text-xs px-0.5 rounded cursor-help transition-all duration-300 ${
                              hasRecentEffect ? 'animate-pulse bg-red-100/20' : ''
                            }`}
                            style={{ 
                              color: logEntry.isAutoExpedition 
                                ? 'rgba(220, 38, 127, 0.8)' // Rosa pastel para autoexpedição
                                : 'rgba(0, 0, 0, 0.6)' // Cor normal
                            }}
                          >
                            {/* Extrair apenas os números do pedido */}
                            {logEntry.orderNumber.replace(/[^\d]/g, '')}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <div>Pedido: {logEntry.orderNumber}</div>
                            <div>Expedido: {logEntry.expeditionTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</div>
                            {logEntry.isAutoExpedition && <div className="text-red-400">Auto-expedição</div>}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {/* Bullet separator - não mostrar depois do último item */}
                    {index < expeditionLog.slice(0, 8).length - 1 && (
                      <span className="text-gray-600 mx-0.5 text-xs">•</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">
            Jelco Informática
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onConfigClick}
            className="h-5 w-5 p-0 border-0 flex items-center justify-center"
          >
            <Settings className="w-3 h-3 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
};