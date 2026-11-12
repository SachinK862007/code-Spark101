import { renderWithRouter } from "@/__tests__/router-utils";
import ServiceDetailPage from "@/pages/ServiceDetailPage";
import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Public Service Detail screen", () => {
  it("renders the header, breadcrumb and two-column layout", async () => {
    await renderWithRouter(<ServiceDetailPage />, {
      path: "/services/rooftop-solar",
    });

    expect(screen.getByTestId("service.breadcrumb")).toBeInTheDocument();
    expect(screen.getByTestId("service.header")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Rooftop Solar Subsidy" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("service.important_panel")).toBeInTheDocument();
    expect(screen.getByTestId("service.section.overview")).toBeInTheDocument();
  });

  it("shows the official vs additional public comparison panels", async () => {
    await renderWithRouter(<ServiceDetailPage />, {
      path: "/services/rooftop-solar",
    });

    const comparison = screen.getByTestId("service.comparison");
    const official = within(comparison).getByTestId("service.official_panel");
    const publicPanel = within(comparison).getByTestId("service.public_panel");

    expect(
      within(official).getByText("Official information"),
    ).toBeInTheDocument();
    expect(
      within(publicPanel).getByText("Additional public information"),
    ).toBeInTheDocument();
    // Public notices, feedback and discrepancies live in the public panel.
    expect(
      within(publicPanel).getByTestId("service.notice.pn1"),
    ).toBeInTheDocument();
    expect(
      within(publicPanel).getByTestId("service.feedback.pf1"),
    ).toBeInTheDocument();
    expect(
      within(publicPanel).getByTestId("service.discrepancy.dc1"),
    ).toBeInTheDocument();
  });

  it("labels the illustrative content as sample data", async () => {
    await renderWithRouter(<ServiceDetailPage />, {
      path: "/services/rooftop-solar",
    });

    expect(screen.getAllByTestId("sample.label").length).toBeGreaterThan(0);
  });
});
