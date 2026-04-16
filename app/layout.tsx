import type { Metadata } from "next";
import { Poppins, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthFlow from "@/libs/AuthFlow";
import { ToastProvider } from "@/components/Notchjs/ToastProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Square Experience | 2026",
  description: "Business in node format",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${bricolageGrotesque.className} antialiased`}
      >
        <ToastProvider>
          <AuthFlow>{children}</AuthFlow>
        </ToastProvider>
      </body>
    </html>
  );
}
