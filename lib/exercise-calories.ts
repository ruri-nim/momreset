export interface ExercisePreset {
  id: string;
  name: string;
  met: number;
  defaultMinutes: number;
  keywords: string[];
}

export const exercisePresets: ExercisePreset[] = [
  {
    id: "walk-light",
    name: "가벼운 걷기",
    met: 3.0,
    defaultMinutes: 20,
    keywords: ["걷기", "산책", "walk"],
  },
  {
    id: "walk-fast",
    name: "빠른 걷기",
    met: 4.3,
    defaultMinutes: 25,
    keywords: ["빠른 걷기", "파워워킹", "power walk"],
  },
  {
    id: "running",
    name: "러닝",
    met: 8.3,
    defaultMinutes: 30,
    keywords: ["러닝", "달리기", "run"],
  },
  {
    id: "home-training",
    name: "홈트",
    met: 5.0,
    defaultMinutes: 20,
    keywords: ["홈트", "근력", "서킷", "squat"],
  },
  {
    id: "cycling",
    name: "자전거",
    met: 6.8,
    defaultMinutes: 30,
    keywords: ["자전거", "사이클", "cycling"],
  },
  {
    id: "yoga",
    name: "요가",
    met: 2.8,
    defaultMinutes: 30,
    keywords: ["요가", "필라테스", "stretch"],
  },
  {
    id: "stair",
    name: "계단 오르기",
    met: 8.8,
    defaultMinutes: 10,
    keywords: ["계단", "stairs"],
  },
];

export function calculateExerciseCalories(
  met: number,
  weightKg: number,
  minutes: number,
) {
  if (met <= 0 || weightKg <= 0 || minutes <= 0) {
    return 0;
  }

  return Math.round((met * 3.5 * weightKg * minutes) / 200);
}

export function findExercisePresetByName(name: string) {
  const normalizedName = name.trim().toLowerCase();

  if (!normalizedName) {
    return null;
  }

  return (
    exercisePresets.find(
      (preset) =>
        preset.name.toLowerCase() === normalizedName ||
        preset.keywords.some((keyword) => normalizedName.includes(keyword.toLowerCase())),
    ) ?? null
  );
}

export function estimateCaloriesByExerciseName(
  name: string,
  weightKg: number,
  minutes: number,
) {
  const preset = findExercisePresetByName(name);

  if (!preset) {
    return 0;
  }

  return calculateExerciseCalories(preset.met, weightKg, minutes);
}
