import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted so a real phone on the LAN gets the same type as the desktop.
const openRunde = localFont({
  src: [
    { path: "./fonts/OpenRunde-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/OpenRunde-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/OpenRunde-Semibold.otf", weight: "600", style: "normal" },
    { path: "./fonts/OpenRunde-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-open-runde",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Drag Nav",
  description: "Tap and drag navigation experiment",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#0b0b0c",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={openRunde.variable}>
      <body>{children}</body>
    </html>
  );
}
