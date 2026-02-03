"use client"

import { useState } from "react"
import { MessageCircle, Check } from "lucide-react"
import { useTelegram } from "@/lib/telegram-provider"
import { Logo } from "@/components/logo"
import { useRouter } from "next/navigation"

export default function OrderSuccessPage() {
  const { tg } = useTelegram()
  const router = useRouter()
  const [isClosing, setIsClosing] = useState(false)

  // Улучшим страницу успешного заказа, чтобы кнопка "Вернуться в Telegram" работала корректно

  // Заменим функцию handleBackToTelegram на более надежную версию:
  const handleBackToTelegram = () => {
    if (isClosing) return // Предотвращаем повторные нажатия

    setIsClosing(true)
    console.log("Закрытие Telegram WebApp...")

    try {
      // Используем нативный HTML-элемент button вместо компонента Button
      // Это может помочь избежать проблем с обработкой событий
      const closeWebApp = () => {
        try {
          // Проверяем наличие Telegram WebApp API
          if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp) {
            console.log("Вызов window.Telegram.WebApp.close()")
            window.Telegram.WebApp.close()
            return
          }

          // Если WebApp API недоступен, перенаправляем на бота
          window.location.href = "https://t.me/CvetloffBot"
        } catch (error) {
          console.error("Ошибка при закрытии WebApp:", error)
          // В случае ошибки также перенаправляем на бота
          window.location.href = "https://t.me/CvetloffBot"
        }
      }

      // Добавляем небольшую задержку перед закрытием
      setTimeout(closeWebApp, 100)
    } catch (error) {
      console.error("Ошибка при обработке закрытия WebApp:", error)
      window.location.href = "https://t.me/CvetloffBot"
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-white">
      <div className="mb-8">
        <Logo size="large" responsive={false} />
      </div>

      <div className="max-w-md w-full">
        <div className="rounded-full bg-green-100 p-4 mb-6 mx-auto w-20 h-20 flex items-center justify-center">
          <Check className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold mb-6">Заказ подтвержден</h1>

        <p className="text-lg mb-8 text-gray-700">
          Ссылка на оплату и дальнейшие инструкции отправлены вам в Telegram. Вы сможете сделать новый заказ после
          оплаты текущего.
        </p>

        {/* Заменим кнопку на нативный HTML-элемент button: */}
        <button
          onClick={handleBackToTelegram}
          disabled={isClosing}
          className={`bg-[#E10600] hover:bg-[#c00500] text-white rounded-full py-4 px-6 text-lg font-medium w-full max-w-xs mx-auto flex items-center justify-center transition-all ${
            isClosing ? "opacity-70 cursor-not-allowed" : ""
          }`}
          type="button"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          {isClosing ? "Закрытие..." : "Вернуться в Telegram"}
        </button>
      </div>
    </div>
  )
}
