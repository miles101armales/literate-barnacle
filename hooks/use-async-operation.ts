// Хук для асинхронных операций
"use client"

import { useState, useCallback } from "react"
import { useToast } from "./use-toast"

interface UseAsyncOperationOptions {
  successMessage?: string
  errorMessage?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useAsyncOperation<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  options: UseAsyncOperationOptions = {},
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const execute = useCallback(
    async (...args: T): Promise<R | null> => {
      try {
        setLoading(true)
        setError(null)

        const result = await operation(...args)

        if (options.successMessage) {
          toast({
            title: "Успех",
            description: options.successMessage,
            duration: 3000,
          })
        }

        options.onSuccess?.()
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error")
        setError(error)

        const errorMessage = options.errorMessage || error.message
        toast({
          title: "Ошибка",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        })

        options.onError?.(error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [operation, options, toast],
  )

  return {
    execute,
    loading,
    error,
    reset: () => {
      setError(null)
      setLoading(false)
    },
  }
}
