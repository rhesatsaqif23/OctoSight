import React from "react";
import { cn } from "@/lib/utils";

interface ReportFormContainerProps {
  title: string;
  children: React.ReactNode;
}

export const ReportFormContainer = ({
  title,
  children,
}: ReportFormContainerProps) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-10">
      {title && (
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 pb-4">
          {title}
        </h2>
      )}
      <div className={cn(title ? "pt-4" : "")}>
        {children}
      </div>
    </div>
  );
};
