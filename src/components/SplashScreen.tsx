import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Handle any key press to dismiss
    const handleKeyPress = () => {
      dismissSplash();
    };

    // Auto dismiss after 5 seconds
    const autoTimeout = setTimeout(() => {
      dismissSplash();
    }, 5000);

    const dismissSplash = () => {
      setFadeOut(true);
      setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 500);
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      clearTimeout(autoTimeout);
    };
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center z-50 transition-all duration-500 ${fadeOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      </div>

      <div className="relative text-center space-y-12 animate-fade-in">
        {/* Main Logo */}
        <div className="space-y-6">
          <div className="relative">
            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 tracking-tight">
              oie!
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-300/20 blur-xl -z-10 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <div className="text-2xl text-slate-300 font-light tracking-wider">
              Kitchen Display System
            </div>
            <div className="text-sm text-slate-500 uppercase tracking-widest">
              Sistema de Exibição de Pedidos
            </div>
          </div>
        </div>

        {/* Version and Features */}
        <div className="space-y-6">
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-3 px-6 py-3 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-slate-300 text-sm font-medium">Versão 5.0</span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-8 text-slate-400 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-blue-400 rounded-full" />
              <span>Auto-expedição</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-purple-400 rounded-full" />
              <span>Notificações sonoras</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-green-400 rounded-full" />
              <span>Tempo real</span>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center space-y-2">
          <div className="text-slate-400 text-sm">
            Pressione qualquer tecla para continuar
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-slate-500 text-sm font-medium">
          Jelco Informática
        </div>
        <div className="text-slate-600 text-xs mt-1">
          © 2025 - Todos os direitos reservados
        </div>
      </div>
    </div>
  );
};