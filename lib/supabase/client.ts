import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function hasSupabaseBrowserEnv() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function createBrowserSupabaseClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase browser env is missing.");
  }

  return createClient<Database>(supabaseUrl, supabasePublishableKey);
}

export const supabaseBrowser = hasSupabaseBrowserEnv() ? createBrowserSupabaseClient() : null;
