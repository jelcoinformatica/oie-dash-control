import { Order } from '../types/order';
import { OrderCard } from './OrderCard';
import { cn } from '../lib/utils';

interface OrderColumnProps {
  title: string;
  orders: Order[];
  onOrderClick?: (order: Order) => void;
  className?: string;
  headerClassName?: string;
  totalCount?: number;
  variant?: 'production' | 'ready' | 'advertising';
  showNickname?: boolean;
  showItems?: boolean;
}

const variantStyles = {
  production: {
    header: 'bg-production text-production-foreground',
    container: 'bg-production-light/50'
  },
  ready: {
    header: 'bg-ready text-ready-foreground',
    container: 'bg-ready-light/50'
  },
  advertising: {
    header: 'bg-advertising text-advertising-foreground',
    container: 'bg-advertising-light/50'
  }
};

export const OrderColumn = ({
  title,
  orders,
  onOrderClick,
  className,
  headerClassName,
  totalCount,
  variant = 'production',
  showNickname = true,
  showItems = true
}: OrderColumnProps) => {
  const styles = variantStyles[variant];

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className={cn(
        "flex items-center justify-between px-4 py-3 font-bold text-lg",
        "shadow-sm border-b",
        styles.header,
        headerClassName
      )}>
        <span>{title}</span>
        <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
          {totalCount ?? orders.length}
        </span>
      </div>
      
      <div className={cn(
        "flex-1 p-4 overflow-y-auto",
        styles.container
      )}>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-2 xl:grid-cols-2">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => onOrderClick?.(order)}
              className="h-16"
              showNickname={showNickname}
              showItems={showItems}
            />
          ))}
        </div>
        
        {orders.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <div className="text-2xl mb-2">📋</div>
              <p>Nenhum pedido</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};