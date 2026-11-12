import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";

// jsdom has no IntersectionObserver; motion's `whileInView` needs it. Provide a
// no-op so viewport-driven animations mount instead of crashing the tree.
if (typeof globalThis.IntersectionObserver === "undefined") {
  class NoopIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
  }
  globalThis.IntersectionObserver =
    NoopIntersectionObserver as unknown as typeof IntersectionObserver;
}

/**
 * Render a page component inside a real TanStack Router so that `Link`,
 * `useNavigate` and `useRouterState` resolve. The route tree mirrors the
 * production paths closely enough for navigation assertions; the page under
 * test is mounted at `path`.
 */
export async function renderWithRouter(
  ui: ReactElement,
  { path = "/" }: { path?: string } = {},
) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const pageRoute = createRoute({
    getParentRoute: () => rootRoute,
    path,
    component: () => ui,
  });
  const catchAllRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "$",
    component: () => null,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([pageRoute, catchAllRoute]),
    history: createMemoryHistory({ initialEntries: [path] }),
    defaultPreload: false,
  });
  await router.load();
  return render(<RouterProvider router={router} />);
}
