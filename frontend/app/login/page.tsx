"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/bookings";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);

  useEffect(() => {
    function checkSession() {
      try {
        const token = localStorage.getItem("travelgenie_token");
        const storedUser = localStorage.getItem("travelgenie_user");
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setCheckingSession(false);
      }
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
      const data = await apiClient("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (data.token) {
        localStorage.setItem("travelgenie_token", data.token);
        localStorage.setItem("travelgenie_user", JSON.stringify(data.user));
        router.push(redirectTarget);
      } else {
        throw new Error(data.error || "Login failed.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("travelgenie_token");
    localStorage.removeItem("travelgenie_user");
    setUser(null);
  }

  const inputStyle = {
    backgroundColor: "#FFFFFF",
    borderColor: "var(--color-border)",
    color: "var(--color-primary)",
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-28 pb-16 px-6">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border" style={{ borderColor: "var(--color-border)" }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>
              Welcome Back
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--color-muted)" }}>
              Log in to manage your trip itineraries.
            </p>
          </div>

          {user ? (
            <div className="text-center py-6 space-y-4">
              <p className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
                You are currently logged in as <span className="font-bold">{user.email || user.name}</span>.
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/bookings"
                  className="px-5 py-2.5 rounded-full text-white text-xs font-bold"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  View Bookings
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 rounded-full border text-xs font-bold text-red-600 border-red-200 hover:bg-red-50"
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-muted)" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-muted)" }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent) pr-10"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-6 shadow-sm active:scale-95"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Log In"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs" style={{ color: "var(--color-muted)" }}>
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold underline hover:text-(--color-primary)">
              Sign Up
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-gray-400" size={32} /></div>}>
      <LoginContent />
    </Suspense>
  );
}
