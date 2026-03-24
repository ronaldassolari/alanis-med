"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, ChevronRight, CheckCircle, AlertCircle, Zap, Star, Trophy } from "lucide-react"

interface Questao {
  id: string
  enunciado: string
  opcaoA: string
  opcaoB: string
  opcaoC: string
  opcaoD: string
  opcaoE: string | null
  gabarito: string
  explicacao: string | null
  disciplina: string | null
  tema: string | null
  dificuldade: string
  ordem: number
}

interface Prova {
  id: string
  nome: string
  tipo: string
  subtipo: string
  ano: number | null
  dificuldade: string
  tempoPrevisto: number | null
  questoes: Questao[]
}

interface Resultado {
  acertos: number
  total: number
  nota: number
  pontosGanhos: number
  tempo: number
}

interface ProvaPageProps {
  params: Promise<{ id: string }>
}

const dificuladadeConfig = {
  facil: { label: "Fácil", color: "bg-emerald-100 text-emerald-700", weight: "1.0 pt" },
  medio: { label: "Médio", color: "bg-amber-100 text-amber-700", weight: "1.5 pt" },
  dificil: { label: "Difícil", color: "bg-red-100 text-red-700", weight: "2.0 pt" },
}

function conceito(nota: number): { label: string; color: string } {
  if (nota >= 9) return { label: "Excelente", color: "text-emerald-600" }
  if (nota >= 7) return { label: "Bom", color: "text-blue-600" }
  if (nota >= 6) return { label: "Regular", color: "text-amber-600" }
  return { label: "Insuficiente", color: "text-red-600" }
}

