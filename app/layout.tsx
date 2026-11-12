import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { CSSProperties } from "react";
import "./globals.css";
import { appConfig } from "@/src/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: appConfig.brand.name,
    template: `%s | ${appConfig.brand.name}`,
  },
  description: appConfig.brand.copy,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full bg-background text-foreground"
        style={
          {
            "--brand-primary": appConfig.brand.primary,
            "--brand-accent": appConfig.brand.accent,
          } as CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
