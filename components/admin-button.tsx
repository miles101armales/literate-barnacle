"use client"

import type React from "react"

import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface AdminButtonProps {
  isAdmin: boolean
}

export function AdminButton({ isAdmin }: AdminButtonProps) {
  const router = useRouter()

  if (!isAdmin) return null

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push("/admin")
  }

  return (
    <Button
      onClick={handleAdminClick}
      className="fixed bottom-6 left-6 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-4 shadow-lg z-50"
      size="lg"
      title="Админ-панель"
    >
      <Settings className="h-5 w-5" />
    </Button>
  )
}
