"use client";

import { useState } from "react";

export interface DetailsStepData {
  companyName: string;
  websiteUrl: string;
  shortDescription: string;
  headquartersCountry: string;
  headquartersCity: string;
  countriesServed: string[];
  deliveryModel: string;
  companySize: string;
  certifications: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
}

const COUNTRIES = [
  "Afghanistan","Åland Islands","Albania","Algeria","American Samoa","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
  "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
  "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica",
  "Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt",
  "El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon",
  "Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
  "Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel",
  "Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos",
  "Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi",
  "Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova",
  "Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands",
  "New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau",
  "Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania",
  "Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal",
  "Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea",
  "South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan",
  "Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu",
  "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Venezuela","Vietnam",
  "Yemen","Zambia","Zimbabwe",
];

const DELIVERY_MODEL_OPTIONS = ["Direct", "Aggregator", "Mixed", "Franchise", "Unknown"];
const COMPANY_SIZE_OPTIONS = ["1–50", "51–500", "500+"];

interface DetailsStepProps {
  initial: DetailsStepData;
  onNext: (data: DetailsStepData) => void;
  onPrevious: () => void;
}

export default function DetailsStep({ initial, onNext, onPrevious }: DetailsStepProps) {
  const [companyName, setCompanyName] = useState(initial.companyName);
  const [websiteUrl, setWebsiteUrl] = useState(initial.websiteUrl);
  const [shortDescription, setShortDescription] = useState(initial.shortDescription);
  const [headquartersCountry, setHeadquartersCountry] = useState(initial.headquartersCountry);
  const [headquartersCity, setHeadquartersCity] = useState(initial.headquartersCity);
  const [countriesServed, setCountriesServed] = useState<string[]>(initial.countriesServed);
  const [deliveryModel, setDeliveryModel] = useState(initial.deliveryModel);
  const [companySize, setCompanySize] = useState(initial.companySize);
  const [certifications, setCertifications] = useState(initial.certifications);
  const [primaryContactName, setPrimaryContactName] = useState(initial.primaryContactName);
  const [primaryContactEmail, setPrimaryContactEmail] = useState(initial.primaryContactEmail);
  const [primaryContactPhone, setPrimaryContactPhone] = useState(initial.primaryContactPhone);

  const canProceed =
    companyName.trim() !== "" &&
    websiteUrl.trim() !== "" &&
    shortDescription.trim() !== "" &&
    headquartersCountry !== "" &&
    headquartersCity.trim() !== "" &&
    countriesServed.length > 0 &&
    deliveryModel !== "";

  function toggleCountry(country: string) {
    setCountriesServed((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    );
  }

  function handleNext() {
    if (!canProceed) return;
    onNext({
      companyName,
      websiteUrl,
      shortDescription,
      headquartersCountry,
      headquartersCity,
      countriesServed,
      deliveryModel,
      companySize,
      certifications,
      primaryContactName,
      primaryContactEmail,
      primaryContactPhone,
    });
  }

  const inputClass =
    "w-full px-3 py-2 rounded border border-gma-border bg-white text-base text-black focus:outline-none focus:border-gma-primary";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 max-w-6xl mx-auto">

      {/* Company Name */}
      <div className="mb-4">
        <label className={labelClass}>Company Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Website URL */}
      <div className="mb-4">
        <label className={labelClass}>Website URL <span className="text-red-500">*</span></label>
        <input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Short Description */}
      <div className="mb-4">
        <label className={labelClass}>Short Description <span className="text-red-500">*</span></label>
        <textarea
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          rows={4}
          className={`${inputClass} resize-y`}
        />
      </div>

      {/* Headquarters Country */}
      <div className="mb-4">
        <label className={labelClass}>Headquarters Country <span className="text-red-500">*</span></label>
        <select
          value={headquartersCountry}
          onChange={(e) => setHeadquartersCountry(e.target.value)}
          className={inputClass}
        >
          <option value="">Select Country</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Headquarters City */}
      <div className="mb-4">
        <label className={labelClass}>Headquarters City <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={headquartersCity}
          onChange={(e) => setHeadquartersCity(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Countries Served */}
      <div className="mb-4">
        <label className={labelClass}>Countries Served <span className="text-red-500">*</span></label>
        <div className="rounded border border-gma-border bg-white focus-within:border-gma-primary">
          {/* Chip display area */}
          <div className="min-h-11 px-3 py-2 flex flex-wrap gap-2">
            {countriesServed.length === 0 && (
              <span className="text-gray-400 text-base select-none">Select countries</span>
            )}
            {countriesServed.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-gray-300 bg-white text-sm text-gray-700"
              >
                {c}
                <button
                  type="button"
                  onClick={() => toggleCountry(c)}
                  className="text-gray-400 hover:text-gray-700 leading-none"
                  aria-label={`Remove ${c}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {/* Scrollable country list */}
          <div className="border-t border-gma-border h-40 overflow-y-auto">
            {COUNTRIES.map((c) => {
              const selected = countriesServed.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCountry(c)}
                  className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                    selected
                      ? "bg-gma-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delivery Model */}
      <div className="mb-4">
        <label className={labelClass}>Delivery Model <span className="text-red-500">*</span></label>
        <select
          value={deliveryModel}
          onChange={(e) => setDeliveryModel(e.target.value)}
          className={inputClass}
        >
          <option value="">Select Delivery Model</option>
          {DELIVERY_MODEL_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* Company Size */}
      <div className="mb-4">
        <label className={labelClass}>Company Size</label>
        <select
          value={companySize}
          onChange={(e) => setCompanySize(e.target.value)}
          className={inputClass}
        >
          <option value="">Select Company Size</option>
          {COMPANY_SIZE_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* Certifications */}
      <div className="mb-6">
        <label className={labelClass}>Certifications</label>
        <input
          type="text"
          value={certifications}
          onChange={(e) => setCertifications(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Services Detail section header */}
      <p className="text-sm font-semibold text-gray-700 mb-4">Services Detail</p>

      {/* Primary Contact Name */}
      <div className="mb-4">
        <label className={labelClass}>Primary Contact Name</label>
        <input
          type="text"
          value={primaryContactName}
          onChange={(e) => setPrimaryContactName(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Primary Contact Email */}
      <div className="mb-4">
        <label className={labelClass}>Primary Contact Email</label>
        <input
          type="email"
          value={primaryContactEmail}
          onChange={(e) => setPrimaryContactEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Primary Contact Phone */}
      <div className="mb-8">
        <label className={labelClass}>Primary Contact Phone</label>
        <input
          type="tel"
          value={primaryContactPhone}
          onChange={(e) => setPrimaryContactPhone(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrevious}
          className="px-8 py-2 rounded bg-gma-primary text-white text-base font-semibold uppercase tracking-widest hover:bg-gma-blue-mid transition-colors"
        >
          Previous
        </button>
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
