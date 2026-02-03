// Оптимизированный API route
import { type NextRequest, NextResponse } from "next/server"
import type { ApiResponse } from "@/lib/types"

const EXTERNAL_API_URL = "https://cvetloff-web-app.ru/orderhook/new"
const REQUEST_TIMEOUT = 10000

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const orderData = await request.json()

    console.log("Processing order:", {
      orderId: orderData.client_order_id,
      totalAmount: orderData.totalAmount,
      itemsCount: orderData.items?.length,
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      const response = await fetch(EXTERNAL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`External API error: ${response.status}`, errorText)

        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: `External API error: ${response.status}`,
          },
          { status: response.status },
        )
      }

      const responseData = await response.json()
      console.log("Order processed successfully:", responseData)

      return NextResponse.json<ApiResponse>({
        success: true,
        data: responseData,
      })
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof DOMException && error.name === "AbortError") {
        console.error("Request timeout")
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: "Request timeout",
          },
          { status: 504 },
        )
      }

      throw error
    }
  } catch (error) {
    console.error("Order processing error:", error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to process order",
      },
      { status: 500 },
    )
  }
}
