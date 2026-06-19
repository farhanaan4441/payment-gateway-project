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
      artist_profiles: {
        Row: {
          base_price_min: number | null
          cover_image_url: string | null
          created_at: string
          is_open: boolean
          long_bio: string | null
          payout_account_name: string | null
          payout_account_number: string | null
          payout_method: Database["public"]["Enums"]["payout_method"] | null
          payout_verified: boolean
          style_tags: string[] | null
          tagline: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          base_price_min?: number | null
          cover_image_url?: string | null
          created_at?: string
          is_open?: boolean
          long_bio?: string | null
          payout_account_name?: string | null
          payout_account_number?: string | null
          payout_method?: Database["public"]["Enums"]["payout_method"] | null
          payout_verified?: boolean
          style_tags?: string[] | null
          tagline?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          base_price_min?: number | null
          cover_image_url?: string | null
          created_at?: string
          is_open?: boolean
          long_bio?: string | null
          payout_account_name?: string | null
          payout_account_number?: string | null
          payout_method?: Database["public"]["Enums"]["payout_method"] | null
          payout_verified?: boolean
          style_tags?: string[] | null
          tagline?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          name: string
          position: number
          slug: string
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          position?: number
          slug: string
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          position?: number
          slug?: string
        }
        Relationships: []
      }
      commission_images: {
        Row: {
          commission_id: string
          created_at: string
          id: string
          position: number
          url: string
        }
        Insert: {
          commission_id: string
          created_at?: string
          id?: string
          position?: number
          url: string
        }
        Update: {
          commission_id?: string
          created_at?: string
          id?: string
          position?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_images_commission_id_fkey"
            columns: ["commission_id"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          artist_id: string
          base_price: number
          category_id: string | null
          cover_image_url: string | null
          created_at: string
          description: string
          id: string
          is_active: boolean
          slots_available: number
          slug: string
          title: string
          turnaround_days: number
          updated_at: string
        }
        Insert: {
          artist_id: string
          base_price: number
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          slots_available?: number
          slug: string
          title: string
          turnaround_days?: number
          updated_at?: string
        }
        Update: {
          artist_id?: string
          base_price?: number
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          slots_available?: number
          slug?: string
          title?: string
          turnaround_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_artist_profiles_fk"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          opener_id: string
          order_id: string
          reason: string
          resolution: string | null
          status: Database["public"]["Enums"]["dispute_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          opener_id: string
          order_id: string
          reason: string
          resolution?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          opener_id?: string
          order_id?: string
          reason?: string
          resolution?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_messages: {
        Row: {
          attachment_url: string | null
          content: string | null
          created_at: string
          id: string
          order_id: string
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          content?: string | null
          created_at?: string
          id?: string
          order_id: string
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          content?: string | null
          created_at?: string
          id?: string
          order_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_messages_sender_profiles_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          artist_id: string
          awaiting_confirmation_at: string | null
          brief: string
          budget_idr: number
          buyer_id: string
          commission_id: string | null
          completed_at: string | null
          created_at: string
          deadline: string | null
          delivery_note: string | null
          delivery_url: string | null
          id: string
          reference_url: string | null
          service_fee: number
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          artist_id: string
          awaiting_confirmation_at?: string | null
          brief: string
          budget_idr: number
          buyer_id: string
          commission_id?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          delivery_note?: string | null
          delivery_url?: string | null
          id?: string
          reference_url?: string | null
          service_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          artist_id?: string
          awaiting_confirmation_at?: string | null
          brief?: string
          budget_idr?: number
          buyer_id?: string
          commission_id?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          delivery_note?: string | null
          delivery_url?: string | null
          id?: string
          reference_url?: string | null
          service_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_artist_profiles_fk"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_buyer_profiles_fk"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_commission_id_fkey"
            columns: ["commission_id"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          order_id: string
          provider: string
          provider_txn_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method: string
          order_id: string
          provider?: string
          provider_txn_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          order_id?: string
          provider?: string
          provider_txn_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          account_name: string
          account_number: string
          amount: number
          artist_id: string
          created_at: string
          id: string
          method: Database["public"]["Enums"]["payout_method"]
          provider_txn_id: string | null
          status: Database["public"]["Enums"]["payout_status"]
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          amount: number
          artist_id: string
          created_at?: string
          id?: string
          method: Database["public"]["Enums"]["payout_method"]
          provider_txn_id?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          amount?: number
          artist_id?: string
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["payout_method"]
          provider_txn_id?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          location: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id: string
          location?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          location?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          artist_id: string
          buyer_id: string
          content: string | null
          created_at: string
          id: string
          order_id: string
          rating: number
        }
        Insert: {
          artist_id: string
          buyer_id: string
          content?: string | null
          created_at?: string
          id?: string
          order_id: string
          rating: number
        }
        Update: {
          artist_id?: string
          buyer_id?: string
          content?: string | null
          created_at?: string
          id?: string
          order_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          note: string | null
          order_id: string | null
          payout_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string | null
          payout_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string | null
          payout_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "buyer" | "artist" | "admin"
      dispute_status:
        | "open"
        | "reviewing"
        | "resolved_buyer"
        | "resolved_artist"
        | "resolved_split"
      order_status:
        | "pending_payment"
        | "paid"
        | "in_progress"
        | "awaiting_confirmation"
        | "completed"
        | "cancelled"
        | "disputed"
        | "refunded"
      payment_status: "pending" | "succeeded" | "failed" | "refunded"
      payout_method: "bank_transfer" | "gopay" | "ovo" | "dana" | "shopeepay"
      payout_status: "pending" | "processing" | "paid" | "failed"
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
      app_role: ["buyer", "artist", "admin"],
      dispute_status: [
        "open",
        "reviewing",
        "resolved_buyer",
        "resolved_artist",
        "resolved_split",
      ],
      order_status: [
        "pending_payment",
        "paid",
        "in_progress",
        "awaiting_confirmation",
        "completed",
        "cancelled",
        "disputed",
        "refunded",
      ],
      payment_status: ["pending", "succeeded", "failed", "refunded"],
      payout_method: ["bank_transfer", "gopay", "ovo", "dana", "shopeepay"],
      payout_status: ["pending", "processing", "paid", "failed"],
    },
  },
} as const
