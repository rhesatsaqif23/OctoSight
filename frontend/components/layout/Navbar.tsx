"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  return (

    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex shrink-0 items-center">
            <Link href="/" className="text-xl md:text-2xl font-extrabold text-primary">
              OctoSight
            </Link>
          </div>

          {/* Desktop Menu - Centered */}
          <div className="hidden flex-1 md:flex justify-center">
            <div className="flex items-baseline space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (pathname.startsWith(link.href + "/") && link.href !== "/");
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "text-base font-semibold transition-colors hover:text-primary py-1 border-b-2",
                      isActive
                        ? "text-primary border-primary"
                        : "text-gray-700 border-transparent"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
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
      <div className={cn("md:hidden absolute top-full left-0 w-full bg-white shadow-lg", isOpen ? "block" : "hidden")}>
        <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href + "/") && link.href !== "/");
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium transition-colors",
                  isActive
                    ? "bg-red-50 text-primary border-l-4 border-primary"
                    : "text-gray-700 hover:bg-gray-50 hover:text-primary border-l-4 border-transparent"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
