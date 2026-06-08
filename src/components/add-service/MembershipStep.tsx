"use client";

export interface MembershipStepData {
  plan: string;
}

const PLANS = [
  {
    name: "Free",
    price: "$0.00",
    subtitle: "Everything in Plus, with:",
    features: [
      "Premium PMPro-optimized hosting",
      "1 dedicated site on its own virtual server",
      "Base plan includes 80GB storage, 2 CPUs, and 4GB ram",
      "First month free",
      "Free migration",
      "Built-in object caching (Redis)",
      "Smart page and image optimization",
      "Cloudflare DNS, HTTPS, and CDN",
      "Priority hosting + membership support",
      "SSH and SFTP access",
      "No plugins needed for caching, image compression, or CDNs",
      "Open stack (no lock-in) with optional self-hosting later",
    ],
  },
  {
    name: "Standard",
    price: "$100.00",
    subtitle: "Everything in Standard, plus:",
    features: [
      "2 site license",
      "Priority support",
      "Accept donations",
      "Invite only membership",
      "Member approvals",
      "Member directory & user profiles",
      "Multisite & WordPress Network features",
      "Payment plans by level",
      "Prorated pricing",
      "Recover abandoned carts",
      "Sell gift memberships",
      "Series/content drip-feed",
      "Sponsored or group accounts",
      'Variable "pay what you want" pricing',
    ],
  },
  {
    name: "Premium",
    price: "$200.00",
    subtitle: "Premium Membership Plan",
    features: [
      "1 site license",
      "Premium support",
      "Memberlite theme support",
      "Advanced customization recipes",
      "Automatic updates",
      "Affiliate tracking",
      "Protect custom post types",
      "Email confirmation",
      "Membership cards",
      "Mailing address",
      "Google Analytics + Ecommerce Tracking",
    ],
  },
];

interface MembershipStepProps {
  initial: MembershipStepData;
  onSelect: (data: MembershipStepData) => void;
  onPrevious: () => void;
}

export default function MembershipStep({ initial, onSelect, onPrevious }: MembershipStepProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-3 gap-6 mb-8">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className="flex flex-col rounded-xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 text-center">
              <h3 className="text-2xl font-normal text-gray-900 mb-4">{plan.name}</h3>
              <p className="text-sm font-bold text-gray-800 mb-3">{plan.subtitle}</p>
              <ul className="text-left text-sm text-gray-700 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-gma-primary mt-0.5 shrink-0">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price + CTA */}
            <div className="mt-auto px-6 pb-6 pt-4 text-center">
              <p className="text-2xl font-normal text-gray-900 mb-4">{plan.price}</p>
              <button
                type="button"
                onClick={() => onSelect({ plan: plan.name })}
                className="w-full py-2.5 rounded bg-gma-primary text-white text-base font-normal hover:bg-gma-blue-mid transition-colors"
              >
                Select Plan
              </button>
            </div>
          </div>
        ))}
      </div>

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
