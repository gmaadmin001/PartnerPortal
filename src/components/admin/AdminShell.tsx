"use client";

import { createClient } from "@/lib/supabase/client";

interface Props {
  role: string;
  name: string | null;
  email: string;
  activePage: "dashboard" | "registrations" | "claims" | "badges";
  counts?: { registrations?: number; claims?: number; badges?: number };
  children: React.ReactNode;
}

const NAV = [
  {
    section: "Overview",
    items: [
      { key: "dashboard", label: "Dashboard", href: "/admin", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    ],
  },
  {
    section: "Pending",
    items: [
      { key: "registrations", label: "Registrations", href: "/admin/pending/registrations", icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z", countKey: "registrations" },
      { key: "claims", label: "Claims", href: "/admin/pending/claims", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", countKey: "claims" },
      { key: "badges", label: "Badges", href: "/admin/pending/badges", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", countKey: "badges" },
    ],
  },
];

export default function AdminShell({ role, name, email, activePage, counts = {}, children }: Props) {
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f2f7", fontFamily: "'Open Sans', Arial, sans-serif" }}>
      <aside style={{ width: 220, background: "linear-gradient(180deg,#0c1428 0%,#1E2E61 100%)", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: "28px 20px 20px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 4 }}>Partner Portal</p>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", margin: 0 }}>Admin Panel</p>
        </div>

        <div style={{ padding: "0 12px", marginBottom: 8 }}>
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        <nav style={{ padding: "8px 12px", flex: 1 }}>
          {NAV.map(section => (
            <div key={section.section} style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", padding: "0 12px", marginBottom: 4 }}>
                {section.section}
              </p>
              {section.items.map(item => {
                const isActive = activePage === item.key;
                const count = item.countKey ? (counts[item.countKey as keyof typeof counts] ?? 0) : 0;
                return (
                  <a key={item.href} href={item.href}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 12px", borderRadius: 9, textDecoration: "none", color: isActive ? "#fff" : "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600, marginBottom: 2, background: isActive ? "rgba(255,255,255,0.12)" : "transparent" }}
                    onMouseOver={e => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)"; }}
                    onMouseOut={e => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      {item.label}
                    </div>
                    {count > 0 && (
                      <span style={{ fontSize: 10.5, fontWeight: 700, background: "#f59e0b", color: "#fff", borderRadius: 20, padding: "2px 7px", minWidth: 18, textAlign: "center" }}>
                        {count}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>{name ?? email}</p>
          <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", marginBottom: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>{role}</p>
          <button onClick={signOut}
            style={{ width: "100%", padding: "9px 0", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9, color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: "32px 32px 60px" }}>
        {children}
      </main>
    </div>
  );
}
