import type { AppState, AuthMode } from "@/types/app";

function createGuestSessionId() {
  return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createGuestSessionMeta() {
  return {
    authMode: "guest" as AuthMode,
    guestSessionId: createGuestSessionId(),
    guestSessionStartedAt: new Date().toISOString(),
  };
}

export function ensureGuestSession(state: AppState): AppState {
  if (state.ui.authMode && state.ui.guestSessionId && state.ui.guestSessionStartedAt) {
    return state;
  }

  return {
    ...state,
    ui: {
      ...state.ui,
      authMode: state.ui.authMode ?? "guest",
      guestSessionId: state.ui.guestSessionId ?? createGuestSessionId(),
      guestSessionStartedAt: state.ui.guestSessionStartedAt ?? new Date().toISOString(),
    },
  };
}

export function formatGuestSessionStartedAt(value?: string) {
  if (!value) {
    return "오늘부터";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "오늘부터";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
  }).format(date);
}
