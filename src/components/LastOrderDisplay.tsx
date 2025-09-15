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

  // Calcular tamanho da fonte baseado no tipo de pedido
  const adjustedFontSize = orderNumber.startsWith('IF-') && orderNumber.length > 6 
    ? safeConfig.fontSize * 0.6 
    : safeConfig.fontSize;
  
  // Calcular tamanho da fonte do apelido como 50% do número ajustado
  const nicknameFontSize = adjustedFontSize * 0.5;

  return (
    <div 
      className={cn(
        "p-3 mx-4 rounded-lg text-center cursor-pointer hover:opacity-80 transition-opacity",
        safeConfig.pulseAnimation && "animate-pulse",
        className
      )}
      style={{ 
        height: `${safeConfig.height * 0.85}px`,
        fontSize: `${adjustedFontSize}rem`,
        fontFamily: safeConfig.fontFamily,
        color: safeConfig.textColor,
        backgroundColor: safeConfig.backgroundColor,
        marginTop: '8px' // Garante espaço abaixo do título
      }}
      onClick={handleClick}
    >
      <div className="relative h-full flex flex-col items-center justify-center font-bold">
          <div className="flex flex-col items-center">
            <span className="leading-none">{orderNumber}</span>
            {nickname && (
              <div 
                className="opacity-90 leading-none -mt-1"
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