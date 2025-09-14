import { cn } from '../lib/utils';

interface LastOrderDisplayProps {
  orderNumber: string;
  config: {
    height: number;
    fontSize: number;
    pulseAnimation: boolean;
    highlight: boolean;
    fontFamily?: string;
    textColor?: string;
    backgroundColor?: string;
  };
  className?: string;
}

export const LastOrderDisplay = ({ 
  orderNumber, 
  config,
  className
}: LastOrderDisplayProps) => {
  return (
    <div 
      className={cn(
        "p-4 border border-yellow-300 rounded-lg text-center",
        config.pulseAnimation && "animate-pulse",
        config.highlight && "ring-2 ring-yellow-400",
        className
      )}
      style={{ 
        height: `${config.height}px`,
        fontSize: `${config.fontSize}rem`,
        fontFamily: config.fontFamily || 'Arial',
        color: config.textColor || '#000000',
        backgroundColor: config.backgroundColor || '#fef3c7'
      }}
    >
      <div className="h-full flex items-center justify-center font-bold">
        {orderNumber}
      </div>
    </div>
  );
};