import { createServerClient } from "@/lib/supabase-server"
import { AdminPanel } from "@/components/admin-panel"
import { Logo } from "@/components/logo"
import { AdminGuard } from "@/components/admin-guard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminManagers } from "@/components/admin-managers"
import { AdminUsers } from "@/components/admin-users"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function AdminPage() {
  const supabase = createServerClient()

  return (
    <AdminGuard>
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center">
            <Link href="/" className="mr-4">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Вернуться в каталог</span>
                <span className="sm:hidden">Назад</span>
              </Button>
            </Link>
          </div>
          <Logo size="large" responsive={true} />
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="mb-6 w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="products">Товары</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="admins">Администраторы</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <AdminPanel />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="admins">
            <AdminManagers />
          </TabsContent>
        </Tabs>
      </main>
    </AdminGuard>
  )
}
