"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignupPage() {
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

    // Client-side validation
    if (!name.trim()) {
      setError("Please enter your name.");
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
      const { supabaseBrowser } = await import("@/lib/supabase");
      const { error: authError } = await supabaseBrowser.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name.trim() },
        },
      });
      if (authError) throw authError;
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    border: "1px solid var(--color-border)",
    backgroundColor: "var(--color-cream)",
    color: "var(--color-primary)",
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-cream)" }}>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-md">
          <div
            className="p-10 rounded-[var(--radius-xl)]"
            style={{ backgroundColor: "var(--color-white)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-lg)" }}
          >
            {success ? (
              <div className="text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl mb-3" style={{ fontFamily: "var(--font-display)" }}>
                  Check your email
                </h2>
                <p className="text-sm mb-6" style={{ color: "var(--color-secondary)" }}>
                  We sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account, then sign in.
                </p>
                <Link href="/login" className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
                  Go to Login →
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-3xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
                  Create account
                </h1>
                <p className="text-sm mb-7" style={{ color: "var(--color-secondary)" }}>
                  Sign up to save itineraries and manage bookings.
                </p>

                {error && (
                  <div className="mb-5 p-3 rounded-[var(--radius-sm)] text-sm" style={{ backgroundColor: "#FEF2F2", color: "#991B1B", border: "1px solid #FCA5A5" }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignup} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--color-secondary)" }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Priya Sharma"
                      className="w-full px-4 py-3 rounded-[var(--radius-md)] text-sm outline-none"
                      style={inputStyle}
                    />
                  </div>

                  {/* Email */}
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
                      className="w-full px-4 py-3 rounded-[var(--radius-md)] text-sm outline-none"
                      style={inputStyle}
                    />
                  </div>

                  {/* Password */}
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
                        minLength={6}
                        placeholder="Min. 6 characters"
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

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--color-secondary)" }}>
                      Confirm Password
                    </label>
                    <input
                      type={showPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Re-enter password"
                      className="w-full px-4 py-3 rounded-[var(--radius-md)] text-sm outline-none"
                      style={{
                        ...inputStyle,
                        borderColor: confirmPassword && confirmPassword !== password ? "#FCA5A5" : "var(--color-border)",
                      }}
                    />
                    {confirmPassword && confirmPassword !== password && (
                      <p className="text-xs mt-1" style={{ color: "#991B1B" }}>Passwords do not match</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-[var(--radius-md)] text-sm font-semibold transition-all active:scale-95 disabled:opacity-60 mt-2"
                    style={{ backgroundColor: "var(--color-accent)", color: "white" }}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Create Account"}
                  </button>
                </form>

                <p className="text-sm text-center mt-6" style={{ color: "var(--color-secondary)" }}>
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold" style={{ color: "var(--color-accent)" }}>
                    Sign In
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
