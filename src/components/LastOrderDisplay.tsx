import { cn } from '../lib/utils';

interface LastOrderDisplayProps {
  orderNumber: string;
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

  return (
    <div 
      className={cn(
        "p-4 border border-yellow-300 rounded-lg text-center cursor-pointer hover:opacity-80 transition-opacity",
        safeConfig.pulseAnimation && "animate-pulse",
        safeConfig.highlight && "ring-2 ring-yellow-400",
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
      <div className="h-full flex flex-col items-center justify-center font-bold">
        <div>{orderNumber}</div>
      </div>
    </div>
  );
};