import { cn } from '../lib/utils';

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
  onToggleHeader
}: AdvertisingColumnProps) => {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className={`bg-white shadow-lg h-full flex flex-col border border-gray-200 rounded-t-lg ${showBorder ? 'ring-2 ring-blue-200' : ''}`}>
        {showHeader && (
          <div 
            className="flex items-center justify-center text-white font-bold text-lg rounded-t-lg relative cursor-pointer hover:bg-opacity-90 transition-all"
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
          className="flex-1 p-4 flex flex-col items-center justify-center overflow-hidden"
          style={{ backgroundColor }}
        >
          {imageUrl ? (
            <div className="w-full h-full flex items-center justify-center min-h-0">
              <img
                src={imageUrl}
                alt="Publicidade"
                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                style={{ maxHeight: '100%', maxWidth: '100%' }}
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
                <div>{Math.round((window.innerWidth || 1920) * 0.22)} x {Math.round((window.innerHeight || 1080) * 0.6)}px</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};