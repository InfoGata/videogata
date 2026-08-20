import { describe, expect, test } from "vitest";
import { isPortrait } from "@/lib/thumbnails";

describe("isPortrait", () => {
  test("spots vertical source art, as Shorts return", () => {
    expect(isPortrait([{ url: "a", width: 405, height: 608 }])).toBe(true);
  });

  test("leaves ordinary 16:9 art alone", () => {
    expect(isPortrait([{ url: "a", width: 360, height: 202 }])).toBe(false);
  });

  test("judges by the largest variant, not whichever came first", () => {
    // A tiny square avatar-ish entry shouldn't decide the shape of the card.
    expect(
      isPortrait([
        { url: "small", width: 60, height: 60 },
        { url: "large", width: 720, height: 404 },
      ])
    ).toBe(false);
  });

  test("assumes landscape when no variant declares its size", () => {
    expect(isPortrait([{ url: "a" }])).toBe(false);
    expect(isPortrait([])).toBe(false);
    expect(isPortrait(undefined)).toBe(false);
  });
});
