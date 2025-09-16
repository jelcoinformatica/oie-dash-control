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
    <div className={cn("flex flex-col h-full max-h-full", className)}>
      <div className={cn(
        "bg-white shadow-lg flex flex-col border border-gray-200 rounded-t-lg h-full max-h-full overflow-hidden",
        showBorder && 'ring-2 ring-blue-200'
      )}>
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
          className="flex-1 flex items-center justify-center overflow-hidden min-h-0 max-h-full p-2"
          style={{ backgroundColor }}
        >
          {imageUrl ? (
            <div className="w-full h-full flex items-center justify-center min-h-0 max-h-full overflow-hidden">
              {imageUrl.toLowerCase().endsWith('.mp4') ? (
                <video
                  src={imageUrl}
                  autoPlay
                  loop
                  muted
                  className="object-contain"
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto'
                  }}
                />
              ) : (
                <img
                  src={imageUrl}
                  alt="Publicidade"
                  className="object-contain"
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto'
                  }}
                />
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <div className="space-y-2">
                <div className="text-lg font-semibold">ESPAÇO</div>
                <div className="text-lg font-semibold">PUBLICITÁRIO</div>
              </div>
              <div className="mt-4 text-sm opacity-70">
                <div>Configure uma imagem/vídeo</div>
                <div>nas configurações</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};