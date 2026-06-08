"use client";

import { useState } from "react";

export interface ServiceStepData {
  registerAs: "vendor" | "realtor" | null;
  primaryCategory: string;
  subCategory: string;
}

const CATEGORY_MAP: Record<string, string[]> = {
  "Getting Established at the Destination": [
    "Destination Services Providers (DSPs)",
    "School Search & Education Consultants",
  ],
  "Health, Safety & Security": [
    "International Health Insurance",
    "Travel Health & Medical Services",
    "Travel Risk & Security Services",
  ],
  "Housing & Accommodation": [
    "Corporate Housing / Temporary Accommodations",
    "Furniture & Appliance Rental",
    "Home Sale Program Administrators",
    "Property Management Services",
    "Real Estate Brokers & Agents",
    "Title, Appraisal & Closing Services",
  ],
  "Immigration & Work Authorization": [
    "Corporate Immigration Service Providers",
    "Document & Credential Services",
    "Immigration Law Firms",
  ],
  "Moving Belongings": [
    "Freight Forwarders",
    "Household Goods Movers",
    "Pet Relocation Specialists",
    "Vehicle Transport Specialists",
  ],
  "Program Management & Outsourcing": [
    "Lump Sum / Flex Program Administrators",
    "Move Coordination Specialists",
    "Relocation Management Companies (RMCs)",
  ],
  "Strategy, Policy & Advisory": [
    "Benchmarking & Data Service",
    "Mobility Consulting Firms",
  ],
  "Supporting Employees & Families": [
    "Executive Coaching",
    "Intercultural & Cross-Cultural Training",
    "Language Training Providers",
    "Mental Health & Wellbeing Services",
    "Spouse & Partner Career Services",
  ],
  "Tax, Payroll & Compensation": [
    "Compensation & Benefits Consulting",
    "Employer of Record / PEO Services",
    "Expatriate Tax Services",
    "Global Payroll Providers",
  ],
  "Technology & Data": [
    "Compliance & Tracking Tools",
    "Cost of Living & Hardship Data",
    "Expense Management Software",
    "Immigration Technology",
    "Mobility Management Platforms",
    "Tax Technology Platforms",
  ],
};

interface ServiceStepProps {
  initial: ServiceStepData;
  onNext: (data: ServiceStepData) => void;
}

export default function ServiceStep({ initial, onNext }: ServiceStepProps) {
  const [registerAs, setRegisterAs] = useState<"vendor" | "realtor" | null>(initial.registerAs);
  const [primaryCategory, setPrimaryCategory] = useState(initial.primaryCategory);
  const [subCategory, setSubCategory] = useState(initial.subCategory);
  const subCategories = primaryCategory ? CATEGORY_MAP[primaryCategory] ?? [] : [];
  const canProceed = registerAs !== null && primaryCategory !== "" && subCategory !== "";

  function handlePrimaryChange(val: string) {
    setPrimaryCategory(val);
    setSubCategory("");
  }

  function handleNext() {
    if (!canProceed) return;
    onNext({ registerAs, primaryCategory, subCategory });
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 max-w-6xl mx-auto">
      {/* Register As */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1C66AD" }}>
          Register As
        </h2>
        <div className="flex justify-center gap-4">
          {(["vendor", "realtor"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setRegisterAs(type)}
              className="px-8 py-2 rounded border-2 text-sm font-bold uppercase tracking-widest transition-colors"
              style={{
                borderColor: "#1C66AD",
                backgroundColor: registerAs === type ? "#1C66AD" : "transparent",
                color: registerAs === type ? "#ffffff" : "#1C66AD",
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Category */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Primary Category <span className="text-red-500">*</span>
        </label>
        <select
          value={primaryCategory}
          onChange={(e) => handlePrimaryChange(e.target.value)}
          className="w-full px-3 py-2 rounded border border-gma-border bg-white text-base text-black focus:outline-none focus:border-gma-primary"
        >
          <option value="">Select Service</option>
          {Object.keys(CATEGORY_MAP).map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Sub Category */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Sub Category <span className="text-red-500">*</span>
        </label>
        <select
          value={subCategory}
          onChange={(e) => setSubCategory(e.target.value)}
          disabled={!primaryCategory}
          className="w-full px-3 py-2 rounded border border-gma-border bg-white text-base text-black focus:outline-none focus:border-gma-primary disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">Select Child Service</option>
          {subCategories.map((sub) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
      </div>

      {/* Next button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className="px-8 py-2 rounded bg-gma-primary text-white text-base font-semibold uppercase tracking-widest hover:bg-gma-blue-mid transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
