"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { Product } from "@/components/catalog"
import { useToast } from "@/hooks/use-toast"

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: Partial<Product> & { file?: File }) => Promise<void>
  product: Product | null
}

export function ProductForm({ isOpen, onClose, onSave, product }: ProductFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<Product> & { file?: File }>({
    name: "",
    composition: "",
    description: "",
    price: 0,
    stock: 0,
    is_active: true,
    photo_url: "",
  })
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alwaysInStock, setAlwaysInStock] = useState(false)
  const [usePhotoUrl, setUsePhotoUrl] = useState(false)
  const [priceInput, setPriceInput] = useState("")

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name,
        composition: product.composition,
        description: product.description,
        price: product.price,
        stock: product.stock,
        is_active: product.is_active,
        photo_url: product.photo_url,
      })
      setPriceInput(product.price.toString())
      setPreviewUrl(product.photo_url || "")
      setAlwaysInStock(product.stock >= 999)
      setUsePhotoUrl(!!product.photo_url)
    } else {
      setFormData({
        name: "",
        composition: "",
        description: "",
        price: 0,
        stock: 0,
        is_active: true,
        photo_url: "",
      })
      setPriceInput("")
      setPreviewUrl("")
      setAlwaysInStock(false)
      setUsePhotoUrl(false)
    }
  }, [product, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "stock") {
      setFormData({ ...formData, [name]: Number.parseFloat(value) || 0 })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPriceInput(value)

    // Преобразуем введенное значение в число для formData
    const numericValue = value === "" ? 0 : Number.parseFloat(value.replace(/,/g, "."))
    setFormData({ ...formData, price: isNaN(numericValue) ? 0 : numericValue })
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData({ ...formData, is_active: checked })
  }

  const handleAlwaysInStockChange = (checked: boolean) => {
    setAlwaysInStock(checked)
    if (checked) {
      setFormData({ ...formData, stock: 999 })
    }
  }

  const handlePhotoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setFormData({ ...formData, photo_url: url })
    setPreviewUrl(url)
  }

  const handleUsePhotoUrlChange = (checked: boolean) => {
    setUsePhotoUrl(checked)
    if (!checked) {
      setFormData({ ...formData, photo_url: "" })
      if (!formData.file) {
        setPreviewUrl("")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Проверяем размер файла (ограничиваем до 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Ошибка",
          description: "Размер изображения не должен превышать 2MB",
          variant: "destructive",
        })
        return
      }

      setFormData({ ...formData, file })
      setUsePhotoUrl(false)

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Если выбрана опция "всегда в наличии", устанавливаем stock = 999
      const dataToSave = {
        ...formData,
        stock: alwaysInStock ? 999 : formData.stock,
      }

      await onSave(dataToSave)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Редактировать товар" : "Добавить товар"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="photo" className="mt-2">
                Фото
              </Label>
              <div className="col-span-3">
                <div className="flex items-center gap-4 mb-2">
                  {previewUrl && (
                    <div className="relative h-24 w-24 rounded-md overflow-hidden">
                      <Image src={previewUrl || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                    </div>
                  )}

                  <div className="flex-1">
                    <Label
                      htmlFor="photo-upload"
                      className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed"
                    >
                      <Upload className="h-6 w-6 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">Выберите фото</span>
                      <Input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </Label>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox id="use-photo-url" checked={usePhotoUrl} onCheckedChange={handleUsePhotoUrlChange} />
                  <Label htmlFor="use-photo-url">Использовать URL фото</Label>
                </div>

                {usePhotoUrl && (
                  <div className="mt-2">
                    <Label htmlFor="photo-url">URL фото</Label>
                    <Input
                      id="photo-url"
                      name="photo_url"
                      value={formData.photo_url || ""}
                      onChange={handlePhotoUrlChange}
                      placeholder="https://example.com/image.jpg"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="composition">Состав</Label>
              <Input
                id="composition"
                name="composition"
                value={formData.composition || ""}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="mt-2">
                Описание
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                className="col-span-3"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price">Цена</Label>
              <div className="col-span-3 relative">
                <Input
                  id="price"
                  name="price"
                  type="text"
                  inputMode="decimal"
                  value={priceInput}
                  onChange={handlePriceChange}
                  placeholder="0.00"
                  className="pr-8"
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">₽</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="always-in-stock">Всегда в наличии</Label>
              <div className="col-span-3">
                <Switch id="always-in-stock" checked={alwaysInStock} onCheckedChange={handleAlwaysInStockChange} />
              </div>
            </div>

            {!alwaysInStock && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock">Наличие</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_active">Активен</Label>
              <div className="col-span-3">
                <Switch id="is_active" checked={formData.is_active} onCheckedChange={handleSwitchChange} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Отмена
            </Button>
            <Button type="submit" className="bg-[#E10600] hover:bg-[#c00500]" disabled={isSubmitting}>
              {isSubmitting ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
