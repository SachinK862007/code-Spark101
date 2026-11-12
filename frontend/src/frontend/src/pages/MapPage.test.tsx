import { renderWithRouter } from "@/__tests__/router-utils";
import MapPage from "@/pages/MapPage";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

describe("Explore Map screen", () => {
  it("renders the static map canvas, category filters and a floating detail card", async () => {
    await renderWithRouter(<MapPage />, { path: "/map" });

    expect(screen.getByTestId("map.canvas")).toBeInTheDocument();
    expect(screen.getByTestId("map.filter.government")).toBeInTheDocument();
    expect(screen.getByTestId("map.filter.renewable")).toBeInTheDocument();
    // A location is selected by default, so the detail card is visible.
    expect(screen.getAllByTestId("map.detail_card").length).toBeGreaterThan(0);
  });

  it("shows the selected location detail when a marker is chosen", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<MapPage />, { path: "/map" });

    await user.click(screen.getByTestId("map.marker.loc-2"));

    const card = screen.getAllByTestId("map.detail_card")[0];
    expect(within(card).getByText("Bhadla Solar Park")).toBeInTheDocument();
    expect(
      within(card).getByText("Bhadla, Jodhpur District"),
    ).toBeInTheDocument();
  });

  it("filters markers by category chip", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<MapPage />, { path: "/map" });

    // Toggle off the renewable layer; its markers should disappear.
    await user.click(screen.getByTestId("map.filter.renewable"));

    expect(screen.queryByTestId("map.marker.loc-2")).not.toBeInTheDocument();
    expect(screen.getByTestId("map.marker.loc-1")).toBeInTheDocument();
  });
});
