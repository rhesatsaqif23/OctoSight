"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useFileContext } from "@/lib/FileContext";
import { setStep, updateFormData } from "@/modules/report/reportSlice";
import { Stepper } from "@/components/ui/Stepper";
import { Step1ReportType } from "@/components/report/steps/Step1ReportType";
import { Step2Details } from "@/components/report/steps/Step2Details";
import { Step3Evidence } from "@/components/report/steps/Step3Evidence";
import { Step4Confirmation } from "@/components/report/steps/Step4Confirmation";

const STEPS = [
  "Jenis Laporan",
  "Detail Kejadian",
  "Upload Bukti",
  "Konfirmasi",
];

const STEP_CONTENT = {
  1: {
    title: "Step 1: Jenis Laporan",
    description: "Pilih kategori aktivitas mencurigakan yang ingin Anda laporkan.",
  },
  2: {
    title: "Step 2: Detail Kejadian",
    description: "Berikan rincian teknis mengenai indikasi penipuan yang Anda temukan.",
  },
  3: {
    title: "Step 3: Upload Bukti",
    description: "Lampirkan bukti tangkapan layar atau dokumen pendukung lainnya.",
  },
  4: {
    title: "Step 4: Konfirmasi",
    description: "Tinjau kembali laporan Anda sebelum dikirimkan ke tim analis.",
  },
};

// ... inside LaporPage
export default function LaporPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentStep, formData } = useSelector((rootState: RootState) => rootState.report);
  const { evidenceFile, setEvidenceFile } = useFileContext();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // --- Scroll to top on step change ---
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const handleNextStep = (stepData: any) => {
    // SECURITY/REDUX: File objects are non-serializable.
    // We store the actual File in global context and only persist the name in Redux.
    const { evidence, ...serializableData } = stepData;

    if (evidence) {
      setEvidenceFile(evidence);
    }

    dispatch(updateFormData(serializableData));
    dispatch(setStep(currentStep + 1));
  };

  const handleBackStep = () => {
    dispatch(setStep(currentStep - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);

    // Redirect to the success page
    // Note: Cleanup is handled in the SuccessPage's useEffect to avoid flashing Step 1 here
    router.push("/lapor/success");
  };

  const currentInfo = STEP_CONTENT[currentStep as keyof typeof STEP_CONTENT] || STEP_CONTENT[1];

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F9F9] pb-20">
      <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 pt-10 md:pt-14">

        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            {currentInfo.title}
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            {currentInfo.description}
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8 md:mb-12">
          <Stepper steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Dynamic Step Rendering */}
        <div className="transition-all duration-300">
          {currentStep === 1 && (
            <Step1ReportType
              onNext={handleNextStep}
            />
          )}

          {currentStep === 2 && (
            <Step2Details
              reportType={formData.type}
              onNext={handleNextStep}
              onBack={handleBackStep}
            />
          )}

          {currentStep === 3 && (
            <Step3Evidence
              initialData={{ evidence: evidenceFile }}
              onNext={handleNextStep}
              onBack={handleBackStep}
            />
          )}

          {currentStep === 4 && (
            <Step4Confirmation
              onBack={handleBackStep}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep > 4 && (
            <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4">Step {currentStep}</h2>
              <p className="text-gray-600 mb-6">Segera hadir.</p>
              <button
                onClick={handleBackStep}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Kembali
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
