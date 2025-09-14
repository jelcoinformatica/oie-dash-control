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
      "bg-amber-500 text-white rounded-3xl shadow-2xl",
      "flex items-center justify-center font-bold text-6xl",
      "min-h-[120px] m-4 relative",
      "drop-shadow-[0_8px_32px_rgba(245,158,11,0.5)]",
      animate && "animate-pulse",
      className
    )}>
      <span className="drop-shadow-md">
        {orderNumber}
      </span>
    </div>
  );
};