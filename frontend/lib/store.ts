import { configureStore } from "@reduxjs/toolkit";
import reportReducer from "@/modules/report/reportSlice";

const persistenceMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);
  const state = store.getState();
  if (typeof window !== "undefined" && state.report) {
    localStorage.setItem("octosight_report_data", JSON.stringify(state.report));
  }
  return result;
};

export const makeStore = () => {
  return configureStore({
    reducer: {
      report: reportReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(persistenceMiddleware),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
