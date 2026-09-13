"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Eye, EyeOff, Loader2, Mail, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isEmailError, setIsEmailError] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsEmailError(false);
    setResendSent(false);

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
      const { supabaseBrowser } = await import("@/lib/supabase");
      const { data, error: authError } = await supabaseBrowser.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
        },
      });

      if (authError) throw authError;

      if (data?.session) {
        // Auto-confirmed in Supabase settings
        router.push("/bookings");
      } else {
        // Confirmation email sent successfully
        setSuccess(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed. Please try again.";
      if (msg.includes("already registered") || msg.includes("User already registered")) {
        setError("This email is already registered. Please sign in instead.");
      } else if (msg.includes("sending confirmation email") || msg.includes("email_rate_limit") || msg.includes("rate limit")) {
        setIsEmailError(true);
        setError("Supabase default email rate limit reached or email service error. You can click below to resend the verification link.");
      } else if (msg.includes("invalid")) {
        setError("Invalid email address format. Please use a valid email address.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendEmail() {
    if (!email.trim()) return;
    setResending(true);
    try {
      const { supabaseBrowser } = await import("@/lib/supabase");
      const { error: resendErr } = await supabaseBrowser.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
        },
      });
      if (resendErr) throw resendErr;
      setResendSent(true);
      setError("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend email.";
      setError(msg);
    } finally {
      setResending(false);
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
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Mail size={32} />
                </div>
                <h2 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  Check your inbox!
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We sent a confirmation link to <strong className="text-gray-900">{email}</strong>. Please click the link in your email to verify your account, then sign in.
                </p>

                {resendSent ? (
                  <p className="text-xs text-emerald-700 bg-emerald-50 py-2 px-3 rounded-md border border-emerald-200 flex items-center justify-center gap-1.5 font-medium">
                    <CheckCircle2 size={14} /> Verification email resent successfully!
                  </p>
                ) : (
                  <button
                    onClick={handleResendEmail}
                    disabled={resending}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] hover:underline"
                  >
                    {resending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                    {resending ? "Resending..." : "Didn't get the email? Click to resend"}
                  </button>
                )}

                <div className="pt-4 border-t border-[var(--color-border)]">
                  <Link
                    href="/login"
                    className="block w-full py-3 rounded-[var(--radius-md)] text-sm font-semibold text-center text-white"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  >
                    Go to Sign In →
                  </Link>
                </div>
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
                  <div className="mb-5 p-4 rounded-[var(--radius-sm)] text-sm space-y-2.5" style={{ backgroundColor: "#FEF2F2", color: "#991B1B", border: "1px solid #FCA5A5" }}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                      <p className="leading-snug">{error}</p>
                    </div>
                    {isEmailError && (
                      <div className="pt-2 border-t border-red-200 flex flex-col gap-2">
                        {resendSent ? (
                          <p className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={14} /> Verification email resent! Check your inbox.
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendEmail}
                            disabled={resending}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-red-800 text-white text-xs font-semibold hover:bg-red-900 transition-colors"
                          >
                            {resending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                            {resending ? "Resending..." : "Resend Verification Email"}
                          </button>
                        )}
                      </div>
                    )}
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
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@gmail.com"
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
                    className="w-full py-3 rounded-[var(--radius-md)] text-sm font-semibold transition-all active:scale-95 disabled:opacity-60 mt-2 text-white"
                    style={{ backgroundColor: "var(--color-accent)" }}
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
