import { describe, it, expect } from "vitest";
import { createNLUOrchestrator } from "../src/nlu/orchestrator";
import { Intent } from "../src/nlu/intents";

const nlu = createNLUOrchestrator();

describe("NLU Orchestrator", () => {
  describe("navigation", () => {
    it("go to line 15", () => {
      const result = nlu.classify("va à la ligne 15");
      expect(result.intent).toBe(Intent.GoToLine);
      expect(result.entities.line).toBe(15);
    });

    it("go to start", () => {
      expect(nlu.classify("va au début").intent).toBe(Intent.GoToStart);
      expect(nlu.classify("go to start").intent).toBe(Intent.GoToStart);
    });

    it("go to end", () => {
      expect(nlu.classify("va à la fin").intent).toBe(Intent.GoToEnd);
      expect(nlu.classify("go to end").intent).toBe(Intent.GoToEnd);
    });

    it("move up", () => {
      expect(nlu.classify("monte").intent).toBe(Intent.MoveUp);
      expect(nlu.classify("go up").intent).toBe(Intent.MoveUp);
    });

    it("move down", () => {
      expect(nlu.classify("descend").intent).toBe(Intent.MoveDown);
      expect(nlu.classify("go down").intent).toBe(Intent.MoveDown);
    });
  });

  describe("editing", () => {
    it("undo", () => {
      expect(nlu.classify("annule").intent).toBe(Intent.Undo);
      expect(nlu.classify("undo").intent).toBe(Intent.Undo);
    });

    it("redo", () => {
      expect(nlu.classify("refais").intent).toBe(Intent.Redo);
      expect(nlu.classify("redo").intent).toBe(Intent.Redo);
    });

    it("delete line", () => {
      const result = nlu.classify("supprime la ligne 15");
      expect(result.intent).toBe(Intent.DeleteLine);
      expect(result.entities.line).toBe(15);
    });

    it("delete current line", () => {
      expect(nlu.classify("supprime la ligne").intent).toBe(Intent.DeleteLine);
    });

    it("copy", () => {
      expect(nlu.classify("copie").intent).toBe(Intent.Copy);
      expect(nlu.classify("copy").intent).toBe(Intent.Copy);
    });

    it("paste", () => {
      expect(nlu.classify("colle").intent).toBe(Intent.Paste);
      expect(nlu.classify("paste").intent).toBe(Intent.Paste);
    });

    it("cut", () => {
      expect(nlu.classify("coupe").intent).toBe(Intent.Cut);
      expect(nlu.classify("cut").intent).toBe(Intent.Cut);
    });

    it("select all", () => {
      expect(nlu.classify("sélectionne tout").intent).toBe(Intent.SelectAll);
      expect(nlu.classify("select all").intent).toBe(Intent.SelectAll);
    });

    it("duplicate line", () => {
      expect(nlu.classify("duplique la ligne").intent).toBe(Intent.DuplicateLine);
      expect(nlu.classify("duplicate line").intent).toBe(Intent.DuplicateLine);
    });
  });

  describe("files & terminal", () => {
    it("save", () => {
      expect(nlu.classify("sauvegarde").intent).toBe(Intent.Save);
      expect(nlu.classify("save").intent).toBe(Intent.Save);
    });

    it("new file", () => {
      expect(nlu.classify("nouveau fichier").intent).toBe(Intent.NewFile);
      expect(nlu.classify("new file").intent).toBe(Intent.NewFile);
    });

    it("open terminal", () => {
      expect(nlu.classify("ouvre le terminal").intent).toBe(Intent.OpenTerminal);
      expect(nlu.classify("open terminal").intent).toBe(Intent.OpenTerminal);
    });

    it("run tests", () => {
      expect(nlu.classify("lance les tests").intent).toBe(Intent.RunCommand);
      expect(nlu.classify("run tests").intent).toBe(Intent.RunCommand);
    });
  });

  describe("search & replace", () => {
    it("replace text", () => {
      const result = nlu.classify("remplace foo par bar");
      expect(result.intent).toBe(Intent.ReplaceText);
      expect(result.entities.old).toBe("foo");
      expect(result.entities.new).toBe("bar");
    });

    it("find in file", () => {
      const result = nlu.classify("cherche HelloWorld");
      expect(result.intent).toBe(Intent.FindInFile);
      expect(result.entities.term).toBe("helloworld");
    });
  });

  describe("punctuation", () => {
    it("period", () => {
      const result = nlu.classify("point");
      expect(result.intent).toBe(Intent.InsertText);
      expect(result.entities.text).toBe(".");
    });

    it("semicolon", () => {
      const result = nlu.classify("point virgule");
      expect(result.intent).toBe(Intent.InsertText);
      expect(result.entities.text).toBe(";");
    });
  });

  describe("unknown", () => {
    it("returns unknown for unrecognized text", () => {
      expect(nlu.classify("random gibberish xyz").intent).toBe(Intent.Unknown);
    });
  });
});
