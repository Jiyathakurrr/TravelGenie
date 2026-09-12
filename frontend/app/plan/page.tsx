/**
 * app/plan/page.tsx — AI chatbot and itinerary page (/plan)
 * Conversational interface powered by Kie API (KIE_API_KEY).
 */
"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Loader2, Bot, MapPin, RotateCcw, ShieldCheck, Clock, Utensils, Calendar, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function makeMsg(role: ChatMessage["role"], content: string): ChatMessage {
  return { id: generateId(), role, content, createdAt: new Date() };
}

const WELCOME = makeMsg(
  "assistant",
  "Namaste! ✈️ I'm Travel Genie — your pan-India AI travel companion.\n\nTell me your trip plan! Where are you starting from, where would you like to go, travel dates, traveller count, and total budget in INR?\n\nExample: *\"I want to travel from Mumbai to Agra for 4 days with 2 friends, budget ₹40,000\"*"
);

const QUICK_REPLIES = [
  { label: "Is it safe at night?", query: "Is it safe at night in this destination?", icon: ShieldCheck },
  { label: "Shorten to 3 days", query: "Can you shorten this itinerary to 3 days?", icon: Clock },
  { label: "Food & Culinary Spots", query: "Recommend top local food and culinary spots", icon: Utensils },
  { label: "Best Month to Visit", query: "What is the best month to visit?", icon: Calendar },
];

function renderContent(text: string, onSelectPlan?: (planTitle: string) => void) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Action Plan Buttons: 👉 [Plan This Option — Select Flight Plan](/plan?option=flight...)
    if (line.includes("[Plan This Option") || line.includes("👉 [Plan This")) {
      const match = line.match(/\[(.*?)\]\((.*?)\)/);
      const buttonLabel = match ? match[1] : "Plan This Option";
      return (
        <div key={i} className="my-2">
          <button
            onClick={() => onSelectPlan && onSelectPlan(buttonLabel)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-all active:scale-95 text-white"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            <CheckCircle size={14} />
            <span>{buttonLabel}</span>
          </button>
        </div>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <h3 key={i} className="font-semibold text-base mt-4 mb-1" style={{ color: "var(--color-accent)" }}>
          {line.replace("### ", "")}
        </h3>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <h2 key={i} className="font-bold text-lg mt-5 mb-2" style={{ color: "var(--color-primary)" }}>
          {line.replace("## ", "")}
        </h2>
      );
    }
    if (line.trim() === "---") {
      return <hr key={i} className="my-3" style={{ borderColor: "var(--color-border)" }} />;
    }
    if (line.includes("**")) {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className={`${line.startsWith("- ") || line.startsWith("• ") ? "ml-3" : ""} leading-relaxed`}>
          {parts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j}>{part.slice(2, -2)}</strong>
            ) : (
              part
            )
          )}
        </p>
      );
    }
    if (line.startsWith("|")) {
      const cells = line.split("|").filter(Boolean).map((c) => c.trim());
      const isSeparator = cells.every((c) => /^[-:]+$/.test(c));
      if (isSeparator) return null;
      return (
        <div key={i} className="flex gap-2 text-xs border-b py-1.5" style={{ borderColor: "var(--color-border)" }}>
          {cells.map((cell, j) => (
            <span key={j} className={`flex-1 ${j === 0 ? "font-medium" : ""}`}>{cell}</span>
          ))}
        </div>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-1" />;
    return (
      <p key={i} className={`leading-relaxed ${line.startsWith("- ") || line.startsWith("• ") ? "ml-2" : ""}`}>
        {line}
      </p>
    );
  });
}

