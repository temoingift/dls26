export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      dm_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender_id: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender_id: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dm_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "dm_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      dm_threads: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          user_a?: string
          user_b?: string
        }
        Relationships: []
      }
      live_chat: {
        Row: {
          avatar_url: string | null
          body: string
          created_at: string
          id: string
          match_id: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          body: string
          created_at?: string
          id?: string
          match_id: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          body?: string
          created_at?: string
          id?: string
          match_id?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_chat_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "live_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      live_matches: {
        Row: {
          away_player: string
          away_score: number
          ended_at: string | null
          home_player: string
          home_score: number
          host_id: string
          id: string
          join_code: string
          recording_url: string | null
          started_at: string
          status: Database["public"]["Enums"]["live_match_status"]
          tournament_id: string | null
        }
        Insert: {
          away_player: string
          away_score?: number
          ended_at?: string | null
          home_player: string
          home_score?: number
          host_id: string
          id?: string
          join_code: string
          recording_url?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["live_match_status"]
          tournament_id?: string | null
        }
        Update: {
          away_player?: string
          away_score?: number
          ended_at?: string | null
          home_player?: string
          home_score?: number
          host_id?: string
          id?: string
          join_code?: string
          recording_url?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["live_match_status"]
          tournament_id?: string | null
        }
        Relationships: []
      }
      live_signaling: {
        Row: {
          created_at: string
          from_user: string
          id: string
          kind: string
          match_id: string
          payload: Json
          to_user: string | null
        }
        Insert: {
          created_at?: string
          from_user: string
          id?: string
          kind: string
          match_id: string
          payload: Json
          to_user?: string | null
        }
        Update: {
          created_at?: string
          from_user?: string
          id?: string
          kind?: string
          match_id?: string
          payload?: Json
          to_user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_signaling_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "live_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          losses: number
          phone: string
          updated_at: string
          username: string
          wins: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          losses?: number
          phone: string
          updated_at?: string
          username: string
          wins?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          losses?: number
          phone?: string
          updated_at?: string
          username?: string
          wins?: number
        }
        Relationships: []
      }
      tournament_participants: {
        Row: {
          approved_at: string | null
          created_at: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["participation_status"]
          tournament_id: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["participation_status"]
          tournament_id: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["participation_status"]
          tournament_id?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          entry_fee: number
          id: string
          max_players: number
          momo_instructions: string | null
          momo_number: string | null
          mvp_reward: string | null
          name: string
          num_groups: number
          prize_amount: number
          second_prize: number
          start_date: string
          status: Database["public"]["Enums"]["tournament_status"]
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          entry_fee?: number
          id?: string
          max_players?: number
          momo_instructions?: string | null
          momo_number?: string | null
          mvp_reward?: string | null
          name: string
          num_groups?: number
          prize_amount?: number
          second_prize?: number
          start_date: string
          status?: Database["public"]["Enums"]["tournament_status"]
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          entry_fee?: number
          id?: string
          max_players?: number
          momo_instructions?: string | null
          momo_number?: string | null
          mvp_reward?: string | null
          name?: string
          num_groups?: number
          prize_amount?: number
          second_prize?: number
          start_date?: string
          status?: Database["public"]["Enums"]["tournament_status"]
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "player"
      live_match_status: "live" | "ended"
      participation_status:
        | "pending_payment"
        | "pending_approval"
        | "approved"
        | "rejected"
      tournament_status:
        | "upcoming"
        | "open"
        | "ongoing"
        | "completed"
        | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "player"],
      live_match_status: ["live", "ended"],
      participation_status: [
        "pending_payment",
        "pending_approval",
        "approved",
        "rejected",
      ],
      tournament_status: [
        "upcoming",
        "open",
        "ongoing",
        "completed",
        "archived",
      ],
    },
  },
} as const
