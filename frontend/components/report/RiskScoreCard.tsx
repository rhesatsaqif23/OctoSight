"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RiskScoreCardProps {
  score: number;
  status: string;
  colorClass?: string;
  className?: string;
}

export const RiskScoreCard = ({
  score,
  status,
  colorClass,
  className
}: RiskScoreCardProps) => {

  const getRiskStyles = (score: number) => {
    if (score < 40) return { stroke: "text-green-500", text: "text-green-600", badge: "text-green-700 bg-green-50" };
    if (score < 60) return { stroke: "text-yellow-500", text: "text-yellow-600", badge: "text-yellow-700 bg-yellow-50" };
    if (score < 80) return { stroke: "text-orange-500", text: "text-orange-600", badge: "text-orange-700 bg-orange-50" };
    return { stroke: "text-[#BC0007]", text: "text-[#BC0007]", badge: "text-[#BC0007] bg-[#BC0007]/10" };
  };

  const riskStyles = getRiskStyles(score);
  const activeColorClass = colorClass || riskStyles.badge;

  return (
    <div className={cn(
      "bg-white rounded-3xl p-8 border-2 border-gray-100 flex flex-col items-center justify-center text-center h-full lg:min-h-[260px]",
      className
    )}>
      <div className="relative size-32 mb-4 md:mb-6">
        {/* Circular Gauge Background */}
        <svg className="size-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-50"
          />
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={364}
            strokeDashoffset={364 - (364 * score) / 100}
            strokeLinecap="round"
            className={cn("transition-all duration-1000 ease-out", riskStyles.stroke)}
          />
        </svg>
        {/* Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-4xl font-black leading-none", riskStyles.text)}>
            {score}
          </span>
          <span className="text-xs md:text-sm font-bold text-gray-600 mt-1 uppercase">
            / 100
          </span>
        </div>
      </div>

      <p className="text-sm md:text-base font-bold text-gray-900 mb-2 md:mb-4">
        Estimasi Risiko Awal
      </p>
      <span className={cn(
        "px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase",
        activeColorClass
      )}>
        {status}
      </span>
    </div>
  );
};
