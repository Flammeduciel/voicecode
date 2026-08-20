import { NLUResult, Intent } from "./intents";
import { preprocessText } from "./preprocessor";
import { matchPatterns } from "./patterns";
import { fuzzyMatch } from "./fast-path";
import { detectDictation } from "./entities";
import { log } from "../utils/logger";

export interface NLUOrchestrator {
  classify(rawText: string): NLUResult;
}

export function createNLUOrchestrator(): NLUOrchestrator {
  return {
    classify(rawText: string): NLUResult {
      const punctuation = detectDictation(rawText);
      if (punctuation) {
        log(`NLU [punctuation]: "${rawText}" → ${punctuation.intent}`);
        return punctuation;
      }

      const normalized = preprocessText(rawText);
      log(`NLU input: "${rawText}" → normalized: "${normalized}"`);

      const patternResult = matchPatterns(normalized);
      if (patternResult) {
        log(`NLU [pattern]: "${normalized}" → ${patternResult.intent} (${patternResult.confidence})`);
        return patternResult;
      }

      const fuzzyResult = fuzzyMatch(normalized);
      if (fuzzyResult) {
        log(`NLU [fuzzy]: "${normalized}" → ${fuzzyResult.intent} (${fuzzyResult.confidence})`);
        return fuzzyResult;
      }

      log(`NLU [unknown]: "${normalized}"`);
      return {
        intent: Intent.Unknown,
        confidence: 0,
        entities: {},
        rawText,
      };
    },
  };
}
