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

function containsBannedWord(text: string): boolean {
  const lower = text.toLowerCase().replace(/[^a-z]/g, " ");
  return BANNED_WORDS.some((w) => new RegExp(`\\b${w}\\b`).test(lower));
}

export interface ExistingReview {
  id: string;
  rating: number;
  body: string | null;
  reviewer_name: string | null;
}

interface Props {
  providerId: string;
  userId: string;
  reviewerName: string;
  existingReview?: ExistingReview;
}

export default function ReviewForm({ providerId, userId, reviewerName: defaultName, existingReview }: Props) {
  const router  = useRouter();
  const isEdit  = !!existingReview;

  const [rating, setRating]       = useState(existingReview?.rating ?? 0);
  const [hovered, setHovered]     = useState(0);
  const [name, setName]           = useState(existingReview?.reviewer_name ?? defaultName);
  const [body, setBody]           = useState(existingReview?.body ?? "");
  const [profanityWarn, setWarn]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [done, setDone]           = useState(false);
  const [deleted, setDeleted]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  function validate(): boolean {
    if (containsBannedWord(body) || containsBannedWord(name)) {
      setWarn(true);
      return false;
    }
    setWarn(false);
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0 || !body.trim()) return;
    if (!validate()) return;

    setSubmitting(true);
    setError(null);
    const supabase = createClient();

    let err;
    if (isEdit) {
      ({ error: err } = await supabase
        .from("provider_reviews")
        .update({ rating, reviewer_name: name.trim() || "Anonymous", body: body.trim() })
        .eq("id", existingReview.id));
    } else {
      ({ error: err } = await supabase
        .from("provider_reviews")
        .insert({ provider_id: providerId, reviewer_user_id: userId, rating, reviewer_name: name.trim() || "Anonymous", body: body.trim() }));
    }

    setSubmitting(false);
    if (err) {
      setError(err.message);
    } else {
      setDone(true);
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!existingReview) return;
    setDeleting(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("provider_reviews")
      .delete()
      .eq("id", existingReview.id);
    setDeleting(false);
    if (err) {
      setError(err.message);
    } else {
      setDeleted(true);
      router.refresh();
    }
  }

  if (deleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
        <p className="font-bold text-gray-600">Your review has been deleted.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">⭐</div>
        <p className="font-bold text-green-800">{isEdit ? "Review updated" : "Review submitted"} — thank you!</p>
        <p className="text-sm text-green-700 mt-1">Your feedback is now visible on this profile.</p>
      </div>
    );
  }

  const displayRating = hovered || rating;
  const ratingLabels  = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-gma-navy text-base">
          {isEdit ? "Your Review" : "Leave a Review"}
        </h3>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete Review"}
          </button>
        )}
      </div>

      {/* Star picker */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Rating</p>
        <div className="flex gap-1 items-center">
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
                fill="currentColor" viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          {displayRating > 0 && (
            <span className="ml-2 text-sm text-gray-500">{ratingLabels[displayRating]}</span>
          )}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Your Name</label>
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
          onChange={(e) => { setBody(e.target.value); if (profanityWarn) setWarn(false); }}
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
          <p className="text-sm font-semibold text-red-700">Your review contains inappropriate language and cannot be posted.</p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={rating === 0 || !body.trim() || submitting}
          className="bg-gma-navy text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-gma-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving…" : isEdit ? "Update Review" : "Submit Review"}
        </button>
      </div>
    </form>
  );
}
