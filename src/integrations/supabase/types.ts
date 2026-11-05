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
      checkout_drafts: {
        Row: {
          converted: boolean
          customer_name: string
          items: Json
          phone: string
          total: number
          updated_at: string
        }
        Insert: {
          converted?: boolean
          customer_name?: string
          items?: Json
          phone: string
          total?: number
          updated_at?: string
        }
        Update: {
          converted?: boolean
          customer_name?: string
          items?: Json
          phone?: string
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      club_contract: {
        Row: {
          agreed: boolean
          billing_mode: string
          id: number
          monthly_fee: number
          percentage: number
        }
        Insert: {
          agreed?: boolean
          billing_mode?: string
          id?: number
          monthly_fee?: number
          percentage?: number
        }
        Update: {
          agreed?: boolean
          billing_mode?: string
          id?: number
          monthly_fee?: number
          percentage?: number
        }
        Relationships: []
      }
      club_members: {
        Row: {
          created_at: string
          credits: number
          id: string
          is_demo: boolean
          monthly_price: number
          period_end: string
          period_start: string
          phone: string
          plan_id: string
          redemption_token: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits: number
          id?: string
          is_demo?: boolean
          monthly_price: number
          period_end?: string
          period_start?: string
          phone: string
          plan_id: string
          redemption_token?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          is_demo?: boolean
          monthly_price?: number
          period_end?: string
          period_start?: string
          phone?: string
          plan_id?: string
          redemption_token?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "club_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      club_plans: {
        Row: {
          active: boolean
          eligible_product_ids: string[]
          free_delivery: boolean
          id: string
          monthly_price: number
          name: string
          pizza_quota: number
          priority: boolean
        }
        Insert: {
          active?: boolean
          eligible_product_ids?: string[]
          free_delivery?: boolean
          id?: string
          monthly_price: number
          name: string
          pizza_quota: number
          priority?: boolean
        }
        Update: {
          active?: boolean
          eligible_product_ids?: string[]
          free_delivery?: boolean
          id?: string
          monthly_price?: number
          name?: string
          pizza_quota?: number
          priority?: boolean
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          expires_on: string | null
          id: string
          minimum: number
          percentage: number
        }
        Insert: {
          active?: boolean
          code: string
          expires_on?: string | null
          id?: string
          minimum?: number
          percentage: number
        }
        Update: {
          active?: boolean
          code?: string
          expires_on?: string | null
          id?: string
          minimum?: number
          percentage?: number
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          active: boolean
          fee: number
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          fee: number
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          fee?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      dining_sessions: {
        Row: {
          bill_requested_at: string | null
          closed_at: string | null
          id: string
          label: string
          people: number
          service_amount: number
          service_percentage: number
          started_at: string
          subtotal: number
          table_id: string
          total: number
        }
        Insert: {
          bill_requested_at?: string | null
          closed_at?: string | null
          id?: string
          label: string
          people?: number
          service_amount?: number
          service_percentage?: number
          started_at: string
          subtotal?: number
          table_id: string
          total?: number
        }
        Update: {
          bill_requested_at?: string | null
          closed_at?: string | null
          id?: string
          label?: string
          people?: number
          service_amount?: number
          service_percentage?: number
          started_at?: string
          subtotal?: number
          table_id?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "dining_sessions_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "dining_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      dining_tables: {
        Row: {
          active: boolean
          created_at: string
          current_session_id: string | null
          id: string
          label: string
          session_started_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          current_session_id?: string | null
          id?: string
          label: string
          session_started_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          current_session_id?: string | null
          id?: string
          label?: string
          session_started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dining_tables_current_session_id_fkey"
            columns: ["current_session_id"]
            isOneToOne: false
            referencedRelation: "dining_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          description: string
          id: string
          spent_on: string
        }
        Insert: {
          amount: number
          category?: string
          description: string
          id?: string
          spent_on?: string
        }
        Update: {
          amount?: number
          category?: string
          description?: string
          id?: string
          spent_on?: string
        }
        Relationships: []
      }
      license_audit: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          next_state: Json
          previous_state: Json | null
          reason: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          next_state: Json
          previous_state?: Json | null
          reason: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          next_state?: Json
          previous_state?: Json | null
          reason?: string
        }
        Relationships: []
      }
      loyalty_accounts: {
        Row: {
          phone: string
          points: number
          updated_at: string
        }
        Insert: {
          phone: string
          points?: number
          updated_at?: string
        }
        Update: {
          phone?: string
          points?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_reviews: {
        Row: {
          created_at: string
          dough: number
          flavor: number
          id: string
          message: string
          order_id: string
          temperature: number
        }
        Insert: {
          created_at?: string
          dough: number
          flavor: number
          id?: string
          message?: string
          order_id: string
          temperature: number
        }
        Update: {
          created_at?: string
          dough?: number
          flavor?: number
          id?: string
          message?: string
          order_id?: string
          temperature?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          club_credits_used: number
          club_member_id: string | null
          created_at: string
          customer_name: string
          delivery_fee: number
          delivery_method: string
          delivery_zone: string
          dining_session_id: string | null
          discount: number
          id: string
          is_demo: boolean
          items: Json
          number: number
          people: number
          phone: string
          points_earned: number
          points_redeemed: number
          review_token: string
          scheduled_at: string | null
          status: string
          status_updated_at: string
          table_id: string | null
          total: number
          vip: boolean
        }
        Insert: {
          address?: string
          club_credits_used?: number
          club_member_id?: string | null
          created_at?: string
          customer_name: string
          delivery_fee?: number
          delivery_method?: string
          delivery_zone?: string
          dining_session_id?: string | null
          discount?: number
          id?: string
          is_demo?: boolean
          items: Json
          number?: never
          people?: number
          phone: string
          points_earned?: number
          points_redeemed?: number
          review_token?: string
          scheduled_at?: string | null
          status?: string
          status_updated_at?: string
          table_id?: string | null
          total: number
          vip?: boolean
        }
        Update: {
          address?: string
          club_credits_used?: number
          club_member_id?: string | null
          created_at?: string
          customer_name?: string
          delivery_fee?: number
          delivery_method?: string
          delivery_zone?: string
          dining_session_id?: string | null
          discount?: number
          id?: string
          is_demo?: boolean
          items?: Json
          number?: never
          people?: number
          phone?: string
          points_earned?: number
          points_redeemed?: number
          review_token?: string
          scheduled_at?: string | null
          status?: string
          status_updated_at?: string
          table_id?: string | null
          total?: number
          vip?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "orders_dining_session_id_fkey"
            columns: ["dining_session_id"]
            isOneToOne: false
            referencedRelation: "dining_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          due_at: string
          external_reference: string
          id: string
          license_id: number
          method: string | null
          paid_at: string | null
          provider_payment_id: string | null
          state: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          due_at: string
          external_reference?: string
          id?: string
          license_id?: number
          method?: string | null
          paid_at?: string | null
          provider_payment_id?: string | null
          state?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          due_at?: string
          external_reference?: string
          id?: string
          license_id?: number
          method?: string | null
          paid_at?: string | null
          provider_payment_id?: string | null
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_invoices_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "store_license"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_operators: {
        Row: {
          user_id: string
        }
        Insert: {
          user_id: string
        }
        Update: {
          user_id?: string
        }
        Relationships: []
      }
      print_jobs: {
        Row: {
          claimed_at: string | null
          created_at: string
          device_id: string | null
          id: string
          order_id: string
          printed_at: string | null
          state: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          order_id: string
          printed_at?: string | null
          state?: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          order_id?: string
          printed_at?: string | null
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "print_jobs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          category: string
          cost: number
          description: string
          featured: boolean
          id: string
          image_key: string
          image_url: string
          name: string
          price: number
          sort_order: number
          video_url: string
        }
        Insert: {
          active?: boolean
          category?: string
          cost?: number
          description?: string
          featured?: boolean
          id?: string
          image_key?: string
          image_url?: string
          name: string
          price: number
          sort_order?: number
          video_url?: string
        }
        Update: {
          active?: boolean
          category?: string
          cost?: number
          description?: string
          featured?: boolean
          id?: string
          image_key?: string
          image_url?: string
          name?: string
          price?: number
          sort_order?: number
          video_url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
        }
        Relationships: []
      }
      service_reviews: {
        Row: {
          courtesy: number
          created_at: string
          experience: number
          id: string
          message: string
          session_id: string
          speed: number
        }
        Insert: {
          courtesy: number
          created_at?: string
          experience: number
          id?: string
          message?: string
          session_id: string
          speed: number
        }
        Update: {
          courtesy?: number
          created_at?: string
          experience?: number
          id?: string
          message?: string
          session_id?: string
          speed?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "dining_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_carts: {
        Row: {
          created_at: string
          id: string
          items: Json
        }
        Insert: {
          created_at?: string
          id?: string
          items: Json
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
        }
        Relationships: []
      }
      store_license: {
        Row: {
          due_at: string | null
          id: number
          mode: string
          monthly_price: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          due_at?: string | null
          id?: number
          mode?: string
          monthly_price?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          due_at?: string | null
          id?: number
          mode?: string
          monthly_price?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          auto_print_enabled: boolean
          closes_at: string
          club_enabled: boolean
          daily_goal: number
          delivery_zones_enabled: boolean
          demand_mode: string
          demo_mode: boolean
          dine_in_enabled: boolean
          establishment_name: string
          free_delivery_minimum: number
          id: number
          is_open: boolean
          logo_url: string
          loyalty_enabled: boolean
          monthly_goal: number
          opens_at: string
          paper_width: number
          points_per_real: number
          reward_points: number
          reward_value: number
          scheduling_enabled: boolean
          share_cart_enabled: boolean
          whatsapp_number: string
        }
        Insert: {
          auto_print_enabled?: boolean
          closes_at?: string
          club_enabled?: boolean
          daily_goal?: number
          delivery_zones_enabled?: boolean
          demand_mode?: string
          demo_mode?: boolean
          dine_in_enabled?: boolean
          establishment_name?: string
          free_delivery_minimum?: number
          id?: number
          is_open?: boolean
          logo_url?: string
          loyalty_enabled?: boolean
          monthly_goal?: number
          opens_at?: string
          paper_width?: number
          points_per_real?: number
          reward_points?: number
          reward_value?: number
          scheduling_enabled?: boolean
          share_cart_enabled?: boolean
          whatsapp_number?: string
        }
        Update: {
          auto_print_enabled?: boolean
          closes_at?: string
          club_enabled?: boolean
          daily_goal?: number
          delivery_zones_enabled?: boolean
          demand_mode?: string
          demo_mode?: boolean
          dine_in_enabled?: boolean
          establishment_name?: string
          free_delivery_minimum?: number
          id?: number
          is_open?: boolean
          logo_url?: string
          loyalty_enabled?: boolean
          monthly_goal?: number
          opens_at?: string
          paper_width?: number
          points_per_real?: number
          reward_points?: number
          reward_value?: number
          scheduling_enabled?: boolean
          share_cart_enabled?: boolean
          whatsapp_number?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waiter_calls: {
        Row: {
          created_at: string
          id: string
          kind: string
          resolved_at: string | null
          table_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          resolved_at?: string | null
          table_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          resolved_at?: string | null
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waiter_calls_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "dining_tables"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assert_store_license: { Args: never; Returns: undefined }
      claim_print: {
        Args: { _device: string }
        Returns: {
          claimed_at: string | null
          created_at: string
          device_id: string | null
          id: string
          order_id: string
          printed_at: string | null
          state: string
        }[]
        SetofOptions: {
          from: "*"
          to: "print_jobs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      close_dining_session: {
        Args: {
          _people: number
          _service: number
          _session: string
          _subtotal: number
          _table: string
        }
        Returns: string
      }
      configure_store_license: {
        Args: { _due: string; _mode: string; _price: number; _reason: string }
        Returns: undefined
      }
      demand_count: { Args: never; Returns: number }
      finish_print: {
        Args: { _device: string; _job: string; _success: boolean }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_club_order: {
        Args: {
          _credits: number
          _member: string
          _order: Json
          _token: string
        }
        Returns: string
      }
      license_allows_operation: { Args: never; Returns: boolean }
      private_review_state: {
        Args: { _order: string; _token: string }
        Returns: {
          reviewed: boolean
          scheduled_at: string
        }[]
      }
      requeue_print: { Args: { _job: string }; Returns: boolean }
      set_order_status: {
        Args: { _id: string; _status: string }
        Returns: undefined
      }
      submit_review: {
        Args: {
          _dough: number
          _flavor: number
          _message: string
          _order: string
          _temperature: number
          _token: string
        }
        Returns: string
      }
      submit_service_review: {
        Args: {
          _courtesy: number
          _experience: number
          _message: string
          _order: string
          _speed: number
          _token: string
        }
        Returns: string
      }
      track_order: {
        Args: { _id: string }
        Returns: {
          created_at: string
          delivery_method: string
          items: Json
          number: number
          status: string
          status_updated_at: string
          total: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "staff"
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
      app_role: ["admin", "staff"],
    },
  },
} as const
