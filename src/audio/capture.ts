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
            const resampled = resample(mono, 48000, targetSampleRate);
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

function resample(
  samples: Float32Array,
  fromRate: number,
  toRate: number
): Float32Array {
  if (fromRate === toRate) return samples;

  const ratio = fromRate / toRate;
  const newLength = Math.round(samples.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const low = Math.floor(srcIndex);
    const high = low + 1;
    const frac = srcIndex - low;
    result[i] =
      low + 1 < samples.length
        ? samples[low] * (1 - frac) + samples[high] * frac
        : samples[low] || 0;
  }

  return result;
}
