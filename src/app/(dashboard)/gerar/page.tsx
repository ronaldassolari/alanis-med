"use client"

import { useState } from "react"
import type { QuestaoGerada } from "@/app/actions/gerar"
import { Sparkles, RefreshCw, CheckCircle, AlertCircle, BookOpen, ChevronDown, ChevronUp } from "lucide-react"

const DISCIPLINAS = [
  "Clínica Médica",
  "Cirurgia",
  "Pediatria",
  "Ginecologia",
  "Saúde Pública",
  "Psiquiatria",
  "Medicina de Família",
  "Ortopedia",
  "Dermatologia",
  "Neurologia",
]

const TEMAS: Record<string, string[]> = {
  "Clínica Médica": ["Cardiologia", "Endocrinologia", "Pneumologia", "Nefrologia", "Gastroenterologia", "Reumatologia", "Neurologia", "Infectologia", "Hematologia", "UTI"],
  "Cirurgia": ["Trauma / ATLS", "Abdome Agudo", "Cirurgia Abdominal", "Oncologia Cirúrgica", "Cirurgia Torácica", "Queimaduras"],
  "Pediatria": ["Neonatologia", "Pneumologia Pediátrica", "Infectologia Pediátrica", "Nutrição", "Desenvolvimento", "Imunização"],
  "Ginecologia": ["Obstetrícia", "Ginecologia Geral", "Oncologia Ginecológica", "Uroginecologia"],
  "Saúde Pública": ["SUS", "Epidemiologia", "Atenção Primária", "Vigilância Epidemiológica", "Políticas de Saúde"],
}

const dificuladadeConfig = {
  facil: { label: "Fácil", color: "bg-emerald-100 text-emerald-700 border-emerald-200", peso: "1.0 pt" },
  medio: { label: "Médio", color: "bg-amber-100 text-amber-700 border-amber-200", peso: "1.5 pt" },
  dificil: { label: "Difícil", color: "bg-red-100 text-red-700 border-red-200", peso: "2.0 pt" },
}

