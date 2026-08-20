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

const ACCENT_MAP: Record<string, string> = {
  à: "a", â: "a", ä: "a",
  é: "e", è: "e", ê: "e", ë: "e",
  î: "i", ï: "i",
  ô: "o", ö: "o",
  ù: "u", û: "u", ü: "u",
  ÿ: "y",
  ç: "c",
  æ: "ae", œ: "oe",
};

function stripAccents(s: string): string {
  return s.replace(/[àâäéèêëïîôùûüÿçœæ]/gi, (ch) => ACCENT_MAP[ch] ?? ch);
}

const SORTED_PHRASE_KEYS = Object.keys(PUNCTUATION_MAP).sort((a, b) => b.length - a.length);

const M = "\x01";
const NL = "\x02";
const TB = "\x03";

export function processDictationText(text: string): string {
  const normalized = stripAccents(text.toLowerCase().trim());

  let out = normalized;

  for (const phrase of SORTED_PHRASE_KEYS) {
    if (phrase.includes(" ")) {
      const punct = PUNCTUATION_MAP[phrase];
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const marker = punct === "\n" ? NL : punct === "\t" ? TB : `${M}${punct}${M}`;
      out = out.replace(new RegExp(escaped, "gi"), marker);
    }
  }

  const words = out.split(/\s+/);
  const result: string[] = [];

  for (const word of words) {
    if (word === NL || word === TB || (word.startsWith(M) && word.endsWith(M))) {
      result.push(word);
    } else {
      const punct = PUNCTUATION_MAP[word];
      if (punct !== undefined) {
        const marker = punct === "\n" ? NL : punct === "\t" ? TB : `${M}${punct}${M}`;
        result.push(marker);
      } else {
        result.push(word);
      }
    }
  }

  out = result.join(" ");

  out = out.replace(new RegExp(`\\s*${NL}\\s*`, "g"), NL);
  out = out.replace(new RegExp(`\\s*${TB}\\s*`, "g"), TB);
  out = out.replace(new RegExp(`\\s*${M}([^${M}]+)${M}`, "g"), "$1");

  out = out.replace(/ {2,}/g, " ").trim();

  out = out.split(NL).join("\n");
  out = out.split(TB).join("\t");

  out = out.replace(/([(\[{])\s+/g, "$1");
  out = out.replace(/\s+([)\]}])/g, "$1");

  return out;
}
