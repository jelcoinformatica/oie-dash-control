import { Order } from '../types/order';
import { cn } from '../lib/utils';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  className?: string;
  showNickname?: boolean;
  showItems?: boolean;
}

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
        "h-16 flex items-center justify-center px-4",
        className
      )}
      onClick={onClick}
    >
      {/* Order Number Only */}
      <span className="text-2xl font-bold text-gray-800">
        {order.number}
      </span>
      
      {/* Hidden optional content */}
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