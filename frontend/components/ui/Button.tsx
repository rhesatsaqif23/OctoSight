import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "secondary";
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "md",
  className,
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center rounded-2xl font-bold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const variants = {
    primary: "bg-primary text-white hover:bg-red-800 shadow-md",
    outline: "border-2 border-primary text-primary hover:bg-primary/5",
    secondary: "bg-[#E8E8E8] text-gray-900 hover:bg-[#D8D8D8]",
    ghost: "text-gray-600 hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm md:px-6 md:py-3 md:text-base",
    lg: "px-6 py-3 text-base md:px-8 md:py-4 md:text-lg",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
