"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const MAIN_APP = process.env.NEXT_PUBLIC_MAIN_APP_URL || "";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.href = "/dashboard";
    });

    const sp = new URLSearchParams(window.location.search);
    const hp = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (sp.get("error") === "auth_callback_error") {
      const msg =
        hp.get("error_code") === "otp_expired"
          ? "Your reset link has expired. Enter your email and click Forgot password."
          : "Authentication error. Please try again.";
      setErr(msg);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setInfo("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) {
      setErr(error.message);
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  }

  async function handleForgot() {
    if (!email) { setErr("Enter your email address first."); return; }
    setErr(""); setInfo("");
    await fetch(`${MAIN_APP}/api/request-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?type=recovery`,
    });
    setInfo("Reset email sent — check your inbox.");
  }

  return (
    <main className="login-area">
      <div className="blob1" />
      <div className="blob2" />
      <div className="blob3" />

      <div className="auth-card">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#1E2E61,#1C66AD)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="dsp" style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>G</span>
          </div>
          <div>
            <p className="dsp" style={{ fontWeight: 700, fontSize: 13.5, color: "#111", lineHeight: 1.15 }}>Global Mobility Adviser</p>
            <p style={{ fontSize: 10.5, color: "#9ca3af", lineHeight: 1.2 }}>Partner Portal</p>
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h1 className="dsp" style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>Welcome back</h1>
          <p style={{ fontSize: 13.5, color: "#6b7280", marginTop: 5 }}>Sign in to your partner account</p>
        </div>

        {err && (
          <div className="auth-alert auth-alert-err">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{err}</span>
          </div>
        )}
        {info && (
          <div className="auth-alert auth-alert-info">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{info}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#4b5563", marginBottom: 6 }}>
              Email address
            </label>
            <div className="auth-inp-wrap">
              <span className="auth-inp-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                className="auth-inp"
                type="email"
                required
                placeholder="you@company.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "#4b5563" }}>Password</label>
              <button
                type="button"
                onClick={handleForgot}
                style={{ fontSize: 12, fontWeight: 600, color: "#1C66AD", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Forgot password?
              </button>
            </div>
            <div className="auth-inp-wrap">
              <span className="auth-inp-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                className="auth-inp"
                type={showPw ? "text" : "password"}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex" }}
              >
                {showPw ? (
                  <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            className="auth-btn auth-btn-main"
            type="submit"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="auth-divider"><span>OR</span></div>
        <Link href="/register" style={{ display: "block", textDecoration: "none" }}>
          <button className="auth-btn auth-btn-outline">Create a Partner Account</button>
        </Link>
        <p style={{ textAlign: "center", fontSize: 11.5, color: "rgba(0,0,0,0.2)", marginTop: 24 }}>
          Global Mobility Adviser · Partner Portal
        </p>
      </div>
    </main>
  );
}
