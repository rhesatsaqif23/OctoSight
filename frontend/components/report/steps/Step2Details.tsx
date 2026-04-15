import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { ArrowRight } from "lucide-react";
import { sanitizeInput } from "@/lib/security";
import { Step2Schemas } from "@/modules/report/schemas";
import { cn } from "@/lib/utils";
import { RootState } from "@/lib/store";
import { updateFormData } from "@/modules/report/reportSlice";

interface Step2Props {
  reportType: string;
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

export const Step2Details = ({
  reportType,
  onNext,
  onBack,
  initialData,
}: Step2Props) => {
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.report.formData);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // Refs for scrolling to errors
  const urlRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const detailsRef = useRef<HTMLTextAreaElement>(null);

  // --- Helpers ---
  const updateField = (field: string, value: string) => {
    // SECURITY: Sanitize all string inputs
    const sanitizedValue = sanitizeInput(value);
    dispatch(updateFormData({ [field]: sanitizedValue }));
  };

  // --- Validation Logic ---
  useEffect(() => {
    const schema = Step2Schemas[reportType as keyof typeof Step2Schemas];
    if (schema) {
      const result = schema.safeParse(formData);
      if (result.success) {
        setErrors({});
        setIsValid(true);
      } else {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(fieldErrors);
        setIsValid(false);
      }
    }
  }, [formData, reportType]);

  const handleNext = () => {
    if (isValid) {
      onNext(formData);
    } else {
      setShowErrors(true);

      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      const refs: Record<string, any> = {
        url: urlRef,
        phone: phoneRef,
        email: emailRef,
        subject: subjectRef,
        account: accountRef,
        amount: amountRef,
        details: detailsRef
      };

      const targetRef = refs[firstErrorField];
      if (targetRef?.current) {
        targetRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        targetRef.current.focus();
      }
    }
  };

  const isWhatsApp = reportType === "whatsapp_sms";
  const isEmail = reportType === "email";
  const isWebsite = reportType === "website";
  const isTransaction = reportType === "transaction";
  const isPhone = reportType === "phone";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-10">
      <div className="space-y-6">
        {/* Dynamic Fields Section */}
        <div className="space-y-6">
          {(isWhatsApp || isWebsite || isEmail) && (
            <Input
              ref={urlRef}
              label="URL / Link mencurigakan"
              placeholder="Contoh: https://example.com"
              value={formData.url}
              onChange={(e) => updateField("url", e.target.value)}
              error={showErrors ? errors.url : ""}
            />
          )}

          {(isWhatsApp || isPhone) && (
            <Input
              ref={phoneRef}
              label={isPhone ? "Nomor Panggilan" : "Nomor pengirim"}
              placeholder="Contoh: 081234567890"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              error={showErrors ? errors.phone : ""}
            />
          )}

          {isEmail && (
            <>
              <Input
                ref={emailRef}
                label="Email pengirim"
                placeholder="Contoh: example@example.com"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                error={showErrors ? errors.email : ""}
              />
              <Input
                ref={subjectRef}
                label="Subjek email"
                placeholder="Masukkan subjek atau judul email"
                value={formData.subject}
                onChange={(e) => updateField("subject", e.target.value)}
                error={showErrors ? errors.subject : ""}
              />
            </>
          )}

          {isTransaction && (
            <>
              <Input
                ref={accountRef}
                label="Nomor akun / Nama Merchant"
                placeholder="Masukkan nomor rekening atau nama merchant"
                value={formData.account}
                onChange={(e) => updateField("account", e.target.value)}
                error={showErrors ? errors.account : ""}
              />
              <Input
                ref={amountRef}
                label="Jumlah transaksi"
                placeholder="Masukkan nominal transaksi (Rp)"
                value={formData.amount}
                onChange={(e) => updateField("amount", e.target.value)}
                error={showErrors ? errors.amount : ""}
              />
            </>
          )}

          {/* Common Fields */}
          <Textarea
            ref={detailsRef}
            label="Ceritakan apa yang terjadi"
            placeholder="Tuliskan kronologi singkat bagaimana Anda menerima link ini..."
            maxLength={500}
            currentLength={formData.details.length}
            value={formData.details}
            onChange={(e) => updateField("details", e.target.value)}
            error={showErrors ? errors.details : ""}
          />

          <DatePicker
            label="Kapan kejadian ini?"
            value={formData.date}
            onChange={(val) => updateField("date", val)}
            error={showErrors ? errors.date : ""}
            placeholder="Pilih tanggal dan waktu kejadian"
          />
        </div>

        {/* Navigation Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            size="md"
            onClick={onBack}
            className="flex-1 sm:flex-none sm:min-w-[160px]"
          >
            Kembali
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleNext}
            className={cn("flex-1", !isValid && showErrors && "opacity-80")}
            rightIcon={<ArrowRight className="size-5" />}
          >
            Lanjutkan
          </Button>
        </div>
      </div>
    </div>
  );
};

