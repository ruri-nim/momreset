import type { AppPhase } from "@/types/app";

export function getAppPhase(postpartumDay: number): AppPhase {
  return postpartumDay <= 42 ? "recovery" : "reset";
}
