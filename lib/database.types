export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          tg_id: string
        }
        Insert: {
          tg_id: string
        }
        Update: {
          tg_id?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
        }
      }
      orders: {
        Row: {
          id: string
          user_tg_id: string
          status: string
          total_amount: number
          created_at: string
          customer_name: string | null
          phone_number: string | null
          delivery_type: string | null
          delivery_address: string | null
          delivery_cost: number | null
          photo_send_to: string | null
          payment_method: string | null
          delivery_date: string | null
          delivery_time: string | null
        }
        Insert: {
          id?: string
          user_tg_id: string
          status: string
          total_amount?: number
          created_at?: string
          customer_name?: string | null
          phone_number?: string | null
          delivery_type?: string | null
          delivery_address?: string | null
          delivery_cost?: number | null
          photo_send_to?: string | null
          payment_method?: string | null
          delivery_date?: string | null
          delivery_time?: string | null
        }
        Update: {
          id?: string
          user_tg_id?: string
          status?: string
          total_amount?: number
          created_at?: string
          customer_name?: string | null
          phone_number?: string | null
          delivery_type?: string | null
          delivery_address?: string | null
          delivery_cost?: number | null
          photo_send_to?: string | null
          payment_method?: string | null
          delivery_date?: string | null
          delivery_time?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          composition: string | null
          description: string | null
          price: number
          photo_url: string | null
          stock: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          composition?: string | null
          description?: string | null
          price: number
          photo_url?: string | null
          stock: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          composition?: string | null
          description?: string | null
          price?: number
          photo_url?: string | null
          stock?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          tg_id: number
          salebot_client_id: string | null
          username: string | null
          firstname: string | null
          lastname: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          tg_id: number
          salebot_client_id?: string | null
          username?: string | null
          firstname?: string | null
          lastname?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          tg_id?: number
          salebot_client_id?: string | null
          username?: string | null
          firstname?: string | null
          lastname?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
