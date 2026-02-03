"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useTelegram } from "@/lib/telegram-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { UserPlus, Trash2, RefreshCw } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function AdminManagers() {
  const { supabase } = useSupabase()
  const { telegramId } = useTelegram()
  const { toast } = useToast()

  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newAdminId, setNewAdminId] = useState("")
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [deleteAdminId, setDeleteAdminId] = useState<string | null>(null)

  // Загрузка списка администраторов
  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("admins").select("*")

      if (error) throw error
      setAdmins(data || [])
    } catch (error) {
      console.error("Error fetching admins:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список администраторов",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [supabase])

  // Добавление нового администратора
  const handleAddAdmin = async () => {
    if (!newAdminId) {
      toast({
        title: "Ошибка",
        description: "Введите корректный Telegram ID",
        variant: "destructive",
        duration: 5000,
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
            duration: 3000,
          })
        } else {
          throw error
        }
      } else {
        toast({
          title: "Успех",
          description: `Telegram ID ${adminId} успешно добавлен как администратор`,
          duration: 3000,
        })
        setNewAdminId("")
        fetchAdmins()
      }
    } catch (error) {
      console.error("Error adding admin:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось добавить администратора",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setAddingAdmin(false)
    }
  }

  // Удаление администратора
  const handleDeleteAdmin = async () => {
    if (!deleteAdminId) return

    try {
      // Проверяем, не пытается ли пользователь удалить самого себя
      if (deleteAdminId === telegramId) {
        toast({
          title: "Ошибка",
          description: "Вы не можете удалить самого себя из администраторов",
          variant: "destructive",
          duration: 5000,
        })
        setDeleteAdminId(null)
        return
      }

      const { error } = await supabase.from("admins").delete().eq("tg_id", deleteAdminId)

      if (error) throw error

      toast({
        title: "Успех",
        description: "Администратор успешно удален",
        duration: 3000,
      })

      fetchAdmins()
    } catch (error) {
      console.error("Error deleting admin:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить администратора",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setDeleteAdminId(null)
    }
  }

  // Обновление списка администраторов
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAdmins()
    setRefreshing(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle>Управление администраторами</CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Обновить
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Форма добавления нового администратора */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1 w-full">
              <Label htmlFor="new-admin-id">Telegram ID нового администратора</Label>
              <Input
                id="new-admin-id"
                value={newAdminId}
                onChange={(e) => setNewAdminId(e.target.value)}
                placeholder="Например: 123456789"
              />
            </div>
            <Button
              onClick={handleAddAdmin}
              disabled={addingAdmin || !newAdminId}
              className="bg-[#E10600] hover:bg-[#c00500] w-full sm:w-auto"
            >
              {addingAdmin ? "Добавление..." : "Добавить"}
              <UserPlus className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Таблица администраторов */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Telegram ID</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4">
                      Загрузка...
                    </TableCell>
                  </TableRow>
                ) : admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4">
                      Нет администраторов
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => (
                    <TableRow key={admin.tg_id}>
                      <TableCell>{admin.tg_id}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteAdminId(admin.tg_id)}
                          disabled={admin.tg_id === telegramId}
                          className={admin.tg_id === telegramId ? "opacity-30 cursor-not-allowed" : ""}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                          <span className="sr-only">Удалить</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Диалог подтверждения удаления */}
        <AlertDialog open={!!deleteAdminId} onOpenChange={() => setDeleteAdminId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
              <AlertDialogDescription>
                Вы уверены, что хотите удалить этого администратора? Это действие нельзя отменить.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAdmin} className="bg-red-600 hover:bg-red-700">
                Удалить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
