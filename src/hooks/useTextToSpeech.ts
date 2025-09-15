import { useCallback } from 'react';

interface TTSConfig {
  enabled: boolean;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  textType?: 'number_only' | 'name_ready' | 'order_ready' | 'name_order_ready' | 'custom';
  customText?: string;
  repeatEnabled?: boolean;
  repeatCount?: number;
  repeatInterval?: number;
}

export const useTextToSpeech = () => {
  const speak = useCallback(async (text: string, orderNumber: string, customerName: string, config?: TTSConfig, soundFile?: string) => {
    if (!config?.enabled || !text) return;
    
    // Gerar texto baseado no tipo configurado
    let finalText = text;
    
    if (config.textType) {
      switch (config.textType) {
        case 'number_only':
          finalText = orderNumber;
          break;
        case 'name_ready':
          finalText = customerName 
            ? `${customerName}, seu pedido está pronto!`
            : `Pedido ${orderNumber} está pronto!`;
          break;
        case 'order_ready':
          finalText = `O pedido ${orderNumber} está pronto.`;
          break;
        case 'name_order_ready':
          finalText = customerName 
            ? `${customerName}, o pedido ${orderNumber} está pronto!`
            : `O pedido ${orderNumber} está pronto!`;
          break;
        case 'custom':
          finalText = config.customText || text;
          break;
        default:
          finalText = text;
      }
    }
    
    const performSpeech = () => {
      try {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(finalText);
          
          // Função para executar após vozes carregarem
          const executeWithVoices = () => {
            const voices = speechSynthesis.getVoices();
            let selectedVoice = null;
            
            if (config.voice && config.voice !== 'auto') {
              // Procurar pela voz específica configurada
              selectedVoice = voices.find(voice => 
                voice.name === config.voice || 
                voice.name.includes(config.voice!) || 
                config.voice!.includes(voice.name)
              );
              
              // Se não encontrou, tentar busca mais específica
              if (!selectedVoice) {
                const voiceSearchTerm = config.voice.toLowerCase().replace('microsoft ', '');
                selectedVoice = voices.find(voice => 
                  voice.name.toLowerCase().includes(voiceSearchTerm) && 
                  (voice.lang === 'pt-BR' || voice.lang.includes('pt'))
                );
              }
            }
            
            // Se não encontrou voz específica, usar primeira voz português-BR disponível
            if (!selectedVoice) {
              selectedVoice = voices.find(voice => 
                voice.lang === 'pt-BR' || voice.lang.includes('pt-BR')
              ) || voices.find(voice => 
                voice.name.includes('Portuguese') || voice.lang.includes('pt')
              );
            }
            
            if (selectedVoice) {
              utterance.voice = selectedVoice;
            }
            
            utterance.rate = config.rate || 1;
            utterance.pitch = config.pitch || 1;
            utterance.volume = config.volume || 0.8;
            utterance.lang = 'pt-BR';
            
            speechSynthesis.speak(utterance);
          };
          
          // Aguardar vozes carregarem se necessário
          const voices = speechSynthesis.getVoices();
          if (voices.length > 0) {
            executeWithVoices();
          } else {
            // Aguardar evento de carregamento das vozes
            const onVoicesChanged = () => {
              speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
              executeWithVoices();
            };
            speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
            
            // Fallback: executar após 500ms mesmo sem vozes
            setTimeout(executeWithVoices, 500);
          }
        }
      } catch (error) {
        console.error('Erro no Text-to-Speech:', error);
      }
    };

    try {
      // Tocar som primeiro, se disponível
      if (soundFile) {
        const audio = new Audio(soundFile);
        audio.play().then(() => {
          // Aguardar som terminar + pausa de 0.5s antes de falar
          audio.addEventListener('ended', () => {
            setTimeout(performSpeech, 500);
          });
        }).catch(() => {
          // Se falhar ao tocar som, falar diretamente com pausa
          setTimeout(performSpeech, 500);
        });
      } else {
        performSpeech();
      }

      // Implementar repetição se configurado
      if (config.repeatEnabled && config.repeatCount && config.repeatInterval) {
        for (let i = 1; i < config.repeatCount; i++) {
          setTimeout(() => {
            if (soundFile) {
              const audio = new Audio(soundFile);
              audio.play().then(() => {
                audio.addEventListener('ended', () => {
                  setTimeout(performSpeech, 500);
                });
              }).catch(() => {
                setTimeout(performSpeech, 500);
              });
            } else {
              performSpeech();
            }
          }, i * config.repeatInterval * 1000);
        }
      }
    } catch (error) {
      console.error('Erro no Text-to-Speech:', error);
    }
  }, []);

  const getAvailableVoices = useCallback(() => {
    if ('speechSynthesis' in window) {
      const voices = speechSynthesis.getVoices();
      return voices.filter(voice => 
        voice.lang === 'pt-BR' || voice.lang.includes('pt-BR') || voice.lang.includes('pt')
      );
    }
    return [];
  }, []);

  return { speak, getAvailableVoices };
};