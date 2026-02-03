// Оптимизированный Telegram Provider
"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { dbService } from "@/lib/database-service"
import { TelegramRedirect } from "@/components/telegram-redirect"
import type { TelegramUser, User } from "@/lib/types"

interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
  }
  ready: () => void
  expand: () => void
  close: () => void
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive: boolean) => void
    hideProgress: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    setText: (text: string) => void
  }
}

interface TelegramContextValue {
  tg: TelegramWebApp | null
  telegramId: number | null
  isAdmin: boolean
  userData: User | null
  isReady: boolean
  checkAdminStatus: () => Promise<boolean>
}

const TelegramContext = createContext<TelegramContextValue>({
  tg: null,
  telegramId: null,
  isAdmin: false,
  userData: null,
  isReady: false,
  checkAdminStatus: async () => false,
})

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [tg, setTg] = useState<TelegramWebApp | null>(null)
  const [telegramId, setTelegramId] = useState<number | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userData, setUserData] = useState<User | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [needRedirect, setNeedRedirect] = useState(false)

  const checkAdminStatus = useCallback(async (): Promise<boolean> => {
    if (!telegramId) return false

    try {
      const adminStatus = await dbService.isAdmin(telegramId)
      setIsAdmin(adminStatus)
      return adminStatus
    } catch (error) {
      console.error("Check admin status error:", error)
      return false
    }
  }, [telegramId])

  const initializeUser = useCallback(async (telegramUser: TelegramUser) => {
    try {
      const user = await dbService.upsertUser({
        tg_id: telegramUser.id,
        username: telegramUser.username || null,
        firstname: telegramUser.first_name || null,
        lastname: telegramUser.last_name || null,
      })

      setUserData(user)
      setTelegramId(telegramUser.id)
    } catch (error) {
      console.error("Initialize user error:", error)
    }
  }, [])

  useEffect(() => {
    const initializeTelegram = async () => {
      try {
        if (typeof window === "undefined") return

        const webApp = window.Telegram?.WebApp
        if (!webApp) {
          setNeedRedirect(true)
          setIsReady(true)
          return
        }

        setTg(webApp)
        webApp.ready()
        webApp.expand()

        const user = webApp.initDataUnsafe?.user
        if (!user?.id) {
          setNeedRedirect(true)
          setIsReady(true)
          return
        }

        await initializeUser(user)
        setIsReady(true)
      } catch (error) {
        console.error("Telegram initialization error:", error)
        setNeedRedirect(true)
        setIsReady(true)
      }
    }

    initializeTelegram()
  }, [initializeUser])

  useEffect(() => {
    if (telegramId) {
      checkAdminStatus()
    }
  }, [telegramId, checkAdminStatus])

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E10600]" />
        <p className="mt-4 text-gray-600">Загрузка приложения...</p>
      </div>
    )
  }

  if (needRedirect) {
    return <TelegramRedirect />
  }

  return (
    <TelegramContext.Provider
      value={{
        tg,
        telegramId,
        isAdmin,
        userData,
        isReady,
        checkAdminStatus,
      }}
    >
      {children}
    </TelegramContext.Provider>
  )
}

export const useTelegram = () => {
  const context = useContext(TelegramContext)
  if (!context) {
    throw new Error("useTelegram must be used within TelegramProvider")
  }
  return context
}
