// Переиспользуемый компонент поля формы
"use client"

import type React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  name: string
  value: string | number
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  type?: "text" | "email" | "tel" | "number" | "textarea"
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function FormField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  placeholder,
  required,
  disabled,
  className,
}: FormFieldProps) {
  const inputId = `field-${name}`
  const hasError = Boolean(error)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const inputProps = {
    id: inputId,
    name,
    value: value.toString(),
    onChange: handleChange,
    onBlur,
    placeholder,
    disabled,
    className: cn("rounded-full", hasError && "border-red-500 focus:border-red-500", className),
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className={cn(required && "after:content-['*'] after:text-red-500 after:ml-1")}>
        {label}
      </Label>

      {type === "textarea" ? (
        <Textarea {...inputProps} className={cn(inputProps.className, "rounded-lg")} rows={3} />
      ) : (
        <Input {...inputProps} type={type} />
      )}

      {hasError && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
