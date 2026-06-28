"use client";

import { useEffect } from "react";
import { finalizeUnrecordedRuleDays } from "@/lib/diet-app-storage";

export function DailyRuleFinalizer() {
  useEffect(() => {
    const finalize = () => {
      finalizeUnrecordedRuleDays();
    };

    finalize();
    const intervalId = window.setInterval(finalize, 60_000);
    window.addEventListener("focus", finalize);
    document.addEventListener("visibilitychange", finalize);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", finalize);
      document.removeEventListener("visibilitychange", finalize);
    };
  }, []);

  return null;
}
