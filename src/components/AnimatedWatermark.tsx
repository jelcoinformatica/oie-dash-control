import React, { useState, useEffect } from 'react';

interface AnimatedWatermarkProps {
  className?: string;
  autoPlay?: boolean;
  duration?: number;
}

export const AnimatedWatermark: React.FC<AnimatedWatermarkProps> = ({
  className = "",
  autoPlay = true,
  duration = 3000
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (autoPlay) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [autoPlay]);

  const handleReplay = () => {
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 100);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Container para a animação */}
      <div className={`watermark-container ${isAnimating ? 'animate' : ''}`}>
        {/* O inicial */}
        <span className="watermark-letter o-letter">O</span>
        
        {/* I inicial (sem ponto) */}
        <span className="watermark-letter i-letter">I</span>
        
        {/* Ponto do I que vai pular */}
        <span className="watermark-dot i-dot"></span>
        
        {/* I duplicado que vai correr atrás do ponto */}
        <span className="watermark-letter i-duplicate">I</span>
        
        {/* E inicial */}
        <span className="watermark-letter e-letter">E</span>
        
        {/* Exclamação final (inicialmente invisível) */}
        <span className="watermark-exclamation">!</span>
      </div>

      {/* Botão para repetir animação */}
      {!autoPlay && (
        <button 
          onClick={handleReplay}
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs opacity-50 hover:opacity-100 transition-opacity"
        >
          Replay
        </button>
      )}
    </div>
  );
};

export default AnimatedWatermark;