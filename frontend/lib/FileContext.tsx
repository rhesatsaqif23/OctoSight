"use client";

import React, { createContext, useContext, useState } from "react";

interface FileContextType {
  evidenceFile: File | null;
  setEvidenceFile: (file: File | null) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  return (
    <FileContext.Provider value={{ evidenceFile, setEvidenceFile }}>
      {children}
    </FileContext.Provider>
  );
}

export function useFileContext() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error("useFileContext must be used within a FileProvider");
  }
  return context;
}
