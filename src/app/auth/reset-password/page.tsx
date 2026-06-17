"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const BAR_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Exchange the access_token + refresh_token from the invite/recovery link hash
  // into a real Supabase session before the user can set their password.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          if (error) {
            setError("Your invite link has expired or is invalid. Please contact support to request a new one.");
          }
          // Clear the tokens from the URL bar without triggering a navigation
          window.history.replaceState(null, "", window.location.pathname);
          setSessionReady(true);
        });
    } else {
      // No hash tokens — check if there's already a valid session (e.g. direct nav)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setSessionReady(true);
        } else {
          setError("No active session found. Please use the link from your invitation email.");
          setSessionReady(true);
        }
      });
    }
  }, []);

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
  const canSubmit = allMet && passwordsMatch && !loading && sessionReady;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
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
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0a1628 0%,#1E2E61 50%,#1C66AD 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 32px 80px rgba(0,0,0,0.35)", maxWidth: 440, width: "100%", padding: "48px 40px", textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#1E2E61,#1C66AD)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 12px 32px rgba(28,102,173,0.35)" }}>
            <svg width="32" height="32" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 800, color: "#0a1628", marginBottom: 8 }}>Password set!</h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 32, lineHeight: 1.6 }}>
            Your password has been updated. You can now sign in to your GMA Partner Portal account.
          </p>
          <button
            onClick={() => router.push("/login")}
            style={{ width: "100%", padding: "13px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#1E2E61,#1C66AD)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em" }}
          >
            Go to Sign In →
          </button>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0a1628 0%,#1E2E61 50%,#1C66AD 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, border: "3px solid rgba(255,255,255,0.2)", borderTopColor: "#43B4E3", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Setting up your session…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0a1628 0%,#1E2E61 50%,#1C66AD 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 32px 80px rgba(0,0,0,0.35)", maxWidth: 460, width: "100%", overflow: "hidden" }}>

        {/* Top branding strip */}
        <div style={{ background: "linear-gradient(135deg,#0a1628,#1E2E61)", padding: "32px 40px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#1C66AD,#43B4E3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 16, fontFamily: "'Space Grotesk',sans-serif" }}>G</span>
            </div>
            <div>
              <p style={{ color: "#fff", fontWeight: 800, fontSize: 12, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1.2 }}>Global Mobility Adviser</p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>Partner Portal</p>
            </div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <svg width="22" height="22" fill="none" stroke="rgba(255,255,255,0.85)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 5 }}>Set your password</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>Choose a strong password to secure your account.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "28px 40px 36px" }}>

          {error && (
            <div style={{ padding: "12px 16px", borderRadius: 10, fontSize: 13, marginBottom: 20, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>
              {error}
            </div>
          )}

          {/* New Password */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", letterSpacing: "0.06em", textTransform: "uppercase" }}>New Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#1C66AD", fontWeight: 600 }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a strong password"
                required
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #dde3ee", fontSize: 14, color: "#0a1628", background: "#fff", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={e => (e.target.style.borderColor = "#1C66AD")}
                onBlur={e => (e.target.style.borderColor = "#dde3ee")}
              />
            </div>

            {/* Strength bars */}
            {password.length > 0 && (
              <>
                <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i < metCount ? BAR_COLORS[metCount - 1] : "#e5e7eb", transition: "background 0.3s" }} />
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", marginTop: 12 }}>
                  {([
                    ["length",    "At least 8 characters"],
                    ["uppercase", "Uppercase letter"],
                    ["lowercase", "Lowercase letter"],
                    ["number",    "Number"],
                    ["special",   "Special character"],
                  ] as [keyof typeof criteria, string][]).map(([key, label]) => {
                    const met = criteria[key];
                    return (
                      <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: met ? "#374151" : "#9ca3af" }}>
                        <span style={{ width: 14, height: 14, borderRadius: "50%", background: met ? "#1C66AD" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
                          {met && <svg width="8" height="8" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" /></svg>}
                        </span>
                        {label}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${confirmPassword && !passwordsMatch ? "#fca5a5" : "#dde3ee"}`, fontSize: 14, color: "#0a1628", background: "#fff", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
              onFocus={e => (e.target.style.borderColor = confirmPassword && !passwordsMatch ? "#fca5a5" : "#1C66AD")}
              onBlur={e => (e.target.style.borderColor = confirmPassword && !passwordsMatch ? "#fca5a5" : "#dde3ee")}
            />
            {confirmPassword && !passwordsMatch && (
              <p style={{ fontSize: 11.5, color: "#dc2626", marginTop: 5 }}>Passwords do not match.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              width: "100%", padding: "13px 0", borderRadius: 10, border: "none",
              background: canSubmit ? "linear-gradient(135deg,#1E2E61,#1C66AD)" : "#e5e7eb",
              color: canSubmit ? "#fff" : "#9ca3af",
              fontSize: 14, fontWeight: 700, cursor: canSubmit ? "pointer" : "not-allowed",
              letterSpacing: "0.04em", transition: "all 0.2s",
            }}
          >
            {loading ? "Updating…" : "Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
