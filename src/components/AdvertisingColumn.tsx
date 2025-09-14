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
}

export const AdvertisingColumn = ({
  title = "PUBLICIDADE",
  imageUrl,
  showHeader = true,
  className,
  headerHeight = 48,
  headerBg = "#8b5cf6",
  headerColor = "#ffffff", 
  backgroundColor = "#ffffff"
}: AdvertisingColumnProps) => {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="bg-white shadow-lg h-full flex flex-col border border-gray-200 rounded-t-lg">
        {showHeader && (
          <div 
            className="flex items-center justify-center text-white font-bold text-lg rounded-t-lg"
            style={{ 
              height: `${headerHeight}px`,
              backgroundColor: headerBg,
              color: headerColor
            }}
          >
            {title}
          </div>
        )}
        
        <div 
          className="flex-1 p-4 flex flex-col items-center justify-center"
          style={{ backgroundColor }}
        >
          {imageUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={imageUrl}
                alt="Publicidade"
                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
              />
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-2xl">📺</div>
              </div>
              <div className="space-y-2">
                <div className="text-lg font-semibold">ESPAÇO</div>
                <div className="text-lg font-semibold">PUBLICITÁRIO</div>
              </div>
              <div className="mt-4 text-sm">
                <div>Dimensões sugeridas:</div>
                <div>{Math.round((window.innerWidth || 1920) * 0.25)} x {Math.round((window.innerHeight || 1080) * 0.6)}px</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};