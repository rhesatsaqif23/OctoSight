import React from "react";
import Image from "next/image";
import { Button } from "../ui/Button";
import { ShieldCheck } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-[#F9F9F9] py-16 transition-all">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm md:text-md font-bold text-primary mb-6 ring-1 ring-inset ring-red-600/10">
              <ShieldCheck className="size-5" />
              AMANKAN IDENTITAS DIGITAL ANDA
            </span>
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl leading-[1.1] sm:leading-[1.15] md:leading-[1.2] tracking-tight">
              <span className="block">Tetap Aman dari</span>
              <span className="block text-primary">Phishing & Penipuan</span>
              <span className="block text-gray-900">dengan OctoSight</span>
            </h1>
            <p className="mt-6 text-md md:not-last-of-type:text-lg text-gray-600 sm:text-xl md:max-w-xl leading-relaxed">
              Sistem proaktif untuk mendeteksi, melaporkan, dan mencegah
              penipuan digital secara real-time. Keamanan presisi untuk web
              modern.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
              <Button variant="primary" size="lg">
                Laporkan Phishing
              </Button>
              <Button variant="secondary" size="lg">
                Cek Keamanan Link
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative mt-16 sm:mt-20 lg:col-span-6 lg:mt-0 flex justify-center lg:justify-end">
            <Image
              src="/home/hero.webp"
              alt="OctoSight Platform Preview"
              width={800}
              height={600}
              priority
              className="w-full max-w-lg lg:max-w-none h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </div >
  );
};
