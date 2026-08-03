/**
 * components/ChatInterface.tsx
 *
 * Full-width conversational chat UI — "warm concierge" aesthetic.
 * Manages:
 *  - Conversation state (messages array)
 *  - Accumulated tripInputs as the conversation progresses
 *  - Calling /api/chat and /api/itinerary
 *  - Rendering ItineraryPanel inline when itinerary is ready
 */
"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Send, Loader2, Plane } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage, Itinerary, TripInputs } from "@/types/chat";
import ItineraryPanel from "./ItineraryPanel";

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function makeAssistantMessage(content: string, itinerary?: Itinerary): ChatMessage {
  return { id: generateId(), role: "assistant", content, itinerary, createdAt: new Date() };
}

function makeUserMessage(content: string): ChatMessage {
  return { id: generateId(), role: "user", content, createdAt: new Date() };
}

const WELCOME_MESSAGE = makeAssistantMessage(
  "Namaste! ✈️ I'm TravelGenie — your AI travel concierge.\n\nTell me, where are you dreaming of going? I'll help you plan a beautiful trip that fits your schedule and budget perfectly."
);

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tripInputs, setTripInputs] = useState<Partial<TripInputs>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  }

  // ── Generate itinerary after chat collects all inputs ─────────────────────
  async function generateItinerary(inputs: TripInputs) {
    setIsGenerating(true);
    setMessages((prev) => [
      ...prev,
      makeAssistantMessage("Perfect! Let me craft your personalised itinerary... ✨ This may take a moment."),
    ]);

    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripInputs: inputs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate itinerary");

      const itinerary: Itinerary = data.itinerary;
      setMessages((prev) => [
        ...prev,
        makeAssistantMessage(
          `Here's your day-by-day itinerary for **${itinerary.tripTitle}**! I've kept everything within your budget wherever possible.`,
          itinerary
        ),
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        makeAssistantMessage(`Sorry, I ran into a problem generating your itinerary: ${msg}. Please try again.`),
      ]);
    } finally {
      setIsGenerating(false);
    }
  }

  // ── Send message ──────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading || isGenerating) return;

    const userMsg = makeUserMessage(text);
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages
            .filter((m) => m.role !== "system")
            .map((m) => ({ role: m.role, content: m.content })),
          tripInputs,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chat failed");

      const { reply, tripInputs: updated, readyToGenerate } = data;

      setTripInputs(updated ?? tripInputs);
      setMessages((prev) => [...prev, makeAssistantMessage(reply)]);

      // If all inputs collected, trigger itinerary generation
      if (readyToGenerate && updated) {
        setIsLoading(false);
        await generateItinerary(updated as TripInputs);
        return;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        makeAssistantMessage(`I'm having trouble connecting right now. ${msg}`),
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  // Ctrl+Enter or Enter to send (Shift+Enter for newline)
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col h-full"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* ── Message list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              {msg.role === "assistant" && (
                <div
                  style={{ backgroundColor: "var(--color-terra)", color: "var(--color-sand)" }}
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1"
                >
                  <Plane size={14} />
                </div>
              )}

              <div className={`flex flex-col gap-3 ${msg.role === "user" ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[75%]`}>
                {/* Text bubble */}
                <div
                  style={
                    msg.role === "user"
                      ? {
                          backgroundColor: "var(--color-terra)",
                          color: "var(--color-sand)",
                          borderRadius: "1rem 1rem 0.25rem 1rem",
                        }
                      : {
                          backgroundColor: "var(--color-surface)",
                          color: "var(--color-ink)",
                          border: "1px solid var(--color-sand-dark)",
                          borderRadius: "1rem 1rem 1rem 0.25rem",
                        }
                  }
                  className="px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                >
                  {msg.content}
                </div>

                {/* Inline itinerary */}
                {msg.itinerary && <ItineraryPanel itinerary={msg.itinerary} />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing / generating indicator */}
        {(isLoading || isGenerating) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div
              style={{ backgroundColor: "var(--color-terra)", color: "var(--color-sand)" }}
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            >
              <Plane size={14} />
            </div>
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-sand-dark)",
                borderRadius: "1rem 1rem 1rem 0.25rem",
              }}
              className="px-4 py-3 flex items-center gap-2 text-sm"
            >
              <Loader2 size={14} className="animate-spin" style={{ color: "var(--color-caramel)" }} />
              <span style={{ color: "var(--color-ink-muted)" }}>
                {isGenerating ? "Crafting your itinerary…" : "Thinking…"}
              </span>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderTop: "1px solid var(--color-sand-dark)",
        }}
        className="px-4 py-4"
      >
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Where would you like to travel?"
            rows={1}
            disabled={isLoading || isGenerating}
            style={{
              backgroundColor: "var(--color-sand)",
              border: "1px solid var(--color-sand-dark)",
              borderRadius: "var(--radius-btn)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-body)",
              resize: "none",
              outline: "none",
            }}
            className="flex-1 px-4 py-3 text-sm placeholder:text-[var(--color-ink-muted)]
                       focus:border-[var(--color-caramel)] focus:ring-2 focus:ring-[var(--color-caramel)]/20
                       disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isGenerating}
            style={{
              backgroundColor: "var(--color-terra)",
              color: "var(--color-sand)",
              borderRadius: "var(--radius-btn)",
            }}
            className="p-3 h-11 w-11 flex items-center justify-center shrink-0
                       hover:bg-[var(--color-terra-dark)] disabled:opacity-40
                       active:scale-95 transition-all"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>
        <p style={{ color: "var(--color-ink-muted)" }} className="text-xs text-center mt-2">
          Press Enter to send · Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}
