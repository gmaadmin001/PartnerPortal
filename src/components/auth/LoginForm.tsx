"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/add-service");
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Enter your email address above, then click Lost Password.");
      return;
    }
    setError(null);
    setResetLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    setResetLoading(false);
    setResetSent(true);
  }

  return (
    <div className="w-full">
      {/* Login card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <form onSubmit={handleLogin} className="px-8 pt-6 pb-4">
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-black mb-6">
            Log In
          </h1>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-base text-black mb-1">
              Username or Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded border border-gma-border bg-white text-base text-black placeholder-gray-400 focus:outline-none focus:border-gma-primary"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-base text-black">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="flex items-center gap-1 text-sm text-black hover:text-gma-primary transition-colors"
              >
                <EyeIcon open={showPassword} />
                {showPassword ? "Hide Password" : "Show Password"}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded border border-gma-border bg-white text-base text-black placeholder-gray-400 focus:outline-none focus:border-gma-primary"
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 mb-5">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-gma-primary"
            />
            <label htmlFor="remember" className="text-base text-black select-none">
              Remember Me
            </label>
          </div>

          {/* Log In button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded bg-gma-primary text-white text-base font-bold uppercase tracking-widest hover:bg-gma-blue-mid transition-colors disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log In"}
          </button>
        </form>

        {/* Lost Password section */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
          {resetSent ? (
            <p className="text-sm text-gma-primary">
              Password reset email sent — check your inbox.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="text-base text-gma-primary hover:text-gma-blue-mid transition-colors disabled:opacity-60"
            >
              {resetLoading ? "Sending…" : "Lost Password?"}
            </button>
          )}
        </div>
      </div>

      {/* OR + Register */}
      <div className="mt-6 text-center text-base text-gray-500 tracking-widest uppercase">
        OR
      </div>
      <a
        href="/add-service"
        className="mt-2 flex w-full items-center justify-center py-3 rounded bg-gma-primary text-white text-base font-bold uppercase tracking-widest hover:bg-gma-blue-mid transition-colors"
      >
        Register
      </a>
    </div>
  );
}
