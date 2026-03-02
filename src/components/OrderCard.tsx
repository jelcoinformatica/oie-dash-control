import { useRef, useEffect, useState } from 'react';
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
  showCardBorder?: boolean;
  cardBorderColor?: string;
}

const platformLogos: Record<string, string> = {
  'IF': '/images/platforms/ifood.png',
  'RA': '/images/platforms/rappi.png',
  'DD': '/images/platforms/deliverydireto.png',
  'KE': '/images/platforms/keeta.png',
  '99': '/images/platforms/99food.png',
};

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

// Componente que auto-ajusta fontes para caber no card
const AutoFitCardContent = ({
  isOnlineDelivery,
  displayNumber,
  displayName,
  showNickname,
  showModuleIndicator,
  moduleIndicator,
  fontSize,
  getDeliveryPlatformName
}: {
  isOnlineDelivery: RegExpMatchArray | null;
  displayNumber: string;
  displayName: string | undefined;
  showNickname: boolean;
  showModuleIndicator: boolean;
  moduleIndicator: string;
  fontSize: number;
  getDeliveryPlatformName: (prefix: string) => string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const mainNumber = isOnlineDelivery ? displayNumber.split('-')[1] : displayNumber;
  const hasName = !!(displayName && showNickname && displayNumber);
  const showPrefix = isOnlineDelivery && (!showModuleIndicator || moduleIndicator === 'bullet');

  // Calcula escala ideal baseada no container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    const measure = () => {
      const containerH = el.clientHeight;
      const containerW = el.clientWidth;
      if (containerH === 0 || containerW === 0) return;

      // Estimar alturas dos elementos
      const basePx = fontSize * 16; // rem -> px
      const numberH = basePx * 1.1;
      const nameH = hasName ? Math.min(fontSize * 0.45, 1) * 16 * 1.3 : 0;
      const prefixH = showPrefix ? fontSize * 0.4 * 16 : 0;
      const padding = 8;
      
      const totalNeeded = numberH + nameH + prefixH + padding;
      
      if (totalNeeded > containerH) {
        setScale(Math.max(0.5, containerH / totalNeeded));
      } else {
        setScale(1);
      }
    };

    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, [fontSize, hasName, showPrefix]);

  const scaledFontSize = fontSize * scale;
  const nameFontSize = Math.min(scaledFontSize * 0.45, 1);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col justify-between items-center py-1 overflow-hidden">
      {/* Prefixo no topo - menor e discreto pois o logo já identifica */}
      <div className="flex-shrink-0 flex items-start justify-center" style={{ minHeight: 0 }}>
        {showPrefix && (
          <span style={{ 
            fontStyle: 'italic', 
            fontWeight: 'normal',
            fontSize: `${scaledFontSize * 0.28}rem`,
            lineHeight: '1',
            opacity: 0.7
          }}>
            {getDeliveryPlatformName(displayNumber.split('-')[0])}
          </span>
        )}
      </div>

      {/* Número principal no centro */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="font-bold text-center">
          {displayNumber ? (
            <span style={{ 
              fontSize: `${(mainNumber || '').length > 8 ? scaledFontSize * 0.8 : scaledFontSize}rem`,
              lineHeight: '1'
            }}>
              {mainNumber}
            </span>
          ) : displayName ? (
            <span style={{ 
              fontSize: `${(displayName.length > 8 ? scaledFontSize * 0.8 : scaledFontSize)}rem`,
              lineHeight: '1'
            }}>
              {displayName}
            </span>
          ) : (
            <span style={{ fontSize: `${scaledFontSize}rem`, lineHeight: '1' }}>S/N</span>
          )}
        </div>
      </div>

      {/* Nome embaixo - mais destaque */}
      <div className="flex-shrink-0 w-full flex items-end justify-center px-1 overflow-hidden" style={{ minHeight: 0 }}>
        {hasName && (
          <div 
            className="font-bold text-center leading-tight w-full overflow-hidden text-ellipsis whitespace-nowrap"
            style={{ 
              fontSize: `${Math.min(scaledFontSize * 0.5, 1.2)}rem`,
              lineHeight: '1.2',
            }}
          >
            {displayName}
          </div>
        )}
      </div>
    </div>
  );
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
  backgroundColor = '#ffffff',
  showCardBorder = false,
  cardBorderColor = '#9ca3af'
}: OrderCardProps) => {
  // Garante que o número do pedido seja sempre uma string para evitar erros com .match()
  const displayNumber = String(order.numeroPedido || order.number || '');
  const displayName = order.nomeCliente || order.nickname;
  const isOnlineDelivery = displayNumber.match(/^(IF|DD|RA|KE|99)-/);
  
  // Para delivery online, o nome da plataforma vai na etiqueta
  const getDeliveryPlatformName = (prefix: string) => {
    switch (prefix) {
      case 'IF': return 'iFood';
      case 'RA': return 'Rappi';
      case 'DD': return 'Delivery Direto';
      case 'KE': return 'Keeta';
      case '99': return '99 Food';
      default: return prefix;
    }
  };

  const deliveryPrefix = isOnlineDelivery ? displayNumber.split('-')[0] : null;
  const platformLogo = deliveryPrefix ? platformLogos[deliveryPrefix] : null;

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
        "rounded-lg cursor-pointer relative",
        "hover:shadow-md transition-all duration-200 hover:scale-[1.02]",
        "animate-card-appear",
        "flex flex-col items-center justify-center p-2 min-h-16",
        showModuleIndicator && moduleIndicator === 'border' 
          ? cn("border-2", moduleBorderColors[order.modulo])
          : showCardBorder 
          ? "border-2"
          : "",
        className
      )}
      onClick={onClick}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        height: '100%',
        width: '100%',
        ...(showCardBorder && !(showModuleIndicator && moduleIndicator === 'border') 
          ? { borderColor: cardBorderColor } 
          : {})
      }}
    >
      {/* Badge de plataforma delivery */}
      {platformLogo && (
        <div className="absolute top-0.5 left-0.5 z-10">
          <div className="rounded-full overflow-hidden border border-gray-200 shadow-sm"
            style={{ width: `${Math.max(fontSize * 0.6, 1)}rem`, height: `${Math.max(fontSize * 0.6, 1)}rem` }}>
            <img src={platformLogo} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Indicador de Módulo (não-delivery) */}
      {showModuleIndicator && moduleIndicator !== 'border' && !platformLogo && (
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
              {moduleLabels[order.modulo]}
            </div>
          )}
        </>
      )}
      
      {/* Layout com posições fixas */}
      <AutoFitCardContent
        isOnlineDelivery={isOnlineDelivery}
        displayNumber={displayNumber}
        displayName={displayName}
        showNickname={showNickname}
        showModuleIndicator={showModuleIndicator}
        moduleIndicator={moduleIndicator}
        fontSize={fontSize}
        getDeliveryPlatformName={getDeliveryPlatformName}
      />
      
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