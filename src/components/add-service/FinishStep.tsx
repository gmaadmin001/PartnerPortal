"use client";

import { useState } from "react";
import Link from "next/link";
import type { ServiceStepData } from "./ServiceStep";
import type { DetailsStepData } from "./DetailsStep";
import type { MembershipStepData } from "./MembershipStep";

interface FinishStepProps {
  serviceData: ServiceStepData;
  detailsData: DetailsStepData;
  membershipData: MembershipStepData;
  onPrevious: () => void;
}

export default function FinishStep({ serviceData, detailsData, membershipData, onPrevious }: FinishStepProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const criteria = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number:    /[0-9]/.test(password),
    special:   /[^A-Za-z0-9]/.test(password),
  };
  const metCount = Object.values(criteria).filter(Boolean).length;
  const allMet = metCount === 5;
  const passwordsMatch = password === confirmPassword;
  const canSubmit = allMet && passwordsMatch && !loading;

  const strengthLabel = metCount <= 1 ? "Weak" : metCount <= 3 ? "Fair" : metCount === 4 ? "Strong" : "Very Strong";
  const strengthColor = metCount <= 1 ? "#ef4444" : metCount <= 2 ? "#f97316" : metCount <= 3 ? "#eab308" : metCount === 4 ? "#84cc16" : "#22c55e";
  const strengthWidth = `${(metCount / 5) * 100}%`;

  async function handleSubmit() {
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/finish-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: detailsData.primaryContactEmail,
          password,
          registerAs: serviceData.registerAs,
          primaryCategory: serviceData.primaryCategory,
          subCategory: serviceData.subCategory,
          companyName: detailsData.companyName,
          websiteUrl: detailsData.websiteUrl,
          shortDescription: detailsData.shortDescription,
          headquartersCountry: detailsData.headquartersCountry,
          headquartersCity: detailsData.headquartersCity,
          countriesServed: detailsData.countriesServed,
          deliveryModel: detailsData.deliveryModel,
          companySize: detailsData.companySize,
          certifications: detailsData.certifications,
          primaryContactName: detailsData.primaryContactName,
          primaryContactEmail: detailsData.primaryContactEmail,
          primaryContactPhone: detailsData.primaryContactPhone,
          membershipPlan: membershipData.plan,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 rounded border border-gma-border bg-white text-base text-black focus:outline-none focus:border-gma-primary";

  if (success) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-12 max-w-6xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-gma-primary flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </div>
        <h2 className="text-3xl font-normal text-gray-900 mb-3">Account Created!</h2>
        <p className="text-gray-500 text-base mb-2">
          Welcome to the GMA Partner Portal, <strong>{detailsData.companyName}</strong>.
        </p>
        <p className="text-gray-500 text-base mb-8">
          You&apos;re registered as a <strong>{serviceData.registerAs}</strong> on the <strong>{membershipData.plan}</strong> plan.
        </p>
        <Link
          href="/register"
          className="inline-block px-10 py-3 rounded bg-gma-primary text-white text-base font-semibold uppercase tracking-widest hover:bg-gma-blue-mid transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 max-w-6xl mx-auto">

      {/* Summary */}
      <h2 className="text-2xl font-normal text-gray-800 mb-6">Review &amp; Create Account</h2>

      <div className="grid grid-cols-3 gap-4 mb-8 p-5 rounded-xl bg-gma-surface border border-gray-200 text-sm">
        <div>
          <p className="text-gray-400 uppercase tracking-widest text-xs mb-1">Registering as</p>
          <p className="font-semibold text-gray-800 capitalize">{serviceData.registerAs}</p>
        </div>
        <div>
          <p className="text-gray-400 uppercase tracking-widest text-xs mb-1">Company</p>
          <p className="font-semibold text-gray-800">{detailsData.companyName}</p>
        </div>
        <div>
          <p className="text-gray-400 uppercase tracking-widest text-xs mb-1">Plan</p>
          <p className="font-semibold text-gray-800">{membershipData.plan}</p>
        </div>
      </div>

      {/* Email (read-only) */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={detailsData.primaryContactEmail}
          readOnly
          className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`}
        />
        <p className="text-xs text-gray-400 mt-1">This is your login email from the Details step.</p>
      </div>

      {/* Password */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Create Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium"
            style={{ color: "#43B4E3" }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Strength bar */}
        {password.length > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Password strength</span>
              <span className="font-semibold" style={{ color: strengthColor }}>{strengthLabel}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-200">
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: strengthWidth, backgroundColor: strengthColor }}
              />
            </div>
          </div>
        )}

        {/* Requirements checklist */}
        {password.length > 0 && (
          <ul className="mt-3 space-y-1">
            {[
              { key: "length",    label: "At least 8 characters" },
              { key: "uppercase", label: "One uppercase letter (A–Z)" },
              { key: "lowercase", label: "One lowercase letter (a–z)" },
              { key: "number",    label: "One number (0–9)" },
              { key: "special",   label: "One special character (!@#$…)" },
            ].map(({ key, label }) => {
              const met = criteria[key as keyof typeof criteria];
              return (
                <li key={key} className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] shrink-0 ${met ? "bg-gma-primary" : "bg-gray-300"}`}>
                    {met ? "✓" : "✕"}
                  </span>
                  <span className={met ? "text-gray-700" : "text-gray-400"}>{label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Confirm Password */}
      <div className="mb-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <input
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          className={inputClass}
        />
        {confirmPassword && !passwordsMatch && (
          <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onPrevious}
          className="px-8 py-2 rounded bg-gma-primary text-white text-base font-semibold uppercase tracking-widest hover:bg-gma-blue-mid transition-colors"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="px-8 py-2 rounded bg-gma-primary text-white text-base font-semibold uppercase tracking-widest hover:bg-gma-blue-mid transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account…" : "Create Account"}
        </button>
      </div>
    </div>
  );
}
