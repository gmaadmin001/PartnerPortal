"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const BANNED_WORDS = [
  "fuck","shit","ass","bitch","bastard","damn","crap","piss","cock","dick",
  "pussy","cunt","whore","slut","fag","faggot","nigger","nigga","chink",
  "spic","kike","gook","wetback","retard","retarded","tranny","dyke",
  "twat","wank","wanker","jackass","dumbass","asshole","motherfucker",
  "fucker","bullshit","horseshit","shithead","dipshit","douchebag",
];

function containsBannedWord(text: string): string | null {
  const lower = text.toLowerCase().replace(/[^a-z]/g, " ");
  for (const word of BANNED_WORDS) {
    const re = new RegExp(`\\b${word}\\b`);
    if (re.test(lower)) return word;
  }
  return null;
}

interface Props {
  providerId: string;
  reviewerName: string;
}

export default function ReviewForm({ providerId, reviewerName: defaultName }: Props) {
  const router = useRouter();
  const [rating, setRating]         = useState(0);
  const [hovered, setHovered]       = useState(0);
  const [name, setName]             = useState(defaultName);
  const [body, setBody]             = useState("");
  const [profanityWarn, setProfanityWarn] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState<string | null>(null);

  function validate(): boolean {
    const found = containsBannedWord(body) ?? containsBannedWord(name);
    if (found) {
      setProfanityWarn(`Your review contains inappropriate language and cannot be posted.`);
      return false;
    }
    setProfanityWarn(null);
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0 || !body.trim()) return;
    if (!validate()) return;

    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.from("provider_reviews").insert({
      provider_id:   providerId,
      rating,
      reviewer_name: name.trim() || "Anonymous",
      body:          body.trim(),
    });
    setSubmitting(false);

    if (err) {
      setError(err.message);
    } else {
      setSubmitted(true);
      router.refresh();
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">⭐</div>
        <p className="font-bold text-green-800">Review submitted — thank you!</p>
        <p className="text-sm text-green-700 mt-1">Your feedback will appear on this profile shortly.</p>
      </div>
    );
  }

  const displayRating = hovered || rating;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
      <h3 className="font-display font-bold text-gma-navy text-base">Leave a Review</h3>

      {/* Star picker */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="focus:outline-none"
              aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            >
              <svg
                className={`w-8 h-8 transition-colors ${star <= displayRating ? "text-amber-400" : "text-gray-200"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-500 self-center">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          Your Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Smith"
          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-gma-primary transition-colors"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          Your Review <span className="text-red-400 font-normal normal-case tracking-normal">*</span>
        </label>
        <textarea
          rows={4}
          value={body}
          onChange={(e) => { setBody(e.target.value); if (profanityWarn) setProfanityWarn(null); }}
          placeholder="Share your experience working with this company..."
          required
          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-gma-primary transition-colors resize-none"
        />
      </div>

      {/* Profanity warning */}
      {profanityWarn && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-sm font-semibold text-red-700">{profanityWarn}</p>
        </div>
      )}

      {/* Server error */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={rating === 0 || !body.trim() || submitting}
        className="bg-gma-navy text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-gma-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
