import { cn } from '../lib/utils';
import { NewsDisplay } from './NewsDisplay';
import { AnimatedWatermark } from './AnimatedWatermark';

interface AdvertisingColumnProps {
  title?: string;
  imageUrl?: string;
  websiteUrl?: string;
  showHeader?: boolean;
  className?: string;
  headerHeight?: number;
  headerBg?: string;
  headerColor?: string;
  backgroundColor?: string;
  showBorder?: boolean;
  newsMode?: boolean;
  newsSource?: 'g1' | 'uol' | 'cnn' | 'panelinha' | 'cybercook' | 'tudogostoso' | 'foodnetwork';
  newsFontSize?: number; // Nova prop para tamanho da fonte
  totalOrders?: number; // Número total de pedidos para controlar a animação da marca d'água
  onToggleHeader?: () => void;
}

export const AdvertisingColumn = ({
  title = "PUBLICIDADE",
  imageUrl,
  websiteUrl,
  showHeader = true,
  className,
  headerHeight = 48,
  headerBg = "#8b5cf6",
  headerColor = "#ffffff", 
  backgroundColor = "#ffffff",
  showBorder = false,
  newsMode = false,
  newsSource = 'g1',
  newsFontSize = 2.5, // Tamanho padrão para visualização à distância
  totalOrders = 0,
  onToggleHeader
}: AdvertisingColumnProps) => {

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className={cn(
        "bg-white shadow-lg flex flex-col border border-gray-200 rounded-t-lg h-full overflow-hidden",
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
          className="flex-1 flex items-center justify-center overflow-hidden p-2"
          style={{ backgroundColor: newsMode ? 'transparent' : backgroundColor }}
        >
          {newsMode ? (
            <NewsDisplay 
              className="w-full h-full"
              autoRotate={true}
              rotationInterval={25000} // 25 segundos
              showSource={true}
              newsSource={newsSource}
              fontSize={newsFontSize} // Passa o tamanho da fonte configurado
            />
          ) : websiteUrl ? (
            <iframe
              src={websiteUrl}
              className="w-full h-full border-0"
              title="Website"
              allow="autoplay; encrypted-media"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          ) : imageUrl ? (
            <div className="flex items-center justify-center h-full w-full">
              {imageUrl.toLowerCase().endsWith('.mp4') ? (
                <video
                  src={imageUrl}
                  autoPlay
                  loop
                  muted
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <img
                  src={imageUrl}
                  alt="Publicidade"
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground relative">
              {/* Marca d'água animada OIE! */}
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatedWatermark 
                  totalOrders={totalOrders}
                  autoPlay={true}
                  className="text-6xl"
                />
              </div>
              
              {/* Conteúdo do espaço publicitário */}
              <div className="relative z-10">
                <div className="space-y-2">
                  <div className="text-lg font-semibold">ESPAÇO</div>
                  <div className="text-lg font-semibold">PUBLICITÁRIO</div>
                </div>
                <div className="mt-4 text-sm opacity-70">
                  <div>Configure imagem/vídeo/url/notícias</div>
                  <div>nas configurações</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};