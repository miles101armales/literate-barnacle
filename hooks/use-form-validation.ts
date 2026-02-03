// Хук для валидации форм
"use client"

import { useState, useCallback } from "react"

type ValidationRule<T> = {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: T) => string | null
}

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>
}

type ValidationErrors<T> = {
  [K in keyof T]?: string
}

export function useFormValidation<T extends Record<string, any>>(initialValues: T, rules: ValidationRules<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<ValidationErrors<T>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const validateField = useCallback(
    (name: keyof T, value: any): string | null => {
      const rule = rules[name]
      if (!rule) return null

      if (rule.required && (!value || (typeof value === "string" && !value.trim()))) {
        return "Это поле обязательно для заполнения"
      }

      if (typeof value === "string") {
        if (rule.minLength && value.length < rule.minLength) {
          return `Минимальная длина: ${rule.minLength} символов`
        }

        if (rule.maxLength && value.length > rule.maxLength) {
          return `Максимальная длина: ${rule.maxLength} символов`
        }

        if (rule.pattern && !rule.pattern.test(value)) {
          return "Неверный формат"
        }
      }

      if (rule.custom) {
        return rule.custom(value)
      }

      return null
    },
    [rules],
  )

  const setValue = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }))

      // Валидируем поле если оно уже было затронуто
      if (touched[name]) {
        const error = validateField(name, value)
        setErrors((prev) => ({ ...prev, [name]: error || undefined }))
      }
    },
    [touched, validateField],
  )

  const setFieldTouched = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }))

      const error = validateField(name, values[name])
      setErrors((prev) => ({ ...prev, [name]: error || undefined }))
    },
    [values, validateField],
  )

  const validateAll = useCallback((): boolean => {
    const newErrors: ValidationErrors<T> = {}
    let isValid = true

    Object.keys(rules).forEach((key) => {
      const fieldName = key as keyof T
      const error = validateField(fieldName, values[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    setTouched(Object.keys(rules).reduce((acc, key) => ({ ...acc, [key]: true }), {}))

    return isValid
  }, [rules, values, validateField])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0,
  }
}
