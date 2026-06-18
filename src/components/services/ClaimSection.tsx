"use client";

import Link from "next/link";

interface Props {
  slug: string;
}

export default function ClaimSection({ slug }: Props) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)",
      border: "1px solid #c7d7f5",
      borderLeft: "4px solid #1C66AD",
      borderRadius: 16,
      padding: "22px 24px",
      display: "flex",
      alignItems: "center",
      gap: 18,
    }}>
      {/* Icon */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: "linear-gradient(135deg, #1E2E61, #1C66AD)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 4px 12px rgba(28,102,173,0.25)",
      }}>
        <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#0a1628", marginBottom: 3 }}>
          Is this your company?
        </p>
        <p style={{ fontSize: 12.5, color: "#5b6a7e", lineHeight: 1.5 }}>
          Claim this listing to manage your profile, update your details, and add photos.
        </p>
      </div>

      {/* CTA */}
      <Link
        href={`/claim/${slug}`}
        style={{
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          background: "linear-gradient(135deg, #1E2E61, #1C66AD)",
          color: "#fff",
          fontSize: 13,
          fontWeight: 700,
          padding: "10px 20px",
          borderRadius: 10,
          textDecoration: "none",
          boxShadow: "0 4px 12px rgba(28,102,173,0.3)",
          whiteSpace: "nowrap" as const,
        }}
      >
        Claim Listing
        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  );
}
