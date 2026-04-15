import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import StoreProvider from "@/lib/StoreProvider";
import { FileProvider } from "@/lib/FileContext";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OctoSight | Sistem Anti-Phishing & Fraud Banking",
  description: "Platform deteksi dini dan pelaporan aktivitas phishing serta penipuan perbankan digital. Lindungi aset perbankan Anda dengan OctoSight.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className={`${manrope.className} font-sans min-h-screen flex flex-col bg-[#F9F9F9] text-foreground`}>
        <Navbar />
        <main className="grow bg-[#F9F9F9] w-full">
          <StoreProvider>
            <FileProvider>
              {children}
            </FileProvider>
          </StoreProvider>
        </main>
        <Footer />
      </body>
    </html>
  );
}
