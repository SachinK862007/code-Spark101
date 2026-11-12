import { renderWithRouter } from "@/__tests__/router-utils";
import EnergyPage from "@/pages/EnergyPage";
import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Energy Intelligence Dashboard screen", () => {
  it("renders the four summary metric cards", async () => {
    await renderWithRouter(<EnergyPage />, { path: "/energy" });

    expect(
      screen.getByTestId("energy.metric_card.current-demand"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("energy.metric_card.renewable-generation"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("energy.metric_card.non-fossil-capacity"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("energy.metric_card.forecast-demand"),
    ).toBeInTheDocument();
  });

  it("renders the generation-mix donut and the demand line chart", async () => {
    await renderWithRouter(<EnergyPage />, { path: "/energy" });

    expect(
      screen.getByRole("heading", { name: "Generation mix" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Energy demand" }),
    ).toBeInTheDocument();
    // The demand chart draws both a historical and a forecast polyline.
    const demandChart = screen
      .getByRole("heading", { name: "Energy demand" })
      .closest("section") as HTMLElement;
    expect(demandChart.querySelectorAll("polyline").length).toBeGreaterThan(1);
  });

  it("renders the state comparison panel with state rows", async () => {
    await renderWithRouter(<EnergyPage />, { path: "/energy" });

    expect(
      screen.getByRole("heading", { name: "State comparison" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("energy.state_row.1")).toBeInTheDocument();
    expect(screen.getByTestId("energy.state_row.2")).toBeInTheDocument();
  });

  it("labels the illustrative figures as sample data", async () => {
    await renderWithRouter(<EnergyPage />, { path: "/energy" });

    expect(screen.getAllByTestId("sample.label").length).toBeGreaterThan(0);
  });
});
