import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { DisciplinaBadge, Badge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/ui/progress-bar"
import { ArrowLeft, Clock, CheckCircle, BookOpen, ExternalLink } from "lucide-react"

interface AulaPageProps {
  params: Promise<{ id: string }>
}

export default async function AulaDetailPage({ params }: AulaPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params
  const userId = session.user.id

  const [aula, progresso] = await Promise.all([
    db.aula.findUnique({ where: { id } }),
    db.progresso.findUnique({ where: { userId_aulaId: { userId, aulaId: id } } }),
  ])

  if (!aula) notFound()

  async function marcarProgresso(percentual: number, concluido: boolean) {
    "use server"
    const session = await auth()
    if (!session?.user?.id) return

    await db.progresso.upsert({
      where: { userId_aulaId: { userId: session.user.id, aulaId: id } },
      create: {
        userId: session.user.id,
        aulaId: id,
        percentual,
        concluido,
        dataFim: concluido ? new Date() : undefined,
        tempoGasto: aula?.duracao ?? 0,
      },
      update: {
        percentual,
        concluido,
        dataFim: concluido ? new Date() : undefined,
      },
    })

    revalidatePath(`/aulas/${id}`)
    revalidatePath("/aulas")
    revalidatePath("/")
    revalidatePath("/progresso")
  }

  async function handleConcluir() {
    "use server"
    await marcarProgresso(100, true)
  }

  async function handleIniciar() {
    "use server"
    await marcarProgresso(50, false)
  }

  const percentual = progresso?.percentual ?? 0
  const concluido = progresso?.concluido ?? false

  // Extract YouTube ID from URL
  function getYouTubeId(url: string) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    return match?.[1]
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Back */}
      <Link
        href="/aulas"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-600 mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Aulas
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          <DisciplinaBadge disciplina={aula.disciplina} />
          <Badge variant={aula.tipo === "video" ? "blue" : "gray"}>
            {aula.tipo === "video" ? "Video" : "Texto"}
          </Badge>
          <Badge variant={aula.nivel === "basico" ? "green" : aula.nivel === "avancado" ? "red" : "yellow"}>
            {aula.nivel === "basico" ? "Básico" : aula.nivel === "avancado" ? "Avançado" : "Intermediário"}
          </Badge>
          {concluido && <Badge variant="green">Concluída</Badge>}
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">{aula.titulo}</h1>
        <p className="text-slate-500">{aula.descricao}</p>

        {aula.duracao && (
          <div className="flex items-center gap-1 mt-3 text-sm text-slate-400">
            <Clock className="w-4 h-4" />
            <span>{aula.duracao} minutos</span>
          </div>
        )}

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-slate-500 mb-2">
            <span>Seu progresso nesta aula</span>
            <span className="font-semibold">{percentual}%</span>
          </div>
          <ProgressBar value={percentual} color={concluido ? "green" : "blue"} size="md" />
        </div>
      </div>

      {/* Video link — só mostra se tiver URL real */}
      {aula.videoUrl && (
        <div className="mb-6">
          <a
            href={aula.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Assistir no YouTube
          </a>
        </div>
      )}

      {/* Content */}
      {aula.conteudo && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-sky-600" />
            <h2 className="font-semibold text-slate-700">Conteúdo</h2>
          </div>
          <div className="max-w-none text-slate-600 leading-relaxed space-y-2">
            {aula.conteudo.split("\n").map((line, i) => {
              // Process bold markdown **text**
              const parts = line.split(/\*\*(.*?)\*\*/)
              const rendered = parts.map((part, j) =>
                j % 2 === 1 ? <strong key={j} className="text-slate-800 font-semibold">{part}</strong> : part
              )
              // Render line with dash as list item
              if (line.trim().startsWith("- ")) {
                return <div key={i} className="flex gap-2 pl-2"><span className="text-sky-500">•</span><span>{rendered}</span></div>
              }
              // Empty line = spacer
              if (line.trim() === "") return <div key={i} className="h-2" />
              return <p key={i} className="leading-relaxed">{rendered}</p>
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-semibold text-slate-700 mb-4">Marcar progresso</h2>
        <div className="flex gap-3 flex-wrap">
          {!concluido && (
            <form action={handleIniciar}>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 border border-sky-300 text-sky-700 hover:bg-sky-50 rounded-lg text-sm font-medium transition-colors"
              >
                Em andamento (50%)
              </button>
            </form>
          )}
          <form action={handleConcluir}>
            <button
              type="submit"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                concluido
                  ? "bg-emerald-100 text-emerald-700 cursor-default"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
              disabled={concluido}
            >
              <CheckCircle className="w-4 h-4" />
              {concluido ? "Aula concluída!" : "Marcar como concluída"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
