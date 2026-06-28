import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/auth/auth-provider";
import { DailyRuleFinalizer } from "@/components/diet-app/daily-rule-finalizer";
import { OnboardingGate } from "@/components/diet-app/onboarding-gate";
import { SessionSync } from "@/components/diet-app/session-sync";
import { PwaRegister } from "@/components/pwa/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily OK",
  applicationName: "Daily OK",
  description: "A self-guided diet coach built around calories, OK/X habits, and weekly rules.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
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
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <PwaRegister />
          <SessionSync />
          <DailyRuleFinalizer />
          <OnboardingGate>{children}</OnboardingGate>
        </AuthProvider>
      </body>
    </html>
  );
}
