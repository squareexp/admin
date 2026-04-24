import type { Metadata } from "next";
import "./globals.css";
import AuthFlow from "@/lib/AuthFlow";
import { ToastProvider } from "@/components/Notchjs/ToastProvider";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "Square Experience | 2026",
  description: "Business in node format",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <QueryProvider>
          <ToastProvider>
            <AuthFlow>{children}</AuthFlow>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

