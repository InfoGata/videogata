import { afterEach, describe, expect, it, vi } from "vitest";
import { doNotTrackEnabled, shouldCapture } from "@/lib/analytics";

afterEach(() => vi.unstubAllGlobals());

const withDnt = (value: string | null) =>
  vi.stubGlobal("navigator", { ...navigator, doNotTrack: value });

describe("analytics preference", () => {
  it("captures when the user allows it and the browser doesn't object", () => {
    // Independent of whether a key is configured: that is enforced by not
    // rendering a provider at all, so this stays true on a machine with no .env.
    expect(shouldCapture(true, false)).toBe(true);
  });

  it("doesn't capture when the user turned it off", () => {
    expect(shouldCapture(false, false)).toBe(false);
  });

  it("lets Do Not Track veto the setting", () => {
    expect(shouldCapture(true, true)).toBe(false);
  });

  it("never lets Do Not Track turn capturing on", () => {
    expect(shouldCapture(false, true)).toBe(false);
  });
});

describe("doNotTrackEnabled", () => {
  it("reads the browser's signal", () => {
    withDnt("1");
    expect(doNotTrackEnabled()).toBe(true);

    // Firefox and some others historically sent "yes" rather than "1".
    withDnt("yes");
    expect(doNotTrackEnabled()).toBe(true);
  });

  it("treats an explicit opt-in to tracking, or no signal, as no objection", () => {
    withDnt("0");
    expect(doNotTrackEnabled()).toBe(false);

    withDnt(null);
    expect(doNotTrackEnabled()).toBe(false);
  });
});
