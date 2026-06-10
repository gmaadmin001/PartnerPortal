"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  providerId: string;
  slug: string;
  isLoggedIn: boolean;
  claimStatus: "none" | "pending" | "rejected";
}

export default function ClaimSection({ providerId, slug, isLoggedIn, claimStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentClaimStatus, setCurrentClaimStatus] = useState(claimStatus);

  async function handleClaim() {
    setStatus("submitting");
    setErrorMsg(null);
    const res = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider_id: providerId }),
    });
    if (res.ok) {
      setCurrentClaimStatus("pending");
      setStatus("done");
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setErrorMsg(j.error ?? "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (currentClaimStatus === "pending") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="font-bold text-amber-800 text-sm">Your claim is under review</p>
          <p className="text-xs text-amber-700 mt-0.5">We'll contact you once an admin has reviewed your request.</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-gma-navy text-sm">Is this your company?</p>
          <p className="text-xs text-gray-500 mt-0.5">Sign in to claim this listing and manage your profile.</p>
        </div>
        <Link
          href={`/register?claim=${slug}`}
          className="shrink-0 bg-gma-navy text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gma-primary transition-colors"
        >
          Claim Listing
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-bold text-gma-navy text-sm">Is this your company?</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {currentClaimStatus === "rejected"
              ? "Your previous claim was not approved. You may submit a new request."
              : "Claim this listing to manage your profile, add photos, and respond to reviews."}
          </p>
        </div>
        <button
          onClick={handleClaim}
          disabled={status === "submitting"}
          className="shrink-0 bg-gma-navy text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gma-primary transition-colors disabled:opacity-50"
        >
          {status === "submitting" ? "Submitting…" : "Claim Listing"}
        </button>
      </div>
      {status === "error" && errorMsg && (
        <p className="text-xs text-red-600 font-semibold mt-3">{errorMsg}</p>
      )}
    </div>
  );
}
