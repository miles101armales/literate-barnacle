// Централизованные типы для всего приложения
export interface Product {
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

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  user_tg_id: string
  status: "editing" | "confirmed" | "paid"
  total_amount: number
  created_at: string
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

export interface User {
  tg_id: number
  salebot_client_id?: string | null
  username?: string | null
  firstname?: string | null
  lastname?: string | null
  created_at: string
  updated_at: string
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
}

export interface OrderFormData {
  customerName: string
  phoneNumber: string
  deliveryType: string
  deliveryAddress: string
  deliveryCost: number
  photoSendTo: string
  paymentMethod: string
  deliveryDate: string
  deliveryTime: string
}

export interface DeliveryOption {
  name: string
  cost: number
  requiresAddress: boolean
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
