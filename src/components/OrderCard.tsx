import { Order } from '../types/order';
import { cn } from '../lib/utils';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  className?: string;
  showNickname?: boolean;
  showItems?: boolean;
  moduleIndicator?: 'none' | 'bullet' | 'tag' | 'border';
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

const modulePastelColors = {
  balcao: 'bg-green-100 text-green-800',
  mesa: 'bg-blue-100 text-blue-800', 
  entrega: 'bg-red-100 text-red-800',
  ficha: 'bg-purple-100 text-purple-800'
};

const moduleBorderColors = {
  balcao: 'border-green-500',
  mesa: 'border-blue-500',
  entrega: 'border-red-500',
  ficha: 'border-purple-500'
};

const moduleLabels = {
  balcao: 'Balcao',
  mesa: 'Mesa',
  entrega: 'Entrega', 
  ficha: 'Ficha'
};

export const OrderCard = ({ 
  order, 
  onClick, 
  className,
  showNickname = true,
  showItems = true,
  moduleIndicator = 'bullet',
  config,
  fontSize = 2,
  fontFamily = 'Arial',
  textColor = '#374151',
  backgroundColor = '#ffffff'
}: OrderCardProps) => {
  const displayNumber = order.numeroPedido || order.number;
  const displayName = order.nomeCliente || order.nickname;
  const isOnlineDelivery = displayNumber?.match(/^(IF|DD|RA|UB)-/);
  
  // Para delivery online, o nome da plataforma vai na etiqueta
  const getDeliveryPlatformName = (prefix: string) => {
    switch (prefix) {
      case 'IF': return 'iFood';
      case 'RA': return 'Rappi';
      case 'UB': return 'Uber';
      case 'DD': return 'Delivery Direto';
      default: return prefix;
    }
  };

  // Nova lógica: verifica se o módulo específico tem indicador ativado
  const shouldShowModuleIndicator = (): boolean => {
    // Para delivery online, sempre mostra na etiqueta se for tipo tag
    if (isOnlineDelivery && moduleIndicator === 'tag') return true;
    
    // Para módulos normais, verifica a configuração individual
    if (config?.modules && order.modulo) {
      return config.modules[order.modulo]?.showIndicator || false;
    }
    
    return false;
  };
  
  const showModuleIndicator = shouldShowModuleIndicator();
  
  return (
    <div
      className={cn(
        "border rounded-lg cursor-pointer relative",
        "hover:shadow-md transition-all duration-200 hover:scale-[1.02]",
        "animate-card-appear",
        "flex flex-col items-center justify-center p-2 min-h-16",
        showModuleIndicator && moduleIndicator === 'border' 
          ? cn("border-2", moduleBorderColors[order.modulo])
          : "border-gray-300",
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
      {/* Indicador de Módulo */}
      {showModuleIndicator && moduleIndicator !== 'border' && (
        <>
          {moduleIndicator === 'bullet' ? (
            <div className={cn(
              "absolute top-0.5 right-0.5 w-2 h-2 rounded-full",
              moduleColors[order.modulo]
            )} />
          ) : (
            <div className={cn(
              "absolute top-0.5 right-0.5 px-1 py-0.5 rounded text-xs font-medium",
              modulePastelColors[order.modulo]
            )}
            style={{ fontSize: `${fontSize * 0.3}rem` }}>
              {isOnlineDelivery 
                ? getDeliveryPlatformName(displayNumber.split('-')[0])
                : moduleLabels[order.modulo]
              }
            </div>
          )}
        </>
      )}
      
      {/* Layout com posições fixas */}
      <div className="w-full h-full flex flex-col justify-between items-center py-1">
        {/* Prefixo no topo - só mostra se não há etiqueta ou se etiqueta não está mostrando o delivery */}
        <div className="flex-shrink-0 h-4 flex items-start justify-center">
          {isOnlineDelivery && (!showModuleIndicator || moduleIndicator === 'bullet') && (
            <span style={{ 
              fontStyle: 'italic', 
              fontWeight: 'normal',
              fontSize: `${fontSize * 0.4}rem`,
              lineHeight: '1'
            }}>
              {getDeliveryPlatformName(displayNumber.split('-')[0])}
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
        <div className="flex-shrink-0 w-full flex items-center justify-center px-1">
          {displayName && showNickname && displayNumber && (
            <div 
              className="font-medium text-center leading-tight break-words hyphens-auto w-full"
              style={{ 
                fontSize: `${fontSize * 0.5}rem`,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto'
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