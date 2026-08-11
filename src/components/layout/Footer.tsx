"use client";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-accent" />
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand + subscribe */}
          <div>
            <a href="/" style={{ display: "inline-block", marginBottom: 18 }}>
              <img
                src="/relocentra-logo.png"
                alt="ReloCentra"
                style={{ height: 40, width: "auto", filter: "brightness(0) invert(1)" }}
              />
            </a>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 24 }}>
              ReloCentra is the premier directory connecting businesses with trusted global mobility service providers worldwide.
            </p>
            <p className="footer-col-head" style={{ marginBottom: 10 }}>Stay updated</p>
            <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: 8 }}>
              <input type="email" placeholder="Your email address" className="footer-sub-inp" />
              <button type="submit" className="footer-sub-btn">Subscribe</button>
            </form>
          </div>

          {/* Contact */}
          <div>
            <p className="footer-col-head">Contact</p>
            <a href="tel:6232901143" className="footer-contact-item">
              <div className="footer-contact-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>Phone</p>
                <p style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>(623)-290-1143</p>
              </div>
            </a>
            <a href="mailto:contactus@globalmobilityadviser.com" className="footer-contact-item">
              <div className="footer-contact-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>Email</p>
                <p style={{ fontSize: 13, color: "#fff", fontWeight: 500, wordBreak: "break-all" }}>contactus@globalmobilityadviser.com</p>
              </div>
            </a>
          </div>

          {/* Site Map */}
          <div>
            <p className="footer-col-head">Site Map</p>
            <a className="footer-link" href="/services">Directory</a>
            <a className="footer-link" href="/login">Sign In</a>
            <a className="footer-link" href="/register">Join as Partner</a>
            <a className="footer-link" href="/dashboard">Dashboard</a>
          </div>

          {/* Policies */}
          <div>
            <p className="footer-col-head">Policies</p>
            <a className="footer-link" href="#">Privacy Policy</a>
            <a className="footer-link" href="#">Copyright Policy</a>
            <a className="footer-link" href="#">Terms of Service</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2025 ReloCentra. All rights reserved.</p>
          <a
            href="#"
            className="linkedin-btn"
            aria-label="LinkedIn"
          >
            <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
