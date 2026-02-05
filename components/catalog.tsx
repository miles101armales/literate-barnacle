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
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Product } from "@/lib/types"

const ITEMS_PER_PAGE = 10

export function Catalog() {
  const { telegramId } = useTelegram()
  const { toast } = useToast()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

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

  // Расчет пагинации
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentProducts = products.slice(startIndex, endIndex)

  // Компонент пагинации
  const Pagination = () => {
    if (totalPages <= 1) return null
    
    return (
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-full bg-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-full font-medium transition-colors ${
                currentPage === page
                  ? 'bg-[#E10600] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-full bg-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    )
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
        {currentProducts.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={() => addToCart(product)} />
        ))}
      </div>
    )
  }, [loading, currentProducts, addToCart])

  return (
    <div className="relative">
      <Pagination />
      <div className="my-6">{productGrid}</div>
      <Pagination />

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
