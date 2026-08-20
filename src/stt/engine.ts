export interface STTResult {
  text: string;
  isFinal: boolean;
}

export type STTResultCallback = (result: STTResult) => void;

export interface StreamingSTT {
  start(callback: STTResultCallback): void;
  feedAudio(samples: Float32Array, sampleRate: number): void;
  stop(): void;
  isRunning(): boolean;
}
