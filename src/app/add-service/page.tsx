"use client";

import { useState } from "react";
import StepIndicator from "@/components/add-service/StepIndicator";
import ServiceStep, { ServiceStepData } from "@/components/add-service/ServiceStep";

export default function AddServicePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const [serviceData, setServiceData] = useState<ServiceStepData>({
    registerAs: null,
    primaryCategory: "",
    subCategory: "",
  });

  async function handleServiceNext(data: ServiceStepData) {
    const res = await fetch("/api/add-service", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: 1,
        register_as: data.registerAs,
        primary_category: data.primaryCategory,
        sub_category: data.subCategory,
      }),
    });

    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error ?? "Failed to save.");
    }

    const json = await res.json();
    setRegistrationId(json.registrationId);
    setServiceData(data);
    setCurrentStep(2);
  }

  return (
    <div className="min-h-screen bg-white px-4 pb-16">
      <div className="max-w-4xl mx-auto">
        <StepIndicator currentStep={currentStep} />

        {currentStep === 1 && (
          <ServiceStep initial={serviceData} onNext={handleServiceNext} />
        )}

        {currentStep === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-3xl mx-auto text-center text-gray-500">
            Details step coming soon. (Registration ID: {registrationId})
          </div>
        )}
      </div>
    </div>
  );
}
