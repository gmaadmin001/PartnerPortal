"use client";

import { useState } from "react";

export default function PhotoCarousel({ photos }: { photos: string[] }) {
  const [idx, setIdx] = useState(0);
  if (!photos.length) return null;

  const prev = () => setIdx((i) => (i === 0 ? photos.length - 1 : i - 1));
  const next = () => setIdx((i) => (i === photos.length - 1 ? 0 : i + 1));

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-100 select-none shadow-md">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[idx]}
        alt={`Gallery photo ${idx + 1}`}
        className="w-full h-80 object-cover"
      />

      {photos.length > 1 && (
        <>
          {/* Bottom gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/40 to-transparent pointer-events-none" />

          {/* Prev button */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full backdrop-blur-sm bg-white/60 border border-white/40 shadow-lg hover:bg-white/80 flex items-center justify-center transition-all"
            aria-label="Previous photo"
          >
            <svg className="w-4 h-4 text-gma-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next button */}
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full backdrop-blur-sm bg-white/60 border border-white/40 shadow-lg hover:bg-white/80 flex items-center justify-center transition-all"
            aria-label="Next photo"
          >
            <svg className="w-4 h-4 text-gma-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Pill dot indicators */}
          <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === idx ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>

          {/* Counter badge — top left */}
          <div className="absolute top-3 left-3 backdrop-blur-sm bg-black/40 border border-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {idx + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
}
