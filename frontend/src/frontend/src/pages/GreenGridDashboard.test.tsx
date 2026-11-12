import App from "@/App";
import { renderWithRouter } from "@/__tests__/router-utils";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DASHBOARD_NAV } from "@/data/greenGridData";
import ApiExplorerPage from "@/pages/ApiExplorerPage";
import CircularEconomyPage from "@/pages/CircularEconomyPage";
import DashboardPage from "@/pages/DashboardPage";
import DataSourcesPage from "@/pages/DataSourcesPage";
import EnergyMixPage from "@/pages/EnergyMixPage";
import EnvironmentalImpactPage from "@/pages/EnvironmentalImpactPage";
import ForecastingPage from "@/pages/ForecastingPage";
import GreenFinancePage from "@/pages/GreenFinancePage";
import GreenJobsPage from "@/pages/GreenJobsPage";
import RpoCompliancePage from "@/pages/RpoCompliancePage";
import SolarRoiPage from "@/pages/SolarRoiPage";
import StakeholderPortalPage from "@/pages/StakeholderPortalPage";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

/**
 * The D1–D9 module pages, the data-sources and API-explorer screens, each
 * mounted inside the persistent dashboard shell. Every page must render its
 * illustrative sample data with a visible "Sample data" label and offer at
 * least one working clickable interaction.
 */
const MODULE_PAGES: {
  name: string;
  path: string;
  element: React.ReactElement;
  /** A stable test id for a control that must be present and clickable. */
  interaction: string;
}[] = [
  {
    name: "Overview dashboard",
    path: "/dashboard",
    element: <DashboardPage />,
    interaction: "dashboard.state_filter",
  },
  {
    name: "D1 Energy Mix",
    path: "/energy-mix",
    element: <EnergyMixPage />,
    interaction: "energy_mix.state_select",
  },
  {
    name: "D2 RPO Compliance",
    path: "/rpo",
    element: <RpoCompliancePage />,
    interaction: "rpo.calculate_button",
  },
  {
    name: "D3 Solar ROI",
    path: "/solar-roi",
    element: <SolarRoiPage />,
    interaction: "solar.calculate_button",
  },
  {
    name: "D4 Green Jobs",
    path: "/green-jobs",
    element: <GreenJobsPage />,
    interaction: "jobs.search_input",
  },
  {
    name: "D5 Green Finance",
    path: "/green-finance",
    element: <GreenFinancePage />,
    interaction: "finance.match_button",
  },
  {
    name: "D6 Circular Economy",
    path: "/circularity",
    element: <CircularEconomyPage />,
    interaction: "circularity.search_input",
  },
  {
    name: "D7 Environmental Impact",
    path: "/environment",
    element: <EnvironmentalImpactPage />,
    interaction: "environment.air_metric.pm25",
  },
  {
    name: "D8 Energy Forecasting",
    path: "/forecasting",
    element: <ForecastingPage />,
    interaction: "forecast.recalculate_button",
  },
  {
    name: "D9 Stakeholder Portal",
    path: "/stakeholders",
    element: <StakeholderPortalPage />,
    interaction: "portal.role_tab.citizen",
  },
  {
    name: "Data Sources & Provenance",
    path: "/data-sources",
    element: <DataSourcesPage />,
    interaction: "data_sources.source_card.1.select_button",
  },
  {
    name: "API Explorer",
    path: "/energy/api",
    element: <ApiExplorerPage />,
    interaction: "api.request.run_button",
  },
];

function renderInShell(element: React.ReactElement, path: string) {
  return renderWithRouter(<DashboardLayout>{element}</DashboardLayout>, {
    path,
  });
}

describe("Green Grid dashboard shell", () => {
  it("renders the sidebar navigation, top bar and role selector", async () => {
    await renderInShell(<DashboardPage />, "/dashboard");

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("topbar.menu_button")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar.role_selector")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard.main")).toBeInTheDocument();
  });

  it("exposes a sidebar link for every module page in the nav model", async () => {
    await renderInShell(<DashboardPage />, "/dashboard");

    const nav = screen.getByRole("navigation", { name: "Dashboard" });
    for (const group of DASHBOARD_NAV) {
      for (const item of group.items) {
        const slug = item.label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        expect(
          within(nav).getByTestId(`sidebar.nav.${slug}`),
        ).toBeInTheDocument();
      }
    }
  });

  it("marks the active route in the sidebar navigation", async () => {
    await renderInShell(<EnergyMixPage />, "/energy-mix");

    expect(screen.getByTestId("sidebar.nav.energy-mix")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByTestId("sidebar.nav.rpo-compliance"),
    ).not.toHaveAttribute("aria-current", "page");
  });

  it("changes the visible portal content when the stakeholder role changes", async () => {
    const user = userEvent.setup();
    await renderInShell(<StakeholderPortalPage />, "/stakeholders");

    // Default role is the policymaker portal.
    expect(screen.getByTestId("portal.body.policymaker")).toBeInTheDocument();

    await user.click(screen.getByTestId("portal.role_tab.citizen"));

    expect(screen.getByTestId("portal.body.citizen")).toBeInTheDocument();
    expect(
      screen.queryByTestId("portal.body.policymaker"),
    ).not.toBeInTheDocument();
  });
});

describe("App route tree", () => {
  it("routes the D1 Energy Mix path to the new EnergyMixPage inside the dashboard shell", async () => {
    window.history.pushState({}, "", "/energy-mix");
    render(<App />);

    // The new D1 page body mounts, not the older EnergyPage.
    expect(await screen.findByTestId("energy_mix.page")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(
      screen.queryByTestId("energy.metric_card.current-demand"),
    ).toBeNull();
  });

  it("navigates to a module page when its sidebar link is clicked", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/dashboard");
    render(<App />);

    await user.click(await screen.findByTestId("sidebar.nav.energy-mix"));

    // The D1 Energy Mix page body replaces the overview dashboard body.
    expect(await screen.findByTestId("energy_mix.page")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard.main")).toBeInTheDocument();
  });
});

describe.each(MODULE_PAGES)(
  "$name module page",
  ({ path, element, interaction }) => {
    it("renders its illustrative sample data with a visible sample-data label", async () => {
      await renderInShell(element, path);

      expect(screen.getAllByTestId("sample.label").length).toBeGreaterThan(0);
    });

    it("offers at least one working clickable interaction", async () => {
      const user = userEvent.setup();
      await renderInShell(element, path);

      const control = screen.getByTestId(interaction);
      expect(control).toBeInTheDocument();
      // Clicking must not throw and the control stays mounted.
      await user.click(control);
      expect(screen.getByTestId(interaction)).toBeInTheDocument();
    });
  },
);
