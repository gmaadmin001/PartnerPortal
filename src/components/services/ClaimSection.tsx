"use client";

import Link from "next/link";

interface Props {
  slug: string;
}

export default function ClaimSection({ slug }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center justify-between gap-4">
      <div>
        <p className="font-bold text-gma-navy text-sm">Is this your company?</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Claim this listing to manage your profile, add photos, and respond to reviews.
        </p>
      </div>
      <Link
        href={`/claim/${slug}`}
        className="shrink-0 bg-gma-navy text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gma-primary transition-colors"
      >
        Claim Listing
      </Link>
    </div>
  );
}
