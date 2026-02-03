"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CartButtonProps {
  itemCount: number
  onClick: () => void
}

export function CartButton({ itemCount, onClick }: CartButtonProps) {
  const [isClicking, setIsClicking] = useState(false)

  // Оптимизируем обработчик клика для более быстрой реакции
  const handleClick = () => {
    // Немедленно показываем визуальный отклик
    setIsClicking(true)

    // Вызываем функцию открытия корзины
    onClick()

    // Сбрасываем состояние через короткое время
    setTimeout(() => setIsClicking(false), 200) // Уменьшаем время до 200 мс
  }

  return (
    <Button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 text-white rounded-full p-4 shadow-lg transition-colors duration-200 ${
        isClicking ? "bg-gray-400 hover:bg-gray-400" : "bg-[#E10600] hover:bg-[#c00500]"
      }`}
      size="lg"
      disabled={isClicking}
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      <span className="font-bold">{itemCount}</span>
    </Button>
  )
}
