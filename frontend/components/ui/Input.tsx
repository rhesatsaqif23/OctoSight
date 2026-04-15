import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-base font-bold text-gray-900 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-[#F3F3F3] border border-transparent rounded-xl px-4 py-4 text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-base",
            error && "border-primary",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-sm text-primary font-medium mt-1 animate-in fade-in slide-in-from-top-1 duration-200 block">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
  currentLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, maxLength, currentLength, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          {label && (
            <label className="text-base font-bold text-gray-900">
              {label}
            </label>
          )}
          {maxLength && (
            <span className="text-xs font-bold text-gray-400 tracking-wider">
              {currentLength || 0}/{maxLength} KARAKTER
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          className={cn(
            "w-full bg-[#F3F3F3] border border-transparent rounded-xl px-4 py-4 text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all min-h-[120px] resize-none text-base",
            error && "border-primary",
            className
          )}
          maxLength={maxLength}
          {...props}
        />
        {error && (
          <span className="text-sm text-primary font-medium mt-1 animate-in fade-in slide-in-from-top-1 duration-200 block">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
