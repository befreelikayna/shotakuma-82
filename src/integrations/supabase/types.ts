export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      countdown_settings: {
        Row: {
          background_color: string
          background_image_url: string | null
          created_at: string
          display_duration: number
          enabled: boolean
          id: string
          show_on_load: boolean
          target_date: string
          text_color: string
          title: string
          updated_at: string
        }
        Insert: {
          background_color?: string
          background_image_url?: string | null
          created_at?: string
          display_duration?: number
          enabled?: boolean
          id?: string
          show_on_load?: boolean
          target_date?: string
          text_color?: string
          title?: string
          updated_at?: string
        }
        Update: {
          background_color?: string
          background_image_url?: string | null
          created_at?: string
          display_duration?: number
          enabled?: boolean
          id?: string
          show_on_load?: boolean
          target_date?: string
          text_color?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          end_time: string | null
          event_date: string
          id: string
          image_url: string | null
          location: string | null
          name: string
          place: string
          start_time: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          image_url?: string | null
          location?: string | null
          name: string
          place: string
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          location?: string | null
          name?: string
          place?: string
          start_time?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          alt: string
          category: string
          created_at: string
          id: string
          src: string
          type: string
          updated_at: string
        }
        Insert: {
          alt: string
          category: string
          created_at?: string
          id?: string
          src: string
          type: string
          updated_at?: string
        }
        Update: {
          alt?: string
          category?: string
          created_at?: string
          id?: string
          src?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      general_content: {
        Row: {
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          section_key: string
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          section_key: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          section_key?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      header_menu_links: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          order_number: number
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          order_number?: number
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          order_number?: number
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      page_content: {
        Row: {
          content: Json
          created_at: string
          id: string
          page_id: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          page_id: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          page_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          layout: string | null
          meta_description: string | null
          path: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          layout?: string | null
          meta_description?: string | null
          path: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          layout?: string | null
          meta_description?: string | null
          path?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          active: boolean
          category: string | null
          created_at: string
          id: string
          logo_url: string
          name: string
          order_number: number
          updated_at: string
          website_url: string | null
        }
        Insert: {
          active?: boolean
          category?: string | null
          created_at?: string
          id?: string
          logo_url: string
          name: string
          order_number?: number
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          active?: boolean
          category?: string | null
          created_at?: string
          id?: string
          logo_url?: string
          name?: string
          order_number?: number
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      schedule_days: {
        Row: {
          created_at: string
          date: string
          day_name: string
          id: string
          order_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          day_name: string
          id?: string
          order_number?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          day_name?: string
          id?: string
          order_number?: number
          updated_at?: string
        }
        Relationships: []
      }
      schedule_events: {
        Row: {
          category: string
          created_at: string
          day_id: string | null
          description: string | null
          end_time: string
          id: string
          location: string | null
          order_number: number
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          day_id?: string | null
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          order_number?: number
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          day_id?: string | null
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          order_number?: number
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_events_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "schedule_days"
            referencedColumns: ["id"]
          },
        ]
      }
      slider_images: {
        Row: {
          active: boolean
          created_at: string
          id: string
          image_url: string
          link: string | null
          order_number: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          image_url: string
          link?: string | null
          order_number: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string
          link?: string | null
          order_number?: number
          updated_at?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          icon: string
          id: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          icon: string
          id?: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      theme_settings: {
        Row: {
          accent_color: string
          background_color: string
          created_at: string
          font_body: string
          font_heading: string
          id: string
          primary_color: string
          secondary_color: string
          text_color: string
          updated_at: string
        }
        Insert: {
          accent_color?: string
          background_color?: string
          created_at?: string
          font_body?: string
          font_heading?: string
          id?: string
          primary_color?: string
          secondary_color?: string
          text_color?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string
          background_color?: string
          created_at?: string
          font_body?: string
          font_heading?: string
          id?: string
          primary_color?: string
          secondary_color?: string
          text_color?: string
          updated_at?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          available: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          available?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          available?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_page_file: {
        Args: { page_title: string; page_slug: string; page_layout?: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
