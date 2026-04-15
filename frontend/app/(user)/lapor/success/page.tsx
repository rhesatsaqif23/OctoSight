"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Copy, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDispatch } from "react-redux";
import { resetReport } from "@/modules/report/reportSlice";
import { useFileContext } from "@/lib/FileContext";

export default function LaporSuccessPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { setEvidenceFile } = useFileContext();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Clear all persisted state on success mount
    localStorage.removeItem("octosight_report_data");
    setEvidenceFile(null);
    dispatch(resetReport());
  }, [dispatch, setEvidenceFile]);
  const ticketId = "#OCT-2024-00847"; // Dynamic normally

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Main Success Card */}
      <div className="w-full max-w-xl md:max-w-2xl bg-white rounded-[32px] sm:rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col items-center p-6 sm:p-8 md:p-12 relative overflow-hidden">

        {/* Success Icon Group */}
        <div className="mb-6 md:mb-8 relative">
          <div className="size-20 md:size-24 rounded-full bg-[#ECFDF5] flex items-center justify-center">
            <div className="size-14 md:size-16 rounded-full bg-[#059669] flex items-center justify-center shadow-lg shadow-[#059669]/20">
              <Check className="size-6 md:size-8 text-white" strokeWidth={4} />
            </div>
          </div>
        </div>

        {/* Header Text */}
        <div className="text-center space-y-3 md:space-y-4 mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
            Laporan Berhasil Dikirim!
          </h1>
          <p className="text-gray-800 text-base md:text-lg max-w-[480px] mx-auto leading-relaxed">
            Tim kami akan meninjau dalam 1&times;24 jam. Kamu akan menerima notifikasi jika ada pembaruan status.
          </p>
        </div>

        {/* Ticket Reference Card */}
        <div className="w-full max-w-xl bg-white border-2 border-gray-200 rounded-2xl md:rounded-3xl p-5 md:p-6 mb-8 md:mb-12 relative group transition-all hover:border-gray-200">
          <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">
            TICKET REFERENCE
          </p>
          <div className="relative flex flex-col items-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-4 w-full">
              <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#1A1A1A] text-center">
                ID Tiket:
              </h2>
              <div className="flex items-center justify-center gap-2 md:gap-4">
                <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-primary break-all">
                  {ticketId}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-2 md:p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group/copy cursor-pointer shrink-0"
                  title="Salin ID Tiket"
                >
                  {copied ? (
                    <CheckCircle2 className="size-5 md:size-6 text-green-600" />
                  ) : (
                    <Copy className="size-5 md:size-6 text-gray-600 group-hover/copy:text-gray-800" />
                  )}
                </button>
              </div>
            </div>

            {/* Copy Success Label */}
            <div className={`absolute -bottom-12 left-1/2 -translate-x-1/2 transition-all duration-300 ${copied ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
              <span className="text-green-600 text-xs md:text-sm font-bold flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full whitespace-nowrap shadow-sm border border-green-200">
                <Check className="size-3 lg:size-4" strokeWidth={3} />
                ID berhasil disalin
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-5 justify-center w-full max-w-xl">
          <Button
            size="md"
            className="flex-1 text-base md:text-lg font-bold bg-primary hover:bg-[#990006] shadow-xl shadow-red-900/10 transition-all active:scale-[0.98] cursor-pointer"
            onClick={() => router.push("/laporan-saya")}
          >
            Lihat Status Laporan
          </Button>
          <Button
            variant="outline"
            size="md"
            className="flex-1 text-base md:text-lg font-bold border-gray-200 text-[#1A1A1A] hover:bg-gray-50 transition-all active:scale-[0.98] cursor-pointer"
            onClick={() => router.push("/")}
          >
            Kembali ke Beranda
          </Button>
        </div>

        {/* Footer Divider */}
        <div className="w-full h-px bg-gray-200 my-8 md:my-10" />

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 md:gap-12">
          <div className="flex items-center gap-2 text-gray-500 font-semibold text-xs md:text-sm">
            <Lock className="size-4 md:size-5 text-[#10B981]" />
            <span className="tracking-tight">Enkripsi AES-256</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 font-semibold text-xs md:text-sm">
            <ShieldCheck className="size-4 md:size-5 text-[#10B981]" />
            <span className="tracking-tight">Secure Submission</span>
          </div>
        </div>
      </div>

      {/* Support Message */}
      <p className="my-8 md:my-10 text-gray-500 font-medium text-center text-sm md:text-base">
        Butuh bantuan mendesak?{" "}
        <Link
          href="/support"
          className="text-primary font-bold hover:text-[#990006] transition-colors md:ml-1 cursor-pointer block md:inline mt-1 md:mt-0"
        >
          Hubungi Support 24/7
        </Link>
      </p>
    </main>
  );
}
