import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type {
  DietAppSnapshot,
  DietFoodItem,
  OnboardingProfile,
  RuleHistoryEntry,
  RuleItem,
  WeightLogItem,
} from "@/types/diet-app";

type ProfileRow = {
  account_key: string;
  display_name: string | null;
  challenge: string | null;
  pace: string | null;
  coach_tone: string | null;
  current_weight_kg: number | null;
  goal_weight_kg: number | null;
  target_date: string | null;
  custom_daily_target_calories: number | null;
  created_at: string;
};

type FoodRow = {
  id: string;
  name: string;
  calories: number;
  meal_section: string | null;
  logged_on: string;
  portion_multiplier: number;
  consumed_grams: number | null;
  source: string | null;
  note: string | null;
};

type ExerciseRow = {
  id: string;
  name: string;
  minutes: number;
  burned_calories: number;
  logged_on: string;
};

type HabitTemplateRow = {
  id: string;
  type: string;
  title: string;
};

type HabitLogRow = {
  habit_template_id: string;
  logged_on: string;
  status: string;
};

type WeightRow = {
  id: string;
  logged_on: string;
  weight_kg: number;
};

function getAccountKey(email?: string | null) {
  return email?.trim().toLowerCase() ?? null;
}

function emptySnapshot(): DietAppSnapshot {
  return {
    foodList: [],
    doRules: [],
    avoidRules: [],
    exerciseLogs: [],
    bodyWeightKg: 55,
    weightHistory: [],
    ruleHistory: [],
    onboardingProfile: null,
  };
}

function hasAnySnapshotData(snapshot: DietAppSnapshot) {
  return Boolean(
    snapshot.foodList.length ||
      snapshot.doRules.length ||
      snapshot.avoidRules.length ||
      snapshot.exerciseLogs.length ||
      snapshot.weightHistory.length ||
      snapshot.ruleHistory.length ||
      snapshot.onboardingProfile,
  );
}

function buildWidgetSnapshot(snapshot: DietAppSnapshot) {
  const today = new Date().toISOString().slice(0, 10);
  const todayFoods = snapshot.foodList.filter((item) => item.loggedAt === today);
  const todayExercises = snapshot.exerciseLogs.filter((item) => item.loggedAt === today);
  const todayHistory = snapshot.ruleHistory.find((item) => item.date === today);
  const targetCalories =
    snapshot.onboardingProfile?.customDailyTargetCalories ??
    Math.round((snapshot.bodyWeightKg || snapshot.onboardingProfile?.currentWeightKg || 55) * 30);
  const netCalories =
    todayFoods.reduce((sum, item) => sum + item.calories, 0) -
    todayExercises.reduce((sum, item) => sum + item.burnedCalories, 0);
  const doDoneCount = Object.values(todayHistory?.doRuleStatuses ?? {}).filter(
    (status) => status === "done",
  ).length;
  const avoidSuccessCount = Object.values(todayHistory?.avoidRuleStatuses ?? {}).filter(
    (status) => status === "done",
  ).length;

  return {
    snapshot_date: today,
    net_calories: netCalories,
    target_calories: targetCalories,
    do_done_count: doDoneCount,
    do_total_count: snapshot.doRules.length,
    avoid_success_count: avoidSuccessCount,
    avoid_total_count: snapshot.avoidRules.length,
  };
}

