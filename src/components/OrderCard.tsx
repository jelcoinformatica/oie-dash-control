import { Order } from '../types/order';
import { cn } from '../lib/utils';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  className?: string;
  showNickname?: boolean;
  showItems?: boolean;
  enabledModules?: {
    balcao: {
      enabled: boolean;
      displayOption: 'numeroVenda' | 'numeroChamada' | 'apelido' | 'apelidoNumeroVenda';
    };
    mesa: {
      enabled: boolean;
      displayOption: 'numeroMesa' | 'apelidoNumeroMesa';
    };
    entrega: {
      enabled: boolean;
      displayOption: 'numeroEntrega' | 'numeroVenda';
    };
    ficha: {
      enabled: boolean;
      displayOption: 'numeroFicha' | 'numeroChamada' | 'nomeCliente' | 'fichaCliente' | 'localEntregaFicha';
    };
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
  // Only show module bullet indicator if it's relevant (not used in current implementation)
  const showModuleBullet = false;
  
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
      
      {/* Layout com posições fixas */}
      <div className="w-full h-full flex flex-col justify-between items-center py-1">
        {/* Prefixo no topo */}
        <div className="flex-shrink-0 h-4 flex items-start justify-center">
          {displayNumber?.match(/^(IF|DD|RA|UB)-/) && (
            <span style={{ 
              fontStyle: 'italic', 
              fontWeight: 'normal',
              fontSize: `${fontSize * 0.4}rem`,
              lineHeight: '1'
            }}>
              {displayNumber.split('-')[0]}
            </span>
          )}
        </div>

        {/* Número principal no centro */}
        <div className="flex-1 flex items-center justify-center">
          <div className="font-bold text-center">
            {displayNumber ? (
              displayNumber.match(/^(IF|DD|RA|UB)-/) ? (
                <span style={{ 
                  fontSize: `${fontSize}rem`,
                  lineHeight: '1'
                }}>
                  {displayNumber.split('-')[1]}
                </span>
              ) : (
                <span style={{ 
                  fontSize: displayNumber.length > 8 
                    ? `${fontSize * 0.8}rem` 
                    : `${fontSize}rem`,
                  lineHeight: '1'
                }}>
                  {displayNumber}
                </span>
              )
            ) : displayName ? (
              <span style={{ 
                fontSize: displayName.length > 8 ? `${fontSize * 0.8}rem` : `${fontSize}rem`,
                lineHeight: '1'
              }}>
                {displayName}
              </span>
            ) : (
              <span style={{ fontSize: `${fontSize}rem`, lineHeight: '1' }}>
                S/N
              </span>
            )}
          </div>
        </div>

        {/* Apelido embaixo */}
        <div className="flex-shrink-0 h-4 flex items-end justify-center">
          {displayName && showNickname && displayNumber && (
            <div 
              className="font-medium text-center leading-none"
              style={{ 
                fontSize: `${fontSize * 0.5}rem`
              }}
            >
              {displayName}
            </div>
          )}
        </div>
      </div>
      
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