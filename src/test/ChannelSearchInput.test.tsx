import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import ChannelSearchInput from "@/components/ChannelSearchInput";
import "@/i18n";

describe("ChannelSearchInput", () => {
  afterEach(cleanup);

  test("submits the trimmed query", async () => {
    const onSearch = vi.fn();
    render(<ChannelSearchInput searchQuery="" onSearch={onSearch} />);

    const input = screen.getByLabelText("Search this channel");
    await userEvent.type(input, "  zercher  {Enter}");

    expect(onSearch).toHaveBeenCalledWith("zercher");
  });

  test("seeds the input from the current query and can clear it", async () => {
    const onSearch = vi.fn();
    render(<ChannelSearchInput searchQuery="zercher" onSearch={onSearch} />);

    const input = screen.getByLabelText<HTMLInputElement>(
      "Search this channel",
    );
    expect(input.value).toBe("zercher");

    await userEvent.clear(input);
    await userEvent.type(input, "{Enter}");

    expect(onSearch).toHaveBeenCalledWith("");
  });
});