function normalizeSnapshot(payload: unknown): DietAppSnapshot {
  const snapshot = payload as Partial<DietAppSnapshot> | null;

  return {
    foodList: Array.isArray(snapshot?.foodList) ? snapshot.foodList : [],
    doRules: Array.isArray(snapshot?.doRules) ? snapshot.doRules : [],
    avoidRules: Array.isArray(snapshot?.avoidRules) ? snapshot.avoidRules : [],
    exerciseLogs: Array.isArray(snapshot?.exerciseLogs) ? snapshot.exerciseLogs : [],
    bodyWeightKg: typeof snapshot?.bodyWeightKg === "number" ? snapshot.bodyWeightKg : 55,
    weightHistory: Array.isArray(snapshot?.weightHistory) ? snapshot.weightHistory : [],
    ruleHistory: Array.isArray(snapshot?.ruleHistory) ? snapshot.ruleHistory : [],
    onboardingProfile: snapshot?.onboardingProfile ?? null,
  };
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ enabled: false, authenticated: false, snapshot: emptySnapshot() });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ enabled: false, authenticated: true, snapshot: emptySnapshot() });
  }

  const accountKey = getAccountKey(session.user.email);

  if (!accountKey) {
    return NextResponse.json({ enabled: false, authenticated: true, snapshot: emptySnapshot() });
  }

  const [profileResult, foodsResult, exercisesResult, templatesResult, logsResult, weightsResult] =
    await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("account_key", accountKey).maybeSingle(),
      supabaseAdmin.from("food_logs").select("*").eq("account_key", accountKey).order("logged_on", { ascending: false }),
      supabaseAdmin.from("exercise_logs").select("*").eq("account_key", accountKey).order("logged_on", { ascending: false }),
      supabaseAdmin.from("habit_templates").select("*").eq("account_key", accountKey).eq("is_active", true).order("sort_order", { ascending: true }),
      supabaseAdmin.from("habit_logs").select("*").eq("account_key", accountKey).order("logged_on", { ascending: false }),
      supabaseAdmin.from("weight_logs").select("*").eq("account_key", accountKey).order("logged_on", { ascending: false }),
    ]);

  const profileRow = (profileResult.data ?? null) as ProfileRow | null;
  const foodRows = (foodsResult.data ?? []) as unknown as FoodRow[];
  const exerciseRows = (exercisesResult.data ?? []) as unknown as ExerciseRow[];
  const templateRows = (templatesResult.data ?? []) as unknown as HabitTemplateRow[];
  const logRows = (logsResult.data ?? []) as unknown as HabitLogRow[];
  const weightRows = (weightsResult.data ?? []) as unknown as WeightRow[];

  const templateMap = new Map(templateRows.map((item) => [item.id, item]));
  const doRules: RuleItem[] = [];
  const avoidRules: RuleItem[] = [];

  templateRows.forEach((item) => {
    const nextRule: RuleItem = {
      id: item.id,
      title: item.title,
      status: "pending",
    };

    if (item.type === "do") {
      doRules.push(nextRule);
    } else {
      avoidRules.push(nextRule);
    }
  });

  const historyMap = new Map<string, RuleHistoryEntry>();

  logRows.forEach((item) => {
    const template = templateMap.get(item.habit_template_id);

    if (!template) {
      return;
    }

    const entry = historyMap.get(item.logged_on) ?? {
      date: item.logged_on,
      doRuleStatuses: {},
      avoidRuleStatuses: {},
    };

    if (template.type === "do") {
      entry.doRuleStatuses[item.habit_template_id] = item.status as RuleItem["status"];
    } else {
      entry.avoidRuleStatuses[item.habit_template_id] = item.status as RuleItem["status"];
    }

    historyMap.set(item.logged_on, entry);
  });

  const onboardingProfile: OnboardingProfile | null = profileRow
    ? {
        completedAt: profileRow.created_at,
        challenge: (profileRow.challenge as OnboardingProfile["challenge"]) ?? "야식",
        pace: (profileRow.pace as OnboardingProfile["pace"]) ?? "꾸준하게",
        coachTone: (profileRow.coach_tone as OnboardingProfile["coachTone"]) ?? "발랄하게",
        currentWeightKg: Number(profileRow.current_weight_kg ?? 55),
        goalWeightKg: Number(profileRow.goal_weight_kg ?? 50),
        targetDate: profileRow.target_date ?? new Date().toISOString().slice(0, 10),
        customDailyTargetCalories: profileRow.custom_daily_target_calories ?? undefined,
      }
    : null;

  const snapshot: DietAppSnapshot = {
    foodList: foodRows.map((item) => ({
      id: item.id,
      name: item.name,
      calories: item.calories,
      mealSection: (item.meal_section as DietFoodItem["mealSection"]) ?? "간식",
      loggedAt: item.logged_on,
      portionMultiplier: Number(item.portion_multiplier ?? 1),
      consumedGrams: item.consumed_grams ?? undefined,
      source: (item.source as DietFoodItem["source"]) ?? undefined,
      note: item.note ?? undefined,
    })),
    doRules,
    avoidRules,
    exerciseLogs: exerciseRows.map((item) => ({
      id: item.id,
      name: item.name,
      minutes: item.minutes,
      burnedCalories: item.burned_calories,
      loggedAt: item.logged_on,
    })),
    bodyWeightKg:
      Number(weightRows[0]?.weight_kg ?? profileRow?.current_weight_kg ?? 55),
    weightHistory: weightRows.map((item) => ({
      id: item.id,
      date: item.logged_on,
      weightKg: Number(item.weight_kg),
    })),
    ruleHistory: [...historyMap.values()].sort((a, b) => (a.date < b.date ? 1 : -1)),
    onboardingProfile,
  };

  return NextResponse.json({
    enabled: true,
    authenticated: true,
    hasServerData: hasAnySnapshotData(snapshot),
    snapshot,
  });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ ok: false, enabled: false }, { status: 200 });
  }

  const accountKey = getAccountKey(session.user.email);

  if (!accountKey) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const snapshot = normalizeSnapshot(await request.json());
  const widgetSnapshot = buildWidgetSnapshot(snapshot);

  const profilePayload = snapshot.onboardingProfile
    ? {
        account_key: accountKey,
        display_name: session.user.name ?? null,
        challenge: snapshot.onboardingProfile.challenge,
        pace: snapshot.onboardingProfile.pace,
        coach_tone: snapshot.onboardingProfile.coachTone,
        current_weight_kg: snapshot.bodyWeightKg ?? snapshot.onboardingProfile.currentWeightKg,
        goal_weight_kg: snapshot.onboardingProfile.goalWeightKg,
        target_date: snapshot.onboardingProfile.targetDate,
        custom_daily_target_calories:
          snapshot.onboardingProfile.customDailyTargetCalories ?? null,
      }
    : null;

  if (profilePayload) {
    await supabaseAdmin
      .from("profiles")
      .upsert(profilePayload as never, { onConflict: "account_key" });
  }

  await Promise.all([
    supabaseAdmin.from("food_logs").delete().eq("account_key", accountKey),
    supabaseAdmin.from("exercise_logs").delete().eq("account_key", accountKey),
    supabaseAdmin.from("habit_logs").delete().eq("account_key", accountKey),
    supabaseAdmin.from("habit_templates").delete().eq("account_key", accountKey),
    supabaseAdmin.from("weight_logs").delete().eq("account_key", accountKey),
  ]);

  if (snapshot.foodList.length) {
    const foodPayload = snapshot.foodList.map((item) => ({
        id: item.id,
        account_key: accountKey,
        logged_on: item.loggedAt,
        meal_section: item.mealSection,
        name: item.name,
        calories: item.calories,
        portion_multiplier: item.portionMultiplier ?? 1,
        consumed_grams: item.consumedGrams ?? null,
        source: item.source ?? null,
        note: item.note ?? null,
      }));

    await supabaseAdmin.from("food_logs").insert(foodPayload as never);
  }

  if (snapshot.exerciseLogs.length) {
    const exercisePayload = snapshot.exerciseLogs.map((item) => ({
        id: item.id,
        account_key: accountKey,
        logged_on: item.loggedAt ?? new Date().toISOString().slice(0, 10),
        name: item.name,
        minutes: item.minutes,
        burned_calories: item.burnedCalories,
      }));

    await supabaseAdmin.from("exercise_logs").insert(exercisePayload as never);
  }

  const habitTemplates = [
    ...snapshot.doRules.map((item, index) => ({
      id: item.id,
      account_key: accountKey,
      type: "do",
      title: item.title,
      sort_order: index,
      is_active: true,
    })),
    ...snapshot.avoidRules.map((item, index) => ({
      id: item.id,
      account_key: accountKey,
      type: "avoid",
      title: item.title,
      sort_order: index,
      is_active: true,
    })),
  ];

  if (habitTemplates.length) {
    await supabaseAdmin.from("habit_templates").insert(habitTemplates as never);
  }

  const habitLogs = snapshot.ruleHistory.flatMap((entry) => [
    ...Object.entries(entry.doRuleStatuses).map(([habitTemplateId, status]) => ({
      account_key: accountKey,
      habit_template_id: habitTemplateId,
      logged_on: entry.date,
      status,
    })),
    ...Object.entries(entry.avoidRuleStatuses).map(([habitTemplateId, status]) => ({
      account_key: accountKey,
      habit_template_id: habitTemplateId,
      logged_on: entry.date,
      status,
    })),
  ]);

  if (habitLogs.length) {
    await supabaseAdmin.from("habit_logs").insert(habitLogs as never);
  }

  if (snapshot.weightHistory.length) {
    const weightPayload = snapshot.weightHistory.map((item) => ({
        id: item.id,
        account_key: accountKey,
        logged_on: item.date,
        weight_kg: item.weightKg,
      }));

    await supabaseAdmin.from("weight_logs").insert(weightPayload as never);
  }

  await supabaseAdmin.from("widget_snapshots").upsert(
    ({
      account_key: accountKey,
      ...widgetSnapshot,
    }) as never,
    { onConflict: "account_key" },
  );

  return NextResponse.json({ ok: true });
}
