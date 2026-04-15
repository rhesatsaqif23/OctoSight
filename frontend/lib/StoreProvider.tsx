"use client";

import { useRef, useEffect } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "@/lib/store";
import { hydrateReport } from "@/modules/report/reportSlice";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>(undefined);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  // Hydrate on mount (client-side only)
  useEffect(() => {
    if (storeRef.current) {
      const saved = localStorage.getItem("octosight_report_data");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          storeRef.current.dispatch(hydrateReport(parsed));
        } catch (e) {
          console.error("Hydration failed", e);
        }
      }
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
