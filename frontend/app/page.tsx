import { Metadata } from "next";
import { Hero } from "@/components/home/Hero";

export const metadata: Metadata = {
  title: "OctoSight | Lindungi Akun Perbankan dari Phishing",
  description: "Selamat datang di OctoSight. Platform pelaporan dan verifikasi indikasi penipuan perbankan digital. Laporkan aktivitas mencurigakan sekarang.",
};

export default function Home() {
  return (
    <>
      <Hero />
      {/* Additional sections can be added here */}
    </>
  );
}
