/**
 * app/plan/page.tsx — AI chatbot and itinerary page (/plan)
 * Full-page conversational interface. Replaces the old /chat page.
 */
"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Loader2, Bot, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import ItineraryPanel from "@/components/ItineraryPanel";
import TransportCard from "@/components/TransportCard";
import RazorpayPayButton from "@/components/RazorpayPayButton";
import type { ChatMessage, Itinerary, TripInputs, TrainOption } from "@/types/chat";

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function makeMsg(role: ChatMessage["role"], content: string, itinerary?: Itinerary): ChatMessage {
  return { id: generateId(), role, content, itinerary, createdAt: new Date() };
}

const WELCOME: ChatMessage = makeMsg(
  "assistant",
  "Namaste! ✈️ I'm Travel Genie — your AI travel companion.\n\nTell me where you'd love to go, your travel dates, how many people are travelling, and your total budget. I'll plan the perfect trip for you!"
);

function PlanPageInner() {
  const searchParams = useSearchParams();
  const prefillDest = searchParams.get("destination") || "";

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState(prefillDest ? `I want to go to ${prefillDest}` : "");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tripInputs, setTripInputs] = useState<Partial<TripInputs>>({});
  const [trainAlternatives, setTrainAlternatives] = useState<TrainOption[]>([]);
  const [showTransportCard, setShowTransportCard] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
  const [isLoggedIn] = useState(false); // Auth Phase 2
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function generateItinerary(inputs: TripInputs) {
    setIsGenerating(true);
    setMessages((prev) => [
      ...prev,
      makeMsg("assistant", "✨ Crafting your personalised itinerary… This may take a moment."),
    ]);

    try {
      const [itinRes, safetyRes] = await Promise.all([
        fetch("/api/itinerary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tripInputs: inputs }),
        }),
        fetch("/api/safety-weather", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination: inputs.destination,
            startDate: inputs.startDate,
            endDate: inputs.endDate,
          }),
        }),
      ]);

      const itinData = await itinRes.json();
      if (!itinRes.ok) throw new Error(itinData.error ?? "Failed to generate itinerary");

      const itinerary: Itinerary = itinData.itinerary;
      setCurrentItinerary(itinerary);

      let safetyMsg = "";
      if (safetyRes.ok) {
        const safetyData = await safetyRes.json();
        if (safetyData.safety) {
          safetyMsg = `\n\n🛡️ **Safety**: ${safetyData.safety.message} (Score: ${safetyData.safety.score}/5)`;
        }
        if (safetyData.weather?.[0]) {
          const w = safetyData.weather[0];
          safetyMsg += `\n🌤️ **Weather**: ~${w.tempMinC}°C–${w.tempMaxC}°C, ${w.precipitationMm}mm rain expected.`;
        }
      }

      // Check budget — search for flights/hotels
      const searchRes = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Mumbai",
          to: inputs.destination,
          checkIn: inputs.startDate,
          checkOut: inputs.endDate,
          travelers: inputs.travelers,
          budgetINR: inputs.budgetINR,
        }),
      });

      let overBudgetNote = "";
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.overBudget && searchData.trainAlternatives?.length > 0) {
          setTrainAlternatives(searchData.trainAlternatives);
          setShowTransportCard(true);
          overBudgetNote = "\n\n⚠️ Your estimated transport + hotel costs exceed your budget. I've found some train alternatives below — you choose whether to switch.";
        }
      }

      setMessages((prev) => [
        ...prev,
        makeMsg(
          "assistant",
          `Here's your itinerary for **${itinerary.tripTitle}**! ${safetyMsg}${overBudgetNote}\n\nReview it below and confirm your booking when ready.`,
          itinerary
        ),
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        makeMsg("assistant", `Sorry, something went wrong: ${err instanceof Error ? err.message : "Unknown error"}. Please try again.`),
      ]);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading || isGenerating) return;

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
          messages: updated.filter((m) => !m.itinerary).map((m) => ({ role: m.role, content: m.content })),
          tripInputs,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chat error");

      const { reply, tripInputs: newInputs, readyToGenerate } = data;
      if (newInputs) setTripInputs(newInputs);
      setMessages((prev) => [...prev, makeMsg("assistant", reply)]);

      if (readyToGenerate && newInputs) {
        setIsLoading(false);
        await generateItinerary(newInputs as TripInputs);
        return;
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        makeMsg("assistant", `Connection error. Please try again.`),
      ]);
    } finally {
      setIsLoading(false);
    }
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
      className="flex flex-col h-screen"
      style={{ backgroundColor: "var(--color-cream)", fontFamily: "var(--font-body)" }}
    >
      <Navbar />
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 pt-24 pb-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
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
              <div className={`flex flex-col gap-3 ${msg.role === "user" ? "items-end" : "items-start"} max-w-[85%]`}>
                <div
                  className="px-5 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                  style={
                    msg.role === "user"
                      ? {
                          backgroundColor: "var(--color-accent)",
                          color: "white",
                          borderRadius: "1.25rem 1.25rem 0.25rem 1.25rem",
                        }
                      : {
                          backgroundColor: "var(--color-white)",
                          color: "var(--color-primary)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "1.25rem 1.25rem 1.25rem 0.25rem",
                          boxShadow: "var(--shadow-sm)",
                        }
                  }
                >
                  {msg.content}
                </div>
                {msg.itinerary && (
                  <>
                    <ItineraryPanel itinerary={msg.itinerary} />
                    {showTransportCard && trainAlternatives.length > 0 && (
                      <TransportCard
                        overageINR={msg.itinerary.estimatedCostINR - msg.itinerary.totalBudgetINR}
                        trainOptions={trainAlternatives}
                        onConfirmSwitch={(train) => {
                          setShowTransportCard(false);
                          setMessages((prev) => [
                            ...prev,
                            makeMsg("assistant", `✅ Great choice! Train **${train.trainName}** (₹${train.priceINR.ac3Tier} for 3AC) has been noted. Your booking below reflects the updated transport.`),
                          ]);
                        }}
                        onDecline={() => {
                          setShowTransportCard(false);
                          setMessages((prev) => [
                            ...prev,
                            makeMsg("assistant", "Understood! Keeping flights as planned. Proceed with booking below."),
                          ]);
                        }}
                      />
                    )}
                    {currentItinerary && (
                      <div className="w-full">
                        <RazorpayPayButton
                          itinerary={currentItinerary}
                          isLoggedIn={isLoggedIn}
                          onRequireLogin={() =>
                            setMessages((prev) => [
                              ...prev,
                              makeMsg("assistant", "Please log in first to confirm your booking. 🔐\n\nVisit /login to sign in or create an account."),
                            ])
                          }
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          {(isLoading || isGenerating) && (
            <div className="flex gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--color-accent)", color: "white" }}
              >
                <Bot size={16} />
              </div>
              <div
                className="px-5 py-3 flex items-center gap-2 text-sm"
                style={{ backgroundColor: "var(--color-white)", border: "1px solid var(--color-border)", borderRadius: "1.25rem 1.25rem 1.25rem 0.25rem" }}
              >
                <Loader2 size={14} className="animate-spin" style={{ color: "var(--color-accent)" }} />
                <span style={{ color: "var(--color-muted)" }}>
                  {isGenerating ? "Crafting your itinerary…" : "Thinking…"}
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
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
            placeholder="Where would you like to travel?"
            rows={1}
            disabled={isLoading || isGenerating}
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
            disabled={!input.trim() || isLoading || isGenerating}
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-40"
            style={{ backgroundColor: "var(--color-accent)", color: "white" }}
          >
            <Send size={16} />
          </button>
        </form>
        <p className="text-xs text-center mt-2" style={{ color: "var(--color-muted)" }}>
          <MapPin size={11} className="inline mr-1" />
          Enter to send · Shift+Enter for new line
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
