import * as path from "path";
import * as fs from "fs";
import { log, logError } from "../utils/logger";
import { StreamingSTT, STTResult, STTResultCallback } from "./engine";

export interface SherpaSTTOptions {
  modelDir: string;
  silenceTimeout?: number;
}

export function createSherpaSTT(options: SherpaSTTOptions): StreamingSTT {
  const sherpa = require("sherpa-onnx-node");
  let recognizer: any = null;
  let stream: any = null;
  let callback: STTResultCallback | null = null;
  let running = false;
  let audioBuffer: Float32Array = new Float32Array(0);
  const BUFFER_SIZE = 320;

  function findModelFiles(modelDir: string) {
    const files = fs.readdirSync(modelDir);

    const encoder =
      files.find((f) => f.includes("encoder") && f.endsWith(".onnx") && !f.includes("int8")) ||
      files.find((f) => f.includes("encoder") && f.endsWith(".onnx"));
    const decoder =
      files.find((f) => f.includes("decoder") && f.endsWith(".onnx") && !f.includes("int8")) ||
      files.find((f) => f.includes("decoder") && f.endsWith(".onnx"));
    const joiner =
      files.find((f) => f.includes("joiner") && f.endsWith(".onnx") && !f.includes("int8")) ||
      files.find((f) => f.includes("joiner") && f.endsWith(".onnx"));
    const tokens = files.find((f) => f === "tokens.txt");

    if (!encoder || !decoder || !joiner || !tokens) {
      throw new Error(
        `Missing model files in ${modelDir}. Expected: encoder*.onnx, decoder*.onnx, joiner*.onnx, tokens.txt`
      );
    }

    return {
      encoder: path.join(modelDir, encoder),
      decoder: path.join(modelDir, decoder),
      joiner: path.join(modelDir, joiner),
      tokens: path.join(modelDir, tokens),
    };
  }

  return {
    start(resultCallback: STTResultCallback) {
      if (running) return;

      try {
        const modelDir = options.modelDir;
        if (!modelDir || !fs.existsSync(modelDir)) {
          throw new Error(
            `Model directory not found: ${modelDir}. Run scripts/download-models.ps1 first.`
          );
        }

        const models = findModelFiles(modelDir);
        log(`Loading STT model from: ${modelDir}`);

        const config = {
          modelConfig: {
            transducer: {
              encoder: models.encoder,
              decoder: models.decoder,
              joiner: models.joiner,
            },
            tokens: models.tokens,
            numThreads: 4,
            provider: "cpu",
            debug: false,
          },
          featConfig: {
            sampleRate: 16000,
            featureDim: 80,
          },
          decodingMethod: "greedy_search",
          enableEndpoint: true,
          rule1MinTrailingSilence: 6.0,
          rule2MinTrailingSilence: 4.0,
          rule3MinUtteranceLength: 60,
        };

        recognizer = new sherpa.OnlineRecognizer(config);
        stream = recognizer.createStream();
        callback = resultCallback;
        audioBuffer = new Float32Array(0);
        running = true;

        log("STT initialized and ready");
      } catch (err) {
        logError("Failed to initialize STT", err);
        throw err;
      }
    },

    feedAudio(samples: Float32Array, sampleRate: number) {
      if (!running || !recognizer || !stream || !callback) return;

      try {
        const combined = new Float32Array(audioBuffer.length + samples.length);
        combined.set(audioBuffer, 0);
        combined.set(samples, audioBuffer.length);
        audioBuffer = combined;

        while (audioBuffer.length >= BUFFER_SIZE) {
          const chunk = audioBuffer.slice(0, BUFFER_SIZE);
          audioBuffer = audioBuffer.slice(BUFFER_SIZE);

          stream.acceptWaveform({ samples: chunk, sampleRate });

          while (recognizer.isReady(stream)) {
            recognizer.decode(stream);
          }
        }

        const result = recognizer.getResult(stream);

        if (result.text && result.text.trim()) {
          callback({
            text: result.text.trim(),
            isFinal: false,
          });
        }

        if (recognizer.isEndpoint(stream)) {
          const finalResult = recognizer.getResult(stream);
          if (finalResult.text && finalResult.text.trim()) {
            callback({
              text: finalResult.text.trim(),
              isFinal: true,
            });
          }
          recognizer.reset(stream);
        }
      } catch (err) {
        logError("STT feed error", err);
      }
    },

    stop() {
      running = false;
      recognizer = null;
      stream = null;
      callback = null;
      audioBuffer = new Float32Array(0);
      log("STT stopped");
    },

    isRunning() {
      return running;
    },
  };
}
