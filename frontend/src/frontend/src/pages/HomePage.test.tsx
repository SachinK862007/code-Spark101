import { renderWithRouter } from "@/__tests__/router-utils";
import HomePage from "@/pages/HomePage";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Home / Ask Urja screen", () => {
  it("renders the hero headline, ask input and all six suggestion chips", async () => {
    await renderWithRouter(<HomePage />, { path: "/" });

    expect(
      screen.getByRole("heading", { name: "Namaskara, India" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("home.ask_input")).toBeInTheDocument();

    const prompts = [
      "Find a nearby public service office",
      "What government schemes can I access?",
      "Show Karnataka's renewable energy outlook",
      "What is the energy demand forecast?",
      "Find an electricity complaint helpline",
      "Explain rooftop solar benefits",
    ];
    for (const prompt of prompts) {
      expect(screen.getByRole("button", { name: prompt })).toBeInTheDocument();
    }
  });

  it("labels the illustrative figures as sample data", async () => {
    await renderWithRouter(<HomePage />, { path: "/" });
    expect(screen.getAllByTestId("sample.label").length).toBeGreaterThan(0);
  });
});
