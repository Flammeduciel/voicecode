import { describe, it, expect } from "vitest";
import { parseSpokenNumber } from "../src/nlu/numbers";

describe("parseSpokenNumber", () => {
  it("parses digit strings", () => {
    expect(parseSpokenNumber("42")).toBe(42);
    expect(parseSpokenNumber("0")).toBe(0);
  });

  it("parses French number words", () => {
    expect(parseSpokenNumber("quinze")).toBe(15);
    expect(parseSpokenNumber("trois")).toBe(3);
    expect(parseSpokenNumber("vingt")).toBe(20);
    expect(parseSpokenNumber("zero")).toBe(0);
    expect(parseSpokenNumber("Zéro")).toBe(0);
  });

  it("parses English number words", () => {
    expect(parseSpokenNumber("fifteen")).toBe(15);
    expect(parseSpokenNumber("three")).toBe(3);
    expect(parseSpokenNumber("twenty")).toBe(20);
    expect(parseSpokenNumber("zero")).toBe(0);
  });

  it("returns null for unknown words", () => {
    expect(parseSpokenNumber("hello")).toBeNull();
    expect(parseSpokenNumber("abc")).toBeNull();
  });
});
