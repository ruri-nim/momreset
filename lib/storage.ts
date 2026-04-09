import { initialAppState } from "@/lib/mock-data";
import type { AppState } from "@/types/app";

export const APP_STORAGE_KEY = "momreset.app-state.v1";

export function loadAppState(): AppState {
  if (typeof window === "undefined") {
    return initialAppState;
  }

  const raw = window.localStorage.getItem(APP_STORAGE_KEY);
  if (!raw) {
    return initialAppState;
  }

  try {
    return JSON.parse(raw) as AppState;
  } catch {
    return initialAppState;
  }
}

export function saveAppState(state: AppState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
}
