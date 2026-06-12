"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "../layout";
import { createClient } from "@/lib/supabase/client";

function Toast({ msg, type = "info" }: { msg: string; type?: "info" | "success" | "error" }) {
  const bg = type === "error" ? "#dc2626" : type === "success" ? "#16a34a" : "#1E2E61";
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, background: bg, color: "#fff", padding: "12px 22px", borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 9999 }}>
      {msg}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="toggle-slider" />
    </label>
  );
}

export default function SettingsPage() {
  const { user, loading } = useDashboard();
  const router = useRouter();
  const supabase = createClient();

  const [toast, setToast] = useState<{ msg: string; type: "info" | "success" | "error" } | null>(null);
  const [notifs, setNotifs] = useState({ reviews: true, digest: true, product: false });
  const [resetting, setResetting] = useState(false);

  function showToast(msg: string, type: "info" | "success" | "error" = "info") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleResetPassword() {
    if (!user?.email) return;
    setResetting(true);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${siteUrl}/auth/callback?type=recovery`,
    });
    setResetting(false);
    if (error) {
      showToast("Could not send reset email. Try again.", "error");
    } else {
      showToast("Password reset email sent — check your inbox.", "success");
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="dash-content">
        <div className="skel" style={{ height: 160, borderRadius: 14, marginBottom: 20 }} />
        <div className="skel" style={{ height: 160, borderRadius: 14, marginBottom: 20 }} />
        <div className="skel" style={{ height: 160, borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div className="dash-content">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div style={{ marginBottom: 24 }}>
        <h1 className="dsp" style={{ fontSize: 22, fontWeight: 800, color: "#0a1628" }}>Settings</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>Manage your account and preferences</p>
      </div>

      {/* Account Info */}
      <div className="crd" style={{ borderTop: "3px solid #1C66AD", marginBottom: 20 }}>
        <div className="crd-title">
          <div className="crd-title-icon" style={{ background: "#eff6ff" }}>
            <svg width="14" height="14" fill="none" stroke="#1C66AD" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </div>
          Account Info
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#5b6a7e", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>Email Address</label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              style={{ width: "100%", maxWidth: 440, padding: "10px 14px", border: "1.5px solid #dde3ee", borderRadius: 10, fontSize: 14, color: "#374151", background: "#f9fafb", outline: "none" }}
            />
            <p style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 5 }}>To change your email, contact support.</p>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="crd" style={{ borderTop: "3px solid #7c3aed", marginBottom: 20 }}>
        <div className="crd-title">
          <div className="crd-title-icon" style={{ background: "#f5f3ff" }}>
            <svg width="14" height="14" fill="none" stroke="#7c3aed" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          Security
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#0a1628" }}>Password</p>
            <p style={{ fontSize: 12.5, color: "#6b7280", marginTop: 2 }}>Send a password reset link to your email address.</p>
          </div>
          <button
            onClick={handleResetPassword}
            disabled={resetting}
            style={{ padding: "9px 20px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: resetting ? "not-allowed" : "pointer", opacity: resetting ? 0.6 : 1 }}
          >
            {resetting ? "Sending…" : "Reset Password"}
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="crd" style={{ borderTop: "3px solid #16a34a", marginBottom: 20 }}>
        <div className="crd-title">
          <div className="crd-title-icon" style={{ background: "#f0fdf4" }}>
            <svg width="14" height="14" fill="none" stroke="#16a34a" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          </div>
          Notification Preferences
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {[
            { key: "reviews" as const, label: "New Reviews", desc: "Get notified when a client leaves a review on your profile." },
            { key: "digest" as const, label: "Weekly Digest", desc: "Receive a weekly summary of your listing activity." },
            { key: "product" as const, label: "Product Updates", desc: "News about new features and platform improvements." },
          ].map(n => (
            <div key={n.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#0a1628" }}>{n.label}</p>
                <p style={{ fontSize: 12.5, color: "#6b7280", marginTop: 2 }}>{n.desc}</p>
              </div>
              <Toggle checked={notifs[n.key]} onChange={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))} />
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="crd" style={{ borderTop: "3px solid #ef4444" }}>
        <div className="crd-title">
          <div className="crd-title-icon" style={{ background: "#fef2f2" }}>
            <svg width="14" height="14" fill="none" stroke="#ef4444" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          Danger Zone
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#0a1628" }}>Sign Out</p>
            <p style={{ fontSize: 12.5, color: "#6b7280", marginTop: 2 }}>Sign out of your partner account on this device.</p>
          </div>
          <button
            onClick={handleSignOut}
            style={{ padding: "9px 20px", background: "#fef2f2", color: "#ef4444", border: "1.5px solid #fecaca", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
