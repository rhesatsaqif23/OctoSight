import React from "react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export const Stepper = ({ steps, currentStep }: StepperProps) => {
  return (
    <div className="flex items-start justify-between w-full max-w-4xl mx-auto py-2 md:py-4">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isPast = stepNum < currentStep;

        return (
          <div key={step} className="flex flex-col items-center relative flex-1">
            {/* Connecting Line */}
            {index !== steps.length - 1 && (
              <div
                className={cn(
                  "absolute top-5 md:top-6 left-[50%] w-full h-[2px]",
                  isPast ? "bg-primary" : "bg-[#E2E2E2]"
                )}
              />
            )}

            {/* Step Circle */}
            <div
              className={cn(
                "relative z-10 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full font-bold text-base mb-2 transition-colors",
                isActive || isPast
                  ? "bg-primary text-white"
                  : "bg-[#E2E2E2] text-gray-500"
              )}
            >
              {stepNum}
            </div>

            {/* Step Label */}
            <div
              className={cn(
                "text-sm md:text-base font-semibold text-center mt-1 block",
                isActive ? "text-primary" : "text-gray-500"
              )}
            >
              {step}
            </div>
          </div>
        );
      })}
    </div>
  );
};
