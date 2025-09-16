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
            <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 tracking-tight drop-shadow-2xl">
              oie!
            </div>
            <div className="absolute -inset-6 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-blue-300/30 blur-2xl -z-10 animate-pulse" />
          </div>
          
          <div className="space-y-3">
            <div className="text-3xl text-slate-200 font-semibold tracking-wide">
              Kitchen Display System
            </div>
            <div className="text-lg text-slate-400 font-medium uppercase tracking-[0.3em]">
              Sistema de Exibição de Pedidos
            </div>
          </div>
        </div>

        {/* Version Badge - More Prominent */}
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl border border-slate-600/50 shadow-2xl">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
            <span className="text-slate-100 text-lg font-bold tracking-wide">Versão 5.0</span>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50" />
          </div>
        </div>

        {/* Features - Better organized and prominent */}
        <div className="space-y-4">
          <div className="text-slate-300 text-sm font-medium uppercase tracking-widest mb-6">
            Recursos Principais
          </div>
          <div className="flex items-center justify-center space-x-12 text-slate-300">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/30" />
              <span className="text-sm font-medium">Auto-expedição</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/30" />
              <span className="text-sm font-medium">Notificações Sonoras</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/30" />
              <span className="text-sm font-medium">Tempo Real</span>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce shadow-lg shadow-blue-400/50" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce shadow-lg shadow-purple-400/50" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce shadow-lg shadow-blue-300/50" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* Instructions - More prominent */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
          <div className="px-6 py-3 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-600/30">
            <div className="text-slate-200 text-base font-medium">
              Pressione qualquer tecla para continuar
            </div>
          </div>
        </div>
      </div>

      {/* Company Info - More prominent */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-slate-400 text-base font-semibold tracking-wide">
          Jelco Informática
        </div>
        <div className="text-slate-500 text-sm mt-1 font-medium">
          © 2025 - Todos os direitos reservados
        </div>
      </div>
    </div>
  );
};