function QuestaoCard({ q, index }: { q: QuestaoGerada; index: number }) {
  const [aberto, setAberto] = useState(false)
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const [revelado, setRevelado] = useState(false)

  const opcoes = [
    { key: "A", text: q.opcaoA },
    { key: "B", text: q.opcaoB },
    { key: "C", text: q.opcaoC },
    { key: "D", text: q.opcaoD },
    ...(q.opcaoE ? [{ key: "E", text: q.opcaoE }] : []),
  ]

  const difCfg = dificuladadeConfig[q.dificuldade as keyof typeof dificuladadeConfig]

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setAberto((v) => !v)}
        className="w-full flex items-start gap-3 p-5 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="flex-shrink-0 w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center" style={{ backgroundColor: "#0066FF" }}>
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{q.disciplina}</span>
            {q.tema && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{q.tema}</span>}
            {difCfg && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${difCfg.color}`}>
                {difCfg.label}
              </span>
            )}
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 ml-auto">
              <Sparkles className="w-3 h-3" /> IA
            </span>
          </div>
          <p className="text-sm text-slate-700 leading-snug line-clamp-2">{q.enunciado}</p>
        </div>
        {aberto ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />}
      </button>

      {/* Body */}
      {aberto && (
        <div className="px-5 pb-5 border-t border-slate-100">
          <p className="text-slate-700 font-medium leading-relaxed mt-4 mb-4">{q.enunciado}</p>

          <div className="space-y-2">
            {opcoes.map(({ key, text }) => {
              const isSelected = selecionada === key
              const isCorrect = revelado && q.gabarito === key
              const isWrong = revelado && isSelected && key !== q.gabarito

              let cls = "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/50"
              if (!revelado && isSelected) cls = "border-blue-500 bg-blue-50 text-blue-700"
              else if (isCorrect) cls = "border-emerald-400 bg-emerald-50 text-emerald-700"
              else if (isWrong) cls = "border-red-400 bg-red-50 text-red-700"

              return (
                <button
                  key={key}
                  onClick={() => !revelado && setSelecionada(key)}
                  disabled={revelado}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${cls} ${revelado ? "cursor-default" : "cursor-pointer"}`}
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">{key}</span>
                  <span className="text-sm">{text}</span>
                </button>
              )
            })}
          </div>

          <div className="flex gap-3 mt-4">
            {!revelado && (
              <button
                onClick={() => setRevelado(true)}
                disabled={!selecionada}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-40"
                style={{ backgroundColor: "#0066FF" }}
              >
                Ver gabarito
              </button>
            )}
            {revelado && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${selecionada === q.gabarito ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                {selecionada === q.gabarito ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {selecionada === q.gabarito ? "Correto!" : `Errado — gabarito: ${q.gabarito}`}
              </div>
            )}
            <button
              onClick={() => { setSelecionada(null); setRevelado(false) }}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Resetar
            </button>
          </div>

          {revelado && q.explicacao && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs font-semibold text-blue-600 mb-1">Explicação:</p>
              <p className="text-sm text-slate-700">{q.explicacao}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function GerarPage() {
  const [disciplina, setDisciplina] = useState("Clínica Médica")
  const [dificuldade, setDificuldade] = useState("medio")
  const [quantidade, setQuantidade] = useState(5)
  const [tema, setTema] = useState("")
  const [loading, setLoading] = useState(false)
  const [questoes, setQuestoes] = useState<QuestaoGerada[]>([])
  const [error, setError] = useState<string | null>(null)

  const temasDaDisciplina = TEMAS[disciplina] || []

  async function handleGerar() {
    setLoading(true)
    setError(null)
    setQuestoes([])

    try {
      const res = await fetch("/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disciplina, dificuldade, quantidade: String(quantidade), tema }),
      })
      const result = await res.json()
      if (result.error) {
        setError(result.error)
      } else {
        setQuestoes(result.questoes || [])
      }
    } catch (e) {
      setError(`Erro: ${e instanceof Error ? e.message : "Tente novamente."}`)
    }
    setLoading(false)
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#0066FF" }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Gerador de Questões IA</h1>
        </div>
        <p className="text-slate-500">Crie questões personalizadas no estilo ENARE/CAJURU usando inteligência artificial</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Disciplina */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Disciplina</label>
            <select
              value={disciplina}
              onChange={(e) => { setDisciplina(e.target.value); setTema("") }}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ focusRingColor: "#0066FF" } as React.CSSProperties}
            >
              {DISCIPLINAS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Tema */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tema (opcional)</label>
            <select
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            >
              <option value="">Todos os temas</option>
              {temasDaDisciplina.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Dificuldade */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Dificuldade</label>
            <div className="flex gap-2">
              {(["facil", "medio", "dificil"] as const).map((d) => {
                const cfg = dificuladadeConfig[d]
                return (
                  <button
                    key={d}
                    onClick={() => setDificuldade(d)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${dificuldade === d ? cfg.color : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Quantidade: <span className="font-bold" style={{ color: "#0066FF" }}>{quantidade}</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={quantidade}
              onChange={(e) => setQuantidade(parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-0.5">
              <span>1</span><span>5</span><span>10</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleGerar}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
          style={{ backgroundColor: "#0066FF" }}
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Gerando {quantidade} questões com IA...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Gerar {quantidade} Questões
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700">Erro ao gerar questões</p>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
            {error.includes("API key") && (
              <p className="text-xs text-red-500 mt-2">
                Adicione sua chave no arquivo <code className="bg-red-100 px-1 rounded">.env</code>: <code className="bg-red-100 px-1 rounded">ANTHROPIC_API_KEY="sk-ant-..."</code>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Questões geradas */}
      {questoes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              {questoes.length} questões geradas
            </h2>
            <button
              onClick={handleGerar}
              disabled={loading}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Gerar novas
            </button>
          </div>
          <div className="space-y-4">
            {questoes.map((q, i) => <QuestaoCard key={i} q={q} index={i} />)}
          </div>
        </div>
      )}
    </div>
  )
}
