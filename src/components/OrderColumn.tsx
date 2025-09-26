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
  moduleIndicator?: 'none' | 'bullet' | 'tag' | 'border';
  headerBg?: string;
  headerColor?: string;
  headerHeight?: number;
  headerFontSize?: number;
  headerFontFamily?: string;
  config?: {
    modules: {
      balcao: {
        enabled: boolean;
        displayOption: 'numeroVenda' | 'numeroChamada' | 'apelido' | 'apelidoNumeroVenda';
        showIndicator?: boolean;
      };
      mesa: {
        enabled: boolean;
        displayOption: 'numeroMesa' | 'apelidoNumeroMesa';
        showIndicator?: boolean;
      };
      entrega: {
        enabled: boolean;
        displayOption: 'numeroEntrega' | 'numeroVenda';
        showIndicator?: boolean;
      };
      ficha: {
        enabled: boolean;
        displayOption: 'numeroFicha' | 'numeroChamada' | 'nomeCliente' | 'fichaCliente' | 'localEntregaFicha';
        showIndicator?: boolean;
      };
    };
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
  moduleIndicator = 'bullet',
  headerBg,
  headerColor,
  headerHeight = 48,
  headerFontSize = 1.2,
  headerFontFamily = 'Arial',
  config,
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
            "flex items-center justify-center px-4 font-bold relative",
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
          <div className="absolute right-4 bg-white/20 px-2 py-1 rounded-full font-bold" style={{ fontSize: '16px' }}>
            {totalCount ?? orders.length}
          </div>
        </div>
        
        <div className="order-column-content flex-1 p-2 bg-gray-50" style={{ overflow: 'hidden' }}>
          <OrderColumnGrid
            orders={orders}
            columns={columns}
            onOrderClick={onOrderClick}
            showNickname={showNickname}
            showItems={showItems}
            moduleIndicator={moduleIndicator}
            config={config}
            cardConfig={cardConfig}
          />
        </div>
      </div>
    </div>
  );
};