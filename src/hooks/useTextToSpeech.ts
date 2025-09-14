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
      // Usar Web Speech API como fallback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(finalText);
        
        if (config.voice) {
          const voices = speechSynthesis.getVoices();
          // Tentar encontrar uma voz em português-BR primeiro
          const selectedVoice = voices.find(voice => 
            voice.lang === 'pt-BR' || voice.lang.includes('pt-BR')
          ) || voices.find(voice => 
            voice.name.includes('Portuguese') || voice.lang.includes('pt')
          ) || voices.find(voice => 
            voice.name.includes(config.voice!)
          );
          if (selectedVoice) utterance.voice = selectedVoice;
        } else {
          // Se não especificou voz, tentar português-BR por padrão
          const voices = speechSynthesis.getVoices();
          const ptBrVoice = voices.find(voice => 
            voice.lang === 'pt-BR' || voice.lang.includes('pt-BR')
          ) || voices.find(voice => 
            voice.name.includes('Portuguese') || voice.lang.includes('pt')
          );
          if (ptBrVoice) utterance.voice = ptBrVoice;
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