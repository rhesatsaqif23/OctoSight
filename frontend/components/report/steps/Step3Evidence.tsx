"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { UploadCloud, Trash2, Info, FileText, Image as ImageIcon, X, AlertCircle } from "lucide-react";
import { RootState } from "@/lib/store";
import { updateFormData } from "@/modules/report/reportSlice";

interface Step3Props {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

export const Step3Evidence = ({ onNext, onBack, initialData }: Step3Props) => {
  const dispatch = useDispatch();
  const { evidenceName, url, riskScore } = useSelector((state: RootState) => state.report.formData);

  // --- Background VT scan: runs silently while user uploads evidence ---
  useEffect(() => {
    // Only scan if URL is present and score not yet cached
    if (!url || riskScore !== null) return;

    const runBackgroundScan = async () => {
      try {
        const res = await fetch("/api/vt-scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        if (!res.ok) return;
        const data = await res.json();
        const score: number = typeof data.score === "number" ? data.score : 0;
        dispatch(updateFormData({ riskScore: score }));
      } catch {
        // Silent fail — Step4 will handle its own fallback
      }
    };

    runBackgroundScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [file, setFile] = useState<File | null>(initialData?.evidence || null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (file) {
      dispatch(updateFormData({ evidenceName: file.name }));
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  }, [file, dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const selected = e.target.files?.[0];
    if (selected) {
      // SECURITY: 5MB Limit
      if (selected.size > 5 * 1024 * 1024) {
        setUploadError("File terlalu besar. Maksimal ukuran file adalah 5MB.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // SECURITY: MIME Type Validation
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(selected.type)) {
        setUploadError("Format file tidak didukung. Gunakan JPG, PNG, atau PDF.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setFile(selected);
      setShowErrors(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadError(null);
  };

  const handleNext = () => {
    if (file) {
      onNext({ evidence: file });
    } else {
      setShowErrors(true);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = 1;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-10">
      <div className="space-y-8">

        {/* Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all",
            showErrors && !file ? "border-primary bg-red-50/30" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/20"
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf"
          />

          <div className="bg-[#FFE5E5] p-4 rounded-full mb-4">
            <UploadCloud className="size-8 text-primary" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Seret file ke sini atau klik untuk pilih
          </h3>
          <p className="text-gray-500 text-sm">
            Mendukung: JPG, PNG, PDF (maks. 5MB)
          </p>

          {showErrors && !file && (
            <span className="absolute bottom-4 text-primary text-sm font-medium italic animate-pulse">
              *Unggah minimal satu bukti pendukung
            </span>
          )}
        </div>

        {/* Upload Error Alert */}
        {uploadError && (
          <div className="bg-red-50 border-l-4 border-primary p-5 rounded-lg mt-4 flex items-start justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-4">
              <AlertCircle className="size-6 text-primary shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-900 leading-relaxed">{uploadError}</p>
            </div>
            <button onClick={() => setUploadError(null)} className="cursor-pointer shrink-0 ml-4 mt-1">
              <X className="size-5 text-primary hover:text-red-900 opacity-70 hover:opacity-100 transition-opacity" />
            </button>
          </div>
        )}

        {/* Uploaded File List */}
        {file && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-600 tracking-wide uppercase">
              FILE TERUNGGAH
            </h4>

            <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-lg bg-gray-900 flex items-center justify-center overflow-hidden shrink-0">
                  {preview ? (
                    <img src={preview} alt="preview" className="size-full object-cover" />
                  ) : (
                    <FileText className="size-6 text-white" />
                  )}
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm truncate max-w-[200px] md:max-w-xs">
                    {file.name}
                  </h5>
                  <p className="text-xs text-gray-500">
                    {formatSize(file.size)} • <span className="text-green-600 font-medium">Berhasil diunggah</span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleRemove}
                className="flex items-center gap-1.5 text-primary font-bold text-sm hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="size-4" />
                Hapus
              </button>
            </div>
          </div>
        )}

        {/* Security Tip Box */}
        <div className="flex gap-4 p-5 rounded-lg bg-[#CCE5FF]/30 border-l-4 border-[#006193]">
          <Info className="size-6 text-[#006193] shrink-0 mt-0.5" />
          <p className="text-[#004085] text-sm leading-relaxed font-medium">
            <span className="font-bold">Tips Keamanan:</span> Pastikan Anda telah menutupi informasi pribadi yang tidak relevan (seperti nomor kartu kredit lengkap) sebelum mengunggah bukti.
          </p>
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
            className="flex-1"
          >
            Lanjutkan
          </Button>
        </div>
      </div>
    </div>
  );
};
