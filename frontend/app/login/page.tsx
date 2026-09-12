"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);

  // Check existing session on mount
  useEffect(() => {
    async function checkSession() {
      const { supabaseBrowser } = await import("@/lib/supabase");
      const { data } = await supabaseBrowser.auth.getUser();
      setUser(data.user);
      setCheckingSession(false);
    }
    checkSession();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const { supabaseBrowser } = await import("@/lib/supabase");
      const { error: authError } = await supabaseBrowser.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;
      // Session is persisted automatically by Supabase in localStorage/cookie
      router.push("/bookings");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed. Please try again.";
      // Make Supabase error messages more user-friendly
      if (msg.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please try again.");
      } else if (msg.includes("Email not confirmed")) {
        setError("Please confirm your email address before logging in. Check your inbox.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    const { supabaseBrowser } = await import("@/lib/supabase");
    await supabaseBrowser.auth.signOut();
    setUser(null);
  }

  const inputStyle = {
    border: "1px solid var(--color-border)",
    backgroundColor: "var(--color-cream)",
    color: "var(--color-primary)",
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-cream)" }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--color-accent)" }} />
        </main>
      </div>
    );
  }

  // Already logged in — show session info
  if (user) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-cream)" }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
          <div className="w-full max-w-md">
            <div
              className="p-10 rounded-[var(--radius-xl)] text-center"
              style={{ backgroundColor: "var(--color-white)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-lg)" }}
            >
              <div className="text-5xl mb-4">👋</div>
              <h1 className="text-2xl mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Welcome back!
              </h1>
              <p className="text-sm mb-2" style={{ color: "var(--color-secondary)" }}>
                Signed in as
              </p>
              <p className="text-sm font-semibold mb-6" style={{ color: "var(--color-primary)" }}>
                {user.email}
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/bookings"
                  className="w-full py-3 rounded-[var(--radius-md)] text-sm font-semibold text-center transition-all active:scale-95"
                  style={{ backgroundColor: "var(--color-accent)", color: "white" }}
                >
                  View My Bookings
                </Link>
                <Link
                  href="/plan"
                  className="w-full py-3 rounded-[var(--radius-md)] text-sm font-semibold text-center transition-all active:scale-95"
                  style={{ backgroundColor: "var(--color-surface)", color: "var(--color-primary)", border: "1px solid var(--color-border)" }}
                >
                  Plan a Trip
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium mt-2"
                  style={{ color: "var(--color-secondary)" }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
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
            <h1 className="text-3xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
              Welcome back
            </h1>
            <p className="text-sm mb-7" style={{ color: "var(--color-secondary)" }}>
              Sign in to view your bookings and saved trips.
            </p>

            {error && (
              <div
                className="mb-5 p-3 rounded-[var(--radius-sm)] text-sm"
                style={{ backgroundColor: "#FEF2F2", color: "#991B1B", border: "1px solid #FCA5A5" }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--color-secondary)" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-[var(--radius-md)] text-sm outline-none"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--color-secondary)" }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-3 pr-12 rounded-[var(--radius-md)] text-sm outline-none"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-[var(--radius-md)] text-sm font-semibold transition-all active:scale-95 disabled:opacity-60 mt-2"
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
