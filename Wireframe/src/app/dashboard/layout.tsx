"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { ServiceRegistration } from "@/types";

const MAIN_APP = process.env.NEXT_PUBLIC_MAIN_APP_URL || "";

interface DashboardCtx {
  user: User | null;
  reg: ServiceRegistration | null;
  loading: boolean;
  noListing: boolean;
}
const DashboardContext = createContext<DashboardCtx>({
  user: null, reg: null, loading: true, noListing: false,
});
export function useDashboard() { return useContext(DashboardContext); }

const NAV_ITEMS = [
  {
    section: "Main",
    items: [
      { href: "/dashboard", label: "Overview", icon: <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
      { href: "/dashboard/profile", label: "Company Profile", icon: <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg> },
      { href: null, label: "My Listing", external: true, id: "my-listing", icon: <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
    ],
  },
  {
    section: "Account",
    items: [
      { href: "/dashboard/plans", label: "Membership Plans", icon: <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> },
      { href: "/dashboard/settings", label: "Settings", icon: <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [reg, setReg] = useState<ServiceRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [noListing, setNoListing] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }
      setUser(session.user);

      const { data, error } = await supabase
        .from("service_registrations")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      setLoading(false);
      if (error || !data) { setNoListing(true); return; }
      setReg(data as ServiceRegistration);
    }
    init();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initial = (reg?.company_name ?? "?")[0].toUpperCase();
  const listingHref = reg?.slug ? `${MAIN_APP}/services/${reg.slug}` : null;

  return (
    <DashboardContext.Provider value={{ user, reg, loading, noListing }}>
      <div className="page-wrapper">
        {/* Sidebar */}
        <aside className="sidebar">
          {/* Company header */}
          <div className="sb-company-header">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#1C66AD,#43B4E3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span className="dsp" style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>
                {loading ? "?" : initial}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="dsp" style={{ color: "#fff", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.2 }}>
                {loading ? "Loading…" : reg?.company_name ?? "Your Company"}
              </p>
              <p style={{ color: "#43B4E3", fontSize: 11, fontWeight: 500, marginTop: 2 }}>
                {reg?.membership_plan ?? "—"}
              </p>
            </div>
          </div>

          {/* Preview link */}
          <a
            href={listingHref ?? undefined}
            target={listingHref ? "_blank" : undefined}
            rel={listingHref ? "noopener noreferrer" : undefined}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 20px 14px", fontSize: 11.5, color: "rgba(255,255,255,0.38)", textDecoration: "none", transition: "color 0.15s" }}
            onMouseOver={e => (e.currentTarget.style.color = "#43B4E3")}
            onMouseOut={e => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
          >
            <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            Preview Page
          </a>

          {/* Nav items */}
          <nav className="sb-nav">
            {NAV_ITEMS.map(group => (
              <div key={group.section}>
                <div className="nav-section">{group.section}</div>
                {group.items.map(item => {
                  if (item.external) {
                    return (
                      <a
                        key={item.label}
                        href={listingHref ?? undefined}
                        target={listingHref ? "_blank" : undefined}
                        className="nav-item"
                        style={{ opacity: listingHref ? 1 : 0.4, pointerEvents: listingHref ? "auto" : "none" }}
                      >
                        {item.icon}
                        {item.label}
                      </a>
                    );
                  }
                  const active = item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href!);
                  return (
                    <Link
                      key={item.label}
                      href={item.href!}
                      className={`nav-item${active ? " active" : ""}`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Bottom: sign out */}
          <div className="sb-bottom">
            <button className="signout-btn" onClick={handleSignOut}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main area */}
        <div className="dash-main">
          {children}
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
