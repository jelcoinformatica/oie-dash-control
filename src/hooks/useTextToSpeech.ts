import { useCallback } from 'react';
import { notificationSound } from '../utils/audioGenerator';

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
  const speak = useCallback(async (text: string, orderNumber: string, customerName: string, config?: TTSConfig, soundFile?: string, readySoundType?: 'padrao' | 'padrao2', airportTones?: 1 | 2, deliveryPlatform?: string) => {
    if (!config?.enabled || !text) return;
    
    // Gerar texto baseado no tipo configurado
    let finalText = text;
    
    if (config.textType) {
      // Detectar plataforma de delivery baseada no prefixo ou localEntrega
      let platformPrefix = '';
      let isDeliveryPlatform = false;
      
      if (deliveryPlatform) {
        if (deliveryPlatform.toLowerCase().includes('ifood') || orderNumber.startsWith('IF-')) {
          platformPrefix = 'Ifood, ';
          isDeliveryPlatform = true;
        } else if (deliveryPlatform.toLowerCase().includes('delivery direto') || orderNumber.startsWith('DD-')) {
          platformPrefix = 'Delivery Direto, ';
          isDeliveryPlatform = true;
        } else if (deliveryPlatform.toLowerCase().includes('rappi') || orderNumber.startsWith('RA-')) {
          platformPrefix = 'Rappi, ';
          isDeliveryPlatform = true;
        } else if (deliveryPlatform.toLowerCase().includes('uber') || orderNumber.startsWith('UB-')) {
          platformPrefix = 'Uber Eats, ';
          isDeliveryPlatform = true;
        }
      }

      switch (config.textType) {
        case 'number_only':
          finalText = orderNumber;
          break;
        case 'name_ready':
          if (isDeliveryPlatform) {
            finalText = `${platformPrefix}o pedido ${orderNumber} está pronto!`;
          } else {
            finalText = customerName 
              ? `${customerName}, seu pedido está pronto!`
              : `Pedido ${orderNumber} está pronto!`;
          }
          break;
        case 'order_ready':
          finalText = `${platformPrefix}o pedido ${orderNumber} está pronto.`;
          break;
        case 'name_order_ready':
          if (isDeliveryPlatform) {
            finalText = `${platformPrefix}o pedido ${orderNumber} está pronto!`;
          } else {
            finalText = customerName 
              ? `${customerName}, o pedido ${orderNumber} está pronto!`
              : `O pedido ${orderNumber} está pronto!`;
          }
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

    const playSequence = async (): Promise<void> => {
      return new Promise(async (resolve, reject) => {
        try {
          let soundDuration = 0;
          
          // Tocar som primeiro e calcular duração
          if (soundFile) {
            try {
              const audio = new Audio(soundFile);
              await audio.play();
              
              // Aguardar som terminar completamente
              await new Promise<void>((soundResolve) => {
                audio.addEventListener('ended', () => {
                  soundDuration = audio.duration || 2;
                  soundResolve();
                });
                audio.addEventListener('error', () => {
                  soundDuration = 2;
                  soundResolve();
                });
              });
            } catch (audioError) {
              console.log('Arquivo de som indisponível, usando som gerado');
              soundDuration = airportTones === 1 ? 1.2 : 2.0;
              await notificationSound.playOrderReadySound(readySoundType || 'padrao', airportTones || 2);
            }
          } else {
            // Usar som gerado se nenhum arquivo especificado
            soundDuration = airportTones === 1 ? 1.2 : 2.0;
            await notificationSound.playOrderReadySound(readySoundType || 'padrao', airportTones || 2);
          }
          
          // Aguardar som terminar + 1 segundo adicional antes de falar
          setTimeout(() => {
            performSpeech();
            resolve();
          }, soundDuration * 1000 + 1000);
          
        } catch (error) {
          console.error('Erro na sequência de som e fala:', error);
          reject(error);
        }
      });
    };

    try {
      // Executar primeira vez
      await playSequence();

      // Implementar repetição apenas se explicitamente habilitada E configurada corretamente
      if (config.repeatEnabled === true && config.repeatCount && config.repeatCount > 1 && config.repeatInterval && config.repeatInterval > 0) {
        let completedRepetitions = 1; // Já executamos a primeira
        
        const scheduleNextRepetition = () => {
          if (completedRepetitions < config.repeatCount!) {
            setTimeout(async () => {
              try {
                await playSequence();
                completedRepetitions++;
                scheduleNextRepetition();
              } catch (error) {
                console.error('Erro na repetição:', error);
              }
            }, config.repeatInterval! * 1000);
          }
        };
        
        scheduleNextRepetition();
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