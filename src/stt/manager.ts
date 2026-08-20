import * as vscode from "vscode";
import * as path from "path";
import { StreamingSTT, STTResult } from "./engine";
import { createSherpaSTT } from "./sherpa";
import { getConfig } from "../config";
import { log, logError } from "../utils/logger";

export interface STTManager {
  start(onResult: (result: STTResult) => void): Promise<void>;
  feedAudio(samples: Float32Array, sampleRate: number): void;
  stop(): Promise<void>;
  isRunning(): boolean;
}

export function createSTTManager(): STTManager {
  let stt: StreamingSTT | null = null;

  return {
    async start(onResult) {
      if (stt?.isRunning()) return;

      const config = getConfig();
      const modelDir =
        config.modelDir || path.join(getExtensionPath(), "models", "sherpa-onnx-streaming-zipformer-en-2023-06-26");

      stt = createSherpaSTT({
        modelDir,
        silenceTimeout: config.silenceTimeout,
      });

      stt.start(onResult);
    },

    feedAudio(samples: Float32Array, sampleRate: number) {
      stt?.feedAudio(samples, sampleRate);
    },

    async stop() {
      stt?.stop();
      stt = null;
    },

    isRunning() {
      return stt?.isRunning() ?? false;
    },
  };
}

function getExtensionPath(): string {
  const ext = vscode.extensions.getExtension("voicecode.voicecode");
  return ext?.extensionPath ?? process.cwd();
}
