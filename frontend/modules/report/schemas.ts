import { z } from "zod";

// --- Validation Schemas ---

export const Step1Schema = z.object({
  type: z.string().min(1, "Pilih jenis laporan terlebih dahulu"),
  modus: z.string().min(1, "Pilih modus penipuan terlebih dahulu"),
});

const commonSchema = {
  details: z
    .string()
    .min(1, "Wajib diisi: Ceritakan kronologi kejadian")
    .min(10, "Minimal 10 karakter untuk kronologi")
    .max(500),
  date: z.string().min(1, "Wajib diisi: Pilih waktu kejadian"),
};

export const Step2Schemas = {
  whatsapp_sms: z.object({
    ...commonSchema,
    url: z
      .string()
      .min(1, "Wajib diisi: Masukkan link/URL website")
      .regex(/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i, "Format tidak valid. Contoh: example.com"),
    phone: z
      .string()
      .min(1, "Wajib diisi: Masukkan nomor pengirim")
      .regex(/^[0-9+]+$/, "Format tidak valid. Gunakan angka atau +62. Contoh: 081234567890")
      .min(10, "Nomor telepon minimal 10 digit"),
  }),
  email: z.object({
    ...commonSchema,
    url: z
      .string()
      .optional()
      .refine((val) => !val || /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i.test(val), {
        message: "Format tidak valid. Contoh: example.com",
      }),
    email: z
      .string()
      .min(1, "Wajib diisi: Masukkan email pengirim")
      .email("Format email tidak valid. Contoh: example@gmail.com"),
    subject: z.string().min(1, "Wajib diisi: Masukkan subjek email"),
  }),
  website: z.object({
    ...commonSchema,
    url: z
      .string()
      .min(1, "Wajib diisi: Masukkan URL website palsu")
      .regex(/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i, "Format tidak valid. Contoh: example.com"),
  }),
  transaction: z.object({
    ...commonSchema,
    account: z.string().min(1, "Wajib diisi: Masukkan nomor akun / merchant").min(5, "Minimal 5 karakter"),
    amount: z.string().min(1, "Wajib diisi: Masukkan jumlah transaksi"),
  }),
  phone: z.object({
    ...commonSchema,
    phone: z
      .string()
      .min(1, "Wajib diisi: Masukkan nomor panggilan")
      .regex(/^[0-9+]+$/, "Format tidak valid. Contoh: 081234567890")
      .min(10, "Nomor telepon minimal 10 digit"),
  }),
};

export const Step3Schema = z.object({
  evidence: z.any().refine((val) => val !== null, "Unggah minimal satu bukti"),
});
