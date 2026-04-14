"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Beranda", href: "/" },
  { name: "Lapor Phishing", href: "/lapor" },
  { name: "Edukasi", href: "/edukasi" },
  { name: "Laporan Saya", href: "/laporan-saya" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 md:h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex shrink-0 items-center">
            <Link href="/" className="text-xl md:text-2xl font-extrabold text-primary">
              OctoSight
            </Link>
          </div>

          {/* Desktop Menu - Centered */}
          <div className="hidden flex-1 md:flex justify-center">
            <div className="flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-base font-semibold text-gray-700 transition-colors hover:text-primary"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Utility Icons - Right */}
          <div className="hidden md:flex items-center space-x-5">
            <button className="text-gray-600 hover:text-primary transition-colors cursor-pointer">
              <Bell className="size-6" />
            </button>
            <button className="text-gray-600 hover:text-primary transition-colors cursor-pointer">
              <User className="size-6" />
            </button>
          </div>

          {/* Mobile responsive button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn("md:hidden", isOpen ? "block" : "hidden")}>
        <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3 bg-white border-b">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
