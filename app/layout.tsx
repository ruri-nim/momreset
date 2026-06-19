import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/auth/auth-provider";
import { OnboardingGate } from "@/components/diet-app/onboarding-gate";
import { PwaRegister } from "@/components/pwa/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily OK",
  description: "A self-guided diet coach built around calories, OK/X habits, and weekly rules.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Daily OK",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#fff6aa",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <PwaRegister />
          <OnboardingGate>{children}</OnboardingGate>
        </AuthProvider>
      </body>
    </html>
  );
}
