import { renderWithRouter } from "@/__tests__/router-utils";
import ServicesPage from "@/pages/ServicesPage";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

describe("Public Services Directory screen", () => {
  it("renders category cards, statistic panels and the listing table", async () => {
    await renderWithRouter(<ServicesPage />, { path: "/services" });

    expect(screen.getByTestId("services.categories")).toBeInTheDocument();
    expect(
      screen.getByTestId("services.category_card.municipal"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("services.stats")).toBeInTheDocument();
    expect(screen.getByTestId("services.stat.categories")).toBeInTheDocument();
    expect(screen.getByTestId("services.directory")).toBeInTheDocument();
    // Desktop table rows and mobile stacked cards both render.
    expect(screen.getByTestId("services.row.1")).toBeInTheDocument();
    expect(screen.getByTestId("services.card.1")).toBeInTheDocument();
  });

  it("filters the directory by search query", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<ServicesPage />, { path: "/services" });

    await user.type(screen.getByTestId("services.search_input"), "solar");

    const table = screen.getByTestId("services.directory");
    expect(
      within(table).getAllByText("Rooftop Solar Subsidy").length,
    ).toBeGreaterThan(0);
    expect(
      within(table).queryByText("District Hospital Services"),
    ).not.toBeInTheDocument();
  });

  it("sorts the listing when a sortable column header is used", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<ServicesPage />, { path: "/services" });

    // Default sort is by name ascending; the first row is the alphabetically
    // first service.
    expect(
      within(screen.getByTestId("services.row.1")).getByText(
        "Ayushman Bharat Health Cover",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("services.sort.name"));

    // Toggling the active column flips to descending.
    expect(
      within(screen.getByTestId("services.row.1")).getByText(
        "Rooftop Solar Subsidy",
      ),
    ).toBeInTheDocument();
  });

  it("shows an empty state when no service matches the filters", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<ServicesPage />, { path: "/services" });

    await user.type(
      screen.getByTestId("services.search_input"),
      "zzzz-no-match",
    );

    expect(screen.getByTestId("empty_state")).toBeInTheDocument();
  });

  it("filters the directory when a category card is selected", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<ServicesPage />, { path: "/services" });

    await user.click(screen.getByTestId("services.category_card.healthcare"));

    const table = screen.getByTestId("services.directory");
    expect(
      within(table).getAllByText("District Hospital Services").length,
    ).toBeGreaterThan(0);
    expect(
      within(table).queryByText("Rooftop Solar Subsidy"),
    ).not.toBeInTheDocument();
  });

  it("pages through the directory and disables the boundary controls", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<ServicesPage />, { path: "/services" });

    // The first page shows the alphabetically first service.
    expect(
      within(screen.getByTestId("services.row.1")).getByText(
        "Ayushman Bharat Health Cover",
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId("services.pagination_prev")).toBeDisabled();

    await user.click(screen.getByTestId("services.pagination_next"));

    // The second page starts after the first six rows.
    expect(
      within(screen.getByTestId("services.row.1")).getByText(
        "Municipal Water Connection",
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId("services.pagination_prev")).toBeEnabled();
  });
});
