import { renderWithRouter } from "@/__tests__/router-utils";
import VoicePage from "@/pages/VoicePage";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

describe("Urja Voice Assistant screen", () => {
  it("shows the central orb, transcript panel and all five previewable states", async () => {
    await renderWithRouter(<VoicePage />, { path: "/voice" });

    expect(screen.getByTestId("voice.orb")).toBeInTheDocument();
    expect(screen.getByTestId("voice.transcript.panel")).toBeInTheDocument();

    const states = [
      "Ready to talk",
      "Listening",
      "Processing",
      "Urja is speaking",
      "Conversation ended",
    ];
    for (const label of states) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("previews a state when its tab is selected", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<VoicePage />, { path: "/voice" });

    await user.click(screen.getByRole("button", { name: "Listening" }));

    expect(screen.getByTestId("voice.state.tab.listening")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("heading", { name: "Listening" }),
    ).toBeInTheDocument();
  });

  it("ends the conversation without requesting microphone access", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<VoicePage />, { path: "/voice" });

    await user.click(screen.getByTestId("voice.end_button"));

    expect(screen.getByTestId("voice.ended_state")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Conversation ended" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
