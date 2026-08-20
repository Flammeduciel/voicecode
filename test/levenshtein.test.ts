import { describe, it, expect } from "vitest";
import { levenshtein } from "../src/utils/levenshtein";

describe("levenshtein", () => {
  it("returns 0 for identical strings", () => {
    expect(levenshtein("hello", "hello")).toBe(0);
  });

  it("returns length for empty vs string", () => {
    expect(levenshtein("", "abc")).toBe(3);
  });

  it("computes single char distance", () => {
    expect(levenshtein("cat", "bat")).toBe(1);
    expect(levenshtein("cat", "cats")).toBe(1);
  });

  it("computes multi char distance", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
  });
});
