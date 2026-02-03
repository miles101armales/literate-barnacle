"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, Search } from "lucide-react"

export function AdminUsers() {
  const { supabase } = useSupabase()
  const { toast } = useToast()

  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Загрузка списка пользователей
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список пользователей",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [supabase])

  // Обновление списка пользователей
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchUsers()
    setRefreshing(false)
  }

  // Фильтрация пользователей по поисковому запросу
  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      (user.tg_id && user.tg_id.toString().includes(searchLower)) ||
      (user.salebot_client_id && user.salebot_client_id.toString().toLowerCase().includes(searchLower)) ||
      (user.username && user.username.toLowerCase().includes(searchLower)) ||
      (user.firstname && user.firstname.toLowerCase().includes(searchLower)) ||
      (user.lastname && user.lastname.toLowerCase().includes(searchLower))
    )
  })

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle>Управление пользователями</CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Обновить
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Поиск пользователей */}
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Поиск пользователей..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Таблица пользователей */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Telegram ID</TableHead>
                  <TableHead>Salebot ID</TableHead>
                  <TableHead>Имя пользователя</TableHead>
                  <TableHead>Имя</TableHead>
                  <TableHead>Фамилия</TableHead>
                  <TableHead>Дата регистрации</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Загрузка...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      {searchTerm ? "Пользователи не найдены" : "Нет пользователей"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.tg_id}>
                      <TableCell>{user.tg_id}</TableCell>
                      <TableCell>{user.salebot_client_id || "-"}</TableCell>
                      <TableCell>{user.username || "-"}</TableCell>
                      <TableCell>{user.firstname || "-"}</TableCell>
                      <TableCell>{user.lastname || "-"}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
