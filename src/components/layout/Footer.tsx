"use client";

import Link from "next/link";

const sitemapLinks = [
  { label: "Solutions", href: "/solutions" },
  { label: "Education", href: "/courses" },
  { label: "About Us", href: "/about" },
  { label: "Resources", href: "/resources" },
  { label: "Contact Us", href: "/contact" },
];

const policyLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Copyright Policy", href: "/copyright-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];

export default function Footer() {
  return (
    <footer className="bg-gma-sidebar text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        {/* Three-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand + contact */}
          <div>
            <div className="font-heading font-bold text-xl mb-3">
              Global Mobility Adviser
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              At Global Mobility Adviser, we deliver results you can trust, led
              by Michael Ray, an expert in Talent Mobility, Relocation, and
              Remote Work strategies.
            </p>
            <div className="space-y-1 text-sm text-gray-400">
              <div>(623)-290-1143</div>
              <div>contactus@honeydew-capybara-608687.hostingersite.com</div>
            </div>
          </div>

          {/* Site map */}
          <div>
            <div className="font-heading font-semibold text-xs uppercase tracking-widest text-gray-500 mb-4">
              Site Map
            </div>
            <ul className="space-y-2">
              {sitemapLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-gma-blue-light transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <div className="font-heading font-semibold text-xs uppercase tracking-widest text-gray-500 mb-4">
              Policies
            </div>
            <ul className="space-y-2">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-gma-blue-light transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-700 pt-8 pb-6">
          <p className="text-sm font-semibold text-white mb-3">Subscribe now</p>
          <form
            className="flex gap-2 max-w-sm"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-2 rounded-full bg-gray-800 text-white text-sm placeholder-gray-500 border border-gray-600 focus:outline-none focus:border-gma-primary"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-gma-navy text-white text-sm font-medium uppercase tracking-wide hover:bg-gma-blue-mid transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© 2025 Global Mobility Adviser All Rights Reserved</span>
          <a
            href="https://www.linkedin.com/company/global-mobility-adviser"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-gma-blue-light transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
