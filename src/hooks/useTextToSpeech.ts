import { useCallback } from 'react';

interface TTSConfig {
  enabled: boolean;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useTextToSpeech = () => {
  const speak = useCallback(async (text: string, config?: TTSConfig) => {
    if (!config?.enabled || !text) return;
    
    try {
      // Usar Web Speech API como fallback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        
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