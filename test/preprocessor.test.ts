import { describe, it, expect } from "vitest";
import { preprocessText } from "../src/nlu/preprocessor";

describe("preprocessor", () => {
  it("lowercases text", () => {
    expect(preprocessText("HELLO WORLD")).toBe("hello world");
  });

  it("removes filler words", () => {
    expect(preprocessText("euh annule bah")).toBe("undo");
    expect(preprocessText("um undo like that")).toBe("undo that");
  });

  it("normalizes whitespace", () => {
    expect(preprocessText("  hello   world  ")).toBe("hello world");
  });

  it("converts French to English", () => {
    expect(preprocessText("sauvegarde")).toBe("save");
    expect(preprocessText("supprime la ligne")).toBe("delete the line");
    expect(preprocessText("copie")).toBe("copy");
  });

  it("handles mixed French/English", () => {
    expect(preprocessText("va a la ligne 15")).toBe("go to the line 15");
  });

  it("handles French nav commands", () => {
    expect(preprocessText("va au debut")).toBe("go to start");
    expect(preprocessText("va a la fin")).toBe("go to the end");
  });
});
