import { Order } from '../types/order';
import { cn } from '../lib/utils';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  className?: string;
  showNickname?: boolean;
  showItems?: boolean;
}

const moduleLabels = {
  balcao: 'B',
  mesa: 'M',
  entrega: 'E',
  ficha: 'F'
};

const moduleColors = {
  balcao: 'bg-blue-500',
  mesa: 'bg-green-500',
  entrega: 'bg-orange-500',
  ficha: 'bg-purple-500'
};

export const OrderCard = ({ 
  order, 
  onClick, 
  className,
  showNickname = true,
  showItems = true
}: OrderCardProps) => {
  return (
    <div
      className={cn(
        "bg-white border border-gray-300 rounded-lg cursor-pointer",
        "hover:shadow-md transition-all duration-200 hover:scale-[1.02]",
        "animate-card-appear relative",
        "h-16 flex items-center justify-between px-4",
        className
      )}
      onClick={onClick}
    >
      {/* Order Number */}
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-gray-800">
          {order.number}
        </span>
        
        {/* Module Letter */}
        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
          {moduleLabels[order.module]}
        </span>
      </div>
      
      {/* Colored Dot Indicator */}
      <div className={cn(
        "w-3 h-3 rounded-full",
        moduleColors[order.module]
      )} />
      
      {/* Optional content hidden in minimalist view */}
      <div className="hidden">
        {showNickname && order.nickname && (
          <div>
            <span className="text-sm font-medium">
              {order.nickname}
            </span>
          </div>
        )}
        
        {showItems && (
          <div className="text-xs text-gray-500">
            {order.items.slice(0, 2).join(', ')}
            {order.items.length > 2 && ` +${order.items.length - 2} mais`}
          </div>
        )}
      </div>
    </div>
  );
};