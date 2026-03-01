import { useRef, useEffect, useState } from 'react';
import { cn } from '../lib/utils';

interface LastOrderDisplayProps {
  orderNumber: string;
  nickname?: string;
  config?: {
    height: number;
    fontSize: number;
    pulseAnimation: boolean;
    highlight: boolean;
    fontFamily?: string;
    textColor?: string;
    backgroundColor?: string;
  };
  className?: string;
  onExpedite?: (orderNumber: string) => void;
}

export const LastOrderDisplay = ({ 
  orderNumber, 
  nickname,
  config,
  className,
  onExpedite
}: LastOrderDisplayProps) => {
  const safeConfig = {
    height: config?.height || 120,
    fontSize: config?.fontSize || 5,
    pulseAnimation: config?.pulseAnimation || false,
    highlight: config?.highlight || false,
    fontFamily: config?.fontFamily || 'Arial',
    textColor: config?.textColor || '#000000',
    backgroundColor: config?.backgroundColor || '#fef3c7'
  };

  const displayNumber = String(orderNumber || '');
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const isDelivery = !!displayNumber.match(/^(IF|DD|RA|UB|KE|99)-/);
  const mainNumber = isDelivery ? displayNumber.split('-')[1] : displayNumber;
  const platformPrefix = isDelivery ? displayNumber.split('-')[0] : null;

  const platformLogos: Record<string, string> = {
    'IF': '/images/platforms/ifood.png',
    'RA': '/images/platforms/rappi.png',
    'UB': '/images/platforms/rappi.png',
    'DD': '/images/platforms/deliverydireto.png',
    'KE': '/images/platforms/keeta.png',
    '99': '/images/platforms/99food.png',
  };

  const getPlatformName = (prefix: string) => {
    switch (prefix) {
      case 'IF': return 'iFood';
      case 'RA': return 'Rappi';
      case 'UB': return 'Uber';
      case 'DD': return 'Delivery Direto';
      case 'KE': return 'Keeta';
      case '99': return '99 Food';
      default: return prefix;
    }
  };

  const platformLogo = platformPrefix ? platformLogos[platformPrefix] : null;

  // Auto-fit: medir e escalar
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const containerH = el.clientHeight;
      const containerW = el.clientWidth;
      if (containerH === 0 || containerW === 0) return;

      const baseFontSize = safeConfig.fontSize;
      const numberPx = baseFontSize * 16 * 1.1;
      const namePx = nickname ? baseFontSize * 0.5 * 16 * 1.3 : 0;
      const prefixPx = isDelivery ? baseFontSize * 0.4 * 16 : 0;
      const padding = 24;

      const totalNeeded = numberPx + namePx + prefixPx + padding;

      // Também checar largura
      const charCount = (mainNumber || '').length;
      const estimatedW = charCount * baseFontSize * 16 * 0.65;
      const widthScale = estimatedW > containerW - 32 ? (containerW - 32) / estimatedW : 1;

      const heightScale = totalNeeded > containerH ? containerH / totalNeeded : 1;

      setScale(Math.max(0.4, Math.min(heightScale, widthScale)));
    };

    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, [safeConfig.fontSize, nickname, isDelivery, mainNumber]);

  const scaledFont = safeConfig.fontSize * scale;

  const handleClick = () => {
    if (onExpedite) {
      onExpedite(orderNumber);
    }
  };

  return (
    <div 
      className={cn(
        "p-3 mx-4 rounded-lg text-center cursor-pointer hover:opacity-80 transition-opacity",
        safeConfig.pulseAnimation && "animate-pulse",
        className
      )}
      style={{ 
        height: `${safeConfig.height * 0.85}px`,
        fontFamily: safeConfig.fontFamily,
        color: safeConfig.textColor,
        backgroundColor: safeConfig.backgroundColor,
        marginTop: '8px'
      }}
      onClick={handleClick}
    >
      <div ref={containerRef} className="relative h-full flex flex-col items-center justify-center overflow-hidden">
        {platformLogo && (
          <div className="absolute top-0 left-0 z-10">
            <div className="rounded-full overflow-hidden border border-gray-200 shadow-sm"
              style={{ width: `${Math.max(scaledFont * 0.6, 1.2)}rem`, height: `${Math.max(scaledFont * 0.6, 1.2)}rem` }}>
              <img src={platformLogo} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        )}
        {platformPrefix && !platformLogo && (
          <span style={{ 
            fontStyle: 'italic', 
            fontWeight: 'normal',
            fontSize: `${scaledFont * 0.45}rem`,
            lineHeight: '1'
          }}>
            {getPlatformName(platformPrefix)}
          </span>
        )}
        <span className="leading-none font-bold" style={{ fontSize: `${scaledFont}rem`, lineHeight: '1' }}>
          {mainNumber}
        </span>
        {nickname && (
          <div 
            className="leading-none overflow-hidden text-ellipsis whitespace-nowrap w-full"
            style={{ fontSize: `${scaledFont * 0.45}rem`, lineHeight: '1.2', marginTop: '2px', opacity: 0.9 }}
          >
            {nickname}
          </div>
        )}
      </div>
    </div>
  );
};
