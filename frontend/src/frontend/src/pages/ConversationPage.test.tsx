import { renderWithRouter } from "@/__tests__/router-utils";
import ConversationPage from "@/pages/ConversationPage";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Ask Urja conversation screen", () => {
  it("renders the user question and the assistant turn", async () => {
    await renderWithRouter(<ConversationPage />, { path: "/ask" });

    expect(screen.getByTestId("conversation.page")).toBeInTheDocument();
    expect(screen.getByText("You asked")).toBeInTheDocument();
    expect(screen.getByText("Urja")).toBeInTheDocument();
  });

  it("renders the chat result cards", async () => {
    await renderWithRouter(<ConversationPage />, { path: "/ask" });

    expect(screen.getByTestId("conversation.card.service")).toBeInTheDocument();
    expect(screen.getByTestId("conversation.card.scheme")).toBeInTheDocument();
    expect(
      screen.getByTestId("conversation.card.helpline"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("conversation.card.announcement"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("conversation.card.checklist"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("conversation.card.forecast"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("conversation.card.source")).toBeInTheDocument();
  });

  it("renders the composer controls and follow-up suggestions", async () => {
    await renderWithRouter(<ConversationPage />, { path: "/ask" });

    expect(screen.getByTestId("conversation.composer")).toBeInTheDocument();
    expect(
      screen.getByTestId("conversation.composer.input"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("conversation.composer.send_button"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("conversation.composer.mic_button"),
    ).toBeInTheDocument();
  });

  it("labels the illustrative content as sample data", async () => {
    await renderWithRouter(<ConversationPage />, { path: "/ask" });

    expect(screen.getAllByTestId("sample.label").length).toBeGreaterThan(0);
  });
});
