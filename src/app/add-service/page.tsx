"use client";

import { useState } from "react";
import StepIndicator from "@/components/add-service/StepIndicator";
import ServiceStep, { ServiceStepData } from "@/components/add-service/ServiceStep";
import DetailsStep, { DetailsStepData } from "@/components/add-service/DetailsStep";
import MembershipStep, { MembershipStepData } from "@/components/add-service/MembershipStep";
import FinishStep from "@/components/add-service/FinishStep";

export default function AddServicePage() {
  const [currentStep, setCurrentStep] = useState(1);

  const [serviceData, setServiceData] = useState<ServiceStepData>({
    registerAs: null,
    primaryCategory: "",
    subCategory: "",
  });

  const [membershipData, setMembershipData] = useState<MembershipStepData>({ plan: "" });

  const [detailsData, setDetailsData] = useState<DetailsStepData>({
    companyName: "",
    websiteUrl: "",
    shortDescription: "",
    headquartersCountry: "",
    headquartersCity: "",
    countriesServed: [],
    deliveryModel: "",
    companySize: "",
    certifications: "",
    primaryContactName: "",
    primaryContactEmail: "",
    primaryContactPhone: "",
  });

  function handleServiceNext(data: ServiceStepData) {
    setServiceData(data);
    setCurrentStep(2);
  }

  function handleDetailsNext(data: DetailsStepData) {
    setDetailsData(data);
    setCurrentStep(3);
  }

  return (
    <div className="bg-white px-4 pb-6">
      <div className="max-w-7xl mx-auto">
        <StepIndicator currentStep={currentStep} />

        {currentStep === 1 && (
          <ServiceStep initial={serviceData} onNext={handleServiceNext} />
        )}

        {currentStep === 2 && (
          <DetailsStep
            initial={detailsData}
            onNext={handleDetailsNext}
            onPrevious={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <MembershipStep
            initial={membershipData}
            onSelect={(data) => { setMembershipData(data); setCurrentStep(4); }}
            onPrevious={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <FinishStep
            serviceData={serviceData}
            detailsData={detailsData}
            membershipData={membershipData}
            onPrevious={() => setCurrentStep(3)}
          />
        )}
      </div>
    </div>
  );
}
