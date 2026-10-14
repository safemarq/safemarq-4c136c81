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
      be_postal_codes: {
        Row: {
          location: unknown
          name: string
          postal_code: string
          region: string
        }
        Insert: {
          location: unknown
          name: string
          postal_code: string
          region: string
        }
        Update: {
          location?: unknown
          name?: string
          postal_code?: string
          region?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          garage_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          garage_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          garage_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
      garage_claims: {
        Row: {
          business_email: string
          created_at: string
          garage_id: string
          id: string
          justification: string | null
          review_note: string | null
          reviewed_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          business_email: string
          created_at?: string
          garage_id: string
          id?: string
          justification?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          business_email?: string
          created_at?: string
          garage_id?: string
          id?: string
          justification?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "garage_claims_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
      garage_makes: {
        Row: {
          created_at: string
          garage_id: string
          make: string
          official: boolean
        }
        Insert: {
          created_at?: string
          garage_id: string
          make: string
          official?: boolean
        }
        Update: {
          created_at?: string
          garage_id?: string
          make?: string
          official?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "garage_makes_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garage_makes_make_fkey"
            columns: ["make"]
            isOneToOne: false
            referencedRelation: "makes"
            referencedColumns: ["slug"]
          },
        ]
      }
      garage_owners: {
        Row: {
          created_at: string
          garage_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          garage_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          garage_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "garage_owners_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
      garage_services: {
        Row: {
          created_at: string
          garage_id: string
          trade: string
          vehicle: string
        }
        Insert: {
          created_at?: string
          garage_id: string
          trade: string
          vehicle: string
        }
        Update: {
          created_at?: string
          garage_id?: string
          trade?: string
          vehicle?: string
        }
        Relationships: [
          {
            foreignKeyName: "garage_services_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garage_services_vehicle_trade_fkey"
            columns: ["vehicle", "trade"]
            isOneToOne: false
            referencedRelation: "vehicle_trades"
            referencedColumns: ["vehicle", "trade"]
          },
        ]
      }
      garage_submissions: {
        Row: {
          brand: string | null
          city: string
          created_at: string
          created_garage_id: string | null
          id: string
          name: string
          phone: string | null
          postal_code: string
          review_note: string | null
          reviewed_at: string | null
          status: string
          street: string
          trades: string[]
          user_id: string
          vehicles: string[]
          website: string | null
        }
        Insert: {
          brand?: string | null
          city: string
          created_at?: string
          created_garage_id?: string | null
          id?: string
          name: string
          phone?: string | null
          postal_code: string
          review_note?: string | null
          reviewed_at?: string | null
          status?: string
          street: string
          trades: string[]
          user_id: string
          vehicles?: string[]
          website?: string | null
        }
        Update: {
          brand?: string | null
          city?: string
          created_at?: string
          created_garage_id?: string | null
          id?: string
          name?: string
          phone?: string | null
          postal_code?: string
          review_note?: string | null
          reviewed_at?: string | null
          status?: string
          street?: string
          trades?: string[]
          user_id?: string
          vehicles?: string[]
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "garage_submissions_created_garage_id_fkey"
            columns: ["created_garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
      garage_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          garage_id: string
          id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["garage_tier"]
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          garage_id: string
          id?: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier: Database["public"]["Enums"]["garage_tier"]
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          garage_id?: string
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["garage_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "garage_subscriptions_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: true
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
      garage_tool_brands: {
        Row: {
          brand: string
          created_at: string
          garage_id: string
        }
        Insert: {
          brand: string
          created_at?: string
          garage_id: string
        }
        Update: {
          brand?: string
          created_at?: string
          garage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "garage_tool_brands_brand_fkey"
            columns: ["brand"]
            isOneToOne: false
            referencedRelation: "tool_brands"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "garage_tool_brands_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
      garages: {
        Row: {
          address: string
          badges: Json
          brand: string | null
          certifications: Json
          coords: Json
          cover_image_url: string | null
          created_at: string
          description: string | null
          faq: Json
          hours: Json
          id: string
          images: Json
          insight_icon: string | null
          key_insight: string | null
          locality: string | null
          location: unknown
          location_precise: boolean
          logo_url: string | null
          long_description: string | null
          name: string
          phone: string | null
          postal_code: string | null
          price_level: string
          promo_banner: Json | null
          quality_scores: Json
          quote: string | null
          rating: number
          reviews_count: number
          safemarq_score: number | null
          services_detail: Json
          slug: string
          specialty: string | null
          team: Json
          tier: Database["public"]["Enums"]["garage_tier"]
          type: string
          updated_at: string
          vehicle_types: Json
          verified: boolean
          video_url: string | null
          website: string | null
        }
        Insert: {
          address: string
          badges?: Json
          brand?: string | null
          certifications?: Json
          coords?: Json
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          faq?: Json
          hours?: Json
          id?: string
          images?: Json
          insight_icon?: string | null
          key_insight?: string | null
          locality?: string | null
          location?: unknown
          location_precise?: boolean
          logo_url?: string | null
          long_description?: string | null
          name: string
          phone?: string | null
          postal_code?: string | null
          price_level: string
          promo_banner?: Json | null
          quality_scores?: Json
          quote?: string | null
          rating?: number
          reviews_count?: number
          safemarq_score?: number | null
          services_detail?: Json
          slug: string
          specialty?: string | null
          team?: Json
          tier?: Database["public"]["Enums"]["garage_tier"]
          type: string
          updated_at?: string
          vehicle_types?: Json
          verified?: boolean
          video_url?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          badges?: Json
          brand?: string | null
          certifications?: Json
          coords?: Json
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          faq?: Json
          hours?: Json
          id?: string
          images?: Json
          insight_icon?: string | null
          key_insight?: string | null
          locality?: string | null
          location?: unknown
          location_precise?: boolean
          logo_url?: string | null
          long_description?: string | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          price_level?: string
          promo_banner?: Json | null
          quality_scores?: Json
          quote?: string | null
          rating?: number
          reviews_count?: number
          safemarq_score?: number | null
          services_detail?: Json
          slug?: string
          specialty?: string | null
          team?: Json
          tier?: Database["public"]["Enums"]["garage_tier"]
          type?: string
          updated_at?: string
          vehicle_types?: Json
          verified?: boolean
          video_url?: string | null
          website?: string | null
        }
        Relationships: []
      }
      helpful_votes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "helpful_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          cost: number | null
          created_at: string
          date: string
          description: string | null
          garage_id: string | null
          id: string
          mileage_at_service: number | null
          next_service_date: string | null
          service_type: string
          vehicle_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          date?: string
          description?: string | null
          garage_id?: string | null
          id?: string
          mileage_at_service?: number | null
          next_service_date?: string | null
          service_type: string
          vehicle_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          date?: string
          description?: string | null
          garage_id?: string | null
          id?: string
          mileage_at_service?: number | null
          next_service_date?: string | null
          service_type?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "user_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      makes: {
        Row: {
          name: string
          slug: string
          vehicles: string[]
        }
        Insert: {
          name: string
          slug: string
          vehicles?: string[]
        }
        Update: {
          name?: string
          slug?: string
          vehicles?: string[]
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string | null
          body: string
          category: string
          cover_alt: string | null
          cover_credit: string | null
          cover_photo: string | null
          created_at: string
          excerpt: string
          id: string
          locale: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body?: string
          category?: string
          cover_alt?: string | null
          cover_credit?: string | null
          cover_photo?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          locale?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          category?: string
          cover_alt?: string | null
          cover_credit?: string | null
          cover_photo?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          locale?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pro_accounts: {
        Row: {
          account_type: Database["public"]["Enums"]["pro_account_type"]
          bce_number: string
          business_email: string
          city: string
          company_name: string
          contact_locale: string
          created_at: string
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          phone: string
          postal_code: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          street: string
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type: Database["public"]["Enums"]["pro_account_type"]
          bce_number: string
          business_email: string
          city: string
          company_name: string
          contact_locale?: string
          created_at?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          phone: string
          postal_code: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          street: string
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["pro_account_type"]
          bce_number?: string
          business_email?: string
          city?: string
          company_name?: string
          contact_locale?: string
          created_at?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          phone?: string
          postal_code?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          street?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          description: string
          garage_id: string
          id: string
          plate: string
          service_type: string
          status: string
          user_id: string | null
          vehicle_type: string
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description: string
          garage_id: string
          id?: string
          plate: string
          service_type?: string
          status?: string
          user_id?: string | null
          vehicle_type?: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string
          garage_id?: string
          id?: string
          plate?: string
          service_type?: string
          status?: string
          user_id?: string | null
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
      review_responses: {
        Row: {
          created_at: string
          garage_owner_id: string
          id: string
          review_id: string
          text: string
        }
        Insert: {
          created_at?: string
          garage_owner_id: string
          id?: string
          review_id: string
          text: string
        }
        Update: {
          created_at?: string
          garage_owner_id?: string
          id?: string
          review_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_garage_owner_id_fkey"
            columns: ["garage_owner_id"]
            isOneToOne: false
            referencedRelation: "garage_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_invoices: {
        Row: {
          checked_at: string | null
          checked_by: string | null
          created_at: string
          path: string
          review_id: string
          status: string
          user_id: string
        }
        Insert: {
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string
          path: string
          review_id: string
          status?: string
          user_id: string
        }
        Update: {
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string
          path?: string
          review_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_invoices_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_name: string
          created_at: string
          garage_id: string
          helpful_count: number
          id: string
          rating: number
          text: string
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          author_name: string
          created_at?: string
          garage_id: string
          helpful_count?: number
          id?: string
          rating: number
          text: string
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          author_name?: string
          created_at?: string
          garage_id?: string
          helpful_count?: number
          id?: string
          rating?: number
          text?: string
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reviews_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      tool_brands: {
        Row: {
          kinds: string[]
          name: string
          slug: string
        }
        Insert: {
          kinds?: string[]
          name: string
          slug: string
        }
        Update: {
          kinds?: string[]
          name?: string
          slug?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          group_id: string
          label_fr: string
          position: number
          slug: string
        }
        Insert: {
          group_id: string
          label_fr: string
          position: number
          slug: string
        }
        Update: {
          group_id?: string
          label_fr?: string
          position?: number
          slug?: string
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
      user_vehicles: {
        Row: {
          brand: string
          created_at: string
          id: string
          mileage: number | null
          model: string
          plate: string | null
          type: string
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          brand: string
          created_at?: string
          id?: string
          mileage?: number | null
          model: string
          plate?: string | null
          type?: string
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          brand?: string
          created_at?: string
          id?: string
          mileage?: number | null
          model?: string
          plate?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      vehicle_categories: {
        Row: {
          position: number
          slug: string
        }
        Insert: {
          position: number
          slug: string
        }
        Update: {
          position?: number
          slug?: string
        }
        Relationships: []
      }
      vehicle_trades: {
        Row: {
          trade: string
          vehicle: string
        }
        Insert: {
          trade: string
          vehicle: string
        }
        Update: {
          trade?: string
          vehicle?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_trades_trade_fkey"
            columns: ["trade"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "vehicle_trades_vehicle_fkey"
            columns: ["vehicle"]
            isOneToOne: false
            referencedRelation: "vehicle_categories"
            referencedColumns: ["slug"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_garage_submission: {
        Args: { p_note?: string; p_submission_id: string }
        Returns: string
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      garage_accepts_quotes: { Args: { p_garage: string }; Returns: boolean }
      garage_has_tier: {
        Args: {
          _garage_id: string
          _required: Database["public"]["Enums"]["garage_tier"]
        }
        Returns: boolean
      }
      get_admin_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          role: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_valid_bce: { Args: { n: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      search_claimable_garages: {
        Args: { q: string }
        Returns: {
          address: string
          id: string
          managed: boolean
          name: string
          slug: string
        }[]
      }
      search_garages: {
        Args: {
          p_lat: number
          p_limit?: number
          p_lng: number
          p_make?: string | null
          p_offset?: number
          p_radius_km?: number
          p_sort?: string
          p_tool?: string | null
          p_trade?: string | null
          p_vehicle?: string | null
          p_verified_only?: boolean
        }
        Returns: {
          address: string
          brand: string
          cover_image_url: string
          distance_km: number
          id: string
          lat: number
          lng: number
          locality: string
          location_precise: boolean
          logo_url: string
          name: string
          official: boolean
          postal_code: string
          rating: number
          reviews_count: number
          safemarq_score: number
          slug: string
          tier: Database["public"]["Enums"]["garage_tier"]
          total_count: number
          type: string
          verified: boolean
        }[]
      }
      submit_pro_onboarding: {
        Args: {
          p_account?: Json
          p_claim_garage_id?: string
          p_new_garage?: Json
        }
        Returns: undefined
      }
      suggest_garages: {
        Args: { p_lat?: number; p_limit?: number; p_lng?: number; q: string }
        Returns: {
          distance_km: number
          id: string
          locality: string
          name: string
          postal_code: string
          safemarq_score: number
          slug: string
          verified: boolean
        }[]
      }
      top_garages: {
        Args: {
          p_limit?: number
          p_make?: string | null
          p_offset?: number
          p_tool?: string | null
        }
        Returns: {
          address: string
          id: string
          locality: string
          name: string
          official: boolean
          postal_code: string
          rating: number
          reviews_count: number
          safemarq_score: number
          slug: string
          total_count: number
          verified: boolean
        }[]
      }
      trade_label_fr: { Args: { slug: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "garage_owner"
      garage_tier: "free" | "pro" | "premium"
      kyc_status: "pending" | "needs_info" | "approved" | "rejected"
      pro_account_type: "independent_garage" | "dealer"
      subscription_status:
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete"
        | "trialing"
        | "unpaid"
        | "incomplete_expired"
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
      app_role: ["admin", "moderator", "user", "garage_owner"],
      garage_tier: ["free", "pro", "premium"],
      kyc_status: ["pending", "needs_info", "approved", "rejected"],
      pro_account_type: ["independent_garage", "dealer"],
      subscription_status: [
        "active",
        "past_due",
        "canceled",
        "incomplete",
        "trialing",
        "unpaid",
        "incomplete_expired",
      ],
    },
  },
} as const
