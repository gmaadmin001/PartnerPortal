"use client";

import Image from "next/image";
import { useState } from "react";

const navLinks = [
  { label: "HOME", href: "https://honeydew-capybara-608687.hostingersite.com/" },
  { label: "SOLUTIONS", href: "https://honeydew-capybara-608687.hostingersite.com/solutions/" },
  { label: "COURSES", href: "https://honeydew-capybara-608687.hostingersite.com/global-mobility-courses/" },
  { label: "ABOUT US", href: "https://honeydew-capybara-608687.hostingersite.com/about-us/" },
  { label: "RESOURCES", href: "https://honeydew-capybara-608687.hostingersite.com/resources/" },
  { label: "CONTACT US", href: "https://honeydew-capybara-608687.hostingersite.com/contact-us/" },
];

const SIGN_IN_HREF = "https://honeydew-capybara-608687.hostingersite.com/login/";
const LOGO_HREF = "https://honeydew-capybara-608687.hostingersite.com/";

function PersonIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Top accent border */}
      <div className="h-1 bg-gma-navy" />

      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <a href={LOGO_HREF} className="shrink-0">
              <Image
                src="https://honeydew-capybara-608687.hostingersite.com/wp-content/uploads/2025/11/GMA-1.png"
                alt="Global Mobility Adviser"
                width={220}
                height={36}
                priority
                className="h-9 w-auto"
              />
            </a>

            {/* Desktop — links + Sign In pushed to the right */}
            <div className="hidden md:flex items-center gap-8">
              <nav className="flex items-center gap-6">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="nav-link text-xs font-bold text-gma-navy tracking-widest"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              <a
                href={SIGN_IN_HREF}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-gma-primary text-white text-xs font-bold uppercase tracking-widest transition-colors hover:bg-gma-blue-mid"
              >
                SIGN IN
                <PersonIcon />
              </a>
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
                className="py-2 text-xs font-bold text-gma-navy hover:text-gma-primary tracking-widest uppercase transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href={SIGN_IN_HREF}
              className="mt-3 flex justify-center items-center gap-2 px-5 py-2 rounded-full bg-gma-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-gma-blue-mid transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              SIGN IN
              <PersonIcon />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
