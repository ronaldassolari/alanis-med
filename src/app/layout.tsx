import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "alanis.med — Preparação para Residência Médica",
  description: "Plataforma completa de preparação para residência médica. Aulas, provas, testes e acompanhamento de progresso.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
