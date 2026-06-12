"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    // Server will verify admin role — just redirect and let /admin handle it
    router.push("/admin");
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0c1428 0%,#1E2E61 60%,#1C66AD 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      {/* Grid texture */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>
        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", marginBottom: 14 }}>
            <svg width="26" height="26" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 6 }}>Partner Portal</p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0 }}>Admin Access</h1>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "36px 32px", boxShadow: "0 24px 64px rgba(0,0,0,0.35)" }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: "#5b6a7e", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #dde3ee", borderRadius: 10, fontSize: 14, color: "#0a1628", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: "#5b6a7e", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #dde3ee", borderRadius: 10, fontSize: 14, color: "#0a1628", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "#dc2626", fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "13px 0", background: loading ? "#94a3b8" : "linear-gradient(135deg,#1E2E61,#1C66AD)", color: "#fff", border: "none", borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 4, transition: "opacity 0.15s" }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
          Global Mobility Adviser · Admin Panel
        </p>
      </div>
    </div>
  );
}
