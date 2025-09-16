// Gerador de som de notificação integrado
export class NotificationSoundGenerator {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Inicializar AudioContext apenas quando necessário
    this.audioContext = null;
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Gera um som de sino duplo otimizado para ambientes ruidosos
  generateOrderReadySound(): AudioBuffer {
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

  // Reproduz o som gerado
  async playOrderReadySound(): Promise<void> {
    try {
      const ctx = this.getAudioContext();
      
      // Retomar contexto se suspenso
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const buffer = this.generateOrderReadySound();
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();

      source.buffer = buffer;
      gainNode.gain.value = 1.0; // Volume máximo

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start();
    } catch (error) {
      console.error('Erro ao reproduzir som de notificação:', error);
    }
  }

  // Criar arquivo de áudio blob para download/uso
  createAudioBlob(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const ctx = this.getAudioContext();
        const buffer = this.generateOrderReadySound();
        
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