/**
 * app/plan/page.tsx — AI chatbot and itinerary page (/plan)
 * Conversational interface with auth enforcement, intent knowledge base, and booking search links.
 */
"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, Loader2, Bot, MapPin, RotateCcw, ShieldCheck, Clock, Utensils, Calendar, CheckCircle, ExternalLink, Lock, LogIn, UserPlus, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

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
  "Namaste! ✈️ I'm Travel Genie — your pan-India AI travel companion.\n\nTell me your trip plan! Where are you starting from, where would you like to go, travel dates, traveller count, and total budget in INR?\n\nExample: *\"I want to travel from Mumbai to Varanasi for 4 days with 2 friends, budget ₹40,000\"*"
);

const QUICK_REPLIES = [
  { label: "What is the best time to visit?", query: "What is the best time to visit?", icon: Calendar },
  { label: "How to reach this city?", query: "How to reach this city by flight, train, bus?", icon: MapPin },
  { label: "Food & Culinary Spots", query: "Recommend top local food and culinary spots", icon: Utensils },
  { label: "Is it safe at night?", query: "Is it safe at night in this destination?", icon: ShieldCheck },
];

function renderContent(text: string, onSelectPlan?: (planTitle: string) => void) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Action Plan Buttons: 👉 [Plan This Option — Select Flight Plan](/plan?option=flight...)
    if (line.includes("[Plan This Option") || line.includes("👉 [Plan This") || line.includes("Plan This ")) {
      const match = line.match(/\[(.*?)\]\((.*?)\)/);
      const buttonLabel = match ? match[1] : "Plan This Option";
      return (
        <div key={i} className="my-2.5">
          <button
            onClick={() => onSelectPlan && onSelectPlan(buttonLabel)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold shadow-md transition-all active:scale-95 text-white hover:brightness-110"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            <CheckCircle size={15} />
            <span>{buttonLabel}</span>
          </button>
        </div>
      );
    }
    // External Links: 🔗 [Search Flights on Google Flights](url)
    if (line.includes("🔗 [") || (line.includes("[Search") && line.includes("http"))) {
      const parts = line.split(/(\[.*?\]\(https?:\/\/[^\)]+\))/g);
      return (
        <p key={i} className="my-1.5 text-xs font-semibold flex flex-wrap items-center gap-2">
          {parts.map((part, j) => {
            const linkMatch = part.match(/^\[(.*?)\]\((https?:\/\/[^\)]+)\)$/);
            if (linkMatch) {
              const [_, label, url] = linkMatch;
              return (
                <a
                  key={j}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-colors font-medium text-xs"
                >
                  <span>{label}</span>
                  <ExternalLink size={12} />
                </a>
              );
            }
            return <span key={j}>{part}</span>;
          })}
        </p>
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
      return <hr key={i} className="my-3.5" style={{ borderColor: "var(--color-border)" }} />;
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
    if (line.trim() === "") return <div key={i} className="h-1" />;
    return (
      <p key={i} className={`leading-relaxed ${line.startsWith("- ") || line.startsWith("• ") ? "ml-2" : ""}`}>
        {line}
      </p>
    );
  });
}

function PlanPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillDest = searchParams.get("destination") || searchParams.get("dest") || "";

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState(prefillDest ? `I want to travel to ${prefillDest}` : "");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { supabaseBrowser } = await import("@/lib/supabase");
        const { data } = await supabaseBrowser.auth.getUser();
        setUser(data.user);
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    }
    checkAuth();
  }, []);

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
    // REQUIRE AUTHENTICATION TO PLAN OR LOCK A TRIP
    if (!user) {
      setPendingPlan(planTitle);
      setShowAuthModal(true);
      return;
    }

    sendQuery(`I want to proceed with: "${planTitle}". Please lock this option and proceed to finalizing!`);
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

      {/* Auth Modal for Unauthenticated Users */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-[var(--radius-xl)] p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Lock size={28} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
                Sign In Required
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Please sign in or create an account to select, save, or finalize your trip plan:
              </p>
              {pendingPlan && (
                <div className="p-3 bg-amber-50 rounded-lg text-xs font-semibold text-amber-900 border border-amber-200 mt-2">
                  Selected: "{pendingPlan}"
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/login?redirect=/plan"
                className="w-full py-3 px-4 rounded-[var(--radius-md)] text-sm font-semibold text-center text-white flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                <LogIn size={16} /> Sign In to Continue
              </Link>
              <Link
                href="/signup?redirect=/plan"
                className="w-full py-3 px-4 rounded-[var(--radius-md)] text-sm font-semibold text-center flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
              >
                <UserPlus size={16} /> Create Free Account
              </Link>
            </div>
          </div>
        </div>
      )}

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
            placeholder="Ask a question or plan a trip (e.g. Plan a trip to Varanasi from Mumbai)"
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
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-40 text-white"
            style={{ backgroundColor: "var(--color-accent)" }}
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
          {user ? (
            <span className="text-emerald-700 font-semibold">Signed in as {user.email?.split("@")[0]}</span>
          ) : (
            <Link href="/login?redirect=/plan" style={{ color: "var(--color-accent)" }} className="font-semibold">
              Sign in required to save trips
            </Link>
          )}
        </p>
      </div>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    }>
      <PlanPageInner />
    </Suspense>
  );
}
