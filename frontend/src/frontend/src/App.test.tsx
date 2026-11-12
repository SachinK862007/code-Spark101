import App from "@/App";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

// jsdom has no IntersectionObserver; motion's `whileInView` needs it.
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

describe("App shell routing", () => {
  it("renders the Home / Ask Urja screen on the default route without a blank screen", async () => {
    render(<App />);

    // The hero headline proves the default route mounted real content.
    expect(
      await screen.findByRole("heading", { name: /Namaskara, India/i }),
    ).toBeInTheDocument();
    // The global shell is present around the page.
    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();
  });
});
