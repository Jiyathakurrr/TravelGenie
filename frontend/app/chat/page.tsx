/**
 * app/chat/page.tsx
 *
 * The main trip planning chat page.
 * Full-height chat interface — the user's primary entry point into TravelGenie.
 */
import ChatInterface from "@/components/ChatInterface";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan a Trip — TravelGenie",
  description: "Chat with TravelGenie's AI to plan your perfect trip with a personalised itinerary.",
};

export default function ChatPage() {
  return (
    <div
      style={{ backgroundColor: "var(--color-sand)" }}
      className="flex flex-col h-screen"
    >
      <Navbar />
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}
