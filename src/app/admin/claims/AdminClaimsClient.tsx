"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Claim } from "./page";

export default function AdminClaimsClient({ claims: initial }: { claims: Claim[] }) {
  const router = useRouter();
  const [claims, setClaims] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(provider_id: string, action: "approve" | "reject") {
    setBusy(provider_id);
    setError(null);
    const res = await fetch(`/api/admin/${action}-claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider_id }),
    });
    setBusy(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Something went wrong.");
    } else {
      setClaims((c) => c.filter((r) => r.id !== provider_id));
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-gma-surface py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-gma-navy">Pending Claims</h1>
            <p className="text-sm text-gray-500 mt-1">{claims.length} claim{claims.length !== 1 ? "s" : ""} awaiting review</p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-gma-primary hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {claims.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
            <p className="text-4xl mb-4">✅</p>
            <h3 className="font-display text-lg font-bold text-gma-navy mb-1">No pending claims</h3>
            <p className="text-sm text-gray-500">All caught up.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div key={claim.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-bold text-gma-navy text-sm truncate">{claim.company_name ?? "(Unnamed listing)"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Claimed by <span className="font-semibold text-gray-700">{claim.claimant_email ?? claim.claimed_by}</span>
                    {claim.claimed_at && (
                      <> · {new Date(claim.claimed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</>
                    )}
                  </p>
                  {claim.slug && (
                    <Link
                      href={`/services/${claim.slug}`}
                      target="_blank"
                      className="text-xs text-gma-primary hover:underline mt-0.5 inline-block"
                    >
                      View listing ↗
                    </Link>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => act(claim.id, "approve")}
                    disabled={busy === claim.id}
                    className="px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {busy === claim.id ? "…" : "Approve"}
                  </button>
                  <button
                    onClick={() => act(claim.id, "reject")}
                    disabled={busy === claim.id}
                    className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {busy === claim.id ? "…" : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
