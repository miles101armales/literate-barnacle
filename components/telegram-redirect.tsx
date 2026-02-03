"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import Image from "next/image"
import { Logo } from "@/components/logo"

export function TelegramRedirect() {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Запускаем обратный отсчет
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Перенаправляем на Telegram бота
          window.location.href = "https://t.me/CvetloffBot"
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleRedirect = () => {
    console.log("Закрытие Telegram WebApp из TelegramRedirect...")

    try {
      // Проверяем наличие Telegram WebApp API
      if (typeof window !== "undefined") {
        // Прямой доступ к глобальному объекту Telegram
        if (window.Telegram && window.Telegram.WebApp) {
          console.log("Вызов window.Telegram.WebApp.close()")
          window.Telegram.WebApp.close()
          return
        }
      }

      console.log("Telegram WebApp API не найден, перенаправление на бота")
      // Если WebApp API недоступен, перенаправляем на бота
      window.location.href = "https://t.me/CvetloffBot"
    } catch (error) {
      console.error("Ошибка при закрытии WebApp:", error)
      // В случае ошибки также перенаправляем на бота
      window.location.href = "https://t.me/CvetloffBot"
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="mb-8">
        <Logo size="large" responsive={false} />
      </div>

      <div className="max-w-md">
        <h1 className="text-3xl font-bold mb-6">Доступ только через Telegram</h1>

        <div className="bg-gray-100 p-6 rounded-xl mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20">
              <Image src="/telegram-logo.png" alt="Telegram" fill className="object-contain" />
            </div>
          </div>

          <p className="text-lg mb-4">Это приложение доступно только через Telegram Mini App.</p>

          <p className="text-md text-gray-600 mb-2">
            Вы будете перенаправлены на нашего Telegram бота через {countdown} сек.
          </p>
        </div>

        <Button onClick={handleRedirect} className="bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-full" size="lg">
          <MessageCircle className="mr-2 h-5 w-5" />
          Открыть в Telegram
        </Button>
      </div>
    </div>
  )
}
