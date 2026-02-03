"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useTelegram } from "@/lib/telegram-provider"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { supabase } = useSupabase()
  const { telegramId } = useTelegram()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        if (!telegramId) {
          router.push("/")
          return
        }

        // Проверяем как строку и как число
        const { data: adminData } = await supabase
          .from("admins")
          .select("*")
          .or(`tg_id.eq.${telegramId},tg_id.eq.${String(telegramId)}`)
          .limit(1)

        if (!adminData || adminData.length === 0) {
          router.push("/")
          return
        }

        setIsAdmin(true)
      } catch (error) {
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [supabase, router, telegramId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-lg text-gray-700">Проверка доступа...</span>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}
