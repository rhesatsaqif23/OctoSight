"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export const Select = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
  error,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between bg-[#F3F3F3] border border-transparent rounded-xl px-4 py-4 text-left transition-all hover:border-gray-300",
          isOpen && "border-primary ring-2 ring-primary/10",
          error && "border-primary",
          !value ? "text-gray-500" : "text-gray-900 font-medium"
        )}
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-5 text-gray-400 transition-transform duration-200",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>

      {error && (
        <span className="text-sm text-primary font-medium mt-1 animate-in fade-in slide-in-from-top-1 duration-200 block">
          {error}
        </span>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-2 max-h-60 overflow-auto animate-in fade-in zoom-in duration-200">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 text-sm transition-colors",
                option.value === value
                  ? "bg-red-50 text-primary font-bold"
                  : "text-gray-700 hover:bg-gray-50 font-medium"
              )}
            >
              {option.label}
              {option.value === value && <Check className="size-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
