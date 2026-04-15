import React, { useState, useEffect, useRef } from "react";
import { ReportOptionCard } from "@/components/report/ReportOptionCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ReportFormContainer } from "../ReportFormContainer";
import { sanitizeInput } from "@/lib/security";
import { Step1Schema } from "@/modules/report/schemas";
import { cn } from "@/lib/utils";
import {
  MessageSquareWarning,
  MailWarning,
  Globe,
  CreditCard,
  PhoneCall,
  ArrowRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { updateFormData } from "@/modules/report/reportSlice";

interface Step1Props {
  onNext: (data: { type: string; modus: string }) => void;
  initialData?: { type: string; modus: string };
}

const REPORT_TYPES = [
  {
    id: "whatsapp_sms",
    title: "Pesan WhatsApp/SMS mencurigakan",
    description: "Penawaran hadiah OTP, atau link palsu via chat.",
    icon: MessageSquareWarning,
  },
  {
    id: "email",
    title: "Email Phishing",
    description: "Email yang meniru institusi resmi Cimb Niaga.",
    icon: MailWarning,
  },
  {
    id: "website",
    title: "Website Palsu",
    description: "Alamat URL yang mencurigakan atau meniru login page.",
    icon: Globe,
  },
  {
    id: "transaction",
    title: "Transaksi Mencurigakan",
    description: "Aktivitas kartu atau transfer yang tidak dikenal.",
    icon: CreditCard,
  },
  {
    id: "phone",
    title: "Panggilan Penipuan",
    description: "Telepon dari pihak yang mengaku petugas bank.",
    icon: PhoneCall,
  },
];

const MODUS_OPTIONS = [
  { value: "hadiah", label: "Penawaran Hadiah Palsu" },
  { value: "otp", label: "Permintaan Kode OTP" },
  { value: "link", label: "Link Berbahaya/Phishing" },
  { value: "akun", label: "Peringatan Pemblokiran Akun" },
  { value: "cs", label: "Menyamar Customer Service" },
  { value: "lainnya", label: "Lainnya" },
];

export const Step1ReportType = ({ onNext, initialData }: Step1Props) => {
  const dispatch = useDispatch();
  const { type: selectedType, modus: selectedModus } = useSelector((state: RootState) => state.report.formData);

  const [isValid, setIsValid] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const setSelectedType = (val: string) => dispatch(updateFormData({ type: val }));
  const setSelectedModus = (val: string) => dispatch(updateFormData({ modus: val }));

  // Refs for scrolling
  const typeSectionRef = useRef<HTMLDivElement>(null);
  const modusSectionRef = useRef<HTMLDivElement>(null);

  // --- Validation Logic ---
  useEffect(() => {
    const result = Step1Schema.safeParse({ type: selectedType, modus: selectedModus });
    setIsValid(result.success);
  }, [selectedType, selectedModus]);

  const handleNext = () => {
    if (isValid) {
      // SECURITY: Final sanitization before passing up
      onNext({
        type: sanitizeInput(selectedType),
        modus: sanitizeInput(selectedModus)
      });
    } else {
      setShowErrors(true);

      // Scroll to the first missing section
      if (!selectedType && typeSectionRef.current) {
        typeSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (!selectedModus && modusSectionRef.current) {
        modusSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <ReportFormContainer title="Pilih Jenis Laporan">
      <div className="space-y-8">
        {/* Report Type Selection */}
        <div ref={typeSectionRef} className="flex flex-col gap-4 scroll-mt-20">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-900">Jenis Laporan</h3>
            {showErrors && !selectedType && (
              <span className="text-sm text-primary font-medium italic animate-pulse">
                *Wajib dipilih
              </span>
            )}
          </div>
          {REPORT_TYPES.map((type) => (
            <ReportOptionCard
              key={type.id}
              title={type.title}
              description={type.description}
              icon={type.icon}
              selected={selectedType === type.id}
              onClick={() => setSelectedType(type.id)}
            />
          ))}
        </div>

        {/* Modus Penipuan Dropdown */}
        <div ref={modusSectionRef} className="scroll-mt-20">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-base font-bold text-gray-900">
              Modus Penipuan
            </label>
            {showErrors && !selectedModus && (
              <span className="text-sm text-primary font-medium italic animate-pulse">
                *Wajib dipilih
              </span>
            )}
          </div>
          <Select
            options={MODUS_OPTIONS}
            value={selectedModus}
            onChange={setSelectedModus}
            placeholder="Pilih modus penipuan.."
            error={showErrors && !selectedModus ? "Mohon pilih salah satu modus" : ""}
          />
        </div>

        {/* Action Button */}
        <div className="pt-4 flex justify-end">
          <Button
            size="md"
            onClick={handleNext}
            className={cn(!isValid && showErrors && "opacity-80")}
            rightIcon={<ArrowRight className="size-5" />}
          >
            Lanjutkan
          </Button>
        </div>
      </div>
    </ReportFormContainer>
  );
};
