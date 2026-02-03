"use client"

import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import type { Product } from "@/components/catalog"
import { useState } from "react"

interface ProductCardProps {
  product: Product
  onAddToCart: () => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isClicking, setIsClicking] = useState(false)

  // Оптимизируем обработчик клика для более быстрой реакции
  const handleClick = () => {
    // Немедленно показываем визуальный отклик
    setIsClicking(true)

    // Вызываем функцию добавления в корзину
    onAddToCart()

    // Сбрасываем состояние через короткое время
    setTimeout(() => setIsClicking(false), 200) // Уменьшаем время до 200 мс
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
      <div className="relative w-full aspect-square">
        {product.photo_url ? (
          <Image
            src={product.photo_url || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{product.composition || ""}</p>
        <p className="text-xl font-bold mt-auto">{formatCurrency(product.price)}</p>
        <Button
          onClick={handleClick}
          className={`mt-3 text-white rounded-full transition-colors duration-200 ${
            isClicking ? "bg-gray-400 hover:bg-gray-400" : "bg-[#E10600] hover:bg-[#c00500]"
          }`}
          disabled={isClicking}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />В корзину
        </Button>
      </div>
    </div>
  )
}
