import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ReportOptionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  onClick: () => void;
}

export const ReportOptionCard = ({
  title,
  description,
  icon: Icon,
  selected,
  onClick,
}: ReportOptionCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-5 rounded-xl cursor-pointer transition-all border-2",
        "bg-[#F3F3F3]",
        selected ? "border-transparent" : "border-transparent hover:border-primary"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 flex-1 min-w-0">
        {/* Icon in white round box */}
        <div className="shrink-0 bg-white p-3 rounded-md shadow-sm w-fit">
          <Icon
            className={cn("size-6", "text-primary")}
          />
        </div>

        {/* Texts with max width and overflow control */}
        <div className="flex flex-col flex-1 min-w-0 pr-4">
          <h3
            className={cn(
              "text-lg font-bold mb-1 text-gray-900 leading-tight"
            )}
          >
            {title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
            {description}
          </p>
        </div>
      </div>

      {/* Radio Button - Always centered vertically */}
      <div className="shrink-0 flex items-center justify-center">
        <div
          className={cn(
            "w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center transition-all bg-white",
          )}
        >
          {selected && <div className="w-3.5 h-3.5 rounded-full bg-primary" />}
        </div>
      </div>
    </div>
  );
};
