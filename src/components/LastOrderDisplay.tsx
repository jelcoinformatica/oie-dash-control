import { cn } from '../lib/utils';

interface LastOrderDisplayProps {
  orderNumber: string;
  animate?: boolean;
  className?: string;
  height?: number;
  fontSize?: number;
  backgroundColor?: string;
  textColor?: string;
}

export const LastOrderDisplay = ({ 
  orderNumber, 
  animate = true, 
  className,
  height = 120,
  fontSize = 5,
  backgroundColor = '#f59e0b',
  textColor = '#ffffff'
}: LastOrderDisplayProps) => {
  return (
    <div 
      className={cn(
        "rounded-3xl shadow-2xl flex items-center justify-center font-bold relative",
        "drop-shadow-[0_8px_32px_rgba(245,158,11,0.5)]",
        animate && "animate-pulse",
        className
      )}
      style={{
        backgroundColor,
        color: textColor,
        height: `${height}px`,
        fontSize: `${fontSize}rem`,
        margin: '8px'
      }}
    >
      <span className="drop-shadow-md">
        {orderNumber}
      </span>
    </div>
  );
};