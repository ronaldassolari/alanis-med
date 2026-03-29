"use client"

import { useState } from "react"
import { Sparkles, RefreshCw, TrendingDown, TrendingUp, Calendar, Lightbulb, AlertCircle } from "lucide-react"

interface DisciplinaStat {
  nome: string
  percent: number
  nota: number | null
  status: string
}

interface Stats {
  progressoGeral: number
  concluidas: number
  total: number
  tempoHoras: number
  notaMedia: number | null
  disciplinas: DisciplinaStat[]
}

interface Analise {
  resumo: string
  pontosFracos: { disciplina: string; problema: string; sugestao: string }[]
  pontosFortes: { disciplina: string; destaque: string }[]
  planoSemana: { dia: string; foco: string; meta: string }[]
  dicaPrincipal: string
}

export function AnaliseIA({ stats }: { stats: Stats }) {
  const [loading, setLoading] = useState(false)
  const [analise, setAnalise] = useState<Analise | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function analisar() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/analise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats }),
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setAnalise(data.analise)
    } catch {
      setError("Erro de rede. Tente novamente.")
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#0066FF" }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Análise IA do seu Desempenho</h2>
            <p className="text-xs text-slate-500">IA analisa seus pontos fracos e cria um plano personalizado</p>
          </div>
        </div>
        <button
          onClick={analisar}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: "#0066FF" }}
        >
          {loading ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Analisando...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> {analise ? "Reanalisar" : "Analisar meu desempenho"}</>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 flex items-center gap-3 bg-red-50 border-b border-red-100">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Placeholder antes de analisar */}
      {!analise && !loading && !error && (
        <div className="p-8 text-center">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Clique em <strong>Analisar meu desempenho</strong> para a IA identificar seus pontos fracos e criar um plano de estudo personalizado.</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="p-8 text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 mx-auto mb-3 animate-spin" />
          <p className="text-slate-500 text-sm">A IA está analisando seu desempenho...</p>
          <p className="text-slate-400 text-xs mt-1">Isso leva alguns segundos</p>
        </div>
      )}

      {/* Resultado */}
      {analise && !loading && (
        <div className="p-5 space-y-5">
          {/* Resumo */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-slate-700 leading-relaxed">{analise.resumo}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pontos Fracos */}
            {analise.pontosFracos?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <TrendingDown className="w-4 h-4 text-red-500" /> Pontos a Melhorar
                </h3>
                <div className="space-y-2">
                  {analise.pontosFracos.map((p, i) => (
                    <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-xs font-semibold text-red-700 mb-1">{p.disciplina}</p>
                      <p className="text-xs text-slate-600 mb-1">{p.problema}</p>
                      <p className="text-xs text-blue-600 font-medium">→ {p.sugestao}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pontos Fortes */}
            {analise.pontosFortes?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Pontos Fortes
                </h3>
                <div className="space-y-2">
                  {analise.pontosFortes.map((p, i) => (
                    <div key={i} className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <p className="text-xs font-semibold text-emerald-700 mb-1">{p.disciplina}</p>
                      <p className="text-xs text-slate-600">{p.destaque}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Plano da Semana */}
          {analise.planoSemana?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-blue-500" /> Plano de Estudos — Esta Semana
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {analise.planoSemana.map((dia, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs font-bold text-slate-700 mb-1">{dia.dia}</p>
                    <p className="text-xs text-blue-600 font-medium mb-1">{dia.foco}</p>
                    <p className="text-xs text-slate-500">{dia.meta}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dica Principal */}
          {analise.dicaPrincipal && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">{analise.dicaPrincipal}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
