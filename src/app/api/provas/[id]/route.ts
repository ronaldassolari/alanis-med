import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const prova = await db.prova.findUnique({
    where: { id },
    include: {
      questoes: {
        orderBy: { ordem: "asc" },
      },
    },
  })

  if (!prova) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(prova)
}
