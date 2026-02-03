import type React from "react"
// Оптимизированный layout
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { TelegramProvider } from "@/lib/telegram-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { cn } from "@/lib/utils"
import "@/app/globals.css"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Цветочный магазин",
  description: "Telegram Mini App для магазина цветов",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning className={inter.variable}>
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className={cn("min-h-screen bg-white font-sans antialiased", "font-inter")}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
            <TelegramProvider>
              {children}
              <Toaster />
            </TelegramProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
