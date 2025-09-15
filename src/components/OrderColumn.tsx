import { Order } from '../types/order';
import { OrderCard } from './OrderCard';
import { OrderColumnGrid } from './OrderColumnGrid';
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
  headerFontSize?: number;
  headerFontFamily?: string;
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
  columns: number;
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
  headerFontSize = 1.2,
  headerFontFamily = 'Arial',
  enabledModules,
  cardConfig,
  columns,
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
            "flex items-center justify-between px-4 font-bold",
            "shadow-sm border-b rounded-t-lg",
            !headerBg && "bg-gray-800",
            !headerColor && "text-white",
            headerClassName
          )}
          style={{
            backgroundColor: headerBg,
            color: headerColor,
            height: `${headerHeight}px`,
            fontSize: `${headerFontSize}rem`,
            fontFamily: headerFontFamily
          }}
        >
          <span>{title}</span>
          <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
            {totalCount ?? orders.length}
          </span>
        </div>
        
        <div className="order-column-content flex-1 p-2 bg-gray-50" style={{ overflow: 'hidden' }}>
          <OrderColumnGrid
            orders={orders}
            columns={columns}
            onOrderClick={onOrderClick}
            showNickname={showNickname}
            showItems={showItems}
            enabledModules={enabledModules}
            cardConfig={cardConfig}
          />
        </div>
      </div>
    </div>
  );
};