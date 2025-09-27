import { useMemo, useEffect, useState, useRef } from 'react';
import { Order } from '../types/order';
import { OrderCard } from './OrderCard';

interface OrderColumnGridProps {
  orders: Order[];
  columns: number;
  onOrderClick?: (order: Order) => void;
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
  cardConfig?: {
    fontSize?: number;
    fontFamily?: string;
    textColor?: string;
    backgroundColor?: string;
    gapHorizontal?: number;
    gapVertical?: number;
    cardMinHeight?: number;
    cardMaxHeight?: number;
  };
  lastOrderNumber?: string;
  lastOrderConfig?: {
    height: number;
    fontSize: number;
    backgroundColor: string;
    textColor: string;
    pulseAnimation: boolean;
    highlight: boolean;
    fontFamily?: string;
  };
}

export const OrderColumnGrid = ({
  orders,
  columns,
  onOrderClick,
  showNickname = true,
  showItems = true,
  moduleIndicator = 'bullet',
  config,
  cardConfig,
  lastOrderNumber,
  lastOrderConfig
}: OrderColumnGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  // Medir o container real
  useEffect(() => {
    const measureContainer = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    measureContainer();
    
    const resizeObserver = new ResizeObserver(measureContainer);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Calcular dimensões baseadas na configuração do usuário
  const { visibleOrders, cardHeight, adjustedFontSize } = useMemo(() => {
    if (containerDimensions.width === 0 || containerDimensions.height === 0) {
      return {
        visibleOrders: [],
        cardHeight: 90,
        adjustedFontSize: 1.2
      };
    }

    const baseFontSize = 16;
    const requestedFontSize = cardConfig?.fontSize || 1.2;
    
    // Usar configurações de gap do usuário
    const gapH = cardConfig?.gapHorizontal || 4;
    const gapV = cardConfig?.gapVertical || 4;
    const minHeight = cardConfig?.cardMinHeight || 60;
    const maxHeight = cardConfig?.cardMaxHeight || 120;
    
    // Altura baseada na fonte, limitada pelos valores min/max do usuário
    const basedOnFontHeight = requestedFontSize * 30;
    const cardHeight = Math.min(Math.max(basedOnFontHeight, minHeight), maxHeight);
    
    // Ajustar fonte para caber na largura do card
    const totalGapsH = gapH * (columns - 1);
    const availableWidth = containerDimensions.width - totalGapsH;
    const cardWidth = Math.floor(availableWidth / columns);
    
    let adjustedFontSize = requestedFontSize;
    const estimatedTextWidth = 4 * adjustedFontSize * baseFontSize * 0.6;
    if (estimatedTextWidth > cardWidth - 16) { // 16px de padding interno
      adjustedFontSize = Math.max(0.8, (cardWidth - 16) / (4 * baseFontSize * 0.6));
    }
    
    // Calcular quantas linhas cabem com os gaps configurados pelo usuário
    const maxRows = Math.floor((containerDimensions.height + gapV) / (cardHeight + gapV));
    
    // Limitar cards para não haver cortes
    const maxVisibleCards = Math.max(0, maxRows * columns);
    const visibleOrders = orders.slice(0, maxVisibleCards);
    
    return {
      visibleOrders,
      cardHeight,
      adjustedFontSize
    };
  }, [orders, columns, cardConfig?.fontSize, cardConfig?.gapHorizontal, cardConfig?.gapVertical, cardConfig?.cardMinHeight, cardConfig?.cardMaxHeight, containerDimensions]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-hidden"
    >
      <div 
        className="grid"
        style={{ 
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(auto-fit, ${cardHeight}px)`,
          gap: `${cardConfig?.gapVertical || 4}px ${cardConfig?.gapHorizontal || 4}px`
        }}
      >
        {visibleOrders.map((order, index) => {
          const isLastOrder = lastOrderNumber && 
            (order.numeroPedido || order.number) === lastOrderNumber &&
            !lastOrderConfig?.highlight &&
            index === 0; // Apenas na primeira posição
            
          return (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => onOrderClick?.(order)}
              className={`flex-shrink-0 ${isLastOrder && lastOrderConfig?.pulseAnimation ? 'animate-pulse' : ''}`}
              showNickname={showNickname}
              showItems={showItems}
              moduleIndicator={moduleIndicator}
              config={config}
              fontSize={adjustedFontSize}
              fontFamily={cardConfig?.fontFamily}
              textColor={isLastOrder ? lastOrderConfig?.textColor : cardConfig?.textColor}
              backgroundColor={isLastOrder ? lastOrderConfig?.backgroundColor : cardConfig?.backgroundColor}
            />
          );
        })}
        
        {visibleOrders.length === 0 && !(lastOrderNumber && lastOrderConfig?.highlight) && (
          <div className="flex flex-col items-center justify-center col-span-full text-center" style={{ height: containerDimensions.height }}>
            <p className="text-6xl font-black text-black/20 tracking-wider select-none">OIE!</p>
            <p className="text-lg font-medium text-black/15 tracking-wide select-none mt-2">Aguardando novos pedidos</p>
          </div>
        )}
      </div>
    </div>
  );
};