"use client"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { Edit, Trash2, MoreHorizontal, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Product } from "@/components/catalog"
import { Badge } from "@/components/ui/badge"

interface ProductTableProps {
  products: Product[]
  loading: boolean
  onEdit: (product: Product) => void
  onToggleActive: (id: string, isActive: boolean) => void
  onDelete: (id: string) => void
}

export function ProductTable({ products, loading, onEdit, onToggleActive, onDelete }: ProductTableProps) {
  if (loading) {
    return <div className="text-center py-4">Загрузка...</div>
  }

  if (products.length === 0) {
    return <div className="text-center py-4">Нет товаров</div>
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Фото</TableHead>
            <TableHead>Название</TableHead>
            <TableHead className="hidden md:table-cell">Состав</TableHead>
            <TableHead className="text-right">Цена</TableHead>
            <TableHead className="text-center hidden sm:table-cell">Наличие</TableHead>
            <TableHead className="text-center">Статус</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="relative h-12 w-12 rounded overflow-hidden">
                  <Image
                    src={product.photo_url || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="max-w-[200px] truncate hidden md:table-cell">{product.composition}</TableCell>
              <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
              <TableCell className="text-center hidden sm:table-cell">{product.stock}</TableCell>
              <TableCell className="text-center">
                {product.is_active ? (
                  <Badge className="bg-green-500 hover:bg-green-600">Активен</Badge>
                ) : (
                  <Badge variant="outline">Неактивен</Badge>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Действия</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Редактировать
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleActive(product.id, !product.is_active)}>
                      {product.is_active ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Деактивировать
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Активировать
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(product.id)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
