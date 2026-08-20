export interface AudioProcessorOptions {
  targetSampleRate?: number;
  targetChannels?: number;
}

export interface AudioProcessor {
  processChunk(samples: Float32Array, inputSampleRate: number): Float32Array;
}

export function createAudioProcessor(options: AudioProcessorOptions = {}): AudioProcessor {
  const targetSampleRate = options.targetSampleRate ?? 16000;

  return {
    processChunk(samples: Float32Array, inputSampleRate: number): Float32Array {
      if (inputSampleRate === targetSampleRate) {
        return samples;
      }
      return resample(samples, inputSampleRate, targetSampleRate);
    },
  };
}

function resample(
  input: Float32Array,
  fromRate: number,
  toRate: number
): Float32Array {
  const ratio = fromRate / toRate;
  const outputLength = Math.round(input.length / ratio);
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const srcIdx = i * ratio;
    const idx = Math.floor(srcIdx);
    const frac = srcIdx - idx;

    if (idx + 1 < input.length) {
      output[i] = input[idx] * (1 - frac) + input[idx + 1] * frac;
    } else {
      output[i] = input[idx] || 0;
    }
  }

  return output;
}
