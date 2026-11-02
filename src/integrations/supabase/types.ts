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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          actor_id: string | null
          created_at: string
          details: Json
          id: string
          intern_id: string | null
          lead_id: string | null
          message: string
          type: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          intern_id?: string | null
          lead_id?: string | null
          message?: string
          type: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          intern_id?: string | null
          lead_id?: string | null
          message?: string
          type?: string
        }
        Relationships: []
      }
      follow_up_logs: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          intern_id: string | null
          lead_id: string
          scheduled_for: string | null
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          intern_id?: string | null
          lead_id: string
          scheduled_for?: string | null
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          intern_id?: string | null
          lead_id?: string
          scheduled_for?: string | null
        }
        Relationships: []
      }
      interns: {
        Row: {
          code: string
          created_at: string
          department: string
          designation: string
          email: string
          id: string
          is_active: boolean
          last_activity_at: string | null
          name: string
          permissions: Json
          phone: string
          start_date: string
          updated_at: string
          user_id: string | null
          working_hours: number
        }
        Insert: {
          code: string
          created_at?: string
          department?: string
          designation?: string
          email: string
          id?: string
          is_active?: boolean
          last_activity_at?: string | null
          name: string
          permissions?: Json
          phone?: string
          start_date?: string
          updated_at?: string
          user_id?: string | null
          working_hours?: number
        }
        Update: {
          code?: string
          created_at?: string
          department?: string
          designation?: string
          email?: string
          id?: string
          is_active?: boolean
          last_activity_at?: string | null
          name?: string
          permissions?: Json
          phone?: string
          start_date?: string
          updated_at?: string
          user_id?: string | null
          working_hours?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          archived: boolean
          company: string
          contact_person: string
          created_at: string
          created_by: string | null
          email: string
          id: string
          industry: string
          intern_id: string | null
          location: string
          next_follow_up: string | null
          notes: string
          phone: string
          priority: string
          status: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          company: string
          contact_person?: string
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          industry?: string
          intern_id?: string | null
          location?: string
          next_follow_up?: string | null
          notes?: string
          phone?: string
          priority?: string
          status?: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          company?: string
          contact_person?: string
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          industry?: string
          intern_id?: string | null
          location?: string
          next_follow_up?: string | null
          notes?: string
          phone?: string
          priority?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_intern_id_fkey"
            columns: ["intern_id"]
            isOneToOne: false
            referencedRelation: "interns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          email: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          updated_at?: string
          user_id?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      work_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          intern_id: string
          started_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          intern_id: string
          started_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          intern_id?: string
          started_at?: string
        }
        Relationships: []
      }
      workspace_settings: {
        Row: {
          compact_table: boolean
          company_name: string
          default_follow_up_days: number
          default_target_leads: number
          notify_overdue: boolean
          notify_upcoming: boolean
          singleton: boolean
          updated_at: string
        }
        Insert: {
          compact_table?: boolean
          company_name?: string
          default_follow_up_days?: number
          default_target_leads?: number
          notify_overdue?: boolean
          notify_upcoming?: boolean
          singleton?: boolean
          updated_at?: string
        }
        Update: {
          compact_table?: boolean
          company_name?: string
          default_follow_up_days?: number
          default_target_leads?: number
          notify_overdue?: boolean
          notify_upcoming?: boolean
          singleton?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_crm_permission: { Args: { _permission: string }; Returns: boolean }
      is_founder: { Args: never; Returns: boolean }
      owns_intern: { Args: { _intern_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "founder" | "intern"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["founder", "intern"],
    },
  },
} as const
