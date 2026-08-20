import { Intent, NLUResult } from "./intents";

interface PatternRule {
  patterns: RegExp[];
  intent: Intent;
  confidence: number;
  extract?: (match: RegExpMatchArray) => Record<string, any>;
}

// IMPORTANT: Patterns are matched in order. Put specific patterns BEFORE generic ones.
// All patterns match against NORMALIZED text (English, lowercase, no fillers).
const RULES: PatternRule[] = [
  // ── Quick single-word commands (highest priority) ──
  { patterns: [/^undo$/i], intent: Intent.Undo, confidence: 0.99 },
  { patterns: [/^redo$/i], intent: Intent.Redo, confidence: 0.99 },
  { patterns: [/^copy$/i], intent: Intent.Copy, confidence: 0.97 },
  { patterns: [/^cut$/i], intent: Intent.Cut, confidence: 0.97 },
  { patterns: [/^paste$/i], intent: Intent.Paste, confidence: 0.97 },
  { patterns: [/^save$/i], intent: Intent.Save, confidence: 0.98 },
  { patterns: [/^close$/i], intent: Intent.CloseTab, confidence: 0.95 },
  { patterns: [/^indent$/i, /^tab$/i], intent: Intent.Indent, confidence: 0.95 },
  { patterns: [/^outdent$/i, /^unindent$/i, /^shift\s*tab$/i], intent: Intent.Outdent, confidence: 0.95 },
  { patterns: [/^format$/i], intent: Intent.FormatDocument, confidence: 0.95 },

  // ── Terminal / Run (BEFORE file open) ──
  {
    patterns: [
      /^(?:open|show)\s+(?:the\s+)?(?:terminal|console)$/i,
    ],
    intent: Intent.OpenTerminal,
    confidence: 0.96,
  },
  {
    patterns: [
      /^(?:run|execute|launch)\s+(?:the\s+)?(?:tests?|test)$/i,
    ],
    intent: Intent.RunCommand,
    confidence: 0.95,
    extract: () => ({ command: "test" }),
  },
  {
    patterns: [/^(?:compile|build)$/i],
    intent: Intent.RunCommand,
    confidence: 0.95,
    extract: () => ({ command: "build" }),
  },

  // ── File operations (BEFORE generic open) ──
  {
    patterns: [
      /^(?:new|create)\s+(?:file|document)$/i,
    ],
    intent: Intent.NewFile,
    confidence: 0.96,
  },
  {
    patterns: [/^(?:close)\s+(?:the\s+)?(?:tab|editor|file)$/i],
    intent: Intent.CloseTab,
    confidence: 0.95,
  },

  // ── Navigation ──
  {
    patterns: [
      /^(?:go\s+to\s+(?:the\s+)?line\s+)?(\d+)$/,
      /^(?:go\s+to\s+line\s+|jump\s+to\s+)?(\d+)$/,
      /^line\s+(\d+)$/i,
    ],
    intent: Intent.GoToLine,
    confidence: 0.98,
    extract: (m) => ({ line: parseInt(m[1]) }),
  },
  {
    patterns: [/^(?:go\s+to\s+)?(?:the\s+)?(?:start|top|beginning)$/i],
    intent: Intent.GoToStart,
    confidence: 0.97,
  },
  {
    patterns: [/^(?:go\s+to\s+)?(?:the\s+)?(?:end|bottom)$/i],
    intent: Intent.GoToEnd,
    confidence: 0.97,
  },
  {
    patterns: [/^(?:go\s+to\s+)?(?:start|beginning)\s+of\s+(?:the\s+)?(?:line)$/i],
    intent: Intent.GoToLineStart,
    confidence: 0.95,
  },
  {
    patterns: [/^(?:go\s+to\s+)?(?:end)\s+of\s+(?:the\s+)?(?:line)$/i],
    intent: Intent.GoToLineEnd,
    confidence: 0.95,
  },
  {
    patterns: [/^(?:go\s+)?up(?:\s+(\d+))?$/i],
    intent: Intent.MoveUp,
    confidence: 0.95,
    extract: (m) => ({ count: m[1] ? parseInt(m[1]) : 1 }),
  },
  {
    patterns: [/^(?:go\s+)?down(?:\s+(\d+))?$/i],
    intent: Intent.MoveDown,
    confidence: 0.95,
    extract: (m) => ({ count: m[1] ? parseInt(m[1]) : 1 }),
  },
  {
    patterns: [/^(?:go\s+)?left(?:\s+(\d+))?$/i],
    intent: Intent.MoveLeft,
    confidence: 0.95,
    extract: (m) => ({ count: m[1] ? parseInt(m[1]) : 1 }),
  },
  {
    patterns: [/^(?:go\s+)?right(?:\s+(\d+))?$/i],
    intent: Intent.MoveRight,
    confidence: 0.95,
    extract: (m) => ({ count: m[1] ? parseInt(m[1]) : 1 }),
  },

  // ── Go to symbol (BEFORE file) ──
  {
    patterns: [
      /^(?:go\s+to\s+)?(?:function|method|symbol)\s+(.+)$/i,
    ],
    intent: Intent.GoToSymbol,
    confidence: 0.90,
    extract: (m) => ({ symbol: m[1].trim() }),
  },

  // ── Go to file (AFTER terminal/symbol - generic "open X") ──
  {
    patterns: [
      /^(?:go\s+to\s+file|open)\s+(.+)$/i,
    ],
    intent: Intent.GoToFile,
    confidence: 0.90,
    extract: (m) => ({ file: m[1].trim() }),
  },

  // ── Editing ──
  {
    patterns: [/^undo(?:\s+that)?$/i],
    intent: Intent.Undo,
    confidence: 0.99,
  },
  {
    patterns: [/^redo(?:\s+that)?$/i],
    intent: Intent.Redo,
    confidence: 0.99,
  },
  {
    patterns: [
      /^(?:delete|remove)\s+(?:the\s+)?(?:line)\s*(\d+)?$/i,
    ],
    intent: Intent.DeleteLine,
    confidence: 0.96,
    extract: (m) => ({ line: m[1] ? parseInt(m[1]) : null }),
  },
  {
    patterns: [
      /^(?:delete|remove)\s+(?:the\s+)?(?:selection|that)$/i,
    ],
    intent: Intent.DeleteSelection,
    confidence: 0.95,
  },
  {
    patterns: [/^duplicate\s+(?:the\s+)?(?:line)$/i],
    intent: Intent.DuplicateLine,
    confidence: 0.97,
  },
  {
    patterns: [/^(?:select)\s+(?:the\s+)?(?:all|everything)$/i],
    intent: Intent.SelectAll,
    confidence: 0.98,
  },
  {
    patterns: [/^(?:select)\s+(?:the\s+)?(?:line)$/i],
    intent: Intent.SelectLine,
    confidence: 0.95,
  },
  {
    patterns: [/^(?:new\s+)?(?:line)\s+(?:below|under|after)$/i],
    intent: Intent.NewLineBelow,
    confidence: 0.95,
  },
  {
    patterns: [/^(?:new\s+)?(?:line)\s+(?:above|before)$/i],
    intent: Intent.NewLineAbove,
    confidence: 0.95,
  },

  // ── Search & Replace ──
  {
    patterns: [
      /^(?:replace)\s+(.+?)\s+(?:with|by)\s+(.+)$/i,
    ],
    intent: Intent.ReplaceText,
    confidence: 0.90,
    extract: (m) => ({ old: m[1].trim(), new: m[2].trim() }),
  },
  {
    patterns: [
      /^(?:find|search)\s+(.+)$/i,
    ],
    intent: Intent.FindInFile,
    confidence: 0.90,
    extract: (m) => ({ term: m[1].trim() }),
  },

  // ── Formatting (with optional target) ──
  {
    patterns: [
      /^(?:format)\s*(?:the\s+)?(?:document|file|selection)?$/i,
    ],
    intent: Intent.FormatDocument,
    confidence: 0.95,
  },
];

export function matchPatterns(text: string): NLUResult | null {
  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern);
      if (match) {
        const entities = rule.extract ? rule.extract(match) : {};
        return {
          intent: rule.intent,
          confidence: rule.confidence,
          entities,
          rawText: text,
        };
      }
    }
  }
  return null;
}
