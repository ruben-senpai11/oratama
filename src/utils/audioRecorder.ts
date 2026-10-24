export function getSupportedMimeType(): string {
  if (typeof window === 'undefined' || !window.MediaRecorder) {
    return '';
  }

  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/aac',
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return '';
}

export interface RecorderOptions {
  maxDurationSeconds?: number;
  onTimeUpdate?: (elapsedSeconds: number, remainingSeconds: number) => void;
  onComplete?: (blob: Blob, mimeType: string, durationSeconds: number) => void;
  onError?: (error: string) => void;
}

export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private recordedChunks: Blob[] = [];
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private elapsedSeconds = 0;
  private maxDuration = 30;
  private options: RecorderOptions = {};
  private mimeType = '';

  public isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  public async startRecording(options: RecorderOptions = {}): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      options.onError?.('L’enregistrement audio n’est pas supporté par ce navigateur.');
      return false;
    }

    this.options = options;
    this.maxDuration = options.maxDurationSeconds || 30;
    this.elapsedSeconds = 0;
    this.recordedChunks = [];
    this.mimeType = getSupportedMimeType();

    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const recorderOptions: MediaRecorderOptions = {};
      if (this.mimeType) {
        recorderOptions.mimeType = this.mimeType;
      }

      this.mediaRecorder = new MediaRecorder(this.audioStream, recorderOptions);

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.cleanupTimer();
        this.cleanupStream();

        const actualMime = this.mimeType || this.mediaRecorder?.mimeType || 'audio/webm';
        const finalBlob = new Blob(this.recordedChunks, { type: actualMime });
        const finalDuration = Math.min(this.elapsedSeconds, this.maxDuration);

        this.options.onComplete?.(finalBlob, actualMime, finalDuration);
      };

      this.mediaRecorder.onerror = () => {
        this.cleanupTimer();
        this.cleanupStream();
        this.options.onError?.('Une erreur est survenue pendant l’enregistrement.');
      };

      this.mediaRecorder.start(200); // chunk every 200ms

      // Démarrage du compte à rebours de 30 secondes
      this.options.onTimeUpdate?.(0, this.maxDuration);
      this.timerInterval = setInterval(() => {
        this.elapsedSeconds += 1;
        const remaining = Math.max(0, this.maxDuration - this.elapsedSeconds);
        this.options.onTimeUpdate?.(this.elapsedSeconds, remaining);

        if (this.elapsedSeconds >= this.maxDuration) {
          this.stopRecording();
        }
      }, 1000);

      return true;
    } catch (err: any) {
      this.cleanupTimer();
      this.cleanupStream();
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.options.onError?.('Accès au micro refusé. Veuillez autoriser l’accès au micro pour enregistrer.');
      } else {
        this.options.onError?.('Impossible d’accéder au micro : ' + (err.message || 'erreur inconnue'));
      }
      return false;
    }
  }

  public stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        // ignore
      }
    }
  }

  public cancelRecording(): void {
    this.cleanupTimer();
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        // ignore
      }
    }
    this.cleanupStream();
    this.recordedChunks = [];
  }

  private cleanupTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private cleanupStream(): void {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }
  }
}
