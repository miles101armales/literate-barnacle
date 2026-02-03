"use client"

import { Suspense } from "react"
import { Catalog } from "@/components/catalog"
import { LoadingCatalog } from "@/components/loading-catalog"
import { Logo } from "@/components/logo"
import { AdminButton } from "@/components/admin-button"
import { ShopInfo } from "@/components/shop-info"
import { useTelegram } from "@/lib/telegram-provider"
import { useState, useEffect } from "react"

export default function Home() {
  const { isAdmin } = useTelegram()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Короткая задержка для инициализации
    const timer = setTimeout(() => {
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E10600]"></div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Каталог</h1>
        <Logo size="large" responsive={true} />
      </div>
      <Suspense fallback={<LoadingCatalog />}>
        <Catalog />
      </Suspense>

      {/* Информация о магазине */}
      <ShopInfo />

      {/* Кнопка админа в левом нижнем углу */}
      <AdminButton isAdmin={isAdmin} />
    </main>
  )
}
