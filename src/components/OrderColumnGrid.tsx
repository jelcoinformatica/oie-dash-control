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
  // Calcular quantos cards cabem na tela baseado na altura e largura disponível
  const { visibleOrders, cardHeight, cardWidth, adjustedFontSize } = useMemo(() => {
    const baseFontSize = 16; // 1rem = 16px
    const requestedFontSize = cardConfig?.fontSize || 1.2;
    
    // Obter dimensões do container pai (assumindo que o grid ocupa todo o espaço disponível)
    const containerHeight = window.innerHeight - 300; // Espaço para cabeçalho, controles, etc
    const containerWidth = window.innerWidth; // Será dividido entre as colunas
    
    // Calcular largura disponível por card (considerando gaps)
    const totalGaps = 4 * (columns - 1); // 4px de gap entre colunas
    const availableWidth = (containerWidth * 0.9) - totalGaps; // 90% da largura menos gaps
    const cardWidth = Math.floor(availableWidth / columns);
    
    // Ajustar fonte para caber na largura do card
    // Cada caractere ocupa aproximadamente 0.6 * fontSize pixels
    const maxCharsPerLine = Math.floor(cardWidth / (requestedFontSize * baseFontSize * 0.6));
    let adjustedFontSize = requestedFontSize;
    
    // Reduzir fonte se necessário para caber pelo menos 3 caracteres (número do pedido)
    if (maxCharsPerLine < 3) {
      adjustedFontSize = Math.max(0.6, (cardWidth / (3 * baseFontSize * 0.6)));
    }
    
    // Altura do card baseada na fonte + padding
    const cardHeight = Math.max(60, adjustedFontSize * baseFontSize * 3); // 3 linhas de altura
    
    // Calcular quantas linhas de cards cabem na altura disponível
    const totalVerticalGaps = 4; // gaps verticais
    const availableHeight = containerHeight - totalVerticalGaps;
    const maxRows = Math.floor(availableHeight / cardHeight);
    
    // Total de cards que cabem na tela
    const maxVisibleCards = Math.max(1, maxRows * columns);
    
    // Limitar os pedidos aos que cabem na tela
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