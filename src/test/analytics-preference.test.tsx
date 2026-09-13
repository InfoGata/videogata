import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import React from "react";

const optIn = vi.fn();
const optOut = vi.fn();

// The component's whole job is talking to this client, so it's the seam.
vi.mock("posthog-js/react", () => ({
  usePostHog: () => ({
    opt_in_capturing: optIn,
    opt_out_capturing: optOut,
  }),
}));

// Whether a key is configured is read from import.meta.env at build time, so it
// is pinned here; otherwise these pass on a machine with a .env and fail on CI.
const config = vi.hoisted(() => ({ analyticsConfigured: true }));
vi.mock("@/lib/analytics", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/analytics")>()),
  get analyticsConfigured() {
    return config.analyticsConfigured;
  },
}));

import AnalyticsPreference from "@/components/AnalyticsPreference";
import store from "@/store/store";
import { setDisableAnalytics } from "@/store/reducers/settingsReducer";

const setDnt = (value: string | null) =>
  vi.stubGlobal("navigator", { ...navigator, doNotTrack: value });

beforeEach(() => {
  optIn.mockClear();
  optOut.mockClear();
  setDnt(null);
});

afterEach(() => {
  config.analyticsConfigured = true;
  vi.unstubAllGlobals();
  store.dispatch(setDisableAnalytics(false));
});

const renderPreference = () =>
  render(
    <Provider store={store}>
      <AnalyticsPreference />
    </Provider>
  );

describe("AnalyticsPreference", () => {
  it("opts in when state persisted before the setting existed has no value", () => {
    // Existing installs rehydrate settings without the key; that has to read as
    // "on", not as a silent opt-out for everyone who upgraded.
    expect(store.getState().settings.disableAnalytics).toBeUndefined();
    renderPreference();

    expect(optIn).toHaveBeenCalled();
    expect(optOut).not.toHaveBeenCalled();
  });

  it("opts in without capturing an event for having done so", () => {
    store.dispatch(setDisableAnalytics(false));
    renderPreference();

    // The default behaviour captures an $opt_in event, which would be a capture
    // nobody asked for on every single load.
    expect(optIn).toHaveBeenCalledWith({ captureEventName: false });
  });

  it("opts out when the user turned it off", () => {
    store.dispatch(setDisableAnalytics(true));
    renderPreference();

    expect(optOut).toHaveBeenCalled();
    expect(optIn).not.toHaveBeenCalled();
  });

  it("opts out under Do Not Track even with the setting on", () => {
    setDnt("1");
    store.dispatch(setDisableAnalytics(false));
    renderPreference();

    expect(optOut).toHaveBeenCalled();
    expect(optIn).not.toHaveBeenCalled();
  });

  it("follows the preference when it changes", () => {
    store.dispatch(setDisableAnalytics(false));
    renderPreference();
    optIn.mockClear();

    React.act(() => {
      store.dispatch(setDisableAnalytics(true));
    });

    expect(optOut).toHaveBeenCalled();
  });

  it("leaves PostHog alone in a build with no key", () => {
    // usePostHog returns the uninitialized global instance without a provider,
    // so this can't rely on there being no client.
    config.analyticsConfigured = false;
    renderPreference();

    expect(optIn).not.toHaveBeenCalled();
    expect(optOut).not.toHaveBeenCalled();
  });
});