export default function ProvaDetailPage({ params }: ProvaPageProps) {
  const [provaId, setProvaId] = useState<string>("")
  const [prova, setProva] = useState<Prova | null>(null)
  const [loading, setLoading] = useState(true)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [tempoSegundos, setTempoSegundos] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    params.then((p) => setProvaId(p.id))
  }, [params])

  useEffect(() => {
    if (!provaId) return
    fetch(`/api/provas/${provaId}`)
      .then((r) => r.json())
      .then((data) => { setProva(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [provaId])

  useEffect(() => {
    if (submitted) return
    const interval = setInterval(() => setTempoSegundos((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [submitted])

  const formatTempo = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  const handleResposta = (questaoId: string, opcao: string) => {
    if (submitted) return
    setRespostas((prev) => ({ ...prev, [questaoId]: opcao }))
  }

  const handleSubmit = async () => {
    if (!prova || submitting) return
    setSubmitting(true)

    let acertos = 0
    prova.questoes.forEach((q) => {
      if (respostas[q.id] === q.gabarito) acertos++
    })
    const total = prova.questoes.length

    const resp = await fetch("/api/testes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provaId: prova.id,
        tipo: "prova",
        respostas,
        acertos,
        total,
        tempo: tempoSegundos,
      }),
    })

    if (resp.ok) {
      const data = await resp.json()
      setResultado({
        acertos,
        total,
        nota: data.nota.valor,
        pontosGanhos: data.pontosGanhos,
        tempo: tempoSegundos,
      })
      setSubmitted(true)
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400 text-sm">Carregando prova...</div>
      </div>
    )
  }

  if (!prova) {
    return (
      <div className="p-8">
        <p className="text-red-500">Prova não encontrada.</p>
        <Link href="/provas" className="text-blue-600 hover:underline">Voltar</Link>
      </div>
    )
  }

  const answeredCount = Object.keys(respostas).length

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <Link href="/provas" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Voltar para Provas
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{prova.nome}</h1>
            <p className="text-slate-500 text-sm mt-1">
              {prova.questoes.length} questões • {prova.tipo}
              {prova.ano && ` • ${prova.ano}`}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dificuladadeConfig[prova.dificuldade as keyof typeof dificuladadeConfig]?.color ?? "bg-slate-100 text-slate-600"}`}>
                {dificuladadeConfig[prova.dificuldade as keyof typeof dificuladadeConfig]?.label ?? prova.dificuldade}
              </span>
              <span className="text-xs text-slate-400">Pontuação ponderada: Fácil 1pt · Médio 1.5pt · Difícil 2pt</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="font-mono font-semibold text-slate-700">{formatTempo(tempoSegundos)}</span>
          </div>
        </div>
        {!submitted && (
          <div className="mt-3 flex items-center gap-4">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-1.5 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: prova.questoes.length > 0 ? `${(answeredCount / prova.questoes.length) * 100}%` : "0%" }}
              />
            </div>
            <span className="text-sm text-slate-500 flex-shrink-0">
              <span className="font-medium text-slate-700">{answeredCount}</span>/{prova.questoes.length}
            </span>
          </div>
        )}
      </div>

      {/* Result Screen */}
      {submitted && resultado && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="text-center mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 ${resultado.nota >= 6 ? "bg-emerald-100" : "bg-red-100"}`}>
              {resultado.nota >= 6 ? (
                <Trophy className="w-10 h-10 text-emerald-600" />
              ) : (
                <AlertCircle className="w-10 h-10 text-red-500" />
              )}
            </div>
            <div className="text-4xl font-bold text-slate-800 mb-1">
              {resultado.nota.toFixed(1)}<span className="text-lg text-slate-400">/10</span>
            </div>
            <p className={`text-lg font-semibold ${conceito(resultado.nota).color}`}>
              {conceito(resultado.nota).label}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {resultado.nota >= 6 ? "Parabéns! Você foi aprovada nesta prova!" : "Continue praticando para melhorar!"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-slate-500">Acertos</span>
              </div>
              <p className="text-xl font-bold text-slate-800">{resultado.acertos}<span className="text-sm text-slate-400">/{resultado.total}</span></p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-slate-500">Tempo</span>
              </div>
              <p className="text-xl font-bold text-slate-800">{formatTempo(resultado.tempo)}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-slate-500">XP ganhos</span>
              </div>
              <p className="text-xl font-bold text-amber-600">+{resultado.pontosGanhos}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Link
              href="/notas"
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Star className="w-4 h-4" />
              Ver análise completa
            </Link>
            <Link
              href="/provas"
              className="flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Outras provas
            </Link>
          </div>
        </div>
      )}

      {/* Questões */}
      <div className="space-y-6">
        {prova.questoes.map((q, index) => {
          const userAnswer = respostas[q.id]
          const isCorrect = submitted && userAnswer === q.gabarito
          const isWrong = submitted && userAnswer && userAnswer !== q.gabarito
          const difConfig = dificuladadeConfig[q.dificuldade as keyof typeof dificuladadeConfig]

          const allOpcoes = [
            { key: "A", text: q.opcaoA },
            { key: "B", text: q.opcaoB },
            { key: "C", text: q.opcaoC },
            { key: "D", text: q.opcaoD },
            ...(q.opcaoE ? [{ key: "E", text: q.opcaoE }] : []),
          ]

          return (
            <div
              key={q.id}
              className={`bg-white rounded-xl border shadow-sm p-6 ${
                submitted
                  ? isCorrect ? "border-emerald-200" : isWrong ? "border-red-200" : "border-slate-200"
                  : "border-slate-200"
              }`}
            >
              {/* Questão header */}
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center text-white" style={{ backgroundColor: "#0066FF" }}>
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {q.disciplina && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{q.disciplina}</span>
                    )}
                    {difConfig && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difConfig.color}`}>
                        {difConfig.label} · {difConfig.weight}
                      </span>
                    )}
                    {submitted && (
                      isCorrect
                        ? <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" />Correto</span>
                        : isWrong
                        ? <span className="text-xs text-red-500 font-semibold">Errado (gabarito: {q.gabarito})</span>
                        : <span className="text-xs text-slate-400">Não respondida</span>
                    )}
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed">{q.enunciado}</p>
                </div>
              </div>

              {/* Opções */}
              <div className="space-y-2 ml-10">
                {allOpcoes.map(({ key, text }) => {
                  const isSelected = userAnswer === key
                  const isGabarito = submitted && q.gabarito === key

                  let btnClass = "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/50"
                  if (!submitted && isSelected) {
                    btnClass = "border-blue-500 bg-blue-50 text-blue-700"
                  } else if (submitted) {
                    if (isGabarito) {
                      btnClass = "border-emerald-400 bg-emerald-50 text-emerald-700"
                    } else if (isSelected && !isGabarito) {
                      btnClass = "border-red-400 bg-red-50 text-red-700"
                    }
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => handleResposta(q.id, key)}
                      disabled={submitted}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${btnClass} ${submitted ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                        {key}
                      </span>
                      <span className="text-sm">{text}</span>
                    </button>
                  )
                })}
              </div>

              {/* Explicação */}
              {submitted && q.explicacao && (
                <div className="mt-4 ml-10 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-semibold text-blue-600 mb-1">Explicação:</p>
                  <p className="text-sm text-slate-700">{q.explicacao}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Submit bar */}
      {!submitted && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between sticky bottom-4">
          <p className="text-sm text-slate-500">
            {answeredCount < prova.questoes.length ? (
              <span className="text-amber-600">{prova.questoes.length - answeredCount} sem resposta</span>
            ) : (
              <span className="text-emerald-600">Todas respondidas!</span>
            )}
          </p>
          <button
            onClick={handleSubmit}
            disabled={submitting || answeredCount === 0}
            className="flex items-center gap-2 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
            style={{ backgroundColor: "#0066FF" }}
          >
            {submitting ? "Enviando..." : "Finalizar Prova"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
