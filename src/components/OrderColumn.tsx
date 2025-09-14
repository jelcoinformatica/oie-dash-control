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
  headerBg?: string;
  headerColor?: string;
  headerHeight?: number;
  enabledModules?: {
    balcao: boolean;
    mesa: boolean;
    entrega: boolean;
    ficha: boolean;
  };
  cardConfig?: {
    fontSize?: number;
    fontFamily?: string;
    textColor?: string;
    backgroundColor?: string;
  };
  smartColumns: number;
  showBorder?: boolean;
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
  showItems = true,
  headerBg,
  headerColor,
  headerHeight = 48,
  enabledModules,
  cardConfig,
  smartColumns,
  showBorder = false
}: OrderColumnProps) => {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div 
        className={cn(
          "bg-white rounded-lg shadow-lg flex flex-col overflow-hidden h-full",
          showBorder ? 'ring-2 ring-blue-200' : ''
        )}
      >
        <div 
          className={cn(
            "flex items-center justify-between px-4 font-bold text-lg",
            "shadow-sm border-b rounded-t-lg",
            !headerBg && "bg-gray-800",
            !headerColor && "text-white",
            headerClassName
          )}
          style={{
            backgroundColor: headerBg,
            color: headerColor,
            height: `${headerHeight}px`
          }}
        >
          <span>{title}</span>
          <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
            {totalCount ?? orders.length}
          </span>
        </div>
        
        <div className="flex-1 p-2 bg-gray-50" style={{ overflow: 'hidden' }}>
          <div 
            className="grid gap-1 h-full"
            style={{ 
              gridTemplateColumns: `repeat(${smartColumns}, 1fr)`,
              gridAutoRows: `minmax(${Math.max(60, (cardConfig?.fontSize || 1.2) * 50)}px, auto)`,
              overflow: 'hidden'
            }}
          >
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => onOrderClick?.(order)}
                className="flex-shrink-0"
                showNickname={showNickname}
                showItems={showItems}
                enabledModules={enabledModules}
                fontSize={cardConfig?.fontSize}
                fontFamily={cardConfig?.fontFamily}
                textColor={cardConfig?.textColor}
                backgroundColor={cardConfig?.backgroundColor}
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
    </div>
  );
};