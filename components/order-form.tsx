// Оптимизированная форма заказа
"use client"

import type React from "react"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FormField } from "@/components/ui/form-field"
import { useFormValidation } from "@/hooks/use-form-validation"
import { formatCurrency } from "@/lib/utils"
import { DELIVERY_OPTIONS, PHOTO_SEND_OPTIONS, PAYMENT_METHODS } from "@/lib/constants"
import type { OrderFormData } from "@/lib/types"
import { Loader2, Calendar } from "lucide-react"

interface OrderFormProps {
  totalAmount: number
  onSubmit: (formData: OrderFormData) => void
  isSubmitting: boolean
}

// Поддерживаются форматы: +7 912-345-67-89, 8-912-345-67-89, +79123456789, 89123456789
const PHONE_PATTERN = /^(\+7|8)?[\s-]?[489]\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/

export function OrderForm({ totalAmount, onSubmit, isSubmitting }: OrderFormProps) {
  const { values, errors, setValue, setFieldTouched, validateAll } = useFormValidation<OrderFormData>(
    {
      customerName: "",
      phoneNumber: "",
      deliveryType: "",
      deliveryAddress: "",
      deliveryCost: 0,
      photoSendTo: PHOTO_SEND_OPTIONS.TELEGRAM,
      paymentMethod: PAYMENT_METHODS.CARD,
      deliveryDate: "",
      deliveryTime: "",
    },
    {
      customerName: { required: true, minLength: 2 },
      phoneNumber: {
        required: true,
        pattern: PHONE_PATTERN,
        custom: (value) => {
          if (!PHONE_PATTERN.test(value)) {
            return "Введите корректный номер телефона"
          }
          return null
        },
      },
      deliveryType: { required: true },
      deliveryAddress: {
        required: true,
        custom: (value) => {
          const selectedOption = DELIVERY_OPTIONS.find((opt) => opt.name === values.deliveryType)
          if (selectedOption?.requiresAddress && !value.trim()) {
            return "Укажите адрес доставки"
          }
          return null
        },
      },
      deliveryDate: {
        custom: (value) => {
          const isPickup = values.deliveryType === "Самовывоз"
          if (!isPickup && !value) {
            return "Выберите дату доставки"
          }
          return null
        },
      },
      deliveryTime: {
        custom: (value) => {
          const isPickup = values.deliveryType === "Самовывоз"
          if (!isPickup && !value) {
            return "Выберите время доставки"
          }
          return null
        },
      },
    },
  )

  // Мемоизированные опции для дат и времени
  const deliveryDates = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() + i)
      return {
        value: date.toISOString().split("T")[0],
        label: date.toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "long",
          weekday: "long",
        }),
      }
    })
  }, [])

  const timeSlots = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const startHour = i.toString().padStart(2, "0")
      const endHour = ((i + 1) % 24).toString().padStart(2, "0")
      return {
        value: `${startHour}:00-${endHour}:00`,
        label: `${startHour}:00 - ${endHour}:00`,
      }
    })
  }, [])

  const selectedDeliveryOption = useMemo(() => {
    return DELIVERY_OPTIONS.find((option) => option.name === values.deliveryType)
  }, [values.deliveryType])

  const showAddressField = selectedDeliveryOption?.requiresAddress ?? false
  const isPickup = values.deliveryType === "Самовывоз"
  const finalTotal = totalAmount + values.deliveryCost

  const handleDeliveryTypeChange = (deliveryType: string) => {
    const option = DELIVERY_OPTIONS.find((opt) => opt.name === deliveryType)
    setValue("deliveryType", deliveryType)
    setValue("deliveryCost", option?.cost ?? 0)

    if (!option?.requiresAddress) {
      setValue("deliveryAddress", "")
      setValue("deliveryDate", "")
      setValue("deliveryTime", "")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateAll()) {
      onSubmit(values)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Контактная информация */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Контактная информация</h2>

        <FormField
          label="ФИО"
          name="customerName"
          value={values.customerName}
          onChange={(value) => setValue("customerName", value)}
          onBlur={() => setFieldTouched("customerName")}
          error={errors.customerName}
          placeholder="Иванов Иван Иванович"
          required
        />

        <FormField
          label="Телефон"
          name="phoneNumber"
          type="tel"
          value={values.phoneNumber}
          onChange={(value) => setValue("phoneNumber", value)}
          onBlur={() => setFieldTouched("phoneNumber")}
          error={errors.phoneNumber}
          placeholder="+7 (999) 123-45-67"
          required
        />
      </div>

      {/* Доставка */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Доставка</h2>

        <div className="space-y-2">
          <Label className="after:content-['*'] after:text-red-500 after:ml-1">Выберите ваш район</Label>
          <Select value={values.deliveryType} onValueChange={handleDeliveryTypeChange}>
            <SelectTrigger className={`rounded-full ${errors.deliveryType ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Выберите район" />
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-[300px] overflow-y-auto">
              {DELIVERY_OPTIONS.map((option) => (
                <SelectItem key={option.name} value={option.name}>
                  {option.name} {option.cost > 0 && `(+${formatCurrency(option.cost)})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.deliveryType && <p className="text-red-500 text-sm mt-1">{errors.deliveryType}</p>}
        </div>

        {showAddressField && (
          <FormField
            label="Адрес доставки"
            name="deliveryAddress"
            value={values.deliveryAddress}
            onChange={(value) => setValue("deliveryAddress", value)}
            onBlur={() => setFieldTouched("deliveryAddress")}
            error={errors.deliveryAddress}
            placeholder="Улица, дом, квартира"
            required
          />
        )}

        {!isPickup && (
          <>
            <div className="space-y-2">
              <Label className="after:content-['*'] after:text-red-500 after:ml-1">Дата доставки</Label>
              <Select value={values.deliveryDate} onValueChange={(value) => setValue("deliveryDate", value)}>
                <SelectTrigger className={`rounded-full ${errors.deliveryDate ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Выберите дату" />
                  <Calendar className="h-4 w-4 opacity-50 ml-2" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-[300px] overflow-y-auto">
                  {deliveryDates.map((date) => (
                    <SelectItem key={date.value} value={date.value}>
                      {date.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.deliveryDate && <p className="text-red-500 text-sm mt-1">{errors.deliveryDate}</p>}
            </div>

            <div className="space-y-2">
              <Label className="after:content-['*'] after:text-red-500 after:ml-1">Время доставки</Label>
              <Select value={values.deliveryTime} onValueChange={(value) => setValue("deliveryTime", value)}>
                <SelectTrigger className={`rounded-full ${errors.deliveryTime ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Выберите время" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-[300px] overflow-y-auto">
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.deliveryTime && <p className="text-red-500 text-sm mt-1">{errors.deliveryTime}</p>}
            </div>
          </>
        )}
      </div>

      {/* Отправка фото */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Отправим фото букета. Куда?</h2>
        <RadioGroup
          value={values.photoSendTo}
          onValueChange={(value) => setValue("photoSendTo", value)}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={PHOTO_SEND_OPTIONS.WHATSAPP} id="whatsapp" />
            <Label htmlFor="whatsapp">WhatsApp</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={PHOTO_SEND_OPTIONS.TELEGRAM} id="telegram" />
            <Label htmlFor="telegram">Telegram</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Способ оплаты */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Способ оплаты</h2>
        <RadioGroup
          value={values.paymentMethod}
          onValueChange={(value) => setValue("paymentMethod", value)}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={PAYMENT_METHODS.CARD} id="card" />
            <Label htmlFor="card">Картой онлайн</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Итого и кнопка */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-lg">Итого:</span>
          <span className="font-bold text-xl">{formatCurrency(finalTotal)}</span>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className={`w-full text-white rounded-full transition-colors duration-200 ${
            isSubmitting ? "bg-gray-400 hover:bg-gray-400" : "bg-[#E10600] hover:bg-[#c00500]"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Обработка...
            </>
          ) : (
            "Подтвердить заказ"
          )}
        </Button>
      </div>
    </form>
  )
}
