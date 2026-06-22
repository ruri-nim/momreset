import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type DBClient = SupabaseClient<Database>;

export async function upsertProfile(
  client: DBClient,
  profile: Database["public"]["Tables"]["profiles"]["Insert"],
) {
  return client.from("profiles").upsert(profile as never, { onConflict: "account_key" }).select().single();
}

export async function insertFoodLog(
  client: DBClient,
  payload: Database["public"]["Tables"]["food_logs"]["Insert"],
) {
  return client.from("food_logs").insert(payload as never).select().single();
}

export async function listFoodLogsByDateRange(
  client: DBClient,
  userId: string,
  startDate: string,
  endDate: string,
) {
  return client
    .from("food_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("logged_on", startDate)
    .lte("logged_on", endDate)
    .order("logged_on", { ascending: false });
}

export async function insertExerciseLog(
  client: DBClient,
  payload: Database["public"]["Tables"]["exercise_logs"]["Insert"],
) {
  return client.from("exercise_logs").insert(payload as never).select().single();
}

export async function upsertHabitTemplate(
  client: DBClient,
  payload: Database["public"]["Tables"]["habit_templates"]["Insert"],
) {
  return client
    .from("habit_templates")
    .upsert(payload as never, { onConflict: "account_key,type,title" })
    .select()
    .single();
}

export async function upsertHabitLog(
  client: DBClient,
  payload: Database["public"]["Tables"]["habit_logs"]["Insert"],
) {
  return client
    .from("habit_logs")
    .upsert(payload as never, { onConflict: "account_key,habit_template_id,logged_on" })
    .select()
    .single();
}

export async function saveWeightLog(
  client: DBClient,
  payload: Database["public"]["Tables"]["weight_logs"]["Insert"],
) {
  return client
    .from("weight_logs")
    .upsert(payload as never, { onConflict: "account_key,logged_on" })
    .select()
    .single();
}

export async function saveWidgetSnapshot(
  client: DBClient,
  payload: Database["public"]["Tables"]["widget_snapshots"]["Insert"],
) {
  return client
    .from("widget_snapshots")
    .upsert(payload as never, { onConflict: "account_key" })
    .select()
    .single();
}
