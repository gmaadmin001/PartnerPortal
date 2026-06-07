"use client";

import Image from "next/image";

const sitemapLinks = [
  { label: "Solutions",   href: "https://honeydew-capybara-608687.hostingersite.com/solutions/" },
  { label: "Education",   href: "https://honeydew-capybara-608687.hostingersite.com/global-mobility-courses/" },
  { label: "About Us",    href: "https://honeydew-capybara-608687.hostingersite.com/about-us/" },
  { label: "Resources",   href: "https://honeydew-capybara-608687.hostingersite.com/resources/" },
  { label: "Contact Us",  href: "https://honeydew-capybara-608687.hostingersite.com/contact-us/" },
];

const policyLinks = [
  { label: "Privacy Policy",    href: "#" },
  { label: "Copyright Policy",  href: "#" },
  { label: "Terms of Service",  href: "#" },
];

function PhoneIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto" style={{ backgroundColor: "#1C66AD" }}>
      <div className="w-full px-6 lg:px-10 pt-12 pb-8">

        {/* Main 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_1fr] gap-10 mb-8">

          {/* Col 1 — Brand + subscribe */}
          <div>
            <a href="https://honeydew-capybara-608687.hostingersite.com/" className="inline-block mb-4">
              <Image
                src="https://honeydew-capybara-608687.hostingersite.com/wp-content/uploads/2025/11/GMA-1.png"
                alt="Global Mobility Adviser"
                width={200}
                height={32}
                className="h-7 w-auto"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </a>
            <p className="text-sm text-white leading-relaxed mb-6">
              At Global Mobility Adviser, we deliver results you can trust, led
              by Michael Ray, an expert in Talent Mobility, Relocation, and
              Remote Work strategies.
            </p>

            {/* Subscribe form */}
            <form className="flex gap-0" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your Email Address"
                className="flex-1 min-w-0 px-5 py-3 rounded-l-full bg-white text-gray-700 text-sm placeholder-gray-400 border-0 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-r-full bg-gma-navy text-white text-sm font-bold uppercase tracking-wider whitespace-nowrap hover:bg-gma-blue-mid transition-colors"
              >
                Subscribe Now
              </button>
            </form>
          </div>

          {/* Col 2 — Contact */}
          <div>
            <div className="text-sm font-bold uppercase tracking-widest text-white mb-5">
              Contact
            </div>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <PhoneIcon />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-white mb-1">Phone</div>
                  <div className="text-sm text-white">(623)-290-1143</div>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <EmailIcon />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-white mb-1">Send Us Email</div>
                  <div className="text-sm text-white break-all">
                    contactus@honeydew-capybara-608687.hostingersite.com
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3 — Site Map */}
          <div>
            <div className="text-sm font-bold uppercase tracking-widest text-white mb-5">
              Site Map
            </div>
            <ul className="space-y-3">
              {sitemapLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white hover:text-gma-blue-light transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Policies */}
          <div>
            <div className="text-sm font-bold uppercase tracking-widest text-white mb-5">
              Policies
            </div>
            <ul className="space-y-3">
              {policyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white hover:text-gma-blue-light transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/30 pt-5 flex items-center justify-between gap-3">
          <span className="text-sm text-white">
            © 2025 Global Mobility Adviser All Rights Reserved
          </span>
          <a
            href="https://www.linkedin.com/company/global-mobility-adviser"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-white text-white hover:bg-white hover:text-gma-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>

      </div>
    </footer>
  );
}
