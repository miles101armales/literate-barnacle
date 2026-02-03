import { AdminAccessInfo } from "@/components/admin-access-info"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AdminInfoPage() {
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Link href="/" className="mr-4 p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">Информация об админ-доступе</h1>
        </div>
        <Logo size="large" responsive={true} />
      </div>

      <div className="max-w-3xl mx-auto">
        <AdminAccessInfo />
      </div>
    </main>
  )
}
