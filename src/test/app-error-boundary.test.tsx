/* eslint-disable i18next/no-literal-string -- test fixtures, not UI copy */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import React from "react";
import i18n from "../i18n";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import {
  requestAppDataReset,
  runPendingAppDataReset,
} from "@/lib/reset-app-data";


const Boom: React.FC<{ throws: boolean }> = ({ throws }) => {
  if (throws) throw new Error("plugin database is unavailable");
  return <p>the app</p>;
};

// The boundary is above every provider in render-app.tsx; i18next is the only thing
// it reads, and that's a singleton rather than context.
const renderBoundary = (ui: React.ReactElement) =>
  render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

describe("AppErrorBoundary", () => {
  const reportError = vi.fn();

  // React logs every caught error, and componentDidCatch re-reports it on
  // purpose. Neither is what these tests are asserting on. `reportError` is
  // stubbed rather than spied because jsdom doesn't implement it — which is
  // also why the boundary calls it optionally.
  beforeEach(() => {
    reportError.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("reportError", reportError);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders the children when nothing throws", () => {
    renderBoundary(
      <AppErrorBoundary>
        <Boom throws={false} />
      </AppErrorBoundary>
    );

    expect(screen.getByText("the app")).toBeInTheDocument();
  });

  it("shows a recoverable fallback instead of unmounting the app", async () => {
    renderBoundary(
      <AppErrorBoundary>
        <Boom throws={true} />
      </AppErrorBoundary>
    );

    expect(screen.getByText("VideoGata couldn't start")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try again" })
    ).toBeInTheDocument();

    // The message is what makes a user's bug report actionable, so it has to
    // survive to the page rather than only reaching the console.
    await userEvent.click(screen.getByText("Details"));
    expect(
      screen.getByText("plugin database is unavailable")
    ).toBeInTheDocument();
  });

  it("re-raises the error so window-level exception capture still sees it", () => {
    renderBoundary(
      <AppErrorBoundary>
        <Boom throws={true} />
      </AppErrorBoundary>
    );

    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "plugin database is unavailable" })
    );
  });

  it("renders the children again after a retry that succeeds", async () => {
    // The state lives above the throwing child so retry has something to
    // recover to; a boundary reset alone would just re-throw.
    const Harness: React.FC = () => {
      const [broken, setBroken] = React.useState(true);
      return (
        <>
          <button onClick={() => setBroken(false)}>fix it</button>
          <AppErrorBoundary>
            {broken ? <Boom throws={true} /> : <Boom throws={false} />}
          </AppErrorBoundary>
        </>
      );
    };

    renderBoundary(<Harness />);
    expect(screen.getByText("VideoGata couldn't start")).toBeInTheDocument();

    await userEvent.click(screen.getByText("fix it"));
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("the app")).toBeInTheDocument();
  });
});

describe("app data reset", () => {
  const reload = vi.fn();

  beforeEach(() => {
    window.localStorage.clear();
    reload.mockClear();
    // jsdom's location.reload isn't writable, so it's replaced wholesale.
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, reload },
    });
  });

  it("does nothing at startup unless a reset was requested", async () => {
    window.localStorage.setItem("persist:root", "{}");

    await runPendingAppDataReset();

    expect(window.localStorage.getItem("persist:root")).toBe("{}");
  });

  it("defers the deletion to the next boot, because the databases are still open", () => {
    requestAppDataReset();

    expect(window.localStorage.getItem("videogata:reset-app-data")).toBe("1");
    // Deleting here would block on Dexie's live connection.
    expect(window.localStorage.getItem("persist:root")).toBeNull();
    expect(reload).toHaveBeenCalled();
  });

  it("clears persisted state and the app's databases on the next boot", async () => {
    const open = indexedDB.open("VideoDatabase", 1);
    await new Promise((resolve, reject) => {
      open.onsuccess = () => {
        // Closed to stand in for the reload: on a real boot nothing holds it.
        open.result.close();
        resolve(undefined);
      };
      open.onerror = reject;
    });
    window.localStorage.setItem("persist:root", "{}");
    window.localStorage.setItem("vite-ui-theme", "dark");

    requestAppDataReset();
    await runPendingAppDataReset();

    expect(window.localStorage.getItem("persist:root")).toBeNull();
    // The flag itself is cleared first, so a hung deletion can't loop the reset.
    expect(window.localStorage.getItem("videogata:reset-app-data")).toBeNull();
    // Untouched: a theme preference can't be what's stopping the app booting.
    expect(window.localStorage.getItem("vite-ui-theme")).toBe("dark");

    const remaining = await indexedDB.databases();
    expect(remaining.map((d) => d.name)).not.toContain("VideoDatabase");
  });
});
