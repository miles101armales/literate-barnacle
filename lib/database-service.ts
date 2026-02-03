// Сервис для работы с базой данных
import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"
import type { Product, Order, CartItem, User } from "./types"

class DatabaseService {
  private supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Products
  async getActiveProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase.from("products").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  // Orders
  async getEditingOrder(userId: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from("orders")
      .select("*")
      .eq("user_tg_id", userId)
      .eq("status", "editing")
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  async createOrder(userId: string): Promise<Order> {
    const { data, error } = await this.supabase
      .from("orders")
      .insert({
        user_tg_id: userId,
        status: "editing",
        total_amount: 0,
      })
      .select("*")
      .single()

    if (error) throw error
    return data
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    const { error } = await this.supabase.from("orders").update({ status }).eq("id", orderId)

    if (error) throw error
  }

  async updateOrderDetails(orderId: string, details: Partial<Order>): Promise<void> {
    const { error } = await this.supabase.from("orders").update(details).eq("id", orderId)

    if (error) throw error
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<CartItem[]> {
    const { data, error } = await this.supabase
      .from("order_items")
      .select(`
        quantity,
        unit_price,
        product:products!inner(*)
      `)
      .eq("order_id", orderId)

    if (error) throw error

    return (data || []).map((item: any) => ({
      product: item.product as Product,
      quantity: item.quantity,
    }))
  }

  async upsertOrderItem(orderId: string, productId: string, quantity: number, unitPrice: number): Promise<void> {
    if (quantity <= 0) {
      await this.deleteOrderItem(orderId, productId)
      return
    }

    const { error } = await this.supabase.from("order_items").upsert(
      {
        order_id: orderId,
        product_id: productId,
        quantity,
        unit_price: unitPrice,
      },
      {
        onConflict: "order_id,product_id",
      },
    )

    if (error) throw error
  }

  async deleteOrderItem(orderId: string, productId: string): Promise<void> {
    const { error } = await this.supabase
      .from("order_items")
      .delete()
      .eq("order_id", orderId)
      .eq("product_id", productId)

    if (error) throw error
  }

  // Users
  async getUser(telegramId: number): Promise<User | null> {
    const { data, error } = await this.supabase.from("users").select("*").eq("tg_id", telegramId).single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  async upsertUser(user: Partial<User> & { tg_id: number }): Promise<User> {
    const { data, error } = await this.supabase.from("users").upsert(user, { onConflict: "tg_id" }).select("*").single()

    if (error) throw error
    return data
  }

  // Admin
  async isAdmin(telegramId: number): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("admins")
      .select("tg_id")
      .or(`tg_id.eq.${telegramId},tg_id.eq.${String(telegramId)}`)
      .limit(1)

    if (error) return false
    return (data?.length || 0) > 0
  }
}

export const dbService = new DatabaseService()
