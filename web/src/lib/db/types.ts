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
          avatar_url: string;
          timezone: string;
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
          avatar_url?: string;
          timezone?: string;
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
          avatar_url?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
          visible_in_groups: boolean;
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
          visible_in_groups?: boolean;
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
          visible_in_groups?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      groups: {
        Row: {
          id: string; name: string; emoji: string; color: string;
          description: string; motto: string; motto_author: string;
          welcome_message: string; member_limit: number; challenge_creator: string;
          created_by: string; invite_code: string; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; name: string; emoji?: string; color?: string;
          description?: string; motto?: string; motto_author?: string;
          welcome_message?: string; member_limit?: number; challenge_creator?: string;
          created_by: string; invite_code: string; created_at?: string; updated_at?: string;
        };
        Update: {
          name?: string; emoji?: string; color?: string; description?: string;
          motto?: string; motto_author?: string; welcome_message?: string;
          member_limit?: number; challenge_creator?: string; invite_code?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      group_members: {
        Row: {
          id: string; group_id: string; user_id: string;
          role: string; joined_at: string; last_seen_at: string | null; muted: boolean;
        };
        Insert: {
          id?: string; group_id: string; user_id: string;
          role?: string; joined_at?: string; last_seen_at?: string | null; muted?: boolean;
        };
        Update: { role?: string; last_seen_at?: string | null; muted?: boolean; };
        Relationships: [];
      };
      group_challenges: {
        Row: {
          id: string; group_id: string; created_by: string; name: string;
          emoji: string; color: string; habit_type: string; target: string;
          target_comparison: string; schedule: string; custom_days: number[] | null;
          start_date: string; end_date: string; created_at: string;
        };
        Insert: {
          id?: string; group_id: string; created_by: string; name: string;
          emoji?: string; color?: string; habit_type?: string; target?: string;
          target_comparison?: string; schedule?: string; custom_days?: number[] | null;
          start_date: string; end_date: string; created_at?: string;
        };
        Update: {
          name?: string; emoji?: string; color?: string; habit_type?: string;
          target?: string; target_comparison?: string; schedule?: string; custom_days?: number[] | null; end_date?: string;
        };
        Relationships: [];
      };
      group_challenge_members: {
        Row: {
          id: string; challenge_id: string; user_id: string;
          habit_id: string | null; joined_at: string;
        };
        Insert: {
          id?: string; challenge_id: string; user_id: string;
          joined_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      group_challenge_checkins: {
        Row: {
          id: string; challenge_id: string; user_id: string;
          date: string; actual: string | null; done: boolean; created_at: string;
        };
        Insert: {
          id?: string; challenge_id: string; user_id: string;
          date: string; actual?: string | null; done?: boolean; created_at?: string;
        };
        Update: { actual?: string | null; done?: boolean; };
        Relationships: [];
      };
      group_reactions: {
        Row: {
          id: string; group_id: string; from_user_id: string;
          entry_id: string; emoji: string; created_at: string;
        };
        Insert: {
          id?: string; group_id: string; from_user_id: string;
          entry_id: string; emoji: string; created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      group_messages: {
        Row: {
          id: string; group_id: string; user_id: string;
          content: string; is_pinned: boolean; created_at: string;
        };
        Insert: {
          id?: string; group_id: string; user_id: string;
          content: string; is_pinned?: boolean; created_at?: string;
        };
        Update: { is_pinned?: boolean; };
        Relationships: [];
      };
      group_message_reactions: {
        Row: {
          id: string; message_id: string; group_id: string;
          user_id: string; emoji: string; created_at: string;
        };
        Insert: {
          id?: string; message_id: string; group_id: string;
          user_id: string; emoji: string; created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      group_nudges: {
        Row: {
          id: string; group_id: string; from_user_id: string;
          to_user_id: string; seen: boolean; sent_date: string; created_at: string;
        };
        Insert: {
          id?: string; group_id: string; from_user_id: string;
          to_user_id: string; seen?: boolean; sent_date: string; created_at?: string;
        };
        Update: { seen?: boolean; };
        Relationships: [];
      };
      invite_code_attempts: {
        Row: {
          id: string; user_id: string; attempted_at: string;
        };
        Insert: {
          id?: string; user_id: string; attempted_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
