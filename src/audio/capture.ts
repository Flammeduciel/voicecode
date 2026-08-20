import { log, logError } from "../utils/logger";

export interface AudioCaptureOptions {
  sampleRate?: number;
  channels?: number;
  device?: string;
}

export type AudioChunkCallback = (samples: Float32Array, sampleRate: number) => void;

export interface AudioCapture {
  start(callback: AudioChunkCallback): Promise<void>;
  stop(): Promise<void>;
  isCapturing(): boolean;
}

export function createAudioCapture(options: AudioCaptureOptions = {}): AudioCapture {
  const targetSampleRate = options.sampleRate ?? 16000;
  let capturing = false;
  let stream: any = null;
  const resampler = createResampler(48000, targetSampleRate);

  return {
    async start(callback: AudioChunkCallback) {
      if (capturing) return;

      try {
        const cpal = require("node-cpal");
        const device = cpal.getDefaultInputDevice();

        if (!device) {
          throw new Error("No input audio devices found");
        }

        log(`Using microphone: ${device.name}`);

        stream = cpal.createStream(
          device.deviceId,
          true,
          {
            sampleRate: 48000,
            channels: 2,
            sampleFormat: "f32",
          },
          (data: Float32Array) => {
            const mono = stereoToMono(data);
            const resampled = resampler.process(mono);
            callback(resampled, targetSampleRate);
          }
        );

        capturing = true;
        log("Audio capture started");
      } catch (err) {
        logError("Failed to start audio capture", err);
        throw err;
      }
    },

    async stop() {
      if (!capturing) return;

      try {
        if (stream) {
          stream.stop();
          stream = null;
        }
        capturing = false;
        resampler.reset();
        log("Audio capture stopped");
      } catch (err) {
        logError("Failed to stop audio capture", err);
      }
    },

    isCapturing() {
      return capturing;
    },
  };
}

function stereoToMono(stereo: Float32Array): Float32Array {
  const mono = new Float32Array(stereo.length / 2);
  for (let i = 0; i < mono.length; i++) {
    mono[i] = (stereo[i * 2] + stereo[i * 2 + 1]) / 2;
  }
  return mono;
}

function createResampler(fromRate: number, toRate: number) {
  const ratio = fromRate / toRate;
  let buffer = new Float32Array(0);

  return {
    process(samples: Float32Array): Float32Array {
      const combined = new Float32Array(buffer.length + samples.length);
      combined.set(buffer, 0);
      combined.set(samples, buffer.length);

      const outputLength = Math.floor(combined.length / ratio);
      const result = new Float32Array(outputLength);
      let consumed = 0;

      for (let i = 0; i < outputLength; i++) {
        const srcIndex = consumed;
        const low = Math.floor(srcIndex);
        const high = low + 1;
        const frac = srcIndex - low;

        if (high < combined.length) {
          result[i] = combined[low] * (1 - frac) + combined[high] * frac;
        } else {
          result[i] = combined[low] || 0;
        }
        consumed += ratio;
      }

      const usedSamples = Math.floor(consumed);
      buffer = combined.slice(usedSamples);

      return result;
    },

    reset() {
      buffer = new Float32Array(0);
    },
  };
}
