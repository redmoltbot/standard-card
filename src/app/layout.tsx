import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export function generateMetadata(): Metadata {
  return {
    title: process.env.APP_NAME ?? "SupaClaw Cafe",
    description: "Reward card dashboard",
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const appName = process.env.APP_NAME ?? "SupaClaw Cafe";
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className={inter.className}>
        <AppShell appName={appName}>{children}</AppShell>
      </body>
    </html>
  );
}
