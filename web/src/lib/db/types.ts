export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          app_start_date: string;
          user_name: string;
          user_emoji: string;
          user_about: string;
          weight_kg: string;
          height_cm: string;
          theme: string;
          font_style: string;
          font_size: string;
          custom_quote_text: string;
          custom_quote_author: string;
          habit_order: string[];
          sidebar_collapsed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          app_start_date?: string;
          user_name?: string;
          user_emoji?: string;
          user_about?: string;
          weight_kg?: string;
          height_cm?: string;
          theme?: string;
          font_style?: string;
          font_size?: string;
          custom_quote_text?: string;
          custom_quote_author?: string;
          habit_order?: string[];
          sidebar_collapsed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          app_start_date?: string;
          user_name?: string;
          user_emoji?: string;
          user_about?: string;
          weight_kg?: string;
          height_cm?: string;
          theme?: string;
          font_style?: string;
          font_size?: string;
          custom_quote_text?: string;
          custom_quote_author?: string;
          habit_order?: string[];
          sidebar_collapsed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          target: string;
          schedule: string;
          custom_days: number[] | null;
          start_date: string;
          emoji: string;
          color: string;
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type?: string;
          target?: string;
          schedule?: string;
          custom_days?: number[] | null;
          start_date?: string;
          emoji?: string;
          color?: string;
          archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: string;
          target?: string;
          schedule?: string;
          custom_days?: number[] | null;
          start_date?: string;
          emoji?: string;
          color?: string;
          archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      habit_entries: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          date: string;
          status: string;
          actual: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          habit_id: string;
          date: string;
          status?: string;
          actual?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          habit_id?: string;
          date?: string;
          status?: string;
          actual?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      journals: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          wake_up_time: string;
          intention: string;
          notes: string;
          wins: string;
          challenges: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          wake_up_time?: string;
          intention?: string;
          notes?: string;
          wins?: string;
          challenges?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          wake_up_time?: string;
          intention?: string;
          notes?: string;
          wins?: string;
          challenges?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
