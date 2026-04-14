import React from "react";
import { Globe, ShieldCheck } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-white py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center md:items-start">
            <span className="text-2xl font-bold mb-1">OctoSight</span>
            <p className="text-white/70 text-sm">
              &copy; 2026 B.3 Kelompok 4
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold">
            <a href="#" className="hover:underline transition-all">Tentang Kami</a>
            <a href="#" className="hover:underline transition-all">Bantuan</a>
            <a href="#" className="hover:underline transition-all">Privasi</a>
            <a href="#" className="hover:underline transition-all">Kontak</a>
          </div>

          {/* Utility Icons */}
          <div className="flex items-center gap-5">
            <Globe className="size-6 cursor-pointer hover:opacity-80 transition-opacity" />
            <ShieldCheck className="size-6 cursor-pointer hover:opacity-80 transition-opacity" />
          </div>
        </div>
      </div>
    </footer>
  );
};
