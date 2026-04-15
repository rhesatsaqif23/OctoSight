"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import {
  MessageSquare,
  Link as LinkIcon,
  Calendar,
  Info,
  Send,
  AlertTriangle,
  Mail,
  Phone,
  Globe,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

import { RiskScoreCard } from "@/components/report/RiskScoreCard";

interface Step4Props {
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const REPORT_TYPE_LABELS: Record<string, { label: string; icon: any; identifierLabel: string }> = {
  whatsapp_sms: { label: "Pesan WhatsApp", icon: MessageSquare, identifierLabel: "Pengirim" },
  email: { label: "Email Phishing", icon: Mail, identifierLabel: "Email Pengirim" },
  website: { label: "Website Palsu", icon: Globe, identifierLabel: "URL" },
  transaction: { label: "Transaksi Mencurigakan", icon: CreditCard, identifierLabel: "No. Rekening" },
  phone: { label: "Panggilan Penipuan", icon: Phone, identifierLabel: "No. Telepon" },
};

export const Step4Confirmation = ({ onBack, onSubmit, isSubmitting }: Step4Props) => {
  const { formData } = useSelector((state: RootState) => state.report);

  // Helper to format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const typeConfig = REPORT_TYPE_LABELS[formData.type] || {
    label: formData.type || "Laporan",
    icon: AlertTriangle,
    identifierLabel: "Detail"
  };

  const TypeIcon = typeConfig.icon;

  // Primary identifier display (URL, Phone, Email, etc.)
  const getIdentifierValue = () => {
    if (formData.type === "website") return formData.url;
    if (formData.type === "whatsapp_sms" || formData.type === "phone") return formData.phone;
    if (formData.type === "email") return formData.email;
    if (formData.type === "transaction") return formData.account;
    return formData.subject || "-";
  };

  const riskScore = 75; // Mocked for now (as requested)
  const riskStatus = "HIGH RISK";

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      <div className="p-8 md:p-12">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1A1A] mb-4">
          Tinjau Laporan Kamu
        </h2>

        {/* Layout Grid: Balanced 1:1 on md+ */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side: Summary Details */}
          <div className="space-y-6">
            {/* JENIS */}
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-full bg-primary/5 text-primary">
                <TypeIcon className="size-5" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  JENIS
                </p>
                <p className="text-base md:text-lg font-semibold text-[#1A1A1A]">
                  {typeConfig.label}
                </p>
              </div>
            </div>

            {/* IDENTIFIER (URL/Phone/etc) */}
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-full bg-primary/5 text-primary">
                <LinkIcon className="size-5" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  {typeConfig.identifierLabel}
                </p>
                <p className="text-base md:text-lg font-semibold text-[#1A1A1A]">
                  {getIdentifierValue()}
                </p>
              </div>
            </div>

            {/* WAKTU */}
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-full bg-primary/5 text-primary">
                <Calendar className="size-5" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  WAKTU
                </p>
                <p className="text-base md:text-lg font-semibold text-[#1A1A1A]">
                  {formatDate(formData.date)}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Risk Score Card Component */}
          <RiskScoreCard
            score={riskScore}
            status={riskStatus}
          />
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-gray-200" />

        {/* Disclaimer Section - No background per request */}
        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="shrink-0 flex items-center justify-center">
            <Info className="size-5 text-primary" />
          </div>
          <p className="text-gray-500 text-[13px] leading-relaxed">
            Dengan mengirimkan laporan ini, saya menyatakan bahwa informasi yang diberikan adalah benar dan saya mengerti bahwa laporan ini akan digunakan untuk keperluan keamanan data jaringan Octosight.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col items-center gap-6">
          <Button
            size="md"
            className="w-full max-w-lg rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
            onClick={onSubmit}
            disabled={isSubmitting}
            rightIcon={<Send className="size-4" />}
          >
            Kirim Laporan
          </Button>

          <button
            onClick={onBack}
            className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Kembali ke Langkah Sebelumnya
          </button>
        </div>
      </div>
    </div>
  );
};
