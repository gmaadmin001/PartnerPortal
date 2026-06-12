"use client";

import { useState } from "react";

export default function PhotoCarousel({ photos }: { photos: string[] }) {
  const [idx, setIdx] = useState(0);
  if (!photos.length) return null;

  const prev = () => setIdx(i => (i === 0 ? photos.length - 1 : i - 1));
  const next = () => setIdx(i => (i === photos.length - 1 ? 0 : i + 1));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Main image */}
      <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", background: "#0a1628", aspectRatio: "16/9", userSelect: "none" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[idx]}
          alt={`Gallery photo ${idx + 1}`}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity 0.2s" }}
        />

        {/* Bottom gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 40%)", pointerEvents: "none" }} />

        {photos.length > 1 && (
          <>
            {/* Prev */}
            <button
              onClick={prev}
              aria-label="Previous photo"
              style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                width: 38, height: 38, borderRadius: "50%",
                background: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "background 0.2s",
              }}
              onMouseOver={e => (e.currentTarget.style.background = "rgba(255,255,255,0.32)")}
              onMouseOut={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next */}
            <button
              onClick={next}
              aria-label="Next photo"
              style={{
                position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                width: 38, height: 38, borderRadius: "50%",
                background: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "background 0.2s",
              }}
              onMouseOver={e => (e.currentTarget.style.background = "rgba(255,255,255,0.32)")}
              onMouseOut={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Counter badge */}
            <div style={{
              position: "absolute", top: 12, left: 14,
              background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff", fontSize: 11.5, fontWeight: 600,
              padding: "4px 11px", borderRadius: 20,
            }}>
              {idx + 1} / {photos.length}
            </div>

            {/* Dot indicators */}
            <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 6 }}>
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Go to photo ${i + 1}`}
                  style={{
                    height: 7, borderRadius: 4, border: "none", cursor: "pointer",
                    background: i === idx ? "#fff" : "rgba(255,255,255,0.45)",
                    width: i === idx ? 22 : 7,
                    transition: "all 0.3s",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`View photo ${i + 1}`}
              style={{
                flexShrink: 0, width: 72, height: 52, borderRadius: 8, overflow: "hidden", padding: 0, border: "none",
                outline: i === idx ? "2.5px solid #1C66AD" : "2.5px solid transparent",
                outlineOffset: 1, cursor: "pointer", transition: "outline 0.2s, opacity 0.2s",
                opacity: i === idx ? 1 : 0.55,
              }}
              onMouseOver={e => { if (i !== idx) e.currentTarget.style.opacity = "0.8"; }}
              onMouseOut={e => { if (i !== idx) e.currentTarget.style.opacity = "0.55"; }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Thumbnail ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
