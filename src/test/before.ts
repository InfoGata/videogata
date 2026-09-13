import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Vitest globals are off, so testing-library never registers its own automatic
// cleanup. Without this a file's last render stays mounted past the end of the
// file, and React's scheduled work can then run against a torn-down JSDOM.
// Registered here rather than per file so a new test can't forget it.
afterEach(cleanup);

// JSDOM has no layout, so it implements none of the scroll methods. TanStack
// Router calls scrollTo on navigation, and each unimplemented call is reported
// as an error rather than ignored.
window.scrollTo = vi.fn();

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock window.alert to prevent jsdom "Not implemented" errors
Object.defineProperty(window, "alert", {
  writable: true,
  value: () => {},
});
