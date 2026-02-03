"use client"

// Оптимизированный хук для работы с корзиной
import { useState, useCallback, useRef, useEffect } from "react"
import { useToast } from "./use-toast"
import { dbService } from "@/lib/database-service"
import { useDebounce } from "./use-debounce"
import type { CartItem, Product, Order } from "@/lib/types"
import { SYNC_DEBOUNCE_DELAY, TOAST_DURATION } from "@/lib/constants"

interface UseCartProps {
  telegramId: number | null
}

export function useCart({ telegramId }: UseCartProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const { toast } = useToast()

  const syncQueueRef = useRef<Map<string, number>>(new Map())

  // Дебаунсированная синхронизация с БД
  const debouncedSync = useDebounce(async () => {
    if (!currentOrder || syncQueueRef.current.size === 0) return

    try {
      const promises = Array.from(syncQueueRef.current.entries()).map(([productId, quantity]) => {
        const product = cart.find((item) => item.product.id === productId)?.product
        if (!product) return Promise.resolve()

        return dbService.upsertOrderItem(currentOrder.id, productId, quantity, product.price)
      })

      await Promise.all(promises)
      syncQueueRef.current.clear()
    } catch (error) {
      console.error("Cart sync error:", error)
    }
  }, SYNC_DEBOUNCE_DELAY)

  // Загрузка корзины
  const loadCart = useCallback(async () => {
    if (!telegramId) return

    try {
      setLoading(true)

      const order = await dbService.getEditingOrder(String(telegramId))
      if (!order) {
        setCart([])
        setCurrentOrder(null)
        return
      }

      setCurrentOrder(order)
      const items = await dbService.getOrderItems(order.id)
      setCart(items)
    } catch (error) {
      console.error("Load cart error:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить корзину",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [telegramId, toast])

  // Добавление товара в корзину
  const addToCart = useCallback(
    async (product: Product, quantity = 1) => {
      if (!telegramId) {
        toast({
          title: "Ошибка",
          description: "Необходимо авторизоваться через Telegram",
          variant: "destructive",
        })
        return
      }

      try {
        // Создаем заказ если его нет
        let order = currentOrder
        if (!order) {
          order = await dbService.createOrder(String(telegramId))
          setCurrentOrder(order)
        }

        // Оптимистичное обновление UI
        const existingIndex = cart.findIndex((item) => item.product.id === product.id)
        const newQuantity = existingIndex >= 0 ? cart[existingIndex].quantity + quantity : quantity

        if (existingIndex >= 0) {
          setCart((prev) =>
            prev.map((item, index) => (index === existingIndex ? { ...item, quantity: newQuantity } : item)),
          )
        } else {
          setCart((prev) => [...prev, { product, quantity: newQuantity }])
        }

        // Добавляем в очередь синхронизации
        syncQueueRef.current.set(product.id, newQuantity)
        debouncedSync()

        toast({
          title: "Добавлено в корзину",
          description: `${product.name} (${quantity} шт.)`,
          duration: TOAST_DURATION,
        })
      } catch (error) {
        console.error("Add to cart error:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось добавить товар в корзину",
          variant: "destructive",
        })
      }
    },
    [telegramId, currentOrder, cart, debouncedSync, toast],
  )

  // Обновление количества товара
  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        setCart((prev) => prev.filter((item) => item.product.id !== productId))
      } else {
        setCart((prev) => prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item)))
      }

      // Добавляем в очередь синхронизации
      syncQueueRef.current.set(productId, quantity)
      debouncedSync()
    },
    [debouncedSync],
  )

  // Подтверждение заказа
  const confirmOrder = useCallback(async (): Promise<string> => {
    if (!currentOrder) throw new Error("No active order")

    await dbService.updateOrderStatus(currentOrder.id, "confirmed")
    setCart([])
    setCurrentOrder(null)

    return currentOrder.id
  }, [currentOrder])

  // Очистка корзины
  const clearCart = useCallback(() => {
    setCart([])
    setCurrentOrder(null)
    syncQueueRef.current.clear()
  }, [])

  // Загружаем корзину при изменении telegramId
  useEffect(() => {
    if (telegramId) {
      loadCart()
    }
  }, [telegramId, loadCart])

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return {
    cart,
    loading,
    totalItems,
    totalAmount,
    currentOrder,
    addToCart,
    updateQuantity,
    confirmOrder,
    clearCart,
    loadCart,
  }
}
