import { useMemo } from 'react';
import { Order } from '../types/order';
import { OrderCard } from './OrderCard';

interface OrderColumnGridProps {
  orders: Order[];
  columns: number;
  onOrderClick?: (order: Order) => void;
  showNickname?: boolean;
  showItems?: boolean;
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
}

export const OrderColumnGrid = ({
  orders,
  columns,
  onOrderClick,
  showNickname = true,
  showItems = true,
  enabledModules,
  cardConfig
}: OrderColumnGridProps) => {
  // Calcular dimensões dos cards para caber perfeitamente
  const { visibleOrders, cardHeight, cardWidth, adjustedFontSize } = useMemo(() => {
    const baseFontSize = 16;
    const requestedFontSize = cardConfig?.fontSize || 1.2;
    
    // Largura do card baseada no número de colunas
    const gap = 4;
    const padding = 16;
    const containerWidth = 380; // Largura fixa da coluna
    const availableWidth = containerWidth - padding - (gap * (columns - 1));
    const cardWidth = Math.floor(availableWidth / columns);
    
    // Altura fixa do card
    const cardHeight = 90;
    
    // Ajustar fonte para não ultrapassar a largura do card
    let adjustedFontSize = requestedFontSize;
    const estimatedTextWidth = 4 * adjustedFontSize * baseFontSize * 0.6; // ~4 caracteres
    if (estimatedTextWidth > cardWidth - 20) { // 20px de padding interno
      adjustedFontSize = Math.max(0.8, (cardWidth - 20) / (4 * baseFontSize * 0.6));
    }
    
    // Calcular quantas linhas cabem
    const containerHeight = window.innerHeight - 250; // Altura disponível
    const maxRows = Math.floor(containerHeight / (cardHeight + gap));
    
    // Limitar cards para caber sem cortes
    const maxVisibleCards = Math.max(0, maxRows * columns);
    const visibleOrders = orders.slice(0, maxVisibleCards);
    
    return {
      visibleOrders,
      cardHeight: Math.floor(cardHeight),
      cardWidth: Math.floor(cardWidth),
      adjustedFontSize
    };
  }, [orders, columns, cardConfig?.fontSize]);

  return (
    <div 
      className="grid gap-1 h-full"
      style={{ 
        gridTemplateColumns: `repeat(${columns}, ${cardWidth}px)`,
        gridTemplateRows: `repeat(auto-fit, ${cardHeight}px)`,
        overflow: 'hidden', // Nunca mostrar scroll
        justifyContent: 'start'
      }}
    >
      {visibleOrders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onClick={() => onOrderClick?.(order)}
          className="flex-shrink-0"
          showNickname={showNickname}
          showItems={showItems}
          enabledModules={enabledModules}
          fontSize={adjustedFontSize}
          fontFamily={cardConfig?.fontFamily}
          textColor={cardConfig?.textColor}
          backgroundColor={cardConfig?.backgroundColor}
        />
      ))}
      
      {visibleOrders.length === 0 && (
        <div className="flex items-center justify-center h-32 text-muted-foreground col-span-full">
          <div className="text-center">
            <div className="text-2xl mb-2">📋</div>
            <p>Nenhum pedido</p>
          </div>
        </div>
      )}
    </div>
  );
};