export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
          updated_at: string;
        };
        Insert: {
          account_key: string;
          display_name?: string | null;
          challenge?: string | null;
          pace?: string | null;
          coach_tone?: string | null;
          current_weight_kg?: number | null;
          goal_weight_kg?: number | null;
          target_date?: string | null;
          custom_daily_target_calories?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      food_logs: {
        Row: {
          id: string;
          account_key: string;
          logged_on: string;
          meal_section: string | null;
          name: string;
          calories: number;
          portion_multiplier: number;
          consumed_grams: number | null;
          source: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_key: string;
          logged_on: string;
          meal_section?: string | null;
          name: string;
          calories: number;
          portion_multiplier?: number;
          consumed_grams?: number | null;
          source?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["food_logs"]["Insert"]>;
      };
      exercise_logs: {
        Row: {
          id: string;
          account_key: string;
          logged_on: string;
          name: string;
          minutes: number;
          burned_calories: number;
          met: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_key: string;
          logged_on: string;
          name: string;
          minutes: number;
          burned_calories: number;
          met?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["exercise_logs"]["Insert"]>;
      };
      habit_templates: {
        Row: {
          id: string;
          account_key: string;
          type: string;
          title: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_key: string;
          type: string;
          title: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["habit_templates"]["Insert"]>;
      };
      habit_logs: {
        Row: {
          id: string;
          account_key: string;
          habit_template_id: string;
          logged_on: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_key: string;
          habit_template_id: string;
          logged_on: string;
          status: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["habit_logs"]["Insert"]>;
      };
      weight_logs: {
        Row: {
          id: string;
          account_key: string;
          logged_on: string;
          weight_kg: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_key: string;
          logged_on: string;
          weight_kg: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["weight_logs"]["Insert"]>;
      };
      widget_snapshots: {
        Row: {
          account_key: string;
          snapshot_date: string;
          net_calories: number;
          target_calories: number;
          do_done_count: number;
          do_total_count: number;
          avoid_success_count: number;
          avoid_total_count: number;
          updated_at: string;
        };
        Insert: {
          account_key: string;
          snapshot_date: string;
          net_calories: number;
          target_calories: number;
          do_done_count: number;
          do_total_count: number;
          avoid_success_count: number;
          avoid_total_count: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["widget_snapshots"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
