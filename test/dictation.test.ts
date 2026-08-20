import { describe, it, expect } from "vitest";
import { processDictationText } from "../src/nlu/entities";
import { createNLUOrchestrator } from "../src/nlu/orchestrator";
import { Intent } from "../src/nlu/intents";

describe("processDictationText", () => {
  it("replaces single-word punctuation", () => {
    expect(processDictationText("hello point")).toBe("hello.");
    expect(processDictationText("salut virgule")).toBe("salut,");
  });

  it("replaces multi-word punctuation phrases", () => {
    expect(processDictationText("console.log parenthèse ouvrante hello parenthèse fermante"))
      .toBe("console.log(hello)");
  });

  it("handles accented characters", () => {
    expect(processDictationText("console.log parenthèse ouvrante world parenthèse fermante"))
      .toBe("console.log(world)");
    expect(processDictationText("test accolade ouvrante code accolade fermante"))
      .toBe("test{code}");
  });

  it("handles English punctuation", () => {
    expect(processDictationText("console.log open paren hello close paren"))
      .toBe("console.log(hello)");
    expect(processDictationText("test open brace code close brace"))
      .toBe("test{code}");
  });

  it("handles mixed text and punctuation", () => {
    expect(processDictationText("let x equals five semicolon"))
      .toBe("let x equals five;");
  });

  it("normalizes spaces around punctuation", () => {
    expect(processDictationText("foo parenthèse ouvrante bar parenthèse fermante"))
      .toBe("foo(bar)");
    expect(processDictationText("foo accolade ouvrante bar accolade fermante"))
      .toBe("foo{bar}");
  });

  it("passes through plain text unchanged", () => {
    expect(processDictationText("hello world")).toBe("hello world");
    expect(processDictationText("console.log('test')")).toBe("console.log('test')");
  });

  it("handles new line", () => {
    expect(processDictationText("ligne1 nouvelle ligne ligne2"))
      .toBe("ligne1\nligne2");
  });
});

describe("Dictation toggle via NLU", () => {
  const nlu = createNLUOrchestrator();

  it("recognizes 'dicte' as DictateToggle", () => {
    expect(nlu.classify("dicte").intent).toBe(Intent.DictateToggle);
  });

  it("recognizes 'dictate' as DictateToggle", () => {
    expect(nlu.classify("dictate").intent).toBe(Intent.DictateToggle);
  });

  it("recognizes 'mode dictee' as DictateToggle", () => {
    expect(nlu.classify("mode dictee").intent).toBe(Intent.DictateToggle);
  });

  it("recognizes 'dictation mode' as DictateToggle", () => {
    expect(nlu.classify("dictation mode").intent).toBe(Intent.DictateToggle);
  });
});
