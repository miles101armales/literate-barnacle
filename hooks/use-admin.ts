// Хук для административных операций
"use client"

import { useState } from "react"
import { dbService } from "@/lib/database-service"
import { useAsyncOperation } from "./use-async-operation"
import type { Product, User } from "@/lib/types"

export function useAdmin() {
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [admins, setAdmins] = useState<{ tg_id: string }[]>([])

  // Операции с продуктами
  const { execute: loadProducts, loading: loadingProducts } = useAsyncOperation(
    async () => {
      const data = await dbService.getAllProducts()
      setProducts(data)
      return data
    },
    { errorMessage: "Не удалось загрузить товары" },
  )

  const { execute: saveProduct, loading: savingProduct } = useAsyncOperation(
    async (productData: Partial<Product> & { file?: File }) => {
      // Здесь будет логика сохранения продукта с изображением
      // Пока упрощенная версия
      console.log("Saving product:", productData)
      await loadProducts()
    },
    {
      successMessage: "Товар успешно сохранен",
      errorMessage: "Не удалось сохранить товар",
    },
  )

  const { execute: deleteProduct, loading: deletingProduct } = useAsyncOperation(
    async (productId: string) => {
      // Логика удаления продукта
      console.log("Deleting product:", productId)
      setProducts((prev) => prev.filter((p) => p.id !== productId))
    },
    {
      successMessage: "Товар успешно удален",
      errorMessage: "Не удалось удалить товар",
    },
  )

  // Операции с пользователями
  const { execute: loadUsers, loading: loadingUsers } = useAsyncOperation(
    async () => {
      // Здесь будет логика загрузки пользователей
      console.log("Loading users")
      return []
    },
    { errorMessage: "Не удалось загрузить пользователей" },
  )

  // Операции с администраторами
  const { execute: loadAdmins, loading: loadingAdmins } = useAsyncOperation(
    async () => {
      // Здесь будет логика загрузки администраторов
      console.log("Loading admins")
      return []
    },
    { errorMessage: "Не удалось загрузить администраторов" },
  )

  const { execute: addAdmin, loading: addingAdmin } = useAsyncOperation(
    async (telegramId: string) => {
      // Логика добавления администратора
      console.log("Adding admin:", telegramId)
      setAdmins((prev) => [...prev, { tg_id: telegramId }])
    },
    {
      successMessage: "Администратор успешно добавлен",
      errorMessage: "Не удалось добавить администратора",
    },
  )

  const { execute: removeAdmin, loading: removingAdmin } = useAsyncOperation(
    async (telegramId: string) => {
      // Логика удаления администратора
      console.log("Removing admin:", telegramId)
      setAdmins((prev) => prev.filter((a) => a.tg_id !== telegramId))
    },
    {
      successMessage: "Администратор успешно удален",
      errorMessage: "Не удалось удалить администратора",
    },
  )

  return {
    // Данные
    products,
    users,
    admins,

    // Операции с продуктами
    loadProducts,
    saveProduct,
    deleteProduct,
    loadingProducts,
    savingProduct,
    deletingProduct,

    // Операции с пользователями
    loadUsers,
    loadingUsers,

    // Операции с администраторами
    loadAdmins,
    addAdmin,
    removeAdmin,
    loadingAdmins,
    addingAdmin,
    removingAdmin,
  }
}
