"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "../layout";
import { createClient } from "@/lib/supabase/client";
import { fmtDate } from "@/lib/utils";
import type { Review } from "@/types";

const MAIN_APP = process.env.NEXT_PUBLIC_MAIN_APP_URL || "";

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="14" height="14" fill={i <= rating ? "#f59e0b" : "#e5e7eb"} viewBox="0 0 24 24">
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { reg, loading } = useDashboard();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!reg?.slug) { setReviewsLoading(false); return; }
    const supabase = createClient();
    supabase
      .from("reviews")
      .select("*")
      .eq("service_slug", reg.slug)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setReviews((data as Review[]) ?? []);
        setReviewsLoading(false);
      });
  }, [reg?.slug]);

  function copyLink() {
    const url = reg?.slug ? `${MAIN_APP}/services/${reg.slug}` : window.location.origin;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading || reviewsLoading) {
    return (
      <div className="dash-content">
        <div className="skel" style={{ height: 140, borderRadius: 14, marginBottom: 20 }} />
        <div className="skel" style={{ height: 120, borderRadius: 14, marginBottom: 16 }} />
        <div className="skel" style={{ height: 120, borderRadius: 14 }} />
      </div>
    );
  }

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const profileUrl = reg?.slug ? `${MAIN_APP}/services/${reg.slug}` : "";

  return (
    <div className="dash-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 className="dsp" style={{ fontSize: 22, fontWeight: 800, color: "#0a1628" }}>Client Reviews</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>Feedback from your clients</p>
        </div>
        {profileUrl && (
          <a href={profileUrl} target="_blank" rel="noopener noreferrer"
            style={{ padding: "9px 18px", background: "linear-gradient(135deg,#1E2E61,#1C66AD)", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 7 }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            Share Profile
          </a>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="crd" style={{ borderTop: "3px solid #f59e0b", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <p className="dsp" style={{ fontSize: 48, fontWeight: 800, color: "#0a1628", lineHeight: 1 }}>
                {avgRating.toFixed(1)}
              </p>
              <Stars rating={Math.round(avgRating)} />
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              {[5,4,3,2,1].map(star => {
                const count = reviews.filter(r => r.rating === star).length;
                const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", width: 16, textAlign: "right" }}>{star}</span>
                    <svg width="10" height="10" fill="#f59e0b" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                    <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "#f59e0b", borderRadius: 3, transition: "width 0.4s" }} />
                    </div>
                    <span style={{ fontSize: 11, color: "#9ca3af", width: 20 }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {reviews.length === 0 && (
        <div className="crd" style={{ textAlign: "center", padding: "64px 24px" }}>
          <div className="empty-icon" style={{ fontSize: 32 }}>⭐</div>
          <h3 className="dsp" style={{ fontSize: 18, fontWeight: 700, color: "#0a1628", marginBottom: 8 }}>No reviews yet</h3>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24, maxWidth: 360, margin: "0 auto 24px" }}>
            Share your profile page with clients to start collecting reviews.
          </p>
          <button
            onClick={copyLink}
            style={{ padding: "10px 22px", background: "linear-gradient(135deg,#1E2E61,#1C66AD)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            {copied ? "Copied!" : "Copy Profile Link"}
          </button>
        </div>
      )}

      {reviews.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {reviews.map(r => (
            <div key={r.id} className="crd">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0a1628" }}>{r.reviewer_name || "Anonymous"}</p>
                  {r.reviewer_company && <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{r.reviewer_company}</p>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <Stars rating={r.rating} />
                  <p style={{ fontSize: 11, color: "#9ca3af" }}>{fmtDate(r.created_at)}</p>
                </div>
              </div>
              {r.body && <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6 }}>{r.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
