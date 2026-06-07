"use client";

import Image from "next/image";
import { useState } from "react";

const navLinks = [
  { label: "HOME",       href: "https://honeydew-capybara-608687.hostingersite.com/" },
  { label: "SOLUTIONS",  href: "https://honeydew-capybara-608687.hostingersite.com/solutions/" },
  { label: "COURSES",    href: "https://honeydew-capybara-608687.hostingersite.com/global-mobility-courses/" },
  { label: "ABOUT US",   href: "https://honeydew-capybara-608687.hostingersite.com/about-us/" },
  { label: "RESOURCES",  href: "https://honeydew-capybara-608687.hostingersite.com/resources/" },
  { label: "CONTACT US", href: "https://honeydew-capybara-608687.hostingersite.com/contact-us/" },
];

const SIGN_IN_HREF = "https://honeydew-capybara-608687.hostingersite.com/login/";
const LOGO_HREF    = "https://honeydew-capybara-608687.hostingersite.com/";

function PersonIconOutline() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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
        <div className="w-full px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">

            {/* Logo — slightly smaller */}
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

            {/* Desktop — links + Sign In pushed right */}
            <div className="hidden md:flex items-center gap-8">
              <nav className="flex items-center gap-8">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="nav-link text-sm font-bold text-black tracking-widest"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              <a
                href={SIGN_IN_HREF}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gma-navy text-white text-sm font-bold uppercase tracking-widest transition-colors hover:bg-gma-primary"
              >
                SIGN IN
                <PersonIconOutline />
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
                className="py-2 text-sm font-bold text-black hover:text-gma-primary tracking-widest uppercase transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href={SIGN_IN_HREF}
              className="mt-3 flex justify-center items-center gap-2 px-6 py-3 rounded-full bg-gma-navy text-white text-sm font-bold uppercase tracking-widest hover:bg-gma-primary transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              SIGN IN
              <PersonIconOutline />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
