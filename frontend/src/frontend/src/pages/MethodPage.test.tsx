import { renderWithRouter } from "@/__tests__/router-utils";
import MethodPage from "@/pages/MethodPage";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Method / About Urja screen", () => {
  it("renders the editorial header and the method sections", async () => {
    await renderWithRouter(<MethodPage />, { path: "/about" });

    expect(screen.getByTestId("method.page")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Understand the information behind every answer.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("method.section.how-it-works"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("method.section.data-sources"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("method.section.forecasting"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("method.section.transparency"),
    ).toBeInTheDocument();
  });

  it("renders the pipeline diagram and the transparency cards", async () => {
    await renderWithRouter(<MethodPage />, { path: "/about" });

    expect(screen.getByTestId("method.pipeline")).toBeInTheDocument();
    expect(screen.getByTestId("method.transparency")).toBeInTheDocument();
    expect(
      screen.getByTestId("method.transparency_card.official"),
    ).toBeInTheDocument();
  });

  it("labels the illustrative content as sample data", async () => {
    await renderWithRouter(<MethodPage />, { path: "/about" });

    expect(screen.getAllByTestId("sample.label").length).toBeGreaterThan(0);
  });
});
