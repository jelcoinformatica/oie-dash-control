import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Inicializando o sistema');

  const steps = [
    'Inicializando o sistema',
    'Carregando configurações',
    'Conectando com banco de dados',
    'Verificando licença',
    'Preparando interface',
    'Sistema pronto!'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 2;
        if (newProgress <= 100) {
          // Atualizar o step baseado no progresso
          const stepIndex = Math.floor((newProgress / 100) * (steps.length - 1));
          setCurrentStep(steps[stepIndex]);
          
          if (newProgress >= 100) {
            setTimeout(() => onComplete(), 500);
          }
          return newProgress;
        }
        return prev;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center z-50">
      <div className="w-full h-full flex">
        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Logo Digital */}
          <div className="mb-8 relative">
            <div className="bg-gray-700 rounded-2xl p-6 shadow-2xl border border-gray-600 mb-6">
              <div className="text-6xl font-bold text-green-400 font-mono tracking-wider">
                88
              </div>
            </div>
          </div>

          {/* Logo Principal */}
          <div className="text-center mb-8">
            <h1 className="text-8xl font-bold text-gray-300 mb-2" style={{ fontFamily: 'system-ui, sans-serif' }}>
              oie!
            </h1>
            <h2 className="text-2xl text-gray-400 font-light tracking-wide">
              Painel de Senhas
            </h2>
          </div>

          {/* Linha Separadora */}
          <div className="w-3/4 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent mb-8"></div>

          {/* Texto Integração */}
          <p className="text-xl text-gray-300 italic mb-12">
            Integrado ao kds da hora!
          </p>

          {/* Rodapé */}
          <div className="absolute bottom-8 flex items-center text-gray-400 text-sm">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <span className="mr-4">JELCO INFORMÁTICA</span>
            <span className="text-gray-500">|</span>
            <span className="ml-4">KDS.APP.BR</span>
          </div>
        </div>

        {/* Painel Lateral Direito */}
        <div className="w-80 bg-black/40 backdrop-blur-sm p-8 flex flex-col justify-between border-l border-gray-700">
          {/* Status do Sistema */}
          <div className="space-y-6">
            <div className="text-right">
              <h3 className="text-white text-lg font-semibold mb-4">
                {currentStep}
              </h3>
              
              {/* Barra de Progresso */}
              <div className="w-full bg-gray-700 rounded-full h-1 mb-6">
                <div 
                  className="bg-green-400 h-1 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-4 text-right text-gray-300 text-sm">
              <div>
                <p className="text-white font-medium">Licenciado para</p>
                <p className="text-green-400">ORLEAN EVENTOS</p>
                <p className="text-xs text-gray-400">37.302.187/0001-98</p>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <p className="text-white font-medium">Banco de Dados</p>
                <p className="text-green-400">ncrsuporteti</p>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <p className="text-white font-medium">Licença válida até</p>
                <p className="text-green-400">11/10/2025</p>
              </div>
            </div>
          </div>

          {/* Versão */}
          <div className="text-right">
            <p className="text-gray-400 text-sm">Versão</p>
            <p className="text-white text-lg font-bold">2.0.25a</p>
          </div>
        </div>
      </div>
    </div>
  );
};