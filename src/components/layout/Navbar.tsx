"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const GMA_SITE = "https://honeydew-capybara-608687.hostingersite.com";
const MAIN_APP = process.env.NEXT_PUBLIC_MAIN_APP_URL || "";

const NAV_LINKS = [
  { label: "HOME", href: `${GMA_SITE}/` },
  { label: "SOLUTIONS", href: `${GMA_SITE}/solutions/` },
  { label: "COURSES", href: `${GMA_SITE}/global-mobility-courses/` },
  { label: "ABOUT US", href: `${GMA_SITE}/about-us/` },
  { label: "RESOURCES", href: `${GMA_SITE}/resources/` },
  { label: "DIRECTORY", href: "/services" },
  { label: "CONTACT US", href: `${GMA_SITE}/contact-us/` },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [listingSlug, setListingSlug] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data } = await supabase
          .from("service_registrations")
          .select("slug")
          .eq("user_id", u.id)
          .maybeSingle();
        setListingSlug(data?.slug ?? null);
      }
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (!session) setListingSlug(null);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) {
        setDdOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const listingHref = listingSlug ? `${MAIN_APP}/services/${listingSlug}` : "#";

  return (
    <header className="site-nav">
      <div className="nav-accent" />
      <div className="nav-bar">
        <div className="nav-inner">
          <a
            href={GMA_SITE}
            style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
          >
            <img
              src="https://honeydew-capybara-608687.hostingersite.com/wp-content/uploads/2025/11/GMA-1.png"
              alt="Global Mobility Adviser"
              style={{ height: 28, width: "auto" }}
            />
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <nav className="nav-links">
              {NAV_LINKS.map((l) => (
                <a key={l.label} className="nav-link-item" href={l.href}>
                  {l.label}
                </a>
              ))}
            </nav>

            {/* Auth area */}
            <div
              style={{
                minWidth: 150,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              {!authReady ? (
                <div className="nav-auth-skel" />
              ) : !user ? (
                <Link href="/login" className="nav-btn">
                  SIGN IN{" "}
                  <svg
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
                    />
                  </svg>
                </Link>
              ) : (
                <div className="nav-dd-wrap" ref={ddRef}>
                  <button
                    className="nav-btn"
                    onClick={() => setDdOpen((o) => !o)}
                  >
                    ACCOUNT{" "}
                    <svg
                      className={`nav-chevron${ddOpen ? " open" : ""}`}
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div className={`nav-dropdown${ddOpen ? " open" : ""}`}>
                    <Link className="nav-dd-item" href="/dashboard" onClick={() => setDdOpen(false)}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>
                    <a
                      className="nav-dd-item"
                      href={listingHref}
                      target={listingSlug ? "_blank" : undefined}
                      rel={listingSlug ? "noopener noreferrer" : undefined}
                      onClick={() => setDdOpen(false)}
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      My Listing
                    </a>
                    <Link className="nav-dd-item" href="/services" onClick={() => setDdOpen(false)}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Find a Service
                    </Link>
                    <div className="nav-dd-divider" />
                    <button className="nav-dd-item danger" onClick={handleSignOut}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
