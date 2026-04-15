import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ReportState {
  currentStep: number;
  formData: {
    type: string;
    modus: string;
    url: string;
    phone: string;
    email: string;
    subject: string;
    account: string;
    amount: string;
    details: string;
    date: string;
    evidenceName: string | null;
    riskScore: number | null;
  };
}

const initialState: ReportState = {
  currentStep: 1,
  formData: {
    type: "",
    modus: "",
    url: "",
    phone: "",
    email: "",
    subject: "",
    account: "",
    amount: "",
    details: "",
    date: "",
    evidenceName: null,
    riskScore: null,
  },
};

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    updateFormData: (state, action: PayloadAction<Partial<ReportState["formData"]>>) => {
      // SECURITY/REDUX: Explicitly exclude 'evidence' from being merged into state.
      // We also purge it from the merged result to ensure it doesn't persist if already present.
      const { evidence, ...serializableData } = action.payload as any;
      const merged = { ...state.formData, ...serializableData };
      
      if ("evidence" in merged) {
        delete (merged as any).evidence;
      }
      
      state.formData = merged;
    },
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    resetReport: (state) => {
      state.formData = initialState.formData;
      state.currentStep = initialState.currentStep;
    },
    hydrateReport: (state, action: PayloadAction<ReportState>) => {
      state.formData = action.payload.formData;
      state.currentStep = action.payload.currentStep;
    },
  },
});

export const { updateFormData, setStep, resetReport, hydrateReport } = reportSlice.actions;
export default reportSlice.reducer;
