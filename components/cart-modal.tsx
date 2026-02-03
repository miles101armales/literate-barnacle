// Оптимизированная корзина
"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { X, Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
import { OrderForm } from "@/components/order-form"
import { useAsyncOperation } from "@/hooks/use-async-operation"
import { apiClient } from "@/lib/api-client"
import { useTelegram } from "@/lib/telegram-provider"
import { dbService } from "@/lib/database-service"
import type { CartItem, OrderFormData } from "@/lib/types"

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  totalAmount: number
  onUpdateQuantity: (productId: string, quantity: number) => void
  onConfirm: () => Promise<string>
  onOrderConfirmed: () => void
}

export function CartModal({
  isOpen,
  onClose,
  items,
  totalAmount,
  onUpdateQuantity,
  onConfirm,
  onOrderConfirmed,
}: CartModalProps) {
  const router = useRouter()
  const { telegramId, userData, tg } = useTelegram()

  const [showOrderForm, setShowOrderForm] = useState(false)
  const [orderFormData, setOrderFormData] = useState<OrderFormData | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [showProcessingScreen, setShowProcessingScreen] = useState(false)

  // Асинхронная операция для подтверждения заказа
  const { execute: executeOrderConfirmation, loading: isProcessing } = useAsyncOperation(
    async (formData: OrderFormData) => {
      setShowProcessingScreen(true)

      try {
        // Подтверждаем заказ в БД
        const orderId = await onConfirm()

        // Обновляем детали заказа
        await dbService.updateOrderDetails(orderId, {
          customer_name: formData.customerName,
          phone_number: formData.phoneNumber,
          delivery_type: formData.deliveryType,
          delivery_address: formData.deliveryAddress,
          delivery_cost: formData.deliveryCost,
          photo_send_to: formData.photoSendTo,
          payment_method: formData.paymentMethod,
          delivery_date: formData.deliveryDate,
          delivery_time: formData.deliveryTime,
        })

        // Подготавливаем данные для API
        const orderData = {
          client_order_id: orderId,
          items: items.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            totalPrice: item.product.price * item.quantity,
          })),
          order_items_text: items
            .map((item, index) => {
              const totalPrice = item.product.price * item.quantity
              return `${index + 1}. ${item.product.name} - ${item.quantity} шт. (${formatCurrency(totalPrice)})`
            })
            .join("\n"),
          user: {
            telegramId,
            firstName: userData?.firstname || tg?.initDataUnsafe?.user?.first_name,
            lastName: userData?.lastname || tg?.initDataUnsafe?.user?.last_name,
            username: userData?.username || tg?.initDataUnsafe?.user?.username,
            salebotClientId: userData?.salebot_client_id,
          },
          totalAmount: totalAmount + formData.deliveryCost,
          ...formData,
        }

        // Отправляем на внешний API
        const response = await apiClient.post("/api/order", orderData)

        if (!response.success) {
          throw new Error(response.error || "Failed to process order")
        }

        // Обновляем salebot_client_id если получили его
        if (response.data?.salebot_client_id && telegramId) {
          dbService.upsertUser({
            tg_id: telegramId,
            salebot_client_id: response.data.salebot_client_id,
          })
        }

        onOrderConfirmed()
        onClose()
        router.push("/order-success")
      } finally {
        setShowProcessingScreen(false)
      }
    },
    {
      errorMessage: "Не удалось оформить заказ. Попробуйте снова.",
    },
  )

  // Мемоизированные обработчики
  const handleQuantityChange = useMemo(() => {
    const handlers: Record<string, () => void> = {}

    items.forEach((item) => {
      const productId = item.product.id
      handlers[`${productId}-plus`] = () => onUpdateQuantity(productId, item.quantity + 1)
      handlers[`${productId}-minus`] = () => onUpdateQuantity(productId, item.quantity - 1)
      handlers[`${productId}-remove`] = () => onUpdateQuantity(productId, 0)
    })

    return handlers
  }, [items, onUpdateQuantity])

  const handleOrderFormSubmit = (formData: OrderFormData) => {
    setOrderFormData(formData)
    setIsConfirmOpen(true)
  }

  const handleConfirmOrder = () => {
    if (orderFormData) {
      setIsConfirmOpen(false)
      executeOrderConfirmation(orderFormData)
    }
  }

  const handleClose = (open: boolean) => {
    if (!open && (showProcessingScreen || isProcessing)) return

    if (!open && isConfirmOpen) {
      setIsConfirmOpen(false)
      return
    }

    if (!open) {
      setShowOrderForm(false)
      setShowProcessingScreen(false)
      onClose()
    }
  }

  const finalTotal = useMemo(() => {
    return totalAmount + (orderFormData?.deliveryCost || 0)
  }, [totalAmount, orderFormData?.deliveryCost])

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {showOrderForm ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOrderForm(false)}
                    className="mr-2 p-0"
                    disabled={isProcessing}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  Оформление заказа
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Корзина
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {showProcessingScreen ? (
            <div className="flex flex-col items-center justify-center py-10 px-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E10600] mb-6" />
              <h2 className="text-xl font-bold mb-4">Обработка заказа</h2>
              <p className="text-center text-gray-600">Пожалуйста, подождите. Ваш заказ обрабатывается...</p>
            </div>
          ) : showOrderForm ? (
            <OrderForm totalAmount={totalAmount} onSubmit={handleOrderFormSubmit} isSubmitting={isProcessing} />
          ) : (
            <>
              {items.length === 0 ? (
                <div className="py-6 text-center text-gray-500">Ваша корзина пуста</div>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center py-4 border-b">
                      <div className="mr-3 flex-shrink-0">
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                          {item.product.photo_url ? (
                            <Image
                              src={item.product.photo_url || "/placeholder.svg"}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <ShoppingCart className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex-grow">
                        <h4 className="font-bold">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">{formatCurrency(item.product.price)} за шт.</p>
                      </div>

                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-transparent"
                          onClick={handleQuantityChange[`${item.product.id}-minus`]}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <span className="mx-2 w-8 text-center font-bold">{item.quantity}</span>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-transparent"
                          onClick={handleQuantityChange[`${item.product.id}-plus`]}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 ml-2 rounded-full"
                          onClick={handleQuantityChange[`${item.product.id}-remove`]}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <DialogFooter className="flex-col sm:flex-col gap-2">
                <div className="flex justify-between items-center w-full py-2">
                  <span className="font-bold">Итого:</span>
                  <span className="text-xl font-bold">{formatCurrency(totalAmount)}</span>
                </div>

                <Button
                  disabled={items.length === 0}
                  className="w-full text-white rounded-full bg-[#E10600] hover:bg-[#c00500]"
                  onClick={() => setShowOrderForm(true)}
                >
                  Оформить заказ
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение заказа</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите оформить заказ на сумму {formatCurrency(finalTotal)}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing} className="rounded-full">
              Нет
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmOrder}
              disabled={isProcessing}
              className="rounded-full bg-[#E10600] hover:bg-[#c00500]"
            >
              Да, оформить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
