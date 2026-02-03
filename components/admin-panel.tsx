"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ProductTable } from "@/components/product-table"
import { ProductForm } from "@/components/product-form"
import { useAdmin } from "@/hooks/use-admin"
import { Plus } from "lucide-react"
import type { Product } from "@/lib/types"

export function AdminPanel() {
  const { products, loadProducts, saveProduct, deleteProduct, loadingProducts, savingProduct, deletingProduct } =
    useAdmin()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsFormOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleSaveProduct = async (productData: Partial<Product> & { file?: File }) => {
    await saveProduct(productData)
    setIsFormOpen(false)
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    // Логика переключения активности товара
    console.log("Toggle active:", id, isActive)
  }

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Управление товарами</h2>
        <Button
          onClick={handleAddProduct}
          className="bg-[#E10600] hover:bg-[#c00500] text-white"
          disabled={savingProduct}
        >
          <Plus className="mr-2 h-4 w-4" />
          Добавить товар
        </Button>
      </div>

      <ProductTable
        products={products}
        loading={loadingProducts}
        onEdit={handleEditProduct}
        onToggleActive={handleToggleActive}
        onDelete={handleDeleteProduct}
        deleting={deletingProduct}
      />

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        saving={savingProduct}
      />
    </div>
  )
}
