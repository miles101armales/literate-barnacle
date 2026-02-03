"use client"

import { Logo } from "@/components/logo"

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = "Загрузка..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex flex-col items-center justify-center">
      <div className="mb-8">
        <Logo size="large" responsive={false} />
      </div>

      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E10600] mb-6"></div>

      <p className="text-lg text-gray-700">{message}</p>
    </div>
  )
}
