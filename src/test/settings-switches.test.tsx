import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { I18nextProvider } from "react-i18next";
import React from "react";
import i18n from "../i18n";
import store from "@/store/store";
import DisableAutoUpdateSetting from "@/components/Settings/DisableAutoUpdateSetting";
import UseMiniPlayerSetting from "@/components/Settings/UseMiniPlayerSetting";

const renderSetting = (ui: React.ReactElement) =>
  render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>
    </Provider>
  );

// Both switches once passed `onChange` to a Radix Switch, which never calls it:
// the switch flipped on screen and nothing reached the store. Clicking and
// reading the store back is the only check that catches that.
describe("settings switches", () => {
  it("saves disabling plugin auto-update", async () => {
    renderSetting(<DisableAutoUpdateSetting />);
    const before = !!store.getState().settings.disableAutoUpdatePlugins;

    await userEvent.click(screen.getByRole("switch"));

    // And under the key PluginsContext reads, not a lookalike.
    expect(!!store.getState().settings.disableAutoUpdatePlugins).toBe(!before);
  });

  it("saves the mini player preference", async () => {
    renderSetting(<UseMiniPlayerSetting />);
    const before = !!store.getState().settings.useMiniPlayer;

    await userEvent.click(screen.getByRole("switch"));

    expect(!!store.getState().settings.useMiniPlayer).toBe(!before);
  });
});
