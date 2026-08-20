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
  const sampleRate = options.sampleRate ?? 16000;
  const channels = options.channels ?? 1;
  let capturing = false;
  let stream: any = null;

  return {
    async start(callback: AudioChunkCallback) {
      if (capturing) return;

      try {
        const cpal = require("node-cpal");
        const devices = cpal.getDevices();
        const inputDevices = devices.filter(
          (d: any) => d.isInput || d.isDefaultInput
        );

        if (inputDevices.length === 0) {
          throw new Error("No input audio devices found");
        }

        const device =
          options.device && options.device !== "default"
            ? inputDevices.find((d: any) => d.name.includes(options.device!))
            : inputDevices[0];

        if (!device) {
          throw new Error(`Microphone "${options.device}" not found`);
        }

        log(`Using microphone: ${device.name}`);

        stream = cpal.createStream(
          device.id,
          true,
          {
            sampleRate,
            channels,
            sampleFormat: 32,
          },
          (data: Float32Array) => {
            callback(data, sampleRate);
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
