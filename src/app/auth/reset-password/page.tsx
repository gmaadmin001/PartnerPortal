"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const criteria = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number:    /[0-9]/.test(password),
    special:   /[^A-Za-z0-9]/.test(password),
  };
  const metCount = Object.values(criteria).filter(Boolean).length;
  const allMet = metCount === 5;
  const passwordsMatch = password === confirmPassword;
  const canSubmit = allMet && passwordsMatch && !loading;

  const strengthLabel = metCount <= 1 ? "Weak" : metCount <= 3 ? "Fair" : metCount === 4 ? "Strong" : "Very Strong";
  const strengthColor = metCount <= 1 ? "#ef4444" : metCount <= 2 ? "#f97316" : metCount <= 3 ? "#eab308" : metCount === 4 ? "#84cc16" : "#22c55e";
  const strengthWidth = `${(metCount / 5) * 100}%`;

  const inputClass =
    "w-full px-4 py-3 rounded border border-gma-border bg-white text-base text-black focus:outline-none focus:border-gma-primary";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gma-surface flex items-center justify-center px-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-gma-primary flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Updated</h1>
          <p className="text-gray-500 text-sm mb-7">Your password has been changed. You can now sign in with your new password.</p>
          <button
            onClick={() => router.push("/register")}
            className="w-full py-3 rounded bg-gma-primary text-white text-base font-bold tracking-widest hover:bg-gma-blue-mid transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gma-surface flex items-center justify-center px-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden max-w-md w-full">
        <form onSubmit={handleSubmit} className="px-8 pt-8 pb-8">
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-black mb-2">
            Reset Password
          </h1>
          <p className="text-sm text-gray-400 mb-6">Enter a new password for your account.</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          {/* New Password */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-base text-black">New Password</label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-sm text-gma-blue-light hover:text-gma-primary transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              className={inputClass}
            />

            {/* Strength bar */}
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Password strength</span>
                  <span className="font-semibold" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-200">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{ width: strengthWidth, backgroundColor: strengthColor }}
                  />
                </div>
              </div>
            )}

            {/* Requirements checklist */}
            {password.length > 0 && (
              <ul className="mt-3 space-y-1">
                {[
                  { key: "length",    label: "At least 8 characters" },
                  { key: "uppercase", label: "One uppercase letter (A–Z)" },
                  { key: "lowercase", label: "One lowercase letter (a–z)" },
                  { key: "number",    label: "One number (0–9)" },
                  { key: "special",   label: "One special character (!@#$…)" },
                ].map(({ key, label }) => {
                  const met = criteria[key as keyof typeof criteria];
                  return (
                    <li key={key} className="flex items-center gap-2 text-xs">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] shrink-0 ${met ? "bg-gma-primary" : "bg-gray-300"}`}>
                        {met ? "✓" : "✕"}
                      </span>
                      <span className={met ? "text-gray-700" : "text-gray-400"}>{label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-base text-black mb-1">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              className={inputClass}
            />
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 rounded bg-gma-primary text-white text-base font-bold tracking-widest hover:bg-gma-blue-mid transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
