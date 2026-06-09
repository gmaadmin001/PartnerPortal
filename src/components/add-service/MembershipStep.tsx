"use client";

import { useState } from "react";

export interface MembershipStepData {
  plan: string;
  billing: "monthly" | "annual";
}

const PLANS = [
  {
    name: "Basic",
    monthlyPrice: null,
    annualPrice: null,
    annualSavings: null,
    subtitle: "Get listed in the directory:",
    features: [
      "Company Name & Website URL",
      "1 Service Category",
      "Service Area: HQ City & State only",
      "Standard search placement",
    ],
    verifiedBadge: null as null | "available" | "included",
    cta: "Get Started Free",
  },
  {
    name: "Professional",
    monthlyPrice: 25,
    annualPrice: 250,
    annualSavings: 50,
    subtitle: "Everything in Basic, plus:",
    features: [
      "Company Description",
      "Company Logo",
      "Contact Details",
      "Up to 3 Service Categories",
      "Service Area: Up to 3 cities, states, or countries",
      "Self-service profile editing",
      "Auto-renewal subscription",
    ],
    verifiedBadge: "available" as null | "available" | "included",
    cta: "Select Professional",
  },
  {
    name: "Premier",
    monthlyPrice: 50,
    annualPrice: 500,
    annualSavings: 100,
    subtitle: "Everything in Professional, plus:",
    features: [
      "Unlimited Service Categories",
      "Unlimited service areas (cities, states, countries, ZIP codes)",
      "Verified Badge — Included",
      "Star Ratings & Reviews",
      "Preferred Search Placement*",
      "Content / Thought Leadership Posting",
      "Media Gallery (photos & documents)",
    ],
    verifiedBadge: "included" as null | "available" | "included",
    cta: "Select Premier",
  },
];

interface MembershipStepProps {
  initial: MembershipStepData;
  onSelect: (data: MembershipStepData) => void;
  onPrevious: () => void;
}

export default function MembershipStep({ initial, onSelect, onPrevious }: MembershipStepProps) {
  const [billing, setBilling] = useState<"monthly" | "annual">(initial.billing ?? "monthly");

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 max-w-6xl mx-auto">

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={`text-sm font-semibold ${billing === "monthly" ? "text-gray-900" : "text-gray-400"}`}>
          Monthly
        </span>
        <button
          type="button"
          onClick={() => setBilling((b) => b === "monthly" ? "annual" : "monthly")}
          className={`relative inline-flex shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${billing === "annual" ? "bg-gma-primary" : "bg-gray-300"}`}
          aria-label="Toggle billing period"
        >
          <span
            className={`inline-block mt-0.5 ml-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${billing === "annual" ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
        <span className={`text-sm font-semibold ${billing === "annual" ? "text-gray-900" : "text-gray-400"}`}>
          Annual
        </span>
        {billing === "annual" && (
          <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
            2 months free
          </span>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {PLANS.map((plan) => {
          const price = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
          const isFree = price === null;

          return (
            <div
              key={plan.name}
              className="flex flex-col rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 text-center border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                {isFree ? (
                  <p className="text-3xl font-light text-gray-900">Free</p>
                ) : (
                  <div>
                    <p className="text-3xl font-light text-gray-900">
                      ${price}
                      <span className="text-base text-gray-400 font-normal">
                        /{billing === "annual" ? "yr" : "mo"}
                      </span>
                    </p>
                    {billing === "annual" && plan.annualSavings && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        Save ${plan.annualSavings} (2 months free)
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="px-6 py-4 flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                  {plan.subtitle}
                </p>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-gma-primary mt-0.5 shrink-0 font-bold">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Verified badge callout */}
                {plan.verifiedBadge === "available" && (
                  <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">Verified Badge</span> available —{" "}
                    <span className="text-gma-primary font-semibold">$100 one-time fee</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="px-6 pb-6 pt-2">
                <button
                  type="button"
                  onClick={() => onSelect({ plan: plan.name, billing })}
                  className="w-full py-2.5 rounded bg-gma-primary text-white text-sm font-semibold uppercase tracking-widest hover:bg-gma-blue-mid transition-colors"
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footnote */}
      <p className="text-xs text-gray-400 text-center mb-6">
        * Preferred placement applies only as a tiebreaker among equally relevant results. Relevance always takes precedence over tier.
      </p>

      <div className="flex justify-start">
        <button
          type="button"
          onClick={onPrevious}
          className="px-8 py-2 rounded bg-gma-primary text-white text-base font-semibold uppercase tracking-widest hover:bg-gma-blue-mid transition-colors"
        >
          Previous
        </button>
      </div>
    </div>
  );
}
