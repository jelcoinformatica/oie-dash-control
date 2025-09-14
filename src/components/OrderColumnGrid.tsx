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
  // Calcular quantos cards cabem na tela baseado na altura disponível
  const { visibleOrders, cardHeight, adjustedFontSize } = useMemo(() => {
    const baseFontSize = 16; // 1rem = 16px
    const requestedFontSize = cardConfig?.fontSize || 1.2;
    
    // Calcular largura disponível por card
    const containerWidth = window.innerWidth * 0.8; // Estimativa conservadora da largura da coluna
    const cardWidth = (containerWidth - 16 - (4 * (columns - 1))) / columns; // Padding + gaps
    
    // Ajustar fonte para caber na largura do card
    // Mínimo de 4 caracteres (número do pedido) + padding
    const maxFontSizeForWidth = Math.min(requestedFontSize, cardWidth / 80); // 80px é o mínimo para 4 dígitos + padding
    
    const actualFontSize = Math.max(0.8, maxFontSizeForWidth) * baseFontSize;
    
    // Altura mínima do card baseada na fonte + padding
    const minCardHeight = Math.max(60, actualFontSize * 2.5);
    
    // Altura disponível (considerando que o container pai tem height: 100%)
    const containerHeight = window.innerHeight - 200; // Deixar espaço para headers, footers etc
    const containerPadding = 16; // 8px em cima e embaixo
    const gap = 4;
    
    const availableHeight = containerHeight - containerPadding;
    
    // Calcular quantas linhas cabem
    const maxRows = Math.floor((availableHeight + gap) / (minCardHeight + gap));
    
    // Total de cards que cabem na tela
    const maxVisibleCards = Math.max(1, maxRows * columns);
    
    // Limitar os pedidos aos que cabem na tela
    const visibleOrders = orders.slice(0, maxVisibleCards);
    
    return {
      visibleOrders,
      cardHeight: minCardHeight,
      adjustedFontSize: maxFontSizeForWidth
    };
  }, [orders, columns, cardConfig?.fontSize]);

  return (
    <div 
      className="grid gap-1 h-full"
      style={{ 
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridAutoRows: `${cardHeight}px`,
        overflow: 'hidden' // Nunca mostrar scroll
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