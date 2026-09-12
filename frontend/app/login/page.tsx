"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { supabaseBrowser } = await import("@/lib/supabase");
      const { error: authError } = await supabaseBrowser.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      window.location.href = "/bookings";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-cream)" }}>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-md">
          <div
            className="p-10 rounded-[var(--radius-xl)]"
            style={{ backgroundColor: "var(--color-white)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-lg)" }}
          >
            <h1 className="text-3xl mb-2" style={{ fontFamily: "var(--font-display)" }}>Welcome back</h1>
            <p className="text-sm mb-8" style={{ color: "var(--color-secondary)" }}>
              Sign in to view your bookings and saved trips.
            </p>

            {error && (
              <div className="mb-5 p-3 rounded-[var(--radius-sm)] text-sm" style={{ backgroundColor: "#FEF2F2", color: "#991B1B", border: "1px solid #FCA5A5" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--color-secondary)" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-[var(--radius-md)] text-sm outline-none transition-all"
                  style={{ border: "1px solid var(--color-border)", backgroundColor: "var(--color-cream)", color: "var(--color-primary)" }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--color-secondary)" }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 rounded-[var(--radius-md)] text-sm outline-none transition-all"
                    style={{ border: "1px solid var(--color-border)", backgroundColor: "var(--color-cream)", color: "var(--color-primary)" }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "var(--color-muted)" }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-[var(--radius-md)] text-sm font-semibold transition-all active:scale-95 disabled:opacity-60"
                style={{ backgroundColor: "var(--color-accent)", color: "white" }}
              >
                {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Sign In"}
              </button>
            </form>

            <p className="text-sm text-center mt-6" style={{ color: "var(--color-secondary)" }}>
              No account?{" "}
              <Link href="/signup" className="font-semibold" style={{ color: "var(--color-accent)" }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
