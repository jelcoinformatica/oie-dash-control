import { useCallback } from 'react';

interface TTSConfig {
  enabled: boolean;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  textType?: 'number_only' | 'name_ready' | 'order_ready' | 'custom';
  customText?: string;
}

export const useTextToSpeech = () => {
  const speak = useCallback(async (text: string, orderNumber: string, customerName: string, config?: TTSConfig) => {
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
        case 'custom':
          finalText = config.customText || text;
          break;
        default:
          finalText = text;
      }
    }
    
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(finalText);
        
        // Configurar voz em português-BR
        const voices = speechSynthesis.getVoices();
        let selectedVoice = null;
        
        if (config.voice) {
          // Procurar pela voz específica configurada
          selectedVoice = voices.find(voice => 
            voice.name.includes(config.voice!) && (voice.lang === 'pt-BR' || voice.lang.includes('pt'))
          );
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
        utterance.lang = 'pt-BR'; // Forçar idioma português-BR
        
        speechSynthesis.speak(utterance);
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