function PlanPageInner() {
  const searchParams = useSearchParams();
  const prefillDest = searchParams.get("destination") || "";

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState(prefillDest ? `I want to travel from Delhi to ${prefillDest}` : "");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function resetChat() {
    setMessages([WELCOME]);
    setInput("");
  }

  async function sendQuery(queryText: string) {
    const text = queryText.trim();
    if (!text || isLoading) return;

    const userMsg = makeMsg("user", text);
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errText = data.error ?? `Server error (${res.status})`;
        setMessages((prev) => [
          ...prev,
          makeMsg("assistant", `⚠️ ${errText}`),
        ]);
        return;
      }

      setMessages((prev) => [...prev, makeMsg("assistant", data.reply)]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setMessages((prev) => [
        ...prev,
        makeMsg("assistant", `⚠️ Could not reach the AI service: ${msg}`),
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectPlan(planTitle: string) {
    sendQuery(`I want to proceed with: "${planTitle}". Please lock this option and proceed to booking!`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendQuery(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  }

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ backgroundColor: "var(--color-cream)", fontFamily: "var(--font-body)" }}
    >
      <Navbar />

      {/* Chat conversation area */}
      <div className="flex-1 overflow-y-auto px-4 pt-28 pb-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {msg.role === "assistant" && (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-1"
                  style={{ backgroundColor: "var(--color-accent)", color: "white" }}
                >
                  <Bot size={16} />
                </div>
              )}
              <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} max-w-[88%]`}>
                <div
                  className="px-5 py-3 text-sm"
                  style={
                    msg.role === "user"
                      ? {
                          backgroundColor: "var(--color-accent)",
                          color: "white",
                          borderRadius: "1.25rem 1.25rem 0.25rem 1.25rem",
                          whiteSpace: "pre-wrap",
                        }
                      : {
                          backgroundColor: "var(--color-white)",
                          color: "var(--color-primary)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "1.25rem 1.25rem 1.25rem 0.25rem",
                          boxShadow: "var(--shadow-sm)",
                          width: "100%",
                        }
                  }
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <div className="space-y-1">{renderContent(msg.content, handleSelectPlan)}</div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--color-accent)", color: "white" }}
              >
                <Bot size={16} />
              </div>
              <div
                className="px-5 py-3 flex items-center gap-2 text-sm"
                style={{
                  backgroundColor: "var(--color-white)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "1.25rem 1.25rem 1.25rem 0.25rem",
                }}
              >
                <Loader2 size={14} className="animate-spin" style={{ color: "var(--color-accent)" }} />
                <span style={{ color: "var(--color-muted)" }}>Travel Genie is planning your trip…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quick reply bar */}
      <div className="px-4 py-2 bg-[var(--color-cream)] border-t border-[var(--color-border)] overflow-x-auto">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          {QUICK_REPLIES.map((qr) => {
            const Icon = qr.icon;
            return (
              <button
                key={qr.label}
                onClick={() => sendQuery(qr.query)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--color-border)] bg-[var(--color-white)] text-[var(--color-primary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all whitespace-nowrap"
              >
                <Icon size={12} />
                <span>{qr.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input bar */}
      <div
        className="px-4 py-4"
        style={{ backgroundColor: "var(--color-white)", borderTop: "1px solid var(--color-border)" }}
      >
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Plan a trip (e.g. Mumbai to Agra for 4 days with 2 friends, budget ₹40,000)"
            rows={1}
            disabled={isLoading}
            className="flex-1 px-5 py-3 text-sm rounded-[var(--radius-xl)] resize-none outline-none transition-all"
            style={{
              backgroundColor: "var(--color-cream)",
              border: "1px solid var(--color-border)",
              color: "var(--color-primary)",
              fontFamily: "var(--font-body)",
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-40"
            style={{ backgroundColor: "var(--color-accent)", color: "white" }}
            aria-label="Send"
          >
            <Send size={16} />
          </button>
          <button
            type="button"
            onClick={resetChat}
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95"
            style={{ backgroundColor: "var(--color-surface)", color: "var(--color-secondary)", border: "1px solid var(--color-border)" }}
            title="Start new chat"
            aria-label="Reset chat"
          >
            <RotateCcw size={16} />
          </button>
        </form>
        <p className="text-xs text-center mt-2" style={{ color: "var(--color-muted)" }}>
          <MapPin size={11} className="inline mr-1" />
          Enter to send · Shift+Enter for line break ·{" "}
          <Link href="/login" style={{ color: "var(--color-accent)" }}>
            Sign in
          </Link>{" "}
          to save itineraries
        </p>
      </div>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense>
      <PlanPageInner />
    </Suspense>
  );
}
