import { NLUResult, Intent } from "./intents";
import { parseSpokenNumber } from "./numbers";

const PUNCTUATION_MAP: Record<string, string> = {
  // French
  point: ".",
  virgule: ",",
  "point virgule": ";",
  "deux points": ":",
  "point d'interrogation": "?",
  "point d'exclamation": "!",
  "parenthese ouvrante": "(",
  "parenthese fermante": ")",
  "accolade ouvrante": "{",
  "accolade fermante": "}",
  "crochet ouvrant": "[",
  "crochet fermant": "]",
  "guillemet": '"',
  "nouvelle ligne": "\n",
  espace: " ",
  tabulation: "\t",
  // English
  period: ".",
  comma: ",",
  semicolon: ";",
  colon: ":",
  "question mark": "?",
  "exclamation mark": "!",
  "open paren": "(",
  "close paren": ")",
  "open brace": "{",
  "close brace": "}",
  "open bracket": "[",
  "close bracket": "]",
  quote: '"',
  "new line": "\n",
  space: " ",
  tab: "\t",
};

export function extractEntities(text: string, intent: Intent): Record<string, any> {
  const entities: Record<string, any> = {};

  const lineMatch = text.match(/(?:ligne|line)\s*(\d+)/i);
  if (lineMatch) {
    entities.line = parseInt(lineMatch[1]);
  }

  const fileMatch = text.match(/(?:fichier|file)\s+(.+?)$/i);
  if (fileMatch) {
    entities.file = fileMatch[1].trim();
  }

  const symbolMatch = text.match(/(?:fonction|function|methode|method|symbole|symbol)\s+(.+?)$/i);
  if (symbolMatch) {
    entities.symbol = symbolMatch[1].trim();
  }

  const replaceMatch = text.match(/(?:remplace|replace)\s+(.+?)\s+(?:par|with|by)\s+(.+?)$/i);
  if (replaceMatch) {
    entities.old = replaceMatch[1].trim();
    entities.new = replaceMatch[2].trim();
  }

  const findMatch = text.match(/(?:cherche|find|search|recherche)\s+(.+?)$/i);
  if (findMatch) {
    entities.term = findMatch[1].trim();
  }

  return entities;
}

export function isPunctuationCommand(text: string): string | null {
  const lower = text.toLowerCase().trim();
  return PUNCTUATION_MAP[lower] ?? null;
}

export function detectDictation(text: string): NLUResult | null {
  const punctuation = isPunctuationCommand(text);
  if (punctuation) {
    return {
      intent: Intent.InsertText,
      confidence: 0.95,
      entities: { text: punctuation },
      rawText: text,
    };
  }

  return null;
}
