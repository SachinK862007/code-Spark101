import { renderWithRouter } from "@/__tests__/router-utils";
import { Layout } from "@/components/layout/Layout";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

function renderLayout() {
  return renderWithRouter(
    <Layout>
      <p>Page body</p>
    </Layout>,
    { path: "/" },
  );
}

describe("Global navigation shell", () => {
  it("renders the header nav, footer columns and shared logo", async () => {
    await renderLayout();

    const primary = screen.getByRole("navigation", { name: "Primary" });
    for (const label of [
      "Ask",
      "Explore Map",
      "Public Services",
      "Energy",
      "About",
    ]) {
      expect(
        within(primary).getByRole("link", { name: label }),
      ).toBeInTheDocument();
    }

    expect(
      screen.getByRole("navigation", { name: "Platform" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "About" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Energy. Services. Answers.")).toBeInTheDocument();
  });

  it("opens the command palette from the search button and closes on Escape", async () => {
    const user = userEvent.setup();
    await renderLayout();

    expect(screen.queryByTestId("command_palette")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("command_palette_open"));

    const palette = screen.getByTestId("command_palette");
    expect(palette).toBeInTheDocument();
    // Grouped suggestions and keyboard hints are present.
    expect(within(palette).getByText("Public services")).toBeInTheDocument();
    expect(within(palette).getByText("Energy topics")).toBeInTheDocument();
    expect(within(palette).getByText("navigate")).toBeInTheDocument();
    expect(within(palette).getByText("select")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByTestId("command_palette")).not.toBeInTheDocument();
  });

  it("filters command-palette suggestions by query", async () => {
    const user = userEvent.setup();
    await renderLayout();

    await user.click(screen.getByTestId("command_palette_open"));
    await user.type(
      screen.getByTestId("command_palette.search_input"),
      "solar",
    );

    const palette = screen.getByTestId("command_palette");
    expect(
      within(palette).getByText("Rooftop Solar Subsidy"),
    ).toBeInTheDocument();
    expect(
      within(palette).queryByText("Voice Assistant"),
    ).not.toBeInTheDocument();
  });

  it("shows a no-matches message when the palette query matches nothing", async () => {
    const user = userEvent.setup();
    await renderLayout();

    await user.click(screen.getByTestId("command_palette_open"));
    await user.type(
      screen.getByTestId("command_palette.search_input"),
      "zzzz-no-match",
    );

    const palette = screen.getByTestId("command_palette");
    expect(within(palette).getByText(/No matches for/i)).toBeInTheDocument();
  });
});
