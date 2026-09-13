"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Eye, EyeOff, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address (e.g. name@gmail.com).");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiClient("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          full_name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      if (data.token) {
        localStorage.setItem("travelgenie_token", data.token);
        localStorage.setItem("travelgenie_user", JSON.stringify(data.user));
        router.push("/bookings");
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    backgroundColor: "#FFFFFF",
    borderColor: "var(--color-border)",
    color: "var(--color-primary)",
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-28 pb-16 px-6">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border" style={{ borderColor: "var(--color-border)" }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>
              Create an Account
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--color-muted)" }}>
              Join TravelGenie to save itineraries and manage bookings.
            </p>
          </div>

          {success ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
              <h2 className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>Account Created!</h2>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                Your account has been registered successfully. You can now log in.
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-2.5 rounded-full text-white font-semibold text-sm transition-all"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-muted)" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
                  style={inputStyle}
                />
              </div>

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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-muted)" }}>
                  Confirm Password
                </label>
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-6 shadow-sm active:scale-95"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign Up"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs" style={{ color: "var(--color-muted)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold underline hover:text-(--color-primary)">
              Log In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
