import { NextResponse } from "next/server"
import { getStats } from "@/lib/ea"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const payload = await getStats()

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível consultar a API da EA."

    console.error(
      "[EA API] Falha ao carregar as estatísticas:",
      error,
    )

    return NextResponse.json(
      { message },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    )
  }
}