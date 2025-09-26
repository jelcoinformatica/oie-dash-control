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
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 100);
  };

  useEffect(() => {
    // Limpar timers anteriores
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (autoPlay && totalOrders < 2) {
      // Primeira animação após 500ms
      timeoutRef.current = setTimeout(() => {
        startAnimation();
      }, 500);

      // Repetir a cada 15 segundos enquanto tiver menos de 2 pedidos
      intervalRef.current = setInterval(() => {
        if (totalOrders < 2) {
          startAnimation();
        }
      }, repeatInterval);
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