"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface OrderStatusProps {
  status: "confirmed"
}

export function OrderStatus({ status }: OrderStatusProps) {
  const router = useRouter()

  // Перенаправляем на страницу успешного заказа
  useEffect(() => {
    router.push("/order-success")
  }, [router])

  // Возвращаем пустой компонент, так как перенаправление произойдет автоматически
  return null
}
