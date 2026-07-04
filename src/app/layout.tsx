import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Love Booth — Capture memories, miles apart",
  description:
    "A premium Korean-style couples photobooth. Real-time camera, voice chat, cute frames, and instant photostrips.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ff6f9c",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
