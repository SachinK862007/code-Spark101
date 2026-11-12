import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Layout } from "@/components/layout/Layout";
import ApiExplorerPage from "@/pages/ApiExplorerPage";
import CircularEconomyPage from "@/pages/CircularEconomyPage";
import ConversationPage from "@/pages/ConversationPage";
import DashboardPage from "@/pages/DashboardPage";
import DataSourcesPage from "@/pages/DataSourcesPage";
import EnergyCalculationsPage from "@/pages/EnergyCalculationsPage";
import EnergyMixPage from "@/pages/EnergyMixPage";
import EnergyPage from "@/pages/EnergyPage";
import EnvironmentalImpactPage from "@/pages/EnvironmentalImpactPage";
import ForecastingPage from "@/pages/ForecastingPage";
import GreenFinancePage from "@/pages/GreenFinancePage";
import GreenJobsPage from "@/pages/GreenJobsPage";
import HomePage from "@/pages/HomePage";
import MapPage from "@/pages/MapPage";
import MethodPage from "@/pages/MethodPage";
import RpoCompliancePage from "@/pages/RpoCompliancePage";
import ServiceDetailPage from "@/pages/ServiceDetailPage";
import ServicesPage from "@/pages/ServicesPage";
import SettingsPage from "@/pages/SettingsPage";
import SolarRoiPage from "@/pages/SolarRoiPage";
import StakeholderPortalPage from "@/pages/StakeholderPortalPage";
import VoicePage from "@/pages/VoicePage";
import WeatherPage from "@/pages/WeatherPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouterState,
} from "@tanstack/react-router";

/**
 * Dashboard routes render inside the persistent sidebar shell; the public
 * marketing routes keep the top-header shell.
 */
const DASHBOARD_PREFIXES = [
  "/dashboard",
  "/energy-mix",
  "/rpo",
  "/solar-roi",
  "/forecasting",
  "/green-jobs",
  "/green-finance",
  "/circularity",
  "/environment",
  "/stakeholders",
  "/data-sources",
  "/settings",
];

function isDashboardPath(pathname: string) {
  return DASHBOARD_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function RootShell() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const Shell = isDashboardPath(pathname) ? DashboardLayout : Layout;
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}

const rootRoute = createRootRoute({
  component: RootShell,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const askRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ask",
  component: ConversationPage,
});

const voiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/voice",
  component: VoicePage,
});

const weatherRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/weather",
  component: WeatherPage,
});

const energyCalculationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/energy-calculations",
  component: EnergyCalculationsPage,
});

const mapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/map",
  component: MapPage,
});

const servicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/services",
  component: ServicesPage,
});

const serviceDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/services/$id",
  component: ServiceDetailPage,
});

const energyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/energy",
  component: EnergyPage,
});

const energyMixRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/energy-mix",
  component: EnergyMixPage,
});

const apiExplorerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/energy/api",
  component: ApiExplorerPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: MethodPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const rpoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/rpo",
  component: RpoCompliancePage,
});

const solarRoiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/solar-roi",
  component: SolarRoiPage,
});

const forecastingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forecasting",
  component: ForecastingPage,
});

const greenJobsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/green-jobs",
  component: GreenJobsPage,
});

const greenFinanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/green-finance",
  component: GreenFinancePage,
});

const circularityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/circularity",
  component: CircularEconomyPage,
});

const environmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/environment",
  component: EnvironmentalImpactPage,
});

const stakeholdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/stakeholders",
  component: StakeholderPortalPage,
});

const dataSourcesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/data-sources",
  component: DataSourcesPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  askRoute,
  voiceRoute,
  weatherRoute,
  energyCalculationsRoute,
  mapRoute,
  servicesRoute,
  serviceDetailRoute,
  energyRoute,
  energyMixRoute,
  apiExplorerRoute,
  aboutRoute,
  dashboardRoute,
  rpoRoute,
  solarRoiRoute,
  forecastingRoute,
  greenJobsRoute,
  greenFinanceRoute,
  circularityRoute,
  environmentRoute,
  stakeholdersRoute,
  dataSourcesRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
