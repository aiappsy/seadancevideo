"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaGoogle, FaEnvelope, FaBolt, FaInfoCircle } from "react-icons/fa";

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("callbackUrl") || searchParams.get("next") || "/workspace";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.push(next);
    }
  }, [status, router, next]);

  const handleEmailSignIn = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        callbackUrl: next,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error || "Sign in failed");
      } else if (res?.ok) {
        router.push(next);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPass = async () => {
    const demoEmail = `creator_${Math.floor(1000 + Math.random() * 9000)}@maxmotion.ai`;
    setEmail(demoEmail);
    try {
      setLoading(true);
      setError("");
      const res = await signIn("credentials", {
        email: demoEmail,
        callbackUrl: next,
        redirect: false,
      });
      if (res?.ok) {
        router.push(next);
      }
    } catch (err) {
      setError("Failed to create demo session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-bg-page px-6 text-foreground">
      <div className="relative bg-bg-card border border-glass-border w-full max-w-md rounded-2xl p-8 space-y-6 shadow-2xl animate-scale-up">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-400 text-black flex items-center justify-center text-2xl font-black shadow-lg shadow-amber-400/20">
            M
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
              Sign In to Studio
            </h2>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Access all 5 AI video engines, manage personal API keys, and sequence multi-scene reels.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Email Sign In Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <FaEnvelope className="absolute left-3.5 text-muted text-xs pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3 py-2.5 bg-glass-hover border border-glass-border rounded-xl text-xs text-foreground placeholder:text-muted outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Continue with Email"}
          </button>
        </form>

        {/* Quick Demo Pass Button */}
        <button
          type="button"
          onClick={handleDemoPass}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-amber-400/20 via-amber-400/10 to-transparent hover:from-amber-400/30 border border-amber-400/40 text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <FaBolt className="text-amber-400" />
          <span>Instant Studio Pass (Instant Access)</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px bg-glass-border flex-1" />
          <span className="text-[10px] text-muted uppercase font-bold tracking-wider">or</span>
          <div className="h-px bg-glass-border flex-1" />
        </div>

        {/* Google Provider Button */}
        <button
          onClick={() => signIn("google", { callbackUrl: next })}
          className="w-full py-3 bg-white text-neutral-900 rounded-xl text-xs font-bold flex items-center justify-center gap-3 hover:bg-neutral-100 transition-all shadow-md active:scale-[0.98] cursor-pointer"
        >
          <FaGoogle className="text-sm text-red-500" />
          <span>Continue with Google</span>
        </button>

        <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/10 p-3 rounded-lg text-[11px] leading-relaxed text-muted">
          <FaInfoCircle className="text-primary text-xs shrink-0 mt-0.5" />
          <span>
            10 free creation credits are automatically provisioned on your first login.
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-bg-page text-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
