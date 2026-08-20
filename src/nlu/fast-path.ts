import { NLUResult, Intent } from "./intents";
import { levenshtein } from "../utils/levenshtein";

interface FuzzyCandidate {
  phrase: string;
  intent: Intent;
  confidence: number;
  entities?: Record<string, any>;
  extract?: (words: string[]) => Record<string, any>;
}

const FUZZY_COMMANDS: FuzzyCandidate[] = [
  { phrase: "annule", intent: Intent.Undo, confidence: 0.85 },
  { phrase: "refais", intent: Intent.Redo, confidence: 0.85 },
  { phrase: "sauvegarde", intent: Intent.Save, confidence: 0.85 },
  { phrase: "copie", intent: Intent.Copy, confidence: 0.85 },
  { phrase: "colle", intent: Intent.Paste, confidence: 0.85 },
  { phrase: "coupe", intent: Intent.Cut, confidence: 0.85 },
  { phrase: "supprime ligne", intent: Intent.DeleteLine, confidence: 0.80 },
  { phrase: "duplique ligne", intent: Intent.DuplicateLine, confidence: 0.80 },
  { phrase: "selectionne tout", intent: Intent.SelectAll, confidence: 0.80 },
  { phrase: "selectionne ligne", intent: Intent.SelectLine, confidence: 0.80 },
  { phrase: "indente", intent: Intent.Indent, confidence: 0.85 },
  { phrase: "nouvelle ligne en dessous", intent: Intent.NewLineBelow, confidence: 0.75 },
  { phrase: "nouvelle ligne au dessus", intent: Intent.NewLineAbove, confidence: 0.75 },
  { phrase: "ferme l'onglet", intent: Intent.CloseTab, confidence: 0.80 },
  { phrase: "nouveau fichier", intent: Intent.NewFile, confidence: 0.80 },
  { phrase: "ouvre le terminal", intent: Intent.OpenTerminal, confidence: 0.80 },
  { phrase: "lance les tests", intent: Intent.RunCommand, confidence: 0.80, extract: () => ({ command: "test" }) },
  { phrase: "compile", intent: Intent.RunCommand, confidence: 0.85, extract: () => ({ command: "build" }) },
  { phrase: "formate", intent: Intent.FormatDocument, confidence: 0.85 },
  { phrase: "va au debut", intent: Intent.GoToStart, confidence: 0.80 },
  { phrase: "va a la fin", intent: Intent.GoToEnd, confidence: 0.80 },
  { phrase: "monte", intent: Intent.MoveUp, confidence: 0.85 },
  { phrase: "descend", intent: Intent.MoveDown, confidence: 0.85 },
  { phrase: "gauche", intent: Intent.MoveLeft, confidence: 0.85 },
  { phrase: "droite", intent: Intent.MoveRight, confidence: 0.85 },

  // English fuzzy
  { phrase: "undo", intent: Intent.Undo, confidence: 0.85 },
  { phrase: "redo", intent: Intent.Redo, confidence: 0.85 },
  { phrase: "save", intent: Intent.Save, confidence: 0.85 },
  { phrase: "copy", intent: Intent.Copy, confidence: 0.85 },
  { phrase: "paste", intent: Intent.Paste, confidence: 0.85 },
  { phrase: "cut", intent: Intent.Cut, confidence: 0.85 },
  { phrase: "delete line", intent: Intent.DeleteLine, confidence: 0.80 },
  { phrase: "duplicate line", intent: Intent.DuplicateLine, confidence: 0.80 },
  { phrase: "select all", intent: Intent.SelectAll, confidence: 0.80 },
  { phrase: "select line", intent: Intent.SelectLine, confidence: 0.80 },
  { phrase: "indent", intent: Intent.Indent, confidence: 0.85 },
  { phrase: "new line below", intent: Intent.NewLineBelow, confidence: 0.80 },
  { phrase: "new line above", intent: Intent.NewLineAbove, confidence: 0.80 },
  { phrase: "close tab", intent: Intent.CloseTab, confidence: 0.80 },
  { phrase: "new file", intent: Intent.NewFile, confidence: 0.80 },
  { phrase: "open terminal", intent: Intent.OpenTerminal, confidence: 0.80 },
  { phrase: "run tests", intent: Intent.RunCommand, confidence: 0.80, extract: () => ({ command: "test" }) },
  { phrase: "build", intent: Intent.RunCommand, confidence: 0.85, extract: () => ({ command: "build" }) },
  { phrase: "format", intent: Intent.FormatDocument, confidence: 0.85 },
  { phrase: "go to start", intent: Intent.GoToStart, confidence: 0.80 },
  { phrase: "go to end", intent: Intent.GoToEnd, confidence: 0.80 },
  { phrase: "go up", intent: Intent.MoveUp, confidence: 0.85 },
  { phrase: "go down", intent: Intent.MoveDown, confidence: 0.85 },
  { phrase: "go left", intent: Intent.MoveLeft, confidence: 0.85 },
  { phrase: "go right", intent: Intent.MoveRight, confidence: 0.85 },
];

const MAX_EDIT_DISTANCE = 2;

export function fuzzyMatch(text: string): NLUResult | null {
  let bestMatch: { result: NLUResult; distance: number } | null = null;

  for (const cmd of FUZZY_COMMANDS) {
    const distance = levenshtein(text, cmd.phrase);
    if (distance <= MAX_EDIT_DISTANCE) {
      if (!bestMatch || distance < bestMatch.distance) {
        const entities = cmd.extract ? cmd.extract(text.split(" ")) : {};
        bestMatch = {
          result: {
            intent: cmd.intent,
            confidence: cmd.confidence,
            entities,
            rawText: text,
          },
          distance,
        };
      }
    }
  }

  return bestMatch?.result ?? null;
}
