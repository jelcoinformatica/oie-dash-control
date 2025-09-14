import { cn } from '../lib/utils';

interface AdvertisingColumnProps {
  title?: string;
  imageUrl?: string;
  showHeader?: boolean;
  className?: string;
  headerHeight?: number;
}

export const AdvertisingColumn = ({
  title = "PUBLICIDADE",
  imageUrl,
  showHeader = true,
  className,
  headerHeight = 48
}: AdvertisingColumnProps) => {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {showHeader && (
        <div 
          className="bg-advertising text-advertising-foreground px-4 font-bold text-lg shadow-sm border-b flex items-center"
          style={{ height: `${headerHeight}px` }}
        >
          {title}
        </div>
      )}
      
      <div className="flex-1 bg-advertising-light/50 p-4 flex flex-col items-center justify-center">
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
              <div>400 x 600 px</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};