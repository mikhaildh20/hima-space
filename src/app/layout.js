// src/app/layout.js
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "HIMA Space — Booking Ruangan Organisasi Mahasiswa",
  description: "Platform visual booking ruangan mahasiswa terstruktur, transparan, dan mudah",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
