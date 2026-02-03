"use client"

import { useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useTelegram } from "@/lib/telegram-provider"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, CheckCircle2, UserPlus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export function AdminAccessInfo() {
  const { supabase } = useSupabase()
  const { telegramId, isAdmin, checkAdminStatus } = useTelegram()
  const { toast } = useToast()
  const router = useRouter()
  const [newAdminId, setNewAdminId] = useState("")
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [addingSelf, setAddingSelf] = useState(false)

  const addAsAdmin = async () => {
    try {
      if (!telegramId) {
        toast({
          title: "Ошибка",
          description: "Telegram ID не определен",
          variant: "destructive",
        })
        return
      }

      setAddingSelf(true)
      const { error } = await supabase.from("admins").insert({
        tg_id: telegramId,
      })

      if (error) {
        if (error.code === "23505") {
          // Уникальное ограничение нарушено - пользователь уже админ
          toast({
            title: "Уже администратор",
            description: "Ваш Telegram ID уже добавлен в список администраторов",
          })
        } else {
          throw error
        }
      } else {
        toast({
          title: "Успех",
          description: "Вы успешно добавлены как администратор",
        })
        // Обновляем статус администратора
        await checkAdminStatus()
      }
    } catch (error) {
      console.error("Error adding admin:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось добавить вас как администратора",
        variant: "destructive",
      })
    } finally {
      setAddingSelf(false)
    }
  }

  const addNewAdmin = async () => {
    if (!newAdminId) {
      toast({
        title: "Ошибка",
        description: "Введите корректный Telegram ID",
        variant: "destructive",
      })
      return
    }

    setAddingAdmin(true)
    try {
      // Преобразуем ID в строку для уверенности
      const adminId = String(newAdminId).trim()

      const { error } = await supabase.from("admins").insert({
        tg_id: adminId,
      })

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Уже администратор",
            description: "Этот Telegram ID уже добавлен в список администраторов",
          })
        } else {
          throw error
        }
      } else {
        toast({
          title: "Успех",
          description: `Telegram ID ${adminId} успешно добавлен как администратор`,
        })
        setNewAdminId("")
      }
    } catch (error) {
      console.error("Error adding new admin:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось добавить нового администратора",
        variant: "destructive",
      })
    } finally {
      setAddingAdmin(false)
    }
  }

  const goToAdminPanel = () => {
    router.push("/admin")
  }

  return (
    <div className="space-y-4">
      {isAdmin ? (
        <>
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-800">Вы администратор</AlertTitle>
            <AlertDescription className="text-green-700">
              У вас есть доступ к админ-панели. Вы можете перейти к ней по кнопке ниже:
              <div className="mt-2">
                <Button onClick={goToAdminPanel} className="bg-green-600 hover:bg-green-700">
                  Перейти в админ-панель
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Добавить нового администратора</CardTitle>
              <CardDescription>Вы можете добавить нового администратора, указав его Telegram ID</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="newAdminId">Telegram ID нового администратора</Label>
                  <Input
                    id="newAdminId"
                    placeholder="Например: 123456789"
                    value={newAdminId}
                    onChange={(e) => setNewAdminId(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={addNewAdmin}
                disabled={addingAdmin || !newAdminId}
                className="bg-[#E10600] hover:bg-[#c00500]"
              >
                {addingAdmin ? "Добавление..." : "Добавить администратора"}
                <UserPlus className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </>
      ) : (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800">Информация о доступе</AlertTitle>
          <AlertDescription className="text-blue-700">
            <p>
              Ваш Telegram ID: <strong>{telegramId || "Не определен"}</strong>
            </p>
            <p className="mt-2">
              Чтобы получить доступ к админ-панели, вам нужно добавить свой Telegram ID в таблицу администраторов.
            </p>
            <div className="mt-2">
              <Button onClick={addAsAdmin} disabled={addingSelf} className="bg-blue-600 hover:bg-blue-700">
                {addingSelf ? "Добавление..." : "Добавить меня как администратора"}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
