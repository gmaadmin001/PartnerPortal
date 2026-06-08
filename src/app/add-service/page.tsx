"use client";

import { useState } from "react";
import StepIndicator from "@/components/add-service/StepIndicator";
import ServiceStep, { ServiceStepData } from "@/components/add-service/ServiceStep";

export default function AddServicePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceData, setServiceData] = useState<ServiceStepData>({
    registerAs: null,
    primaryCategory: "",
    subCategory: "",
  });

  function handleServiceNext(data: ServiceStepData) {
    setServiceData(data);
    setCurrentStep(2);
  }

  return (
    <div className="bg-white px-4 pb-6">
      <div className="max-w-4xl mx-auto">
        <StepIndicator currentStep={currentStep} />

        {currentStep === 1 && (
          <ServiceStep initial={serviceData} onNext={handleServiceNext} />
        )}

        {currentStep === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-3xl mx-auto text-center text-gray-500">
            Details step coming soon.
          </div>
        )}
      </div>
    </div>
  );
}
