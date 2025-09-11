import { cn } from '../lib/utils';

interface LastOrderDisplayProps {
  orderNumber: string;
  animate?: boolean;
  className?: string;
}

export const LastOrderDisplay = ({ 
  orderNumber, 
  animate = true, 
  className 
}: LastOrderDisplayProps) => {
  return (
    <div className={cn(
      "bg-last-order text-last-order-foreground rounded-lg",
      "flex items-center justify-center font-bold text-4xl",
      "shadow-lg border-2 border-last-order/20",
      "min-h-[120px] m-4",
      animate && "animate-pulse-glow",
      className
    )}>
      <span className="drop-shadow-sm">
        {orderNumber}
      </span>
    </div>
  );
};