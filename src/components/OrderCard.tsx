import { Order } from '../types/order';
import { cn } from '../lib/utils';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  className?: string;
  showNickname?: boolean;
  showItems?: boolean;
  enabledModules?: {
    balcao: boolean;
    mesa: boolean;
    entrega: boolean;
    ficha: boolean;
  };
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
}

const moduleColors = {
  balcao: 'bg-green-500',
  mesa: 'bg-blue-500',
  entrega: 'bg-red-500',
  ficha: 'bg-purple-500'
};

export const OrderCard = ({ 
  order, 
  onClick, 
  className,
  showNickname = true,
  showItems = true,
  enabledModules,
  fontSize = 2,
  fontFamily = 'Arial',
  textColor = '#374151',
  backgroundColor = '#ffffff'
}: OrderCardProps) => {
  const enabledModuleCount = enabledModules ? 
    Object.values(enabledModules).filter(Boolean).length : 0;
  const showModuleBullet = enabledModuleCount > 1;
  
  const displayNumber = order.numeroPedido || order.number;
  const displayName = order.nomeCliente || order.nickname;
  
  return (
    <div
      className={cn(
        "border border-gray-300 rounded-lg cursor-pointer relative",
        "hover:shadow-md transition-all duration-200 hover:scale-[1.02]",
        "animate-card-appear",
        "flex flex-col items-center justify-center p-2 min-h-16",
        className
      )}
      onClick={onClick}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        height: '100%',
        width: '100%'
      }}
    >
      {/* Colored Dot Indicator - only show when more than 1 module enabled - top right corner */}
      {showModuleBullet && (
        <div className={cn(
          "absolute top-0.5 right-0.5 w-2 h-2 rounded-full",
          moduleColors[order.modulo]
        )} />
      )}
      
      {/* Order Number or Name */}
      {displayNumber ? (
        <div className="text-center w-full">
          <div 
            className="font-bold leading-tight"
            style={{ 
              fontSize: displayNumber.match(/^(IF|DD|RA|UB)-/) && displayNumber.length > 6 
                ? `${fontSize * 0.6}rem` 
                : displayNumber.length > 8 
                ? `${fontSize * 0.8}rem` 
                : `${fontSize}rem`
            }}
          >
            {displayNumber.match(/^(IF|DD|RA|UB)-/) ? (
              <div className="flex flex-col items-center">
                <span style={{ 
                  fontStyle: 'italic', 
                  fontWeight: 'normal',
                  fontSize: `${fontSize * 0.5}rem`,
                  lineHeight: '0.9'
                }}>
                  {displayNumber.split('-')[0]}
                </span>
                <span style={{ fontSize: `${fontSize * 1.1}rem` }}>
                  {displayNumber.split('-')[1]}
                </span>
              </div>
            ) : (
              displayNumber
            )}
          </div>
          {displayName && showNickname && (
            <div 
              className="font-medium leading-none -mt-1"
              style={{ 
                fontSize: `${fontSize * 0.5}rem`
              }}
            >
              {displayName}
            </div>
          )}
        </div>
      ) : displayName ? (
        <div 
          className="font-bold text-center leading-tight"
          style={{ 
            fontSize: displayName.length > 8 ? `${fontSize * 0.8}rem` : `${fontSize}rem`
          }}
        >
          {displayName}
        </div>
      ) : (
        <span 
          className="font-bold"
          style={{ fontSize: `${fontSize}rem` }}
        >
          S/N
        </span>
      )}
      
      {/* Hidden optional content */}
      <div className="hidden">
        {showItems && order.items && (
          <div className="text-xs">
            {order.items.slice(0, 2).join(', ')}
            {order.items.length > 2 && ` +${order.items.length - 2} mais`}
          </div>
        )}
      </div>
    </div>
  );
};