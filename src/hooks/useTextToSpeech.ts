import { useCallback } from 'react';

interface TTSConfig {
  enabled: boolean;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  textType?: 'number_only' | 'name_ready' | 'order_ready';
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
        default:
          finalText = text;
      }
    }
    
    try {
      // Usar Web Speech API como fallback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(finalText);
        
        if (config.voice) {
          const voices = speechSynthesis.getVoices();
          const selectedVoice = voices.find(voice => 
            voice.name.includes(config.voice!) || voice.lang.includes('pt-BR')
          );
          if (selectedVoice) utterance.voice = selectedVoice;
        }
        
        utterance.rate = config.rate || 1;
        utterance.pitch = config.pitch || 1;
        utterance.volume = config.volume || 0.8;
        
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Erro no Text-to-Speech:', error);
    }
  }, []);

  return { speak };
};