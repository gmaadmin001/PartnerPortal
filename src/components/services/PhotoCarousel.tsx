"use client";

import { useState } from "react";

export default function PhotoCarousel({ photos }: { photos: string[] }) {
  const [idx, setIdx] = useState(0);
  if (!photos.length) return null;

  const prev = () => setIdx((i) => (i === 0 ? photos.length - 1 : i - 1));
  const next = () => setIdx((i) => (i === photos.length - 1 ? 0 : i + 1));

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-100 select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[idx]}
        alt={`Gallery photo ${idx + 1}`}
        className="w-full h-72 object-cover"
      />

      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-colors"
            aria-label="Previous photo"
          >
            <svg className="w-4 h-4 text-gma-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-colors"
            aria-label="Next photo"
          >
            <svg className="w-4 h-4 text-gma-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === idx ? "bg-white" : "bg-white/40"}`}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>
          <div className="absolute top-3 right-3 bg-black/40 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {idx + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
}
