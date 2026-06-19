import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/auth-provider";
import { OnboardingGate } from "@/components/diet-app/onboarding-gate";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily OK",
  description: "A self-guided diet coach built around calories, OK/X habits, and weekly rules.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <OnboardingGate>{children}</OnboardingGate>
        </AuthProvider>
      </body>
    </html>
  );
}
