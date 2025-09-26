import React, { useState, useEffect, useRef } from 'react';

interface AnimatedWatermarkProps {
  className?: string;
  autoPlay?: boolean;
  duration?: number;
  totalOrders?: number; // Número total de pedidos no sistema
  repeatInterval?: number; // Intervalo de repetição em ms (padrão 15s)
}

export const AnimatedWatermark: React.FC<AnimatedWatermarkProps> = ({
  className = "",
  autoPlay = true,
  duration = 3000,
  totalOrders = 0,
  repeatInterval = 15000 // 15 segundos
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função para iniciar uma animação
  const startAnimation = () => {
    console.log('AnimatedWatermark - startAnimation called, current isAnimating:', isAnimating);
    setIsAnimating(false);
    setTimeout(() => {
      console.log('AnimatedWatermark - Setting isAnimating to true');
      setIsAnimating(true);
    }, 100);
  };

  useEffect(() => {
    console.log('AnimatedWatermark - useEffect triggered:', { autoPlay, totalOrders, repeatInterval });
    
    // Limpar timers anteriores
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (autoPlay && totalOrders < 2) {
      console.log('AnimatedWatermark - Starting animation cycle');
      
      // Primeira animação após 500ms
      timeoutRef.current = setTimeout(() => {
        console.log('AnimatedWatermark - Starting first animation');
        startAnimation();
      }, 500);

      // Repetir a cada 15 segundos enquanto tiver menos de 2 pedidos
      intervalRef.current = setInterval(() => {
        console.log('AnimatedWatermark - Interval animation check, totalOrders:', totalOrders);
        if (totalOrders < 2) {
          console.log('AnimatedWatermark - Starting interval animation');
          startAnimation();
        }
      }, repeatInterval);
    } else {
      console.log('AnimatedWatermark - Animation not started:', { autoPlay, totalOrders });
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoPlay, totalOrders, repeatInterval]);

  const handleReplay = () => {
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 100);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Debug info */}
      <div className="absolute -top-6 left-0 text-xs text-red-500 bg-white px-1">
        isAnimating: {isAnimating ? 'true' : 'false'} | totalOrders: {totalOrders}
      </div>

      {/* Container para a animação */}
      <div 
        className={`watermark-container ${isAnimating ? 'animate' : ''}`}
        style={{ 
          border: isAnimating ? '2px solid red' : '2px solid green',
          backgroundColor: isAnimating ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)'
        }}
      >
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
      <button 
        onClick={() => startAnimation()}
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
      >
        Replay Animation
      </button>
    </div>
  );
};

export default AnimatedWatermark;