import * as vscode from "vscode";
import * as path from "path";
import { StreamingSTT, STTResult } from "./engine";
import { createSherpaSTT } from "./sherpa";
import { getConfig } from "../config";
import { log, logError } from "../utils/logger";

export type STTLanguage = "en" | "fr";

export interface STTManager {
  start(onResult: (result: STTResult) => void): Promise<void>;
  feedAudio(samples: Float32Array, sampleRate: number): void;
  stop(): Promise<void>;
  switchLanguage(lang: STTLanguage): Promise<void>;
  isRunning(): boolean;
  getLanguage(): STTLanguage;
}

const MODEL_DIRS: Record<STTLanguage, string> = {
  en: "sherpa-onnx-streaming-zipformer-en-2023-06-26",
  fr: "sherpa-onnx-streaming-zipformer-fr-2023-04-14",
};

export function createSTTManager(): STTManager {
  let stt: StreamingSTT | null = null;
  let currentLang: STTLanguage = "fr";
  let onResultCallback: ((result: STTResult) => void) | null = null;

  function getModelDir(lang: STTLanguage): string {
    const config = getConfig();
    if (config.modelDir) return config.modelDir;
    return path.join(getExtensionPath(), "models", MODEL_DIRS[lang]);
  }

  return {
    async start(onResult) {
      if (stt?.isRunning()) return;

      onResultCallback = onResult;
      const modelDir = getModelDir(currentLang);

      log(`Starting STT with language: ${currentLang}, model: ${modelDir}`);

      stt = createSherpaSTT({
        modelDir,
        silenceTimeout: getConfig().silenceTimeout,
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

    async switchLanguage(lang: STTLanguage) {
      if (lang === currentLang) return;

      const wasRunning = stt?.isRunning() ?? false;

      if (wasRunning) {
        await this.stop();
      }

      currentLang = lang;
      log(`Switched STT language to: ${lang}`);

      if (wasRunning && onResultCallback) {
        await this.start(onResultCallback);
      }
    },

    isRunning() {
      return stt?.isRunning() ?? false;
    },

    getLanguage() {
      return currentLang;
    },
  };
}

function getExtensionPath(): string {
  const ext = vscode.extensions.getExtension("voicecode.voicecode");
  return ext?.extensionPath ?? process.cwd();
}
