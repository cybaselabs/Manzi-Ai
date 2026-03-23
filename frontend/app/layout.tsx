import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manzi — Umujyi wa Kigali",
  description: "Baza ikibazo cy'amategeko y'Umujyi wa Kigali",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
