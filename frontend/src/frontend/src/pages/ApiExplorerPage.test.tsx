import { renderWithRouter } from "@/__tests__/router-utils";
import ApiExplorerPage from "@/pages/ApiExplorerPage";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("Urja Open Data API Explorer screen", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the endpoint overview cards and the explorer nav", async () => {
    await renderWithRouter(<ApiExplorerPage />, { path: "/energy/api" });

    expect(
      screen.getByTestId("api.overview.card.energy-mix"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("api.overview.card.rpo-calculate"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("api.overview.card.forecast"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("api.overview.card.stakeholders-role"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("api.explorer.nav_panel")).toBeInTheDocument();
  });

  it("renders the request builder with the region selector and the response preview", async () => {
    await renderWithRouter(<ApiExplorerPage />, { path: "/energy/api" });

    expect(screen.getByTestId("api.request.region_select")).toBeInTheDocument();
    expect(screen.getByTestId("api.request.run_button")).toBeInTheDocument();
    expect(screen.getByTestId("api.response.json_tab")).toBeInTheDocument();
    expect(screen.getByTestId("api.response.headers_tab")).toBeInTheDocument();
    // The JSON payload is rendered inside a <pre><code> block.
    expect(
      screen.getByTestId("api.response.json_tab").closest("div"),
    ).toBeTruthy();
  });

  it("switches the active endpoint when a nav item is selected", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<ApiExplorerPage />, { path: "/energy/api" });

    await user.click(screen.getByTestId("api.explorer.endpoint.forecast"));

    expect(
      screen.getByTestId("api.explorer.endpoint.forecast"),
    ).toHaveAttribute("aria-current", "true");
    expect(
      screen.getByTestId("api.explorer.endpoint.energy-mix"),
    ).not.toHaveAttribute("aria-current", "true");
  });

  it("shows the selected endpoint's own sample payload in the response preview", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<ApiExplorerPage />, { path: "/energy/api" });

    await user.click(screen.getByTestId("api.explorer.endpoint.jobs"));

    expect(screen.getByText(/Solar PV Installer/)).toBeInTheDocument();
  });

  it("marks the response as awaiting a test request until Test request is pressed", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<ApiExplorerPage />, { path: "/energy/api" });

    expect(screen.getByText("awaiting test request")).toBeInTheDocument();

    await user.click(screen.getByTestId("api.request.test_button"));

    expect(screen.getByText("142 ms · sample payload")).toBeInTheDocument();
  });

  it("collapses and expands the sample response payload", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<ApiExplorerPage />, { path: "/energy/api" });

    const expandButton = screen.getByTestId("api.response.expand_button");
    expect(expandButton).toHaveAttribute("aria-expanded", "true");

    await user.click(expandButton);

    expect(expandButton).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByText(
        /Response collapsed — expand to view the sample payload/,
      ),
    ).toBeInTheDocument();
  });

  it("renders the documentation tabs", async () => {
    await renderWithRouter(<ApiExplorerPage />, { path: "/energy/api" });

    const docs = screen.getByTestId("api.docs.tabs");
    expect(
      within(docs).getByTestId("api.docs.tab.overview"),
    ).toBeInTheDocument();
    expect(within(docs).getByTestId("api.docs.tab.auth")).toBeInTheDocument();
    expect(
      within(docs).getByTestId("api.docs.tab.endpoints"),
    ).toBeInTheDocument();
    expect(within(docs).getByTestId("api.docs.tab.errors")).toBeInTheDocument();
  });

  it("makes no network call when Run request is pressed", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    await renderWithRouter(<ApiExplorerPage />, { path: "/energy/api" });

    await user.click(screen.getByTestId("api.request.run_button"));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("labels the illustrative response as sample data", async () => {
    await renderWithRouter(<ApiExplorerPage />, { path: "/energy/api" });

    expect(screen.getAllByTestId("sample.label").length).toBeGreaterThan(0);
  });
});
