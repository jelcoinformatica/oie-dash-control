import { cn } from '../lib/utils';

interface LastOrderDisplayProps {
  orderNumber: string;
  nickname?: string;
  config?: {
    height: number;
    fontSize: number;
    pulseAnimation: boolean;
    highlight: boolean;
    fontFamily?: string;
    textColor?: string;
    backgroundColor?: string;
  };
  className?: string;
  onExpedite?: (orderNumber: string) => void;
}

export const LastOrderDisplay = ({ 
  orderNumber, 
  nickname,
  config,
  className,
  onExpedite
}: LastOrderDisplayProps) => {
  // Safety check with default values
  const safeConfig = {
    height: config?.height || 120,
    fontSize: config?.fontSize || 5,
    pulseAnimation: config?.pulseAnimation || false,
    highlight: config?.highlight || false,
    fontFamily: config?.fontFamily || 'Arial',
    textColor: config?.textColor || '#000000',
    backgroundColor: config?.backgroundColor || '#fef3c7'
  };

  // Get order details to show nickname
  const handleClick = () => {
    if (onExpedite) {
      onExpedite(orderNumber);
    }
  };

  // Calcular tamanho da fonte do apelido baseado no comprimento
  const calculateNicknameFontSize = (nickname: string, baseFontSize: number) => {
    if (!nickname) return baseFontSize;
    
    const maxChars = 15; // Número máximo de caracteres para tamanho normal
    if (nickname.length <= maxChars) return baseFontSize;
    
    // Reduzir tamanho da fonte proporcionalmente ao comprimento
    const reduction = Math.min(0.7, maxChars / nickname.length);
    return baseFontSize * reduction;
  };

  const nicknameFontSize = nickname ? calculateNicknameFontSize(nickname, 0.8) : 0.8;

  return (
    <div 
      className={cn(
        "p-4 rounded-lg text-center cursor-pointer hover:opacity-80 transition-opacity",
        safeConfig.pulseAnimation && "animate-pulse",
        className
      )}
      style={{ 
        height: `${safeConfig.height}px`,
        fontSize: `${safeConfig.fontSize}rem`,
        fontFamily: safeConfig.fontFamily,
        color: safeConfig.textColor,
        backgroundColor: safeConfig.backgroundColor
      }}
      onClick={handleClick}
    >
      <div className="relative h-full flex flex-col items-center justify-center font-bold">
        <span className="absolute top-2 right-2 w-3 h-3 bg-current rounded-full animate-pulse"></span>
        <div className="flex flex-col items-center">
          <span>{orderNumber}</span>
          {nickname && (
            <div 
              className="opacity-90 mt-1 px-2 leading-tight"
              style={{ fontSize: `${nicknameFontSize}rem` }}
            >
              {nickname}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};