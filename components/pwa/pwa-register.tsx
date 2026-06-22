"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let hasRefreshed = false;

    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (hasRefreshed) {
            return;
          }

          hasRefreshed = true;
          window.location.reload();
        });
      })
      .catch(() => {
        // PWA registration should never block app usage.
      });
  }, []);

  return null;
}
