interface Step {
  label: string;
  icon: React.ReactNode;
}

function LockIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

const STEPS: Step[] = [
  { label: "Service",          icon: <LockIcon /> },
  { label: "Details",          icon: <PersonIcon /> },
  { label: "Membership Plans", icon: <CameraIcon /> },
  { label: "Finish",           icon: <CheckIcon /> },
];

interface StepIndicatorProps {
  currentStep: number; // 1-indexed
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const progressPercent = (currentStep / STEPS.length) * 100;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-center text-3xl font-normal uppercase tracking-widest text-gray-800 mb-2">
        Registration
      </h1>
      <p className="text-center text-base font-medium text-black mb-10">
        Fill all form fields to go to next step
      </p>

      {/* Step row */}
      <div className="relative flex items-start justify-between w-full px-6">

        {/* Gray background line — left-0 right-0 protrudes past both end circles */}
        <div className="absolute left-0 right-0 top-7 h-1 bg-gray-300 z-0" />

        {/* Blue active line overlay */}
        <div
          className="absolute left-0 top-7 h-1 bg-gma-primary z-0 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Step circles */}
        {STEPS.map((step, i) => {
          const isActive = i + 1 <= currentStep;
          return (
            <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: isActive ? "#1C66AD" : "#d1d5db" }}
              >
                {step.icon}
              </div>
              <span
                className="text-sm font-semibold"
                style={{ color: isActive ? "#1C66AD" : "#9ca3af" }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
