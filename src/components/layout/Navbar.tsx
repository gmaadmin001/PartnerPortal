"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

const navLinks = [
  { label: "HOME",       href: "https://honeydew-capybara-608687.hostingersite.com/" },
  { label: "SOLUTIONS",  href: "https://honeydew-capybara-608687.hostingersite.com/solutions/" },
  { label: "COURSES",    href: "https://honeydew-capybara-608687.hostingersite.com/global-mobility-courses/" },
  { label: "ABOUT US",   href: "https://honeydew-capybara-608687.hostingersite.com/about-us/" },
  { label: "RESOURCES",  href: "https://honeydew-capybara-608687.hostingersite.com/resources/" },
  { label: "CONTACT US", href: "https://honeydew-capybara-608687.hostingersite.com/contact-us/" },
];

const SIGN_IN_HREF = "/register";
const LOGO_HREF    = "https://honeydew-capybara-608687.hostingersite.com/";

function PersonIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [session, setSession]           = useState<Session | null | undefined>(undefined);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef                     = useRef<HTMLDivElement>(null);
  const router                          = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setDropdownOpen(false);
    router.push("/register");
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="h-1 bg-gma-navy" />

      <div className="bg-white">
        <div className="w-full px-6 lg:px-10">
          <div className="flex items-center justify-between h-24">

            <a href={LOGO_HREF} className="shrink-0">
              <Image
                src="https://honeydew-capybara-608687.hostingersite.com/wp-content/uploads/2025/11/GMA-1.png"
                alt="Global Mobility Adviser"
                width={200}
                height={32}
                priority
                className="h-7 w-auto"
              />
            </a>

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <nav className="flex items-center gap-8">
                {navLinks.map((link) => (
                  <a key={link.label} href={link.href} className="nav-link text-sm font-bold text-black tracking-widest">
                    {link.label}
                  </a>
                ))}
              </nav>

              {/* Auth button */}
              {session === undefined ? (
                <div className="w-32 h-12 rounded-full bg-gray-100 animate-pulse" />
              ) : session ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((o) => !o)}
                    className="flex items-center gap-2 px-6 py-4 rounded-full bg-gma-navy text-white text-sm font-bold uppercase tracking-widest transition-colors hover:bg-gma-primary"
                  >
                    ACCOUNT
                    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gma-surface hover:text-gma-primary transition-colors"
                      >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard?panel=listing"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gma-surface hover:text-gma-primary transition-colors"
                      >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        My Listing
                      </Link>
                      <Link
                        href="/services"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gma-surface hover:text-gma-primary transition-colors"
                      >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Find a Service
                      </Link>
                      <div className="my-1.5 h-px bg-gray-100 mx-2" />
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <a
                  href={SIGN_IN_HREF}
                  className="flex items-center gap-2 px-6 py-4 rounded-full bg-gma-navy text-white text-sm font-bold uppercase tracking-widest transition-colors hover:bg-gma-primary"
                >
                  SIGN IN
                  <PersonIcon />
                </a>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded text-gma-navy"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 shadow-md">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="py-2 text-sm font-bold text-black hover:text-gma-primary tracking-widest uppercase transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="mt-3 flex justify-center items-center gap-2 px-6 py-3 rounded-full bg-gma-navy text-white text-sm font-bold uppercase tracking-widest hover:bg-gma-primary transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  ACCOUNT <PersonIcon />
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); handleSignOut(); }}
                  className="mt-2 flex justify-center items-center gap-2 px-6 py-3 rounded-full border border-red-300 text-red-500 text-sm font-bold uppercase tracking-widest hover:bg-red-50 transition-colors"
                >
                  SIGN OUT
                </button>
              </>
            ) : (
              <a
                href={SIGN_IN_HREF}
                className="mt-3 flex justify-center items-center gap-2 px-6 py-3 rounded-full bg-gma-navy text-white text-sm font-bold uppercase tracking-widest hover:bg-gma-primary transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                SIGN IN <PersonIcon />
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
