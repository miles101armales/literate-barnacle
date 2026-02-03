// Оптимизированный каталог
"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { CartButton } from "@/components/cart-button"
import { CartModal } from "@/components/cart-modal"
import { useCart } from "@/hooks/use-cart"
import { useTelegram } from "@/lib/telegram-provider"
import { dbService } from "@/lib/database-service"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"

export function Catalog() {
  const { telegramId } = useTelegram()
  const { toast } = useToast()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const { cart, totalItems, totalAmount, addToCart, updateQuantity, confirmOrder, clearCart } = useCart({ telegramId })

  // Загрузка продуктов
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await dbService.getActiveProducts()
        setProducts(data)
      } catch (error) {
        console.error("Load products error:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить каталог товаров",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [toast])

  // Проверка статуса заказа
  useEffect(() => {
    const checkOrderStatus = async () => {
      if (!telegramId) return

      try {
        const order = await dbService.getEditingOrder(String(telegramId))
        if (order?.status === "confirmed") {
          router.push("/order-success")
        }
      } catch (error) {
        // Игнорируем ошибки
      }
    }

    checkOrderStatus()
  }, [telegramId, router])

  const handleOrderConfirmed = () => {
    setIsCartOpen(false)
    clearCart()
    router.push("/order-success")
  }

  // Мемоизированный рендер продуктов
  const productGrid = useMemo(() => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-6 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-6 w-1/3 bg-gray-200 rounded" />
                <div className="h-10 w-full bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (products.length === 0) {
      return (
        <div className="col-span-full text-center py-10">
          <p className="text-lg text-gray-500">Нет доступных товаров</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={() => addToCart(product)} />
        ))}
      </div>
    )
  }, [loading, products, addToCart])

  return (
    <div className="relative">
      {productGrid}

      {totalItems > 0 && <CartButton itemCount={totalItems} onClick={() => setIsCartOpen(true)} />}

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        totalAmount={totalAmount}
        onUpdateQuantity={updateQuantity}
        onConfirm={confirmOrder}
        onOrderConfirmed={handleOrderConfirmed}
      />
    </div>
  )
}
