import { cn } from '../lib/utils';
import { useState, useEffect, useRef } from 'react';

interface AdvertisingColumnProps {
  title?: string;
  imageUrl?: string;
  showHeader?: boolean;
  className?: string;
  headerHeight?: number;
  headerBg?: string;
  headerColor?: string;
  backgroundColor?: string;
  showBorder?: boolean;
  fillImage?: boolean;
  onToggleHeader?: () => void;
}

export const AdvertisingColumn = ({
  title = "PUBLICIDADE",
  imageUrl,
  showHeader = true,
  className,
  headerHeight = 48,
  headerBg = "#8b5cf6",
  headerColor = "#ffffff", 
  backgroundColor = "#ffffff",
  showBorder = false,
  fillImage = false,
  onToggleHeader
}: AdvertisingColumnProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Calcula o espaço disponível para a imagem
        const availableHeight = rect.height - (showHeader ? headerHeight : 0) - 32; // 32px for padding
        const availableWidth = rect.width - 32; // 32px for padding
        setContainerDimensions({ 
          width: Math.max(0, Math.round(availableWidth)), 
          height: Math.max(0, Math.round(availableHeight))
        });
      }
    };

    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [showHeader, headerHeight]);

  return (
    <div className={cn("flex flex-col h-full", className)} ref={containerRef}>
      <div className={`bg-white shadow-lg h-full flex flex-col border border-gray-200 rounded-t-lg ${showBorder ? 'ring-2 ring-blue-200' : ''}`}>
        {showHeader && (
          <div 
            className="flex items-center justify-center text-white font-bold text-lg rounded-t-lg relative cursor-pointer hover:bg-opacity-90 transition-all flex-shrink-0"
            style={{ 
              height: `${headerHeight}px`,
              backgroundColor: headerBg,
              color: headerColor
            }}
            onClick={onToggleHeader}
            title="Clique para ocultar/exibir cabeçalho"
          >
            <span>{title}</span>
            {onToggleHeader && (
              <div className="absolute right-2 text-xs opacity-70 hover:opacity-100 transition-opacity">
                👁️
              </div>
            )}
          </div>
        )}
        
        <div 
          className="flex-1 p-4 flex flex-col items-center justify-center overflow-hidden min-h-0"
          style={{ backgroundColor }}
        >
          {imageUrl ? (
            <div className="w-full h-full flex items-center justify-center min-h-0">
              <img
                src={imageUrl}
                alt="Publicidade"
                className={`rounded-lg shadow-sm ${fillImage ? 'w-full h-full object-cover' : 'max-w-full max-h-full object-contain'}`}
                style={fillImage ? {} : { 
                  maxHeight: `${containerDimensions.height}px`,
                  maxWidth: `${containerDimensions.width}px`
                }}
              />
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <div className="space-y-2">
                <div className="text-lg font-semibold">ESPAÇO</div>
                <div className="text-lg font-semibold">PUBLICITÁRIO</div>
              </div>
              <div className="mt-4 text-sm">
                <div>Dimensões sugeridas:</div>
                <div>{containerDimensions.width} x {containerDimensions.height}px</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};