// Error Boundary для обработки ошибок
"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Что-то пошло не так</h1>
          <p className="text-gray-600 mb-6 text-center">
            Произошла непредвиденная ошибка. Пожалуйста, перезагрузите страницу.
          </p>
          <Button onClick={() => window.location.reload()} className="bg-[#E10600] hover:bg-[#c00500]">
            Перезагрузить страницу
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
