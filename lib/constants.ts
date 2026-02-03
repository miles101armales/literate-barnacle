// Константы приложения
type DeliveryOption = {
  name: string
  cost: number
  requiresAddress: boolean
}

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  { name: "Самовывоз", cost: 0, requiresAddress: false },
  { name: "Перемещения", cost: 250, requiresAddress: true },
  { name: "Центр", cost: 250, requiresAddress: true },
  { name: "Зеленая роща", cost: 250, requiresAddress: true },
  { name: "Сипайлово", cost: 300, requiresAddress: true },
  { name: "Черниковка", cost: 350, requiresAddress: true },
  { name: "Инорс", cost: 350, requiresAddress: true },
  { name: "Док", cost: 350, requiresAddress: true },
  { name: "Затон", cost: 350, requiresAddress: true },
  { name: "Дема", cost: 350, requiresAddress: true },
  { name: "Цветы Башкирии", cost: 350, requiresAddress: true },
  { name: "8 Марта", cost: 350, requiresAddress: true },
] as const

export const ORDER_STATUSES = {
  EDITING: "editing",
  CONFIRMED: "confirmed",
  PAID: "paid",
} as const

export const PHOTO_SEND_OPTIONS = {
  WHATSAPP: "whatsapp",
  TELEGRAM: "telegram",
} as const

export const PAYMENT_METHODS = {
  CARD: "card",
} as const

export const SYNC_DEBOUNCE_DELAY = 300
export const TOAST_DURATION = 3000
export const ERROR_TOAST_DURATION = 5000
