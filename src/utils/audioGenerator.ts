// Gerador de som de notificação integrado
export type SoundType = 'padrao' | 'padrao2';
export type AirportTones = 1 | 2;

export class NotificationSoundGenerator {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Inicializar AudioContext apenas quando necessário
    this.audioContext = null;
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          throw new Error('AudioContext não suportado neste navegador');
        }
        this.audioContext = new AudioContextClass();
      } catch (error) {
        console.error('Erro ao criar AudioContext:', error);
        throw error;
      }
    }
    return this.audioContext;
  }

  // Gera som estilo aeroporto (1 ou 2 tons) - PADRÃO
  generateAirportSound(tones: AirportTones = 2): AudioBuffer {
    const ctx = this.getAudioContext();
    const sampleRate = ctx.sampleRate;
    const duration = tones === 1 ? 1.2 : 2.0; // Ajusta duração baseado nos tons
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Frequências otimizadas para ambiente de praça de alimentação
    const frequencies = tones === 1 ? [1047] : [1047, 880]; // C6 ou C6+A5
    const toneDuration = tones === 1 ? 0.8 : 0.6; // Tom único mais longo
    const pauseDuration = 0.2; // Pausa entre tons

    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;
      let amplitude = 0;

      // Gerar cada tom conforme quantidade selecionada
      for (let tone = 0; tone < tones; tone++) {
        const toneStart = tone * (toneDuration + pauseDuration);
        const toneEnd = toneStart + toneDuration;

        if (time >= toneStart && time < toneEnd) {
          const localTime = time - toneStart;
          const freq = frequencies[tone];
          
          // Envelope suave para cada tom
          const fadeIn = Math.min(localTime * 8, 1);
          const fadeOut = Math.max(0, (toneDuration - localTime) / toneDuration);
          const envelope = fadeIn * fadeOut;
          
          // Tom principal + harmônicos para riqueza sonora
          amplitude += Math.sin(2 * Math.PI * freq * localTime) * envelope * 0.6;
          amplitude += Math.sin(2 * Math.PI * freq * 2 * localTime) * envelope * 0.2;
          amplitude += Math.sin(2 * Math.PI * freq * 0.5 * localTime) * envelope * 0.1;
        }
      }

      // Aplicar compressão suave e normalização
      data[i] = Math.tanh(amplitude * 1.2) * 0.8;
    }

    return buffer;
  }

  // Som de sino duplo otimizado para ambientes ruidosos - PADRÃO 2
  generateBellSound(): AudioBuffer {
    const ctx = this.getAudioContext();
    const sampleRate = ctx.sampleRate;
    const duration = 2.0; // 2 segundos
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Frequências otimizadas para cortar ruído ambiente (1000-3000Hz)
    const freq1 = 1200; // Primeira nota
    const freq2 = 1600; // Segunda nota (quinta perfeita)
    const freq3 = 2000; // Harmônico adicional para potência

    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;
      let amplitude = 0;

      // Primeiro toque (0-0.8s)
      if (time < 0.8) {
        const fadeIn = Math.min(time * 10, 1);
        const fadeOut = Math.max(0, (0.8 - time) / 0.8);
        const envelope = fadeIn * fadeOut;
        
        amplitude += Math.sin(2 * Math.PI * freq1 * time) * envelope * 0.4;
        amplitude += Math.sin(2 * Math.PI * freq2 * time) * envelope * 0.3;
        amplitude += Math.sin(2 * Math.PI * freq3 * time) * envelope * 0.2;
      }

      // Segundo toque (1.0-1.8s)
      if (time >= 1.0 && time < 1.8) {
        const localTime = time - 1.0;
        const fadeIn = Math.min(localTime * 10, 1);
        const fadeOut = Math.max(0, (0.8 - localTime) / 0.8);
        const envelope = fadeIn * fadeOut;
        
        amplitude += Math.sin(2 * Math.PI * freq1 * localTime) * envelope * 0.4;
        amplitude += Math.sin(2 * Math.PI * freq2 * localTime) * envelope * 0.3;
        amplitude += Math.sin(2 * Math.PI * freq3 * localTime) * envelope * 0.2;
      }

      // Normalizar e aplicar compressão suave para maior potência
      data[i] = Math.tanh(amplitude * 1.5) * 0.8;
    }

    return buffer;
  }

  // Gera som baseado no tipo selecionado
  generateSound(type: SoundType = 'padrao', airportTones: AirportTones = 2): AudioBuffer {
    switch (type) {
      case 'padrao':
        return this.generateAirportSound(airportTones);
      case 'padrao2':
        return this.generateBellSound();
      default:
        return this.generateAirportSound(airportTones);
    }
  }

  // Reproduz o som gerado (mantém compatibilidade)
  async playOrderReadySound(type: SoundType = 'padrao', airportTones: AirportTones = 2): Promise<void> {
    try {
      // Verificar suporte ao Web Audio API
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        throw new Error('Web Audio API não suportado');
      }

      const ctx = this.getAudioContext();
      
      // Garantir que o contexto está funcionando
      if (!ctx) {
        throw new Error('Não foi possível criar AudioContext');
      }
      
      // Retomar contexto se suspenso (necessário para alguns browsers)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      // Verificar se o contexto está rodando
      if (ctx.state !== 'running') {
        throw new Error(`AudioContext está em estado: ${ctx.state}`);
      }

      const buffer = this.generateSound(type, airportTones);
      
      if (!buffer) {
        throw new Error('Falha ao gerar buffer de áudio');
      }
      
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();

      source.buffer = buffer;
      gainNode.gain.value = 1.0; // Volume máximo

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Aguardar próximo frame para garantir que tudo está conectado
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      source.start();
    } catch (error) {
      console.error('Erro ao reproduzir som de notificação:', error);
      throw error; // Re-throw para que o código chamador possa tratar
    }
  }

  // Criar arquivo de áudio blob para download/uso
  createAudioBlob(type: SoundType = 'padrao', airportTones: AirportTones = 2): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const ctx = this.getAudioContext();
        const buffer = this.generateSound(type, airportTones);
        
        // Converter AudioBuffer para WAV
        const wavBuffer = this.audioBufferToWav(buffer);
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Converte AudioBuffer para formato WAV
  private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    // WAV Header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Dados de áudio
    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }

    return arrayBuffer;
  }
}

// Instância global do gerador
export const notificationSound = new NotificationSoundGenerator();