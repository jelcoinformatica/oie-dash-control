import { Order } from '../types/order';
import { cn } from '../lib/utils';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  className?: string;
}

const moduleLabels = {
  balcao: 'Balcão',
  mesa: 'Mesa',
  entrega: 'Entrega',
  ficha: 'Ficha'
};

const moduleColors = {
  balcao: 'bg-blue-100 text-blue-800 border-blue-200',
  mesa: 'bg-green-100 text-green-800 border-green-200',
  entrega: 'bg-orange-100 text-orange-800 border-orange-200',
  ficha: 'bg-purple-100 text-purple-800 border-purple-200'
};

export const OrderCard = ({ order, onClick, className }: OrderCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div
      className={cn(
        "bg-order-card border border-order-card-border rounded-lg p-3 cursor-pointer",
        "hover:shadow-md transition-all duration-200 hover:scale-[1.02]",
        "animate-card-appear",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-order-card-foreground">
            #{order.number}
          </span>
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium border",
            moduleColors[order.module]
          )}>
            {moduleLabels[order.module]}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatTime(order.createdAt)}
        </span>
      </div>
      
      {order.nickname && (
        <div className="mb-2">
          <span className="text-sm font-medium text-order-card-foreground">
            {order.nickname}
          </span>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground mb-2">
        {order.items.slice(0, 2).join(', ')}
        {order.items.length > 2 && ` +${order.items.length - 2} mais`}
      </div>
      
      {order.totalValue && (
        <div className="text-right">
          <span className="text-sm font-bold text-primary">
            {formatCurrency(order.totalValue)}
          </span>
        </div>
      )}
    </div>
  );
};