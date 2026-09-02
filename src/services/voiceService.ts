/**
 * Voice Recognition Service for Web Browsers
 * Utilizes standard Web Speech Recognition API with comprehensive event handling
 */

// Define SpeechRecognition interface for TypeScript
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export type VoiceState = 'idle' | 'listening' | 'transcribing' | 'error' | 'unsupported';

export class VoiceService {
  private recognition: any = null;
  private isSupported = false;
  private onTranscriptCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((errorMessage: string) => void) | null = null;
  private onStateChangeCallback: ((state: VoiceState) => void) | null = null;

  constructor() {
    const win = typeof window !== 'undefined' ? (window as IWindow) : null;
    const SpeechRec = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (SpeechRec) {
      this.isSupported = true;
      try {
        this.recognition = new SpeechRec();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'pt-BR';

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const piece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += piece;
            } else {
              interimTranscript += piece;
            }
          }

          const combined = (finalTranscript || interimTranscript).trim();
          if (combined && this.onTranscriptCallback) {
            this.onTranscriptCallback(combined, Boolean(finalTranscript));
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          let userMsg = 'Ocorreu um erro no reconhecimento de voz.';
          if (event.error === 'not-allowed' || event.error === 'permission-denied') {
            userMsg = 'Permissão de microfone negada. Você pode continuar digitando sua informação.';
          } else if (event.error === 'no-speech') {
            userMsg = 'Nenhuma fala foi detectada. Tente falar novamente.';
          } else if (event.error === 'network') {
            userMsg = 'Falha de conexão com o serviço de voz. Digite seu texto.';
          }

          if (this.onStateChangeCallback) this.onStateChangeCallback('error');
          if (this.onErrorCallback) this.onErrorCallback(userMsg);
        };

        this.recognition.onend = () => {
          if (this.onStateChangeCallback) {
            this.onStateChangeCallback('idle');
          }
        };
      } catch (err) {
        console.error('Error initializing SpeechRecognition:', err);
        this.isSupported = false;
      }
    }
  }

  getIsSupported(): boolean {
    return this.isSupported;
  }

  start(
    onTranscript: (transcript: string, isFinal: boolean) => void,
    onError: (errorMsg: string) => void,
    onStateChange: (state: VoiceState) => void
  ) {
    if (!this.isSupported || !this.recognition) {
      onError('Reconhecimento de voz não suportado neste navegador. Use a digitação.');
      onStateChange('unsupported');
      return;
    }

    this.onTranscriptCallback = onTranscript;
    this.onErrorCallback = onError;
    this.onStateChangeCallback = onStateChange;

    try {
      onStateChange('listening');
      this.recognition.start();
    } catch (err: any) {
      // If already started, stop and restart
      if (err.name === 'InvalidStateError') {
        try {
          this.recognition.stop();
          setTimeout(() => {
            try {
              this.recognition.start();
            } catch {
              // ignore
            }
          }, 200);
        } catch {
          // ignore
        }
      } else {
        onError('Não foi possível iniciar o microfone. Verifique as permissões.');
        onStateChange('error');
      }
    }
  }

  stop() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback('idle');
    }
  }
}

export const voiceService = new VoiceService();
