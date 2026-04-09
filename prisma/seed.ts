import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando seed v2...')

  // Clear in FK order
  await db.nota.deleteMany()
  await db.progresso.deleteMany()
  await db.teste.deleteMany()
  await db.questao.deleteMany()
  await db.prova.deleteMany()
  await db.aula.deleteMany()
  await db.userBadge.deleteMany()
  await db.meta.deleteMany()
  await db.session.deleteMany()
  await db.account.deleteMany()
  await db.user.deleteMany()
  await db.badge.deleteMany()

  // ── BADGES ──────────────────────────────────────────────────────────────────
  const badgesData = [
    { nome: 'Primeira Prova', descricao: 'Completou o primeiro simulado', icone: '🎯', cor: '#0066FF', criterio: 'first_test', pontos: 50 },
    { nome: 'Nota Perfeita', descricao: 'Tirou 10.0 em algum simulado', icone: '⭐', cor: '#FFD700', criterio: 'perfect_score', pontos: 200 },
    { nome: 'Sequência de Fogo', descricao: '7 dias seguidos de estudo', icone: '🔥', cor: '#FF4500', criterio: 'streak_7', pontos: 100 },
    { nome: 'Estudante Dedicada', descricao: 'Completou 10 aulas', icone: '📚', cor: '#4CAF50', criterio: 'lessons_10', pontos: 75 },
    { nome: 'Mestre do ENARE', descricao: 'Passou no simulado ENARE com nota ≥ 7', icone: '🏆', cor: '#0066FF', criterio: 'enare_pass', pontos: 300 },
    { nome: 'Especialista Cirúrgica', descricao: 'Acertou 90%+ em Cirurgia', icone: '🔪', cor: '#9C27B0', criterio: 'surgery_90', pontos: 150 },
    { nome: 'Maratonista', descricao: 'Fez 5 provas em um dia', icone: '🏃', cor: '#FF9800', criterio: 'five_tests_day', pontos: 100 },
    { nome: 'Pediatra Nato', descricao: 'Acertou 100% em Pediatria', icone: '👶', cor: '#E91E63', criterio: 'pediatria_100', pontos: 200 },
    { nome: 'Mês de Ouro', descricao: 'Estudou todos os dias do mês', icone: '🌟', cor: '#FFD700', criterio: 'streak_30', pontos: 500 },
    { nome: 'Top 10%', descricao: 'Ficou no top 10% do ranking', icone: '📊', cor: '#00BCD4', criterio: 'top_10_percentil', pontos: 250 },
  ]
  const badges = await Promise.all(badgesData.map((b) => db.badge.create({ data: b })))
  console.log('✅ Badges criados:', badges.length)

  // ── USER ────────────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash('alanis123', 12)
  const user = await db.user.create({
    data: {
      email: 'alanis@med.com',
      name: 'Alanis',
      password: hash,
      especialidade: 'Clínica Médica',
      pontos: 0,
      streakDias: 0,
      ultimoEstudo: null,
      planoAtivo: 'basico',
    },
  })
  console.log('✅ Usuário criado:', user.email)

  // Usuário novo — sem badges ainda

  // ── METAS ───────────────────────────────────────────────────────────────────
  await db.meta.createMany({
    data: [
      { userId: user.id, tipo: 'diaria', descricao: 'Completar 2 aulas', meta: 2, atual: 0, concluida: false },
      { userId: user.id, tipo: 'semanal', descricao: 'Fazer 3 simulados', meta: 3, atual: 0, concluida: false },
      { userId: user.id, tipo: 'mensal', descricao: 'Estudar 40 horas', meta: 40, atual: 0, concluida: false },
    ],
  })
  console.log('✅ Metas criadas')

  // ── AULAS (30) ──────────────────────────────────────────────────────────────
  const aulasData = [
    // ── Clínica Médica (8 aulas) ──
    {
      titulo: 'Hipertensão Arterial Sistêmica',
      descricao: 'Classificação da PA, estratificação de risco CV, metas terapêuticas, farmacoterapia 1ª linha (IECA/BRA/BCC/tiazídico) e emergência hipertensiva. Base: 7ª Diretriz SBC 2020.',
      disciplina: 'Clínica Médica', tema: 'Cardiologia', tipo: 'video', nivel: 'basico',
      duracao: 95, ordem: 1, mes: 1, semana: 1,
      videoUrl: 'https://www.youtube.com/watch?v=PfCPaFjq_I8',
      conteudo: `## Hipertensão Arterial Sistêmica

**Base:** 7ª Diretriz Brasileira de HAS (SBC 2020) + ESC/ESH 2023 + JNC 8

---

### 1. Fisiopatologia — Mecanismos Integrados

A HAS é uma síndrome multifatorial resultante da interação de fatores genéticos, ambientais e neuro-humorais. A elevação crônica da PA decorre de aumento do débito cardíaco (DC) e/ou da resistência vascular periférica (RVP) — PA = DC × RVP.

**Sistema Renina-Angiotensina-Aldosterona (SRAA):**
A renina, liberada pelas células justaglomerulares renais em resposta à queda de perfusão ou ativação adrenérgica, cliva o angiotensinogênio hepático em angiotensina I. A ECA pulmonar converte a Ang I em Ang II — o principal efetor: vasoconstrição arteriolar direta, estimulação da aldosterona (retenção de sódio e água), proliferação de células musculares lisas (remodelamento vascular), fibrose miocárdica e ativação simpática central. A aldosterona aumenta a expressão de canais Na+/K+-ATPase no túbulo distal, retendo sódio e expandindo o volume plasmático — mecanismo central da HAS por hiperaldosteronismo primário (síndrome de Conn).

**Sistema Nervoso Simpático (SNS):**
O aumento crônico da atividade simpática — mediado por reflexos de quimiorreceptores, barorreceptores e núcleos hipotalâmicos — eleva FC, contratilidade e RVP. Contribuição central na HAS essencial: níveis elevados de noradrenalina plasmática, aumento da densidade de receptores β1 cardíacos e α1 vasculares. A apneia obstrutiva do sono amplifica a atividade simpática via hipóxia intermitente noturna e é uma das causas mais subestimadas de HAS resistente.

**Rigidez Arterial e Envelhecimento Vascular:**
O envelhecimento e a HAS crônica determinam fragmentação de fibras de elastina e deposição de colágeno nas paredes arteriais → aumento da velocidade de onda de pulso (VOP) → reflexo de onda de retorno precoce → elevação preferencial da PAS e queda da PAD (HAS sistólica isolada do idoso). A VOP > 10 m/s é marcador independente de lesão vascular subclínica e risco CV elevado (ESC/ESH 2023).

**Rim como víscera central da HAS:**
A teoria de Guyton demonstra que o rim é o árbitro final da PA: curva pressão-natriurese deslocada para a direita em hipertensos (maior PA necessária para excretar a mesma carga de sódio). Microalbuminúria = lesão da barreira de filtração glomerular, marcador de disfunção endotelial sistêmica e risco CV elevado, antes de qualquer queda da TFG.

**Microbioma intestinal e HAS:**
Evidências emergentes (ESC 2023) apontam que a disbiose intestinal, com redução de bactérias produtoras de ácidos graxos de cadeia curta (butirato, propionato), compromete o endotélio vascular e amplifica a resposta inflamatória — correlação positiva com HAS em estudos observacionais; ainda não aplicado terapeuticamente, mas justifica orientações dietéticas (fibras, DASH).

> A HAS essencial não tem causa única. É a expressão fenotípica de múltiplos mecanismos simultâneos — SRAA hiperativo, SNS aumentado, rim hipersensível ao sódio, vasos rígidos e disfunção endotelial.

---

### 2. Classificação da Pressão Arterial

A HAS é definida pela presença sustentada de PAS ≥ 140 mmHg e/ou PAD ≥ 90 mmHg em adultos, confirmada em duas ou mais ocasiões, medida com técnica adequada. Afeta cerca de 38% da população adulta brasileira — 36 milhões de pessoas com diagnóstico estabelecido e estimativa de 50% de hipertensos não diagnosticados.

| Categoria | PAS (mmHg) | PAD (mmHg) | Conduta Inicial |
|---|---|---|---|
| Ótima | < 120 | < 80 | Manutenção MEV |
| Normal | 120–129 | 80–84 | MEV |
| Limítrofe (pré-HAS) | 130–139 | 85–89 | MEV rigorosa; farmacoterapia se DCV/DM/DRC |
| HAS Grau 1 | 140–159 | 90–99 | MEV ± farmacoterapia (risco-guiada) |
| HAS Grau 2 | 160–179 | 100–109 | Farmacoterapia imediata |
| HAS Grau 3 | ≥ 180 | ≥ 110 | Farmacoterapia imediata — dupla/tripla |
| Sistólica isolada | ≥ 140 | < 90 | Frequente em idosos; BCC + tiazídico |

**Fenótipos especiais da HAS:**
- **HAS do jaleco branco (white-coat hypertension):** PA ≥ 140/90 no consultório + MAPA/MRPA normais. Prevalência de 15–30%. Risco CV intermediário; monitorar anualmente — 15–20% evoluem para HAS sustentada em 10 anos. Não requer farmacoterapia mas exige MEV rigorosa.
- **HAS mascarada:** PA normal no consultório + MAPA elevada (PA ≥ 130/80 em 24h ou ≥ 135/85 em vigília). Prevalência de 10–15%. Risco CV equivalente à HAS sustentada — subdiagnosticada e subestimada. Tratar como HAS sustentada.
- **HAS noturna (non-dipping):** redução noturna da PA < 10% em relação à vigília. Associada a maior risco de AVC, ICC e mortalidade CV. Investigar: apneia do sono, DRC, DM com neuropatia autonômica.

> A medida correta exige: repouso de 5 minutos, bexiga vazia, sem cigarro ou café nos 30 min anteriores, braço apoiado ao nível do coração, manguito com largura ≥ 40% da circunferência braquial. Confirmar com 2–3 medidas em 2 ocasiões diferentes.

---

### 3. Avaliação Inicial do Paciente Hipertenso

**Anamnese dirigida:**
Tempo de diagnóstico e valores habituais de PA; adesão a tratamentos anteriores; sintomas de LOA (dispneia, edema, sintomas neurológicos, angina, claudicação); fatores de risco CV (tabagismo, DM, dislipidemia, sedentarismo, obesidade, história familiar); medicamentos que elevam PA (AINEs, descongestionantes, anticoncepcionais orais, corticoides, ciclosporina, eritropoetina, anfetaminas); sinais de HAS secundária (história de ronco/apneia, fraqueza muscular, sudorese excessiva, episódios de palpitação intensa + cefaleia + sudorese).

**Exame Físico — Fundo de Olho (Classificação Keith-Wagener-Barker):**

| Grau | Achado Fundoscópico | Significado Clínico |
|---|---|---|
| I | Discreta tortuosidade arteriolar, estreitamento leve | HAS leve, sem LOA significativa |
| II | Cruzamento AV patológico (sinal de Gunn/Salus), fio de cobre/prata | HAS moderada, arteriosclerose |
| III | Exsudatos algodonosos (isquemia de fibras nervosas) + hemorragias em chama | HAS grave, isquemia retiniana |
| IV | Papiledema (edema do nervo óptico) | Emergência hipertensiva — LOA encefálica |

O fundo de olho Grau III–IV exige internação e redução urgente da PA com drogas IV.

**ECG de repouso:** HVE pelos critérios de Sokolow-Lyon (SV1 + RV5 ou RV6 ≥ 38 mm) ou Cornell voltagem (RaVL + SV3 > 28 mm H / > 20 mm M); BCRE novo; FA; bloqueios de ramo; sinais de isquemia miocárdica.

**Exames laboratoriais por tier:**

| Tier | Exames | Objetivo |
|---|---|---|
| Básico (todos os hipertensos) | Glicemia de jejum, creatinina + TFG (CKD-EPI), sódio, potássio, ácido úrico, lipidograma completo, EAS + microalbuminúria (albumina/creatinina), ECG | LOA + FRC + contraindicações a drogas |
| Avançado (risco alto/muito alto ou HAS resistente) | Ecocardiograma (HVE e função sistólica/diastólica), doppler de carótidas (IMC), MAPA 24h, índice tornozelo-braquial | LOA subclínica, confirmação diagnóstica |
| Investigação de HAS secundária | Aldosterona/renina (HAP), cortisol urinário 24h (Cushing), catecolaminas urinárias (feocromocitoma), TSH, polissonografia (apneia), angioRM de artérias renais (estenose) | Suspeita clínica específica |

---

### 4. Estratificação de Risco Cardiovascular Global

| Fatores de Risco / LOA / DCV | HAS Grau 1 (140–159/90–99) | HAS Grau 2 (160–179/100–109) | HAS Grau 3 (≥ 180/110) |
|---|---|---|---|
| Sem FRC, sem LOA | Baixo | Moderado | Alto |
| 1–2 FRC | Moderado | Moderado | Muito Alto |
| ≥ 3 FRC | Alto | Alto | Muito Alto |
| LOA subclínica (HVE, IMC carotídeo ≥ 0,9 mm, microalbuminúria 30–300 mg/g, ITB < 0,9) | Alto | Alto | Muito Alto |
| DM tipo 1 ou 2 | Alto | Alto | Muito Alto |
| DRC G3–G5 | Alto | Muito Alto | Muito Alto |
| DCV estabelecida (IAM, AVC, IC, DRC G4, DM + LOA) | Muito Alto | Muito Alto | Muito Alto |

**Fatores de risco cardiovascular (FRC):** homem ≥ 55 anos / mulher ≥ 65 anos; tabagismo atual; dislipidemia (LDL ≥ 130 mg/dL ou HDL < 40 H / < 46 M); obesidade abdominal (CA > 102 cm H / > 88 cm M); glicemia de jejum 100–125 mg/dL; história familiar de DCV prematura (parente 1° grau: H < 55 anos / M < 65 anos).

**Lesões de órgãos-alvo subclínicas:**
- **Coração:** HVE pelo ECG (Sokolow ≥ 38 mm; Cornell > 2440 mm.ms produto voltagem-duração) OU ecocardiograma (IMVE ≥ 115 g/m2 H / ≥ 95 g/m2 M); disfunção diastólica grau ≥ II
- **Rim:** creatinina elevada (H > 1,3 mg/dL; M > 1,2 mg/dL); TFG 30–60 mL/min; microalbuminúria 30–300 mg/g ou macroalbuminúria > 300 mg/g
- **Vasos:** espessamento da camada íntima-média (CIM) carotídea ≥ 0,9 mm; placa aterosclerótica carotídea; ITB < 0,9 (DAP periférica); velocidade de onda de pulso > 10 m/s
- **Fundo de olho:** retinopatia hipertensiva Grau III–IV (exsudatos, hemorragias, papiledema)

> Mesmo HAS Grau 1 com DM + microalbuminúria + HVE = Risco MUITO ALTO → farmacoterapia imediata, sem período de tentativa de MEV isolada.

---

### 5. Metas Terapêuticas por Grupo

| Grupo de Pacientes | Meta PAS (mmHg) | Meta PAD (mmHg) | Observações |
|---|---|---|---|
| Adultos < 65 anos, risco alto/muito alto | < 130 | < 80 | ESC/ESH 2023: meta < 130/80 para maioria |
| Adultos < 65 anos, risco baixo-moderado | < 140 | < 90 | SBC 2020: aceita < 140/90 com MEV prévia |
| DM tipo 1 ou 2 (sem DRC) | < 130 | < 80 | Benefício comprovado (UKPDS, ACCORD) |
| DRC com proteinúria > 0,3 g/g | < 130 | < 80 | IECA/BRA mandatórios |
| DCV estabelecida (IAM, AVC, IC) | < 130 | < 80 | Meta intensiva reduz eventos (SPRINT) |
| Idosos 65–79 anos, funcionais | 130–140 | < 80 | Evitar PA < 120 — hipoperfusão coronária/cerebral |
| Idosos ≥ 80 anos ou frágeis | 140–150 | < 90 | Individualizar; evitar hipotensão ortostática |
| Gestantes com HAS crônica | 130–150 | 80–100 | Metildopa + nifedipino + labetalol; evitar IECA/BRA |

---

### 6. Tratamento Farmacológico — 5 Classes de 1ª Linha

| Classe | Droga (dose diária) | Indicações Preferenciais | Contraindicações |
|---|---|---|---|
| IECA | Enalapril 5–40 mg; Ramipril 5–10 mg; Perindopril 5–10 mg | DM + proteinúria, ICC-FEr, pós-IAM, DRC proteinúrica, jovens | Gestação, angioedema, K+ > 5,5, estenose bilateral de artéria renal |
| BRA | Losartana 50–100 mg; Valsartana 80–320 mg; Olmesartana 20–40 mg | Mesmas do IECA + tosse pelo IECA; HVE (LIFE trial) | Gestação, K+ > 5,5 (mesmas do IECA) |
| BCC di-hidropiridínico | Anlodipino 5–10 mg; Nifedipino retard 30–60 mg; Lercanidipino 10–20 mg | Idosos, sistólica isolada, etnia negra, angina estável, HAS + DPOC | IC descompensada aguda (anlodipino é seguro na IC estável — PRAISE) |
| Tiazídico/tiazídico-símile | Hidroclorotiazida 12,5–25 mg; Clortalidona 12,5–25 mg; Indapamida 1,5–2,5 mg SR | Sistólica isolada, etnia negra, osteoporose, IC com edema | Gota ativa, hipocalemia grave, gestação |
| Betabloqueador | Atenolol 25–100 mg; Metoprolol succinato 25–200 mg; Carvedilol 6,25–50 mg; Nebivolol 5–10 mg | Pós-IAM, ICC-FEr (carvedilol/metoprolol), FA com RVR alta, enxaqueca, síndrome hipercinética | BAV 2°/3° grau, asma brônquica grave, DPOC grave, Raynaud grave |

**Combinações preferidas (sinérgicas com evidência de desfecho):**
- IECA + BCC di-hidropiridínico (ACCOMPLISH: reduziu 20% eventos CV vs. IECA + tiazídico)
- IECA + tiazídico (alternativa custo-efetiva com ampla evidência — PROGRESS, ADVANCE)
- BRA + BCC (Exforge: olmesartana + anlodipino — estudo AZUR)
- Tripla terapia: IECA + BCC + tiazídico (HAS refratária — sem atingir meta com dupla)

> NUNCA combinar IECA + BRA: sem benefício adicional, com hipercalemia e IRA aumentados (ONTARGET 2008). NUNCA combinar dois betabloqueadores ou BCC não-di-hidropiridínico (verapamil/diltiazem) + betabloqueador (risco de BAV).

**Esquemas recomendados pela SBC 2020:**
- PA 140–159/90–99 + risco baixo: MEV por 3–6 meses; se persistir → monoterapia
- PA 140–159/90–99 + risco alto/muito alto: combinação dupla em dose baixa desde o início
- PA ≥ 160/100: combinação dupla em doses plenas; reavaliar em 4 semanas
- HAS resistente (≥ 3 drogas em doses máximas toleradas, incluindo diurético): adicionar espironolactona 25–50 mg/dia (aldosterona frequentemente elevada — 4ª droga mais eficaz)

---

### 7. Emergências e Urgências Hipertensivas

**Definição comum:** PA ≥ 180/120 mmHg. A diferença está na presença ou ausência de lesão aguda de órgão-alvo (LOA aguda).

| Aspecto | Urgência Hipertensiva | Emergência Hipertensiva |
|---|---|---|
| LOA aguda | Ausente | Presente (AVC isquêmico/hemorrágico, EAP, IAM, dissecção aórtica, encefalopatia, eclâmpsia, IRA oligúrica) |
| Risco imediato de vida | Não | Sim |
| Velocidade de redução | 25% em 24–48h | 25% na 1ª hora (exceto dissecção: < 120/80 em 20 min) |
| Via de administração | Oral | IV (UTI/emergência) |
| Drogas preferidas | Captopril 25 mg VO; Clonidina 0,1 mg VO (repetir em 1h se necessário); Furosemida 40 mg VO se congestão | Nitroprussiato 0,5–10 mcg/kg/min IV; Labetalol 20–80 mg IV bolus a cada 10 min (máx 300 mg); Nicardipina 5–15 mg/h IV; Hidralazina 5–10 mg IV (gestação/eclâmpsia) |

**Cuidado crítico:** Na dissecção aórtica aguda, a meta é PA sistólica < 120 mmHg e FC < 60 bpm em 20 minutos — labetalol IV é o agente de escolha (anti-hipertensivo + bradicardizante). NÃO usar hidralazina (reflexo taquicárdico piora estresse de cisalhamento).

No AVC isquêmico com indicação de trombólise: reduzir PA apenas se > 185/110 mmHg antes da alteplase; após a trombólise, manter < 180/105 por 24h. Redução agressiva prejudica a penumbra isquêmica.

> Na encefalopatia hipertensiva (cefaleia intensa + confusão + fundo de olho Grau IV + PA > 200/130): nitroprussiato IV em UTI; meta: reduzir PAM em 25% na 1ª hora — NÃO normalizar abruptamente (vasoespasmo cerebral reverso → isquemia).

---

### 8. HAS Secundária — Quando Investigar e Como

**Suspeitar de HAS secundária quando:** idade < 30 anos sem história familiar; HAS de início súbito ou rápida deterioração em adulto previamente controlado; HAS resistente a 3 drogas; hipocalemia espontânea (não induzida por diurético); episódios de HAS paroxística + cefaleia + palpitações + sudorese (feocromocitoma); ronco intenso + HAS difícil de controlar; HAS em crianças ou adolescentes.

| Causa | Prevalência na HAS | Triagem | Confirmação |
|---|---|---|---|
| Apneia obstrutiva do sono (SAOS) | 30–40% da HAS resistente | Escala de Epworth + questionário STOP-BANG | Polissonografia (IAH ≥ 15/h = moderada) |
| Hiperaldosteronismo primário (Conn) | 5–10% da HAS geral; 20% da resistente | Relação aldosterona/renina (RAR > 30 + aldosterona > 15 ng/dL) em amostra matinal | TC adrenal + cateterismo venoso adrenal seletivo |
| Síndrome de Cushing | < 1% | Cortisol livre urinário 24h > 300 mcg/dia; cortisol salivar noturno elevado; teste de supressão com 1 mg dexametasona | Cortisol urinário 24h + RNM hipofisária/adrenal |
| Estenose de artéria renal (HAS renovascular) | 2–5% | Sopro abdominal; rim hipotrófico unilateral no US; resposta exuberante ao IECA | AngioRM ou angioTC de artérias renais; arteriografia |
| Feocromocitoma/paraganglioma | < 0,5% | Metanefrinas plasmáticas livres (sensibilidade 99%) ou metanefrinas urinárias 24h | TC/RNM adrenal + cintigrafia com MIBG |
| Coarctação da aorta | Jovens | Gradiente PA braço–perna; pulsos femorais diminuídos; sopro dorsal | Ecocardiograma + angioTC de aorta |

---

### 9. Populações Especiais

**Idosos ≥ 65 anos:**
Recomenda-se tratar todos os idosos funcionais com PA ≥ 140/90 — benefício em mortalidade e AVC comprovado até ≥ 80 anos (HYVET: indapamida ± perindopril reduziu mortalidade 21% em > 80 anos). Meta PAS 130–140 mmHg; evitar PA < 120 (hipoperfusão miocárdica, cerebral e renal em vasos rígidos). Preferir BCC + IECA/BRA; tiazídico-símile (clortalidona ou indapamida) em vez de HCT (menor risco de hiponatremia). Monitorar hipotensão ortostática a cada consulta (PA sentado e em pé após 1 min e 3 min).

**Gestação e HAS:**
- HAS crônica pré-existente: metildopa 250–500 mg 2–3x/dia (1ª escolha); nifedipino retard 30–60 mg/dia; labetalol 100–400 mg 2x/dia. IECA, BRA e inibidores diretos de renina são ABSOLUTAMENTE contraindicados na gestação.
- Pré-eclâmpsia grave (PA ≥ 160/110 + proteinúria + LOA): sulfato de magnésio IV para profilaxia de eclâmpsia (dose: 4–6 g IV em 20 min + manutenção 1–2 g/h); hidralazina 5 mg IV a cada 20 min (máx 20 mg) ou labetalol IV; interrupção da gestação se ≥ 34 semanas ou instabilidade materna.

**Etnia negra:**
Maior prevalência, início mais precoce, HAS mais grave e maior taxa de LOA. Resposta inferior a monoterapia com IECA/BRA (menor componente SRAA). Preferir BCC + tiazídico como combinação inicial; IECA/BRA eficazes quando combinados com BCC/tiazídico.

**DRC + HAS:**
IECA ou BRA mandatórios quando proteinúria > 0,3 g/g (nefroproteção independente do efeito anti-hipertensivo). Monitorar K+ e creatinina em 1–2 semanas após início ou aumento de dose. Aumento de creatinina até 30% e K+ até 5,5 é aceitável — não suspender. iSGLT2 (dapagliflozina) reduz progressão renal independentemente da PA (DAPA-CKD).

---

### 10. Caso Clínico Comentado

**Cenário:** Homem, 56 anos, empresário sedentário, tabagista (1 maço/dia há 25 anos), diabético tipo 2 há 7 anos (HbA1c 8,2%, em metformina 2g/dia). Relata cefaleia matinal frequente. PA no consultório: 164/102 mmHg e 162/100 mmHg (duas medidas com 5 min de intervalo). Peso 98 kg, altura 1,74 m (IMC 32,4 kg/m2), CA 106 cm. Exames: glicemia 148 mg/dL; creatinina 1,1 mg/dL (TFG 75 mL/min); K+ 4,2 mEq/L; albumina/creatinina urinária: 85 mg/g (microalbuminúria). ECG: índice de Sokolow-Lyon 41 mm. Fundoscopia: estreitamento arteriolar com cruzamento AV patológico (Grau II).

**Análise diagnóstica:**
- HAS Grau 2 (164/102 mmHg confirmada)
- Fatores de risco CV: DM2 + tabagismo + obesidade abdominal + dislipidemia (presumível) + sexo masculino + idade
- LOA subclínica: HVE pelo ECG (Sokolow 41 mm) + microalbuminúria (85 mg/g) + retinopatia Grau II
- Estratificação: HAS Grau 2 + DM + HVE + microalbuminúria = **RISCO MUITO ALTO**

**Tratamento:**
1. MEV: dieta DASH + restrição de sódio < 2g/dia; exercício aeróbico 150 min/semana; cessação do tabagismo (bupropiona 150 mg 2x/dia ou vareniclina 1 mg 2x/dia); perda de peso (meta IMC < 25)
2. Farmacoterapia inicial — combinação dupla imediata (HAS Grau 2 + risco muito alto):
   - Enalapril 10 mg/dia (IECA: nefroproteção em DM + microalbuminúria; reduz progressão para macroalbuminúria)
   - Anlodipino 5 mg/dia (BCC: sinergia com IECA — ACCOMPLISH; seguro em DM e idosos)
3. Meta: PA < 130/80 mmHg (DM + LOA)
4. Se em 4 semanas PA > 130/80: aumentar enalapril para 20 mg + anlodipino 10 mg; se ainda não atingir meta em 8 semanas: adicionar clortalidona 12,5 mg (tripla terapia)
5. Associar estatina de alta intensidade (LDL meta < 70 mg/dL) + AAS 100 mg se Framingham > 20% (calcular)
6. Reavaliação em 4 semanas: PA, K+, creatinina, microalbuminúria (1–2 semanas após IECA)

**Prognóstico esperado:** com IECA + redução de PA para < 130/80: redução de 30–40% na progressão para macroalbuminúria; regressão parcial de HVE em 6–12 meses; redução de risco de IAM/AVC de 25–35% em 5 anos.

---

### Referências
- Barroso WKS et al. 7ª Diretriz Brasileira de Hipertensão Arterial. Arq Bras Cardiol. 2021;116(3):516–658.
- Mancia G et al. 2023 ESH Guidelines for the management of arterial hypertension. J Hypertens. 2023;41(12):1874–2071.
- James PA et al. Evidence-Based Guideline for the Management of High Blood Pressure in Adults (JNC 8). JAMA. 2014;311(5):507–520.
- SPRINT Research Group. A Randomized Trial of Intensive versus Standard Blood-Pressure Control. N Engl J Med. 2015;373:2103–2116.
- Jamerson K et al. Benazepril plus Amlodipine or Hydrochlorothiazide for Hypertension in High-Risk Patients (ACCOMPLISH). N Engl J Med. 2008;359:2417–2428.`, ativo: true,
    },
    {
      titulo: 'Diabetes Mellitus Tipo 2',
      descricao: 'Critérios diagnósticos, metas por perfil clínico, algoritmo guiado por comorbidades (DCV→iSGLT2/AR-GLP1, ICC→iSGLT2), CAD vs EHHNC. Base: SBD 2024 + ADA 2024.',
      disciplina: 'Clínica Médica', tema: 'Endocrinologia', tipo: 'video', nivel: 'intermediario',
      duracao: 65, ordem: 2, mes: 1, semana: 1,
      videoUrl: 'https://www.youtube.com/watch?v=1810QksWM04',
      conteudo: `## Diabetes Mellitus Tipo 2

**Base:** ADA Standards of Care 2024 + EASD Consensus 2023 + SBD Diretrizes 2023

---

### 1. Fisiopatologia — O Octeto de DeFronzo

O DM2 resulta de defeitos múltiplos e simultâneos, não apenas resistência à insulina isolada:

| Mecanismo | Órgão/Tecido | Impacto Metabólico |
|---|---|---|
| 1. Resistência à insulina | Músculo esquelético | Captação de glicose reduzida pós-prandial |
| 2. Falência de célula beta | Pâncreas | Secreção insulínica progressivamente insuficiente |
| 3. Produção hepática aumentada de glicose | Fígado | Hiperglicemia de jejum predominante |
| 4. Falência de célula alfa (glucagon elevado) | Pâncreas | Hiperglucagonemia amplifica hiperglicemia |
| 5. Lipólise aumentada | Tecido adiposo | AGL elevados causam lipotoxicidade hepática/pancreática |
| 6. Efeito incretínico reduzido | Intestino (GLP-1/GIP) | Perda do estímulo pós-prandial à secreção de insulina |
| 7. Reabsorção renal de glicose aumentada | Rim (cotransportador SGLT2) | Glicosúria ausente mesmo na hiperglicemia |
| 8. Resistência central à insulina | Hipotálamo/SNC | Saciedade reduzida, hiperfagia, disautonomia |

> A compreensão desse octeto fundamenta o algoritmo moderno: cada classe farmacológica age em mecanismos distintos, justificando a terapia combinada desde o início em pacientes com HbA1c muito elevada.

---

### 2. Critérios Diagnósticos (ADA 2024)

| Parâmetro | Normal | Pré-diabetes | Diabetes |
|---|---|---|---|
| Glicemia de jejum (≥ 8h) | < 100 mg/dL | 100–125 mg/dL | ≥ 126 mg/dL |
| TOTG 2h (75 g) | < 140 mg/dL | 140–199 mg/dL | ≥ 200 mg/dL |
| HbA1c | < 5,7% | 5,7–6,4% | ≥ 6,5% |
| Glicemia aleatória + sintomas | — | — | ≥ 200 mg/dL + poliúria/polidipsia/perda de peso |

> Em assintomáticos, qualquer critério deve ser confirmado em outra ocasião. HbA1c NÃO deve ser usada no diagnóstico em: anemias hemolíticas, hemoglobinopatias (HbSS, HbSC), gestação (1° e 2° trimestres), situações de turnover eritrocitário alterado — nestes casos, preferir glicemia de jejum ou TOTG.

---

### 3. Metas Terapêuticas Individualizadas

| Perfil do Paciente | Meta HbA1c | Justificativa |
|---|---|---|
| Adulto jovem, DM recente, sem DCV, sem hipoglicemia | < 6,5% | Alta expectativa de vida, benefício a longo prazo |
| Padrão (maioria dos adultos) | < 7,0% | Equilíbrio eficácia/segurança |
| Idoso funcional com longa expectativa | < 7,5% | Evitar hipoglicemia excessiva |
| Idoso frágil, múltiplas comorbidades, limitada expectativa | 7,5–8,5% | Risco de hipoglicemia grave supera o benefício |
| DM avançado, hipoglicemia recorrente, demência | < 8,5% | Prioridade à segurança e qualidade de vida |

Glicemia pré-prandial: 80–130 mg/dL. Pós-prandial (2h): < 180 mg/dL. PA alvo: < 130/80 mmHg. LDL: < 70 mg/dL (alto risco cardiovascular); < 50 mg/dL (DCV aterosclerótica estabelecida).

---

### 4. Algoritmo Farmacológico ADA 2024 — Guiado por Comorbidades

**Passo 1 — Metformina:** Base universal (TFG ≥ 30 mL/min). Iniciar 500 mg/dia com refeição, titular até 2.000 mg/dia em 4–6 semanas. Contraindicação absoluta: TFG < 30. Suspender temporariamente em exames com contraste iodado.

**Passo 2 — Adicionar agente com benefício comprovado conforme comorbidade dominante:**

| Comorbidade Dominante | Classe Preferencial | Evidência Clínica Chave |
|---|---|---|
| DCV aterosclerótica estabelecida | iSGLT2 OU AR-GLP-1 com benefício CV comprovado | EMPA-REG OUTCOME (empagliflozina — ↓ morte CV 38%), LEADER (liraglutida), SUSTAIN-6 (semaglutida) |
| Insuficiência cardíaca com FEr ou FEp | iSGLT2 (reduz hospitalização por IC) | EMPEROR-Reduced (empagliflozina), DAPA-HF (dapagliflozina) |
| DRC (TFG 25–75 + albuminúria) | iSGLT2 (dapagliflozina ou empagliflozina) | DAPA-CKD (dapagliflozina — benefício independente de DM), EMPA-KIDNEY |
| Obesidade IMC ≥ 30, meta de perda ponderal | AR-GLP-1 ou dual GIP/GLP-1 (tirzepatida) | SUSTAIN (semaglutida SC -5 a -7 kg), SURMOUNT (tirzepatida -15 a -20%) |
| Risco elevado de hipoglicemia | iDPP-4 ou iSGLT2 | Evidências robustas de segurança |
| Restrição de custo significativa | Sulfonilureia (preferir glicazida) ou pioglitazona | Baixo custo; monitorar hipoglicemia e peso |

> Se HbA1c ≥ 10% ou sintomas de hiperglicemia marcada (poliúria intensa, perda de peso, cetose), iniciar insulina imediatamente — combinada com agentes orais quando estabilizar.

---

### 5. Classes de Antidiabéticos — Perfil Clínico Completo

| Classe | Redução HbA1c | Peso | Hipoglicemia | Benefício CV/Renal | Custo |
|---|---|---|---|---|---|
| Metformina | 1,0–2,0% | Neutro | Não | Neutro (UKPDS: ↓ IAM 39% em obesos) | Muito baixo |
| iSGLT2 (empagliflozina, dapagliflozina) | 0,5–1,0% | ↓ 2–4 kg | Não | Sim — CV + renal documentados | Alto |
| AR-GLP-1 (semaglutida, liraglutida, dulaglutida) | 1,0–2,0% | ↓ 3–6 kg | Não | Sim — CV aterosclerótico | Alto |
| Dual GIP/GLP-1 (tirzepatida) | 2,0–2,5% | ↓ 8–12 kg | Não | Promissor (SURPASS-CVOT em andamento) | Muito alto |
| iDPP-4 (sitagliptina, vildagliptina) | 0,5–0,8% | Neutro | Não | Neutro (seguro) | Médio |
| Sulfonilureia (glicazida, glibenclamida) | 1,0–2,0% | ↑ 1–3 kg | Sim | Neutro ou negativo | Muito baixo |
| Glitazona (pioglitazona) | 0,8–1,4% | ↑ peso + edema | Não | Neutro/↓ AVC (PROACTIVE) | Baixo |
| Insulina (NPH, análogos) | Variável — sem teto | ↑ peso | Sim | Neutro | Variável |

---

### 6. Insulinoterapia — Tipos, Farmacocinética e Esquemas

**Indicações de insulinização:** HbA1c > 10% com sintomas; falha documentada com 2–3 agentes orais; DM tipo LADA; gestação com DM2; cetoacidose ou estado hiperosmolar.

| Tipo de Insulina | Início | Pico | Duração | Aplicação Prática |
|---|---|---|---|---|
| Regular (cristalina) | 30–60 min | 2–4h | 6–8h | Bolus: 30 min antes da refeição; ou protocolo CAD IV |
| NPH (isofânica) | 2–4h | 6–10h | 12–18h | Basal 2×/dia; maior variabilidade glicêmica |
| Glargina U-100 (Lantus) | 1–2h | Sem pico | 20–24h | Basal 1×/dia ao deitar; menor hipoglicemia noturna |
| Glargina U-300 (Toujeo) | 1–2h | Sem pico | 30–36h | Basal 1×/dia; ainda menos hipoglicemia |
| Detemir (Levemir) | 1–3h | Mínimo | 16–24h | Basal 1–2×/dia |
| Aspart / Lispro / Glulisina | 10–15 min | 1–2h | 3–5h | Bolus pré-prandial imediato; maior flexibilidade |

**Esquema basal-bolus:** Glargina noturna (0,1–0,2 UI/kg) + análogo rápido nas principais refeições. Fator de sensibilidade: 1 UI corrige aproximadamente 50 mg/dL acima da meta em paciente de 70 kg.

---

### 7. Complicações Crônicas — Rastreamento, Metas e Ação

| Complicação | Método de Rastreamento | Frequência | Marco de Ação Terapêutica |
|---|---|---|---|
| Nefropatia diabética | Albumina/creatinina urinária (AER) + TFG estimada (CKD-EPI) | Anual | AER 30–300 mg/g (micro): iniciar IECA/BRA; AER > 300 mg/g: adicionar iSGLT2 |
| Retinopatia diabética | Fundoscopia com midríase por oftalmologista | Ao diagnóstico; depois anual | Pré-proliferativa/Proliferativa: fotocoagulação laser ou anti-VEGF intravítreo |
| Neuropatia periférica | Monofilamento de Semmes-Weinstein 10g + diapasão 128 Hz + teste de vibração | Anual | Perda de sensibilidade: prevenção ativa do pé diabético |
| Pé diabético | Inspeção visual + palpação de pulsos + índice tornozelo-braquial | A cada consulta | Úlcera grau ≥ 1: desbridamento + antibiótico (Staphylococcus e gram-negativos) |
| Doença cardiovascular | ECG, PA, perfil lipídico, tabagismo, história familiar | Anual | LDL > 70 mg/dL: estatina de alta intensidade; DCV estabelecida: meta < 50 mg/dL |

> O pé diabético é a principal causa de amputação não traumática no mundo. O monofilamento de Semmes-Weinstein é obrigatório em toda consulta anual de DM2 — perda da sensibilidade protetora plantar equivale a "visão zero no pé".

---

### 8. Populações Especiais

**Idosos (≥ 75 anos ou frágeis):** meta HbA1c 7,5–8,5%; evitar glibenclamida (Beers Criteria — hipoglicemia grave prolongada); preferir iDPP-4 (sitagliptina — segura com ajuste de dose para TFG) ou iSGLT2; insulina com cuidado — risco de queda em hipoglicemia.

**Gestantes com DM2 preexistente:** insulina humana ou análogos de ação rápida/lenta são a escolha de referência no Brasil; metformina pode ser mantida como adjuvante, mas evidências de segurança fetal a longo prazo ainda limitadas; iSGLT2 e AR-GLP-1 absolutamente contraindicados na gestação.

**DRC avançada (TFG 15–30 mL/min):** suspender metformina se TFG < 30; dapagliflozina aprovada pelo FDA até TFG ≥ 15 para proteção renal (DAPA-CKD); ajustar dose de insulina (rim cataboliza 30–40% da insulina — risco de hipoglicemia em insuficiência renal); iDPP-4 com ajuste de dose.

**Imunossuprimidos e transplantados renais:** DM pós-transplante frequente (15–30% dos pacientes em tacrolimus + corticoides); hiperglicemia pós-prandial predominante; iDPP-4 como primeira escolha (sem interações com imunossupressores); monitorar nefrotoxicidade com iSGLT2.

---

### 9. Caso Clínico

**Cenário:** Mulher, 55 anos, DM2 há 8 anos. HbA1c atual 9,1%. IAM anterior há 2 anos tratado com stent. IMC 33 kg/m2. PA 138/86 mmHg. TFG estimada: 68 mL/min/1,73 m2. Albumina/creatinina urinária: 85 mg/g (microalbuminúria). Em uso de metformina 2 g/dia + glibenclamida 10 mg/dia. Relata 2 episódios de hipoglicemia sintomática no último mês.

**Análise do caso:**
- Glibenclamida: sulfonilureia de longa ação — causa hipoglicemia recorrente, ganho de peso, sem benefício CV comprovado em DCV estabelecida (Beers Criteria e evidências negativas)
- DCV aterosclerótica estabelecida (IAM prévio): indicação classe I para iSGLT2 (EMPA-REG) ou AR-GLP-1 (LEADER/SUSTAIN)
- Microalbuminúria (AER 85 mg/g) + TFG 68: proteção renal adicional com iSGLT2 e IECA/BRA
- PA 138/86 mmHg sem IECA/BRA: inadequado para DM2 com microalbuminúria

**Conduta estruturada:**
1. Suspender glibenclamida — substituir para eliminar hipoglicemia e otimizar perfil cardiovascular
2. Adicionar empagliflozina 10 mg/dia (redução de morte CV 38% em EMPA-REG OUTCOME; nefroproteção com AER 85 mg/g)
3. Iniciar enalapril 5–10 mg/dia (IECA para microalbuminúria + controle de PA — meta < 130/80 mmHg)
4. Estatina de alta intensidade: atorvastatina 40 mg/dia (LDL meta < 50 mg/dL — DCV estabelecida)
5. Se HbA1c > 7,5% em 3 meses: adicionar semaglutida 0,5 mg SC/semana (AR-GLP-1: benefício CV + perda ponderal com IMC 33)
6. Acompanhamento em 3 meses: HbA1c, TFG, AER, PA, peso

**Prognóstico esperado:** com iSGLT2 + IECA: redução de ≈ 30–40% na progressão para macroalbuminúria; HbA1c projetada < 7,5% com 2 agentes; perda de 2–4 kg com iSGLT2.

---

### Referências
- American Diabetes Association. Standards of Care in Diabetes 2024. Diabetes Care. 2024;47(Suppl 1).
- Davies MJ et al. Management of Hyperglycemia in Type 2 Diabetes, 2022. ADA/EASD Consensus Report. Diabetes Care. 2022;45(11):2753–2786.
- Sociedade Brasileira de Diabetes. Diretrizes SBD 2023. diabetes.org.br.
- Zinman B et al. Empagliflozin, Cardiovascular Outcomes, and Mortality in Type 2 Diabetes (EMPA-REG OUTCOME). N Engl J Med. 2015;373:2117–2128.
- Heerspink HJL et al. Dapagliflozin in Patients with Chronic Kidney Disease (DAPA-CKD). N Engl J Med. 2020;383:1436–1446.`, ativo: true,
    },
    {
      titulo: 'Síndrome Coronariana Aguda',
      descricao: 'IAM com e sem supradesnivelamento de ST. Diagnóstico eletrocardiográfico, marcadores e tratamento de reperfusão.',
      disciplina: 'Clínica Médica', tema: 'Cardiologia', tipo: 'video', nivel: 'avancado',
      duracao: 122, ordem: 3, mes: 1, semana: 2,
      videoUrl: 'https://www.youtube.com/watch?v=KLW4rBTNHtk', conteudo: `## Síndrome Coronariana Aguda

**Base:** ESC 2023 (Byrne RA et al.) + AHA/ACC 2023 + SBHCI 2023

---

### 1. Fisiopatologia — Da Placa Vulnerável ao Trombo Coronário

A síndrome coronariana aguda (SCA) é uma emergência cardiovascular resultante da instabilização de uma placa aterosclerótica coronária, com subsequente formação de trombo que compromete o fluxo sanguíneo miocárdico. Compreender a fisiopatologia em seus três mecanismos principais é fundamental para a tomada de decisão clínica em tempo real.

A placa aterosclerótica suscetível à ruptura apresenta uma arquitetura distinta da placa estável. Estruturalmente, possui: (1) capa fibrosa fina — com menos de 65 micrômetros de espessura, composta de colágeno tipo I e III, facilmente rompível ao estresse mecânico; (2) núcleo lipídico grande e amolecido, rico em ésteres de colesterol, células espumosas (macrófagos repletos de lipídios) e debris celulares — este núcleo pode ocupar mais de 40% do volume total da placa; (3) inflamação intraplaca intensa com infiltrado de macrófagos M1, linfócitos T ativados e mastócitos que secretam metaloproteinases de matriz (MMP-1, MMP-2, MMP-9) — enzimas que degradam o colágeno da capa fibrosa, fragilizando-a progressivamente até a ruptura. Em contraste, a placa estável tem capa fibrosa espessa, núcleo lipídico pequeno e pouca inflamação, tendendo à calcificação protetora.

**Mecanismo 1 — Ruptura de Placa (70% dos IAMCSST):** A ruptura ocorre preferencialmente nas bordas (ombros) da placa, onde a capa é mais fina e o estresse de cisalhamento é maior. A exposição do núcleo lipídico ao fluxo sanguíneo desencadeia adesão plaquetária imediata via receptor GPIb-IX-V ao fator de von Willebrand subendotelial, seguida de ativação plaquetária com liberação de TXA2 e ADP (amplificação), ativação do complexo GPIIb/IIIa com ligação de fibrinogênio e consequente agregação, além de ativação da cascata de coagulação pelo fator tecidual exposto. O resultado é geração de trombina e formação de fibrina, culminando em trombo oclusivo no IAMCSST ou suboclusivo no IAMSST e AI.

**Mecanismo 2 — Erosão Superficial (25–30%, mais frequente em mulheres jovens):** Sem ruptura da capa fibrosa; há perda da integridade endotelial na superfície da placa, com adesão plaquetária e formação de trombo sobre endotélio desnudado. A placa é frequentemente rica em proteoglicanos e com menos inflamação. É o substrato predominante nas mulheres abaixo de 50 anos e em pacientes sem fatores de risco cardiovascular clássicos.

**Mecanismo 3 — Vasoespasmo Coronário (Angina de Prinzmetal):** Espasmo intenso de artéria coronária epicárdica — normal ou com placa mínima — levando à isquemia transmural. Associado à cocaína, tabagismo intenso e disfunção endotelial. Clínica: supra de ST transitório de resolução espontânea ou com nitrato e antagonistas do cálcio. Não há trombo oclusivo como substrato.

**Fisiopatologia diferencial IAMCSST vs IAMSST vs Angina Instável:** O IAMCSST resulta de trombo oclusivo total que gera isquemia transmural sustentada e necrose desde o subendocárdio até o epicárdio — cada minuto sem reperfusão equivale à perda de 1.700 a 2.000 miócitos. O IAMSST resulta de trombo suboclusivo ou oclusão com circulação colateral, gerando isquemia predominantemente subendocárdica com necrose de espessura variável e depressão do ST ou inversão de onda T. A angina instável implica placa instável com trombo não oclusivo, vasoespasmo ou erosão superficial, sem necrose detectável e troponina normal em todas as coletas.

> A intensidade da oclusão e o tempo de isquemia determinam a extensão da necrose miocárdica — daí a máxima "tempo é músculo". No IAMCSST por oclusão total da DA proximal, podem ser perdidos 40–50 g de miocárdio em 90 minutos sem reperfusão.

---

### 2. Classificação Diagnóstica — IAMCSST vs IAMSST vs Angina Instável

| Característica | IAMCSST | IAMSST | Angina Instável |
|---|---|---|---|
| Supra de ST em 2 derivações contíguas | Sim, persistente (1–2 mm conforme derivação) | Não | Não |
| Depressão de ST ou inversão de onda T | Não (exceto espelho em posterior) | Frequente — subendocárdica | Possível, transitória |
| Troponina de alta sensibilidade | Elevada acima do 99° percentil com delta positivo | Elevada com delta positivo entre coletas | Normal em todas as coletas seriadas |
| Tipo de oclusão coronária | Total — trombo oclusivo | Parcial — trombo suboclusivo | Sem necrose — fluxo comprometido transitoriamente |
| Necrose miocárdica | Sim — transmural | Sim — subendocárdica, graus variados | Não detectável bioquimicamente |
| Fisiopatologia predominante | Ruptura de placa + trombo oclusivo | Ruptura ou erosão + trombo parcial | Erosão superficial, vasoespasmo ou demanda aumentada |
| Urgência terapêutica | Reperfusão imediata (meta abaixo de 90 min) | Estratificação pelo escore GRACE | Estratificação mais antiplaquetário |
| Mortalidade hospitalar estimada | 6–10% (sem reperfusão: 25–30%) | 3–5% | Menor que 1% com tratamento adequado |

> A troponina de alta sensibilidade detecta necrose miocárdica mínima imperceptível pelas gerações anteriores de ensaios. Isso expandiu o diagnóstico de IAMSST em detrimento da angina instável, que hoje é diagnóstico de exclusão após troponinas normais seriadas em algoritmo 0h/1h ou 0h/2h.

---

### 3. Troponina de Alta Sensibilidade — Cinética, Ensaios e Algoritmo ESC 2023

A troponina cardíaca é liberada pelos miócitos em necrose de forma bifásica: liberação inicial de troponina citosólica livre nas primeiras 2 a 4 horas, seguida de liberação mais lenta da troponina estrutural ligada ao aparato contrátil. O pico ocorre em 12 a 24 horas e a normalização se dá em 5 a 14 dias para a TnI ou em 10 a 21 dias para a TnT. A troponina de alta sensibilidade detecta concentrações 10 a 100 vezes menores que os ensaios convencionais, permitindo o descarte do IAM em apenas 1 hora em vez das 6 horas necessárias anteriormente.

| Parâmetro do ensaio | TnI-hs — Architect Abbott | TnT-hs — Elecsys Roche |
|---|---|---|
| Limite de detecção (LOD) | 1,6 ng/L | 3 ng/L |
| 99° percentil homens (URL) | 20 ng/L | 19 ng/L |
| 99° percentil mulheres (URL) | 16 ng/L | 19 ng/L (sem diferença por sexo) |
| Valor de descarte ESC 0h | Abaixo de 5 ng/L | Abaixo de 5 ng/L |
| Delta diagnóstico em 1 hora | Maior ou igual a 6 ng/L absoluto | Maior ou igual a 3 ng/L absoluto |
| Sensibilidade para IAM precoce | Acima de 95% | Acima de 95% |

**Algoritmo 0h/1h/2h da ESC 2023:**

| Passo | TnUS na admissão (0h) | Delta em 1 hora | Interpretação e Ação |
|---|---|---|---|
| DESCARTE (rule-out) | Abaixo de 5 ng/L — muito baixo | Qualquer variação | Probabilidade de IAM menor que 1%; alta segura se risco clínico baixo e ECG normal |
| DIAGNÓSTICO (rule-in) | Acima do 99° percentil (URL) OU qualquer valor | Maior ou igual a 5 ng/L absoluto | IAM confirmado — admitir, tratar, coronariografia conforme estratificação |
| ZONA CINZENTA | Entre o limite de detecção e a URL | Entre 3 e 5 ng/L | Coleta adicional em 2 horas; avaliar com clínica, ECG evolutivo e escore HEART |
| DESCARTE EM 2 HORAS | 0h e 2h ambos abaixo da URL, delta menor que 4 ng/L | — | IAM excluído com VPN acima de 99,5%; considerar diagnósticos alternativos |

> Na zona cinzenta, o escore HEART (History, ECG, Age, Risk factors, Troponin) estratifica o risco residual: escore de 0 a 3 corresponde a baixo risco com menos de 1,7% de eventos cardíacos maiores em 6 semanas; escore de 7 a 10 corresponde a alto risco com mais de 50% de MACE. Combinar sempre com avaliação clínica e ECG evolutivo serial.

**Causas de troponina elevada não isquêmica (diagnóstico diferencial):** insuficiência cardíaca aguda descompensada, miocardite viral, embolia pulmonar maciça, sepse e choque séptico, cardioversão elétrica, contusão cardíaca, dissecção de aorta tipo A, ablação por cateter, insuficiência renal crônica terminal com acúmulo por redução da depuração renal, síndrome de Takotsubo (cardiomiopatia de estresse emocional), pericardite aguda extensa.

---

### 4. ECG no IAMCSST — Topografia Completa, Territórios e Critérios Diagnósticos

**Critérios de supradesnivelamento de ST diagnóstico de IAMCSST:**
- Maior ou igual a 2 mm em V2–V3 em homens com 40 anos ou mais; maior ou igual a 2,5 mm em homens abaixo de 40 anos; maior ou igual a 1,5 mm em mulheres em todas as idades
- Maior ou igual a 1 mm em qualquer outra derivação, presente em pelo menos 2 derivações contíguas
- BRE novo ou presumivelmente novo com apresentação clínica compatível equivale a IAMCSST — agir como tal
- Padrão de de Winter em V1–V5 (depressão ST com ponto J sem elevação + onda T positiva em V1–V5 + supra discreto em aVR) indica oclusão proximal da DA sem supra clássico — não subestimareste padrão

**Localização topográfica completa — derivações, paredes e artérias:**

| Derivações com supra de ST | Parede acometida | Artéria culpada provável | Riscos e extensões adicionais |
|---|---|---|---|
| V1–V4 | Anterosseptal | DA proximal antes do 1° ramo diagonal | Maior risco de disfunção ventricular esquerda, bloqueio AV e bloqueio de ramo |
| V1–V6 + DI + aVL | Anterior extenso | DA muito proximal antes do 1° ramo septal | Alto risco de choque cardiogênico; FE pode cair abruptamente |
| DI + aVL com ou sem V5–V6 | Lateral alta | Cx ou ramo diagonal da DA | Pode cursar sem supra óbvio; checar espelho em V1–V2 |
| DII + DIII + aVF | Inferior | CD em 80 a 90% dos casos; Cx dominante esquerda em 10 a 20% | Investigar extensão para VD com V3R–V4R e parede posterior |
| V1–V2 com infra de ST + onda R maior que S em V1–V2 | Posterior | CD ou Cx | Infra em V1–V2 é o espelho do supra posterior; confirmar com V7–V9 se disponível |
| V3R–V4R com supra de 1 mm ou mais | Ventrículo Direito | CD proximal antes do ramo para VD | Contraindicar nitrato e morfina; repor volume |
| aVR com supra de 1 mm + infra difuso de V4–V6 | Tronco da coronária esquerda ou DA proximal | TCE ou DA antes do 1° septal | Prognóstico sombrio; ICP de emergência com suporte máximo |

> No IAM inferior com supra em DII, DIII e aVF, é obrigatório realizar derivações direitas V3R e V4R para investigar extensão para VD. O IAM de VD ocorre em 30 a 50% dos IAM inferiores por CD. O manejo é diametralmente oposto ao do IAM de VE com congestão: contraindicar nitrato e morfina pelo risco de colapso de pré-carga, e repor volume com 500 mL de SF 0,9% em bolus quando houver hipotensão com pulmões limpos.

---

### 5. Reperfusão no IAMCSST — ICP Primária, Trombólise e Estratégia Farmacoinvasiva

**ICP Primária — Padrão-Ouro (ESC 2023, Recomendação Classe I, Nível A):**

A intervenção coronária percutânea primária apresenta mortalidade 25 a 40% menor que a trombólise em estudos comparativos diretos como o GUSTO IIb e o DANAMI-2, sendo a estratégia de reperfusão de eleição quando disponível em tempo hábil.

- Meta porta-balão menor que 90 minutos para pacientes admitidos diretamente em centro com hemodinâmica ativa
- Meta de primeiro contato médico ao balão menor que 120 minutos incluindo o tempo de transferência inter-hospitalar
- Janela terapêutica: até 12 horas do início dos sintomas; considerar até 24 horas se houver isquemia persistente com dor contínua, supra evolutivo ou instabilidade hemodinâmica
- Stent farmacológico (DES) preferível ao stent convencional (BMS) — menor taxa de reestenose e reinfarto a longo prazo
- Acesso radial preferível ao femoral conforme o ensaio MATRIX — menor sangramento e menor mortalidade em 30 dias

**Trombólise Fibrinolítica — Quando ICP Indisponível no Tempo Adequado:**

| Agente Trombolítico | Dose e Modo de Administração | Característica Principal |
|---|---|---|
| Alteplase (rt-PA) | 15 mg IV bolus + 0,75 mg/kg em 30 min (máx 50 mg) + 0,5 mg/kg em 60 min (máx 35 mg) | 2ª geração; fibrinosseletivo; administração EV acelerada em 90 min |
| Tenecteplase (TNK-tPA) | 30 a 50 mg conforme peso em bolus único EV — abaixo de 60 kg: 30 mg; acima de 90 kg: 50 mg | 3ª geração; fibrinosseletivo; bolus único; preferido no Brasil por praticidade |
| Estreptoquinase | 1.500.000 UI em 60 min EV contínuo | 1ª geração; não fibrinosseletivo; maior taxa de sangramento; menor custo |

- Meta porta-agulha menor ou igual a 30 minutos do diagnóstico
- Sinais de reperfusão bem-sucedida em 60 a 90 minutos: resolução do supra maior ou igual a 50% na derivação de maior elevação, alívio da dor, arritmias de reperfusão (extrassístoles ventriculares e ritmo idioventricular acelerado — geralmente benigno e autolimitado), pico precoce de troponina por washout coronário
- Estratégia farmacoinvasiva: após trombólise bem-sucedida, realizar angiografia eletiva em 2 a 24 horas (CARESS-in-AMI e TRANSFER-AMI demonstraram redução de reinfartos e mortalidade)
- ICP de resgate: se sinais de falha da trombólise após 60 a 90 minutos — supra persistente, dor mantida, instabilidade hemodinâmica — indicar coronariografia imediata

**Contraindicações Absolutas à Trombólise:**

| Condição | Justificativa Clínica |
|---|---|
| AVC hemorrágico em qualquer momento da vida | Risco de expansão hemorrágica intracraniana fatal |
| AVC isquêmico nos últimos 6 meses | Transformação hemorrágica do infarto cerebral estabelecido |
| Neoplasia intracraniana ou malformação arteriovenosa | Sangramento intracraniano catastrófico e incontrolável |
| Trauma craniano severo ou cirurgia intracraniana nos últimos 3 meses | Barreira hemostática comprometida recentemente |
| Dissecção de aorta tipo A suspeitada | Trombólise agrava a dissecção — diagnóstico diferencial obrigatório antes de qualquer fibrinolítico |
| Sangramento gastrointestinal ativo no último mês | Hemorragia potencialmente fatal com anticoagulação e fibrinólise |
| Diátese hemorrágica conhecida | Coagulopatia preexistente que impede hemostasia eficaz |

---

### 6. IAMSST e Angina Instável — Escore GRACE, Estratificação e Conduta

O escore GRACE (Global Registry of Acute Coronary Events) é o principal instrumento de estratificação de risco no IAMSST, validado em mais de 100.000 pacientes em 14 países. As variáveis incluem: idade, frequência cardíaca na admissão, pressão arterial sistólica, creatinina sérica, classe Killip de admissão, supradesnivelamento de ST presente ou ausente, elevação de marcadores cardíacos presente ou ausente, e parada cardiorrespiratória na admissão.

| Risco GRACE | Escore | Mortalidade hospitalar | Mortalidade em 6 meses | Estratégia Invasiva |
|---|---|---|---|---|
| Muito alto | Acima de 140 mais qualquer: choque, arritmia grave, IC refratária, isquemia recorrente ao repouso | Variável | Acima de 9% | ICP imediata em menos de 2 horas |
| Alto | 109–140 | Acima de 3% | 3–9% | ICP precoce em menos de 24 horas |
| Intermediário | 89–108 | 1–3% | 1–3% | ICP eletiva em até 72 horas |
| Baixo | Abaixo de 89 | Abaixo de 1% | Abaixo de 1% | Estratégia conservadora com teste de isquemia não invasivo antes da alta |

**Critérios de estratificação imediata (muito alto risco independente do escore GRACE):**
- Instabilidade hemodinâmica ou choque cardiogênico instalado
- Dor torácica recorrente refratária à terapia farmacológica máxima
- Arritmias com risco de vida — taquicardia ventricular sustentada ou fibrilação ventricular
- Complicações mecânicas: comunicação interventricular ou insuficiência mitral aguda grave
- Depressão de ST difusa mais supra em aVR — suspeita de lesão de tronco ou DA proximal

**Farmacoterapia no IAMSST e Angina Instável (ESC 2023):**
- Antiplaquetário duplo: AAS 150 a 300 mg ataque VO + ticagrelor 180 mg ataque VO (PLATO: redução de mortalidade cardiovascular em 21% versus clopidogrel); prasugrel 60 mg se ICP planejada em paciente com anatomia coronária conhecida — evitar em maiores de 75 anos, abaixo de 60 kg e com AVC prévio (TRITON-TIMI 38); clopidogrel 600 mg reservado para contraindicação ao ticagrelor
- Anticoagulação: fondaparinux 2,5 mg SC uma vez ao dia — 1ª escolha (OASIS-5: menor sangramento que enoxaparina sem perda de eficácia); enoxaparina 1 mg/kg SC a cada 12 horas se fondaparinux indisponível; HNF 60 UI/kg IV em bolus se ICP planejada nas próximas horas — fondaparinux sozinho é insuficiente para o procedimento percutâneo
- Betabloqueador oral: iniciar nas primeiras 24 horas se FC acima de 60 bpm, PA adequada e sem IC aguda descompensada — metoprolol succinato 25 a 50 mg/dia
- IECA ou BRA: nas primeiras 24 horas se FE abaixo de 40%, HAS ou DM
- Estatina de alta intensidade: atorvastatina 40 a 80 mg ainda na internação (MIRACL: redução de isquemia recorrente em 16 semanas)

---

### 7. Terapia Antitrombótica Completa — DAPT, Anticoagulação e Duração

| Situação Clínica | Antiplaquetário 1 | Antiplaquetário 2 | Anticoagulante | Duração do DAPT |
|---|---|---|---|---|
| IAMCSST + ICP primária | AAS 200 mg ataque + 100 mg/dia | Ticagrelor 180 mg, depois 90 mg a cada 12 horas (preferencial) ou prasugrel 60 mg ataque, depois 10 mg/dia | HNF 60–100 UI/kg IV (máx 5.000 UI) durante ICP; bivalirudina como alternativa | 12 meses com stent farmacológico; 6 meses se alto risco hemorrágico |
| IAMCSST + trombólise | AAS 300 mg VO ataque | Clopidogrel 300 mg se até 75 anos ou 75 mg se acima de 75 anos — ticagrelor e prasugrel não na fase aguda pós-trombólise | Enoxaparina: abaixo de 75 anos: 30 mg IV bolus + 1 mg/kg SC a cada 12 horas; acima de 75 anos: 0,75 mg/kg SC sem bolus | 12 meses |
| IAMSST e AI + ICP eletiva | AAS 200 mg | Ticagrelor 180 mg, depois 90 mg a cada 12 horas | Fondaparinux 2,5 mg SC/dia suspenso antes da ICP — adicionar HNF no momento do procedimento | 12 meses com stent farmacológico; 6 meses se alto risco hemorrágico |
| IAMSST e AI conservador | AAS 200 mg | Ticagrelor 180 mg, depois 90 mg a cada 12 horas | Fondaparinux 2,5 mg SC por 8 dias ou até alta hospitalar | 12 meses |
| Alto risco hemorrágico — HAS-BLED 3 ou mais | AAS 100 mg | Ticagrelor 60 mg após 12 meses (PEGASUS) ou suspensão do segundo antiplaquetário após 6 meses | — | 6 meses ou monoterapia com AAS |

> A triple therapy — DAPT mais anticoagulante oral — em pacientes com fibrilação atrial submetidos à ICP: preferir dupla terapia com anticoagulante oral mais ticagrelor ou clopidogrel após 1 a 4 semanas de triple therapy inicial, conforme os ensaios PIONEER AF-PCI e RE-DUAL PCI, que demonstraram menor sangramento sem aumento de eventos isquêmicos.

---

### 8. Classificação de Killip e Manejo do Choque Cardiogênico

| Classe Killip | Critério Clínico | Achados Físicos e Laboratoriais | Mortalidade Hospitalar | Tratamento Específico |
|---|---|---|---|---|
| I | Ausência de sinais de IC | Sem estertores, sem terceira bulha, PVC normal | 5–6% | Padrão: antiplaquetários, anticoagulante, reperfusão |
| II | IC leve a moderada | Estertores em até metade dos pulmões, terceira bulha, PVJ aumentada | 10–15% | Furosemida EV, iniciar IECA precocemente |
| III | Edema agudo de pulmão | Estertores difusos bilaterais, ortopneia, SpO2 abaixo de 90% | 25–40% | O2 alto fluxo, CPAP ou VNI, furosemida, nitrato se PA acima de 100 mmHg |
| IV | Choque cardiogênico | PAS abaixo de 90 mmHg, IC abaixo de 2,2 L/min/m², PCP acima de 18 mmHg, sinais de hipoperfusão periférica | 50–80% | Noradrenalina, dobutamina, ICP emergência, BIAC, Impella, ECMO |

**Choque Cardiogênico — Diagnóstico Hemodinâmico e Suporte Escalonado:**
- Critérios hemodinâmicos: PAM abaixo de 65 mmHg + índice cardíaco abaixo de 2,2 L/min/m² + pressão de capilar pulmonar acima de 18 mmHg
- Vasopressor de 1ª escolha: noradrenalina 0,1 a 1 mcg/kg/min (SOAP II: menor mortalidade e menos arritmias que dopamina)
- Inotrópico: dobutamina 2,5 a 10 mcg/kg/min se IC baixo com PA acima de 80 mmHg
- Suporte mecânico escalonado: BIAC tem benefício limitado (IABP-SHOCK II: sem redução de mortalidade em 30 dias); Impella CP para suporte ativo do VE com aumento de débito; ECMO venoarterial no choque refratário a todas as medidas farmacológicas

---

### 9. Complicações Mecânicas Pós-IAM

| Complicação | Momento Típico | Apresentação Clínica | Diagnóstico | Conduta |
|---|---|---|---|---|
| Comunicação Interventricular (CIV) | 3 a 5 dias — pico em 3 a 7 dias | Deterioração súbita + sopro holosistólico rude em borda esternal esquerda inferior com frêmito | ECO Doppler: shunt esquerda-direita no septo; step-up de O2 no VD ao Swan-Ganz | Cirurgia urgente ou fechamento percutâneo; BIAC como ponte; mortalidade cirúrgica de 20 a 50% |
| Rotura de Parede Livre | 3 a 7 dias | Tamponamento cardíaco súbito: dissociação eletromecânica, hipotensão grave, veias jugulares distendidas, bulhas abafadas — tríade de Beck | ECO emergência: derrame pericárdico com colapso diastólico do AD e VD | Pericardiocentese de emergência + cirurgia imediata; mortalidade acima de 80% sem intervenção cirúrgica |
| Disfunção ou Rotura de Músculo Papilar | 2 a 7 dias | IM aguda grave: sopro holossistólico apical com irradiação axilar + EAP refratário | ECO Doppler: IM grau III ou IV com flail leaflet | Cirurgia valvar urgente — plastia ou troca; BIAC como ponte |
| Pericardite Epistenocardíaca | 1 a 3 dias | Dor pleurítica, atrito pericárdico | ECG: supra côncavo difuso, diferente do IAMCSST convexo localizado | Aspirina 650 mg a cada 4 a 6 horas; evitar IECA e anticoagulante em dose plena por 1 a 2 semanas |
| Síndrome de Dressler | 2 a 10 semanas | Febre + dor pericárdica + derrame pleural bilateral | PCR elevada; ECO com derrame | Aspirina 650 mg + colchicina 0,5 mg duas vezes ao dia por 3 meses |

---

### 10. Prevenção Secundária Pós-IAM — Tratamento Crônico Baseado em Evidências

**Medicações com recomendação Classe I (todos os pacientes pós-SCA):**
- AAS 75 a 100 mg/dia indefinidamente — reduz reinfarto e morte cardiovascular em 25 a 30%
- IECA ou BRA: indicado em todos com FE abaixo de 40% (SAVE, AIRE, TRACE — redução de mortalidade de 27%); iniciar também em HAS, DM e DRC mesmo com FE preservada
- Betabloqueador: reduz mortalidade pós-IAM em 23% principalmente por prevenção de morte súbita arrítmica e reinfarto; manter por pelo menos 3 anos em FE abaixo de 40%
- Estatina de alta intensidade: atorvastatina 40 a 80 mg (PROVE-IT, TNT); meta LDL abaixo de 55 mg/dL em DCV estabelecida segundo a ESC 2021; iniciar ainda internado
- Antagonista da aldosterona — eplerenona ou espironolactona: se FE igual ou abaixo de 40% com IC sintomática ou com DM (EPHESUS: redução de mortalidade de 15%)
- iSGLT2 — empagliflozina ou dapagliflozina: em IC-FEr ou DM2 após SCA (EMPEROR, DAPA-HF, SOLOIST-WHF)
- Reabilitação cardíaca supervisionada: reduz mortalidade CV em 26% e hospitalização em 18% (meta-análise Cochrane 2016); iniciar 4 a 6 semanas após o IAM

**Metas terapêuticas a 3 meses pós-alta:**
- LDL abaixo de 55 mg/dL — se inatingível com estatina: acrescentar ezetimiba e considerar anti-PCSK9
- PAS abaixo de 130 mmHg em menores de 65 anos; abaixo de 140 mmHg em maiores de 65 anos
- HbA1c abaixo de 7% em pacientes com DM2
- Cessação absoluta do tabagismo — o risco de novo IAM cai 50% no primeiro ano após parar de fumar

---

### 11. Caso Clínico — IAMCSST Inferior com Bloqueio AV e Extensão para Ventrículo Direito

**Cenário:** Homem, 61 anos, tabagista há 30 anos, hipertenso e diabético tipo 2. Atendido no PS às 14h com dor torácica opressiva intensa irradiando para mandíbula e braço esquerdo, sudorese profusa, iniciada às 12h30. PA: 88/60 mmHg. FC: 42 bpm, ritmo regular. SpO2: 92% em ar ambiente. Pulsos periféricos fracos e frios. Ausculta pulmonária limpa, sem estertores.

**ECG:** Supra de ST de 5 mm em DII, DIII e aVF. Depressão recíproca de 3 mm em DI e aVL. BAV de 2° grau Mobitz I (Wenckebach) com PR progressivamente aumentado e bloqueio ocasional. V3R e V4R: supra de ST de 2 mm.

**TnI-hs 0h:** 3.240 ng/L (referência abaixo de 16 ng/L).

**Raciocínio diagnóstico passo a passo:**
1. Supra em DII, DIII e aVF = IAMCSST de parede inferior — artéria culpada provável é a CD, responsável por 80 a 90% dos IAM inferiores
2. Supra em V3R e V4R = extensão para ventrículo direito por oclusão proximal da CD antes do ramo marginal direito
3. Bradicardia com FC de 42 bpm + BAV de 2° grau Mobitz I = típico do IAM inferior por isquemia do nó AV, irrigado pela CD em 90% das pessoas; geralmente transitório e reversível com reperfusão coronária
4. PA 88/60 mmHg + pulsos frios + pulmões limpos = choque cardiogênico por disfunção do VD, não por disfunção de VE — a ausência de congestão pulmonar é a chave diagnóstica; Killip IV por IAM de VD

**Conduta imediata estruturada:**
1. AAS 200 mg VO + ticagrelor 180 mg VO — DAPT de ataque imediato
2. HNF 60 UI/kg IV em bolus (máximo 4.000 UI) — anticoagulação para ICP
3. Contraindicar nitrato e morfina — ambos causam venodilatação com queda de pré-carga e colapso imediato do VD insuficiente
4. Reposição de volume: SF 0,9% 500 mL em bolus rápido se pulmões limpos — VD insuficiente depende de pré-carga para manter o débito cardíaco
5. Ativar sala de hemodinâmica imediatamente — Killip IV com IAM de VD = estratificação de muito alto risco; meta de primeiro contato médico ao balão abaixo de 90 minutos
6. BAV Mobitz I: atropina 0,5 mg IV se FC abaixo de 40 bpm ou progressão para BAV de 3° grau; marcapasso temporário se refratário — esperar resolução espontânea com reperfusão da CD
7. Noradrenalina 0,1 a 0,5 mcg/kg/min se PAM abaixo de 65 após expansão volêmica — manter perfusão coronária

**Pós-ICP e alta hospitalar:**
- Ticagrelor 90 mg a cada 12 horas + AAS 100 mg/dia por 12 meses
- Metoprolol succinato 25 mg/dia — titular conforme FC e PA; vigilância de bradicardia residual
- Ramipril 5 mg/dia — IECA em DM + HAS; ECO de controle em 6 a 8 semanas para avaliar FE e função do VD
- Atorvastatina 80 mg/dia — meta LDL abaixo de 55 mg/dL
- Cessação do tabagismo: vareniclina mais suporte psicológico estruturado
- Reabilitação cardíaca supervisionada em 4 a 6 semanas

> O IAM inferior com extensão para VD é uma armadilha diagnóstica e terapêutica clássica. A tríade "IAM inferior + hipotensão + pulmões limpos" deve acionar imediatamente a pesquisa de IAM de VD com derivações V3R e V4R. O erro mais grave é administrar nitrato ou morfina nessa situação — o resultado é colapso hemodinâmico imediato e potencialmente fatal.

---

### Referências
- Byrne RA et al. 2023 ESC Guidelines for the management of acute coronary syndromes. Eur Heart J. 2023;44(38):3720–3826.
- O'Gara PT et al. 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction. J Am Coll Cardiol. 2013;61(4):e78–e140.
- Amsterdam EA et al. 2014 AHA/ACC Guideline for the Management of Patients with Non-ST-Elevation Acute Coronary Syndromes. J Am Coll Cardiol. 2014;64(24):e139–e228.
- Thiele H et al. Intraaortic Balloon Support for Myocardial Infarction with Cardiogenic Shock — IABP-SHOCK II. N Engl J Med. 2012;367:1287–1296.
- Wallentin L et al. Ticagrelor versus Clopidogrel in Patients with Acute Coronary Syndromes — PLATO. N Engl J Med. 2009;361:1045–1057.`, ativo: true,
    },
    {
      titulo: 'Insuficiência Cardíaca',
      descricao: 'IC sistólica e diastólica. Classificação NYHA, diagnóstico e tratamento farmacológico baseado em evidências.',
      disciplina: 'Clínica Médica', tema: 'Cardiologia', tipo: 'video', nivel: 'intermediario',
      duracao: 60, ordem: 4, mes: 1, semana: 2,
      videoUrl: 'https://www.youtube.com/watch?v=03j0wVOXFcA',
      conteudo: `## Insuficiência Cardíaca

**Base:** ESC 2021 (McDonagh TA et al.) + AHA/ACC 2022 (Heidenreich PA et al.) + SBC 2021

---

### 1. Fisiopatologia — Da Lesão ao Remodelamento

A IC resulta de lesão miocárdica primária (infarto, miocardite, cardiotoxicidade) ou sobrecarga hemodinâmica crônica (HAS, valvopatia) que ativam mecanismos compensatórios — inicialmente adaptativos, cronicamente deletérios.

**Disfunção sistólica (IC-FEr):** perda de cardiomiócitos → ativação neuro-humoral (SRAA + SNS) → remodelamento excêntrico (dilatação + hipertrofia excêntrica). O BNP/NT-proBNP é liberado pelos cardiomiócitos em resposta ao estiramento, promovendo vasodilatação e natriurese compensatória — e serve como marcador diagnóstico e prognóstico.

**Disfunção diastólica (IC-FEp):** rigidez miocárdica por fibrose e hipertrofia concêntrica (HAS, DM, obesidade) → relaxamento comprometido e pressões de enchimento elevadas → congestão retrógrada com fração de ejeção preservada.

> A ativação do SRAA e do SNS, inicialmente compensatória, causa vasoconstrição, retenção de sódio e apoptose de cardiomiócitos — perpetuando o ciclo de remodelamento. Os 4 pilares da IC-FEr atuam interrompendo esses mecanismos.

---

### 2. Classificação por Fração de Ejeção e Estadiamento NYHA

| Fenótipo | FEVE | Mecanismo Principal | Prevalência |
|---|---|---|---|
| IC-FEr (reduzida) | < 40% | Disfunção sistólica; remodelamento excêntrico | 50% |
| IC-FEm (levemente reduzida) | 40–49% | Zona cinzenta; componente misto | 10–20% |
| IC-FEp (preservada) | ≥ 50% | Disfunção diastólica; HAS, DM, FA, obesidade | 30–40% |

| Classe NYHA | Limitação Funcional | Descrição Clínica |
|---|---|---|
| I | Nenhuma | Atividade habitual sem dispneia, fadiga ou palpitações |
| II | Leve | Sintomas com atividades moderadas (subir escadas, caminhada rápida) |
| III | Moderada a grave | Sintomas com atividades menores que habituais (vestir-se, higiene) |
| IV | Total | Sintomas em repouso ou ao mínimo esforço; acamado |

---

### 3. Diagnóstico — Critérios de Framingham, Peptídeos e Ecocardiograma

**Critérios de Framingham:** diagnóstico clínico requer ≥ 2 maiores OU 1 maior + 2 menores.

| Critérios Maiores | Critérios Menores |
|---|---|
| Dispneia paroxística noturna | Edema de tornozelos bilateral |
| Distensão venosa jugular | Tosse noturna |
| Crepitações pulmonares | Dispneia aos esforços habituais |
| Cardiomegalia no RX (ICT > 0,5) | Hepatomegalia |
| EAP (edema agudo de pulmão) | Derrame pleural |
| Galope por B3 | Taquicardia > 120 bpm |
| Refluxo hepatojugular | Perda de peso > 4,5 kg em 5 dias com tratamento |

**Peptídeos natriuréticos:**
- BNP < 35 pg/mL OU NT-proBNP < 125 pg/mL: IC improvável (alto VPN — diagnóstico ambulatorial)
- BNP > 35 pg/mL sensível; NT-proBNP ≥ 900 pg/mL (contexto agudo): IC provável

**Ecocardiograma:** avalia FEVE pelo método de Simpson biplano, disfunção diastólica (razão E/e' > 14 sugere pressões de enchimento elevadas), valvopatias e derrame pericárdico.

> O NT-proBNP deve ser interpretado com cautela na obesidade (falsamente baixo) e na insuficiência renal (falsamente elevado). A FEVE deve ser confirmada em 2 medições antes de indicar CDI/CRT para excluir variação de examinador.

---

### 4. Os Quatro Pilares do Tratamento da IC-FEr

Todos os 4 pilares devem ser iniciados em pacientes com FEVE < 40% e NYHA II-IV — cada um reduz independentemente a mortalidade total e as hospitalizações por IC.

| Pilar | Droga (dose inicial -> dose-alvo) | Estudo-Chave | Benefício Mortalidade |
|---|---|---|---|
| IECA ou ARNI | Enalapril 2,5 mg 2x/dia -> 10 mg 2x/dia; sacubitril/valsartana 24/26 mg -> 97/103 mg 2x/dia | PARADIGM-HF | 20% a favor do ARNI vs IECA |
| Betabloqueador | Carvedilol 3,125 mg 2x/dia -> 25 mg 2x/dia; Bisoprolol 1,25 mg -> 10 mg/dia; Metoprolol succinato 12,5 -> 200 mg/dia | COPERNICUS / CIBIS-II | 34% |
| ARM | Espironolactona 12,5–25 mg/dia -> 50 mg/dia; Eplerenona 25 mg -> 50 mg/dia | RALES / EPHESUS | 30% |
| iSGLT2 | Dapagliflozina 10 mg/dia; Empagliflozina 10 mg/dia (dose única, sem titulação) | DAPA-HF / EMPEROR-Reduced | 25% hospitalizações |

ARNI substitui (não associa) o IECA/BRA — aguardar intervalo mínimo 36h entre IECA e ARNI. Diuréticos (furosemida 20–80 mg/dia VO) aliviam congestão mas não reduzem mortalidade — titular para menor dose eficaz. Monitorar K+ e creatinina após cada ajuste de dose.

---

### 5. Dispositivos Cardíacos Implantáveis

| Dispositivo | Indicação Classe I | Critérios Adicionais |
|---|---|---|
| CDI (cardioversor-desfibrilador implantável) | FEVE ≤ 35% + NYHA II-III + OMT ≥ 3 meses + expectativa de vida > 1 ano | Profilaxia primária de morte súbita |
| CRT (ressincronizador) | BRE completo ≥ 150 ms + FEVE ≤ 35% + NYHA II-IV em OMT | Reduz mortalidade e hospitalização em dissincronia ventricular |
| CRT-D | BRE ≥ 150 ms + FEVE ≤ 35% + NYHA II-III | Combina ressincronização + desfibrilação |

> Aguardar pelo menos 3 meses de OMT otimizada antes de indicar CDI/CRT — a FEVE pode melhorar com tratamento farmacológico (remodelamento reverso), evitando implante desnecessário.

---

### 6. Descompensação Aguda — Perfis de Forrester-Diamond e Manejo

| Perfil Forrester | Pressão de Enchimento | Débito Cardíaco | Quadro Clínico | Tratamento Inicial |
|---|---|---|---|---|
| I (quente e seco) | Normal | Normal | Compensado | Manter OMT e titular doses |
| II (quente e úmido) | Elevada | Normal | Congestão sem hipoperfusão | Furosemida IV + nitrato se PA adequada |
| III (frio e seco) | Normal/baixa | Reduzido | Hipoperfusão sem congestão | Volume criteriosa + inotrópico |
| IV (frio e úmido) | Elevada | Reduzido | Choque cardiogênico | Inotrópico + diurético + suporte mecânico |

**Manejo do perfil II (mais comum na prática):**
- Furosemida 40–80 mg EV (dose = 2,5x a dose oral diária se já em uso)
- Nitratos EV se PA ≥ 90 mmHg: nitroglicerina 10–200 mcg/min — reduzem pré-carga e congestão pulmonar
- CPAP/BiPAP no EAP cardiogênico — reduz taxa de intubação em ~50%
- Morfina: evitar rotineiramente — associada a maior mortalidade em estudos observacionais
- Inotrópicos (perfil IV): dobutamina 2,5–20 mcg/kg/min; levosimendan 0,1 mcg/kg/min (preferido se paciente em uso de betabloqueador, pois mecanismo independente)

---

### 7. Populações Especiais

**IC na gravidez:** cardiomiopatia periparto — surgimento de disfunção sistólica no último mês gestacional ou até 5 meses pós-parto. Tratamento: hidralazina + nitratos (IECA e ARNI contraindicados). Bromocriptina pode reduzir prolactina (mecanismo proposto).

**IC com DRC:** iSGLT2 seguros até TFG ≥ 20 mL/min. ARNI requer cautela se TFG < 30. Evitar AINEs e contrastes não essenciais. Ajustar dose de diuréticos conforme clearance.

**IC e FA:** a FA é causa e consequência de IC-FEp. Controle de frequência (betabloqueador + digoxina se refratário) ou ritmo (cardioversão elétrica se instável). Anticoagulação com DOAC — warfarina se valvopatia mitral reumática ou prótese mecânica.

---

### 8. Caso Clínico

**Cenário:** Mulher, 64 anos, hipertensa e diabética há 12 anos. Internada com dispneia progressiva há 5 dias, ortopneia, edema de membros inferiores até raiz da coxa, crepitações bilaterais em ambas as bases e B3 audível. PA: 138/82 mmHg. FC: 104 bpm. SpO2: 90% em ar ambiente. BNP: 1.240 pg/mL. Ecocardiograma: FEVE 28%, sem valvopatia significativa.

**Estadiamento:** IC-FEr grave (FEVE 28%), NYHA III-IV, perfil Forrester II (quente e úmido).

**Manejo imediato:** Furosemida 80 mg EV em bolus; CPAP 8 cmH2O (SpO2 < 90%); posição sentada com pernas pendentes; monitorização contínua de débito urinário. Meta: diurese 100–150 mL/h nas primeiras 6 horas. Repetir eletrólitos e creatinina em 24h.

**Tratamento de longo prazo:** Iniciar carvedilol 3,125 mg 2x/dia + enalapril 2,5 mg 2x/dia (titular para sacubitril/valsartana 24/26 mg 2x/dia após 4–6 semanas estável) + espironolactona 25 mg/dia (monitorar K+ em 1 semana) + dapagliflozina 10 mg/dia. Reavaliação ecocardiográfica após 3 meses de OMT completa — se FEVE permanecer ≤ 35% com NYHA II-III: indicar CDI (prevenção primária de morte súbita).`,
      ativo: true,
    },
    {
      titulo: 'Pneumonia Adquirida na Comunidade',
      descricao: 'Etiologia por faixa etária, CURB-65, PSI, antibioticoterapia empírica por gravidade (ambulatorial/hospitalar/UTI), pneumonia atípica e por COVID-19. Base: IDSA/ATS 2019 + SBPT 2023.',
      disciplina: 'Clínica Médica', tema: 'Pneumologia', tipo: 'video', nivel: 'intermediario',
      duracao: 42, ordem: 5, mes: 2, semana: 1,
      videoUrl: 'https://www.youtube.com/watch?v=Oe_vi3epuGI', conteudo: `## Pneumonia Adquirida na Comunidade

**Base:** IDSA/ATS 2019 + SBPT 2023 + Diretrizes BTS 2022

---

### 1. Definição e Epidemiologia

A PAC é definida como infecção do parênquima pulmonar adquirida fora de ambiente hospitalar (ou até 48 h após internação). É a principal causa de morte por doenças infecciosas no Brasil, responsável por 1,5 milhão de internações/ano. Mortalidade varia de <1% (ambulatorial) a 30–50% (UTI com choque séptico).

**Diagnóstico clínico-radiológico:** presença de ≥ 2 critérios clínicos (tosse, febre, expectoração purulenta, dor pleurítica, dispneia, crepitações à ausculta) + infiltrado novo à radiografia de tórax ou tomografia computadorizada.

> A ausência de infiltrado radiológico NÃO exclui PAC precoce — repetir Rx em 24–48 h se forte suspeita clínica. TC de tórax tem sensibilidade superior para diagnósticos iniciais negativos.

### 2. Etiologia por Faixa Etária e Comorbidade

| Contexto Clínico | Agentes Mais Prováveis |
|---|---|
| Adulto jovem sem comorbidades | S. pneumoniae, Mycoplasma pneumoniae, Chlamydophila pneumoniae, vírus respiratórios |
| Adulto > 65 anos / comorbidades | S. pneumoniae, H. influenzae, bacilos gram-negativos, vírus influenza, S. aureus |
| Tabagista com DPOC | S. pneumoniae, H. influenzae, M. catarrhalis, Pseudomonas aeruginosa (DPOC grave) |
| Alcoolista / aspiração | Anaeróbios (Peptostreptococcus, Fusobacterium), S. pneumoniae, K. pneumoniae |
| Imunossuprimido (HIV/transplante) | Pneumocystis jirovecii, Cryptococcus, CMV, fungos endêmicos, micobactérias |
| PAC grave / UTI | S. pneumoniae, Legionella pneumophila, S. aureus (MRSA), gram-negativos |
| Exposição a torres de resfriamento, viagens | Legionella pneumophila |

> Legionella: pensar em hiponatremia + diarreia + pneumonia grave em viajante ou usuário de ar-condicionado central. Diagnóstico pelo antígeno urinário (sensibilidade 70–80%, especificidade > 99%).

### 3. Estratificação de Gravidade: CURB-65 e PSI

**CURB-65** (1 ponto cada):
- **C**onfusão mental (novo)
- **U**réia > 7 mmol/L (> 19 mg/dL)
- **R**espiração ≥ 30 ipm
- **B**aixa PA: sistólica < 90 ou diastólica ≤ 60 mmHg
- **65** anos ou mais

| Pontuação CURB-65 | Mortalidade | Conduta |
|---|---|---|
| 0–1 | < 3% | Ambulatorial |
| 2 | ~9% | Internação (avaliar caso a caso) |
| 3–5 | 15–40% | Internação obrigatória; ≥ 4 considerar UTI |

**PSI (Pneumonia Severity Index):** classifica em 5 classes de risco com base em 20 variáveis (idade, sexo, comorbidades, exame físico e laboratorial). Classes I–II = ambulatorial; III = observação curta; IV–V = internação/UTI. Mais sensível que CURB-65 para estratificação fina.

**Critérios de UTI (IDSA/ATS — 1 maior ou ≥ 3 menores):**

| Critérios Maiores | Critérios Menores |
|---|---|
| Ventilação mecânica invasiva | FR ≥ 30 ipm |
| Choque séptico com vasopressores | PaO2/FiO2 ≤ 250 |
| — | Infiltrado multilobar |
| — | Confusão mental |
| — | Uremia (BUN ≥ 20 mg/dL) |
| — | Leucopenia < 4.000/mm³ |
| — | Trombocitopenia < 100.000/mm³ |
| — | Hipotermia < 36 °C |
| — | Hipotensão necessitando ressuscitação |

### 4. Tratamento Antibiótico Empírico por Gravidade

**PAC Ambulatorial (baixo risco, sem comorbidades):**
- Amoxicilina 1 g VO 8/8 h × 5 dias (1ª linha, S. pneumoniae)
- Azitromicina 500 mg VO/dia × 5 dias (atípicos, alergia a betalactâmicos)
- Fluorquinolona respiratória (levofloxacino 750 mg/dia × 5 d ou moxifloxacino 400 mg/dia × 5 d) — com comorbidades ou uso recente de ATB

**PAC Ambulatorial com comorbidades (DM, DRC, DCV, imunossupressão):**
- Amoxicilina-clavulanato 875/125 mg VO 12/12 h + azitromicina 500 mg/dia × 5–7 dias
- OU fluorquinolona respiratória em monoterapia × 5–7 dias

**PAC Hospitalar (enfermaria, não-UTI):**
- Ampicilina-sulbactam 3 g EV 6/6 h + azitromicina 500 mg EV/VO/dia
- OU cefalosporina 3ª geração (ceftriaxona 1–2 g EV/dia) + azitromicina
- OU fluorquinolona respiratória EV em monoterapia
- Duração: 5–7 dias

**PAC Grave (UTI):**
- Ceftriaxona 2 g EV/dia + azitromicina 500 mg EV/dia
- OU ceftriaxona 2 g EV/dia + levofloxacino 750 mg EV/dia
- Suspeita de Pseudomonas: piperacilina-tazobactam 4,5 g EV 6/6 h + ciprofloxacino 400 mg EV 8/8 h
- Suspeita de MRSA: adicionar vancomicina 25–30 mg/kg/dia EV ou linezolida 600 mg EV 12/12 h
- Duração: 7–10 dias (Legionella e S. aureus: 14–21 dias)

> Troca EV → VO quando: afebril 48–72 h, FR < 24, SpO2 > 90% em ar ambiente, via oral funcionante — sem necessidade de completar 7 dias EV para estabilizados.

### 5. Pneumonia Atípica: Mycoplasma, Chlamydophila e Legionella

**Síndrome da pneumonia atípica:**
- Início gradual (1–3 semanas), tosse não-produtiva predominante
- Sintomas extrapulmonares: cefaleia, mialgia, faringite, rash cutâneo
- Rx: infiltrado intersticial difuso, bilateral, sem consolidação franca
- Leucócitos normais ou levemente elevados; hemocultura negativa

| Agente | Diagnóstico | Tratamento | Duração |
|---|---|---|---|
| Mycoplasma pneumoniae | Sorologia IgM, PCR nasofaringe | Azitromicina 500 mg/dia VO | 5 dias |
| Chlamydophila pneumoniae | Sorologia IgM/IgG (pouco disponível) | Doxiciclina 100 mg 12/12 h VO | 10–14 dias |
| Legionella pneumophila | Antígeno urinário (sorogrupo 1), PCR | Levofloxacino 750 mg EV/VO | 7–14 dias |

> Mycoplasma em jovens: pode causar anemia hemolítica por crioaglutininas (IgM anti-eritrócito). Pesquisar em PAC atípica com queda de Hb inexplicada.

### 6. Pneumonia por COVID-19 e Vírus Respiratórios

- SARS-CoV-2 causa pneumonia bilateral com padrão em vidro fosco periférico na TC
- Gravidade: SpO2 < 94% = moderada; < 90% = grave; com SDRA = crítica
- Tratamento: dexametasona 6 mg/dia × 10 dias (SpO2 < 94%); antivirais (nirmatrelvir-ritonavir nos primeiros 5 dias, alto risco); anticoagulação profilática
- Influenza: oseltamivir 75 mg 12/12 h × 5 d (iniciar em < 48 h); quadro grave ou imunossuprimido: independente do tempo

### 7. Falha Terapêutica e Populações Especiais

**Critérios de falha:** ausência de melhora clínica em 72 h de ATB adequado → investigar: agente resistente, derrame pleural/empiema, neoplasia, tuberculose, vasculite pulmonar, insuficiência cardíaca.

| Conduta na falha | Ação |
|---|---|
| Rever diagnóstico diferencial | TC tórax, broncoscopia com LBA |
| Ampliar cobertura | Incluir MRSA, Pseudomonas, fungos se imunossuprimido |
| Investigar complicações | Ultrassom pleural, TC para abscessos |

**Gestantes:** evitar fluorquinolonas e tetraciclinas; preferir amoxicilina ou ceftriaxona + azitromicina (segura na gestação). Pneumonia grave na gestante = risco de parto prematuro.

**Idosos:** apresentação atípica (sem febre em 30%, confusão mental isolada); maior mortalidade; maior risco de S. aureus, gram-negativos e aspiração; cuidar com dose de fluorquinolona em DRC.

**Imunossuprimidos:** ampliar diagnóstico diferencial; considerar cobertura para Pneumocystis (sulfametoxazol-trimetoprima), fungos e micobactérias conforme contexto.

### 8. Caso Clínico

**Enunciado:** Homem de 72 anos, diabético, ex-tabagista, internado com febre 39 °C, tosse produtiva esverdeada há 4 dias, FR 28 ipm, PA 100/60 mmHg, SpO2 88% em ar ambiente. Radiografia: opacidade lobar direita. Ureia 24 mg/dL, leucócitos 16.000/mm³. Hemocultura e antígeno urinário de Legionella pendentes.

**Análise:**
- CURB-65: Uréia 24 mg/dL (> 19) = 1 + FR 28 ipm (não atinge 30) = 0 + PA sistólica 100 (não < 90) = 0 + 72 anos = 1 → **CURB-65 = 2** → internação
- Critérios menores de UTI: SpO2 88% → PaO2/FiO2 provavelmente ≤ 250 (1 critério) + FR 28 ipm (< 30, não conta) → ainda não preenche critério de UTI se único critério menor
- PSI: com diabetes, > 70 anos, FR 28, PA limítrofe → provável Classe IV → internação
- Agente provável: S. pneumoniae (1ª) ou H. influenzae (DPOC/tabagismo) — aguardar resultado de Legionella
- Tratamento adequado: **ceftriaxona 2 g EV/dia + azitromicina 500 mg EV/dia** (cobertura para típicos + atípicos/Legionella)
- Suporte: O2 suplementar para SpO2 ≥ 90–94%; hidratação EV; analgesia
- Desfecho esperado: melhora em 48–72 h; se mantiver febre ou piora, TC tórax e investigar falha`, ativo: true,
    },
    {
      titulo: 'DPOC — Doença Pulmonar Obstrutiva Crônica',
      descricao: 'Sistema ABE (GOLD 2025), farmacoterapia escalonada (LAMA/LABA/CI), papel dos eosinófilos, exacerbação aguda e oxigenoterapia domiciliar.',
      disciplina: 'Clínica Médica', tema: 'Pneumologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 50, ordem: 5, mes: 2, semana: 2,
      videoUrl: null,
      conteudo: `## DPOC — Doença Pulmonar Obstrutiva Crônica

**Base:** GOLD Report 2025 — Global Initiative for Chronic Obstructive Lung Disease (goldcopd.org).

---

## 1. Definição e Diagnóstico

DPOC é uma doença heterogênea das vias aéreas e/ou alvéolos que causa obstrução persistente e progressiva ao fluxo de ar, associada a resposta inflamatória crônica aumentada a gases ou partículas nocivas.

**Diagnóstico espirométrico:** VEF₁/CVF **< 0,70** pós-broncodilatador (critério fixo GOLD)

> Diagnóstico exige espirometria — sintomas e radiografia isolados não confirmam DPOC. Diagnóstico clínico sem espirometria é inadequado.

**Principais causas:**
- Tabagismo (principal fator de risco — responsável por 80-90% dos casos)
- Exposição ocupacional (poeiras, gases, fumos — sílica, carvão, isocianatos)
- Combustão de biomassa (fogão a lenha — importante em mulheres não tabagistas)
- Deficiência de alfa-1 antitripsina (causa genética — suspeitar em < 45 anos sem tabagismo)

---

## 2. Estadiamento Espirométrico — GOLD 1 a 4

| Grau GOLD | VEF₁ (% do predito) | Gravidade obstrutiva |
|-----------|---------------------|----------------------|
| GOLD 1 | ≥ 80% | Leve |
| GOLD 2 | 50-79% | Moderada |
| GOLD 3 | 30-49% | Grave |
| GOLD 4 | < 30% | Muito grave (risco de insuficiência respiratória) |

---

## 3. Sistema de Avaliação ABE (GOLD 2023-2025)

O sistema **ABE** avalia conjuntamente sintomas e histórico de exacerbações para guiar o tratamento:

| Grupo | Sintomas | Exacerbações (último ano) | Tratamento inicial recomendado |
|-------|----------|--------------------------|-------------------------------|
| **A** | Poucos (CAT < 10 ou mMRC 0-1) | 0-1 sem hospitalização | SABA ou SAMA conforme necessidade |
| **B** | Mais (CAT ≥ 10 ou mMRC ≥ 2) | 0-1 sem hospitalização | LAMA **ou** LABA (preferir LAMA) |
| **E** | Qualquer | ≥ 2 ou ≥ 1 com hospitalização | LAMA **+** LABA (dupla broncodilatação) |

> **Grupos C e D foram eliminados no GOLD 2023.** O Grupo "E" (Exacerbations) engloba todos pacientes de alto risco, independente dos sintomas. A decisão de adicionar corticoide inalatório (CI) é guiada pelo nível de eosinófilos — não pelo grupo.

**Escalas de sintomas:**
- **CAT ≥ 10** = impacto significativo na qualidade de vida (alto)
- **mMRC ≥ 2** = dispneia ao subir um lance de escadas / andar em plano

---

## 4. Farmacoterapia — Papel dos Eosinófilos

A adição de **Corticoide Inalatório (CI)** é guiada pela contagem de eosinófilos no sangue periférico:

| Eosinófilos (células/μL) | Recomendação de CI |
|--------------------------|-------------------|
| ≥ 300 | Forte indicação para adicionar CI (alto benefício) |
| 100-300 + ≥ 2 exacerbações | Considerar CI |
| < 100 | CI traz benefício mínimo e aumenta risco de pneumonia |

**Broncodilatadores disponíveis:**
- **SABA** (Short-Acting Beta₂ Agonist): salbutamol, fenoterol — uso de resgate
- **SAMA** (Short-Acting Muscarinic Antagonist): ipratrópio — uso de resgate
- **LABA** (Long-Acting Beta₂ Agonist): formoterol, salmeterol, indacaterol — 2×/dia ou 1×/dia
- **LAMA** (Long-Acting Muscarinic Antagonist): tiotrópio, umeclidínio, glicopirrônio — 1×/dia (preferência)

**Combinações fixas disponíveis:**
- LAMA + LABA: umeclidínio/vilanterol, tiotrópio/olodaterol, glicopirrônio/indacaterol
- LABA + CI: formoterol/budesonida, salmeterol/fluticasona
- Triple: LAMA + LABA + CI (umeclidínio/vilanterol/fluticasona)

> **Triple therapy:** benefício comprovado em reduzir exacerbações em pacientes com indicação de CI. Evitar em pacientes sem indicação (risco aumentado de pneumonia bacteriana).

---

## 5. Tratamento Não Farmacológico

- **Cessação do tabagismo:** intervenção mais eficaz — reduz o declínio acelerado de VEF₁
- **Vacinação:** Influenza anual + Pneumocócica (PCV20) + COVID-19 + Pertussis
- **Oxigenoterapia domiciliar (OLD):** indicada se PaO₂ ≤ 55 mmHg ou SatO₂ ≤ 88% em repouso; mínimo 15h/dia; reduz mortalidade em GOLD 3-4 hipoxêmico
- **VNI domiciliar:** considerar em hipercapnia crônica (PaCO₂ > 55 mmHg) ou após exacerbação com hipercapnia persistente
- **Reabilitação pulmonar:** melhora capacidade funcional, qualidade de vida e reduz exacerbações — indicada em GOLD 2-4

---

## 6. Exacerbação Aguda de DPOC

**Definição:** piora aguda dos sintomas respiratórios (dispneia, tosse, expectoração) que necessita mudança no tratamento habitual.

**Critérios de Anthonisen para antibioticoterapia:**
1. Aumento de dispneia
2. Aumento do volume de escarro
3. Escarro mais purulento

**Antibiótico indicado se 2 ou 3 critérios presentes** (ou se ventilação mecânica):

| Situação | Antibiótico preferido |
|----------|-----------------------|
| Exacerbação leve-moderada ambulatorial | Amoxicilina-clavulanato 875/125mg 12/12h × 5-7d |
| Alternativa | Azitromicina 500mg/dia × 3d ou Levofloxacino 500mg/dia × 5d |
| Hospitalização (possível Pseudomonas) | Ciprofloxacino 500mg 12/12h ou Piperacilina-tazobactam |

**Tratamento hospitalar da exacerbação:**
- SABA (salbutamol) + SAMA (ipratrópio) inalados nebulizados
- Corticoide sistêmico: prednisolona 40mg/dia × **5 dias** (não prolongar — sem benefício adicional)
- Antibiótico se Anthonisen ≥ 2 critérios
- **VNI (Ventilação Não Invasiva):** indicada se pH 7,25-7,35 + PaCO₂ elevado + FR > 25 irpm — reduz mortalidade e necessidade de IOT
- **IOT:** falha da VNI, Glasgow < 9, instabilidade hemodinâmica, parada respiratória

---

## 7. Caso Clínico

**Cenário:** Homem, 65 anos, ex-tabagista (40 maços-ano, parou há 2 anos), dispneia mMRC 2 (ao subir escadas), 2 exacerbações no último ano sem hospitalização. CAT: 16. Espirometria pós-BD: VEF₁/CVF 0,58; VEF₁ 62% do predito. Eosinófilos: 380 células/μL.

**Resolvendo passo a passo:**

1. **Diagnóstico espirométrico:** VEF₁/CVF 0,58 (< 0,70) → **DPOC confirmado**. VEF₁ 62% → **GOLD 2** (moderado).

2. **Classificação ABE:** 2 exacerbações sem hospitalização → **Grupo E** (alto risco de exacerbações). CAT 16 = sintomas significativos.

3. **Tratamento inicial Grupo E:** LAMA + LABA em combinação fixa.

4. **Adicionar CI?** Eosinófilos 380 μL (≥ 300) = forte indicação → **Triple therapy: LAMA + LABA + CI**.

5. **Demais medidas:** reabilitação pulmonar (GOLD 2 sintomático), vacinas (influenza + pneumocócica), não indicar OLD (SatO₂ normal).

---

## 8. Referências

- Global Initiative for Chronic Obstructive Lung Disease. GOLD 2025 Report. goldcopd.org, 2025.
- Agustí A et al. Global Initiative for COPD 2023 Report: GOLD Executive Summary. Eur Respir J. 2023;61(4):2300239.
- Wedzicha JA et al. Management of COPD exacerbations: A European Respiratory Society/American Thoracic Society guideline. Eur Respir J. 2017;49(3):1600791.`,
      ativo: true,
    },
    {
      titulo: 'Doença Renal Crônica',
      descricao: 'Estadiamento pela TFG, causas principais, diagnóstico de complicações e tratamento conservador e renal substitutivo.',
      disciplina: 'Clínica Médica', tema: 'Nefrologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 52, ordem: 6, mes: 2, semana: 1,
      videoUrl: null, conteudo: `## Doença Renal Crônica

**Base:** KDIGO 2024 + NKF 2023 + SBN 2023

---

### 1. Definição e Estadiamento KDIGO — Matriz G×A

**Diagnóstico:** TFG < 60 mL/min/1,73m2 OU marcadores de lesão renal (proteinúria, hematúria glomerular, alterações morfológicas/histológicas) por ≥ 3 meses — na ausência de lesão, TFG 60–89 com marcadores é DRC G2.

| Estágio G | TFG (mL/min/1,73m2) | Descrição | Risco CV adicional |
|---|---|---|---|
| G1 | ≥ 90 | Normal/elevada + marcador de lesão | Moderado |
| G2 | 60–89 | Levemente diminuída + marcador de lesão | Moderado |
| G3a | 45–59 | Leve a moderada | Alto |
| G3b | 30–44 | Moderada a grave | Muito alto |
| G4 | 15–29 | Grave — preparar para TRS | Muito alto |
| G5 | < 15 | Falência renal | Extremamente alto |

| Albuminúria | Valor (mg/g) | Categoria |
|---|---|---|
| A1 | < 30 | Normal a levemente aumentada |
| A2 | 30–300 | Moderadamente aumentada (microalbuminúria) |
| A3 | > 300 | Gravemente aumentada (macroalbuminúria) |

A matriz G+A define o prognóstico: G3b-A3 = verde-escuro = risco muito alto de progressão renal e eventos cardiovasculares. Medir TFG pela equação CKD-EPI 2021 (inclui cistatina-C quando disponível).

---

### 2. Fisiopatologia da Progressão

**Hiperfiltração dos néfrons remanescentes:** após redução da massa nefroniana, os néfrons sobreviventes aumentam a TFG individual (hiperfiltração adaptativa) → hipertensão glomerular → esclerose segmentar e focal → perda progressiva de néfrons — mecanismo central da progressão independente da causa inicial.

**Proteinúria como mediador inflamatório:** proteínas filtradas no espaço tubular ativam células tubulares → expressão de citocinas pró-fibróticas (TGF-β, angiotensina II local) → fibrose intersticial e atrofia tubular (FIAT) — principal correlato histológico da progressão.

A ativação do SRAA (angiotensina II) aumenta a pressão capilar glomerular e estimula fibrose — justificando o uso de IECA/BRA como nefroprotetores independentemente do efeito anti-hipertensivo.

> Cada dobrão da creatinina = redução de ~50% da TFG. Monitorar velocidade de declínio: queda > 5 mL/min/1,73m2/ano indica progressão acelerada — investigar causas tratáveis (AINE, contraste, depleção volêmica).

---

### 3. Etiologia — Distribuição no Brasil

| Causa | Prevalência | Marcadores Específicos |
|---|---|---|
| Diabetes mellitus (nefropatia diabética) | 34% | Microalbuminúria progressiva; retinopatia associada; TFG decline gradual |
| Hipertensão arterial (nefroesclerose) | 28% | HVE; retinosclerose; proteinúria leve < 1g/dia |
| Glomerulopatias (IgA, GESF, membranosa) | 16% | Síndrome nefrótica/nefrítica; hematúria dismórfica; biópsia diagnóstica |
| Doenças císticas (DRPAD) | 5% | Cistos renais bilaterais; história familiar; gene PKD1/PKD2 |
| Uropatia obstrutiva e refluxo | 4% | Hidronefrose; litíase recorrente; ITU de repetição |

---

### 4. Manejo Conservador — Alvos e Medicamentos

**Controle pressórico e proteção renal:**
- Meta PA: < 130/80 mmHg para todos (< 120/80 se bem tolerado e proteinúria > 0,3 g/g)
- IECA ou BRA: 1a linha absoluta em DRC + proteinúria > 0,3 g/g OU DRC + DM; monitorar K+ e creatinina em 1–2 semanas após início ou ajuste de dose
- iSGLT2 (dapagliflozina 10 mg/dia): DAPA-CKD — redução de 39% na progressão renal mesmo sem DM2; usar até TFG ≥ 20 mL/min. EMPA-KIDNEY: empagliflozina 10 mg/dia — confirmou benefício em DRC não-diabética
- Finerenona (antagonista MR não-esteroidal): FIDELIO-DKD + FIGARO-DKD — redução de eventos renais e CV em DRC + DM; complementar ao IECA/BRA sem hipercalemia excessiva

| Intervenção | Meta/Dose | Evidência |
|---|---|---|
| PA < 130/80 mmHg | IECA/BRA como base | KDIGO 2024 — Classe I |
| IECA ou BRA | Dose máxima tolerada | Proteinúria > 0,3 g/g ou DRC+DM |
| iSGLT2 (dapagliflozina 10 mg) | TFG ≥ 20 | DAPA-CKD: -39% progressão |
| Finerenona 10–20 mg/dia | DRC G3-4 + DM + UACR > 30 | FIDELIO/FIGARO: -18% progressão renal |
| Dieta proteica 0,6–0,8 g/kg/dia | Se TFG < 30 + não dialítico | Retarda progressão; suplementar EAA |
| Bicarbonato VO (650 mg 2–3x/dia) | HCO3 < 22 mEq/L | Retarda declínio da TFG (AASK) |
| Estatina (rosuvastatina/atorvastatina) | LDL < 70 mg/dL | SHARP: -17% eventos CV em DRC |

---

### 5. Complicações por Estágio e Tratamento

| Complicação | Quando Tratar | Tratamento (dose) |
|---|---|---|
| Anemia (Hb < 10 g/dL) | Excluir ferropenia antes | Ferro EV (ferric carboxymaltose 500–1000 mg); ESA (eritropoetina alfa 50–100 UI/kg 3x/sem se ferritina > 200 + Sat Transf > 20%) |
| Acidose metabólica (HCO3 < 22) | Qualquer estágio G | Bicarbonato de sódio 650 mg 2–3x/dia; meta HCO3 ≥ 22–24 mEq/L |
| Hiperfosfatemia (P > 5,5 mg/dL) | G4-G5 | Restrição dietética (< 800 mg/dia) + quelantes: carbonato de Ca (com refeição), sevelamer (sem Ca - preferido se calcificação vascular), hidróxido de Al (curto prazo) |
| PTH elevado (DMO-DRC) | PTH > 2–9x limite superior | Calcitriol 0,25 mcg/dia; cinacalcete se PTH > 300 pg/mL; paratiroidectomia se refratário |
| Hipercalemia (K+ > 5,5 mEq/L) | Risco arritmia | Restrição dietética K+ < 2 g/dia; kayexalate (efeitos GI); patiromer 8,4 g/dia; ciclossilicato de zircônio 10 g 3x/dia (início mais rápido) |

---

### 6. Terapia Renal Substitutiva (TRS) — Indicações e Modalidades

**Indicações absolutas de TRS:** TFG < 10 mL/min com sintomas urêmicos, hipercalemia refratária (K+ > 6,5), acidose refratária (pH < 7,1), sobrecarga hídrica com edema pulmonar refratário, pericardite/encefalopatia urêmica.

| Modalidade | Mecanismo | Acesso | Vantagens | Desvantagens |
|---|---|---|---|---|
| Hemodiálise (HD) | Difusão + convecção | FAV (preferido) ou cateter tunelizado | Eficiência; monitoramento frequente | 3x/semana 4h; dependência de centro |
| Diálise peritoneal (DP) | Difusão pelo peritônio | Cateter abdominal (Tenckhoff) | Autonomia; preservação função renal residual; sem acesso vascular | Risco peritonite; limitação em obesos |
| Transplante renal | Substituição do órgão | — | Melhor sobrevida e QV; único tratamento "curativo" | Lista de espera; imunossupressão permanente |

Encaminhamento ao nefrologista: TFG < 30 mL/min ou queda > 5 mL/min/ano ou UACR > 300 mg/g ou hipertensão resistente ou causa incerta.

---

### 7. Caso Clínico

**Cenário:** Homem, 58 anos, DM tipo 2 há 14 anos (HbA1c atual 9,2%) e HAS há 10 anos. Comparece a consulta com exames: creatinina 2,8 mg/dL (CKD-EPI: TFG = 24 mL/min/1,73m2), K+ 5,9 mEq/L, HCO3 18 mEq/L, UACR 680 mg/g, Hb 9,8 g/dL, fósforo 5,8 mg/dL, PTH 310 pg/mL. PA: 154/92 mmHg. ECG normal.

**Estadiamento KDIGO:** G4-A3 (TFG 24, UACR 680) = risco muito alto de progressão renal e eventos cardiovasculares.

**Condutas prioritárias:**
1. PA: otimizar IECA (enalapril 20 mg/dia) — monitorar K+ em 1 semana; meta PA < 130/80
2. iSGLT2: dapagliflozina 10 mg/dia — TFG 24 (acima do limite de 20); nefroproteção comprovada no DAPA-CKD
3. Hipercalemia (K+ 5,9): suspender AINEs/suplementos de K+; iniciar ciclossilicato de zircônio 10 g 3x/dia por 48h; restrição dietética K+ < 2 g/dia
4. Acidose (HCO3 18): bicarbonato de sódio 650 mg 3x/dia; meta HCO3 ≥ 22 mEq/L
5. Anemia (Hb 9,8): ferro sérico + ferritina — se ferropenia: ferro EV; após reposição, ESA se Hb persistir < 10
6. DMO-DRC: sevelamer 800 mg 3x/dia com refeições (hiperfosfatemia + risco calcificação); calcitriol 0,25 mcg/dia (PTH 310)
7. Encaminhar para nefrologia — preparo para TRS (FAV preferencialmente quando TFG < 20)`, ativo: true,
    },
    {
      titulo: 'Acidente Vascular Cerebral',
      descricao: 'AVC isquêmico e hemorrágico. Diagnóstico por imagem, janela terapêutica para trombólise e prevenção secundária.',
      disciplina: 'Clínica Médica', tema: 'Neurologia', tipo: 'video', nivel: 'avancado',
      duracao: 52, ordem: 7, mes: 2, semana: 2,
      videoUrl: 'https://www.youtube.com/watch?v=SObDP-BpdA4', conteudo: `## Acidente Vascular Cerebral

**Base:** AHA/ASA 2019 (Powers WJ et al.) + ESO 2022 + SBN 2022

---

### 1. Fisiopatologia — Penumbra Isquêmica e Janela Terapêutica

Na oclusão arterial aguda formam-se dois territórios:

**Core isquêmico:** hipoperfusão grave (FSC < 10 mL/100g/min) com falência energética irreversível — necrose em minutos. Não recuperável mesmo com reperfusão. **Penumbra isquêmica:** zona periférica com disfunção neuronal mas metabolismo ainda viável por perfusão colateral (FSC 10–20 mL/100g/min) — área-alvo do tratamento de reperfusão.

**Excitotoxicidade glutamatérgica:** isquemia → despolarização neuronal → liberação maciça de glutamato → influxo de Ca2+ → ativação de proteases e endonucleases → morte celular. Sem tratamento, ~1,9 milhão de neurônios morrem por minuto.

> A penumbra isquêmica é a razão de ser da trombólise e da trombectomia. TC de perfusão com mismatch (penumbra > 1,2x o core) indica viabilidade além da janela clássica — base dos estudos DAWN e DEFUSE-3.

---

### 2. Tipos e Etiologia — Classificação TOAST

| Subtipo AVCi | Mecanismo | Características | Prevalência |
|---|---|---|---|
| Aterotrombótico (grandes artérias) | Placa aterosclerótica instável em ACI, AV, basilar | Estenose > 50%; precedido por AIT; lesão cortical grande | 20% |
| Cardioembólico | Émbolo de origem cardíaca | FA principal causa; válvula reumática; trombose mural pós-IAM | 25% |
| Lacunar (pequenas artérias) | Lipohialinose por HAS e DM | Lesão < 15 mm subcortical; síndromes lacunares puras | 25% |
| Criptogênico | Sem causa após investigação completa | Investigar FOP, FA paroxística, estados pró-trombóticos | 30% |

**AVC hemorrágico (20%):** HIC — HAS em 70% (gânglios da base, tálamo, ponte), angiopatia amiloide (lobar em idosos), anticoagulante; HSA — rotura aneurisma sacular ("pior cefaleia da vida").

---

### 3. Escala NIHSS — Cálculo por Domínio (total 0–42)

| Domínio | Escala | Pontos Máx |
|---|---|---|
| Nível de consciência (LOC) | 0=alerta, 1=sonolento, 2=obtuso, 3=coma | 3 |
| Perguntas LOC (mês/idade) | 0=2 corretas, 1=1, 2=nenhuma | 2 |
| Comandos LOC (olhos/mão) | 0=2 corretos, 1=1, 2=nenhum | 2 |
| Desvio do olhar conjugado | 0=normal, 1=parcial, 2=forçado | 2 |
| Campo visual | 0=normal, 1=parcial, 2=hemianopsia completa, 3=cegueira bilateral | 3 |
| Paralisia facial | 0=normal, 1=leve, 2=parcial, 3=completa | 3 |
| Motor braço D e E (separados) | 0=sem queda, 1=queda < 10s, 2=queda > 10s, 3=sem esforço contra gravidade, 4=sem movimento | 4 cada |
| Motor perna D e E (separados) | 0=sem queda, 1=queda < 5s, 2=queda > 5s, 3=sem esforço, 4=sem movimento | 4 cada |
| Ataxia de membros | 0=ausente, 1=um membro, 2=dois membros | 2 |
| Sensibilidade | 0=normal, 1=leve perda, 2=grave perda ou ausência | 2 |
| Linguagem (afasia) | 0=normal, 1=leve, 2=grave, 3=mudo/global | 3 |
| Disartria | 0=normal, 1=leve, 2=inteligível somente | 2 |
| Extinção/negligência | 0=ausente, 1=parcial, 2=completa | 2 |

Interpretação: 0=sem déficit; 1–4=leve; 5–15=moderado; 16–20=grave; ≥ 21=muito grave.

---

### 4. AIT e Escore ABCD2 — Risco de AVC nas Primeiras 48h

O AIT é déficit neurológico focal de resolução completa (tipicamente < 1h) sem infarto em neuroimagem. Risco de AVC em 48–72h: 3–10%, exigindo investigação urgente.

| Critério ABCD2 | Pontuação |
|---|---|
| Age (Idade ≥ 60 anos) | 1 |
| Blood pressure (PA ≥ 140/90 no AIT) | 1 |
| Clinical: hemiparesia unilateral | 2 |
| Clinical: distúrbio de fala sem hemiparesia | 1 |
| Duration: sintomas ≥ 60 minutos | 2 |
| Duration: sintomas 10–59 minutos | 1 |
| Diabetes mellitus | 1 |

Pontuação 0–3: baixo risco; 4–5: moderado; 6–7: alto risco. Investigação urgente em 24–48h: TC/RM, ECG, ecocardiograma, Holter 30 dias se criptogênico.

---

### 5. Trombólise IV com Alteplase e Trombectomia Mecânica

**Alteplase (rtPA):** 0,9 mg/kg IV (máximo 90 mg) — 10% em bolus + 90% em 60 minutos. Janela: 0–4,5 horas. Meta porta-agulha < 60 minutos. Complicação: HIC sintomática ~6%.

| Critérios de Inclusão | Contraindicações Absolutas |
|---|---|
| AVCi com déficit mensurável (NIHSS > 4) | TC com hemorragia intracraniana |
| Início < 4,5h (ou último visto bem) | AVCi ou TCE grave nos últimos 3 meses |
| Idade ≥ 18 anos | Neoplasia intracraniana ou MAV |
| PA < 185/110 mmHg (reduzir antes se necessário) | DOAC nas últimas 48h (ou anti-Xa detectável) |
| Plaquetas > 100.000/mm3; INR < 1,7 | Sangramento ativo ou cirurgia < 14 dias |
| Glicemia entre 50 e 400 mg/dL | AVC prévio + DM concomitante (contraindicação relativa) |

**Trombectomia mecânica (oclusão de grande vaso — ACI, ACM M1/M2, ACP, basilar):**
- ASPECTS ≥ 6 na TC (0–10; > 6 indica < 1/3 do território da ACM infartado)
- Janela 0–6h: NIHSS ≥ 6 + oclusão confirmada
- Janela 6–24h: mismatch em TC/RM perfusão (DAWN: NIHSS ≥ 10; DEFUSE-3: core < 70 mL)
- Meta: TICI 2b/3 (reperfusão ≥ 50–100% do território) = sucesso técnico
- Realizar trombólise + trombectomia concomitantemente quando ambas indicadas — não aguardar resultado da trombólise

> Não reduzir PA antes da trombólise, exceto se > 185/110 mmHg. Após trombólise: manter PA < 180/105 por 24h. A redução prematura da PA piora a hipoperfusão na penumbra.

---

### 6. Prevenção Secundária

| Etiologia | Antitrombótico | Alvos e Medidas Adicionais |
|---|---|---|
| FA (cardioembólico) | DOAC (apixabana 5 mg 2x/dia; rivaroxabana 20 mg/dia); varfarina se válvula mecânica | Iniciar anticoagulação 1–2 semanas após AVC pequeno-moderado |
| Aterosclerose grandes vasos | AAS 100 mg + clopidogrel 75 mg por 21 dias, depois AAS mono | LDL < 70 mg/dL (estatina alta intensidade); endarterectomia se estenose ≥ 70% sintomática |
| Lacunar | AAS 100 mg/dia | PA < 130/80 mmHg; HbA1c < 7% em diabéticos |
| Criptogênico com FOP | AAS ou fechamento percutâneo (< 60 anos) | Holter 30 dias; investigar trombofilia |

Todos: estatina alta intensidade (LDL < 70), PA < 130/80, cessação tabagismo, reabilitação neurológica precoce (fisio + fono + terapia ocupacional).

---

### 7. Caso Clínico

**Cenário:** Mulher, 72 anos, com fibrilação atrial conhecida em uso de AAS 100 mg (sem anticoagulação). Inicia súbita afasia global + hemiplegia direita há 1h30. NIHSS: 16. PA: 178/100 mmHg. Glicemia: 110 mg/dL. Plaquetas: 210.000. TC: sem hemorragia, ASPECTS 9. AngioTC: oclusão de ACM esquerda em M1.

**Diagnóstico:** AVCi cardioembólico (FA) + oclusão de grande vaso — elegível para trombólise e trombectomia.

**Conduta imediata:**
1. Labetalol 10 mg EV: reduzir PA para < 185/110 mmHg antes da trombólise
2. Alteplase 0,9 mg/kg IV (máx 90 mg): 10% bolus + 90% em 60 min — dentro da janela 4,5h
3. Acionar hemodinâmica simultaneamente: trombectomia mecânica para oclusão M1 — meta porta-punção < 90 min; não aguardar resultado da trombólise
4. Após 24h: TC para excluir transformação hemorrágica; iniciar apixabana 5 mg 2x/dia (FA)
5. Reabilitação multiprofissional precoce: fisioterapia motora + fonoaudiologia para afasia`, ativo: true,
    },
    {
      titulo: 'Sepse e Choque Séptico',
      descricao: 'Critérios diagnósticos (Sepsis-3), bundle de 1h, antibioticoterapia e suporte hemodinâmico no choque séptico.',
      disciplina: 'Clínica Médica', tema: 'UTI', tipo: 'video', nivel: 'avancado',
      duracao: 80, ordem: 8, mes: 3, semana: 1,
      videoUrl: 'https://www.youtube.com/watch?v=AqgH3jtGmM8', conteudo: `## Sepse e Choque Séptico

**Base:** SSC — Surviving Sepsis Campaign 2021 + SEPSIS-3 (Singer M et al., JAMA 2016) + SCCM 2021

---

### Fisiopatologia — Da Infecção à Disfunção Orgânica

A sepse resulta de uma resposta imune desregulada do hospedeiro à infecção. O reconhecimento de padrões moleculares associados a patógenos (PAMPs) por receptores toll-like (TLR) ativa macrófagos, liberando TNF-α, IL-1β e IL-6. Essa cascata inflamatória sistêmica leva a:

- **Hipovolemia distributiva:** vasodilatação periférica intensa mediada por óxido nítrico, perda de fluido para o terceiro espaço e queda da resistência vascular sistêmica
- **Disfunção miocárdica séptica:** depressão biventricular por TNF-α e IL-1β — presente em 40–50% dos choques sépticos; débito cardíaco pode ser normal ou elevado (choque quente)
- **Coagulopatia — CIVD:** ativação simultânea da coagulação + inibição da fibrinólise → microtrombos em capilares + sangramento paradoxal por consumo de fatores
- **Disfunção mitocondrial:** incapacidade celular de utilizar O₂ (cytopathic hypoxia) — explica lactato elevado mesmo sem hipóxia tecidual macroscópica

> A mortalidade do choque séptico refratário supera 40%. Cada hora de atraso no ATB adequado aumenta a mortalidade em 7–10% (Kumar et al., Crit Care Med 2006). O reconhecimento precoce e o bundle hora-1 são as intervenções de maior impacto isolado na sobrevida.

---

### Definições SEPSIS-3 e Ferramentas de Triagem

**Sepse (SEPSIS-3):** infecção suspeita ou confirmada + disfunção orgânica aguda (aumento do SOFA ≥ 2 pontos em relação ao basal).

**Choque séptico:** sepse + necessidade de vasopressor para manter PAM ≥ 65 mmHg + lactato > 2 mmol/L apesar de ressuscitação volêmica adequada — mortalidade hospitalar > 40%.

**Escore SOFA — Disfunção Orgânica por Sistema:**

| Órgão/Sistema | Parâmetro | 1 ponto | 2 pontos | 3 pontos | 4 pontos |
|---|---|---|---|---|---|
| Respiração | PaO₂/FiO₂ | < 400 | < 300 | < 200 com suporte ventilatório | < 100 com suporte ventilatório |
| Coagulação | Plaquetas (×10³/μL) | < 150 | < 100 | < 50 | < 20 |
| Fígado | Bilirrubina (mg/dL) | 1,2–1,9 | 2,0–5,9 | 6,0–11,9 | ≥ 12 |
| Cardiovascular | PAM ou vasopressor | PAM < 70 mmHg | Dopamina ≤ 5 ou dobutamina (qualquer) | Dopamina > 5 ou NE ≤ 0,1 mcg/kg/min | Dopamina > 15 ou NE > 0,1 mcg/kg/min |
| SNC | Glasgow | 13–14 | 10–12 | 6–9 | < 6 |
| Renal | Creatinina (mg/dL) | 1,2–1,9 | 2,0–3,4 | 3,5–4,9 ou DU < 500 mL/dia | ≥ 5 ou DU < 200 mL/dia |

**qSOFA — triagem rápida fora da UTI (≥ 2 pontos = alto risco → calcular SOFA completo):**
- FR ≥ 22 irpm
- Rebaixamento do nível de consciência (Glasgow < 15)
- PAS ≤ 100 mmHg

> O SIRS (≥ 2 critérios: febre/hipotermia, taquicardia, taquipneia, leucocitose/leucopenia) é inespecífico e foi abandonado como critério diagnóstico formal de sepse no SEPSIS-3, mas permanece útil para rastreamento inicial em serviços de menor complexidade.

---

### Bundle Hora-1 da SSC 2021

| Ação | Detalhamento Técnico |
|---|---|
| 1. Lactato sérico | Colher imediatamente. > 2 mmol/L = hipoperfusão tecidual; > 4 mmol/L = alto risco de mortalidade. Repetir em 2h para avaliar clearance de lactato (meta ≥ 10%). |
| 2. Hemoculturas × 2 | Dois pares (aeróbio + anaeróbio) de sítios diferentes, antes dos ATB. Não atrasar ATB > 45 min aguardando coleta. |
| 3. ATB amplo espectro IV | Iniciar em ≤ 1h do reconhecimento de sepse. Cobrir agentes mais prováveis conforme foco clínico e epidemiologia local. |
| 4. Cristaloide 30 mL/kg | Ringer lactato ou SF 0,9% em até 3h se hipotensão (PAM < 65 mmHg) ou lactato ≥ 4 mmol/L. Preferir Ringer lactato (menor acidose hiperclorêmica). Avaliar resposta dinamicamente. |
| 5. Vasopressor | Norepinefrina se PAM < 65 mmHg persiste após ressuscitação volêmica. Meta PAM ≥ 65 mmHg (individualizar em hipertensos crônicos: 70–75 mmHg). |

> A ressuscitação guiada por metas (EGDT — ProCESS/ARISE/ProMISe trials) foi substituída pela monitorização dinâmica de responsividade a fluidos: PLR (passive leg raising), variação de pressão de pulso (VPP > 13% = responsivo) ou ecocardiografia point-of-care. Sobrecarga hídrica (balanço positivo acumulado > 5L) aumenta independentemente a mortalidade.

---

### Antibioticoterapia Empírica por Foco — Tabela Completa

| Foco Infeccioso | ATB de Escolha | Dose e Via | Alternativa |
|---|---|---|---|
| Pulmonar — PAC grave | Ceftriaxona + azitromicina | Ceftriaxona 2g IV/dia + azitromicina 500mg IV/dia | Levofloxacino 750mg IV/dia (se alergia a beta-lactâmico) |
| Pulmonar — PAH/VAP | Piperacilina-tazobactam ou meropenem | Pip-tazo 4,5g IV q6h ou Meropenem 1g IV q8h | + Vancomicina 25–30mg/kg IV se MRSA suspeito |
| Abdominal | Piperacilina-tazobactam | 4,5g IV q6h | Meropenem 1g q8h ± metronidazol 500mg q8h |
| Urinário — comunitário | Ceftriaxona | 1–2g IV/dia | Ciprofloxacino 400mg IV q12h (se perfil sensível local) |
| Urinário — hospitalar/ESBL | Meropenem | 1g IV q8h | Ertapenem 1g IV/dia (sem cobertura para Pseudomonas) |
| SNC — meningite bacteriana | Ceftriaxona + dexametasona | Ceftriaxona 2g IV q12h + Dexametasona 0,15mg/kg IV q6h × 4 dias | + Ampicilina 2g IV q4h (> 50 anos — Listeria) + Vancomicina 25mg/kg (pneumococo resistente) |
| Pele/partes moles | Oxacilina ± pip-tazo | Oxacilina 2g IV q4h + pip-tazo 4,5g q6h | Vancomicina 25mg/kg IV se MRSA suspeito (exposição prévia, falha, colonização) |
| Sem foco definido | Vancomicina + pip-tazo | Vancomicina 25–30mg/kg IV + Pip-tazo 4,5g q6h | Meropenem + Vancomicina se alto risco de MDR (hospitalar > 5 dias, ATB recente) |

**Princípios de desescalonamento:** revisar ATB em 48–72h com resultado das culturas e do antibiograma. Ajustar para menor espectro possível. Duração habitual: 7–10 dias (ITU: 5–7 dias; bacteremia por S. aureus: mínimo 14 dias com ecocardiograma transesofágico para excluir endocardite).

---

### Vasopressores e Corticoterapia no Choque Séptico

| Droga | Dose | Mecanismo Principal | Posição Terapêutica |
|---|---|---|---|
| Norepinefrina (NE) | 0,01–3 mcg/kg/min | α1 predominante + β1 leve → ↑ RVS e PAM sem taquicardia marcada | 1ª linha — sempre preferencial |
| Vasopressina | 0,03 UI/min (dose fixa, não titular) | V1 vascular + V2 renal → vasoconstrição sem taquicardia reflexa | 2ª linha — poupadora de NE; adicionar quando NE > 0,25 mcg/kg/min |
| Adrenalina | 0,01–1 mcg/kg/min | α1 + β1 + β2 → ↑ DC e ↑ PAM + broncodilatação | Alternativa quando NE insuficiente; causa hiperglicemia e hiperlactatemia |
| Dobutamina | 2–20 mcg/kg/min | β1 + β2 → inotrópico positivo + vasodilatação periférica | Disfunção miocárdica séptica com débito cardíaco baixo confirmado |
| Dopamina | 5–20 mcg/kg/min | Dopaminérgico + β1 + α (dose-dependente) | Controversa — maior risco de taquiarritmia; evitar como 1ª linha (SOAP II trial) |

**Hidrocortisona 200 mg/dia EV em infusão contínua:** indicada em choque séptico refratário (NE > 0,25 mcg/kg/min por ≥ 4h sem resposta adequada). Desmame gradual após estabilização hemodinâmica (5–7 dias). Estudo APROCCHSS 2018: redução significativa no tempo em choque e menor necessidade de vasopressores.

---

### Controle de Foco, Monitorização e Populações Especiais

**Controle do foco infeccioso (time-sensitive):**
- Drenagem cirúrgica ou guiada por imagem de abscessos: em até 6–12h do diagnóstico
- Desbridamento imediato de fasciite necrosante — emergência cirúrgica com mortalidade 20–40% se retardo
- Retirada de cateter central infectado (ICSAC — infecção de corrente sanguínea associada a cateter)
- Colecistectomia/colecistostomia em colecistite aguda grave com sepse

**Monitorização e metas terapêuticas nas primeiras 6h:**
- PAM ≥ 65 mmHg (individualizar em hipertensos crônicos: 70–75 mmHg)
- Débito urinário ≥ 0,5 mL/kg/h
- Lactato seriado: clearance ≥ 10% em 2h como indicador de resposta ao tratamento
- ScvO₂ ≥ 70% em cateter venoso central na veia cava superior
- Glicemia alvo 140–180 mg/dL — insulina em infusão contínua se > 180 mg/dL

**Populações especiais:**
- **Idosos:** meta de PAM individualizada; menor tolerância à sobrecarga hídrica — ecocardiografia point-of-care precoce; ajuste rigoroso de dose de ATB para TFG estimada
- **Imunossuprimidos/neutropênicos:** cobertura antifúngica empírica com anidulafungina 200mg IV ataque → 100mg/dia manutenção se neutropenia profunda ≥ 7 dias ou uso prévio de ATB de amplo espectro
- **Gestantes:** sepse obstétrica (corioamnionite, endometrite pós-parto, sepse puerperal) — pip-tazo 4,5g q6h; evitar aminoglicosídeos (ototoxicidade fetal); decisão de interrupção da gestação paralela ao tratamento intensivo

---

### Caso Clínico — UTI com Algoritmo Decisório Completo

**Cenário:** Mulher, 72 anos, diabética, DRC (creatinina basal 1,8 mg/dL). Admitida no PS com febre 39,2°C, confusão mental aguda, PA 78/48 mmHg, FR 28 irpm, SpO₂ 91% em ar ambiente. Relata disúria há 3 dias. Lactato arterial: 4,8 mmol/L. EQU: piúria 3+, nitrito positivo, proteína 2+. Glicemia 310 mg/dL.

**Diagnóstico e raciocínio:**
- qSOFA = 3 pontos (PA baixa + confusão + FR elevada) → suspeita de sepse
- SOFA estimado: cardiovascular 2 (PAM < 65), renal 2 (Cr 2,8 estimada na crise), SNC 1 (confusão) → SOFA ≥ 5 → SEPSIS-3 confirmado
- Foco: urinário — choque séptico (vasopressor necessário + lactato 4,8 mmol/L)

**Bundle hora-1 executado em paralelo:**
1. Lactato arterial colhido (4,8 mmol/L — alto risco)
2. Hemoculturas × 2 + urocultura antes do ATB
3. Ceftriaxona 2g IV dose única (ajuste TFG estimada ~28 mL/min — evitar aminoglicosídeos)
4. Ringer lactato 30 mL/kg em 3h (60 kg → 1.800 mL) — monitorar sinais de sobrecarga (B3, crepitações, SpO₂)
5. Norepinefrina 0,1 mcg/kg/min via acesso venoso central (PAM 52 mmHg após 500 mL iniciais)

**Metas em 6h:** PAM ≥ 65 mmHg, lactato < 2 mmol/L, débito urinário ≥ 30 mL/h.

**Manejo progressivo:**
- Controle glicêmico: insulina regular IV se glicemia > 180 mg/dL — meta 140–180 mg/dL
- Reavaliação 48–72h: ajustar ATB conforme urocultura e antibiograma — desescalonar para ertapenem se ESBL; ciprofloxacino VO se sensível e via oral disponível
- Se PAM não atingida com NE ≥ 0,25 mcg/kg/min em 4h: adicionar vasopressina 0,03 UI/min + hidrocortisona 200mg/dia EV em infusão contínua`, ativo: true,
    },
    // ── Cirurgia (6 aulas) ──
    {
      titulo: 'Abdome Agudo: Diagnóstico e Conduta',
      descricao: 'Diagnóstico diferencial do abdome agudo. Apendicite, colecistite, obstrução intestinal e perfuração de víscera.',
      disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', tipo: 'video', nivel: 'intermediario',
      duracao: 58, ordem: 1, mes: 1, semana: 3,
      videoUrl: 'https://www.youtube.com/watch?v=sSbaQtguG4I', conteudo: `## Abdome Agudo: Diagnóstico e Conduta

**Base:** WSES 2023 + ATLS 11a ed. + SAGES + UpToDate Surgical Care 2024

---

### 1. Semiologia do Abdome Agudo — Tipos de Dor e Sinais Clínicos

| Tipo de Dor | Características | Exemplos |
|---|---|---|
| Inflamatória | Progressiva, piora com movimento e palpação; localiza-se gradualmente | Apendicite, colecistite, diverticulite, peritonite |
| Obstrutiva (cólica) | Cíclica, em cólicas (a cada 4–5 min), acalma entre ondas; distensão abdominal | Bridas, hérnias encarceradas, neoplasia de cólon, vólvulo |
| Vascular | Início súbito, intensa, desproporcional ao exame físico; rapidamente evolui | Isquemia mesentérica, rotura de aneurisma de aorta |

**Sinais semiológicos fundamentais por localização:**

| Sinal | Manobra | Significado |
|---|---|---|
| Blumberg (descompressão brusca) | Compressão lenta + descompressão súbita do abdome | Peritonite (irritação peritoneal) |
| Murphy | Compressão em hipocôndrio direito na inspiração profunda | Colecistite aguda (interrupção por dor) |
| McBurney | Dor à palpação no ponto de McBurney (1/3 lateral da linha espino-umbilical D) | Apendicite aguda |
| Rovsing | Palpação em FIE provoca dor em FID | Apendicite (irritação peritoneal cruzada) |
| Psoas | Extensão da coxa com joelho estendido provoca dor em FID | Apendicite retrocecal |
| Obturador | Rotação interna da coxa flexionada provoca dor em hipogástrio | Apendicite pélvica ou abscesso pélvico |

Defesa muscular voluntária = espasmo ao toque; contratura muscular involuntária (rigidez em tábua) = peritonite estabelecida — indicação cirúrgica de emergência.

---

### 2. Apendicite Aguda — Escore de Alvarado/MANTRELS

| Critério | Pontos |
|---|---|
| Migração da dor para FID (anamnese) | 1 |
| Anorexia | 1 |
| Náuseas/vômitos | 1 |
| Sensibilidade na FID ao exame | 2 |
| Sinal de Blumberg positivo | 1 |
| Elevação da temperatura (febre > 37,5°C) | 1 |
| Leucocitose > 10.000/mm3 | 2 |
| Desvio à esquerda (bastonetes) | 1 |

Interpretação: ≤ 4 = baixa probabilidade (observar); 5–6 = indeterminado (TC abdominal com contraste — sensibilidade 94%, especificidade 95%); ≥ 7 = alta probabilidade (cirurgia sem esperar TC em apresentação típica).

**Tratamento:** apendicectomia laparoscópica (padrão-ouro) — menor dor pós-operatória, recuperação mais rápida, redução de infecção de ferida. Antibioticoterapia perioperatória: cefazolina 2g EV + metronidazol 500 mg EV (dose única pré-incisão). Se perfurada: ceftriaxona 2g/dia + metronidazol 500 mg 3x/dia por 5–7 dias.

> Em pacientes com apendicite não complicada (sem perfuração, sem abscesso), antibioticoterapia isolada (amoxicilina-clavulanato 7 dias) é uma opção, mas com taxa de recorrência de ~39% em 5 anos — a cirurgia permanece o padrão.

---

### 3. Colecistite Aguda — Tokyo Guidelines 2018

**Diagnóstico:** Murphy positivo + leucocitose + USG (espessamento de parede > 4 mm, cálculo encravado no infundíbulo, líquido pericolecístico, edema da parede — "halo sign").

| Grau Tokyo | Critérios | Conduta |
|---|---|---|
| Grau I (Leve) | Colecistite sem disfunção orgânica e sem critério grau II | Antibiótico IV (ampicilina-sulbactam ou cefazolina + metronidazol) + colecistectomia laparoscópica precoce (< 72h) |
| Grau II (Moderada) | Leucócitos > 18.000; febre > 39°C; duração > 72h; massa palpável | Antibiótico IV + colecistectomia precoce ou diferida conforme resposta em 24–72h |
| Grau III (Grave) | Disfunção de órgão (choque, IRA, IH, plaquetas < 100.000) | Estabilização em UTI + drenagem biliar percutânea (colecistostomia) + cirurgia eletiva após recuperação |

---

### 4. Obstrução Intestinal — Diagnóstico e Conduta por Causa

**Diagnóstico radiológico:**
- RX simples em ortostase: níveis hidroaéreos em "degraus de escada" em intestino delgado; ausência de gás no cólon (obstrução completa de delgado)
- TC abdome + pelve com contraste oral/IV: identifica causa, nível e sinais de sofrimento de alça (espessamento > 3 mm, pneumatose, gás portal)

| Causa | Prevalência | Conduta |
|---|---|---|
| Bridas pós-operatórias | 60% das OID | Sonda nasogástrica + hidratação EV + internação; conservador 24–72h se parcial e sem sofrimento; cirurgia se piora ou total |
| Neoplasia de cólon | Principal causa de OGE em adultos | Cirurgia eletiva; se obstrução aguda: prótese endoscópica (paliativo/ponte) ou colostomia de alívio |
| Hérnia encarcerada | Irredutível ao exame | Cirurgia de urgência — risco de estrangulamento |
| Vólvulo de sigmoide | Imagem "em grão de café" no RX | Destorção endoscópica (colonoscopia) como 1a linha; cirurgia eletiva após |

---

### 5. Isquemia Mesentérica Aguda

A isquemia mesentérica aguda tem mortalidade de 60–80% se não tratada em tempo hábil.

**Quadro clínico clássico:** dor abdominal intensa desproporcional ao exame físico (abdome mole no início) + leucocitose + acidose lática + paciente com FA ou aterosclerose grave.

> A tríade "dor desproporcion + FA + lactato elevado" = isquemia mesentérica até prova em contrário.

**Diagnóstico:** AngioTC de abdome (padrão-ouro) — identifica oclusão da artéria mesentérica superior (AMS), trombose venosa ou isquemia não-oclusiva.

**Tratamento:** embolectomia cirúrgica ou trombólise intra-arterial por cateterismo (papaverina intra-arterial na isquemia não-oclusiva) + ressecção de alça necrosada + "second look" cirúrgico em 24–48h.

---

### 6. Perfuração Gastroduodenal

**Diagnóstico:** pneumoperitônio subdiafragmático (ar livre) em RX de tórax em ortostase ou RX de abdome (sensibilidade 75–80%); TC confirma localização e extensão.

**Tratamento cirúrgico de emergência:** laparotomia exploradora + rafia primária (Técnica de Graham — epiploplastia com omento) + lavagem exaustiva da cavidade. Via laparoscópica viável em centros experientes se diagnóstico precoce.

Pós-operatório: pesquisar e erradicar H. pylori (teste respiratório ou biopsia) — erradicação obrigatória para prevenir recidiva úlcero-perfurativa.

---

### 7. Caso Clínico

**Cenário:** Homem, 22 anos, sem comorbidades. Inicia há 20 horas com dor periumbilical que migrou para FID. Febre 38,5°C, náuseas, anorexia. Ao exame: dor à palpação em FID, Blumberg positivo, Rovsing positivo, Psoas positivo. Leucócitos: 15.200/mm3 com desvio à esquerda. TC abdominal: apêndice de 12 mm de diâmetro, com densificação da gordura periapendicular, sem coleções.

**Escore Alvarado:** migração (1) + anorexia (1) + náuseas (1) + sensibilidade FID (2) + Blumberg (1) + febre (1) + leucocitose (2) + desvio (1) = 10 pontos (alta probabilidade).

**Diagnóstico:** Apendicite aguda não complicada (sem perfuração ou abscesso na TC).

**Conduta:**
1. Jejum + hidratação IV + analgesia (dipirona 1g EV + morfina 4 mg EV se dor intensa — analgesia NÃO mascara peritonite)
2. Antibiótico perioperatório: cefazolina 2g + metronidazol 500 mg EV na indução anestésica
3. Apendicectomia laparoscópica de urgência — menor taxa de complicações, recuperação mais rápida
4. Alta em 24h se evolução sem intercorrências; orientar retorno se febre ou piora da dor`, ativo: true,
    },
    {
      titulo: 'Trauma e ATLS',
      descricao: 'Protocolo ATLS 11ª Edição: ABCDE do trauma, ressuscitação hemostática 1:1:1, classes de choque atualizadas e caso clínico.',
      disciplina: 'Cirurgia', tema: 'Trauma', tipo: 'texto', nivel: 'avancado',
      duracao: 89, ordem: 2, mes: 1, semana: 3,
      videoUrl: null,
      conteudo: `## Trauma e ATLS — Protocolo Completo

**Base:** ATLS 11ª Edição — American College of Surgeons (ACS 2023) + EAST Practice Management Guidelines + WSES 2023

---

### 1. ABCDE do Trauma — Avaliação Primária com Intervenções Simultâneas

O protocolo ABCDE não é uma sequência linear, mas um sistema de prioridades com intervenções concomitantes. A identificação de qualquer ameaça à vida deve ser tratada imediatamente antes de avançar ao próximo passo.

**Princípio fundamental:** "Trate o que mata primeiro." A sequência A → B → C → D → E reflete a ordem de mortalidade imediata por lesão não tratada, não a ordem em que os problemas são identificados.

---

### 2. A — Via Aérea com Controle Cervical

**Avaliação:** Falar com o paciente ("você está bem?"). Resposta verbal coerente = via aérea pérvia + ventilação adequada + GCS ≥ 10. Ausência de resposta = emergência imediata.

**Manobras de permeabilização (sem extensão cervical):**
- Jaw-thrust (tração mandibular): manobra de escolha no trauma — não mobiliza coluna cervical
- NÃO realizar chin-lift (hiperextensão cervical) sem exclusão de lesão raquimedular
- Aspiração de secreções, sangue, vômito com cânula rígida (Yankauer)
- Cânula orofaríngea de Guedel: apenas em pacientes inconscientes (reflexo de vômito abolido)

**Indicações de intubação orotraqueal (IOT) — Sequência Rápida de Intubação (SRI):**
- GCS ≤ 8 (incapaz de proteger via aérea)
- Apneia ou bradipneia (FR < 8 irpm)
- Taquipneia grave (FR > 35 irpm) com trabalho respiratório aumentado
- Hipoxemia persistente (SatO2 < 90% com O2 a 100%)
- Queimadura de face/via aérea superior com edema progressivo
- Trauma facial grave com sangramento para via aérea
- Agitação psicomotora intensa impedindo avaliação/procedimentos

**Sequência Rápida de Intubação (SRI) no Trauma:**
1. Pré-oxigenação: O2 100% por 3–5 min com máscara não-reinalante (FiO2 1,0)
2. Etomidato 0,3 mg/kg IV (agente de indução — preserva hemodinâmica, mínimo efeito sobre PA; evitar em sepse grave por supressão adrenal)
3. Succinilcolina 1,5 mg/kg IV (bloqueador neuromuscular despolarizante — latência 60 s; contraindicação: hipercalemia conhecida ≥ 6 mEq/L, grandes queimados > 24h, lesão medular > 24h)
4. Alternativa: rocurônio 1,2 mg/kg IV (bloqueador adespolarizante — latência 60–90 s; reversível com sugamadex 16 mg/kg)
5. Imobilização manual em linha da coluna cervical (não colar, pois colar fecha a boca — retirar colar, manter imobilização manual durante laringoscopia)
6. Confirmar posição: 5 pontos de ausculta + capnografia (padrão ouro)

**Via aérea cirúrgica — Cricotireoidotomia de emergência:**
Indicada no cenário "não intubo, não ventilo" (cannot intubate/cannot oxygenate — CICO): trauma facial maciço, edema de glote, hemorragia maciça de orofaringe.
- Técnica: identificar membrana cricotireóidea (entre cartilagem tireóidea e cricóidea) → incisão transversa 1,5 cm → dilatar → inserir tubo 6.0–7.0 ou cânula de traqueostomia 5.0
- Cricotireoidotomia por punção (punção com cateter 14G + ventilação jet): temporária — máximo 45 minutos; hipercapnia progressiva; não tolerada em adultos > 30 min

---

### 3. B — Ventilação e Respiração: 6 Lesões Ameaçadoras Imediatas

| Lesão | Mecanismo | Sinais Clínicos | Tratamento |
|---|---|---|---|
| Pneumotórax hipertensivo | Acúmulo de ar sob tensão com desvio mediastinal → colapso venoso → PCR | Desvio de traqueia, ausência de MV unilateral, distensão jugular, hipotensão, hipoxemia | DIAGNÓSTICO CLÍNICO — descompressão imediata: agulha 14G no 2° EIC LMC → drenagem 28–32 Fr no 5° EIC LAM |
| Pneumotórax aberto (ferida torácica soprante) | Solução de continuidade > 2/3 do diâmetro da traqueia → ar entra pela ferida preferencial | Ferida torácica aberta, som de "sucção" na inspiração | Curativo de 3 pontas (oclusivo em 3 lados) imediatamente → drenagem em posição distante da ferida |
| Hemotórax maciço | Acúmulo > 1.500 mL de sangue na cavidade pleural (lesão de grandes vasos ou coração) | Hipofonese unilateral, macicez à percussão, choque hemorrágico | Drenagem torácica 36–40 Fr + reposição volêmica; se > 1.500 mL drenado imediatamente ou > 200 mL/h por 4h → toracotomia |
| Tamponamento cardíaco | Acúmulo de sangue no pericárdio → compressão diastólica → queda do débito cardíaco | Tríade de Beck: hipotensão + distensão jugular + bulhas abafadas; pulsus paradoxus; FAST: derrame pericárdico | Pericardiocentese de emergência (2° de escolha) OU janela pericárdica/toracotomia |
| Tórax instável (flail chest) | ≥ 3 costelas fraturadas em 2 pontos → segmento instável com movimento paradoxal | Movimento paradoxal do segmento torácico; dor intensa; hipoxemia (contusão pulmonar associada) | O2 suplementar; analgesia potente (peridural torácica ideal); ventilação mecânica com PEEP se insuficiência respiratória |
| Contusão pulmonar | Trauma direto ao parênquima pulmonar → edema alveolar e hemorragia intersticial → shunt pulmonar | Hipoxemia progressiva nas primeiras 24–48h; TC precoce normal pode subestimar extensão | O2 + ventilação protetora se IOT necessária (VC 6 mL/kg peso ideal, PEEP 5–8 cmH2O); evitar hipervolemia |

> Três lesões com diagnóstico clínico imediato (não esperar TC): pneumotórax hipertensivo, tamponamento cardíaco e hemotórax maciço com instabilidade hemodinâmica. A TC de corpo inteiro é para pacientes ESTÁVEIS.

---

### 4. C — Circulação e Controle da Hemorragia

**Classes de choque hemorrágico (ATLS 11ª Ed. — atualização 2023):**

| Classe | Perda Estimada | Volume (70 kg) | FC (bpm) | PA Sistólica | FR (irpm) | Diurese (mL/h) | Glasgow | Lactato |
|---|---|---|---|---|---|---|---|---|
| I | < 15% | < 750 mL | < 100 | Normal | 14–20 | > 30 | 15 | Normal |
| II | 15–30% | 750–1.500 mL | 100–120 | Normal/↓ levemente | 20–30 | 20–30 | 13–14 | 2–4 mmol/L |
| III | 30–40% | 1.500–2.000 mL | 120–140 | ↓ (< 90 mmHg) | 30–40 | 5–15 | 11–12 | > 4 mmol/L |
| IV | > 40% | > 2.000 mL | > 140 ou bradicardia (agonal) | ↓↓ (< 70 mmHg) | > 40 | Oligúria/anúria | ≤ 10 | > 6 mmol/L |

Atualização ATLS 11ª Ed.: o lactato e a base excess (BE < -6 mEq/L) são superiores à PA e FC isolados para identificar choque oculto (Classe II com PA preservada). Resposta ao cristaloide inicial não é mais critério de definição de classe — avaliar marcadores de perfusão.

**Controle da hemorragia — Hierarquia de intervenções:**
1. Pressão direta na ferida (mais eficaz e mais subestimada)
2. Torniquete pneumático em extremidades: aplicar PROXIMAL à lesão, anotar horário; máximo 2h (rabdomiólise/isquemia); pode ser removido em centro cirúrgico com controle definitivo
3. Curativo hemostático (gaze impregnada com quitosana ou caulim — Combat Gauze): feridas axilares, virilha, pescoço — locais sem torniquete
4. REBOA (Resuscitative Endovascular Balloon Occlusion of the Aorta): oclusão endovascular temporária da aorta em zonas I (torácica descendente — hemorragia abdominal subdiafragmática) ou III (aorta infrarrenal — hemorragia pélvica); ponte para cirurgia definitiva

**Acesso vascular e reposição volêmica:**
- 2 acessos venosos periféricos, calibre ≥ 14G (14G: ~250 mL/min; 16G: ~150 mL/min) — preferir fossa antecubital
- Se acesso periférico impossível: intraósseo (tíbia proximal ou úmero proximal) — equivalente ao acesso venoso central para ressuscitação
- Acesso venoso central (subclávia ou jugular interna) se sem acesso periférico + IO — mais lento para infusão que dois periféricos 14G
- Cristaloide 1L (ou 20 mL/kg em crianças) aquecido a 39°C: infusão rápida e reavaliação. Sem resposta = hemorragia ativa → hemoderivados
- Hipotensão permissiva (PAM 50–65 mmHg, PAS 80–90 mmHg) em trauma penetrante sem TCE: manutenção de perfusão mínima sem dilatar o coágulo antes de controle cirúrgico definitivo. NÃO aplicar em TCE grave (necessita PPC ≥ 70 mmHg)

**Ressuscitação Hemostática — Massive Transfusion Protocol (MTP) 1:1:1:**
- Indicações: perda > 10 unidades de CH em 24h, ou necessidade provável baseada em ABC Score ≥ 2 (PA ≤ 90 mmHg + FC ≥ 120 bpm + mecanismo penetrante + FAST positivo)
- CH : PFC : Plaquetas = 1:1:1 (cada unidade CH + cada unidade PFC + 1 pool de plaquetas a cada 6 CH)
- Evitar cristaloide em excesso (> 2L aumenta coagulopatia dilucional, síndrome compartimental abdominal, ARDS)
- Cálcio ionizado (gluconato de cálcio 1g IV a cada 4 CH): citrato do PFC quelata cálcio → coagulopatia + disfunção miocárdica
- Ácido tranexâmico (ATX): 1g IV em 10 min nas primeiras 3h do trauma + 1g IV em 8h (CRASH-2: redução de 15% na mortalidade por hemorragia). Janela estrita: NÃO administrar após 3h (CRASH-2: aumento de mortalidade se > 3h)

**Tríade da Morte no Trauma (Damage Control Surgery — DCS):**
Hipotermia (T° < 35°C) + Acidose (pH < 7,2) + Coagulopatia (INR > 1,5 / fibrinogênio < 100 mg/dL) formam um ciclo autoperpetuante. Interrupção pela cirurgia de controle de danos:
- Fase 1: laparotomia abreviada (10–15 min) — controle hemorrágico (compressão, ligadura, grampeamento) + controle contaminação fecal (clampagem intestinal sem reconstrução)
- Fase 2: UTI — reaquecimento ativo, correção acidose (bicarbonato + ventilação), transfusão MTP, correção coagulopatia
- Fase 3: cirurgia definitiva após 24–48h com fisiologia normalizada

---

### 5. D — Déficit Neurológico

**Escala de Coma de Glasgow (GCS):**

| Componente | Resposta | Pontuação |
|---|---|---|
| Abertura Ocular (O) | Espontânea / À voz / À dor / Ausente | 4 / 3 / 2 / 1 |
| Verbal (V) | Orientado / Confuso / Inapropriado / Sons / Ausente | 5 / 4 / 3 / 2 / 1 |
| Motor (M) | Obedece / Localiza / Retirada / Flexão / Extensão / Ausente | 6 / 5 / 4 / 3 / 2 / 1 |

TCE leve: GCS 13–15. Moderado: GCS 9–12. Grave: GCS ≤ 8 → IOT mandatória.

O Glasgow Motor Score (GCS-M) isolado prediz prognóstico equivalente ao GCS completo em adultos: GCS-M ≤ 5 = TCE moderado-grave.

**Pupilas — Sinais de Herniação Transtentorial:**
- Midríase unilateral fixa (anisocoria > 2 mm + sem resposta à luz): compressão do III nervo craniano pelo uncus temporal → herniação em curso → neurocirurgia EMERGÊNCIA
- Midríase bilateral fixa: herniação central bilateral ou PCR — sinal de mau prognóstico
- Pupilas puntiformes bilaterais: lesão pontina, intoxicação por opioide

**Sinais de herniação iminente:** GCS em queda ≥ 2 pontos, anisocoria progressiva, postura de descerebração (extensão), triada de Cushing (bradicardia + hipertensão + bradipneia) — sinal TARDIO e ominoso.
Intervenção imediata: hiperventilação temporária (PCO2 35 mmHg), manitol 1 g/kg IV OU solução salina hipertônica 23,4% 30 mL IV + neurocirurgia emergencial.

---

### 6. E — Exposição e Controle da Hipotermia

Expor completamente o paciente (tesoura corta roupas). Log-roll com mínimo 4 pessoas para inspeção do dorso, períneo, axilas, raiz de membros.

**Tríade da Morte e prevenção da hipotermia:**
- Cobrir com manta térmica (alumínio) imediatamente após exposição
- Fluidos aquecidos a 39°C (cristaloide e hemoderivados aquecidos)
- Temperatura ambiente da sala de trauma: 25–28°C
- A hipotermia é a primeira parte da tríade a reverter — mas a mais fácil de prevenir: cada grau abaixo de 35°C reduz a atividade enzimática de coagulação em 10%

---

### 7. Avaliação Secundária e Trauma Abdominal

**Anamnese AMPLE:** Alergias; Medicamentos (anticoagulantes, betabloqueadores — mascaram taquicardia); Past medical history; Last meal; Events/Environment (mecanismo, velocidade, uso de cinto, airbag).

**FAST e eFAST — Ultrassom no Trauma:**

| Janela FAST | Localização do Transdutor | Achado Anormal |
|---|---|---|
| Pericárdica (janela subcostal) | Processo xifóide, transdutor em 45° | Derrame pericárdico (eco-livre entre miocárdio e pericárdio) |
| Hepatorrenal (Morrison) | 8°–10° EIC linha axilar média direita | Líquido livre na goteira parieto-cólica direita |
| Esplenorrenal | 8°–10° EIC linha axilar posterior esquerda | Líquido livre na goteira parieto-cólica esquerda |
| Pélvica (Douglas/Retzius) | Acima da sínfise púbica, transversal | Líquido livre na escavação retovesical (H) ou rectouterina (M) |
| eFAST — Torácica bilateral | 2°–4° EIC LMC bilateral | Ausência de deslizamento pleural = pneumotórax |

FAST positivo + instabilidade hemodinâmica = laparotomia exploradora de emergência (sem esperar TC).
FAST negativo + instabilidade = repetir em 30 min OU laparotomia diagnóstica se deterioração.

**Indicações absolutas de laparotomia exploradora de emergência:**
- FAST positivo com choque refratário à ressuscitação
- Evisceração intestinal
- Hemoperitoneu diagnóstico (lavagem peritoneal ou TC) com instabilidade
- Peritonite franca ao exame físico
- Trauma penetrante abdominal com instabilidade hemodinâmica

---

### 8. Trauma de Coluna e Medula

**Decisão de imobilização — Regras Clínicas Validadas:**
- NEXUS Criteria (baixo risco se TODOS ausentes): sem dor à linha média cervical; sem déficit neurológico focal; alerta e orientado; sem intoxicação; sem lesão distrativa dolorosa
- Canadian C-Spine Rule: se mecanismo de alto risco OU incapaz de rotar pescoço 45° em ambos os lados → imagem obrigatória; se ≥ 65 anos ou mecanismo perigoso (mergulho, trauma axial) → TC cervical diretamente

**Fraturas cervicais importantes:**

| Fratura | Mecanismo | Estabilidade | Característica |
|---|---|---|---|
| Jefferson (C1) | Compressão axial | Instável | Fratura do anel do atlas — TC axial; não compromete medula tipicamente |
| Enforcado (C2) | Hiperextensão + distração | Instável | Fratura bilateral dos pedículos de C2 |
| Odontóide tipo II | Flexão ou extensão | Instável | Fratura na base do processo odontóide — risco de compressão medular |
| Teardrop (gota d'água) | Hiperflexão | Instável | Compressão do corpo vertebral anterior + ligamentos posteriores — lesão medular frequente |
| Burst (explosão) | Compressão axial | Instável se ligamentos comprometidos | Fragmentação do corpo vertebral com retropulsão |

**ASIA Score — Classificação da Lesão Medular (American Spinal Injury Association):**
- A: lesão completa — sem função motora ou sensitiva abaixo do nível
- B: sensitivo-incompleta — sensibilidade preservada abaixo do nível, motor ausente
- C: motor-incompleta — função motora abaixo do nível com força < 3/5 na maioria dos músculos
- D: motor-incompleta — função motora abaixo do nível com força ≥ 3/5 na maioria
- E: normal

Lesão medular aguda: não há benefício comprovado de corticoides (NASCIS III — dados controversos; maioria dos guidelines não recomenda mais). Imobilização + transferência para centro de reabilitação medular.

---

### 9. Trauma Pediátrico e Geriátrico — Particularidades

**Trauma pediátrico:**
- Volume sanguíneo circulante: 80 mL/kg (neonate) / 70 mL/kg (criança)
- Compensação fisiológica excelente: taquicardia é o sinal MAIS PRECOCE de hipovolemia — PA pode estar normal até 30% de perda
- Ressuscitação: cristaloide 20 mL/kg IV (repetir até 3x); depois CH 10 mL/kg
- Vias intraósseas: indicadas precocemente (tíbia proximal, 2 cm abaixo da tuberosidade tibial)
- Ossos mais elásticos: lesão de órgãos internos SEM fraturas de costelas é frequente — não excluir lesão abdominal pela ausência de crepitação costal
- Cabeça proporcionalmente maior: TCE é a principal causa de mortalidade pediátrica por trauma

**Trauma geriátrico (≥ 65 anos):**
- Reserva fisiológica reduzida: taquicardia pode estar atenuada por betabloqueadores ou doença do nó sinusal — não confiar na FC isolada
- Anticoagulantes: até 25% dos idosos em anticoagulação oral → TCE com sangramento intracraniano mesmo com trauma "menor" → TC de crânio com baixo limiar
- Fratura de costelas: mortalidade aumenta linearmente: 1 fratura = 5% mortalidade; 6+ fraturas = 33% mortalidade (estudo EAST)
- Meta PA: idosos frequentemente necessitam PAM > 80 mmHg para perfusão adequada de órgãos cronicamente com aterosclerose — hipotensão permissiva é mais perigosa
- Fragilidade óssea: fraturas de pelve com instabilidade hemodinâmica são mais comuns — precocemente identificar com FAST e cintura pélvica

---

### 10. Caso Clínico Comentado — Politrauma Grave

**Cenário:** Homem, 34 anos, vítima de acidente com moto em alta velocidade. Trazido pelo SAMU. GCS 8 (O2+V2+M4), FC 142 bpm, PA 72/40 mmHg, FR 38 irpm, SatO2 88% com O2 máscara. À inspeção: ferida aberta abdominal com evisceração de alça de delgado, deformidade em coxa direita (fratura de fêmur), distensão abdominal, ausência de MV no hemitórax direito à ausculta, percussão timpânica à direita (sem distensão jugular).

**Raciocínio ABCDE:**

A: GCS 8 → IOT imediata. SRI: etomidato 0,3 mg/kg (21 mg IV) + succinilcolina 1,5 mg/kg (105 mg IV). Imobilização cervical manual durante laringoscopia.

B: Ausência de MV à direita + timpanismo à percussão → pneumotórax (AUSÊNCIA de distensão jugular não exclui — pode estar descomprimido pelo trauma abdominal). Diagnóstico clínico → agulha 14G no 2° EIC LMC direita imediatamente → confirmação com melhora da SatO2 → drenagem torácica 28–32 Fr no 5° EIC LAM direita.

C: FC 142, PA 72/40 → Choque Classe IV (>40% de perda estimada). Controle da hemorragia: curativo de pressão na ferida abdominal + torniquete proximal na coxa direita (fratura femoral frequentemente perde 1.500–2.000 mL). 2 acessos periféricos 14G + intraósseo tibial esquerdo. ABC Score = 3 (≥2): ativar MTP 1:1:1 imediatamente (CH + PFC + plaquetas). Ácido tranexâmico 1g IV em 10 min (< 3h do trauma). NÃO iniciar com 2L de cristaloide em choque Classe IV — ir direto para hemoderivados.

D: GCS 8 (pré-IOT) → pós-IOT reavaliar pupilas e resposta motora. Pupilas isocóricas e reativas — sem herniação em curso. Glicemia capilar: 110 mg/dL (normal).

E: Expor completamente. Log-roll com 4 pessoas: dorso sem lesão aparente, hematoma perianal (suspeita de fratura de bacia — compressão manual da bacia confirma instabilidade → cinta pélvica de emergência). Temperatura: 35,2°C → cobrir com manta térmica + fluidos aquecidos + aumentar temperatura do ambiente.

**FAST emergencial:** pericárdio — livre. Morrison — líquido livre abundante. Esplenorrenal — líquido livre. Pelve — líquido livre.

**Decisão cirúrgica:** FAST positivo + choque refratário à ressuscitação inicial + evisceração intestinal → laparotomia exploradora de EMERGÊNCIA para controle de danos. Objetivos: controle hemorrágico (compressão de vasos mesentéricos + empacotamento) + controle de contaminação (grampeamento de alça intestinal lesada sem anastomose). Fase 2: UTI para correção da tríade da morte. Fase 3: cirurgia definitiva em 24–48h.

**Após estabilização inicial:**
- TC de crânio, coluna cervical, tórax, abdome e pelve ("trauma scan" total body CT)
- Fraturas: ortopedia para avaliação de fratura de fêmur + bacia
- Laboratório: gasometria arterial (pH 7,18, BE -10, lactato 8,2 → acidose grave), hemograma, coagulação, fibrinogênio, eletrólitos

> No politrauma grave, a decisão de "ir direto para a cirurgia" vs. "estabilizar e escanear" é guiada pela hemodinâmica: paciente instável a despeito de ressuscitação ativa = cirurgia imediata. Cada minuto de atraso no controle do sangramento intra-abdominal aumenta a mortalidade em 1%.

---

### Referências
- American College of Surgeons. ATLS: Advanced Trauma Life Support, 11th Edition. Chicago: ACS, 2023.
- CRASH-2 Collaborators. Effects of tranexamic acid on death, vascular occlusive events, and blood transfusion in trauma patients. Lancet. 2010;376(9734):23–32.
- Cannon JW. Hemorrhagic Shock. N Engl J Med. 2018;378(4):370–379.
- Spahn DR et al. Management of bleeding and coagulopathy following major trauma. Crit Care. 2019;23:98.
- EAST Practice Management Guidelines. Management of Hemorrhagic Shock. 2022.`,
      ativo: true,
    },
    {
      titulo: 'Hérnias Abdominais',
      descricao: 'Classificação, diagnóstico clínico e indicações cirúrgicas das hérnias inguinal, umbilical, incisional e femoral.',
      disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', tipo: 'texto', nivel: 'basico',
      duracao: 36, ordem: 3, mes: 2, semana: 3,
      videoUrl: null, conteudo: `## Hérnias Abdominais

**Base:** HerniaSurge Group — International Guidelines for Groin Hernia Management 2018 | EHS — European Hernia Society Guidelines | SBC — Consenso Brasileiro 2022

---

### Anatomia do Canal Inguinal

O canal inguinal mede 4–6 cm de comprimento, vai do anel inguinal profundo (interno) ao anel inguinal superficial (externo). É delimitado por:

- **Parede anterior:** aponeurose do músculo oblíquo externo
- **Parede posterior:** fáscia transversalis (triângulo de Hesselbach)
- **Assoalho:** ligamento inguinal (Poupart)
- **Teto:** músculo oblíquo interno + transverso do abdome

**Triângulo de Hesselbach:** delimitado medialmente pelo reto abdominal, lateralmente pelos vasos epigástricos inferiores e inferiormente pelo ligamento inguinal. Hérnias diretas saem DENTRO do triângulo; indiretas saem FORA (lateral aos vasos epigástricos).

---

### Classificação das Hérnias

| Tipo | Localização | Mecanismo | Frequência |
|---|---|---|---|
| Inguinal Indireta | Pelo anel inguinal profundo, percorre o canal | Congênita (persistência do processo vaginal) | 60–70% de todas as hérnias |
| Inguinal Direta | Diretamente pela parede posterior (triângulo de Hesselbach) | Adquirida (fraqueza da fáscia transversalis) | 25–35% |
| Femoral | Pelo anel femoral, abaixo do ligamento inguinal | Adquirida, mais comum em mulheres | 5–10%; alto risco de encarceramento |
| Umbilical | Pelo anel umbilical | Congênita (fechamento incompleto) ou adquirida (obesidade, ascite) | Muito comum em crianças |
| Incisional | Pelo local de incisão cirúrgica prévia | Adquirida (falha técnica, infecção, obesidade) | 10–15% após laparotomias |
| Epigástrica | Linha alba, acima do umbigo | Fraqueza congênita da linha alba | Incomum |

---

### Diagnóstico Clínico

**Sintomas:** Abaulamento na região inguinal/umbilical que aumenta ao esforço (Valsalva) e reduz ao deitar. Dor/desconforto local, especialmente após esforço.

**Exame físico:**
- Inspeção em pé e ao tossir — visualizar abaulamento
- Palpação do anel inguinal superficial com o dedo introduzido pelo escroto (em homens)
- Manobra de Valsalva: aumenta a pressão intra-abdominal e evidencia a hérnia
- Percussão: timpânico (alça intestinal) vs maciço (epíplon)

**Imagem:** Ultrassom inguinal se dúvida diagnóstica ou hérnia não palpável. TC/RM em casos complexos (hérnia incisional grande, recidiva).

---

### Complicações

| Complicação | Definição | Conduta |
|---|---|---|
| **Encarceramento** | Conteúdo herniário irredutível, SEM comprometimento vascular | Redução manual cuidadosa (pode tentar 4–6h); se falha → cirurgia de urgência |
| **Estrangulamento** | Encarceramento COM comprometimento vascular → isquemia/necrose | **Emergência cirúrgica** — sem tentativa de redução manual |

> **Sinais de estrangulamento:** Dor intensa e contínua (diferente da dor habitual), hérnia tensa e irredutível, eritema/calor local, febre, sinais de obstrução intestinal (náuseas, vômitos, parada de eliminação de gases/fezes).

---

### Indicações Cirúrgicas

| Situação | Conduta |
|---|---|
| Hérnia inguinal sintomática (adulto) | Cirurgia eletiva indicada |
| Hérnia inguinal assintomática (homem adulto) | Conduta expectante segura (watchful waiting) — operar se sintomas surgirem |
| Hérnia femoral (qualquer) | Cirurgia indicada por alto risco de encarceramento |
| Hérnia umbilical em criança < 2–3 anos | Observar — 90% fecham espontaneamente |
| Hérnia umbilical em adulto | Operar se sintomática ou > 1–2 cm |
| Hérnia incisional sintomática | Correção eletiva (tela sintética) |
| Encarceramento irredutível | Urgência cirúrgica |
| Estrangulamento | Emergência — laparotomia imediata |

---

### Técnicas Cirúrgicas

| Técnica | Via | Princípio | Indicação Preferencial |
|---|---|---|---|
| **Lichtenstein** | Aberta (anterior) | Tela de polipropileno sem tensão (tension-free) | Padrão-ouro para hérnia inguinal aberta |
| **Bassini / McVay** | Aberta | Sutura com tensão (sem tela) | Contexto de contaminação/infecção (pouca indicação atual) |
| **TEP** (Totalmente Extraperitoneal) | Laparoscópica | Dissecção do espaço pré-peritoneal + tela | Bilateral, recidiva, hérnia femoral |
| **TAPP** (Transabdominal Pré-peritoneal) | Laparoscópica | Via peritoneal + dissecção posterior + tela | Similar ao TEP; preferida por alguns cirurgiões |
| **Tela para hérnia incisional** | Aberta ou laparoscópica | Tela de polipropileno (sublay, onlay, IPOM) | Correção de hérnia incisional |

> **Vantagens do laparoscópico (TEP/TAPP):** menor dor pós-operatória, retorno mais rápido às atividades, melhor para bilateral e recidiva. Desvantagem: curva de aprendizado, maior tempo cirúrgico.

---

### Caso Clínico

**Homem de 58 anos, obeso (IMC 32), refere dor inguinal direita há 3 meses que piora com esforço. Ao exame: abaulamento inguinal direito irredutível, tenso, doloroso à palpação. Início da dor intensa há 6 horas. Náuseas e dois episódios de vômito.**

- **Diagnóstico:** Hérnia inguinal direita estrangulada
- **Conduta:** NÃO tentar redução manual (risco de redução "en-masse" com necrose interna) — cirurgia de emergência
- **Achados intraoperatórios prováveis:** Alça de delgado isquêmica — se viável após redução, retornar ao abdome; se necrótica → ressecção com anastomose
- **Técnica:** Hernioplastia com tela (evitar tela em contaminação grave — usar material absorvível ou sutura primária)
- **Pós-operatório:** Antibioticoprofilaxia, vigilância de infecção de sítio cirúrgico`, ativo: true,
    },
    {
      titulo: 'Câncer Colorretal',
      descricao: 'Rastreamento, diagnóstico, estadiamento TNM e tratamento cirúrgico do câncer de cólon e reto.',
      disciplina: 'Cirurgia', tema: 'Oncologia Cirúrgica', tipo: 'texto', nivel: 'intermediario',
      duracao: 42, ordem: 4, mes: 3, semana: 1,
      videoUrl: null, conteudo: `## Câncer Colorretal

**Base:** NCCN Guidelines Colon/Rectal Cancer 2024 | ASCO 2023 | INCA — Estimativa 2023 | ESMO Guidelines CCR

---

### Epidemiologia

- 3º câncer mais comum no Brasil (INCA 2023): ~45.000 casos/ano
- Média de diagnóstico: 60–70 anos
- Sobrevida em 5 anos: estágio I ~90% vs estágio IV ~15%
- Cólon (65–70%) > Reto (30–35%)

---

### Fatores de Risco

| Fator | Risco Relativo |
|---|---|
| Idade > 50 anos | Base para rastreamento |
| Histórico familiar (1 parente de 1º grau) | 2–4× |
| Pólipos adenomatosos prévios | 3–10× |
| DII (Crohn/Retocolite) com > 8–10 anos | 5–10× |
| Síndrome de Lynch (HNPCC) | Risco acumulado: 70–80% até 75 anos |
| PAF (Polipose Adenomatosa Familiar) | Risco 100% se não tratada |
| Obesidade, sedentarismo, dieta hipergordurada | 1,5–2× |
| Tabagismo, álcool > 2 doses/dia | 1,5× |

---

### Pólipos Adenomatosos e Risco de Malignização

| Tipo de Pólipo | Risco de Transformação |
|---|---|
| Hiperplásico (serrilhado séssil < 10 mm) | Baixo |
| Adenoma tubular < 1 cm, displasia leve | 1–5% |
| Adenoma viloso | 10–40% |
| Adenoma > 2 cm | 30–50% |
| Adenoma com displasia de alto grau | Alto — tratar como câncer até prova em contrário |

---

### Síndromes Hereditárias

**Síndrome de Lynch (HNPCC):**
- Mutação nos genes MMR (MLH1, MSH2, MSH6, PMS2) → instabilidade de microssatélites (MSI-H)
- Critérios de Amsterdam II: 3 casos em parentes de 1º grau, 2 gerações consecutivas, 1 caso < 50 anos
- Rastreamento: colonoscopia a partir de 20–25 anos, a cada 1–2 anos
- Cânceres extracolônicos: endométrio (50%), ovário, estômago, ureter

**PAF (Polipose Adenomatosa Familiar):**
- Mutação no gene APC (tumor supressor)
- Centenas a milhares de pólipos no cólon — progressão inevitável para câncer se não tratada
- Colectomia total profilática aos 20–25 anos

> **Critério de Bethesda:** Indica solicitação de MSI em tumores — inclui diagnóstico < 50 anos, síncronos/metacrônicos, familiar com CCR ou tumor relacionado a Lynch.

---

### Estadiamento TNM (AJCC 8ª edição) e Equivalente Dukes

| Estágio | TNM | Dukes | Definição | Sobrevida 5 anos |
|---|---|---|---|---|
| I | T1-T2, N0, M0 | A | Limitado à submucosa/muscular própria | ~90% |
| IIA | T3, N0, M0 | B | Invasão da serosa/tecidos pericolônicos | ~80% |
| IIB | T4a, N0, M0 | B | Penetra a superfície peritoneal visceral | ~72% |
| IIIA–C | Qualquer T, N1-N2, M0 | C | Metástase linfonodal regional | 40–70% |
| IV | Qualquer T, qualquer N, M1 | D | Metástase a distância | ~15% |

---

### Rastreamento

| Exame | Intervalo | Observação |
|---|---|---|
| Colonoscopia | A cada 10 anos (45–75 anos) | Padrão-ouro — detecta e remove pólipos |
| Sangue oculto nas fezes — FIT (imunohistoquímica) | Anual | Alta sensibilidade, não invasivo; colonoscopia se positivo |
| Sigmoidoscopia flexível | A cada 5 anos | Detecta somente reto/sigma |

**Início do rastreamento:**
- Risco médio: aos 45 anos (ACS 2018) ou 50 anos (USPSTF)
- Risco aumentado (familiar de 1º grau com CCR < 60 anos): colonoscopia aos 40 anos ou 10 anos antes do caso mais jovem
- Síndrome de Lynch: colonoscopia a partir de 20–25 anos, a cada 1–2 anos

---

### Tratamento Cirúrgico

| Localização | Cirurgia |
|---|---|
| Cólon direito (ceco ao cólon transverso proximal) | Hemicolectomia direita + anastomose íleo-transversa |
| Cólon descendente / sigmoide | Hemicolectomia esquerda ou sigmoidectomia |
| Reto alto (> 10 cm da margem anal) | Ressecção anterior do reto (RAR) |
| Reto médio/baixo (< 10 cm) | Ressecção anterior baixa (RAB) com anastomose + ileostomia de proteção |
| Reto muito distal (< 2–3 cm) | Amputação abdominoperineal (Miles) — colostomia definitiva |

**Princípios oncológicos:** ressecção total do mesorreto (TME) para câncer de reto, margens livres, ressecção de ≥ 12 linfonodos para estadiamento adequado.

---

### Quimioterapia Adjuvante

| Estágio | Conduta |
|---|---|
| Estágio I | Não indicada |
| Estágio II (MSI-H) | Não indicada (bom prognóstico sem QT) |
| Estágio II (alto risco, MSS) | Considerar FOLFOX (oxaliplatina + leucovorin + 5-FU) |
| Estágio III | FOLFOX ou CAPOX por 6 meses — reduz recidiva em ~30% |
| Estágio IV | FOLFOX/FOLFIRI + bevacizumabe/cetuximabe (KRAS wild-type) |

**Câncer de reto localmente avançado (T3-T4 ou N+):** quimiorradioterapia neoadjuvante → cirurgia → QT adjuvante.

---

### Caso Clínico

**Homem de 64 anos com anemia ferropriva sem foco aparente há 6 meses. Hb: 9,2 g/dL. Nega hematoquezia. Pai faleceu de CCR aos 68 anos. Colonoscopia: lesão vegetante no cólon ascendente, biópsia: adenocarcinoma moderadamente diferenciado. TC tórax/abdome/pelve: linfonodos mesentéricos aumentados, sem metástase a distância.**

- **Estadiamento clínico:** Estágio III (cN+, M0)
- **Conduta:** Hemicolectomia direita laparoscópica com linfadenectomia + pesquisa de MSI/MMR e KRAS no tumor
- **QT adjuvante:** FOLFOX ou CAPOX por 6 meses
- **Vigilância pós-operatória:** CEA a cada 3 meses × 2 anos, depois cada 6 meses × 3 anos; colonoscopia em 1 ano
- **Rastreamento familiar:** Filho do paciente deve iniciar colonoscopia aos 40 anos`, ativo: true,
    },
    {
      titulo: 'Queimaduras',
      descricao: 'Classificação por profundidade e extensão, fórmula de Parkland, indicações de UTI-Q e curativos.',
      disciplina: 'Cirurgia', tema: 'Trauma', tipo: 'texto', nivel: 'intermediario',
      duracao: 44, ordem: 5, mes: 3, semana: 2,
      videoUrl: null, conteudo: `## Queimaduras

**Base:** ABA — American Burn Association Practice Guidelines 2022 | ATLS 10ª edição | SBC — Sociedade Brasileira de Cirurgia Plástica

---

### Classificação por Profundidade

| Grau | Camadas Acometidas | Aparência | Dor | Cicatrização |
|---|---|---|---|---|
| **1º Grau (Superficial)** | Epiderme apenas | Eritema, sem bolhas, ressecamento | Sim, intensa | 3–5 dias, sem cicatriz |
| **2º Grau Superficial** | Epiderme + derme papilar | Bolhas, base rósea/úmida e hiperemiada | Muito intensa (terminações nervosas intactas) | 14–21 dias, cicatriz mínima |
| **2º Grau Profundo** | Epiderme + derme reticular | Bolhas, base pálida/esbranquiçada, aspecto moteado | Diminuída (destruição parcial de nervos) | > 21 dias, cicatriz hipertrófica frequente |
| **3º Grau (Espessura Total)** | Epiderme + derme completa | Couro, negro ou branco-pérola, inelástico, seco | Ausente (destruição total de nervos) | Não cicatriza espontaneamente — requer enxerto |
| **4º Grau** | Atinge músculo, tendão, osso | Carbonização | Ausente | Requer cirurgia extensa/amputação |

> **Atenção:** A queimadura de 1º grau NÃO é contabilizada para o cálculo da superfície corporal queimada (SCQ) nas fórmulas de ressuscitação — somente 2º e 3º graus entram no cálculo.

---

### Estimativa da Extensão — Regra dos 9 (Wallace) e Lund-Browder

**Regra dos 9 (adultos):**

| Região | % SCQ |
|---|---|
| Cabeça e pescoço | 9% |
| Tronco anterior | 18% |
| Tronco posterior | 18% |
| Membro superior (cada) | 9% |
| Membro inferior (cada) | 18% |
| Genitália | 1% |

**Lund-Browder (pediátrico):** Mais preciso em crianças pois a cabeça tem proporção maior (~18% no RN, diminui progressivamente) e os membros inferiores têm proporção menor.

**Regra da Palma:** A palma da mão do paciente (incluindo os dedos) = 1% SCQ — útil para queimaduras irregulares/pequenas.

---

### Reanimação Hídrica — Fórmula de Parkland

**Indicação:** Queimaduras ≥ 20% SCQ em adultos (≥ 15% em crianças)

**Fórmula:**
    Volume total (24h) = 4 mL × peso corporal (kg) × % SCQ (2º e 3º graus)

**Distribuição:**
- **Metade** do volume total nas **primeiras 8 horas** (contadas do momento da queimadura, não da admissão)
- **Metade restante** nas **próximas 16 horas**

**Solução:** Ringer Lactato (cristalóide preferencial — menos acidose hiperclorêmica que SF 0,9%)

**Meta de diurese:**
- Adultos: 0,5–1,0 mL/kg/h
- Crianças: 1,0 mL/kg/h

> **Armadilha:** Calcular a partir do horário da queimadura, não da chegada ao hospital. Se o paciente chegou 2h após o trauma, as primeiras 8h já estão parcialmente decorridas — ajustar infusão.

---

### Cuidados Iniciais (ATLS — Primary Survey)

**A — Airway:** Sinais de lesão inalatória: chamuscamento de cílios/pelos nasais, fuligem em orofaringe, rouquidão, estridor, queimadura facial. Intubação precoce antes de edema progredir.

**B — Breathing:** Lesão inalatória por inalação de fumaça (produtos da combustão) → pneumonite química. Intoxicação por CO: nível de carboxi-hemoglobina elevado → O₂ a 100% por 4–6h.

**C — Circulation:** Retirar roupas e joias. Acesso venoso calibroso × 2 (preferencialmente em pele não queimada). Iniciar Parkland.

**D — Disability:** Analgesia adequada (morfina IV titulada)

**E — Exposure:** Temperatura do ambiente (risco de hipotermia).

---

### Critérios de Internação e Transferência para Centro de Queimados (ABA)

| Critério | Indicação |
|---|---|
| Queimadura 2º grau ≥ 10% SCQ (adulto) ou ≥ 5% SCQ (criança/idoso) | Internação |
| Qualquer queimadura de 3º grau | Internação |
| Queimadura de face, mãos, pés, genitália, períneo, articulações | Centro especializado |
| Queimadura elétrica (alta tensão) | Centro especializado |
| Lesão inalatória | Centro especializado (UTI) |
| Queimadura circunferencial de extremidade ou tórax | Cirurgia de urgência (escarotomia) |
| Politraumatizado + queimadura | Centro de trauma com queimados |

---

### Infecção e Escarotomia

**Infecção:** Principal causa de morte após a fase aguda. Agentes: Pseudomonas aeruginosa (mais comum), S. aureus, Candida.
- Antimicrobianos tópicos: sulfadiazina de prata 1% (mais usada), mupuirocina (resistentes)
- Antibiótico sistêmico: apenas para infecção documentada, NÃO profilático

**Escarotomia:** Incisão longitudinal na escara em queimaduras circunferenciais de extremidades ou tórax que causam:
- Síndrome compartimental (extremidades)
- Restrição da expansibilidade torácica (tórax)
- Indicação: emergência cirúrgica — não aguardar

---

### Tratamento Cirúrgico Definitivo

- **Desbridamento precoce** (48–72h): remoção de tecido necrótico
- **Enxerto de pele:** autoenxerto de pele parcial (derme + epiderme superficial) — gold standard
- **Substitutos cutâneos temporários:** Biobrane, aloenxerto cadavérico (enquanto aguarda enxerto)

---

### Caso Clínico

**Homem de 35 anos, 70 kg, vítima de explosão em ambiente fechado há 45 minutos. Apresenta queimaduras de 2º grau profundo em tronco anterior e posterior (18% + 18%) e 3º grau em ambos os membros superiores (9% × 2 = 18%). Total: 54% SCQ. Rouquidão progressiva.**

- **SCQ:** 54% (2º + 3º graus)
- **Lesão inalatória:** Rouquidão → intubação orotraqueal imediata antes do edema
- **Parkland:** 4 × 70 × 54 = **15.120 mL de RL em 24h**
  - Primeiras 8h: 7.560 mL (descontar tempo desde queimadura)
  - Próximas 16h: 7.560 mL
- **Meta diurese:** 35–70 mL/h (0,5–1 mL/kg/h)
- **Transferência:** UTI de queimados — critérios: > 20% SCQ + lesão inalatória + queimaduras de 3º grau extensas`, ativo: true,
    },
    {
      titulo: 'Pancreatite Aguda',
      descricao: 'Etiologia, escore de Ranson e APACHE II, tratamento clínico e indicações de intervenção na pancreatite grave.',
      disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', tipo: 'texto', nivel: 'avancado',
      duracao: 48, ordem: 6, mes: 4, semana: 1,
      videoUrl: null, conteudo: `## Pancreatite Aguda

**Base:** AGA — American Gastroenterological Association 2024 + IAP/APA 2013 revisado + UpToDate 2024

---

### Fisiopatologia — Ativação Enzimática e SIRS

Em condições normais, o pâncreas secreta enzimas digestivas inativas (zimogênios) que são ativadas no duodeno. Na pancreatite aguda, ocorre ativação prematura intrapancreática do tripsinogênio em tripsina, desencadeada por:

- **Biliar:** microlitiase ou coledocolitíase obstruindo o ducto pancreático → hipertensão ductal → ruptura de ácinos
- **Alcoólica:** efeito tóxico direto do álcool nas células acinosas + ativação de células estreladas pancreáticas → fibrose progressiva
- **Metabólica (HTG):** triglicerídeos > 1.000 mg/dL → lipase pancreática hidrolisa TG → ácidos graxos livres tóxicos às células acinosas

A tripsina ativa cascata de serinoproteases intracelulares → digestão celular e tecidual → resposta inflamatória local. A passagem de mediadores inflamatórios (IL-1, IL-6, TNF-α) para a circulação sistêmica desencadeia a SIRS → potencial disfunção orgânica (SDMO). A falência orgânica define a gravidade da pancreatite na classificação de Atlanta Revisada.

> A pancreatite aguda grave (falência orgânica persistente > 48h) apresenta mortalidade de 15–30%. O reconhecimento precoce e a hidratação agressiva com Ringer lactato nas primeiras 12–24h são as intervenções de maior impacto.

---

### Diagnóstico — Critérios de Atlanta e Exames

**Critérios diagnósticos de Atlanta — 2 de 3 são suficientes:**
1. Dor epigástrica típica (em barra, irradiação para o dorso, piora em decúbito dorsal)
2. Lipase ou amilase sérica ≥ 3× o limite superior da normalidade (LSN)
3. TC de abdome com contraste compatível com pancreatite

> Lipase é preferível à amilase: maior sensibilidade (85–100% vs 67–83%) e especificidade, permanece elevada por 3–5 dias vs 24–48h da amilase. A TC com contraste NÃO deve ser solicitada rotineiramente na admissão — indicada apenas se dúvida diagnóstica ou piora clínica em 48–72h para avaliar necrose.

**Investigação etiológica:**

| Exame | Etiologia investigada |
|---|---|
| USG de abdome (obrigatório) | Colelitíase — biliar (40–45%) |
| Triglicerídeos séricos | HTG > 1.000 mg/dL como causa (1–4%) |
| Cálcio sérico total | Hipercalcemia (hiperparatireoidismo primário) |
| IgG4 sérica | Pancreatite autoimune tipo 1 (> 2× LSN) |
| CPRE/EUS | Microlitiase, disfunção do esfíncter de Oddi se causa não encontrada |

---

### Estadiamento de Gravidade — Atlanta Revisado + Escores

**Classificação de Atlanta Revisada 2012:**

| Grau | Definição | Mortalidade |
|---|---|---|
| Leve | Sem falência orgânica e sem complicações locais | < 1% |
| Moderadamente grave | Falência orgânica transitória (≤ 48h) OU complicação local (coleção, necrose) OU exacerbação de comorbidade | 8% |
| Grave | Falência orgânica persistente (> 48h) — respiratória, renal ou cardiovascular | 15–30% |

**Critérios de Ranson — tabela completa:**

| Na Admissão | Em 48h |
|---|---|
| Idade > 55 anos | Queda de Ht > 10% |
| Leucócitos > 16.000/mm³ | BUN aumenta > 5 mg/dL |
| Glicemia > 200 mg/dL | Cálcio < 8 mg/dL |
| LDH > 350 UI/L | PaO₂ < 60 mmHg |
| TGO > 250 UI/L | Déficit de base > 4 mEq/L |
| — | Sequestro de fluido > 6L |

**Interpretação Ranson:** ≥ 3 = pancreatite grave (mortalidade 15–20%); ≥ 5 = mortalidade > 40%.

**BISAP Score (5 critérios — ≥ 3 = grave, mortalidade > 22%):**
- BUN > 25 mg/dL; alteração do sensório; SIRS (≥ 2 critérios); Idade > 60 anos; Derrame pleural em imagem

**CTSI — Índice de Tomografia (Balthazar + Necrose):**

| Índice Balthazar (inflamação) | Pontos | % Necrose | Pontos |
|---|---|---|---|
| A — pâncreas normal | 0 | Sem necrose | 0 |
| B — alargamento focal/difuso | 1 | < 30% | 2 |
| C — inflamação peripancreática | 2 | 30–50% | 4 |
| D — coleção única | 3 | > 50% | 6 |
| E — duas ou mais coleções | 4 | — | — |

CTSI = Balthazar + pontos de necrose. CTSI ≥ 6 = pancreatite grave (mortalidade 17%, morbidade 92%).

---

### Tratamento — Fluxo por Gravidade

**Hidratação (pilar fundamental — primeiras 12–24h):**
- Ringer lactato: **250–500 mL/h** nas primeiras 12–24h → reduz SIRS e insuficiência orgânica vs SF (estudo Wu 2011)
- Meta: diurese ≥ 0,5 mL/kg/h; queda do BUN; redução do hematócrito (hemoconcentração = marcador de gravidade)
- Reavaliação a cada 6h: reduzir infusão se melhora clínica (risco de sobrecarga)

**Nutrição:**
- Dieta oral leve: reintroduzir assim que tolerada (mesmo sem resolução da dor — evidência favorável)
- **Pancreatite moderada/grave:** nutrição enteral precoce por sonda nasogástrica ou nasojejunal em < 24–48h
- Nutrição parenteral total (NPT): reservada se via enteral completamente inviável (íleo prolongado, fístula) — associada a maior infecção e mortalidade vs enteral

**Analgesia:**
- Morfina, hidromorfona ou fentanil IV — eficazes e seguros (mito do espasmo do esfíncter de Oddi pela morfina foi refutado)
- Tramadol + dipirona como alternativa para dor leve-moderada

> ATB PROFILÁTICO NÃO é recomendado mesmo em pancreatite necrosante estéril — metanálises não demonstram redução de mortalidade. Indicar ATB apenas com infecção documentada: necrose infectada (gás na TC), colangite, bacteremia.

---

### Complicações Locais e Indicações de Intervenção

**Complicações locais — definições Atlanta 2012:**
- **Coleção líquida peripancreática aguda (CLPA):** coleção < 4 semanas sem parede definida — maioria se resolve espontaneamente
- **Pseudocisto pancreático:** coleção ≥ 4 semanas com parede definida — tratar apenas se sintomático (dor, compressão, infecção)
- **Coleção necrótica aguda (CNA):** coleção com componente sólido (necrose) < 4 semanas
- **Walled-off necrosis (WON):** CNA ≥ 4 semanas com parede definida — drenar se infecção ou sintomas

**CPRE na pancreatite biliar:**
- Colangite aguda associada: CPRE urgente em < 24h
- Coledocolitíase persistente sem colangite: CPRE em < 72h
- Colecistectomia laparoscópica: na mesma internação se pancreatite leve; após resolução se moderada/grave

**Necrose infectada — diagnóstico e tratamento:**
- Suspeitar se deterioração clínica após melhora inicial ou febre persistente após 7–10 dias
- TC: presença de gás na necrose = necrose infectada (patognomônico); FNA (aspiração por agulha fina) para cultura se dúvida
- Tratamento: imipenem ou meropenem (melhor penetração no tecido pancreático) + drenagem percutânea ou endoscópica (step-up approach) — cirurgia aberta reservada para falha das abordagens minimamente invasivas

---

### Populações Especiais

- **Gestantes:** pancreatite biliar é a principal causa. Evitar TC no 1º trimestre (US é a modalidade preferencial). CPRE com proteção radiológica. Colecistectomia pode ser realizada com segurança no 2º trimestre.
- **Idosos:** maior risco de gravidade; vigilância para SDMO. Hipertrigliceridemia e medicamentos são causas mais frequentes que na população geral.
- **Hipertrigliceridemia > 1.000 mg/dL:** insulina IV (ativa lipase proteica → reduz TG); plasmaférese em casos refratários graves; fenofibrato após recuperação; restringir gorduras e álcool.
- **Pancreatite autoimune tipo 1 (IgG4):** responde dramaticamente a prednisona 40mg/dia — diferenciar de neoplasia pancreática (estenose ductal irregular na CPRE, massa hipoecogênica).

---

### Caso Clínico — Pancreatite Biliar Grave

**Cenário:** Mulher, 58 anos, obesa, sem etilismo. Admitida com dor epigástrica intensa há 18h irradiando para o dorso, vômitos incoercíveis. PA 100/70, FC 118, FR 24, T 38,3°C. Lipase 4.200 U/L (> 3× LSN). BUN 32 mg/dL. Glicemia 220 mg/dL. USG: colelitíase + colédoco 10mm (dilatado). TC admissão não realizada.

**Diagnóstico:** Pancreatite aguda biliar — avaliar gravidade.

**Estratificação:**
- Ranson admissão: Idade < 55 (0), Leuco não disponível ainda, Glicemia > 200 (1), LDH e TGO pendentes → mínimo 1 ponto
- BISAP: BUN > 25 (1) + SIRS taquicardia + febre (1) = 2 pontos → risco intermediário
- Indicação de TC em 48h se não melhorar para avaliar necrose (CTSI)

**Conduta imediata:**
1. Internação + NPO temporário
2. Ringer lactato 350 mL/h × 12h → reavaliar (meta diurese ≥ 0,5 mL/kg/h)
3. Analgesia: morfina 2–4mg IV q4–6h
4. Colédoco dilatado + icterícia progressiva? → CPRE em < 24h (colangite associada)
5. TC abdome com contraste em 48–72h se piora → avaliar necrose e CTSI
6. Colecistectomia laparoscópica na mesma internação se pancreatite leve-moderada confirmada`, ativo: true,
    },
    // ── Pediatria (6 aulas) ──
    {
      titulo: 'Crescimento e Desenvolvimento Normal',
      descricao: 'Marcos do DNPM, curvas de crescimento OMS, triagem auditiva, visual e desenvolvimento neurológico.',
      disciplina: 'Pediatria', tema: 'Desenvolvimento', tipo: 'texto', nivel: 'basico',
      duracao: 32, ordem: 1, mes: 1, semana: 4,
      videoUrl: null, conteudo: `## Crescimento e Desenvolvimento Normal

**Base:** Caderneta de Saúde da Criança MS 2023 | SBP — Diretrizes de Pediatria 2022 | OMS Child Growth Standards

---

### Curvas de Crescimento OMS

As curvas da OMS (2006) são padrão internacional para avaliação de crianças de 0 a 5 anos. Para crianças de 5 a 19 anos, utilizar as curvas OMS 2007.

| Indicador | Alerta para investigação |
|---|---|
| Peso/Idade | < Percentil 3 ou > Percentil 97 |
| Comprimento (Estatura)/Idade | < -2 DP (baixa estatura) |
| Peso/Comprimento (IMC/Idade) | < -2 DP (magreza) ou > +2 DP (sobrepeso) |
| Perímetro Cefálico | < -2 DP (microcefalia) ou > +2 DP (macrocefalia) |

> **Atenção:** Queda de dois canais percentilares consecutivos na curva de peso é sinal de alerta independentemente do percentil atual. Sempre plotar múltiplos pontos para avaliar a tendência.

---

### Marcos do Desenvolvimento Neuropsicomotor (DNPM)

| Faixa Etária | Motor Grosso | Motor Fino | Linguagem | Social/Cognitivo |
|---|---|---|---|---|
| 1–2 meses | Sustenta cabeça (prono) | Segue com olhar | Choro diferenciado | Sorriso social (6 semanas) |
| 3–4 meses | Apoia nos antebraços | Segura objetos | Balbucios, riso (4 meses) | Reconhece rosto da mãe |
| 5–6 meses | Rola, senta com apoio | Transfere objeto entre mãos | Lalação | Estranhos (ansiedade) |
| 7–9 meses | Senta sem apoio (6m), engatinha (8m) | Pinça inferior | "Mamã/Papá" inespecífico | Busca objeto escondido |
| 10–12 meses | Fica em pé com apoio, primeiros passos | Pinça superior fina | 1–3 palavras com sentido | Aponta, imita gestos |
| 15–18 meses | Caminha bem, sobe degraus | Vira páginas, empilha 2 cubos | 4–10 palavras | Jogo simbólico simples |
| 24 meses | Corre, chuta bola | Torre de 6 cubos | Frases 2 palavras, vocabulário > 50 palavras | Nomeia partes do corpo |
| 3 anos | Sobe/desce escada alternando pés | Copia círculo | Frases complexas, conta histórias | Jogo cooperativo |

---

### Denver II — Triagem do Desenvolvimento

O Denver II avalia 4 domínios: motor grosso, motor fino-adaptativo, linguagem e pessoal-social. Aplicado em crianças de 0 a 6 anos.

**Interpretação:**
- **Normal:** todas as tarefas esperadas para a idade executadas
- **Suspeito:** atraso em 1 ou mais áreas (falha em item que 90% das crianças da mesma idade realizam)
- **Atrasado:** confirmado por 2 testes consecutivos suspeitos → encaminhar para avaliação especializada

> **Sinais de alerta absolutos (red flags) — encaminhar imediatamente se:**
> - Sem sorriso social aos 3 meses
> - Sem balbucio aos 6 meses
> - Sem gestos (apontar, acenar) aos 12 meses
> - Sem palavras únicas aos 16 meses
> - Sem frases de 2 palavras aos 24 meses
> - Perda de habilidades já adquiridas em qualquer idade

---

### Introdução Alimentar

| Fase | Recomendação |
|---|---|
| 0–6 meses | Aleitamento materno exclusivo (OMS/MS) |
| 6 meses | Introdução de alimentos complementares — mantendo aleitamento materno |
| 6–8 meses | Papas de frutas e vegetais, proteínas (carnes, ovos, leguminosas) |
| 8–12 meses | Alimentos da família adaptados em textura |
| > 12 meses | Dieta da família, sem restrições desnecessárias |

**Pontos-chave da alimentação complementar:**
- Iniciar alimentos alergênicos (amendoim, ovo, glúten) precocemente (6–7 meses) reduz risco de alergia
- Evitar mel antes de 1 ano (risco de botulismo)
- Evitar açúcar e sal adicionados antes de 2 anos
- Leite de vaca integral somente após 12 meses

---

### Triagem Neonatal e Preventiva

| Triagem | Método | Prazo |
|---|---|---|
| Auditiva (TANU) | Emissões otoacústicas evocadas (EOAE) | Até 48h de vida; resultado em 1 mês |
| Visual (Reflexo Vermelho) | Oftalmoscópio direto | RN e toda consulta pediátrica |
| Metabólica ("Teste do Pezinho") | Coleta em papel filtro | 3–5 dias de vida |
| Cardíaca (Oximetria do RN) | Oxímetro em MSD + MIE | 24–48h de vida |
| Neurológica ("Teste da Orelhinha avançado") | AABR se EOAE alterado | Conforme resultado TANU |

---

### Caso Clínico

**Menino de 18 meses levado à consulta de rotina. Não fala nenhuma palavra, não aponta, não responde ao próprio nome, prefere brincar sozinho com objetos enfileirando-os repetidamente. Mãe relata que "às vezes parece não ouvir".**

- **Achados:** Ausência de palavras aos 16 meses + ausência de gestos aos 12 meses + comportamento repetitivo
- **Red flags presentes:** múltiplos sinais de alerta para Transtorno do Espectro Autista (TEA)
- **Conduta imediata:** Triagem auditiva formal (EOAE/AABR) para excluir hipoacusia + aplicar M-CHAT-R/F + encaminhar para neuropediatria e terapeuta ocupacional
- **Mensagem:** Atraso de linguagem + comportamento social atípico = sempre investigar TEA e hipoacusia`, ativo: true,
    },
    {
      titulo: 'Infecções Respiratórias na Infância',
      descricao: 'IVAS, crupe, bronquiolite por VRS, pneumonia pediátrica por faixa etária, coqueluche — diagnóstico, critérios de internação, antibioticoterapia e indicadores de gravidade. Base: OMS + SBP 2022.',
      disciplina: 'Pediatria', tema: 'Pneumologia Pediátrica', tipo: 'texto', nivel: 'intermediario',
      duracao: 46, ordem: 2, mes: 1, semana: 4,
      videoUrl: null,
      conteudo: `## Infecções Respiratórias na Infância

**Base:** OMS IMCI 2023 + SBP 2022 + MS Brasil — Manual de Vigilância Epidemiológica + NICE Bronchiolitis 2021

---

### 1. Infecções de Vias Aéreas Superiores (IVAS)

As IVAS representam a principal causa de consulta pediátrica (80% das infecções infantis). A diferenciação viral-bacteriana é essencial para evitar uso irracional de antibióticos.

| Diagnóstico | Agente Principal | Clínica Característica | Tratamento |
|---|---|---|---|
| Rinofaringite (resfriado comum) | Rinovírus, coronavírus | Coriza, congestão, febre baixa, < 10 dias | Suporte: hidratação, antipirético |
| Otite Média Aguda | S. pneumoniae, H. influenzae | Otalgia, febre, hiperemia de membrana timpânica | Amoxicilina 50 mg/kg/dia × 7–10 d (ou observação em > 2 anos sem gravidade) |
| Sinusite bacteriana aguda | S. pneumoniae, H. influenzae | Rinorreia purulenta ≥ 10 dias, piora após melhora ou grave | Amoxicilina 45–90 mg/kg/dia × 10–14 d |
| Faringoamigdalite estreptocócica | S. pyogenes (GAHB) | Exsudato tonsilar, febre alta, ausência de tosse, Escore Centor ≥ 3 | Amoxicilina 50 mg/kg/dia × 10 d (penicilina benzatina 1 dose) |
| Laringite/Crupe viral | Vírus parainfluenza 1 e 3 | Tosse ladrante, estridor inspiratório, rouquidão, pior à noite | Dexametasona 0,15–0,6 mg/kg VO/IM; adrenalina nebulizada em grave |

> Faringoamigdalite estreptocócica não tratada → risco de febre reumática (cardite). O rastreio com swab de garganta ou teste rápido antígeno está indicado antes de ATB nos maiores de 3 anos.

### 2. IVAS Graves: Epiglotite e Laringotraqueobronquite

**Epiglotite aguda:**
- Agente: Haemophilus influenzae tipo b (Hib) — rara pós-vacina; S. pyogenes, S. aureus em não-vacinados
- Clínica: início abrupto, toxemiante, disfagia intensa, sialorreia, posição em tripé, estridor inspiratório alto, voz "em batata quente"
- EMERGÊNCIA: não examinar a orofaringe sem suporte de via aérea disponível
- Tratamento: ceftriaxona 50 mg/kg/dia EV + garantir via aérea (intubação eletiva em UTI pediátrica)

**Laringotraqueobronquite (Crupe):**
- Escala de Westley para classificar gravidade: (estridor, retração, cianose, entrada de ar, nível de consciência)
- Leve (≤ 2 pts): dexametasona 0,15 mg/kg VO dose única, alta
- Moderada (3–7 pts): dexametasona 0,6 mg/kg IM + adrenalina nebulizada (0,5 mL/kg da solução 1:1000), observação 4 h
- Grave (≥ 8 pts): internação, suporte de via aérea, O₂ umidificado

### 3. Bronquiolite Viral Aguda (VRS)

**Epidemiologia:** VSR (vírus respiratório sincicial) causa 80% dos casos; pico de novembro a março no Brasil. Afeta lactentes < 2 anos; pico grave em < 6 meses.

**Fisiopatologia:** VSR infecta epitélio bronquiolar → edema, muco e debris obliteram pequenas vias aéreas → hiperinsuflação + atelectasias → hipóxia + aumento do trabalho respiratório.

**Indicadores de gravidade e critérios de internação:**

| Critério | Ambulatorial | Internação |
|---|---|---|
| SpO₂ (ar ambiente) | ≥ 94% | < 92% |
| Frequência respiratória | < 60 ipm | ≥ 60 ipm |
| Alimentação oral | > 50% do habitual | < 50% do habitual |
| Aparência geral | Alerta, ativo | Letárgico, cianótico |
| Apneia | Ausente | Presente |
| Prematuridade / cardiopatia | Sem risco adicional | Alto risco → internação profilática |

**Tratamento:**
- Exclusivamente de suporte: O₂ para SpO₂ ≥ 92%, hidratação (SNG ou EV se necessário), decúbito elevado
- NÃO usar: broncodilatadores (salbutamol), corticoides sistêmicos, antibióticos, adrenalina inalada (fora do contexto hospitalar de avaliação pontual)
- Palivizumabe: profilaxia para prematuros < 29 semanas ou cardiopatia congênita hemodinamicamente significativa — 15 mg/kg IM mensal na sazonalidade

> Adrenalina inalada pode reduzir hospitalização em curto prazo, mas SEM benefício em desfechos clínicos primários — seu uso rotineiro NÃO é recomendado pelo NICE/SBP.

### 4. Pneumonia Adquirida na Comunidade (PAC) Pediátrica

**Agentes por faixa etária e esquema antibiótico:**

| Faixa Etária | Agente Mais Provável | ATB 1ª Linha | Dose e Via |
|---|---|---|---|
| 0–28 dias (neonatal) | S. agalactiae, E. coli, Listeria, S. aureus | Ampicilina + gentamicina | Ampicilina 200 mg/kg/dia EV + gentamicina 5 mg/kg/dia EV |
| 1–3 meses | C. trachomatis (afebril, radiologia intersticial), vírus | Azitromicina | 10 mg/kg/dia VO × 5 dias |
| 3 meses – 5 anos | Vírus (50%), S. pneumoniae, H. influenzae | Amoxicilina | 50–90 mg/kg/dia VO ÷ 8/8 h × 7–10 d |
| > 5 anos | Mycoplasma pneumoniae (atípica), S. pneumoniae | Amoxicilina OU azitromicina | Amoxicilina 50 mg/kg/dia VO OU azitromicina 10 mg/kg/dia |
| PAC grave (qualquer idade) | Pneumococo, S. aureus, gram-negativos | Ampicilina EV OU ceftriaxona | Ceftriaxona 50–75 mg/kg/dia EV |

**Critérios de internação (OMS/SBP):**
- Idade < 2 meses
- SpO₂ < 92–94% (< 90% na altitude) ou cianose
- FR persistentemente elevada: > 70 ipm (< 1 ano), > 50 ipm (1–5 anos)
- Gemido expiratório, batimento de asa de nariz, tiragem subcostal grave
- Incapacidade de mamar/alimentar-se
- Comprometimento do nível de consciência
- Derrame pleural, pneumatocele, pneumotórax

**ARDS Pediátrico (PARDS):** PaO₂/FiO₂ ≤ 300 + infiltrado bilateral + sem cardiopatia. Ventilação protetora: volume corrente 5–8 mL/kg, PEEP otimizada, FiO₂ mínima.

### 5. Coqueluche (Bordetella pertussis)

**Epidemiologia:** Lactentes < 6 meses em maior risco de complicações graves (apneia, bradicardia, hipertensão pulmonar). Vacinação: DTP aos 2, 4, 6 meses; reforço 15 meses e 4–6 anos. dTpa na gestante (3º trimestre) protege o RN.

**Fases clínicas:**

| Fase | Duração | Clínica | Transmissibilidade |
|---|---|---|---|
| Catarral | 1–2 semanas | Coriza, febrícula, tosse leve | Máxima (confundida com IVAS) |
| Paroxística | 2–6 semanas | Paroxismos de tosse + "guincho" inspiratório + vômito pós-tosse | Moderada |
| Convalescência | 2–6 semanas | Redução gradual dos paroxismos | Baixa |

> Em lactentes pequenos (< 3 meses): a tosse típica pode ESTAR AUSENTE — apresentação frequente é APNEIA + cianose. Pensar em coqueluche em QUALQUER apneia em lactente não vacinado.

**Diagnóstico:** PCR nasofaringe (padrão ouro nas primeiras 3 semanas) ou cultura de Bordetella; sorologia IgA/IgG útil na fase tardia e em vacinados.

**Tratamento:**
- Azitromicina 10 mg/kg/dia (máx. 500 mg) VO × 5 dias — 1ª linha em < 1 mês (eritromicina associada à ESPH)
- Eritromicina 40–50 mg/kg/dia VO ÷ 6/6 h × 14 dias — alternativa
- Quimioprofilaxia: mesmo esquema para contatos domiciliares dentro de 21 dias
- Internação: lactentes < 3 meses, apneia, SpO₂ baixa, comprometimento clínico grave

### 6. Indicadores de Gravidade por Faixa Etária (OMS IMCI)

| Sinal de Perigo | < 2 meses | 2 meses – 5 anos |
|---|---|---|
| FR elevada (taquipneia) | ≥ 60 ipm | ≥ 50 ipm (2–12 m); ≥ 40 ipm (1–5 a) |
| Tiragem subcostal grave | Presente | Presente |
| Apneia | Qualquer episódio | — |
| Impossibilidade de mamar | Presente | — |
| Gemido | Presente | — |
| Convulsão febril | — | Presente |
| Incapacidade de beber | — | Presente |

### 7. Caso Clínico

**Enunciado:** Lactente de 7 meses, masculino, previamente hígido, internado com 3 dias de coriza progressiva para tosse intensa, sibilância expiratória e dificuldade respiratória. SpO₂ 91% em ar ambiente, FR 68 ipm, retrações intercostais e subcostais, não aceitou metade da última mamada. Rx tórax: hiperinsuflação bilateral, sem condensação. Irmão de 5 anos com "gripe" há 1 semana.

**Análise:**
- Diagnóstico: **Bronquiolite viral aguda grave** (VSR provável — epidemiologia + idade + clínica + radiologia)
- Critérios de internação presentes: SpO₂ 91% (< 92%), FR 68 ipm (≥ 60), alimentação < 50%
- Manejo: internação + O₂ suplementar via cateter nasal para SpO₂ ≥ 92% + hidratação por SNG ou EV + monitorização cardiorrespiratória
- NÃO indicado: salbutamol, corticoide sistêmico, antibiótico (ausência de sinal bacteriano)
- Investigar coinfecção bacteriana se: febre persistente > 72 h, piora após melhora inicial, leucocitose > 15.000/mm³
- Alta: SpO₂ ≥ 92% estável em AA, FR < 60 ipm, ingestão oral ≥ 75% do habitual`, ativo: true,
    },
    {
      titulo: 'Neonatologia: RN de Risco',
      descricao: 'Prematuridade, RCIU, icterícia neonatal, hipoglicemia e sepse neonatal. Manejo na sala de parto e UTI Neonatal.',
      disciplina: 'Pediatria', tema: 'Neonatologia', tipo: 'texto', nivel: 'avancado',
      duracao: 126, ordem: 3, mes: 2, semana: 4,
      videoUrl: null, conteudo: `## Neonatologia: RN de Risco

**Base:** SBP — Manual de Neonatologia 2022 | ILCOR/AHA Neonatal Resuscitation Guidelines 2021 | AAP Neonatal Jaundice Guidelines | Bhutani VK 2004 | OMS 2022 | NNF India 2022

---

### 1. Classificação do Recém-Nascido — Idade Gestacional, Peso e Adequação

A classificação precisa do RN é o primeiro passo do cuidado neonatal estruturado, pois cada subcategoria implica riscos específicos e protocolos diferenciados de vigilância, rastreamento e intervenção.

**Classificação por Idade Gestacional:**

| Categoria | Idade Gestacional | Características e Riscos Principais |
|---|---|---|
| Prematuro extremo | Abaixo de 28 semanas | Pulmão imaturo grave (SDR intensa), HPIV frequente, sepse, ECN, retinopatia da prematuridade (ROP), sequelas neurológicas graves; mortalidade acima de 50% sem UTI especializada |
| Muito prematuro | 28 a 31 semanas + 6 dias | SDR moderada a grave, alto risco de HPIV, ECN, apneias da prematuridade; necessita de suporte intensivo prolongado |
| Prematuro moderado | 32 a 33 semanas + 6 dias | SDR moderada, risco intermediário de complicações; suporte em UTI por dias a semanas |
| Prematuro tardio | 34 a 36 semanas + 6 dias | Aparência enganosa de "quase a termo"; risco de hipoglicemia, hipotermia, dificuldade de sucção, icterícia e apneias; frequentemente subestimado |
| Termo | 37 a 41 semanas + 6 dias | Menor risco de complicações por imaturidade; riscos específicos dependem de comorbidades maternas e intraparto |
| Pós-termo | 42 semanas ou mais | Insuficiência placentária, síndrome de aspiração de mecônio, hipoglicemia, policitemia |

**Classificação por Peso ao Nascer:**

| Categoria | Peso | Implicações Clínicas |
|---|---|---|
| Extremo baixo peso ao nascer (EBPN) | Abaixo de 1.000 g | Risco máximo de todas as complicações neonatais; nutrição parenteral prolongada obrigatória |
| Muito baixo peso ao nascer (MBPN) | 1.000 a 1.499 g | Alto risco; UTI neonatal necessária; surfactante geralmente indicado |
| Baixo peso ao nascer (BPN) | 1.500 a 2.499 g | Risco intermediário; vigilância rigorosa; cuidado canguru quando estável |
| Peso normal | 2.500 a 3.999 g | Risco de base; complicações dependem da IG e comorbidades |
| Macrossomia | 4.000 g ou mais | Associado a DM materno; risco de hipoglicemia, distocia de ombro, lesão de plexo braquial |

**Classificação por Adequação Peso-Idade Gestacional (curvas de Fenton ou INTERGROWTH-21st):**
- PIG (Pequeno para a Idade Gestacional): peso abaixo do percentil 10 — risco aumentado de hipoglicemia neonatal, policitemia, hipotermia e, a longo prazo, síndrome metabólica
- AIG (Adequado para a Idade Gestacional): peso entre o percentil 10 e 90 — risco de base para a IG
- GIG (Grande para a Idade Gestacional): peso acima do percentil 90 — risco de hipoglicemia pós-natal, policitemia, hipocalcemia; frequentemente filho de mãe diabética

> O PIG simétrico (cabeça e corpo proporcionalmente pequenos) reflete agressão precoce ao desenvolvimento fetal (antes de 20 semanas) — infecções congênitas, cromossomopatias. O PIG assimétrico (perímetro cefálico poupado, abdome reduzido) reflete restrição tardia — insuficiência uteroplacentária, HAS materna. O prognóstico neurológico é melhor no PIG assimétrico.

---

### 2. Escore APGAR — Avaliação e Interpretação

O escore de APGAR, descrito por Virginia Apgar em 1953, avalia a vitalidade do RN ao nascimento e a resposta às manobras de reanimação. Não deve guiar o início da reanimação — essa decisão é baseada na avaliação dos 30 segundos iniciais (prematuro? tônus? respira ou chora?).

| Sinal Clínico | Pontuação 0 | Pontuação 1 | Pontuação 2 |
|---|---|---|---|
| Frequência Cardíaca | Ausente — sem batimentos | Abaixo de 100 bpm | 100 bpm ou mais |
| Esforço Respiratório | Ausente — apneia | Irregular, fraco, gemido | Regular, choro vigoroso |
| Tônus Muscular | Flácido, sem tônus | Alguma flexão de extremidades | Flexão ativa, movimentos espontâneos |
| Irritabilidade Reflexa (aspiração) | Sem resposta à estimulação | Careta, movimento mínimo | Tosse, espirro, choro |
| Cor da Pele | Cianose generalizada ou palidez | Cianose acrocianótica (extremidades azuis, tronco rosado) | Completamente rosado |

**Interpretação e aplicação clínica:**
- APGAR 8 a 10: vitalidade ótima — cuidados de rotina
- APGAR 4 a 7: depressão moderada — estimulação e VPP se não melhora
- APGAR 0 a 3: depressão grave — reanimação plena imediata
- APGAR no 1° minuto: reflete condição ao nascimento e necessidade de reanimação
- APGAR no 5° minuto: valor prognóstico neurológico mais relevante
- APGAR no 10° minuto: se ainda baixo (abaixo de 5), considerar prognóstico reservado e possível encefalopatia hipóxico-isquêmica; discussão sobre limite de suporte

> O APGAR NÃO é usado para decidir se iniciar a reanimação — essa decisão ocorre nos primeiros 30 segundos pela avaliação de três perguntas: o RN nasceu prematuro? Tem tônus muscular? Está respirando ou chorando? Se a resposta for não a qualquer uma, iniciar reanimação imediatamente.

---

### 3. Reanimação Neonatal — Algoritmo ILCOR 2021 Completo

A reanimação neonatal segue um algoritmo estruturado baseado na avaliação seriada da frequência cardíaca, que é o principal parâmetro de resposta à reanimação. A oximetria de pulso pré-ductal (MSD) e a capnografia são ferramentas complementares.

**Avaliação inicial (primeiros 30 segundos — decisão antecipada ainda no pré-natal):**
1. RN nasceu prematuro (abaixo de 34 semanas)?
2. Tem tônus muscular presente?
3. Está respirando ou chorando?

Se SIM a todas: cuidados de rotina com a mãe (pele a pele, calor, secar, estimular, amamentar).
Se NÃO a qualquer uma: levar ao berço aquecido, iniciar passos iniciais e avaliar.

**Passos iniciais — 0 a 30 segundos:**
- Prover calor (berço aquecido ou saco plástico em prematuros abaixo de 28 semanas)
- Posicionar em posição de olfato (extensão leve do pescoço para alinhar a via aérea)
- Aspirar — somente se obstrução visível; NÃO aspirar rotineiramente
- Secar e estimular com fricção suave do dorso
- Avaliar tônus e resposta

**Avaliação e VPP — 30 a 60 segundos:**
Avaliar FC (foco principal) + esforço respiratório + cor.
- Se FC acima de 100 bpm e respirando: cuidados de rotina com monitoração
- Se FC abaixo de 100 bpm OU apneia OU respiração irregular: iniciar VPP

VPP com máscara facial:
- Frequência: 40 a 60 ventilações por minuto
- Pressão: 20 a 25 cmH2O nas primeiras ventilações; manter 15 a 20 cmH2O
- FiO2 inicial: 21% (ar ambiente) em RN a termo; 21 a 30% em prematuros abaixo de 35 semanas
- Titular O2 pela oximetria pré-ductal — metas de SpO2 por minuto de vida

| Minuto de Vida | SpO2 Alvo Pré-ductal (MSD) |
|---|---|
| 1 minuto | 60–65% |
| 2 minutos | 65–70% |
| 3 minutos | 70–75% |
| 4 minutos | 75–80% |
| 5 minutos | 80–85% |
| 10 minutos | 85–95% |

**FC abaixo de 60 após 30 segundos de VPP eficaz — MCE + Intubação:**
- Iniciar massagem cardíaca externa: relação 3:1 (3 compressões + 1 ventilação = 90 compressões + 30 ventilações por minuto)
- Intubação orotraqueal: confirmar posição por capnografia e ausculta simétrica
- Aumentar FiO2 para 100% durante MCE
- Acesso venoso umbilical

**FC abaixo de 60 após MCE — Medicamentos:**
- Adrenalina EV ou intraóssea: 0,01 a 0,03 mg/kg (solução 1:10.000) a cada 3 a 5 minutos
- Adrenalina endotraqueal: 0,05 a 0,10 mg/kg (absorção irregular — preferir via EV/IO quando possível)
- Expansor de volume se suspeita de hipovolemia: SF 0,9% 10 mL/kg EV em 5 a 10 minutos

**Mecônio — Conduta Atual (ILCOR 2021):**
- NÃO aspirar rotineiramente ao nascer, mesmo com líquido meconial espesso
- Se RN sem vitalidade (apneia, FC baixa, sem tônus): intubação e aspiração endotraqueal antes do VPP
- Iniciar VPP imediatamente se criança com líquido meconial + deprimida — não retardar por tentativa de aspiração

**Quando interromper a reanimação:**
- Se FC ausente por mais de 10 minutos a despeito de reanimação completa e adequada: discutir interrupção com família e equipe
- APGAR abaixo de 3 no 10° minuto + ausência de sinais de vida: prognóstico neurológico muito reservado

> A frequência cardíaca é o principal parâmetro de resposta durante a reanimação neonatal. A cada etapa — passos iniciais, VPP, MCE, adrenalina — a avaliação da FC guia a progressão ou o retrocesso no algoritmo. O monitor cardíaco ou o oxímetro pré-ductal são mais precisos que a ausculta.

---

### 4. Síndrome do Desconforto Respiratório — Doença da Membrana Hialina

**Fisiopatologia:** A SDR resulta do déficit de surfactante pulmonar, produzido pelos pneumócitos tipo II a partir de 34 a 36 semanas de gestação. O surfactante reduz a tensão superficial alveolar, impedindo o colapso ao final da expiração. Sem surfactante, os alvéolos colapsam progressivamente a cada expiração — é necessária pressão crescente para reabri-los a cada inspiração, gerando fadiga respiratória. A razão lecitina/esfingomielina (L/S) abaixo de 2 no líquido amniótico confirma imaturidade pulmonar. O corticoide antenatal acelera a maturação dos pneumócitos tipo II em 24 a 48 horas.

**Apresentação Clínica:** Início nas primeiras 4 a 6 horas de vida em prematuro, com taquipneia (FR acima de 60), gemido expiratório (tentativa de manter PEEP intrínseca), retração intercostal e subcostal, batimento de asa de nariz, cianose progressiva.

**Diagnóstico por Imagem:** Radiografia de tórax com padrão reticulogranular difuso (aspecto de vidro fosco ou "vidro moído") + broncograma aéreo bilateral — resultado do ar nas vias aéreas contrastando com os alvéolos colapsados e preenchidos por proteínas.

**Tratamento Escalonado:**
- CPAP nasal precoce desde a sala de parto: pressão de 5 a 7 cmH2O — reduz necessidade de intubação e surfactante
- Surfactante exógeno: beractanto (Survanta) 100 mg/kg/dose ou poractanto alfa (Curosurf) 100 a 200 mg/kg/dose
- Estratégia INSURE (Intubação–Surfactante–Extubação para CPAP): intubação breve para instilação do surfactante, extubação imediata para CPAP
- Estratégia LISA/MIST (Less Invasive Surfactant Administration): instilação de surfactante via sonda fina sem intubação, mantendo respiração espontânea — reduz displasia broncopulmonar
- Indicação de surfactante: FiO2 acima de 0,30 para SpO2-alvo com CPAP; ou FiO2 acima de 0,40 em qualquer momento
- Corticoide antenatal (betametasona 12 mg IM duas doses com 24 horas de intervalo, entre 24 e 34 semanas): reduz incidência de SDR em 50% e mortalidade neonatal em 30%

> O CPAP nasal precoce desde a sala de parto — antes de qualquer sinal de SDR — é a intervenção mais custo-efetiva em prematuros abaixo de 30 semanas. Reduz necessidade de intubação em 30 a 40% e displasia broncopulmonar em prematuros extremos.

---

### 5. Icterícia Neonatal — Fisiopatologia, Nomograma de Bhutani e Tratamento

**Fisiopatologia:** A bilirrubina neonatal é produzida em excesso pela hemólise fisiológica das hemácias fetais (vida média de 70 a 90 dias versus 120 dias no adulto), enquanto a conjugação hepática é imatura nas primeiras semanas. A bilirrubina indireta (não conjugada) atravessa a barreira hematoencefálica e é neurotóxica em altas concentrações — acumula-se nos gânglios da base, cerebelo e tronco cerebral, causando kernicterus (encefalopatia bilirrubínica crônica) com sequelas permanentes: coreoatetose, surdez neurossensorial, paralisia do olhar para cima.

**Icterícia Fisiológica vs Patológica:**

| Característica | Fisiológica | Patológica |
|---|---|---|
| Início | Após 24 horas de vida | Antes de 24 horas de vida |
| Duração | Termo: até 7 a 10 dias; Pré-termo: até 14 a 21 dias | Prolongada — acima de 2 semanas em termos ou 3 semanas em prematuros |
| Causa principal | Imaturidade da conjugação hepática + hemólise fisiológica | Hemólise patológica (incompatibilidade ABO, Rh), Crigler-Najjar, hipotireoidismo, infecção |
| Velocidade de elevação | Gradual, abaixo de 5 mg/dL por dia | Rápida, acima de 5 mg/dL por dia ou acima de 0,5 mg/dL por hora |
| Conduta | Amamentação frequente, monitoração | Investigação, fototerapia, exsanguíneotransfusão |

**Escala de Kramer — Progressão Cefalocaudal:**
- Zona 1 (cabeça e pescoço): bilirrubina total estimada de 4 a 8 mg/dL
- Zona 2 (tronco superior): 5 a 12 mg/dL
- Zona 3 (abdome inferior ao umbigo): 8 a 16 mg/dL
- Zona 4 (membros superiores e inferiores até joelhos): 11 a 18 mg/dL
- Zona 5 (palmas e plantas): acima de 15 mg/dL — risco alto de kernicterus

**Nomograma de Bhutani:** O nível de bilirrubina total deve ser interpretado em função das horas de vida do RN (não da idade em dias). O nomograma de Bhutani classifica o risco em zonas: zona de alto risco (acima do percentil 95), zona de risco intermediário alto, zona de risco intermediário baixo e zona de baixo risco (abaixo do percentil 40). A indicação de fototerapia e exsanguíneotransfusão depende da zona, das horas de vida e dos fatores de risco adicionais (prematuridade, hemólise, sepse, acidose).

**Doença Hemolítica do RN:**
- Incompatibilidade Rh: mãe Rh negativo com anticorpos anti-D; hemólise grave, hidropsia fetal, anemia intensa; prevenção com imunoglobulina anti-D na mãe em 28 semanas e após parto; tratamento: fototerapia intensiva + exsanguíneotransfusão se necessário
- Incompatibilidade ABO: mãe grupo O, RN grupo A ou B; hemólise moderada; teste de Coombs direto positivo; mais comum que Rh, raramente requer exsanguíneotransfusão

**Tratamento:**
- Fototerapia: luz azul de 430 a 490 nm converte bilirrubina em fotoisômeros solúveis excretados sem conjugação hepática; eficácia depende da irradiância (maior que 30 mcW/cm2/nm para fototerapia intensiva); máxima exposição de superfície corporal; manter hidratação
- Exsanguíneotransfusão: se bilirrubina total na zona de alto risco do nomograma (ou ≥ 25 mg/dL em termos), falha da fototerapia, sinais neurológicos precoces; troca de 2 volemias (160 mL/kg) com sangue compatível

> A icterícia que se inicia antes de 24 horas de vida é sempre patológica e requer investigação imediata. Recém-nascidos com icterícia precoce + anemia + reticulocitose têm hemólise até prova em contrário.

---

### 6. Hipoglicemia Neonatal — Grupos de Risco, Diagnóstico e Protocolo

**Definição:** Glicemia abaixo de 45 mg/dL nas primeiras 48 horas de vida em qualquer RN (abaixo de 40 mg/dL segundo alguns centros); a partir de 48 horas, aplicar o critério do adulto de abaixo de 50 a 60 mg/dL com sintomas.

**Grupos de Alto Risco:**

| Grupo de Risco | Mecanismo | Momento de Triagem |
|---|---|---|
| RN PIG (restrição de crescimento) | Reservas de glicogênio e gordura reduzidas; hiperinsulinemia relativa | A cada 1 a 2 horas nas primeiras 6 horas |
| RN GIG e filho de mãe diabética | Hiperinsulinismo fetal por hiperglicemia materna crônica; queda abrupta da glicose após corte do cordão | A cada 1 hora nas primeiras 3 horas |
| Prematuro tardio (34 a 36 semanas) | Imaturidade da gliconeogênese e das reservas | A cada 1 a 2 horas nas primeiras 6 horas |
| Prematuro extremo abaixo de 28 semanas | Sem reservas; NPT desde o nascimento necessária | Monitoração contínua com glicofita horária |
| RN com asfixia perinatal | Depleção de glicogênio pelo esforço + hiperinsulinismo transitório | A cada 1 hora nas primeiras 12 horas |

**Sintomas de hipoglicemia neonatal:** tremores, irritabilidade, choro agudo, hipotonismo, apneia, cianose, convulsão, letargia. Atenção: muitos RN com hipoglicemia são assintomáticos — triagem ativa é obrigatória nos grupos de risco.

**Protocolo de Tratamento:**
- Glicemia acima de 45 mg/dL: amamentação a cada 2 a 3 horas, monitorar
- Glicemia 25 a 44 mg/dL assintomático: amamentação ou complemento oral imediato (10 mL/kg de leite) + reavaliação em 30 minutos
- Glicemia abaixo de 25 mg/dL ou sintomático: dextrose 10% 2 mL/kg EV em bolus (200 mg/kg) + manutenção com infusão de glicose a 4 a 6 mg/kg/min; aumentar progressivamente se persistência
- Hipoglicemia refratária: investigar hiperinsulinismo congênito (insulinoma, nesidioblastose), erro inato do metabolismo; diazóxido como tratamento específico do hiperinsulinismo

---

### 7. Sepse Neonatal — Precoce, Tardia e Antibioticoterapia

| Parâmetro | Sepse Precoce (abaixo de 72 horas) | Sepse Tardia (acima de 72 horas) |
|---|---|---|
| Agentes etiológicos principais | Streptococcus agalactiae (GBS — Grupo B), Escherichia coli, Listeria monocytogenes, Klebsiella pneumoniae | Staphylococcus coagulase-negativo (epidermidis), Klebsiella, Pseudomonas, Candida albicans em prematuros |
| Fatores de risco maternos | Ruptura de membranas acima de 18 horas, febre materna intraparto, corioamnionite, colonização por GBS sem profilaxia | Cateter venoso central, ventilação mecânica prolongada, prematuridade extrema, nutrição parenteral |
| Apresentação clínica | Instabilidade térmica, apneia, letargia, dificuldade alimentar, distensão abdominal, hipoglicemia | Piora do estado geral, intolerância alimentar, distensão abdominal, apneia de novo, instabilidade hemodinâmica |
| Exames complementares | Hemocultura (2 amostras), hemograma com diferencial, PCR, procalcitonina, gasometria, líquor se estável | Hemocultura central e periférica, hemograma, PCR, IL-6, líquor, cultura de ponta de cateter se retirado |
| Antibiótico empírico inicial | Ampicilina 200 mg/kg/dia EV dividido a cada 6 ou 8 horas + Gentamicina 5 mg/kg/dose a cada 24 a 48 horas conforme IG | Vancomicina 10 a 15 mg/kg/dose a cada 6 a 12 horas (conforme IG e peso) + Amicacina 15 mg/kg/dia ou Gentamicina |
| Duração do tratamento | 7 a 14 dias conforme foco e agente | 14 a 21 dias; 4 semanas em meningite por gram-negativo |

**Sepse Checklist — Abordagem Estruturada:**
1. Coletar culturas (hemograma, hemocultura x2, PCR, procalcitonina, líquor se clínica e estabilidade permitirem) ANTES do antibiótico
2. Iniciar antibiótico empírico em até 1 hora do diagnóstico de sepse suspeita
3. Reavaliar antibiótico com o resultado das culturas (de-escalada ou ajuste)
4. Monitorar função renal com gentamicina e amicacina (nefrotóxicos)
5. Critério de alta: hemoculturas negativas após 48 a 72 horas + PCR em queda + clinicamente estável

> A procalcitonina tem melhor especificidade que a PCR para sepse neonatal nas primeiras 24 horas. Valores acima de 10 ng/mL nas primeiras 24 a 48 horas de vida são altamente sugestivos de sepse bacteriana. Entretanto, a hemocultura é o padrão-ouro — iniciar antibiótico após coleta, não aguardar resultado.

---

### 8. Enterocolite Necrosante — Estadiamento e Manejo

A enterocolite necrosante (ECN) é a emergência gastrintestinal mais comum e grave do prematuro, com mortalidade de 10 a 30% e sequelas como síndrome do intestino curto em sobreviventes de formas graves. Incidência inversamente proporcional à IG — prematuros abaixo de 28 semanas têm incidência de até 10%.

**Fisiopatologia:** Imaturidade intestinal + colonização bacteriana anormal + isquemia intestinal relativa → translocação bacteriana, inflamação e necrose da parede intestinal.

**Estadiamento de Bell (modificado):**

| Estágio | Critérios | Tratamento |
|---|---|---|
| I — Suspeita | Sinais sistêmicos inespecíficos + distensão abdominal + sangue nas fezes | Jejum oral 24 a 48 horas; ampicilina + gentamicina; monitoração com RX de 8 em 8 horas |
| II A — ECN definitiva leve | Acima + pneumatose intestinal no RX | Jejum 7 a 10 dias; ampicilina + gentamicina + metronidazol; suporte hemodinâmico |
| II B — ECN definitiva moderada | Acima + acidose metabólica + trombocitopenia | Jejum 14 dias; antibióticos; transfusão se necessário |
| III A — ECN avançada com intestino viável | Acima + deterioração clínica acentuada + ascite | UTI; suporte máximo; cirurgia em 12 a 24 horas se sem melhora |
| III B — ECN avançada com perfuração | Pneumoperitônio no RX | Cirurgia de emergência: estomia de derivação + ressecção do segmento necrótico |

---

### 9. Hemorragia Peri-Intraventricular — Classificação e Prevenção

A hemorragia peri-intraventricular (HPIV) é a complicação neurológica mais frequente do prematuro extremo, ocorrendo em 15 a 25% dos prematuros abaixo de 32 semanas e em até 45% dos abaixo de 28 semanas, principalmente nos primeiros 3 a 5 dias de vida.

**Fisiopatologia:** A matriz germinativa subependimária é altamente vascularizada e friável até 34 semanas. Flutuações da pressão sanguínea cerebral (hipotensão/hipertensão) rompem esses vasos imaturos. Fatores desencadeantes: asfixia perinatal, SDR grave, hipertensão arterial, pneumotórax, convulsões.

**Classificação de Papile (USG transfontanela):**

| Grau | Descrição | Prognóstico Neurológico |
|---|---|---|
| I | Hemorragia subependimária isolada na matriz germinativa | Bom — sequela neurológica em menos de 10% |
| II | Hemorragia intraventricular sem dilatação do sistema ventricular | Bom a intermediário — sequela em 15 a 25% |
| III | Hemorragia intraventricular com dilatação ventricular progressiva | Reservado — hidrocefalia pós-hemorrágica em 50%; sequelas em 35 a 50% |
| IV | Hemorragia intraparenquimatosa (infarto hemorrágico periventricular) | Grave — sequelas neurológicas em mais de 80%; paralisia cerebral, déficit cognitivo, epilepsia |

**Diagnóstico:** USG transfontanela realizado rotineiramente em todos os prematuros abaixo de 32 semanas — primeira triagem entre 3 e 7 dias de vida; repetir com 1 mês e ao completar 36 semanas de idade corrigida.

**Prevenção — Evidência A:**
- Corticoide antenatal (betametasona) reduz HPIV em 50%
- Parto em centro terciário com UTI neonatal — transporte in utero reduz mortalidade
- Vitamina K ao nascer — previne doença hemorrágica do RN
- Indometacina profilática (0,1 mg/kg EV) nas primeiras 6 a 12 horas: reduz HPIV graus III e IV em prematuros extremos (ainda controverso em algumas diretrizes)
- Evitar hipotensão e flutuações hemodinâmicas: transfusão de hemácias se Ht abaixo de 30 em prematuros sintomáticos; dopamina se PAM abaixo de IG em semanas

---

### 10. Anomalias Congênitas Neonatais — Emergências e Manejo Inicial

**Hérnia Diafragmática Congênita (HDC):**
- Herniação de vísceras abdominais para o tórax por defeito do diafragma (esquerdo em 85%) → hipoplasia pulmonar + hipertensão pulmonar
- Diagnóstico pré-natal por ECO fetal (70% dos casos); pós-natal: dispneia grave + abdome escavado + sons intestinais no tórax
- Manejo: intubação imediata (NÃO usar máscara facial — risco de distensão gástrica e compressão pulmonar), sonda orogástrica aberta, ventilação suave, óxido nítrico inalatório se hipertensão pulmonar grave; cirurgia eletiva após estabilização
- Mortalidade: 20 a 30% nos centros especializados; acima de 50% se hipertensão pulmonar grave

**Atresia de Esôfago (AE) com Fístula Traqueoesofágica:**
- Tipo mais comum (85%): AE + fístula traqueoesofágica distal
- Diagnóstico: hipersalivação no nascimento + incapacidade de passar sonda gástrica + pneumonia aspirativa; confirmar com RX (sonda enrolada em bolsa esofágica cega)
- Manejo pré-cirúrgico: posição semisentada, sonda de Replogle aberta para aspiração contínua da bolsa esofágica, NPO absoluta, antibióticos profiláticos
- Cirurgia: anastomose esofagiana primária; fístula ligada; primeiras 24 a 48 horas de vida

**Gastrosquise vs Onfalocele:**

| Característica | Gastrosquise | Onfalocele |
|---|---|---|
| Localização do defeito | Para-umbilical direito — sem cobertura peritoneal | Na base do cordão umbilical — coberta por saco peritoneal |
| Vísceras expostas | Intestinos eviscerados diretamente no líquido amniótico | Intestinos e fígado cobertos por membrana |
| Anomalias associadas | Raras (isolada) — atresia intestinal é a complicação mais comum | Frequentes (50%) — cromossomopatias, cardiopatias, síndrome de Beckwith-Wiedemann |
| Manejo imediato | Envolver em compressas mornas + saco plástico estéril; NPO; acesso venoso; cirurgia em 6 horas | Proteger o saco; não romper; cirurgia eletiva ou escalonada |
| Prognóstico geral | Bom — mortalidade abaixo de 5% nos centros especializados | Variável conforme anomalias associadas |

---

### 11. Caso Clínico — Prematuro de 30 Semanas com SDR e Icterícia Neonatal

**Cenário:** RN masculino, 30 semanas de idade gestacional, nascido por cesárea de emergência por descolamento prematuro de placenta. Peso: 1.180 g. Comprimento: 38 cm. PC: 28 cm. APGAR 5 no 1° minuto e 7 no 5° minuto.

**Sala de parto (0 a 10 minutos):**
Ao nascimento: tônus reduzido, respiração irregular e gemido. SpO2 pré-ductal 68% em ar ambiente. Iniciado CPAP nasal com FiO2 30% e pressão de 6 cmH2O. Após 3 minutos: SpO2 79%, FC 130 bpm. Progressão adequada — sem necessidade de VPP.

**Avaliação aos 30 minutos de vida:**
Gemido persistente, retrações subcostais e intercostais, FR 72 ipm, SpO2 83% com CPAP FiO2 35%. RX de tórax: padrão reticulogranular difuso bilateral com broncograma aéreo.

**Diagnóstico e conduta para SDR:**
- Diagnóstico confirmado: SDR grau III (Doença da Membrana Hialina) em prematuro extremo
- Administrar surfactante: estratégia LISA — poractanto alfa 200 mg/kg via sonda fina sem intubação, mantendo CPAP
- Corticoide antenatal: verificar se a mãe recebeu betametasona (se não, impossível aplicar retroativamente — registrar ausência)
- Monitoração: gasometria arterial em 1 hora, SpO2 contínua, RX de controle em 12 horas

**No 3° dia de vida:** Evolução favorável na SDR, desmamando FiO2 para 25%. Exame físico: icterícia até membros inferiores (Zona 4 de Kramer). Hemograma: Hb 14 g/dL, reticulócitos 4%, grupo sanguíneo O+, Coombs direto negativo. Bilirrubina total: 14,8 mg/dL com 72 horas de vida. Fototerapia iniciada conforme nomograma de Bhutani — zona de alto risco intermediário para prematuro tardio.

**No 5° dia:** Apneia recorrente (5 episódios de apneia com duração acima de 20 segundos). Exames: PCR 18 mg/L, procalcitonina 8,2 ng/mL, leucocitose com desvio à esquerda. Hemoculturas coletadas.

**Diagnóstico e conduta para sepse tardia suspeita:**
- Diagnóstico: sepse tardia por cateter venoso central (umbilical em uso desde o nascimento)
- Iniciar vancomicina 15 mg/kg/dose a cada 12 horas + amicacina 15 mg/kg/dia
- Aguardar hemocultura para ajuste; se gram-negativo: manter amicacina; se MRSA: vancomicina exclusiva
- Cafeína citrato: 20 mg/kg de ataque EV + manutenção de 5 mg/kg/dia para apneia da prematuridade
- USG transfontanela: HPIV grau I bilateral — monitorar; repetir em 1 semana

**Rastreamentos obrigatórios para prematuro de 30 semanas:**
- Triagem metabólica neonatal (teste do pezinho) entre 48 e 72 horas de vida
- Triagem auditiva (PEATE) antes da alta
- Avaliação oftalmológica para ROP (retinopatia da prematuridade) com 4 a 6 semanas de vida ou 31 a 33 semanas de idade corrigida
- USG transfontanela seriada (3 a 7 dias, 1 mês e 36 semanas de IC) para HPIV e leucomalácia

> O prematuro de 30 semanas condensa quase todos os desafios da neonatologia em um único paciente: SDR, apneia, icterícia, risco de sepse, HPIV e ROP. O cuidado centrado na família, a prevenção de infecção relacionada ao cateter e a retirada precoce de dispositivos invasivos são as medidas que mais impactam o prognóstico a longo prazo.

---

### Referências
- Sociedade Brasileira de Pediatria. Manual de Neonatologia. 3ª ed. 2022.
- Wyckoff MH et al. 2021 International Consensus on Cardiopulmonary Resuscitation and Emergency Cardiovascular Care Science with Treatment Recommendations. Circulation. 2021;144(suppl 1):S366–S454.
- Bhutani VK et al. Noninvasive measurement of total serum bilirubin in a multiracial predischarge newborn population to assess the risk of severe neonatal hyperbilirubinemia. Pediatrics. 2000;106(2):e17.
- Sweet DG et al. European Consensus Guidelines on the Management of Respiratory Distress Syndrome — 2022 Update. Neonatology. 2023;120(1):3–23.
- Bell MJ. Neonatal necrotizing enterocolitis. N Engl J Med. 1978;298:281–287.`, ativo: true,
    },
    {
      titulo: 'Doenças Exantemáticas',
      descricao: 'Sarampo, rubéola, varicela, escarlatina, doença de Kawasaki. Diagnóstico diferencial e complicações.',
      disciplina: 'Pediatria', tema: 'Infectologia Pediátrica', tipo: 'texto', nivel: 'intermediario',
      duracao: 34, ordem: 4, mes: 3, semana: 3,
      videoUrl: null, conteudo: `## Doenças Exantemáticas

**Base:** SBP — Infectologia Pediátrica 2022 | Red Book AAP 2021 | PAHO — Eliminação do Sarampo e da Rubéola

---

### Visão Geral Comparativa

| Doença | Agente | Incubação | Exantema | Enantema | Notificação |
|---|---|---|---|---|---|
| Sarampo | Paramyxovírus (RNA) | 10–14 dias | Máculo-papular, craniocaudal, confluente | Manchas de Koplik (patognomônico) | **Imediata** (SINAN) |
| Rubéola | Togavírus (RNA) | 14–21 dias | Róseo, maculopapular, craniocaudal, não confluente | Manchas de Forchheimer | **Imediata** (SINAN) |
| Varicela | VZV (Herpesviridae) | 14–21 dias | Polimórfico em ondas: mácula → pápula → vesícula → crosta | Vesículas em mucosa oral | Compulsória (alguns estados) |
| Roséola (Exantema Súbito) | HHV-6 (raramente HHV-7) | 9–10 dias | Róseo, maculopapular, tronco → periferia, surge após febre ceder | Ausente | Não obrigatória |
| Escarlatina | Streptococcus pyogenes (SBHGA) | 2–5 dias | Micropapular ("lixa"), início perioral/axilares, poupa região perioral (sinal de Filatov) | Língua "em morango" | Não compulsória |
| Eritema Infeccioso (5ª doença) | Parvovírus B19 | 13–18 dias | Fase 1: bochechas avermelhadas ("tapa na face"); Fase 2: rendilhado em tronco | Ausente | Não compulsória |
| Doença de Kawasaki | Etiologia indefinida (imune) | — | Polimórfico (maculopapular, urticariforme) | Eritema/fissura labial, língua morango | Não compulsória |

---

### Sarampo — Detalhes

**Clínica:** Pródromo 3–4 dias (3C: coriza, conjuntivite, tosse) → manchas de Koplik (pontos branco-azulados em mucosa jugal, 1–2 dias antes do exantema) → exantema máculo-papular craniocaudal.

**Complicações:** Pneumonia viral/bacteriana (principal causa de morte), otite média, diarreia, encefalite pós-sarampo (1:1.000), PESS (panencefalite esclerosante subaguda, tardio).

**Transmissão:** Via aérea; alta contagiosidade (R₀ = 12–18). Contagioso de 4 dias antes a 4 dias após o início do exantema.

**Conduta:** Suporte + vitamina A (< 2 anos ou malnutridos): 200.000 UI/dia por 2 dias. Notificação imediata.

> **Vacinação pós-exposição:** Vacina tríplice viral até 72h do contato em suscetíveis. Imunoglobulina humana até 6 dias (gestantes, imunossuprimidos, < 6 meses).

---

### Rubéola — Detalhes

**Clínica:** Linfadenopatia retroauricular/suboccipital (precede exantema em 5–10 dias) → exantema róseo, mais suave que sarampo, dura 3 dias.

**Síndrome da Rubéola Congênita (SRC):** Infecção materna no 1º trimestre → tríade: catarata, surdez neurossensorial, cardiopatia congênita (PCA, CIV). Risco: 85% no 1º mês, cai progressivamente após 16 semanas.

---

### Varicela — Detalhes

**Diagnóstico clínico:** Lesões polimórficas em diferentes estágios na mesma área de pele (mácula → pápula → vesícula transparente "gota de orvalho" → crosta). Distribuição centrípeta. Prurido intenso.

**Complicações:** Infecção bacteriana secundária (S. aureus, SBHGA), pneumonia varicelosa (adultos), encefalite cerebelosa, síndrome de Reye (AAS + varicela → evitar).

**Tratamento:** Sintomático. Aciclovir indicado em: > 12 anos, imunossuprimidos, gestantes, RN, formas graves.

> **Herpes-zóster:** Reativação do VZV em dermátomo, mais comum em idosos e imunossuprimidos. Tratamento com aciclovir/valaciclovir precoce (< 72h do início das lesões).

---

### Escarlatina — Detalhes

**Clínica:** Faringoamigdalite pultácea (dor de garganta, febre alta) → exantema micropapular eritematoso (sensação de lixa), início na região inguinal/axilar e periflexural → generaliza em 24h. Sinal de Pastia (eritema em pregas). Sinal de Filatov (palidez perioral). Descamação palmoplantar ao final.

**Tratamento:** Penicilina V oral 10 dias (ou amoxicilina 50 mg/kg/dia). Objetivo: prevenir febre reumática aguda (intervalo de 9 dias entre infecção e profilaxia).

---

### Doença de Kawasaki — Detalhes

**Critério diagnóstico (clássico):** Febre ≥ 5 dias + 4 de 5 critérios:
1. Exantema polimorfo
2. Conjuntivite bilateral não purulenta
3. Eritema/fissura labial, língua em morango, eritema de mucosa oral
4. Eritema/edema de palmas e plantas (descamação periungueal na fase subaguda)
5. Linfadenopatia cervical unilateral > 1,5 cm

**Complicação grave:** Aneurisma de artérias coronárias (15–25% sem tratamento → risco de IAM).

**Tratamento:** IVIG 2 g/kg IV em dose única + AAS 30–50 mg/kg/dia (até febre ceder) → AAS 3–5 mg/kg/dia por 6–8 semanas.

---

### Eritema Infeccioso (5ª Doença) — Detalhes

**Populações especiais:**
- **Crise aplásica transitória:** Pacientes com hemólise crônica (anemia falciforme, esferocitose) → aplasia medular grave (parvovírus B19 infecta precursores eritroides)
- **Hidropsia fetal:** Infecção materna no 2º trimestre → anemia fetal grave → hidropsia (monitorar com Doppler da ACM fetal)
- **Artropatia:** Adultos (mulheres) → artrite simétrica de pequenas articulações

---

### Caso Clínico

**Criança de 18 meses, não vacinada, com febre há 4 dias (39,5°C), coriza, tosse intensa, olhos vermelhos com lacrimejamento. Hoje surgiu exantema avermelhado no rosto que está se espalhando para o tronco. Ao exame: pequenas manchas brancas na mucosa jugal.**

- **Diagnóstico:** Sarampo (manchas de Koplik + exantema craniocaudal em criança não vacinada)
- **Conduta:** Notificação compulsória imediata ao SINAN + isolamento respiratório por 4 dias após início do exantema
- **Vitamina A:** 100.000 UI/dia × 2 dias (< 6 meses) ou 200.000 UI/dia × 2 dias (> 6 meses)
- **Busca ativa:** Identificar contatos suscetíveis — vacinar até 72h ou administrar Ig até 6 dias
- **Complicação a vigiar:** Pneumonia bacteriana secundária (causa mais comum de morte)`, ativo: true,
    },
    {
      titulo: 'Desnutrição e Distúrbios Nutricionais',
      descricao: 'Marasmo, kwashiorkor, hipovitaminoses, anemia ferropriva. Diagnóstico e tratamento em pediatria.',
      disciplina: 'Pediatria', tema: 'Nutrição Pediátrica', tipo: 'texto', nivel: 'basico',
      duracao: 28, ordem: 5, mes: 4, semana: 1,
      videoUrl: null, conteudo: `## Desnutrição e Distúrbios Nutricionais

**Base:** OMS — Manejo da Desnutrição Grave 2013 | SBP — Deficiências Nutricionais 2022 | MS — PNAN 2021

---

### Classificação da Desnutrição

**Classificação de Waterlow (avalia cronicidade vs agudidade):**

| Indicador | Normal | Desnutrição Leve | Moderada | Grave |
|---|---|---|---|---|
| Peso/Altura (aguda — emaciação) | ≥ 90% | 80–90% | 70–80% | < 70% |
| Altura/Idade (crônica — nanismo) | ≥ 95% | 90–95% | 85–90% | < 85% |

**Classificação de Gomez (peso/peso esperado para a idade):**

| Grau | % do Peso Esperado |
|---|---|
| Grau I (leve) | 75–90% |
| Grau II (moderada) | 60–75% |
| Grau III (grave) | < 60% |

> **OMS recomenda** o uso do z-score do indicador Peso/Comprimento (< -2 DP = desnutrição aguda moderada; < -3 DP = desnutrição aguda grave) associado à presença de edema bilateral para o diagnóstico de desnutrição grave.

---

### Marasmo vs Kwashiorkor

| Característica | Marasmo | Kwashiorkor |
|---|---|---|
| Mecanismo | Deficiência calórico-proteica global | Deficiência proteica predominante |
| Aparência | Emagrecimento severo, "velho enrugado", sem edema | Edema bilateral (gorducho aparente), cabelo opaco |
| Edema | Ausente | Presente (hipoalbuminemia) |
| Albumina | Levemente reduzida | Gravemente reduzida (< 2,5 g/dL) |
| Pele | Enrugada, sem brilho | Dermatose descamativa, despigmentação |
| Hepatomegalia | Ausente | Presente (esteatose hepática) |
| Comportamento | Alerta, irritado | Apático, triste, choro fraco |

**Kwashiorkor-Marasmático:** forma mista, com emagrecimento E edema — prognóstico mais grave.

---

### Tratamento por Fases (OMS)

**Fase 1 — Estabilização (dias 1–7):**
- Tratar hipoglicemia (dextrose 10% oral/IV)
- Tratar hipotermia (agasalhar, pele a pele)
- Tratar desidratação com ReSoMal (soro especial para desnutrição — menos sódio, mais potássio)
- Iniciar antibiótico empírico (ampicilina + gentamicina)
- Fórmula terapêutica F-75 (75 kcal/100 mL) — NÃO forçar alimentação

> **ATENÇÃO:** Na fase de estabilização NÃO usar ferro — potencializa infecção e estresse oxidativo. Introduzir apenas na fase de reabilitação.

**Fase 2 — Reabilitação (semanas 2–6):**
- Fórmula F-100 (100 kcal/100 mL) + suplementos de micronutrientes
- ATPU (Alimento Terapêutico Pronto para Uso, ex.: Plumpy'Nut) para casos não complicados
- Ferro: sulfato ferroso 3 mg/kg/dia de Fe elementar
- Vitamina A, zinco, folato, potássio, magnésio

**Fase 3 — Acompanhamento:** Reintegração alimentar familiar, estimulação sensorial, prevenção de recidiva.

---

### Deficiências Específicas de Micronutrientes

| Nutriente | Manifestação Principal | Grupo de Risco | Tratamento |
|---|---|---|---|
| **Ferro** | Anemia microcítica hipocrômica, palidez, irritabilidade, déficit cognitivo | < 2 anos, adolescentes, gestantes | Sulfato ferroso 3–6 mg/kg/dia Fe elementar × 3–6 meses |
| **Vitamina A** | Cegueira noturna, xeroftalmia, úlcera corneal, imunossupressão | < 5 anos em regiões endêmicas, desnutridos | 200.000 UI VO × 2 dias (> 12 meses); 100.000 UI (6–12 meses) |
| **Vitamina D** | Raquitismo (craniotabes, rosário raquítico, pernas em arco), tetania hipocalcêmica | < 2 anos, amamentados sem suplementação | 1.000–2.000 UI/dia (manutenção); 3.000–6.000 UI/dia (tratamento) |
| **Zinco** | Dermatite acrodermatite, alopecia, diarreia persistente, atraso no crescimento | Desnutridos, diarreia crônica | 10 mg/dia (< 6 meses); 20 mg/dia (> 6 meses) × 10–14 dias |
| **Vitamina C (Escorbuto)** | Sangramento gengival, petéquias perifoliculares, hemartrose | Dietas restritivas, desnutrição grave | Vitamina C 100–300 mg/dia × 30 dias |
| **Vitamina B1 (Beribéri)** | Beribéri seco (neuropatia), úmido (ICC), Wernicke-Korsakoff | Desnutrição grave, alcoolistas | Tiamina 50–100 mg IM/IV × 3 dias |

---

### Anemia Ferropriva em Pediatria

**Prevenção:**
- Aleitamento materno exclusivo até 6 meses
- Suplementação profilática de ferro: 1 mg/kg/dia a partir do 6º mês (amamentados) ou 3º mês para pré-termos
- Introdução alimentar rica em ferro (carnes, feijão + vitamina C para melhorar absorção)
- Evitar leite de vaca integral antes de 12 meses

**Diagnóstico laboratorial:** Hemoglobina < 11 g/dL (< 5 anos), VCM < 70 fL, ferritina < 12 ng/mL.

---

### Caso Clínico

**Menino de 14 meses, filho de mãe adolescente, aleitamento materno exclusivo até 12 meses sem suplementação. Pálido, irritado, recusa alimentos sólidos. Hb: 8,2 g/dL, VCM: 62 fL, ferritina: 5 ng/mL.**

- **Diagnóstico:** Anemia ferropriva grave
- **Conduta:** Sulfato ferroso 3–6 mg/kg/dia de Fe elementar (dividido em 2 doses, longe das refeições) + orientação alimentar
- **Meta:** Hb deve aumentar ≥ 1 g/dL em 4 semanas; manter tratamento 2–3 meses após normalização da Hb
- **Prevenção:** Orientar que o leite de vaca deve ser limitado a 500 mL/dia e associado a alimentos ricos em ferro
- **Rastrear:** Desenvolvimento neuropsicomotor — anemia ferropriva no 1º ano causa déficit cognitivo permanente`, ativo: true,
    },
    {
      titulo: 'Imunização: Calendário Vacinal',
      descricao: 'Calendário vacinal do Ministério da Saúde. Vacinas obrigatórias, esquemas de recuperação e contraindicações.',
      disciplina: 'Pediatria', tema: 'Imunização', tipo: 'texto', nivel: 'basico',
      duracao: 25, ordem: 6, mes: 4, semana: 2,
      videoUrl: null, conteudo: `## Imunização: Calendário Vacinal

**Base:** Calendário Nacional de Vacinação SBP/MS 2024 | Nota Técnica CGPNI/DEIDT/SVS/MS

---

### Calendário Vacinal da Criança — SBP/MS 2024

| Idade | Vacinas |
|---|---|
| Ao nascer | BCG (dose única) + Hepatite B (1ª dose) |
| 1 mês | Hepatite B (2ª dose) |
| 2 meses | Pentavalente (DTP+Hib+HepB — 1ª dose) + VIP (Poliomielite Inativada — 1ª dose) + VRH (Rotavírus — 1ª dose) + PCV10 (Pneumococo — 1ª dose) + Meningococo C (1ª dose) |
| 3 meses | Meningococo B (1ª dose — SBP) |
| 4 meses | Pentavalente (2ª dose) + VIP (2ª dose) + VRH (2ª dose) + PCV10 (2ª dose) + Meningococo C (2ª dose) + Meningococo B (2ª dose — SBP) |
| 6 meses | Pentavalente (3ª dose) + VIP (3ª dose) + Influenza (anual — 1ª dose em novembro) + Hepatite B (se esquema separado) |
| 9 meses | Febre Amarela (1ª dose — regiões recomendadas) |
| 12 meses | PCV10 (reforço) + Meningococo C (reforço) + Tríplice Viral — SCR (1ª dose) + Varicela (1ª dose — SCRV ou monovalente) |
| 15 meses | DTP (1º reforço) + VOP (Poliomielite Oral — 1º reforço) + SCRV ou SCR + Varicela (2ª dose) + Hepatite A (1ª dose) |
| 4 anos | DTP (2º reforço) + VOP (2º reforço) + SCR (2ª dose) + Varicela (2ª dose se não tomou) + Febre Amarela (se indicado) |

---

### Calendário do Adolescente (9–19 anos)

| Vacina | Esquema |
|---|---|
| HPV quadrivalente | 11–14 anos: 2 doses (0 e 6 meses); ≥ 15 anos: 3 doses (0, 2, 6 meses) |
| Meningococo ACWY | Dose única (11–12 anos); reforço aos 16 anos |
| dTpa (coqueluche acelular) | 1 dose na adolescência |
| Influenza | Anual |
| SCR/Varicela | Completar esquema se necessário |

---

### Vacinas Especiais — CRAS (Centros de Referência de Imunobiológicos Especiais)

> Disponíveis gratuitamente para populações com indicações especiais (imunossuprimidos, portadores de doenças crônicas, pós-transplante, contatos domiciliares de imunossuprimidos).

| Vacina | Indicação |
|---|---|
| Meningococo B | Asplenia, complementopatias, HIV |
| Pneumococo 23-valente (PPV23) | > 2 anos com doenças crônicas; após PCV10/13 |
| Varicela (2ª dose antecipada) | Imunossuprimidos leves |
| Influenza (dose dupla) | Imunossuprimidos graves na 1ª dose da temporada |
| Hepatite A e B | Hepatopatias, HIV, nefropatas |
| Raiva (pré-exposição) | Profissionais de saúde, veterinários |

---

### Contraindicações

| Tipo | Contraindicação |
|---|---|
| **Absolutas** | Reação anafilática grave a dose anterior ou componente da vacina |
| **Para vacinas vivas** | Imunodeficiência congênita grave, imunossupressão intensa, gestação |
| **Relativas** | Doença aguda moderada/grave com febre (adiar, não contraindicar) |
| **Falsas contraindicações** | Resfriado leve, uso de antibiótico, doença crônica estável, baixo peso, prematuridade (exceto BCG — aguardar 2 kg) |

> **Corticoide:** Dose alta (≥ 2 mg/kg/dia de prednisona por ≥ 14 dias) ou equivalente: aguardar 1 mês para vacinas vivas após suspensão.

---

### EAPV — Eventos Adversos Pós-Vacinação

| Vacina | Evento Adverso Esperado | Conduta |
|---|---|---|
| DTP | Febre, dor local, nódulo (comum); choro persistente, febre > 40°C (incomum) | Antitérmico, comunicar ao SI-EAPV se grave |
| SCR/SCRV | Febre 5–12 dias, exantema leve (componente sarampo) | Antitérmico; exantema não é contagioso |
| Varicela | Exantema variceloso leve (2–4 semanas pós) | Monitorar; raro e menos grave que doença natural |
| Rotavírus | Choro, irritabilidade, diarreia leve | Suporte; investigar intussuscepção se choro incontrolável + abdome tenso |
| BCG | Lesão local evolutiva (1 cm) → cura espontânea | Normal; linfonodo axilar > 3 cm = adenite supurativa → encaminhar CRAS |

**Notificação:** Todos os EAPV devem ser registrados no SI-EAPV (Sistema de Informação de Eventos Adversos Pós-Vacinação).

---

### Calendário de Recuperação (Catch-Up)

**Princípios:**
- Dose recebida após o prazo recomendado conta — nunca reiniciar esquema
- Respeitar intervalos mínimos entre doses (geralmente 4 semanas para mesma vacina)
- Doses recebidas antes do intervalo mínimo não são válidas e devem ser repetidas

**Intervalos mínimos importantes:**
- Entre doses da mesma vacina inativada: 4 semanas
- Entre vacinas vivas simultâneas (não no mesmo dia): 4 semanas de intervalo
- SCR e varicela separadas: aguardar 4 semanas; no mesmo dia (SCRV): sem restrição

---

### Caso Clínico

**Criança de 3 anos e 6 meses, procedente de outra cidade, sem cartão de vacinação. Mãe refere "algumas vacinas" mas não sabe quais. Criança saudável, sem imunossupressão.**

- **Conduta:** Considerar esquema incompleto e iniciar/completar conforme calendário de catch-up
- **Vacinas prioritárias:** DTP (verificar doses), VOP, Tríplice Viral (2 doses com intervalo mínimo de 4 semanas), Varicela, Hepatite A e B
- **Orientação:** Cartão vacinal deve ser apresentado em toda consulta pediátrica e atualizado regularmente
- **Falsa contraindicação a evitar:** A ausência do cartão não é contraindicação — vacinar e documentar`, ativo: true,
    },
    // ── Ginecologia e Obstetrícia (5 aulas) ──
    {
      titulo: 'Pré-Natal de Baixo Risco',
      descricao: 'Captação precoce, exames por trimestre, DPP pela Regra de Naegele, suplementação, vacinação e critérios de alto risco. Base: MS 2022 + OMS + FEBRASGO 2023.',
      disciplina: 'Ginecologia', tema: 'Obstetrícia', tipo: 'video', nivel: 'basico',
      duracao: 50, ordem: 1, mes: 2, semana: 2,
      videoUrl: 'https://www.youtube.com/watch?v=pUQPr2T_Weg', conteudo: `## Pré-Natal de Baixo Risco

**Base:** MS Brasil — Atenção ao Pré-Natal de Baixo Risco 2022 + OMS Antenatal Care 2016 + FEBRASGO 2023

---

### Captação Precoce e Número de Consultas

A captação precoce — idealmente antes de 12 semanas — é fundamental para rastreio de anomalias cromossômicas, sorologias e início das suplementações no período crítico do desenvolvimento fetal. O **Ministério da Saúde recomenda mínimo de 6 consultas**: 1 no 1º trimestre, 2 no 2º trimestre e 3 no 3º trimestre. A FEBRASGO recomenda ≥ 8 consultas para cobertura completa, incluindo consulta de puerpério imediato (7–10 dias após o parto).

> **Pérola clínica:** A consulta pré-concepcional deve incluir suplementação de ácido fólico pelo menos 1 mês antes da concepção, atualização vacinal (rubéola, varicela, dTpa) e controle de doenças crônicas — especialmente DM e HAS.

---

### Cálculo de DPP (Regra de Naegele) e Datação Gestacional

**Regra de Naegele:** DPP = DUM + 7 dias − 3 meses + 1 ano (equivalente a somar 9 meses e 7 dias à DUM)

| Método de Datação | Precisão | Quando Usar |
|---|---|---|
| DUM confiável + ciclos regulares de 28 dias | ± 5 dias | 1ª escolha quando DUM confiável |
| USG CCN (comprimento cabeça-nádega) < 14 sem | ± 5–7 dias | Padrão-ouro — DUM incerta ou ciclos irregulares |
| USG DBP (diâmetro biparietal) 14–20 sem | ± 7–10 dias | Alternativa quando USG precoce não disponível |
| USG > 28 semanas | ± 3 semanas | Pouco confiável — não usar para datação primária |

> **Pérola clínica:** Se DUM é conhecida mas diverge > 7 dias do USG precoce, priorizar a datação ultrassonográfica — evita erros na avaliação do crescimento fetal e na programação do parto.

---

### Exames por Trimestre

| Exame | 1º Trimestre (até 14 sem) | 2º Trimestre (14–28 sem) | 3º Trimestre (28–40 sem) |
|---|---|---|---|
| Hemograma completo | Sim | Repetir 28–32 sem | Repetir 36–38 sem |
| Tipagem ABO/Rh + Coombs indireto | Sim | Repetir se Rh neg (28 sem) | — |
| Glicemia de jejum | Sim | — | — |
| TOTG 75g — 2h (critérios IADPSG/OMS) | — | 24–28 sem | — |
| VDRL (sífilis) | Sim | Repetir 28 sem | Repetir 34–36 sem |
| Anti-HIV (4ª geração) | Sim | Repetir 28 sem | Repetir 34–36 sem |
| HBsAg (Hepatite B) | Sim | — | Repetir se negativo |
| IgG + IgM Toxoplasmose | Sim | Repetir mensal se IgG neg | Idem |
| IgG Rubéola | Sim | — | — |
| Urocultura + EAS | Sim | — | Repetir 28–32 sem |
| TSH | Sim | — | — |
| Papanicolaou (se atrasado > 3 anos) | Sim | — | — |
| USG morfológico 1º tri + Translucência Nucal | 11–13+6 sem | — | — |
| USG morfológico 2º tri (anatomia fetal completa) | — | 20–24 sem | — |
| Streptococcus agalactiae (SGB) retal/vaginal | — | — | 35–37 sem |

> **Pérola clínica:** Bacteriúria assintomática na gestação — urocultura positiva SEM sintomas deve ser tratada: risco de pielonefrite (principal causa de prematuridade iatrogênica). Seguros: nitrofurantoína (evitar no 3º tri), cefalexina, amoxicilina — evitar quinolonas e sulfonamidas no 3º trimestre.

---

### Suplementação na Gestação

| Suplemento | Dose | Início | Justificativa |
|---|---|---|---|
| Ácido fólico | 400 mcg/dia (risco habitual); 4 mg/dia (alto risco: NTD prévia, DM, anticonvulsivantes, gêmeos) | Pré-concepcional até 12 semanas | Prevenção de defeitos do tubo neural (DTN) |
| Ferro elementar | 30–60 mg/dia | A partir de 20 semanas (antes se anêmica) | Prevenção/tratamento de anemia ferropriva gestacional |
| Cálcio | 1.000–1.500 mg/dia | 20 semanas em diante | Reduz risco de pré-eclâmpsia em até 55% (OMS 2016) |
| Iodeto de potássio | 150–200 mcg/dia | Desde o início | Neurodesenvolvimento fetal — deficiência causa cretinismo e hipotireoidismo neonatal |
| Vitamina D | 600 UI/dia (OMS); 1.500–2.000 UI/dia (FEBRASGO) | Toda a gestação | Saúde óssea, imunidade e redução de pré-eclâmpsia |

---

### Vacinação na Gestação

| Vacina | Indicação | Momento Ideal | Observações Importantes |
|---|---|---|---|
| dTpa (tétano + difteria + coqueluche acelular) | Toda gestante, em CADA gestação | 27–36 semanas | Transferência de IgG materna — principal proteção do RN contra coqueluche no 1º mês de vida |
| Influenza (inativada) | Toda gestante | Qualquer trimestre | Segura — vírus inativado; gestante tem risco aumentado de influenza grave |
| Hepatite B | Se não imunizada (anti-HBs negativo) | Qualquer trimestre | 3 doses (0, 1 e 6 meses); previne transmissão vertical |
| Hepatite A | Se não imunizada com risco | Qualquer trimestre | Vírus inativado — segura na gestação |

> **Contraindicadas na gestação:** vacinas de vírus vivos atenuados — SCR/tríplice viral, varicela, febre amarela (exceto em surto com risco-benefício favorável), BCG, febre tifoide oral.

---

### Critérios de Encaminhamento ao Pré-Natal de Alto Risco

| Condição | Justificativa Clínica |
|---|---|
| Diabetes mellitus pré-gestacional ou gestacional | Macrossomia, malformações cardíacas, hipoglicemia neonatal, polidrâmnio |
| HAS crônica ou síndromes hipertensivas | Pré-eclâmpsia superimposta, RCIU, DPP prematura |
| Gestação múltipla (gemelar ou mais) | Prematuridade, síndrome de transfusão feto-fetal, discordância de crescimento |
| Cardiopatia, nefropatia, tireoidopatia, lúpus | Descompensação materna com repercussão fetal grave |
| Antecedente de prematuridade < 34 semanas ou perdas recorrentes | Risco de recorrência — avaliar cerclagem, progesterona vaginal |
| IMC > 40 kg/m² | Complicações metabólicas e dificuldade de monitorização fetal |
| Placenta prévia ou vasa prévia confirmada na USG | Risco de sangramento maciço e morte fetal |
| Isoimunização Rh (Coombs indireto positivo e crescente) | Doença hemolítica perinatal grave — requer doppler da artéria cerebral média |

---

### Populações Especiais

**Gestante adolescente (< 18 anos):** risco aumentado de HAS, parto prematuro, anemia e RCIU. Suporte social e psicológico são fundamentais; notificação compulsória em situações de violência.

**Gestante ≥ 35 anos:** risco aumentado de anomalias cromossômicas (T21, T18), abortamento espontâneo, pré-eclâmpsia, DM gestacional e placenta prévia. Oferecer rastreio combinado 1º tri; amniocentese ou BVC se rastreio alterado.

**Gestante com cicatriz uterina prévia:** avaliar inserção placentária com USG com Doppler colorido — risco de placenta acreta. Programar cesárea eletiva 37–39 semanas se placenta prévia total ou acretismo confirmado.

---

### Caso Clínico

**Paciente feminina, 26 anos, G2P1A0, 10 semanas de gestação, DUM confiável e ciclos regulares de 28 dias. Primeira consulta pré-natal. Parto anterior eutócico, RN a termo com peso adequado. Sem doenças crônicas. PA 110/70 mmHg, IMC 23 kg/m². Sem exames laboratoriais recentes.**

**Análise e Conduta Detalhada:**
- **DPP pela Regra de Naegele:** DUM + 9 meses e 7 dias — confirmar com USG morfológico 1º tri (CCN entre 11–13+6 semanas)
- **Exames 1º trimestre:** hemograma completo, tipagem ABO/Rh + Coombs indireto, glicemia de jejum, VDRL, anti-HIV, HBsAg, toxoplasmose IgG/IgM, rubéola IgG, TSH, urocultura + EAS, papanicolaou atualizado
- **USG morfológico 1º tri + Translucência Nucal:** agendar 11–13+6 semanas (rastreio de trissomias e malformações estruturais precoces)
- **Suplementação imediata:** ácido fólico 400 mcg/dia; ferro e cálcio a partir de 20 semanas
- **Vacinação:** dTpa 27–28 semanas; influenza na campanha anual; verificar anti-HBs e completar esquema se necessário
- **Agenda de retornos (8 consultas):** 14, 20, 24, 28, 32, 36, 38 semanas + puerpério (7–10 dias)
- **Exames futuros programados:** TOTG 75g (24–28 sem), USG morfológico 2º tri (20–24 sem), SGB retal/vaginal (35–37 sem)
- **Sinais de alarme a orientar:** cefaleia intensa + fotofobia (pré-eclâmpsia), sangramento vaginal, redução dos movimentos fetais após 28 semanas`, ativo: true,
    },
    {
      titulo: 'Síndromes Hipertensivas da Gestação',
      descricao: 'DHEG, pré-eclâmpsia com e sem critérios de gravidade, eclâmpsia e HELLP. Tratamento e interrupção.',
      disciplina: 'Ginecologia', tema: 'Obstetrícia', tipo: 'texto', nivel: 'avancado',
      duracao: 64, ordem: 2, mes: 2, semana: 2,
      videoUrl: null,
      conteudo: `## Síndromes Hipertensivas da Gestação

**Base:** ISSHP 2022 + ACOG Practice Bulletin 2022 + FEBRASGO 2023 + MS Brasil PCDT

---

### Classificação das Síndromes Hipertensivas

| Síndrome | Definição | Características Diferenciais |
|---|---|---|
| HAS Crônica (HAC) | PA ≥ 140/90 mmHg diagnosticada antes de 20 semanas ou pré-existente | Sem proteinúria como critério; pode se complicar com PE sobreposta |
| HAS Gestacional | PA ≥ 140/90 após 20 semanas SEM proteinúria e SEM critério de gravidade | Resolução esperada em até 12 semanas pós-parto; 25% evolui para PE |
| Pré-eclâmpsia (PE) | PA ≥ 140/90 + proteinúria ≥ 300 mg/24h OU razão P/Cr ≥ 0,3 OU dipstick ≥ 2+ OU critério de gravidade | Após 20 semanas; pode surgir SEM proteinúria se critério grave presente |
| Síndrome HELLP | Hemólise (esquizócitos, LDH > 600) + Enzimas hepáticas elevadas (TGO/TGP > 2× LSN) + Plaquetas baixas (< 100.000/mm³) | Variante grave de PE; pode ocorrer sem HAS ou proteinúria em 15–20% dos casos |
| Eclâmpsia | Convulsão tônico-clônica generalizada em gestante com PE — sem outra etiologia | Emergência obstétrica; 25% ocorre no pós-parto imediato |

---

### Fisiopatologia da Pré-eclâmpsia — Teoria da Placentação Deficiente

A PE resulta de falha na invasão trofoblástica das artérias espiraladas uterinas (remodeling inadequado) na 8ª–18ª semanas de gestação:

1. **Placentação defeituosa:** artérias espiraladas permanecem de alta resistência → isquemia placentária relativa
2. **Desequilíbrio angiogênico:** placenta isquêmica libera excesso de sFlt-1 (receptor solúvel de VEGF) e sEng (endoglina solúvel) → sequestram VEGF e PlGF livres na circulação
3. **Endoteliose sistêmica:** déficit de VEGF/PlGF → disfunção endotelial generalizada → vasospasmo, hipertensão, proteinúria (lesão do podócito renal), coagulopatia, lesão hepática

> A razão sFlt-1/PlGF < 38 tem VPN de 99% para excluir PE na semana seguinte (regra de ouro para triagem hospitalar). Razão > 85 é altamente preditiva de PE iminente.

---

### Diagnóstico Precoce e Critérios de Gravidade

**Triagem no 1º trimestre (11–13+6 semanas) — rastreamento combinado:**
- PA média (MAP), Doppler de artérias uterinas (IP elevado), PAPP-A baixo, PlGF baixo
- Risco > 1:100 → aspirina 150mg/noite a partir de 11–16 semanas → reduz PE precoce em 60–70%

**Critérios diagnósticos de Pré-eclâmpsia:**
- PA ≥ 140/90 mmHg em ≥ 2 medidas com intervalo ≥ 4h (ou PA ≥ 160/110 em medida única)
- Proteinúria: ≥ 300 mg/24h OU razão P/Cr ≥ 0,3 OU dipstick ≥ 2+ (somente se outros métodos indisponíveis)
- OU critério de gravidade mesmo sem proteinúria

**Critérios de gravidade da PE:**

| Critério | Threshold |
|---|---|
| PA sistólica | ≥ 160 mmHg em 2 medidas com 15 minutos de intervalo |
| PA diastólica | ≥ 110 mmHg em 2 medidas com 15 minutos de intervalo |
| Trombocitopenia | Plaquetas < 100.000/mm³ |
| Insuficiência renal | Creatinina > 1,1 mg/dL ou duplicação da Cr basal |
| Disfunção hepática | TGO ou TGP > 2× LSN ou dor em hipocôndrio direito refratária |
| Edema agudo de pulmão | Qualquer grau |
| Sintomas neurológicos | Cefaleia refratária ou escotomas persistentes (não responsivos a analgesia) |
| RCIU | Doppler umbilical com fluxo diastólico ausente/reverso |

---

### Sulfato de Magnésio — Esquemas, Doses e Antídoto

**Indicação:** toda PE com critérios de gravidade + eclâmpsia (tratamento e prevenção de recorrência).

**Esquema de Zuspan (IV — padrão no Brasil):**
- Dose de ataque: **4g IV em 20 minutos** (diluir 8 mL da solução 50% em 12 mL SF 0,9% → administrar em 20 min)
- Dose de manutenção: **1–2 g/h IV** em bomba de infusão contínua (BIC)

**Esquema de Pritchard (IM — quando sem acesso IV):**
- Dose de ataque: **4g IV lento** (veia central ou central) + **5g IM em cada glúteo** (= 10g IM total)
- Dose de manutenção: **5g IM q4h** alternando glúteos

**Monitorização obrigatória a cada hora:**

| Parâmetro | Valor Seguro | Ação se Alterado |
|---|---|---|
| Reflexo patelar | Presente | Suspender MgSO₄ se ausente |
| FR | ≥ 12 irpm | Suspender se < 12 irpm |
| Diurese | ≥ 25 mL/h (≥ 100 mL/4h) | Reduzir dose de manutenção se oligúria |
| Nível de consciência | Alerta e responsiva | Suspender se sonolência intensa |

**Antídoto — OBRIGATÓRIO disponível na cabeceira:**
- Gluconato de cálcio 10% — **1g IV lento em 3 minutos** (10 mL da ampola 10% = 1g)
- Mecanismo: Ca²⁺ antagoniza o magnésio na junção neuromuscular

> MgSO₄ mantém por 24–48h após o parto (maior risco de eclâmpsia pós-parto imediato). Não é anti-hipertensivo — não controla a PA.

---

### Tratamento da Crise Hipertensiva Grave (PA ≥ 160/110)

Meta: reduzir PA para 140–155/90–105 mmHg em 30–60 minutos (redução rápida demais = isquemia fetal).

| Fármaco | Dose | Via | Tempo de Ação | Observação |
|---|---|---|---|---|
| Hidralazina | 5 mg IV a cada 20 min (máx 20 mg) | IV lento | 10–20 min | 1ª escolha tradicional; risco de hipotensão materna |
| Nifedipina de ação rápida | 10 mg VO, repetir a cada 30 min (máx 30 mg) | VO | 15–30 min | Segura; não usar sublingual (queda brusca) |
| Labetalol | 20 mg IV, depois 40–80 mg q10min (máx 220 mg) | IV | 5–10 min | Alternativa; evitar em asma e bradicardia |
| Metildopa | 250–500 mg VO 8/8h (máx 3 g/dia) | VO | Horas | Manutenção ambulatorial — não para crise aguda |

> IECA (captopril, enalapril), BRA (losartana) e inibidores diretos de renina são ABSOLUTAMENTE CONTRAINDICADOS na gestação — fetotoxicidade (oligodrâmnio, anúria fetal, malformações).

---

### Momento e Via de Interrupção da Gestação

| Diagnóstico | Idade Gestacional | Conduta |
|---|---|---|
| PE sem critérios de gravidade | ≥ 37 semanas | Interromper (qualquer via conforme obstetrícia) |
| PE sem critérios de gravidade | 34–36+6 semanas | Manejo expectante em ambulatório (PA, proteínuria, DPP rigoroso) |
| PE com critérios de gravidade | ≥ 34 semanas | Interromper após estabilização materna |
| PE com critérios de gravidade | < 34 semanas | Manejo expectante em centro terciário + corticoide + MgSO₄ — interromper se deterioração |
| Eclâmpsia | Qualquer IG | Estabilizar → interromper após controle das convulsões e PA |
| HELLP | Qualquer IG ≥ 34 sem | Interromper; < 34 sem → manejo ≤ 48h com corticoide para maturação fetal |

**Maturação pulmonar fetal (24–33+6 semanas):**
- Betametasona 12 mg IM 2 doses com intervalo de 24h (ou dexametasona 6 mg IM q12h × 4 doses)
- Administrar quando interrupção prevista em 24–48h

---

### Populações Especiais e Complicações

**Síndrome HELLP — manejo específico:**
- Plaquetas < 50.000/mm³ ou sangramento ativo: transfundir concentrado de plaquetas (meta > 50.000 antes do parto)
- Transfusão de plasma fresco congelado se CIVD associada
- Dexametasona 10mg IV q12h: melhora laboratório mas sem evidência de redução de mortalidade
- HELLP pode piorar nas primeiras 24–48h pós-parto antes de melhorar

**Primária e multigestas:**
- Primigestas com histórico de PE: risco 25–65% de recorrência em próxima gestação → aspirina 150mg desde 11–16 semanas
- PE precoce (< 34 semanas): investigar trombofilias (síndrome antifosfolípide — anticorpos aCL, anti-β2GPI, anticoagulante lúpico)

---

### Caso Clínico — Pré-eclâmpsia Grave com 32 Semanas

**Cenário:** Primigesta, 32 semanas, sem pré-natal. PA 172/115 mmHg, cefaleia intensa e escotomas visuais há 3h, edema de MMII +++. Proteinúria dipstick 3+. Cr 1,3 mg/dL. Plaquetas 88.000/mm³. TGO 98 UI/L (2× LSN). Peso fetal estimado (DUM): pequeno para IG.

**Diagnóstico:** Pré-eclâmpsia com múltiplos critérios de gravidade (PA ≥ 160/110 + sintomas neurológicos + plaquetopenia < 100.000 + disfunção hepática + Cr elevada + RCIU suspeito) — possivelmente HELLP classe II (Classificação Mississippi).

**Conduta imediata:**
1. Internação em centro terciário (UTI obstétrica ou semi-intensiva)
2. MgSO₄ Zuspan: 4g IV em 20 min → 2g/h BIC (prevenir/tratar eclâmpsia)
3. Controle da crise hipertensiva: nifedipina 10mg VO → repetir em 30 min se PA ≥ 160/110 persistir; ou hidralazina 5mg IV
4. Betametasona 12mg IM agora + repetir em 24h (maturação pulmonar — 32 semanas)
5. Doppler umbilical + cardiotocografia → avaliar bem-estar fetal
6. Exames seriados q6–12h: plaquetas, TGO/TGP, creatinina, LDH, ácido úrico
7. Decisão de interrupção: se deterioração materna (piora laboratorial, eclâmpsia, EAP) → parto imediato independente da IG; se estabilização → manejo expectante até 34 semanas ou piora
8. Via de parto: avaliação obstétrica — cesariana se condições cervicais desfavoráveis ou sofrimento fetal`, ativo: true,
    },
    {
      titulo: 'Trabalho de Parto e Parto Normal',
      descricao: 'Mecanismo do parto, fases do trabalho de parto, partograma, cardiotocografia e assistência ao parto.',
      disciplina: 'Ginecologia', tema: 'Obstetrícia', tipo: 'texto', nivel: 'intermediario',
      duracao: 94, ordem: 3, mes: 3, semana: 2,
      videoUrl: null, conteudo: `## Trabalho de Parto e Parto Normal

**Base:** FEBRASGO 2023 + Ministério da Saúde Brasil — Atenção ao Parto Normal + ACOG Practice Bulletin 2019 + OMS Intrapartum Care 2018

---

### 1. Fisiologia do Trabalho de Parto — Mecanismos de Início

O início do trabalho de parto (TP) é um processo coordenado e ainda parcialmente obscuro, envolvendo a retirada da quiescência uterina e a ativação de mecanismos pró-contráteis:

**Ocitocina:** produzida pela neurohipófise materna e pelo trofoblasto fetal. Age nos receptores OTR do miométrio (que aumentam 200x no final da gestação) via IP3/DAG → ativação da Miosin Light-Chain Kinase (MLCK) → fosforilação da miosina → contração. O reflexo de Ferguson amplifica a liberação de ocitocina à medida que a cabeça fetal distende o colo — feedback positivo.

**Prostaglandinas:** PGE2 e PGF2α são produzidas pela decídua e membranas amnióticas em resposta à distensão miometrial e às citocinas inflamatórias (IL-1β, IL-8, TNF-α). PGE2 promove maturação cervical (colagenases + ácido hialurônico → amolecimento do colo). PGF2α estimula diretamente a contratilidade uterina. A PGE2 é a base farmacológica do misoprostol (análogo sintético).

**Maturação cervical:** mudança bioquímica progressiva do colo de uma estrutura firme (colágeno entrecruzado + proteoglicanos) para amolecida, apagada e dilatável. Regulada por colagenases (MMP-1, MMP-8), interleucinas e infiltração de neutrófilos. Avaliada clinicamente pelo Bishop Score:

| Parâmetro | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Dilatação (cm) | Fechado | 1–2 | 3–4 | ≥ 5 |
| Apagamento (%) | 0–30 | 40–50 | 60–70 | ≥ 80 |
| Consistência | Firme | Médio | Amolecido | — |
| Posição | Posterior | Médio | Anterior | — |
| Altura da apresentação (plano de De Lee) | –3 | –2 | –1/0 | +1/+2 |

Bishop ≤ 6: colo desfavorável → maturação cervical antes de indução (misoprostol 25 mcg vaginal a cada 4–6h; máx 6 doses; OU dinoprostona 0,5 mg intracervical). Bishop ≥ 7: colo favorável → indução direta com ocitocina.

---

### 2. Fases do Trabalho de Parto com Duração Normal

| Fase | Definição | Primígestas | Multígestas | Ação se Lento |
|---|---|---|---|---|
| Fase Latente | 0 → 6 cm (ACOG 2019 revisou limite de ativo para 6 cm) | Até 20h | Até 14h | Observação, analgesia, deambulação — NÃO cesárea por latente prolongada isolada |
| Fase Ativa | ≥ 6 cm + contrações regulares | 1 cm/h mínimo | 2 cm/h mínimo; mais rápida | Parada > 4h sem progressão com bolsa rota + ocitocina → cesárea |
| Período Expulsivo | 10 cm dilatados até nascimento | Até 3h com analgesia / 2h sem | Até 2h com analgesia / 1h sem | > 3h sem descida com esforços → instrumental (fórcipe/vácuo) ou cesárea |
| Dequitadura (3° período) | Nascimento até saída da placenta | Até 30 min | Até 30 min | > 30 min = placenta retida → intervenção manual |

**Mecanismo de Schultze vs. Duncan:**
- Schultze: face fetal sai primeiro (centro da placenta → bordas); sangramento após a placenta — mais comum (75%)
- Duncan: borda da placenta descola primeiro; sangramento antes ou junto com a placenta — menos comum; associado a inserção lateral (fúndica baixa)

> A ACOG 2019 revisou o limite da fase ativa de 4 cm para 6 cm: antes de 6 cm, não se faz diagnóstico de fase ativa estagnada. Isso reduziu significativamente a taxa de cesáreas "por distocia" nos EUA.

---

### 3. Mecanismo do Parto — 7 Movimentos Cardinais com Anatomia Detalhada

O parto em apresentação cefálica occipitoanterior (OEA/ODA) ocorre pela adaptação do polo cefálico aos diâmetros da bacia materna em cada estreito pélvico:

1. **Acomodação (encaixamento):** Sutura sagital no diâmetro oblíquo do estreito superior (13 cm). Diâmetro de apresentação: occipitofrontal 11,5 cm adapta-se ao diâmetro oblíquo. Primígestas: encaixamento pode ocorrer semanas antes do TP. Multígestas: frequentemente só no TP ativo.

2. **Descida:** Progressão pelo canal de parto pela força contrátil do útero (60–80 mmHg no pico da contração) e puxos voluntários maternos na fase expulsiva. Estações de De Lee: –5 a 0 (borda inferior da cabeça acima das espinhas isquiáticas) → 0 (nível das espinhas) → +5 (coroamento).

3. **Flexão:** Resistência do assoalho pélvico força flexão da cabeça → mento aproxima-se do tórax → reduz diâmetro de apresentação de occipitofrontal (11,5 cm) para suboccipitobregmático (9,5 cm) — redução crítica para passagem pelo estreito médio (10 cm).

4. **Rotação interna:** Occipital gira anteriormente 45° (ODA → OA) ou 90° (OEA → OA) para se alinhar com o diâmetro anteroposterior do estreito inferior — guiada pelos músculos elevadores do ânus e a forma do assoalho pélvico.

5. **Extensão:** Cabeça nasce sob a sínfise púbica por extensão progressiva — subcipital apoia na sínfise e serve de pivô. Ordem: occipital → sincipício → fronte → face → mento.

6. **Restituição (rotação externa):** A cabeça recém-nascida retorna à posição oblíqua original (desfaz a rotação interna). Os ombros rodam internamente para o diâmetro anteroposterior.

7. **Expulsão do tronco:** Ombro anterior (sob a sínfise) nasce primeiro → ombro posterior (pelo períneo) → por tração lateral delicada, nasce o tronco e membros inferiores.

---

### 4. Cardiotocografia Completa — Interpretação e Conduta

A CTG avalia a frequência cardíaca fetal (FCF) em relação às contrações uterinas, refletindo a oxigenação do sistema nervoso autônomo fetal.

**Parâmetros basais:**

| Parâmetro | Normal (Categoria I) | Suspeito (Categoria II) | Patológico (Categoria III) |
|---|---|---|---|
| Frequência de base (FCB) | 110–160 bpm | 100–110 ou 160–180 bpm | < 100 bpm (bradicardia grave) ou > 180 bpm por > 10 min |
| Variabilidade | 6–25 bpm (moderada) | Mínima (1–5 bpm) por 40–80 min; acentuada (>25 bpm) | Ausente (sinusoidal ou < 5 bpm por > 80 min) |
| Acelerações | ≥ 2 acelerações de 15 bpm por 15 s em 20 min | Ausentes (sem valor sozinho) | Não aplicável |
| Desacelerações | Nenhuma ou DIP I ocasional | DIP variáveis recorrentes; prolongadas > 2 min | DIP II recorrentes; DIP variáveis com características sinistras; bradicardia prolongada |

**Tipos de desacelerações — Mecanismo, Causa e Conduta:**

| Tipo | Mecanismo Fisiopatológico | Causa Clínica | Conduta |
|---|---|---|---|
| DIP I (precoce) | Reflexo vagal por compressão da cabeça fetal (fase descendente e ascendente espelham a contração) | Compressão cefálica na fase expulsiva; fisiológico | Nenhuma — benigno |
| DIP II (tardio) | Hipóxia miocárdica por insuficiência uteroplacentária (início 30–60 s após pico da contração; recuperação lenta) | Insuficiência placentária; HAS; RCIU; hiperdinâmica com ocitocina | Decúbito lateral esquerdo; O2 suplementar; suspender ocitocina; se persistente → cesárea de urgência |
| DIP III (variável/umbilical) | Compressão do cordão umbilical → reflexo vagal + hipóxia | Oligoâmnio; circular de cordão; prolapso de cordão | Reposicionamento materno; amnioinfusão se oligoâmnio; se características sinistras (shoulder, tardias, profundas) → avaliar cesárea |
| Prolongada (> 2 min < 10 min) | Hipóxia aguda grave | Hipotensão materna (pós-anestesia peridural); prolapso de cordão; descolamento de placenta; ruptura uterina | Emergência — decúbito lateral + O2 + SF 500 mL IV; se < 6 min e sem recuperação → cesárea imediata |

**Características sinistras no DIP III (aumentam risco de acidose fetal):** retorno lento ao basal (shoulder); DIP tardio em espelho; DIP profundo (< 70 bpm); DIP prolongado (> 60 s); perda de variabilidade durante o DIP.

> Categoria III (DIP II recorrentes OU sinusoidal): intervenção imediata. Realizar manobras de reanimação intrauterina por 5–10 min — se sem resposta, cesárea de emergência. NÃO aguardar deterioração da FCB.

---

### 5. Partograma Completo — Como Interpretar e Usar

O partograma é a representação gráfica do progresso do TP. Obrigatório em todos os partos (OMS, MS Brasil).

**Construção:**
- Eixo X: tempo em horas
- Eixo Y esquerdo: dilatação cervical (0–10 cm)
- Eixo Y direito: descida da apresentação (planos de De Lee –5 a +5 ou 5/5 a 0/5)
- Linha de alerta: inicia na dilatação de admissão na fase ativa (≥ 4 cm pelo MS ou ≥ 6 cm pelo ACOG) com progressão de 1 cm/h
- Linha de ação: paralela à de alerta, deslocada 4 horas à direita

**Interpretação de padrões:**
- **Progressão normal:** dilatação plotada à esquerda ou sobre a linha de alerta
- **Alerta sem ação:** dilatação entre linha de alerta e linha de ação → investigar causa (dinâmica uterina, posição fetal, hidratação materna) → corrigir com amniotomia ou ocitocina
- **Cruzou a linha de ação:** parada secundária confirmada → decisão obstétrica: ocitocina IV se hipossistolia documentada + sem DCP → cesárea se DCP ou falha da ocitocina em 2–4h

**Parada secundária da fase ativa:**
- Diagnóstico: sem progressão de dilatação por ≥ 4h com atividade uterina adequada (≥ 3 contrações/10 min de 40–60 s) OU ≥ 6h com atividade inadequada + ocitocina em uso
- Causas: DCP (desproporção cefalopélvica) funcional ou absoluta; apresentação anômala (occipital posterior persistente); deflexão (sincipital, fronte, face); hipodinâmia

---

### 6. Líquido Amniótico e Amniorrexe

**Índice de líquido amniótico (ILA) normal:** 5–25 cm (técnica dos 4 quadrantes pela ultrassonografia).

| Classificação | ILA | Significado | Conduta |
|---|---|---|---|
| Poliidrâmnio | > 25 cm (bolsão > 8 cm) | DM descontrolado, defeitos fetais, gemelar | Investigação de causa; controle glicêmico |
| Normal | 5–25 cm | — | — |
| Oligoâmnio moderado | 2,1–5 cm | RCIU, HAS materna, pós-datismo, rotura prematura | Monitorização fetal intensiva; avaliar interrupção |
| Oligoâmnio grave (anidrâmnio) | ≤ 2 cm | Agenesia renal bilateral (Potter), uropatia obstrutiva, rotura de membranas | Avaliar viabilidade/interrupção |

**Mecônio no líquido amniótico:**

| Grau | Aspecto | Significado | Conduta |
|---|---|---|---|
| Grau I | Líquido levemente esverdeado | Possível eliminação fisiológica (≥ 37 sem.) | CTG contínua; atenção redobrada |
| Grau II | Líquido verde moderado | Estresse fetal possível | CTG contínua; monitorização intensiva; escalonamento |
| Grau III | Líquido espesso "fezes de recém-nascido", pastoso | Hipóxia fetal aguda ou subaguda | Preparar pediatra/neonatologista; IOT imediata ao nascimento se RN deprimido; aspiração traqueal somente se RN não vigoroso |

> Mecônio grau III + CTG Categoria II–III = urgência obstétrica. A síndrome de aspiração de mecônio é a principal causa de pneumonia química neonatal e SARA no recém-nascido a termo. Evidência atual: NÃO aspirar boca/naso antes do desprendimento dos ombros (ILCOR 2022 — não reduz síndrome de aspiração).

---

### 7. Analgesia de Parto — Bloqueio Peridural

A analgesia peridural (epidural) é o método mais eficaz para alívio da dor no TP. Não prolonga o TP ativo quando administrada adequadamente, não aumenta a taxa de cesárea (evidência nível I — Cochrane 2018).

**Técnica:** Espaço peridural L2–L3 ou L3–L4 (com paciente sentada ou em DLE). Cateter peridural + dose-teste (lidocaína 1,5% 3 mL com adrenalina 1:200.000 — detecta punção intravascular ou subaracnóidea inadvertida). Solução contínua: bupivacaína 0,0625–0,125% + fentanil 2 mcg/mL (PCEA: Patient-Controlled Epidural Analgesia).

**Benefícios:** Alívio eficaz da dor (EVA de 8–9 → 1–2); reduz catecolaminas maternas e melhora fluxo uteroplacentário; facilita progressão do TP em pacientes tensas; permite conversão para cesárea sem anestesia geral.

**Efeitos adversos e manejo:**

| Efeito Adverso | Mecanismo | Frequência | Tratamento |
|---|---|---|---|
| Hipotensão materna | Bloqueio simpático → vasodilatação | 10–30% | Decúbito lateral esquerdo; SF 500 mL IV; efedrina 5–10 mg IV (vasopressor de escolha na gestante) OU fenilefrina 100–200 mcg IV |
| Bradicardia fetal reflexa | Hipotensão materna → queda do fluxo uteroplacentário | Associada à hipotensão | Tratar a hipotensão materna; O2 suplementar |
| Cefaleia pós-punção dural | Punção inadvertida da dura-máter (< 1% dos procedimentos) | < 1% | Repouso; analgesia; blood patch peridural se ≥ 24h |
| Retenção urinária | Bloqueio de S2–S4 | 10–20% | Sondagem vesical de demora durante o peridural |
| Prurido | Opioides no LCR (se neuroaxial) | 20–60% com opioides | Nalbuphine 5 mg IV ou naloxona 0,04 mg IV |

**Momento ideal:** não existe momento definido. Analgesia pode ser iniciada a qualquer dilatação se a mãe solicitar (ACOG 2019 — não há dilatação mínima necessária).

---

### 8. Distocias — Classificação Completa e Conduta

| Tipo | Subtipo | Causa | Diagnóstico | Conduta |
|---|---|---|---|---|
| Distocia funcional — Hipodinâmia | Hipossistolia (< 3 contrações/10 min de < 30 s) | Sedação, desidratação, fase latente | Tokografia (IUPC ou externo) | Deambulação + hidratação + ocitocina IV (dose inicial: 1–2 mUI/min; aumentar 1–2 mUI/min a cada 30–60 min; máx 40 mUI/min) |
| Distocia funcional — Hiperdinâmia | Taquissistolia (> 5 contrações/10 min) / Hipertonia (tônus basal > 15 mmHg) | Excesso de ocitocina ou misoprostol; descolamento de placenta | Tokografia; sofrimento fetal associado | Suspender ocitocina/misoprostol; decúbito lateral; O2; SF 500 mL; tocolítico (terbutalina 0,25 mg SC) se não resolver |
| Distocia mecânica — DCP | Desproporção cefalopélvica relativa ou absoluta | Pelve estreita, macrossomia, deflexão cefálica | Clínica + pelvimetria (índice de Mengert) + radiologia se necessário | Relativa: prova de TP com ocitocina; Absoluta: cesárea |
| Distocia de posição | OPP (occipital posterior persistente) | Rotação interna incompleta | Toque vaginal: sutura sagital no diâmetro AP | Esperar rotação espontânea; decúbito sobre o dorso fetal; rotação manual ou fórcipe de Kjelland |
| Distocia de apresentação | Sincipital, de fronte, de face | Deflexão primária do polo cefálico | Toque vaginal: palpação do nariz, boca, órbitas | Fronte: cesárea. Face mento-anterior: parto vaginal possível. Face mento-posterior: cesárea |
| Distocia de ombro | Cabeça nascida + ombros impactados na sínfise | Macrossomia, DM, pelve platipeloide | Cabeça "retrai" após desprendimento (sinal da tartaruga) | Manobra de McRoberts (hiperfletir coxas) + pressão suprapúbica; Woods; Rubin; Gaskin (all-fours); zancleta (último recurso) |

---

### 9. Assistência ao 3° Período e Hemorragia Pós-Parto

**Manejo ativo do 3° período (MATEP) — padrão OMS e FEBRASGO:**
1. Ocitocina 10 UI IM (ou 5 UI IV lento) no nascimento do ombro anterior (não aguardar nascimento da placenta)
2. Tração controlada do cordão após sinal de separação placentária (globo de segurança de Pinard, alongamento do cordão, jato de sangue)
3. Massagem uterina pós-parto da placenta (recomendada pela OMS 2012; discutida em revisões recentes — não mais mandatória isoladamente)

O MATEP reduz hemorragia pós-parto (HPP) em 60% comparado ao manejo expectante.

**Hemorragia Pós-Parto — 4 Ts:**

| T | Causa | Frequência | Diagnóstico | Tratamento Inicial |
|---|---|---|---|---|
| Tônus | Atonia uterina (útero flácido não contrai) | 70–80% da HPP | Útero amolecido, sem globo de segurança | Massagem bimanual + ocitocina 20–40 UI em SF 500 mL IV; misoprostol 800 mcg SL; metilergometrina 0,2 mg IM (contraindicada: HAS); ácido tranexâmico 1g IV |
| Tecido | Retenção de fragmentos placentários | 10% | Placenta incompleta; cotilédones ausentes no exame; sangramento persistente com útero contraído | Revisão da placenta e curetagem uterina |
| Trauma | Laceração de colo, vagina, períneo; ruptura uterina | 15–20% | Exame do canal de parto; hipotensão + útero contraído | Sutura das lacerações; laparotomia na ruptura uterina |
| Trombina | Coagulopatia (CIVD, pré-eclâmpsia, HELLP, embolia de líquido amniótico) | < 5% | PT/INR elevados; fibrinogênio < 200 mg/dL; plaquetas < 50.000 | PFC, crioprecipitado, plaquetas; tratar causa base |

**Escalonamento na atonia uterina refratária:**
- Step 1: Massagem bimanual + ocitocina
- Step 2: Ácido tranexâmico 1g IV em 10 min (reduz mortalidade por HPP em 31% — WOMAN Trial 2017)
- Step 3: Misoprostol 800 mcg SL + metilergometrina IM + carboprost (PGF2α) 0,25 mg IM (repetir a cada 15 min; máx 8 doses; contraindicado em asma)
- Step 4: Balão intrauterino de tamponamento (Bakri balloon 300–500 mL)
- Step 5: Cirurgia — suturas compressivas (B-Lynch), ligadura bilateral das artérias uterinas, ligadura das hipogástricas, histerectomia de emergência

---

### 10. Lacerações Perineais — Classificação e Reparo

| Grau | Estruturas Comprometidas | Abordagem |
|---|---|---|
| I | Pele e mucosa vaginal (subcutâneo intacto) | Sutura simples com absorvível 2-0 ou 3-0 OU expectante (< 2 cm) |
| II | Musculatura perineal superficial (bulboesponjoso, transverso superficial) sem comprometimento do esfíncter anal | Sutura por planos: mucosa vaginal → músculos → pele |
| IIIa | < 50% do esfíncter anal externo | Sutura de esfíncter com PDS 3-0 (sutura interrupted end-to-end) |
| IIIb | > 50% do esfíncter anal externo | Sutura de esfíncter + antibiótico + dieta laxativa pós-op |
| IIIc | Esfíncter externo + interno | Sutura de ambos os esfíncteres; acompanhamento de continência anal |
| IV | Esfíncter anal externo + interno + mucosa retal | Cirurgia em centros especializados; sutura em camadas; profilaxia antibiótica obrigatória |

**Episiotomia:** NÃO é procedimento de rotina (ACOG 2016, OMS, FEBRASGO 2023). Indicações restritas: parto operatório (fórcipe), ombros distócicos com manobra iminente, períneo rígido com iminência de laceração IV, sofrimento fetal agudo no período expulsivo com necessidade de abreviar. Preferir episiotomia médio-lateral (45° da linha médica) — menor risco de extensão para esfíncter anal comparado à mediana.

---

### 11. Caso Clínico — Primigesta com CTG Categoria III

**Cenário:** Primigesta, 22 anos, 39 semanas e 2 dias, G1P0, admitida às 08h com dinâmica regular (3 contrações/10 min de 40 s) e dilatação de 4 cm, apagamento 80%, apresentação cefálica em OEA no plano –2 de De Lee, bolsa íntegra. Bishop Score: 9. FCF: 148 bpm, variabilidade moderada, 3 acelerações em 20 min — **CTG Categoria I**. Iniciada analgesia peridural às 11h (dilatação 6 cm). Reavaliação às 14h: dilatação 7 cm (0,5 cm/h — abaixo de 1 cm/h esperado para primigesta). Amniotomia e ocitocina 2 mUI/min iniciadas. Às 16h: dilatação 9 cm; FCB 160 bpm, variabilidade mínima (3 bpm), sem acelerações, DIP II após CADA contração. Dinâmica: 4 contrações/10 min.

**Análise por parâmetros:**
- Dilatação: 7 cm → 9 cm em 2h com ocitocina (1 cm/h = no limite); cruzou a linha de alerta às 14h
- CTG: FCB 160 + variabilidade mínima (< 5 bpm) + DIP II recorrentes → Categoria III (patológica) = sofrimento fetal por insuficiência uteroplacentária

**Conduta imediata:**
1. Posicionar em decúbito lateral esquerdo (descomprime a aorta/veia cava — melhora fluxo uteroplacentário)
2. O2 suplementar 10 L/min por máscara com reservatório
3. Suspender ocitocina imediatamente (reduz taquissistolia iatrógena)
4. SF 0,9% 500 mL IV rápido (melhora volemia e perfusão placentária)
5. Verificar: bolsa rota (líquido amniótico limpo/meconiado), posição do cordão, PA materna
6. Realizar toque: dilatação 9 cm (quase plena), apresentação no plano 0 de De Lee
7. Aguardar 5–10 min com manobras: SE não houver recuperação da CTG → CESÁREA DE URGÊNCIA (sem tempo para atingir 10 cm com CTG Cat III persistente)
8. Convocar equipe cirúrgica e neonatologista imediatamente; preparar sala cirúrgica

**Resultado simulado:** CTG sem recuperação em 8 min → cesárea de urgência. RN nasce com Apgar 4/8. Gasometria de cordão: pH 7,18, pO2 18 mmHg, déficit de base -9. RN com suporte em berçário de alto risco; alta materna em 48h.

> DIP II recorrentes + variabilidade mínima é a combinação mais ominosa na CTG intraparto. A variabilidade moderada (6–25 bpm) é o sinal mais tranquilizador de bem-estar fetal — sua ausência, mais do que o DIP isolado, justifica a urgência da decisão.

---

### Referências
- FEBRASGO. Assistência ao Parto Normal. Protocolo FEBRASGO 2023.
- ACOG Practice Bulletin No. 209: Obstetric Analgesia and Anesthesia. Obstet Gynecol. 2019;133(3):e208–e225.
- ACOG Practice Bulletin No. 116: Management of Intrapartum Fetal Heart Rate Tracings. Obstet Gynecol. 2010;116(5):1232–1240.
- WHO Recommendations: Intrapartum Care for a Positive Childbirth Experience. Geneva: WHO; 2018.
- Ministério da Saúde. Diretrizes Nacionais de Assistência ao Parto Normal. Brasília: MS; 2017.
- Shakur H et al. Effect of early tranexamic acid administration on mortality, hysterectomy, and other morbidities in women with post-partum haemorrhage (WOMAN): an international, randomised, double-blind, placebo-controlled trial. Lancet. 2017;389(10084):2105–2116.`, ativo: true,
    },
    {
      titulo: 'Câncer de Colo do Útero',
      descricao: 'HPV, rastreamento (Papanicolaou), colposcopia, estadiamento e tratamento do CCU.',
      disciplina: 'Ginecologia', tema: 'Oncologia Ginecológica', tipo: 'texto', nivel: 'intermediario',
      duracao: 35, ordem: 4, mes: 4, semana: 1,
      videoUrl: null, conteudo: `## Câncer de Colo do Útero

**Base:** FEBRASGO 2022 | INCA 2022 | FIGO Staging 2018 | WHO HPV Vaccines 2022

---

### Epidemiologia e Fatores de Risco

O câncer de colo do útero (CCU) é o 3° câncer mais comum entre mulheres no Brasil. Quase 100% dos casos têm relação causal com o HPV.

| Fator de risco | Detalhe |
|----------------|---------|
| HPV oncogênico | HPV 16 (carcinoma escamoso) e HPV 18 (adenocarcinoma) = 70% dos casos |
| Tabagismo | Aumenta risco em 2× |
| Múltiplos parceiros | Aumenta exposição ao HPV |
| Imunodeficiência | HIV, transplantadas — progressão mais rápida |
| Início precoce da atividade sexual | Metaplasia escamo-colunar mais susceptível |

---

### Carcinogênese — NIC (Neoplasia Intraepitelial Cervical)

| Grau | Equivalente Bethesda | Comprometimento epitelial | Regressão espontânea |
|------|---------------------|--------------------------|----------------------|
| NIC I | LSIL | 1/3 inferior | 60–70% |
| NIC II | HSIL (borderline) | 2/3 inferior | 40–50% |
| NIC III / Ca in situ | HSIL | Espessura total | < 20% |
| Carcinoma invasor | — | Rompe membrana basal | — |

> **Conceito-chave:** A progressão NIC I → III → Carcinoma leva em média 10–15 anos, permitindo detecção precoce pelo rastreamento.

---

### Rastreamento — Papanicolaou (Exame Citopatológico)

**Quando iniciar:** aos 25 anos (ou após início da atividade sexual, se anterior)
**Frequência:** anual nos primeiros 2 exames normais; depois **a cada 3 anos**
**Quando parar:** aos 64 anos, se 2 exames normais consecutivos nos últimos 5 anos

| Resultado | Conduta |
|-----------|---------|
| Normal | Repetir conforme intervalo de rastreamento |
| ASC-US (1ª vez) | Repetir em 6 meses ou teste de HPV |
| ASC-US (2° consecutivo) | Colposcopia |
| ASC-H | Colposcopia imediata |
| LSIL | Repetir em 6 meses (< 25 anos) ou colposcopia (≥ 25 anos) |
| HSIL | Colposcopia imediata + biópsia |
| Carcinoma | Encaminhamento oncológico urgente |

---

### Colposcopia e Biópsia

**Indicações:** ASC-US persistente, ASC-H, LSIL em adultas, HSIL, qualquer anormalidade glandular.

Achados colposcópicos suspeitos (IFCPC 2011):
- **Grau 1 (menor):** epitélio aceto-branco tênue, mosaico fino, pontilhado fino
- **Grau 2 (maior):** epitélio aceto-branco denso, mosaico grosso, pontilhado grosso, borda interna
- **Suspeita de invasão:** vasos atípicos, superfície irregular, necrose

**Conização (LEEP/CAF):** tratamento de NIC II e III confirmados por biópsia; margem livre é o objetivo.

---

### Estadiamento FIGO 2018

| Estágio | Descrição | Sobrevida 5 anos |
|---------|-----------|-----------------|
| IA1 | Microinvasão < 3 mm profundidade | ~98% |
| IA2 | Microinvasão 3–5 mm | ~95% |
| IB1 | Tumor < 2 cm confinado ao colo | ~90% |
| IB2 | Tumor 2–4 cm confinado ao colo | ~80% |
| IB3 | Tumor > 4 cm confinado ao colo | ~70% |
| IIA | Extensão a 2/3 superiores da vagina | ~60% |
| IIB | Infiltração parametrial | ~50% |
| IIIA | Terço inferior da vagina | ~35% |
| IIIB | Parede pélvica ou hidronefrose | ~30% |
| IVA | Bexiga ou reto | ~15% |
| IVB | Metástases à distância | ~5% |

---

### Tratamento por Estágio

| Estágio | Tratamento |
|---------|-----------|
| NIC II/III | Conização (LEEP) — margens livres |
| IA1 (sem invasão linfovascular) | Conização se desejo de fertilidade; histerectomia simples |
| IA2 – IB1 | Histerectomia radical (Wertheim-Meigs) + linfadenectomia pélvica |
| IB2 – IIB | Radioterapia externa + braquiterapia + cisplatina concomitante |
| III – IVA | Quimiorradioterapia definitiva |
| IVB | Quimioterapia paliativa ± imunoterapia (pembrolizumabe) |

---

### Vacina HPV — Esquema no SUS

| Grupo | Esquema | Doses |
|-------|---------|-------|
| 9–14 anos (saudáveis) | 0 e 6 meses | 2 doses |
| 15–45 anos ou imunossuprimidos | 0, 2 e 6 meses | 3 doses |
| HIV positivos (9–45 anos) | 0, 2 e 6 meses | 3 doses |

Vacinas disponíveis no SUS: **Gardasil 4 (HPV 6, 11, 16, 18)** e **Cervarix (HPV 16, 18)**.

> **Importante:** A vacina NÃO substitui o rastreamento com Papanicolaou. Mulheres vacinadas devem continuar o rastreamento normalmente.

---

### Caso Clínico

Mulher, 32 anos, assintomática, último Papanicolaou há 3 anos: normal. Atual: HSIL. Nega sangramento, corrimento ou dispareunia.

**Análise:**
- HSIL = indicação imediata de colposcopia + biópsia dirigida
- Se biópsia confirmar NIC III: conização por LEEP com margens livres
- Se margens comprometidas: nova conização ou histerectomia (conforme desejo reprodutivo)
- Seguimento pós-conização: Papanicolaou em 6 meses, 12 meses, depois anual por 2 anos

> **Atenção:** HSIL em mulher jovem não dispensa investigação — risco de carcinoma invasor subjacente é de ~2%.`, ativo: true,
    },
    {
      titulo: 'Contracepção e Planejamento Familiar',
      descricao: 'Métodos contraceptivos, eficácia (índice de Pearl), contraindicações e anticoncepção de emergência.',
      disciplina: 'Ginecologia', tema: 'Ginecologia Geral', tipo: 'texto', nivel: 'basico',
      duracao: 30, ordem: 5, mes: 4, semana: 2,
      videoUrl: null, conteudo: `## Contracepção e Planejamento Familiar

**Base:** FEBRASGO 2019 | OMS Medical Eligibility Criteria 2015 | MS Planejamento Familiar 2013

---

### Eficácia — Índice de Pearl (gestações/100 mulheres/ano)

| Método | Uso perfeito | Uso típico |
|--------|-------------|------------|
| Implante subdérmico (etonogestrel) | 0,05 | 0,05 |
| DIU-LNG (Mirena) | 0,1–0,2 | 0,1–0,2 |
| DIU de cobre | 0,6 | 0,8 |
| Laqueadura tubária | 0,5 | 0,5 |
| Vasectomia | 0,1 | 0,15 |
| Injetável mensal (cipionato/enantato) | 0,05 | 3 |
| Injetável trimestral (DMPA 150 mg) | 0,3 | 3 |
| ACO combinado | 0,3 | 8 |
| Minipílula (progestágeno puro) | 0,3 | 8 |
| Preservativo masculino | 2 | 18 |
| Preservativo feminino | 5 | 21 |
| Diafragma + espermicida | 6 | 12 |
| Coito interrompido | 4 | 22 |
| Tabelinha (Ogino-Knaus) | 3 | 24 |

---

### Métodos Hormonais

**ACO combinado (estrogênio + progestágeno):**
- Mecanismo: inibição da ovulação, espessamento do muco cervical, atrofia endometrial
- Apresentações: 21 cp ativos + 7 placebo, ou contínuo

**Contraindicações absolutas (OMS Cat 4):**

| Condição | Motivo |
|----------|--------|
| Tromboembolismo venoso atual ou prévio | Risco aumentado pela estrogênio |
| AVC ou doença cardíaca isquêmica | Risco cardiovascular |
| > 35 anos + tabagismo > 15 cigarros/dia | Risco trombótico sinérgico |
| Migrânea com aura | Risco de AVC isquêmico |
| Câncer de mama atual | Tumor hormônio-dependente |
| Doença hepática grave | Metabolismo comprometido |
| Amamentação < 6 semanas pós-parto | Estrogênio reduz produção de leite |

**Progestágenos puros (minipílula, injetável, implante, DIU-LNG):**
- Podem ser usados em amamentação (a partir de 6 semanas), cardiopatas, trombofílicas

---

### Dispositivos Intrauterinos (DIU)

| Tipo | Mecanismo | Duração | Indicação especial |
|------|-----------|---------|-------------------|
| DIU de cobre (TCu 380A) | Espermicida, alteração endometrial | 10 anos | Anticoncepção de emergência (até 5 dias) |
| DIU-LNG 52 mg (Mirena) | Suprime ovulação + muco + endométrio | 5–7 anos | Menorragia, endometriose |
| DIU-LNG 13,5 mg (Kyleena) | Progestágeno local | 5 anos | Nulíparas |

> **Mito derrubado:** DIU NÃO é abortivo e pode ser usado em nulíparas.

---

### Métodos Cirúrgicos

**Laqueadura tubária:**
- Indicação: mulher com ≥ 25 anos ou 2 filhos vivos + prazo de reflexão de 60 dias (Lei 9.263/1996)
- Técnicas: Pomeroy, Filshie clips, salpingectomia total (reduz risco de Ca de ovário)

**Vasectomia:**
- Ambulatorial, menor morbimortalidade que laqueadura
- Confirmar azoospermia em 3 meses (2 amostras)

---

### Anticoncepção de Emergência (AE)

| Método | Esquema | Prazo | Eficácia |
|--------|---------|-------|---------|
| Levonorgestrel 1,5 mg | Dose única VO | Até 72 h (eficácia reduz com o tempo) | ~85% |
| Acetato de ulipristal 30 mg (ella) | Dose única VO | Até 120 h | ~85–90% |
| Método Yuzpe (ACO combinado) | 2 doses de 100 mcg EE + 500 mcg LNG (0h e 12h) | Até 72 h | ~75% |
| DIU de cobre | Inserção | Até 5 dias | > 99% |

> **Atenção:** AE NÃO é método de uso regular. Não protege contra ISTs. Deve ser orientada como opção após relação desprotegida, não programada.

---

### Planejamento Familiar no SUS

Lei 9.263/1996 — Planejamento Familiar é direito de todo cidadão. O SUS deve oferecer:
- Aconselhamento e orientação sobre todos os métodos
- Oferta gratuita de anticoncepcionais (ACO, injetável, DIU, preservativos, implante)
- Esterilização cirúrgica (laqueadura e vasectomia) mediante critérios legais
- Assistência à concepção para casais com dificuldade de engravidar

---

### Caso Clínico

Mulher, 28 anos, saudável, amamenta filho de 3 meses, quer retardar nova gestação por pelo menos 2 anos. Fuma 5 cigarros/dia.

**Análise:**
- ACO combinado: contraindicado (amamentação < 6 meses = OMS Cat 3; tabagismo adiciona risco)
- Melhor opção: DIU-LNG ou implante subdérmico (alta eficácia, não interfere na lactação, sem estrogênio)
- Alternativa: DIU de cobre (sem hormônio, muito eficaz, 10 anos)
- Orientar sobre preservativo para proteção contra ISTs (não oferecida pelos métodos acima)`, ativo: true,
    },
    // ── Saúde Pública (5 aulas) ──
    {
      titulo: 'SUS: Princípios, Diretrizes e Financiamento',
      descricao: 'Princípios doutrinários e organizativos, bases legais (CF88 + Lei 8080 + Lei 8142), financiamento (EC 29, blocos), regionalização (RRAS, COAP), controle social e RAS. Base: CF 1988 + Lei 8080/1990 + Lei 8142/1990 + PNAB 2017.',
      disciplina: 'Saúde Pública', tema: 'SUS', tipo: 'texto', nivel: 'basico',
      duracao: 40, ordem: 1, mes: 1, semana: 2,
      videoUrl: null,
      conteudo: `## SUS: Princípios, Diretrizes e Financiamento

**Base:** Constituição Federal 1988 (Art. 196–200) + Lei 8.080/1990 + Lei 8.142/1990 + NOAS-SUS 01/2001 + PNAB 2017 + Decreto 7.508/2011

---

### 1. Bases Legais e Marco Normativo

O SUS é fruto da reforma sanitária brasileira, culminada na 8ª Conferência Nacional de Saúde (1986) e consagrada na CF 1988. É o maior sistema público de saúde universal do mundo.

| Norma | Conteúdo Principal |
|---|---|
| CF 1988 — Art. 196 | "Saúde é direito de todos e dever do Estado" — fundamento da universalidade |
| CF 1988 — Art. 198 | Organização regionalizada, descentralização, atendimento integral, participação da comunidade |
| CF 1988 — Art. 200 | Competências do SUS: vigilância sanitária/epidemiológica, saúde do trabalhador, controle de produtos |
| Lei 8.080/1990 | Lei Orgânica da Saúde: organização, competências, princípios e diretrizes |
| Lei 8.142/1990 | Controle social (Conselhos + Conferências) e transferências financeiras intergovernamentais |
| EC 29/2000 + LC 141/2012 | Vinculação de receitas mínimas: municípios 15%, estados 12% |
| NOAS-SUS 01/2001 | Regionalização — PDR, módulos assistenciais, ampliação da atenção básica |
| Decreto 7.508/2011 | Regulamenta Lei 8.080: regiões de saúde, COAP, portas de entrada, comissões intergestores |

### 2. Princípios Doutrinários vs Organizativos

**Princípios Doutrinários** (valores do SUS — o QUE ele defende):

| Princípio | Definição Aprofundada |
|---|---|
| **Universalidade** | Acesso de todos os cidadãos, independente de contribuição, raça, renda ou localização. Rompe com o modelo bismarckiano (saúde só para trabalhadores formais) |
| **Integralidade** | Atenção ao ser humano em sua totalidade — individual + coletivo, prevenção + promoção + cura + reabilitação. Combate à fragmentação do cuidado |
| **Equidade** | Dar mais a quem mais precisa, reconhecendo desigualdades. Ações afirmativas e prioridade para vulneráveis são expressões da equidade |

> Questão clássica de prova: "Qual princípio justifica vagas prioritárias para indígenas ou quilombolas?" Resposta: **Equidade** (não igualdade, não universalidade).

**Princípios Organizativos/Operacionais** (COMO o SUS funciona):

| Princípio | Definição | Base Legal |
|---|---|---|
| **Descentralização** | Comando único em cada esfera — municípios são gestores prioritários | Lei 8.080, Art. 7º |
| **Regionalização e hierarquização** | Redes por território e nível de complexidade crescente | Lei 8.080; NOAS 2001 |
| **Participação da comunidade** | Controle social deliberativo — Conselhos e Conferências de Saúde | Lei 8.142 |
| **Resolutividade** | Cada nível deve resolver o que é de sua competência | Lei 8.080 |
| **Complementaridade do setor privado** | Quando o SUS não supre, pode contratar privado — preferência a entidades filantrópicas | Lei 8.080, Art. 24 |

### 3. Financiamento do SUS

**Fontes de financiamento:**
- Recursos da Seguridade Social (COFINS, CSLL, contribuição sobre concursos/prognósticos)
- Orçamentos fiscais da União, dos Estados e dos Municípios

**Blocos de financiamento federal (Portaria GM/MS 3.992/2017):**

| Bloco | Conteúdo |
|---|---|
| Atenção Básica (PREVINE BRASIL) | Capitação ponderada por equipe ESF + pagamento por desempenho |
| Média e Alta Complexidade (MAC) | Procedimentos ambulatoriais e hospitalares — Tabela SIA-SUS e SIH-SUS |
| Vigilância em Saúde | Epidemiológica, sanitária, saúde do trabalhador, ambiental |
| Assistência Farmacêutica | Componente básico, estratégico (AIDS, TB) e especializado (CEAF) |
| Gestão do SUS | Regulação, controle, avaliação, auditoria |

> EC 29/2000 + LC 141/2012: municípios devem aplicar mínimo 15% da receita em saúde. A não aprovação do relatório de gestão pelo Conselho de Saúde implica suspensão dos repasses federais (Lei 8.142, Art. 4º).

### 4. Regionalização e Redes de Atenção à Saúde (RAS)

**Instrumentos de regionalização:**
- **PDR (Plano Diretor de Regionalização):** mapeamento das regiões de saúde e fluxos assistenciais
- **PDI (Plano Diretor de Investimento):** recursos para reduzir vazios assistenciais
- **COAP (Contrato Organizativo de Ação Pública da Saúde):** pactuação entre entes federados sobre oferta de serviços na região (Decreto 7.508/2011)

**Redes Temáticas Prioritárias (Portaria 4.279/2010):**

| Rede | Público-alvo |
|---|---|
| Rede Cegonha | Gestantes, recém-nascidos, crianças até 24 meses |
| Rede de Urgência e Emergência (RUE) | Trauma, AVC, infarto, urgências em geral |
| Rede de Atenção Psicossocial (RAPS) | Saúde mental, álcool e outras drogas |
| Rede de Atenção Oncológica | Diagnóstico, tratamento e cuidados paliativos |
| Rede de Atenção às Doenças Crônicas | HAS, DM, DPOC, obesidade |

### 5. Controle Social: Conselhos e Conferências

| Instância | Composição | Competência |
|---|---|---|
| **Conselho de Saúde** (municipal/estadual/nacional) | Paritário: 50% usuários + 25% trabalhadores + 25% gestores e prestadores | **Deliberativo** — aprova plano de saúde, orçamento e relatório de gestão; fiscaliza o SUS |
| **Conferência de Saúde** (a cada 4 anos) | Representação ampliada da sociedade | **Propositiva** — avalia situação de saúde e propõe diretrizes para as políticas |

> O Conselho de Saúde é **deliberativo** (decide), não apenas consultivo. A Conferência é **propositiva** (recomenda). Confundir os dois é erro frequente em prova.

### 6. Atenção Primária à Saúde (APS) — PNAB 2017 + PREVINE BRASIL 2019

- **ESF:** médico + enfermeiro + técnico de enfermagem + ACS + equipe de saúde bucal (dentista + ASB/TSB)
- Cada equipe: adstrição de até 4.000 pessoas (ideal 3.000–3.500)
- **NASF-AB:** multiprofissional de apoio — fisio, psico, nutricionista, farmacêutico (apoio matricial)
- **PREVINE BRASIL:** capitação ponderada (vulnerabilidade social pondera o valor) + pagamento por desempenho + incentivo por ações estratégicas (pré-natal, citopatológico, HbA1c)

### 7. Questões Típicas de Prova

**Q1 (REVALIDA):** "Município aplica 13% da receita em saúde. Qual norma define o mínimo e qual o percentual correto?"
Resposta: EC 29/2000 + LC 141/2012 — mínimo 15% para municípios.

**Q2 (ENARE):** "Qual instrumento formaliza a pactuação entre municípios de uma região de saúde para serviços especializados?"
Resposta: COAP — Contrato Organizativo de Ação Pública da Saúde (Decreto 7.508/2011).

**Q3 (UERJ):** "O Conselho Municipal de Saúde reprovou o relatório de gestão anual. Qual consequência?"
Resposta: Suspensão dos repasses federais do FNS ao município (Lei 8.142, Art. 4º).

**Q4 (FMUSP):** "Qual princípio do SUS fundamenta a preferência no atendimento a populações em maior vulnerabilidade social?"
Resposta: Equidade — reconhece desigualdades e prioriza ações para reduzi-las.`, ativo: true,
    },
    {
      titulo: 'Epidemiologia: Indicadores de Saúde',
      descricao: 'Indicadores demográficos e de morbidade, validade de testes diagnósticos (Se/Sp/VPP/VPN/RV), epidemiologia analítica (RR, OR, PAR, NNT), desenhos de estudo. Base: OMS/OPAS + MS Brasil 2023.',
      disciplina: 'Saúde Pública', tema: 'Epidemiologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 47, ordem: 2, mes: 2, semana: 3,
      videoUrl: null, conteudo: `## Epidemiologia: Indicadores de Saúde

**Base:** OMS/OPAS 2023 + MS Brasil — Indicadores de Saúde 2023 + Gordis Epidemiology 6ª Ed. + Fletcher & Fletcher — Clinical Epidemiology

---

### 1. Indicadores Demográficos e de Mortalidade

Os indicadores de saúde são medidas que sintetizam informações sobre o estado de saúde de uma população, permitindo planejamento, avaliação e comparações.

| Indicador | Fórmula | k | Interpretação |
|---|---|---|---|
| **Coeficiente de Mortalidade Geral** | Óbitos totais ÷ População média | × 1.000 | Mortalidade proporcional à população; influenciado pela estrutura etária |
| **Mortalidade Infantil (CMI)** | Óbitos < 1 ano ÷ Nascidos Vivos | × 1.000 | Proxy de qualidade de saúde materno-infantil e desenvolvimento social |
| **Mortalidade Neonatal Precoce** | Óbitos 0–6 dias ÷ NV | × 1.000 | Causas obstétricas e neonatais |
| **Mortalidade Neonatal Tardia** | Óbitos 7–27 dias ÷ NV | × 1.000 | Infecções, prematuridade |
| **Mortalidade Pós-Neonatal** | Óbitos 28 dias–< 1 ano ÷ NV | × 1.000 | Causas ambientais, nutrição, infecções |
| **Mortalidade Materna (RMM)** | Óbitos maternos ÷ NV | × 100.000 | Qualidade da assistência obstétrica |
| **Esperança de Vida ao Nascer** | Anos médios esperados de vida para um recém-nascido | — | Brasil 2023: ~76 anos |

> Brasil 2023: Mortalidade infantil ~12/1.000 NV (ODS: < 25/1.000 NV até 2030). Mortalidade materna ~50–60/100.000 NV — muito acima das metas da OMS (< 30). Causas principais: hipertensão (DHEG), hemorragia, infecção.

### 2. Indicadores de Morbidade

| Indicador | Fórmula | O que mede |
|---|---|---|
| **Incidência** | Casos novos ÷ População sob risco × k | Risco de adoecer em período definido — mede velocidade de ocorrência |
| **Prevalência puntual** | Casos totais (momento) ÷ População total × k | Fotografia da doença em um instante — mede carga da doença |
| **Prevalência de período** | Casos totais (período) ÷ População × k | Carga da doença em intervalo de tempo |
| **Letalidade** | Óbitos pela doença ÷ Casos × 100 | Gravidade da doença — proporção de doentes que morrem |
| **Mortalidade proporcional** | Óbitos por causa X ÷ Total de óbitos × 100 | Importância relativa de cada causa de morte |

> **Relação fundamental de Muench:** Prevalência ≈ Incidência × Duração média da doença. Doenças crônicas de longa duração (HAS, DM) têm alta prevalência mesmo com incidência moderada.

**Curva de mortalidade proporcional (Curva de Nelson de Moraes):**
- Países desenvolvidos: forma de "J" — alta mortalidade em < 1 ano, depois baixa até adulto jovem, depois sobe nos idosos
- Países subdesenvolvidos: forma de "U" invertido — alta mortalidade em < 1 ano + alta em adultos jovens (violência, doenças infecciosas)

### 3. Validade dos Testes Diagnósticos

Para uma tabela 2×2 com Doença (D+/D–) e Teste (T+/T–):
- VP = verdadeiro positivo | FP = falso positivo | FN = falso negativo | VN = verdadeiro negativo

| Indicador | Fórmula | Interpretação Clínica |
|---|---|---|
| **Sensibilidade (Se)** | VP ÷ (VP + FN) | Proporção de doentes que testam positivo. Alta Se → poucos FN → boa triagem. Mnemônico: **SnNout** (Se alta = Negative rules OUT) |
| **Especificidade (Sp)** | VN ÷ (VN + FP) | Proporção de não-doentes que testam negativo. Alta Sp → poucos FP → boa confirmação. Mnemônico: **SpPin** (Sp alta = Positive rules IN) |
| **VPP** | VP ÷ (VP + FP) | Probabilidade de ter a doença dado teste positivo. Depende da prevalência — sobe com prevalência alta |
| **VPN** | VN ÷ (VN + FN) | Probabilidade de não ter a doença dado teste negativo. Sobe com prevalência baixa |
| **Razão de Verossimilhança +** | Se ÷ (1 – Sp) | RV+ > 10 = forte evidência para confirmar diagnóstico |
| **Razão de Verossimilhança –** | (1 – Se) ÷ Sp | RV– < 0,1 = forte evidência para excluir diagnóstico |

> Efeito da prevalência: em população de baixa prevalência (triagem populacional), mesmo um teste com 95% de Sp terá muitos FP — VPP cai drasticamente. Por isso mamografia de triagem tem VPP menor que mamografia diagnóstica.

### 4. Epidemiologia Analítica: Medidas de Associação

| Medida | Tipo de Estudo | Fórmula | Interpretação |
|---|---|---|---|
| **RR (Risco Relativo)** | Coorte | Incidência expostos ÷ Incidência não-expostos | RR = 3 → expostos têm 3× mais risco |
| **OR (Odds Ratio)** | Caso-controle | (a/b) ÷ (c/d) = ad/bc | Aproxima RR se doença rara (< 10%); OR > 1 = fator de risco |
| **RA (Risco Atribuível)** | Coorte | Ie – Io (diferença absoluta de risco) | Impacto causal: quanto a exposição contribui |
| **PAR% (Fração Atribuível Populacional)** | Coorte/caso-controle | (Pt – Po) ÷ Pt × 100 | Proporção de casos na população atribuível à exposição |
| **NNT** | ECR | 1 ÷ RAR (Redução Absoluta do Risco) | Quantos tratar para prevenir 1 evento — menor = melhor |
| **NNH** | ECR | 1 ÷ AAR (Aumento Absoluto do Risco) | Quantos tratar para causar 1 dano — maior = mais seguro |

> Diferença entre RR e OR: em doenças raras, OR ≈ RR. Em doenças comuns (prevalência > 10%), OR superestima o RR. No estudo caso-controle, só se calcula OR (não RR, pois não conhecemos a incidência na população).

### 5. Desenhos de Estudos Epidemiológicos

| Desenho | Direção | Medida | Vantagens | Limitações |
|---|---|---|---|---|
| **Coorte** (prospectivo/retrospectivo) | Exposição → Desfecho | RR, RA, incidência | Causalidade temporal; incidência real | Caro, longo, viés de perda de seguimento |
| **Caso-controle** | Desfecho → Exposição (retrospectivo) | OR | Rápido, barato, bom para doenças raras | Viés de memória (recall bias); não calcula incidência |
| **Transversal (seccional)** | Simultâneo | Prevalência, OR | Rápido, prevalência | Não estabelece causalidade; viés de prevalência |
| **ECR (Ensaio Clínico Randomizado)** | Intervenção → Desfecho | NNT, RRR, RAR | Padrão ouro para eficácia; controla confundidores | Caro, ético, curto prazo, critérios de inclusão estreitos |
| **Metanálise/Revisão Sistemática** | Síntese | Efeito combinado | Maior poder estatístico | Qualidade depende dos estudos primários; heterogeneidade |

> Hierarquia de evidências (Oxford): Metanálise/RS de ECR > ECR > Coorte > Caso-controle > Transversal > Série de casos > Opinião de especialista.

### 6. Caso Clínico com Cálculo

**Enunciado:** Em estudo de coorte com 1.000 tabagistas e 1.000 não-tabagistas seguidos por 10 anos, 120 tabagistas desenvolveram DPOC vs. 30 não-tabagistas.

**Tabela 2×2:**

| | DPOC+ | DPOC– | Total |
|---|---|---|---|
| Tabagistas | 120 | 880 | 1.000 |
| Não-tabagistas | 30 | 970 | 1.000 |

**Cálculos:**
- Incidência em tabagistas = 120/1.000 = 12%
- Incidência em não-tabagistas = 30/1.000 = 3%
- **RR = 12% ÷ 3% = 4,0** → tabagistas têm 4× mais risco de DPOC
- **RA = 12% – 3% = 9%** → 9% dos tabagistas desenvolveram DPOC atribuível ao tabagismo
- **NNT (para intervenção que elimina tabagismo):** se cessar tabaco elimina o risco extra → RAR = 9% → NNT = 1/0,09 ≈ **11 pessoas**

Se fosse estudo caso-controle com mesmos números:
- **OR = (120 × 970) ÷ (880 × 30) = 116.400 ÷ 26.400 = 4,41**
- Note: OR (4,41) > RR (4,0) — OR superestima RR quando doença NÃO é rara (incidência 12%)`, ativo: true,
    },
    {
      titulo: 'Vigilância Epidemiológica',
      descricao: 'SINAN, notificação compulsória, investigação de surtos, controle de doenças endêmicas e epidêmicas.',
      disciplina: 'Saúde Pública', tema: 'Epidemiologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 30, ordem: 3, mes: 3, semana: 3,
      videoUrl: null, conteudo: `## Vigilância Epidemiológica

**Base:** Lei 6.259/1975 | Portaria MS 264/2020 (Lista DNC) | Decreto 7.616/2011 (ESPIN) | SINAN/SVS

---

### Conceito e Objetivos

Vigilância epidemiológica é o **conjunto de ações que proporciona o conhecimento, a detecção ou prevenção de qualquer mudança nos fatores determinantes e condicionantes de saúde individual ou coletiva**, com a finalidade de recomendar e adotar medidas de prevenção e controle das doenças ou agravos.

**Objetivos principais:**
- Detecção precoce de surtos e epidemias
- Monitoramento de doenças endêmicas
- Avaliação de impacto de medidas de controle
- Geração de informações para tomada de decisão

---

### Doenças de Notificação Compulsória (DNC) — Lista 2024

**Categorias segundo urgência:**

| Categoria | Prazo | Exemplos |
|-----------|-------|---------|
| **Imediata** (24 h — risco de ESPIN) | 24 horas | Ébola, febre amarela, poliomielite, varíola dos macacos (mpox), SRAG, botulismo alimentar |
| **Semanal** | 7 dias | Dengue, chikungunya, sífilis congênita, hepatite B, leptospirose, meningite, leishmaniose |
| **Mensal** | Mensal | Hanseníase, tracoma, filariose, doença de Chagas crônica |

**Doenças de notificação imediata relevantes para provas:**

| Doença | Prazo especial |
|--------|---------------|
| Febre amarela | Imediata (2 h se suspeita) |
| Poliomielite | Imediata |
| Sarampo e Rubéola | Imediata |
| Ébola e Marburg | Imediata |
| Mpox (varíola dos macacos) | Imediata |
| Botulismo | Imediata |
| Raiva humana | Imediata |

> **Atenção:** A notificação é obrigatória para todos os profissionais de saúde e estabelecimentos. O não cumprimento é infração sanitária.

---

### SINAN — Sistema de Informação de Agravos de Notificação

- **Finalidade:** coleta, transmissão e processamento de dados sobre agravos de notificação compulsória
- **Fluxo:** Notificante (UBS/hospital) → Secretaria Municipal de Saúde → Secretaria Estadual → SVS/MS
- **Fichas:** Ficha de Notificação + Ficha de Investigação (específica por agravo)
- **Dados gerados:** incidência, prevalência, coeficientes de mortalidade, distribuição geográfica/temporal

---

### Cadeia Epidemiológica

| Elo | Exemplos de medidas de controle |
|-----|--------------------------------|
| Agente etiológico | Desinfecção, esterilização, antibióticos |
| Reservatório | Tratamento de doentes, eliminação de vetores |
| Porta de saída | EPI, isolamento de casos |
| Via de transmissão | Saneamento, potabilidade da água, pasteurização |
| Porta de entrada | Higiene das mãos, uso de preservativo |
| Hospedeiro susceptível | Vacinação, quimioprofilaxia, educação em saúde |

---

### Investigação de Surtos

**Definição:** Surto = ≥ 2 casos de mesma doença com vínculo epidemiológico (tempo, lugar, pessoa).

**Etapas da investigação:**
1. Confirmar diagnóstico e existência do surto
2. Estabelecer definição de caso (sensível na fase inicial)
3. Busca ativa de casos
4. Descrever o surto (curva epidêmica, distribuição geográfica, características dos casos)
5. Formular hipóteses sobre fonte e modo de transmissão
6. Testar hipóteses (estudo analítico: caso-controle ou coorte)
7. Implementar medidas de controle
8. Comunicar e documentar

**Tipos de curva epidêmica:**

| Tipo | Padrão | Sugere |
|------|--------|--------|
| Pico único, estreito | Explosivo | Fonte comum pontual |
| Pico único, amplo | Prolongado | Fonte comum contínua |
| Picos múltiplos | Propagado | Transmissão pessoa a pessoa |

---

### Medidas de Controle

| Medida | Definição | Aplicação |
|--------|-----------|-----------|
| Isolamento | Separação do doente infectante | Doença transmissível ativa |
| Quarentena | Separação de expostos durante período de incubação | Contatos de alto risco |
| Bloqueio vacinal | Vacinação rápida do entorno do caso | Sarampo (até 72 h), febre amarela |
| Quimioprofilaxia | Medicamento preventivo em contatos | Meningite (rifampicina), malária |
| Controle de vetores | Eliminação do vetor | Dengue, leishmaniose |

---

### Caso Prático de Surto

Em março, a Vigilância recebe 12 notificações de gastroenterite aguda em crianças de uma creche. Febre, vômito e diarreia. Início dos sintomas entre 12–24 horas após o almoço da quinta-feira.

**Análise:**
- Curva epidêmica: pico único estreito → **fonte comum pontual** (alimento contaminado)
- Período de incubação 12–24 h → sugere Salmonella sp. ou Staphylococcus aureus
- **Conduta:**
  1. Notificar SINAN imediatamente (surto de DTA)
  2. Coletar amostras clínicas (fezes) e do alimento suspeito
  3. Interditar cozinha temporariamente
  4. Iniciar investigação com cardápio e lista de alunos que almoçaram
  5. Estudo caso-controle para identificar alimento veículo

> **Regra mnemônica SINAN:** **S**uspeitou → **N**otificou → **I**nvestigou → **A**giu → **N**ão deixou se alastrar.`, ativo: true,
    },
    {
      titulo: 'Saúde da Família e ESF',
      descricao: 'Estratégia de Saúde da Família, composição das equipes, área de abrangência, ações prioritárias e PMAQ.',
      disciplina: 'Saúde Pública', tema: 'Atenção Primária', tipo: 'texto', nivel: 'basico',
      duracao: 29, ordem: 4, mes: 4, semana: 3,
      videoUrl: null, conteudo: `## Saúde da Família e Estratégia de Saúde da Família (ESF)

**Base:** PNAB 2017 (Portaria 2.436) | Nota Técnica eMulti 2023 | MS Programa Previne Brasil

---

### O que é a ESF

A Estratégia de Saúde da Família é o **modelo prioritário de organização da Atenção Primária à Saúde (APS) no Brasil**, com foco na família e na comunidade, substituindo o modelo centrado na doença.

**Atributos essenciais da APS (Starfield):**
- Primeiro contato (porta de entrada)
- Longitudinalidade (vínculo ao longo do tempo)
- Integralidade (cuidado abrangente)
- Coordenação do cuidado (articulação com outros níveis)

---

### Composição da Equipe ESF Mínima

| Profissional | Carga horária | Número por equipe |
|-------------|--------------|------------------|
| Médico | 40 h/semana | 1 |
| Enfermeiro | 40 h/semana | 1 |
| Técnico/auxiliar de enfermagem | 40 h/semana | 1–2 |
| Agente Comunitário de Saúde (ACS) | 40 h/semana | 4–12 (1 por micro-área) |

**Equipe com saúde bucal (opcional mas incentivada):**
- Cirurgião-dentista + técnico em saúde bucal

**Cobertura populacional:** 2.000–3.500 pessoas por equipe (média 3.000)

---

### Território e Adscrição

| Divisão | Descrição |
|---------|-----------|
| Área de abrangência | Território total da equipe (até 3.500 pessoas) |
| Micro-área | Subdivisão de cada ACS (até 750 pessoas) |
| Adscrição | Cadastro formal das famílias na equipe |

**Territorialização:** mapeamento geográfico e de problemas de saúde. Identifica famílias vulneráveis, riscos ambientais, recursos da comunidade.

---

### Atribuições por Profissional

**Médico:**
- Realizar consultas clínicas e procedimentos
- Solicitar exames e prescrever medicamentos
- Realizar pequenas cirurgias e procedimentos
- Realizar visitas domiciliares
- Coordenar com equipe os casos prioritários

**Enfermeiro:**
- Consultas de enfermagem (pré-natal, puericultura, HAS/DM, planejamento familiar)
- Supervisionar ACS e técnicos
- Realizar procedimentos de enfermagem
- Visitas domiciliares

**Agente Comunitário de Saúde (ACS):**
- Cadastrar e mapear famílias da micro-área
- Realizar visitas domiciliares mensais (mínimo)
- Orientar e encaminhar para UBS
- Identificar situações de risco e vulnerabilidade

**Técnico de Enfermagem:**
- Curativos, coleta de exames, vacinas, inalações
- Aferição de sinais vitais
- Apoio às consultas médica e de enfermagem

---

### NASF-AB / eMulti (Equipe Multiprofissional)

Com a revisão da PNAB em 2023, o NASF-AB foi transformado nas **eMulti (Equipes Multiprofissionais)**.

**Composição possível das eMulti:**

| Profissional | Atuação |
|-------------|---------|
| Psicólogo | Saúde mental, grupos terapêuticos |
| Nutricionista | Educação alimentar, grupos |
| Fisioterapeuta | Reabilitação, domiciliar |
| Assistente social | Vulnerabilidade, proteção social |
| Farmacêutico | Uso racional de medicamentos |
| Educador físico | Grupos de atividade física |

> **Modo de atuação:** apoio matricial (não atendimento direto individualizado como regra). A eMulti apoia as equipes ESF, não substitui.

---

### Indicadores de Monitoramento

| Indicador | Meta (Previne Brasil) |
|-----------|----------------------|
| Cobertura de pré-natal (≥ 7 consultas) | ≥ 60% das gestantes |
| Exame citopatológico do colo uterino | Cobertura ≥ 52% |
| Acompanhamento de crianças (puericultura) | ≥ 60% crianças < 2 anos |
| Hipertensos com PA controlada | ≥ 50% |
| Diabéticos com HbA1c < 7% | ≥ 50% |
| Vacinação (poliomielite + pentavalente) | ≥ 95% |

**PMAQ-AB (Programa Nacional de Melhoria do Acesso e da Qualidade):**
- Substituído pelo **Previne Brasil (2020)** como modelo de financiamento por desempenho
- Critérios: cadastro, indicadores de saúde e avaliação de qualidade

---

### Caso Prático

Uma equipe ESF com área de 3.200 pessoas detecta que apenas 35% dos hipertensos cadastrados têm PA controlada (meta: ≥ 50%). O que fazer?

**Plano de ação:**
1. ACS identificam hipertensos sem consulta há > 6 meses na micro-área
2. Enfermeiro organiza grupo de hipertensos (educação em saúde, adesão)
3. Médico revisa prescrições (adequação de IECA/BRA, diuréticos)
4. eMulti: nutricionista com grupo de redução de sódio + educador físico
5. Reavaliação em 3 meses com novo cálculo do indicador

> **Princípio fundamental:** A ESF trabalha com **responsabilização sanitária** — a equipe é responsável pela saúde do território, não apenas pelos que chegam à UBS.`, ativo: true,
    },
    {
      titulo: 'Políticas de Saúde e Programas Nacionais',
      descricao: 'PNAB, Rede Cegonha, Rede de Urgência e Emergência, Programa Saúde na Escola e políticas prioritárias.',
      disciplina: 'Saúde Pública', tema: 'Políticas de Saúde', tipo: 'texto', nivel: 'intermediario',
      duracao: 33, ordem: 5, mes: 4, semana: 4,
      videoUrl: null, conteudo: `## Políticas de Saúde e Programas Nacionais

**Base:** PNAB 2017 | MS Portarias diversas | Rede Cegonha (Portaria 1.459/2011) | PNRAPS (Decreto 7.508/2011)

---

### PNAB — Política Nacional de Atenção Básica

Revisada em 2017 (Portaria 2.436/GM/MS), estabelece:
- ESF como modelo estratégico prioritário da APS
- Financiamento via Previne Brasil (2020): capitação ponderada + desempenho
- Equipes mínimas, eMulti, UBS fluviais e rurais
- Porta de entrada preferencial do SUS

---

### Rede Cegonha

**Objetivo:** garantir atenção humanizada à mulher no ciclo gravídico-puerperal e à criança no primeiro ano de vida.

| Componente | Ações principais |
|-----------|-----------------|
| Pré-natal | Início precoce (1° trimestre), mínimo 7 consultas, testagens (sífilis, HIV, hepatite B) |
| Parto e nascimento | Vinculação da gestante à maternidade, parto humanizado, acompanhante |
| Puerpério | Consulta puerperal até 42 dias, aleitamento materno |
| Sistema logístico | SAMU obstétrico, leitos UTI neonatal, central de regulação |

> **Direito garantido:** toda gestante tem direito a 1 acompanhante durante o trabalho de parto, parto e pós-parto imediato (Lei 11.108/2005).

---

### PNAN — Política Nacional de Alimentação e Nutrição

- Promoção da alimentação adequada e saudável
- Vigilância alimentar e nutricional (SISVAN)
- Prevenção e controle de deficiências nutricionais (vitamina A, ferro, iodo)
- Regulação e controle da qualidade dos alimentos

---

### PNCT — Programa Nacional de Controle da Tuberculose

| Elemento | Detalhe |
|---------|---------|
| Meta OMS | Eliminar TB (< 10 casos/100 mil hab) até 2035 |
| Estratégia DOTS | Tratamento diretamente observado — profissional acompanha ingestão do medicamento |
| Esquema básico | Rifampicina + Isoniazida + Pirazinamida + Etambutol (RHZE) por 6 meses |
| Notificação | Compulsória semanal no SINAN |
| Busca ativa | Contatos de casos bacilíferos + grupos vulneráveis (população de rua, presídios) |

---

### RAPS — Rede de Atenção Psicossocial

Instituída pelo Decreto 7.508/2011 e Portaria 3.088/2011. Componentes:

| Componente | Equipamento |
|-----------|------------|
| APS | UBS, NASF/eMulti — porta de entrada em saúde mental |
| Atenção especializada | CAPS I, II, III, CAPSad (álcool/drogas), CAPSi (infância) |
| Atenção de urgência | SAMU, UPA, Pronto-socorro |
| Atenção hospitalar | Leitos em hospital geral (não manicômio) |
| Atenção residencial | SRT — Serviço Residencial Terapêutico (ex-internos) |
| Reintegração social | Centro de Convivência, cooperativas sociais |

> **Lei da Reforma Psiquiátrica (10.216/2001):** proíbe internações em asilos e manicômios. Garante direitos ao portador de transtorno mental. Internação só como último recurso, com consentimento ou ordem judicial.

---

### HumanizaSUS — Política Nacional de Humanização

- Lançada em 2003, transversal a toda a rede SUS
- **Princípios:** autonomia, protagonismo dos sujeitos, corresponsabilidade, vínculos solidários
- **Dispositivos:**
  - Acolhimento com classificação de risco
  - Clínica ampliada
  - Apoio matricial
  - Projeto terapêutico singular (PTS)
  - Visita aberta e direito ao acompanhante

---

### Programa Saúde na Escola (PSE)

- Parceria MEC + MS (Decreto 6.286/2007)
- Alvo: estudantes da rede pública de educação básica
- Ações: avaliação nutricional, saúde bucal, vacinas em dia, saúde mental, prevenção de ISTs, promoção de atividade física
- Execução: equipes ESF articuladas com escolas do território

---

### Programas de IST/AIDS

| Programa/Ação | Detalhe |
|--------------|---------|
| TARV universal | Qualquer pessoa com HIV tem direito ao tratamento gratuito, independente de CD4 |
| PEP (Profilaxia Pós-Exposição) | Até 72 h após exposição de risco; 28 dias de ARV |
| PrEP (Profilaxia Pré-Exposição) | Tenofovir + entricitabina para grupos de alto risco |
| Notificação | AIDS (compulsória imediata); HIV (compulsória semanal) |
| Testagem | Oferta de teste rápido em toda UBS |

---

### Caso Prático

Uma gestante de 32 semanas chega à UBS sem cartão de pré-natal. Refere que fez 2 consultas no primeiro trimestre e parou.

**Análise — Rede Cegonha:**
- Iniciar pré-natal tardio imediatamente na UBS
- Solicitar exames de rotina: sífilis (VDRL), HIV (teste rápido), hepatite B (HBsAg), hemograma, urina
- Vincular à maternidade de referência (garantido pela Rede Cegonha)
- ACS faz visita domiciliar para adesão e acompanhamento
- Se sífilis positiva → tratar com penicilina benzatina e notificar no SINAN (sífilis na gestação)

> **Princípio Rede Cegonha:** nenhuma gestante deve ser peregrina. Toda gestante tem maternidade vinculada antes do parto.`, ativo: true,
    },
    // ── Psiquiatria — Mês 5 (4 aulas) ────────────────────────────────────────
    {
      titulo: 'Depressão e Transtorno Bipolar',
      descricao: 'Critérios DSM-5 para episódio depressivo maior. Diferenciação bipolar I e II. Farmacoterapia: antidepressivos e estabilizadores de humor.',
      disciplina: 'Psiquiatria', tema: 'Transtornos de Humor', tipo: 'texto', nivel: 'intermediario',
      duracao: 57, ordem: 1, mes: 5, semana: 1,
      videoUrl: null,
      conteudo: `## Depressão e Transtorno Bipolar

**Base:** DSM-5-TR (APA 2022) + CANMAT 2023 + NICE Depression 2022 + ABP 2022

---

### 1. Transtorno Depressivo Maior — Critérios DSM-5-TR e PHQ-9

**Critério A:** 5 ou mais dos 9 sintomas abaixo presentes por ≥ 2 semanas, com comprometimento funcional significativo. Humor deprimido OU anedonia OBRIGATÓRIO (sintomas-âncora):

| Sintoma | Característica Clínica |
|---|---|
| 1. Humor deprimido | Quase todo o dia, quase todos os dias (choro, vazio, desesperança) |
| 2. Anedonia | Perda de interesse ou prazer em quase todas as atividades |
| 3. Alteração de peso/apetite | Perda ou ganho ≥ 5% do peso em 1 mês |
| 4. Insônia ou hipersônia | Quase todos os dias |
| 5. Agitação ou retardo psicomotor | Observável por outros — não apenas autorrelato |
| 6. Fadiga ou perda de energia | Quase todos os dias |
| 7. Sentimentos de inutilidade ou culpa excessiva | Não apenas autocrítica por estar doente |
| 8. Dificuldade de concentração ou tomada de decisões | Indecisão persistente |
| 9. Pensamentos recorrentes de morte/ideação suicida | Com ou sem plano específico |

**PHQ-9 — Escala de rastreio e monitoramento:**

| Escore | Gravidade | Conduta |
|---|---|---|
| 0–4 | Nenhuma/mínima | Observação, revisão em 1 mês |
| 5–9 | Leve | Psicoterapia (TCC); reavaliar em 4–6 semanas |
| 10–14 | Moderada | ISRS + TCC; acompanhamento quinzenal |
| 15–19 | Moderadamente grave | ISRS dose plena; considerar encaminhamento psiquiatria |
| 20–27 | Grave | Psiquiatria urgente; considerar hospitalização; ISRS em dose máxima; avaliar ECT |

> O PHQ-9 pode ser usado para monitorar resposta: queda ≥ 50% do escore = resposta parcial; escore ≤ 4 = remissão.

---

### 2. Diagnóstico Diferencial do TDM

| Condição | Como Diferenciar | Exame |
|---|---|---|
| Hipotireoidismo | Fadiga, ganho de peso, lentificação, intolerância ao frio; sem humor deprimido proeminente | TSH (se elevado: hipotireoidismo) |
| Anemia | Fadiga, dispneia; sem humor deprimido; sem anedonia | Hemograma + ferritina |
| Deficiência de B12 | Fadiga, déficit cognitivo; parestesias; idosos e vegetarianos | Vitamina B12 sérica |
| Demência com depressão | Déficit cognitivo precede depressão; orientação temporal-espacial comprometida | MEEM, MoCA, neuroimagem |
| Distimia (TPD) | Sintomas depressivos leves por ≥ 2 anos sem remissão (nunca cumpre critérios completos de TDM) | Anamnese longitudinal |
| TB II com hipomanias | Episódios de energia/euforia leve por ≥ 4 dias que o paciente não relata como "problema" | Escala MDQ (Mood Disorder Questionnaire) |

---

### 3. Tratamento do TDM por Gravidade

| Gravidade | Tratamento Preferencial | Notas |
|---|---|---|
| Leve (PHQ 5–9) | TCC individual ou em grupo; atividade física supervisionada | Farmacoterapia se preferência do paciente ou indisponibilidade de TCC |
| Moderada (PHQ 10–14) | ISRS + TCC (combinação superior a cada modalidade isolada) | Avaliar risco de suicídio; reavaliar em 2–4 semanas |
| Grave (PHQ 15–19) | ISRS em dose máxima + TCC; encaminhar psiquiatria | Considerar hospitalização se risco suicida alto |
| Resistente (falha 2+ ISRS) | ECT ou esketamina intranasal (Spravato 56–84 mg 2x/sem); potencialização com lítio, aripiprazol, quetiapina | ECT: 6–12 sessões; remissão ~60–70% em refratários |

---

### 4. ISRS de Primeira Linha — Doses, Latência e Duração

| ISRS | Dose Inicial | Dose-Alvo | Dose Máxima | Particularidade |
|---|---|---|---|---|
| Sertralina | 25–50 mg/dia | 100–150 mg/dia | 200 mg/dia | Melhor perfil de segurança; opção em cardiopatas |
| Escitalopram | 5–10 mg/dia | 10–20 mg/dia | 20 mg/dia | Menos interações; tolerabilidade superior |
| Fluoxetina | 10–20 mg/dia | 20–40 mg/dia | 80 mg/dia | Meia-vida longa (útil em baixa adesão); menor síndrome de descontinuação |
| Paroxetina | 10–20 mg/dia | 20–40 mg/dia | 60 mg/dia | Mais anticolinérgico; maior síndrome de descontinuação; evitar em gravidez |
| Citalopram | 10–20 mg/dia | 20–40 mg/dia | 40 mg/dia | Risco de prolongamento QTc em doses > 40 mg |

Latência de ação: 2–4 semanas para resposta parcial; 6–8 semanas para resposta completa. Duração do tratamento: 1° episódio = 6–12 meses após remissão; 2° episódio = 2 anos; 3° ou mais episódios = tratamento indefinido. Retirada sempre gradual (redução de 25% a cada 2–4 semanas) para evitar síndrome de descontinuação (FINISH: Flu-like, Insônia, Náuseas, Imbalance, Sensorial perturbações, Hiperexcitabilidade).

---

### 5. Efeitos Adversos dos Antidepressivos

| Classe | Efeitos Adversos Principais | Alertas Clínicos |
|---|---|---|
| ISRS | Náusea (1as semanas), cefaleia, disfunção sexual (20–40%), insônia ou sedação; síndrome serotoninérgica rara (com IMAO ou tramadol) | Evitar combinação ISRS + tramadol/triptanos/linezolida (risco síndrome serotoninérgica) |
| IRSN (venlafaxina, duloxetina) | Hipertensão (venlafaxina), sudorese, boca seca; disfunção sexual | Monitorar PA; dor neuropática e ansiedade — indicação dupla |
| Tricíclicos (amitriptilina) | Anticolinérgicos (boca seca, retenção, taquicardia, visão turva); sedação; ganho de peso; QTc prolongado | Letais em overdose (5–10x dose terapêutica); evitar em idosos (Beers) |
| Bupropiona | Insônia, boca seca, cefaleia, risco convulsão | Contraindicado em bulimia/anorexia e epilepsia; sem disfunção sexual; útil em cessação do tabagismo |
| Mirtazapina | Sedação intensa, ganho de peso, aumento apetite | Útil em depressão com insônia/anorexia; seguro em idosos |

---

### 6. Transtorno Bipolar — Critérios Diagnósticos e Classificação

**Episódio Maníaco (TB I):** humor elevado, expansivo ou irritável + aumento de atividade/energia por ≥ 7 dias + 3 ou mais dos sintomas DIGFAST (ou 4 se humor irritável) + comprometimento funcional grave ou necessidade de hospitalização:

| Sigla DIGFAST | Sintoma | Descrição |
|---|---|---|
| D | Distractibilidade | Atenção facilmente desviada por estímulos irrelevantes |
| I | Imprudência/Impulsividade | Gastos excessivos, promiscuidade, decisões arriscadas |
| G | Grandiosidade | Autoestima inflada ou grandiosidade; pode ter caráter psicótico |
| F | Fuga de ideias | Pensamento acelerado; salto rápido entre tópicos |
| A | Atividade aumentada | Agitação psicomotora ou aumento de atividade dirigida a metas |
| S | Sono reduzido | Redução da necessidade de sono (≥ 3h a menos) sem fadiga |
| T | Tagarelice | Pressão do discurso; fala mais e mais rápida que o habitual |

| Tipo | Episódio Requerido | Hipomaníaco | Depressivo |
|---|---|---|---|
| TB I | Mania (≥ 7 dias ou hospitalização) | Possível, não obrigatório | Presente (mas não critério diagnóstico) |
| TB II | Sem mania | Hipomania ≥ 4 dias (sem psicose/hospitalização) | OBRIGATÓRIO para diagnóstico |
| Ciclotimia | Sem mania/hipomania plena | Sintomas hipomaníacos leves | Sintomas depressivos leves — por ≥ 2 anos |
| Ciclagem rápida | TB I ou II | ≥ 4 episódios/ano | Qualquer tipo; pior prognóstico; verificar hipotireoidismo, abuso de substâncias |

---

### 7. Tratamento do Transtorno Bipolar — Estabilizadores de Humor

| Medicamento | Faixa Terapêutica / Dose | Indicações | Toxicidade e Monitoramento |
|---|---|---|---|
| Lítio | 0,6–1,2 mEq/L (manutenção); 0,8–1,2 mEq/L (mania aguda); 900–1200 mg/dia em 2 tomadas | TB I gold standard; profilaxia de recidivas; reduz suicídio | Tremor fino (precoce) → ataxia → confusão mental → convulsão (toxicidade). Monitorar: litemia (semanal no início), creatinina, TSH, ECG. Evitar AINEs e diuréticos (aumentam litemia) |
| Valproato | 50–100 mcg/mL; 750–2000 mg/dia | Mania aguda; ciclagem rápida; TB misto | Hepatotoxicidade (LFH no início), teratogênico (espinha bífida — CONTRAINDICADO na gravidez), trombocitopenia, ganho de peso, alopecia |
| Lamotrigina | 100–400 mg/dia (titulação lenta: iniciar 25 mg/dia, dobrar a cada 2 semanas) | Depressão bipolar; manutenção TB II; prevenção depressão em TB I | Rash cutâneo (5–10%) → Síndrome de Stevens-Johnson se titulação rápida. Valproato duplica os níveis de lamotrigina — reduzir dose pela metade |
| Quetiapina | 200–800 mg/dia | Mania aguda; depressão bipolar; manutenção; insônia associada | Síndrome metabólica, sedação, hipotensão ortostática; monitorar glicemia e peso |

> NUNCA usar antidepressivo isolado no transtorno bipolar sem estabilizador de humor — risco de virada maníaca, ciclagem rápida e ativação de mixed state (estado misto). Se necessário tratar depressão bipolar: quetiapina + lítio ou lamotrigina + lítio; antidepressivo apenas como adjuvante e por tempo limitado.

---

### 8. Caso Clínico

**Cenário:** Homem, 27 anos, estudante universitário. Trazido pela família após 9 dias em que "não dorme mais que 2 horas por noite, está eufórico, gastou R$ 18.000 do cartão de crédito dos pais, diz ter descoberto um método para ficar milionário, fala sem parar e está irritado quando contrariado". Nega uso de drogas (toxicológico negativo). Sem febre, sem sintomas neurológicos focais.

**Diagnóstico:** Episódio maníaco com características psicóticas (grandiosidade) — TB Tipo I, 1° episódio. Excluir causas orgânicas: TCE, encefalite, hipotireoidismo, intoxicação por corticosteroides.

**Conduta imediata:**
1. Hospitalização involuntária (incapaz de consentir, risco a terceiros pelo comportamento impulsivo financeiro)
2. Mania aguda: quetiapina 200 mg/dia (iniciar) titulando até 800 mg/dia + valproato 750 mg/dia (titular pela litemia/nível sérico)
3. Sedação se agitação grave: haloperidol 5 mg IM + lorazepam 2 mg IM
4. Iniciar lítio 300 mg 3x/dia após estabilização — titular litemia para 0,8–1,2 mEq/L (profilaxia em TB I)
5. Após remissão: psicoeducação para reconhecer pródromo (redução do sono = sinal precoce), evitar privação de sono e álcool, manter estabilizador indefinidamente
6. NÃO prescrever antidepressivo — risco de virada maníaca`,
      ativo: true,
    },
    {
      titulo: 'Transtornos de Ansiedade e TOC',
      descricao: 'TAG (GAD-7), Pânico (critérios, agorafobia), Fobia Social, TEPT (DSM-5), TOC (Y-BOCS, SRI). Tratamento por transtorno: ISRS, TCC, dose e duração. Base: DSM-5-TR + ABRATA 2023 + NICE 2020.',
      disciplina: 'Psiquiatria', tema: 'Transtornos Ansiosos', tipo: 'texto', nivel: 'basico',
      duracao: 49, ordem: 2, mes: 5, semana: 1,
      videoUrl: null,
      conteudo: `## Transtornos de Ansiedade e TOC

**Base:** DSM-5-TR (2022) + Diretrizes ABRATA/ABP 2023 + NICE Anxiety Guidelines 2020 + CANMAT 2023

---

### 1. TAG — Transtorno de Ansiedade Generalizada

**Critérios DSM-5-TR:** Ansiedade e preocupação excessivas e difíceis de controlar acerca de múltiplos temas por ≥ 6 meses, com ≥ 3 dos 6 sintomas (basta 1 em crianças):
1. Inquietação ou sensação de "nervos à flor da pele"
2. Fatigabilidade
3. Dificuldade de concentração ou "mente em branco"
4. Irritabilidade
5. Tensão muscular
6. Distúrbio do sono (dificuldade de iniciar ou manter, sono não reparador)

**Rastreio — GAD-7 (Generalized Anxiety Disorder-7):** 7 itens com pontuação 0–3. Score ≥ 10 = ansiedade moderada a grave. Amplamente usado em APS.

> TAG tem curso crônico e flutuante; comorbidade com depressão em 50–60% dos casos. Diferencial: hipertireoidismo, feocromocitoma, abstinência de BDZ/álcool, abuso de cafeína/estimulantes.

### 2. Transtorno de Pânico e Agorafobia

**Critérios DSM-5 para Crise de Pânico:** Início abrupto de medo/desconforto intenso com ≥ 4 de 13 sintomas, atingindo pico em minutos:

| Sintomas Físicos | Sintomas Psíquicos |
|---|---|
| Palpitações/taquicardia | Sensação de morte iminente |
| Sudorese | Sensação de desrealização/despersonalização |
| Tremores | Medo de perder o controle ou "enlouquecer" |
| Dispneia/sensação de sufocamento | — |
| Dor/desconforto torácico | — |
| Náuseas/desconforto abdominal | — |
| Tontura/vertigem/desmaio | — |
| Calafrios ou ondas de calor | — |
| Parestesias | — |

**Transtorno de Pânico** = crises recorrentes e inesperadas + ≥ 1 mês de: antecipação ansiosa de novas crises (ansiedade antecipatória) OU mudança comportamental para evitá-las.

**Agorafobia:** medo/evitação de situações onde fuga seria difícil em caso de crise (transporte público, espaços abertos, multidões, filas). Pode surgir sem histórico de pânico (DSM-5 = diagnóstico separado).

**Diagnóstico diferencial clínico do pânico:**

| Condição | Como diferenciar |
|---|---|
| IAM | ECG, troponina, homem > 45a, fatores de risco CV |
| TEP | Gasometria, D-dímero, cintilografia/angio-TC |
| Hipertireoidismo | TSH, T4L |
| Hipoglicemia | Glicemia capilar durante crise |
| Feocromocitoma | Metanefrinas urinárias, HAS paroxística |
| Epilepsia do lobo temporal | EEG, imagem |

### 3. Fobia Social (Transtorno de Ansiedade Social)

**Critérios DSM-5:** Medo/ansiedade marcados em situações sociais onde o indivíduo pode ser observado/avaliado negativamente. Exposição quase sempre provoca ansiedade. Evitação ou suportação com sofrimento. Duração ≥ 6 meses. Prejudica funcionamento.

**Subtipos:** Específica (falar em público) vs. Generalizada (maioria das situações sociais — pior prognóstico).

**Diferencial:** timidez normal (sem prejuízo funcional), TEPT (evitação de gatilhos traumáticos específicos), agorafobia (medo de situações sem escape).

### 4. TEPT — Transtorno de Estresse Pós-Traumático

**Critérios DSM-5 (4 clusters — duração > 1 mês):**

| Cluster | Exemplos |
|---|---|
| A. Exposição ao trauma | Vivenciou, testemunhou, soube de evento: morte, ameaça à vida, violência sexual, lesão grave |
| B. Reexperiência (≥ 1) | Flashbacks, pesadelos, sofrimento psíquico/físico a gatilhos, memórias intrusivas |
| C. Evitação (≥ 1) | Evita memórias internas ou gatilhos externos relacionados ao trauma |
| D. Alterações cognitivas/humor negativas (≥ 2) | Amnésia, crenças negativas, culpa distorcida, afeto embotado, isolamento, anedonia |
| E. Hiperativação/reatividade (≥ 2) | Hipervigilância, sobressalto exagerado, irritabilidade, comportamento autodestrutivo, distúrbio do sono, dificuldade de concentração |

> TEPT complexo (C-PTSD — ICD-11): exposição traumática prolongada (abuso infantil, cativeiro) → além dos critérios clássicos: desregulação emocional, identidade perturbada, dificuldades relacionais persistentes.

### 5. TOC — Transtorno Obsessivo-Compulsivo

**Definições DSM-5:**
- **Obsessões:** pensamentos, imagens ou impulsos recorrentes, intrusivos, ego-distônicos (reconhecidos como irracionais), que causam ansiedade
- **Compulsões:** comportamentos (lavar mãos, verificar, ordenar) ou atos mentais (contar, rezar) executados para neutralizar a angústia da obsessão. Em crianças: podem não ser reconhecidas como irracionais

**Critério temporal:** obsessões/compulsões consomem > 1 hora/dia OU causam sofrimento/prejuízo funcional significativo.

**Y-BOCS (Yale-Brown Obsessive Compulsive Scale):**
- Avalia: número, frequência, interferência, sofrimento e resistência de obsessões e compulsões (0–40 pts)
- Leve: 8–15 | Moderado: 16–23 | Grave: 24–31 | Extremo: ≥ 32

**Temas mais comuns de obsessões/compulsões:**
- Contaminação/limpeza (40%), verificação (28%), simetria/ordem (10%), pensamentos proibidos (harm, sexuais, religiosos), colecionismo (hoarding)

> TOC ≠ Transtorno Obsessivo-Compulsivo de Personalidade (TOCP). TOC = ego-distônico, angustia o paciente. TOCP = traços de personalidade, ego-sintônicos (perfeccionismo, rigidez — "é minha natureza").

### 6. Tratamento: ISRS, TCC, Dose e Duração por Transtorno

| Transtorno | 1ª Linha Farmacológica | Dose Alvo | Duração Mínima | Psicoterapia |
|---|---|---|---|---|
| **TAG** | Escitalopram 10–20 mg/dia; Sertralina 50–150 mg/dia; Venlafaxina XR 75–225 mg/dia | Doses médias | 12 meses + | TCC (preocupação, relaxamento); mindfulness |
| **Pânico** | Sertralina 50–200 mg/dia; Escitalopram 10–20 mg/dia; Clomipramina 75–150 mg/dia | Alta | 12–24 meses | TCC (reestruturação cognições catastróficas, exposição interoceptiva) |
| **Fobia Social** | Sertralina 50–200 mg/dia; Paroxetina 20–50 mg/dia; Venlafaxina XR 75–225 mg/dia | Média-alta | 12 meses + | TCC em grupo (exposição gradual); técnicas de role-playing |
| **TEPT** | Sertralina 50–200 mg/dia; Paroxetina 20–50 mg/dia (aprovados FDA/NICE) | Alta | ≥ 12–24 meses | TCC focada no trauma (TF-CBT); EMDR; Processamento Cognitivo |
| **TOC** | Sertralina 200 mg/dia; Fluoxetina 60–80 mg/dia; Fluvoxamina 300 mg/dia; Clomipramina 250 mg/dia | **ALTA** (2–3× depressão) | ≥ 12 meses | ERP (Exposição e Prevenção de Resposta) — padrão ouro |

**Notas sobre BDZ nos transtornos de ansiedade:**
- Uso de curto prazo (< 4 semanas) para crise aguda; NÃO usar cronicamente em TAG (tolerância, dependência, rebote)
- Clonazepam: útil em pânico agudo ou durante titulação de ISRS
- TEPT: BDZ não é recomendado (pode comprometer extinção do medo e processamento do trauma)

> Buspirone: opção para TAG como monoterapia ou adjuvante. Sem risco de dependência. Início de efeito lento (2–4 semanas). Não tem eficácia em pânico, TOC ou TEPT.

### 7. Populações Especiais

**Gestantes:** Sertralina e escitalopram são os ISRS com melhor perfil de segurança. TCC é preferível sempre que possível. Evitar BDZ crônico (risco de hipotonias neonatais). Paroxetina: associada a cardiopatias congênitas (evitar no 1º trimestre).

**Idosos:** iniciar com doses 50% menores; risco de hiponatremia por SIADH com ISRS; IRSN com cautela em HAS; evitar BDZ (quedas, delirium). Venlafaxina pode elevar PA.

**Crianças/adolescentes:** Fluoxetina tem melhor evidência pediátrica; TCC é 1ª linha; monitorar ideação suicida nas primeiras 4 semanas de ISRS (black box FDA).

### 8. Caso Clínico

**Enunciado:** Homem, 34 anos, engenheiro, refere lavagem compulsiva das mãos 2–3 h/dia com medo de contaminação por germes. Sabe que é irracional mas não consegue resistir. Perdeu emprego pela ausência no trabalho. PHQ-9 = 8 (depressão leve). GAD-7 = 6 (ansiedade leve). Y-BOCS = 22 (moderado).

**Análise:**
- Diagnóstico: **TOC moderado** (obsessão de contaminação + compulsão de lavagem > 1h/dia + prejuízo funcional grave + ego-distônico)
- Diagnóstico diferencial: dermatite de contato (componente somático possível), TAG (ansiedade mais difusa, sem compulsões), fobia específica
- Comorbidade: depressão leve (frequente no TOC)
- Tratamento 1ª linha: **Sertralina 50 mg/dia → titular para 200 mg/dia** (dose alta necessária) + **ERP** (exposição gradual a contaminação + prevenção de lavagem)
- Duração mínima: 12 meses; resposta esperada em 8–12 semanas
- Se falha com ISRS + ERP: adicionar **clomipramina** ou **antipsicótico atípico** (risperidona, aripiprazol) como adjuvante`, ativo: true,
    },
    {
      titulo: 'Psicoses: Esquizofrenia e Transtornos Relacionados',
      descricao: 'Critérios diagnósticos, sintomas positivos e negativos, antipsicóticos típicos vs atípicos, efeitos adversos e monitorização.',
      disciplina: 'Psiquiatria', tema: 'Psicoses', tipo: 'texto', nivel: 'intermediario',
      duracao: 53, ordem: 3, mes: 5, semana: 2,
      videoUrl: null,
      conteudo: `## Psicoses: Esquizofrenia e Transtornos Relacionados

**Base:** DSM-5-TR + NICE Guidelines Psychosis and Schizophrenia 2014 + CANMAT 2017 + PORT Guidelines

---

### Critérios Diagnósticos — Esquizofrenia (DSM-5-TR)

**≥ 2 dos 5 domínios por ≥ 1 mês (fase ativa), com disfunção funcional por ≥ 6 meses:**

1. Delírios — fixos, não baseados em consenso cultural
2. Alucinações — percepções sem estímulo externo (auditivas mais comuns — 70%)
3. Discurso desorganizado — incoerência, associações frouxas, tangencialidade
4. Comportamento desorganizado ou catatônico
5. Sintomas negativos — redução/ausência de funções normais

> Pelo menos 1 dos critérios presentes deve ser delírio, alucinação ou discurso desorganizado (critérios "principais"). A disfunção funcional (trabalho, relacionamentos, autocuidado) por ≥ 6 meses é obrigatória para o diagnóstico.

---

### Espectro Psicótico — Diagnóstico Diferencial dos Transtornos

| Transtorno | Duração dos Sintomas Psicóticos | Componente de Humor | Outras Características |
|---|---|---|---|
| Psicose breve reativa | < 1 mês | Ausente | Gatilho estressor identificável; recuperação completa |
| Transtorno esquizofreniforme | 1–6 meses | Ausente | Prognóstico incerto; 2/3 evoluem para esquizofrenia |
| Esquizofrenia | ≥ 6 meses (critério A ≥ 1 mês) | Ausente ou breve vs psicose | Deterioração funcional progressiva |
| Transtorno esquizoafetivo | ≥ 6 meses | Episódio afetivo maior por > 50% do tempo | Psicose proeminente mesmo sem humor; prognóstico intermediário |
| Transtorno delirante | ≥ 1 mês | Ausente | Delírios sem outras alterações; sem deterioração; alucinações raras |
| PE induzida por substância | Durante/logo após intoxicação/abstinência | Variável | Anfetamina, cocaína, cannabis, álcool (abstinência), alucinógenos |

---

### Sintomas Positivos, Negativos e Cognitivos — Tabela Clínica

| Dimensão | Sintoma | Exemplo Clínico | Resposta a Antipsicóticos |
|---|---|---|---|
| Positivo | Alucinações auditivas | "Ouve vozes que comentam seus atos ou discutem entre si" | Boa (80% respondem) |
| Positivo | Delírios de perseguição | "Acredita que vizinhos tramam contra ele através da TV" | Boa |
| Positivo | Pensamento desorganizado | Associações frouxas, neologismos, salada de palavras | Moderada |
| Positivo | Comportamento bizarro/catatonia | Postura estranha, estereotipias, mutismo catatônico | Moderada |
| Negativo | Alogia | Respostas monossilábicas, pobreza de conteúdo do pensamento | Parcial (atípicos > típicos) |
| Negativo | Avolição/anedonia | Incapacidade de iniciar atividades; perda de prazer em tudo | Parcial |
| Negativo | Embotamento afetivo | Face inexpressiva, voz monótona, contato ocular reduzido | Parcial |
| Cognitivo | Memória de trabalho prejudicada | Dificuldade em seguir instruções complexas, manter emprego | Resposta pobre |

> Os sintomas negativos e cognitivos são os maiores determinantes do comprometimento funcional a longo prazo e respondem pobremente à medicação. A reabilitação psicossocial é essencial para esta dimensão.

---

### Diagnóstico Diferencial — Causas Orgânicas a Excluir

Sempre investigar causa orgânica na 1ª crise psicótica:

| Causa | Pista Clínica | Investigação |
|---|---|---|
| Intoxicação por anfetamina/cocaína | Psicose aguda com agitação, taquicardia, hipertermia | Toxicológico urina/sangue |
| Abstinência de álcool | Tremores, sudorese, alucinações visuais (delirium tremens) | Histórico, dosagem de álcool |
| Epilepsia do lobo temporal | Auras, automatismos, déjà vu, episódios breves | EEG, RM crânio |
| Encefalite autoimune anti-NMDA | Início agudo, febre, convulsões, discinesias orofaciais, jovens | Anti-NMDAR no LCR/sangue, RM crânio |
| Neurossífilis | Histórico de sífilis, síndrome demencial + psicose | FTA-ABS no LCR, VDRL |
| Lúpus neuropsiquiátrico | Artrite, rash, ANA positivo | FAN, anti-DNA, complemento |

---

### Antipsicóticos — Doses, Equivalências e Perfil de Efeitos Adversos

**Antipsicóticos de 1ª Geração (Típicos) — alta potência:**

| Fármaco | Dose Usual | Equivalência CPZ | Principal EPS |
|---|---|---|---|
| Haloperidol | 5–15 mg/dia (oral) ou 5–10 mg IM (agudo) | 50 mg | Distonia, parkinsonismo, acatisia |
| Clorpromazina (CPZ) | 100–600 mg/dia | 100 mg (referência) | Sedação, hipotensão, fotossensibilidade |
| Trifluoperazina | 5–20 mg/dia | 5 mg | EPS intenso |
| Flufenazina decanoato | 12,5–50 mg IM q2–4 semanas | — | Long-acting injectable (LAI) |

**Antipsicóticos de 2ª Geração (Atípicos):**

| Fármaco | Dose Usual | Equivalência CPZ | Efeito Adverso Predominante |
|---|---|---|---|
| Risperidona | 2–8 mg/dia | 60 mg | Hiperprolactinemia, EPS dose > 6 mg |
| Olanzapina | 10–20 mg/dia | 75 mg | Ganho de peso (++), síndrome metabólica, sedação |
| Quetiapina | 300–800 mg/dia | 150 mg | Sedação, hipotensão ortostática, DM2 |
| Aripiprazol | 10–30 mg/dia | 75 mg | Acatisia, náusea; neutro metabolicamente |
| Clozapina | 200–600 mg/dia | 100 mg | Agranulocitose (1–2%), convulsões dose-dependente, hipersalivação, ganho peso +++ |
| Ziprasidona | 120–200 mg/dia | 75 mg | Prolongamento QTc — ECG obrigatório |

> Clozapina: indicada APENAS após falha de 2 antipsicóticos distintos em doses adequadas (esquizofrenia refratária). Protocolo de monitorização hematológica obrigatório: neutrófilos semanais nos primeiros 6 meses → quinzenais 6–12 meses → mensais depois. Suspender se neutrófilos < 1.000/mm³.

---

### Efeitos Adversos — Extrapiramidais e Sistêmicos

**Sintomas Extrapiramidais (EPS) — Típicos >> Atípicos:**

| EPS | Tempo de Surgimento | Mecanismo | Tratamento |
|---|---|---|---|
| Distonia aguda | Horas a dias | Bloqueio D2 súbito → hiperatividade colinérgica | Biperideno 2mg IV/IM ou difenidramina |
| Parkinsonismo medicamentoso | Dias a semanas | Bloqueio D2 estriado → déficit dopaminérgico | Reduzir dose; biperideno VO; trocar para atípico |
| Acatisia | Dias a semanas | Mecanismo misto (D2 + serotoninérgico) | Propranolol 20–40mg; clonazepam; mirtazapina |
| Discinesia tardia | Meses a anos (crônico) | Supersensibilidade D2 por bloqueio prolongado | Reduzir/suspender; valbenazina (VMAT2); irreversível em 50% |

**Síndrome Maligna dos Neurolépticos (SMN):**
- Tétrade clássica: febre alta (> 38,5°C) + rigidez muscular "em cano de chumbo" + instabilidade autonômica (taquicardia, hiper/hipotensão, diaforese) + elevação de CPK (> 1.000 UI/L)
- Mortalidade 10–20% — UTI obrigatória
- Suspender antipsicótico imediatamente
- Dantrolene 1–2,5 mg/kg IV (relaxante muscular direto)
- Bromocriptina 2,5–5 mg VO/SNG 8/8h (agonista dopaminérgico)

**Efeitos metabólicos e outros:**

| Efeito Adverso | Fármacos de maior risco | Monitorização |
|---|---|---|
| Síndrome metabólica (ganho peso, DM2, dislipidemia) | Olanzapina, clozapina, quetiapina | Glicemia, triglicerídeos, PA, IMC — basal e a cada 3 meses |
| Hiperprolactinemia (galactorreia, amenorreia, disfunção sexual) | Risperidona, haloperidol, amisulprida | Prolactina sérica se sintomas |
| Prolongamento QTc (risco TdP) | Ziprasidona, haloperidol IV, tioridazina | ECG basal + se dose aumentar |
| Agranulocitose | Clozapina (1–2%), olanzapina (< 0,1%) | Neutrófilos semanais (clozapina) |

---

### Adesão ao Tratamento e Formas Long-Acting Injectable (LAI)

A não-adesão à medicação oral é a principal causa de recidiva na esquizofrenia (50–70% dos pacientes param em 1 ano). Estratégias:
- **LAI (depot/long-acting):** indicado após 1ª recidiva por não-adesão ou preferência do paciente
  - Haloperidol decanoato: 50–200 mg IM q4 semanas (típico)
  - Risperidona LAI: 25–50 mg IM q2 semanas (atípico)
  - Aripiprazol LAI: 400 mg IM q4 semanas (atípico — menor SEP/metabolismo)
- **Psicoeducação:** paciente e família — reconhecer sinais precoces de recidiva, importância da continuidade
- **CAPS:** Centro de Atenção Psicossocial — reabilitação, suporte comunitário, redução de internações

---

### Caso Clínico — Primeiro Episódio Psicótico

**Cenário:** Homem, 21 anos, estudante universitário. Encaminhado pela família por isolamento social progressivo nos últimos 10 meses, abandono de disciplinas na faculdade, insônia e episódios de "falar sozinho". Na consulta: alerta, mas desconfiado. Relata que vizinhos instalaram câmeras no apartamento para gravá-lo (delírio de perseguição) e que ouve vozes de 2 pessoas discutindo sobre ele (alucinações auditivas em 3ª pessoa). Nega uso de drogas. Toxicológico negativo. RM crânio: normal.

**Diagnóstico diferencial e conclusão:**
- Psicose breve: < 1 mês → excluída (> 6 meses)
- Esquizofreniforme: 1–6 meses → excluída (10 meses)
- Transtorno delirante: apenas delírios, sem alucinações proeminentes → excluído
- Encefalite anti-NMDA: sem convulsões, febre, discinesias → improvável; LCR opcional se atípico
- **Diagnóstico: Esquizofrenia** (delírio + alucinações + disfunção funcional ≥ 6 meses)

**Conduta:**
1. Antipsicótico de 2ª geração: risperidona 1mg/dia → aumentar 1mg/semana → alvo 4–6mg/dia
2. Alternativa se intolerância: aripiprazol 10mg → 15–20mg (perfil metabólico favorável)
3. Monitorizar: EPS (AIMS scale), glicemia, lipídeos, prolactina, peso — basais e trimestrais
4. Psicoeducação familiar — grupo de família no CAPS
5. Encaminhamento para CAPS II + programa de primeiro episódio psicótico
6. Se refratariedade após 2 tentativas adequadas (6–8 semanas cada em dose terapêutica): clozapina com monitorização hematológica obrigatória`,
      ativo: true,
    },
    {
      titulo: 'Emergências Psiquiátricas e Dependência Química',
      descricao: 'Agitação psicomotora, avaliação de risco suicida, delirium tremens, síndrome de abstinência opioides. Abordagem e farmacologia de emergência.',
      disciplina: 'Psiquiatria', tema: 'Emergências Psiquiátricas', tipo: 'texto', nivel: 'avancado',
      duracao: 61, ordem: 4, mes: 5, semana: 2,
      videoUrl: null,
      conteudo: `## Emergências Psiquiátricas e Dependência Química

**Base:** DSM-5-TR 2022 + ABP 2022 + SAMHSA + CFM Res. 2.057/2013 + Lei 10.216/2001

---

### Agitação Psicomotora — Abordagem DEAS e Contenção

A agitação psicomotora representa um dos principais motivos de atendimento emergencial em psiquiatria. A abordagem segura segue o acrônimo **DEAS**: Distância segura, Escuta ativa, Empatia, Atitude segura.

**Etapas progressivas:**
1. De-escalonamento verbal (sempre priorizar) — tom calmo, não confrontativo, oferecer escolhas, espaço pessoal preservado
2. Contenção física quando há risco iminente de auto ou heteroagressão — equipe de 5 (1 por membro + 1 cabeça), documentar indicação no prontuário
3. Contenção química após ou concomitante à física

| Situação Clínica | Fármaco 1ª escolha | Dose | Alternativa |
|---|---|---|---|
| Agitação em psicose aguda | **Haloperidol 5 mg IM** | + Midazolam 15 mg IM | Droperidol 5 mg IM |
| Agitação em transtorno afetivo/TAB | Olanzapina 10 mg IM | — | Haloperidol + BDZ |
| Agitação por intoxicação (álcool/drogas) | Diazepam 10–20 mg IV | Midazolam IM | Evitar haloperidol se intox por estimulantes |
| Agitação em idoso | Haloperidol 2,5 mg IM | Dose reduzida | Risperidona 1 mg VO |
| SNM suspeita | **Suspender antipsicótico** | Suporte + dantrolene | Bromocriptina |

> **Pérola clínica:** Olanzapina IM + benzodiazepínico IM parenteral = combinação contraindicada (risco de colapso cardiorrespiratório). Usar uma ou outra via, nunca ambas em sequência imediata.

> **Alerta legal:** Contenção física sem indicação documentada configura cerceamento arbitrário. Registrar no prontuário: indicação, horário de início e fim, reavaliação a cada 2h obrigatória (CFM 2.057/2013).

---

### Avaliação de Risco Suicida — C-SSRS e Internação

A avaliação estruturada do risco suicida é obrigatória em todo paciente psiquiátrico que chega à emergência. A escala **Columbia Suicide Severity Rating Scale (C-SSRS)** estratifica ideação e comportamento.

**Fatores de ALTO risco:**
- Tentativa anterior (maior preditor isolado — risco 20× maior)
- Plano definido + meio letal disponível + intenção de agir
- Depressão grave com anedonia e desesperança (Beck Hopelessness Scale > 9)
- Isolamento social, perda recente, doenças terminais, dor crônica
- Abuso de álcool ou drogas (desinibição + impulsividade)
- Gênero masculino (maior letalidade nas tentativas)

**Fatores protetores:** suporte familiar sólido, religiosidade, filhos pequenos, planos futuros, vínculos terapêuticos, vontade de viver

| Risco | Critérios | Conduta |
|---|---|---|
| Baixo | Ideação passiva, sem plano, com fatores protetores | Ambulatório + plano de segurança + contato de crise |
| Moderado | Ideação ativa sem plano definido | Avaliação frequente, CAPS, suporte familiar |
| **Alto** | **Plano + meio + intenção OU tentativa recente** | **Internação psiquiátrica imediata** |

**Modalidades de internação (Lei 10.216/2001):**
- **Voluntária:** consentimento do paciente; alta a pedido possível, médico deve reavaliar
- **Involuntária:** solicitada por familiar/responsável; comunicar ao MP em 72h
- **Compulsória:** determinada judicialmente

> **Alerta clínico:** Retirar acesso a meios letais é intervenção de MAIOR evidência para redução de mortalidade. Perguntar diretamente ao paciente e à família sobre armas de fogo, medicamentos estocados, cordas.

---

### Abstinência Alcoólica — CIWA-Ar e Prevenção de Wernicke

A síndrome de abstinência alcoólica ocorre por supressão do efeito GABAérgico crônico do álcool, levando a hiperexcitabilidade do SNC.

| Fase | Início pós última dose | Manifestações Clínicas |
|---|---|---|
| Tremores leves + ansiedade | 6–12h | Tremor fino, sudorese, taquicardia, ansiedade |
| Alucinações alcoólicas | 12–24h | Alucinações visuais/auditivas com consciência PRESERVADA (diferente do DT) |
| Convulsões de abstinência | 24–48h | Tônico-clônica generalizada; geralmente autolimitada |
| **Delirium tremens (DT)** | **48–96h** | **Confusão + agitação + instabilidade autonômica + febre — mortalidade 5–15% se não tratado** |

**Escala CIWA-Ar:** avalia 10 itens (tremor, sudorese, ansiedade, agitação, alucinações, cefaleia, náusea, distúrbio perceptivo, distúrbio do tato, nível de consciência). Score > 8 indica tratamento medicamentoso.

**Protocolo de tratamento:**
- **Tiamina 300 mg IV OBRIGATORIAMENTE ANTES da glicose** — glicose sem tiamina precipita encefalopatia de Wernicke aguda (irreversível)
- **Diazepam** 10 mg VO/IV a cada 1–2h guiado por CIWA-Ar (protocolo de dose sintoma-disparada)
- Correção de magnésio (hipomagnesemia muito frequente em alcoolistas — potencializa risco de convulsão)
- Hidratação IV + eletrólitos

> **Encefalopatia de Wernicke:** tríade clássica — oftalmoplegia (paralisia do VI par) + ataxia de marcha + confusão mental. Presente completa em apenas 10% dos casos. Tratar empiricamente se suspeita. Tiamina 300 mg IV 3×/dia × 3 dias.

---

### Síndrome Neuroléptica Maligna (SNM)

Complicação grave de antipsicóticos (típicos > atípicos), ocorrendo em horas a dias após início ou aumento de dose.

**Pentade diagnóstica:**
1. Hipertermia (temperatura > 38°C, frequentemente > 40°C)
2. Rigidez muscular em "cano de chumbo" (extrapiramidal grave)
3. Rebaixamento do nível de consciência (confusão → coma)
4. Instabilidade autonômica (taquicardia, labilidade pressórica, sudorese profusa)
5. Leucocitose + CK elevada (CK > 1.000 UI/L — marca diagnóstica)

| Diagnóstico Diferencial | Diferenciação |
|---|---|
| Síndrome serotoninérgica | Clonus, hiperreflexia, mioclonia — início mais rápido (horas); rigidez menos intensa |
| Catatonia maligna | Difícil distinção; ECT pode ser necessária |
| Meningite/encefalite | LCR alterado; sem exposição a antipsicótico |

**Tratamento:**
- Suspender imediatamente o antipsicótico causador
- Suporte intensivo (UTI): resfriamento ativo, hidratação vigorosa (proteger rins da mioglobinúria)
- **Bromocriptina** 2,5–5 mg 3×/dia VO (agonista dopaminérgico)
- **Dantrolene** 1–2,5 mg/kg IV (relaxante muscular central) — especialmente se CK muito elevada
- Evitar reintrodução de antipsicótico por pelo menos 2 semanas

---

### Dependência Química — Critérios DSM-5 e Tratamento

**Transtorno por Uso de Substâncias (TUS) — DSM-5:** 11 critérios em 2 domínios (perda de controle, impacto social/físico). 2–3 critérios = leve; 4–5 = moderado; ≥ 6 = grave.

| Substância | Tratamento de Abstinência | Manutenção/Prevenção Recaída |
|---|---|---|
| **Álcool** | Diazepam protocolo CIWA + tiamina | Naltrexona 50 mg/dia VO OU acamprosato OU dissulfiram |
| **Opioides** | Buprenorfina/naloxona (suboxone) — redução gradual | Buprenorfina/naloxona manutenção OU naltrexona 380 mg IM/mês |
| **Cocaína/crack** | Suporte sintomático (não há farmacoterapia específica) | TCC + grupos de apoio (NA/AA) |
| **Tabaco** | — | Vareniclina 1ª linha + reposição nicotínica |
| **Benzodiazepínicos** | Substituição por BDZ longa ação + retirada gradual | Psicoterapia |

> **Pérola: Estratégia de Redução de Danos** — kits de naloxona nasal para familiares de usuários de opioides; distribuição de seringas; salas de uso supervisionado. Evidência nível A para redução de mortalidade e transmissão de doenças.

**Overdose de opioides:**
- Tríade: miose puntiforme + depressão respiratória + rebaixamento de consciência
- **Naloxona 0,4 mg IV/IM** — repetir a cada 2–3 min (máx 10 mg); meia-vida curta 30–90 min — risco de resedação; manter observação ≥ 4h

---

### Populações Especiais

**Gestante com dependência de opioides:** substituição por metadona ou buprenorfina é PREFERÍVEL à abstinência abrupta (síndrome de abstinência neonatal é manejável; aborto espontâneo e parto prematuro são os maiores riscos da retirada abrupta).

**Idoso agitado:** doses menores de antipsicóticos; haloperidol 1,5–2,5 mg IM; risco aumentado de delirium iatrogênico; afastar causas orgânicas (infecção, hipoglicemia, AVC) antes de diagnóstico psiquiátrico primário.

**Adolescente:** TUS precoce associado a maior gravidade e comorbidade psiquiátrica; abordagem motivacional; Lei 10.216 se < 18 anos e necessidade de internação involuntária requer consentimento dos responsáveis.

---

### Caso Clínico

**Homem, 34 anos, portador de esquizofrenia paranoide em uso de haloperidol decanoate 100 mg/mês IM. Há 72h iniciou temperatura de 39,8°C, rigidez muscular intensa ("cano de chumbo"), confusão mental progressiva, sudorese profusa e PA oscilando entre 90/60 e 170/100 mmHg. CK: 4.800 UI/L. Leucócitos: 16.000/mm³.**

**Análise e Conduta:**
- **Diagnóstico:** Síndrome Neuroléptica Maligna — presença de pentade completa (hipertermia + rigidez + rebaixamento + instabilidade autonômica + CK > 1.000 + leucocitose)
- **Conduta imediata:**
  - Suspender haloperidol decanoate (meia-vida longa — monitorar por dias)
  - Internação em UTI — resfriamento ativo, hidratação vigorosa IV (meta diurese > 1 mL/kg/h para proteger rins da mioglobinúria)
  - Bromocriptina 2,5 mg 3×/dia VO (introduzir via SNG se necessário)
  - Dantrolene 1 mg/kg IV — repetir a cada 6h conforme resposta
- **Monitorar:** CK seriada, função renal (mioglobinúria → IRA), gasometria
- **Retorno do antipsicótico:** mínimo 2 semanas após resolução completa; preferir atípico com menor potência D2`, ativo: true,
    },
    // ── Infectologia — Mês 5 (5 aulas) ──────────────────────────────────────
    {
      titulo: 'HIV/AIDS: Diagnóstico, TARV e Profilaxias',
      descricao: 'Diagnóstico (testes rápidos + confirmatório), estadiamento clínico (OMS e CDC), critérios para TARV, esquemas de 1ª linha e profilaxias de IO.',
      disciplina: 'Clínica Médica', tema: 'Infectologia', tipo: 'texto', nivel: 'avancado',
      duracao: 61, ordem: 1, mes: 5, semana: 1,
      videoUrl: null,
      conteudo: `## HIV/AIDS: Diagnóstico, TARV e Profilaxias

**Base:** DHHS Guidelines 2024 + MS Brasil PCDT HIV 2023 + WHO Consolidated Guidelines on HIV 2023

---

### Fisiopatologia — CD4, Carga Viral e Progressão

O HIV (vírus da imunodeficiência humana) pertence à família Retroviridae, subfamília Lentiviridae. Infecta preferencialmente linfócitos T CD4+ via receptor CD4 e co-receptores CCR5 (vírus R5 — transmissão sexual) ou CXCR4 (vírus X4 — fases avançadas).

**Curso natural sem TARV:**
1. **Infecção aguda (2–4 semanas):** síndrome retroviral aguda — febre, faringite, linfadenopatia, rash maculopapular; carga viral muito elevada (> 10⁶ cópias/mL); CD4 cai transitoriamente
2. **Latência clínica (2–10 anos):** viremia baixa porém contínua; CD4 declina ~50–100 cél/mm³/ano
3. **AIDS:** CD4 < 200 cél/mm³ OU infecção oportunista definidora de AIDS

> **Janela imunológica:** período entre a infecção e o aparecimento de anticorpos detectáveis. ELISA 3ª geração: até 3 semanas. ELISA 4ª geração (Ag p24 + Ac): até 15 dias. RNA viral (PCR): detectável em 10–12 dias (mais precoce).

---

### Diagnóstico — Algoritmo do MS Brasil 2023

**Fluxograma para adultos com sintomas ou suspeita clínica:**

1. **Teste rápido 1 (TR1)** — imunocromatográfico (metodologia A)
   - Não reagente: excluído (se janela adequada)
   - Reagente → prosseguir
2. **Teste rápido 2 (TR2)** — metodologia diferente (B) no mesmo dia
   - TR1 reagente + TR2 reagente = **diagnóstico confirmado** de infecção pelo HIV
   - TR1 reagente + TR2 não reagente = resultado **indeterminado** → ELISA 4ª geração + Western Blot ou NAAT

**Após confirmação:**
- **CD4:** estadiamento imunológico + indicações de profilaxias
- **Carga viral (HIV-RNA):** meta < 50 cópias/mL (indetectável) após 6 meses de TARV
- **Genotipagem de resistência:** OBRIGATÓRIA antes de iniciar TARV (PCDT 2023)
- **Exames basais:** hemograma, creatinina, glicemia, lipidograma, TGO/TGP, sorologias (HBsAg, anti-HCV, VDRL, toxoplasmose, citomegalovírus)

---

### Estadiamento — Critérios de AIDS

| Critério | Definição |
|---|---|
| **Imunológico** | CD4 < 200 cél/mm³ (independente de sintomas) |
| **Clínico (infecção oportunista definidora)** | Pneumocistose, toxoplasmose cerebral, criptococose, histoplasmose disseminada, criptosporidiose, CMV (retinite/colite), MAC disseminado, Kaposi, linfoma primário SNC, wasting syndrome, câncer cervical invasivo, TB pulmonar + CD4 < 200, etc. |

---

### TARV — Quando Iniciar e Esquemas

**Indicação universal:** TODOS os pacientes com diagnóstico de HIV, independente do CD4 ou carga viral — iniciar o mais breve possível.

**Urgência máxima (iniciar em < 7 dias):** gestação, TB ativa, IO grave (exceto meningite criptocócica — iniciar TARV 5 semanas após tratamento da meningite para evitar SIRI fatal), CD4 < 50 cél/mm³.

**Esquema preferencial 1ª linha — PCDT MS Brasil 2023:**

| Situação | Esquema | Apresentação |
|---|---|---|
| **1ª linha padrão** | **TDF + 3TC + DTG** | Comprimido único diário (DTG/TDF/3TC 50/300/300 mg) |
| TB ativa (rifampicina) | TDF + 3TC + **DTG 50 mg 2×/dia** | Separar DTG da rifampicina por 12h |
| Gestação (1º trimestre) | TDF + 3TC + **RAL** (raltegravir) | Evitar DTG no 1º trimestre (risco DTN — embora revisado) |
| Coinfecção HBV ativa | TDF + **FTC** + DTG | FTC ativo contra HBV e HIV |
| Insuficiência renal grave (ClCr < 50) | ABC/3TC + DTG | Evitar TDF nefrotóxico |

> **Pérola clínica:** DTG tem altíssima barreira genética — raramente desenvolve resistência. É o INSTI de escolha no Brasil. Interação com rifampicina exige dobrar a dose (50 mg 2×/dia).

---

### Profilaxias de Infecções Oportunistas

| CD4 (cél/mm³) | Infecção | Profilaxia Primária | Suspender quando |
|---|---|---|---|
| **< 200** | Pneumocistose — PCP (P. jirovecii) | Cotrimoxazol (TMP-SMX) 960 mg/dia OU 960 mg 3×/semana | CD4 > 200 por ≥ 3 meses |
| **< 100** + IgG Toxoplasma positivo | Toxoplasmose cerebral | Cotrimoxazol 960 mg/dia (cobre PCP também) | CD4 > 200 por ≥ 3 meses |
| **< 100** | MAC (Mycobacterium avium complex) | Azitromicina 1.200 mg/semana | CD4 > 100 por ≥ 3 meses |
| **< 100** | Criptococose (se rastreio LFA+) | Fluconazol 200 mg/dia | CD4 > 100 por ≥ 3 meses |
| Qualquer CD4 + IGRA/PT+ sem TB ativa | ILTB (tuberculose latente) | Isoniazida 300 mg/dia × 270 doses (9 meses) | Completar 270 doses |

> **Pérola clínica:** Toda PVHIV deve ser rastreada para TB ATIVA antes de iniciar profilaxia de ILTB com isoniazida. Sintomático respiratório (tosse > 2 semanas, hemoptise, febre noturna, emagrecimento) → baciloscopia + GeneXpert ANTES da isoniazida.

---

### PEP — Profilaxia Pós-Exposição

| Item | Detalhe |
|---|---|
| **Indicação** | Exposição sexual (condom quebrado, violência sexual), ocupacional (picada de agulha, mucosa), compartilhamento de seringas |
| **Janela temporal** | Iniciar em até **72 horas** — quanto mais precoce, melhor eficácia |
| **Duração** | **28 dias** contínuos |
| **Esquema preferencial** | TDF + 3TC + DTG (PCDT 2023) |
| **Seguimento** | Anti-HIV: basal, 30 dias e 90 dias pós-PEP |

**Exposição de ALTO RISCO:** relação anal receptiva sem preservativo com parceiro HIV+ desconhecido ou sem carga indetectável, violência sexual, agulha com sangue visível de paciente HIV+.

**Exposição de BAIXO RISCO:** sexo oral, picada com agulha descartada.

---

### PrEP — Profilaxia Pré-Exposição

| Item | Detalhe |
|---|---|
| **Indicação** | Populações-chave com risco elevado: HSH, travestis/trans, trabalhadores(as) do sexo, parcerias sorodiscordantes, PVID (pessoas que injetam drogas) |
| **Esquema** | TDF/FTC (tenofovir/emtricitabina) 300/200 mg — comprimido único diário (Truvada genérico) |
| **Eficácia** | 99% de redução do risco se tomado corretamente e continuamente |
| **Controle** | HIV (trimestral), creatinina (6/6 meses), ISTs, hepatite B pré-início |
| **Atenção** | NÃO protege contra outras ISTs — associar preservativo |

---

### Interações Medicamentosas Relevantes

| Situação | Problema | Solução |
|---|---|---|
| TARV + Rifampicina (TB) | Rifampicina induz CYP3A4 → reduz nível de IPs e INNTRs | Usar DTG 50 mg 2×/dia ou RAL 400 mg 2×/dia |
| TARV + Fluconazol | Fluconazol inibe CYP → aumenta nível de alguns ARVs | Monitorar TGP |
| TDF + AINEs + tenofovir | Nefrotoxicidade sinérgica | Evitar AINEs; monitorar creatinina |
| DTG + metformina | DTG inibe transportador OCT2 → aumenta metformina | Reduzir dose de metformina ou evitar combinação |

---

### Transmissão Vertical — Prevenção

| Momento | Conduta |
|---|---|
| Diagnóstico na gestação | TARV imediatamente (TDF + 3TC + RAL no 1º tri; TDF + 3TC + DTG após 1º tri) |
| Parto (carga viral indetectável) | Parto via baixa permitido se CV < 1.000 cópias; cesárea eletiva se CV > 1.000 cópias |
| Intraparto | AZT IV: 2 mg/kg na 1ª hora → 1 mg/kg/h até clampeamento |
| Recém-nascido | AZT oral 4 semanas (2 mg/kg 6/6h); adicionar NVP se alto risco |
| Aleitamento | **CONTRAINDICADO** — fórmula infantil gratuita pelo SUS até 6 meses |

---

### Caso Clínico

**Homem, 29 anos, HSH (homem que faz sexo com homem), relata múltiplos parceiros sem preservativo. Assintomático. Solicita orientação sobre prevenção. Testes rápidos HIV não reagentes. Sorologia HBsAg negativo, anti-HBs negativo. VDRL negativo. Creatinina 0,9 mg/dL.**

**Análise e Conduta:**
- **Perfil de risco:** HSH com múltiplos parceiros → indicação FORMAL de PrEP pelo PCDT MS 2023
- **Conduta:**
  - Iniciar TDF/FTC 300/200 mg (Truvada) 1 comprimido/dia
  - Vacinar contra HBV (3 doses) e HPV (se < 45 anos)
  - Orientar: PrEP não substitui preservativo — sem proteção contra outras ISTs
  - Monitorar: anti-HIV trimestral, creatinina semestral, rastreio de ISTs (sífilis, gonorreia, clamídia) trimestral
  - Controle a cada 3 meses
- **Se no futuro tiver exposição de risco de HIV:** PEP ainda indicada se exposição de alto risco específico
- **Notificação:** diagnóstico de HIV é de notificação compulsória no SINAN`,
      ativo: true,
    },
    {
      titulo: 'Hepatites Virais B e C',
      descricao: 'Marcadores sorológicos HBV (tabela completa), fases da infecção, indicações de tratamento, HCV pan-genotípico, coinfecção HIV/HBV/HCV, carcinoma hepatocelular. Base: EASL 2024 + AASLD 2023 + MS Brasil PCH 2023.',
      disciplina: 'Clínica Médica', tema: 'Infectologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 51, ordem: 2, mes: 5, semana: 2,
      videoUrl: null,
      conteudo: `## Hepatites Virais B e C

**Base:** EASL HBV Guidelines 2024 + AASLD HCV Guidelines 2023 + PCDT Hepatites MS Brasil 2023

---

### 1. Hepatite B — Marcadores Sorológicos: Interpretação Completa

O VHB possui um ciclo complexo com múltiplos antígenos e anticorpos cuja interpretação correta é essencial para estadiar a infecção, indicar tratamento e avaliar imunidade.

| HBsAg | Anti-HBs | Anti-HBc IgM | Anti-HBc IgG | HBeAg | Anti-HBe | HBV-DNA | Interpretação |
|---|---|---|---|---|---|---|---|
| – | + | – | – | – | – | Indetectável | **Vacinado com sucesso** (só Anti-HBs) |
| – | + | – | + | – | + | Indetectável | **Cura natural** (imunidade pós-infecção) |
| + | – | + | – | + | – | Elevado | **Hepatite B aguda** (janela precoce) |
| + | – | – | + | + | – | > 20.000 UI/mL | **HBV crônico HBeAg-positivo** (replicativo) |
| + | – | – | + | – | + | 2.000–20.000 UI/mL | **HBV crônico HBeAg-negativo** (mutante pré-core) |
| + | – | – | + | – | + | < 2.000 UI/mL | **Portador inativo** (ALT normal, fibrose mínima) |
| – | – | – | + | – | ± | Indetectável | **Janela imunológica** OU cura sem soroconversão Anti-HBs |

> Anti-HBc IgM de alta avidez = marcador de infecção aguda recente (< 6 meses). Pode positivar brevemente em reativação de HBV crônico — sempre correlacionar com HBsAg e DNA viral.

### 2. Fases da Infecção Crônica pelo HBV

| Fase | HBeAg | ALT | HBV-DNA | Histologia | Conduta |
|---|---|---|---|---|---|
| Tolerância imune | + | Normal | > 1 milhão UI/mL | Inflamação mínima | Monitorar, geralmente não tratar |
| Hepatite HBeAg+ ativa | + | Elevada | > 20.000 UI/mL | Inflamação/fibrose | **Tratar** |
| Portador inativo | – | Normal | < 2.000 UI/mL | Mínima | Monitorar |
| Hepatite HBeAg– ativa | – | Elevada | 2.000–20.000 UI/mL | Ativa | **Tratar** |
| Fase de escape | – | ↑↑ | ↑↑ | Cirrose | Tratar + rastrear CHC |

**Indicações de tratamento (EASL 2024 / PCDT MS):**
- HBV-DNA > 2.000 UI/mL + ALT > 2× LSN + fibrose ≥ F2 (METAVIR) pela elastografia hepática
- Cirrose compensada: tratar independente de DNA e ALT
- Cirrose descompensada: tratar urgente (preferir TDF, evitar entecavir se risco de resistência)
- Imunossupressão iminente (quimioterapia, rituximabe): profilaxia com TDF 300 mg/dia
- Gestante com HBV-DNA > 200.000 UI/mL no 3º trimestre: TDF para reduzir transmissão vertical

**Drogas antivirais para HBV:**

| Droga | Dose | Barreira Genética | Observações |
|---|---|---|---|
| Tenofovir disoproxil (TDF) | 300 mg/dia VO | Alta | 1ª linha; monitorar função renal e densidade óssea |
| Tenofovir alafenamida (TAF) | 25 mg/dia VO | Alta | Menor nefro/osteo toxicidade; mais caro |
| Entecavir | 0,5 mg/dia VO (1 mg se pré-tratado com lamivudina) | Alta | Não usar em HIV não tratado (seleciona resistência M184V) |
| Interferon-alfa peguilado | 180 mcg/semana SC × 48 semanas | — | Chance de soroconversão HBeAg → Anti-HBe; múltiplos efeitos adversos |

### 3. Hepatite C — Epidemiologia e Genótipos

**Genótipos:** 1 a 6; no Brasil: genótipo 1 (70–80%), genótipo 3 (15–20%).
**Transmissão:** parenteral (UDIV, transfusão pré-1993, tatuagem, piercing, procedimentos médicos).
**Triagem:** HIV+, UDIV, hemodialisados, hemofílicos, transfundidos antes de 1993, filhos de mães HCV+, prisioneiros, nascidos entre 1945–1965 (rastreio universal EUA/CDC).

**Fisiopatologia:** RNA-vírus sem integração ao genoma → lesão hepática pela resposta imune do hospedeiro → 80% cronificam → 20–30% evoluem para cirrose em 20–30 anos → 1–5% ao ano de cirrose para CHC.

### 4. Tratamento do HCV: Antivirais de Ação Direta (AAD)

| Esquema | Genótipo | Duração | RVS12 | Observações |
|---|---|---|---|---|
| Sofosbuvir + Daclatasvir (SOF/DAC) | 1–6 (pan-genotípico) | 12 semanas | ≥ 95% | Disponível no SUS; adicionar ribavirina em cirrose Child B/C |
| Sofosbuvir + Velpatasvir (SOF/VEL) | Pan-genotípico | 12 semanas | > 97% | Epclusa® — sem necessidade de genotipagem |
| Glecaprevir + Pibrentasvir (GLE/PIB) | Pan-genotípico | 8 semanas (sem cirrose); 12 semanas (com cirrose compensada) | > 97% |  Mavyret® — não usar em cirrose descompensada |
| Sofosbuvir + Ledipasvir | Genótipos 1, 4, 5, 6 | 12 semanas | > 95% | Harvoni® — evitar em TFG < 30 |

> RVS12 (Resposta Viral Sustentada 12 semanas após o término) equivale a **cura definitiva** do HCV. Pacientes curados ainda podem ter cirrose — rastreio de CHC se fibrose avançada.

**Contraindicações e interações:**
- Sofosbuvir: contraindicado se TFG < 30 mL/min (exceto SOF/VEL/VOX em especialistas)
- Inibidores de protease (paritaprevir, glecaprevir): contraindicados na cirrose Child B/C
- Interações relevantes: anticonvulsivantes (carbamazepina, fenitoína), rifampicina, amiodarona (risco de bradicardia fatal com sofosbuvir)

### 5. Coinfecção HIV/HBV/HCV

**HIV + HBV:**
- TARV deve conter TDF + 3TC ou FTC (ativo contra ambos os vírus) — nunca usar entecavir isolado no HIV sem TARV
- Risco de hepatite flare na reconstituição imune ao iniciar TARV — monitorar transaminases
- Rastrear CHC a cada 6 meses com USG + AFP em cirróticos

**HIV + HCV:**
- Iniciar TARV antes ou junto ao AAD; CD4 não é barreira para tratar HCV
- Interações: rifabutina (TB-HIV-HCV), lopinavir/ritonavir reduz DAC → ajustar dose
- SVR igual à de mono-infectados com esquemas modernos

> Pacientes com cirrose e HBV ou HCV tratados devem manter rastreio semestral de CHC (USG hepático + AFP) e endoscopia digestiva alta para varizes a cada 1–3 anos, independentemente da resposta viral.

### 6. Carcinoma Hepatocelular (CHC)

- Principal complicação da cirrose por HBV/HCV
- Fatores de risco adicionais: álcool, NASH, aflatoxina
- Rastreio: USG abdominal + AFP a cada 6 meses em cirróticos e em HBV não cirrótico com alto risco (asiático > 40 anos, africano > 20 anos, histórico familiar)
- Diagnóstico: TC/RM com realce arterial + washout venoso (critérios LI-RADS) — biópsia nem sempre necessária
- Tratamento: ressecção cirúrgica, transplante hepático (Critérios de Milão), ablação por radiofrequência, TACE, sorafenibe/lenvatinibe (doença avançada)

### 7. Caso Clínico

**Enunciado:** Homem de 48 anos, assintomático, doador de sangue rejeitado por Anti-HCV reagente. Nega etilismo e uso de drogas. Exames: Anti-HCV reagente, HCV-RNA 850.000 UI/mL (genótipo 1b), ALT 78 UI/L (LSN 40), AST 52 UI/L, bilirrubinas normais, elastografia hepática 9,2 kPa (F2 — fibrose significativa). HBsAg negativo, Anti-HIV negativo.

**Análise:**
- Diagnóstico: **Hepatite C crônica genótipo 1b com fibrose F2**
- Indicação de tratamento: sim (HCV-RNA positivo + fibrose F2 = indicação absoluta)
- Esquema preferencial no SUS: **Sofosbuvir 400 mg + Daclatasvir 60 mg VO/dia × 12 semanas** (sem cirrose, sem ribavirina)
- Alternativa se disponível: SOF/VEL 12 semanas (pan-genotípico, dose única diária)
- Monitoramento: HCV-RNA na semana 4 (resposta rápida), ao final do tratamento e 12 semanas após (RVS12)
- Rastreio de CHC: como há fibrose F2, manter USG semestral mesmo após cura
- Investigar fonte de contaminação: triagem de parceiros e familiares (Anti-HCV)`, ativo: true,
    },
    {
      titulo: 'Tuberculose: Tratamento, Resistência e ILTB',
      descricao: 'Diagnóstico (BAAR, cultura, GeneXpert), esquema RIPE, TB resistente (TB-MDR), infecção latente por TB e quimioprofilaxia.',
      disciplina: 'Clínica Médica', tema: 'Infectologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 59, ordem: 3, mes: 5, semana: 3,
      videoUrl: null,
      conteudo: `## Tuberculose: Tratamento, Resistência e ILTB

**Base:** MS Brasil PNCT 2023 + WHO TB Guidelines 2022 + SBPT Diretrizes 2022

---

### Fisiopatologia — BAAR, Granuloma e Reativação

O Mycobacterium tuberculosis (BAAR — bacilo álcool-ácido resistente) é transmitido por aerossóis de gotículas (núcleos de Wells, < 5 μm). O ciclo patogênico inclui:

1. **Infecção primária:** inalação → fagocitose por macrófagos alveolares → multiplicação intracelular → disseminação linfohematogênica (foco de Ghon + complexo de Ranke)
2. **Formação do granuloma:** resposta imune celular (linfócitos T CD4+ + macrófagos) → granuloma epitelioide com necrose caseosa central → contenção do bacilo em latência
3. **Reativação endógena:** imunodeficiência (HIV, TNF-inibidores, corticoide crônico, DM, desnutrição, idade avançada) → falha na contenção do granuloma → multiplicação bacilar → TB ativa
4. **Tuberculose primária progressiva:** imunossuprimidos graves (CD4 < 200) → ausência de granuloma organizado → disseminação hematogênica → TB miliar/meningite

> A infectividade do doente não-tratado: 1 PVHIV infecta em média 10–15 pessoas/ano. O isolamento respiratório em quarto com pressão negativa é obrigatório até negativação do escarro (geralmente 2 semanas de RIPE em TB sensível).

---

### Diagnóstico — Métodos e Indicações

| Método | Sensibilidade | Especificidade | Características e Indicações |
|---|---|---|---|
| Baciloscopia (BAAR) Ziehl-Neelsen | 59–80% (≥ 2 amostras) | 98% | Rápido (horas), baixo custo. 2 amostras: expectoração espontânea matinal em dias consecutivos. SUS rotina. |
| Cultura em Löwenstein-Jensen | 80–85% (padrão-ouro) | 100% | Resultado: 4–8 semanas. Permite TSA (teste de sensibilidade). MGIT líquido: 2–3 semanas. |
| GeneXpert MTB/RIF | 85–90% (BAAR neg) | 99% | Detecta MTB e resistência à rifampicina em 2h. 1ª escolha no SUS desde 2020 para suspeita de TB. |
| IGRA (QuantiFERON-TB Gold) | 80–90% | 95–99% | Mede IFN-γ contra antígenos ESAT-6/CFP-10. Não reage com BCG. Para ILTB em imunossuprimidos. |
| TST (Teste Tuberculínico/PPD) | 70–80% | 60–70% | Reage com BCG (falso-positivo). Reator: ≥ 5mm em HIV/imunossuprimido; ≥ 10mm em população geral. |

**IGRA vs TST na prática:**
- IGRA: preferível em vacinados com BCG, imunossuprimidos, e quando alta especificidade é necessária
- TST: acessível, barato, útil em contextos com poucos recursos; interpretação conforme imunidade do paciente

> GeneXpert NÃO substitui a cultura para TB extrapulmonar ou quando resistência a outros fármacos além de RIF é necessária. TB negativa ao GeneXpert não exclui o diagnóstico — clínica + imagem + cultura são complementares.

---

### Tratamento da TB Pulmonar Sensível — Esquema RHZE

**Fase intensiva (2 meses):** Rifampicina (R) + Isoniazida (H) + Pirazinamida (Z) + Etambutol (E)
**Fase de manutenção (4 meses):** Rifampicina (R) + Isoniazida (H)

**Doses do esquema RIPE por faixa de peso (adultos — comprimidos combinados no SUS):**

| Fármaco | Sigla | Dose (< 45 kg) | Dose (45–59 kg) | Dose (≥ 60 kg) | Dose máxima |
|---|---|---|---|---|---|
| Rifampicina | R | 300 mg/dia | 450 mg/dia | 600 mg/dia | 600 mg/dia |
| Isoniazida | H | 200 mg/dia | 300 mg/dia | 400 mg/dia | 400 mg/dia |
| Pirazinamida | Z | 1.000 mg/dia | 1.500 mg/dia | 2.000 mg/dia | 2.000 mg/dia |
| Etambutol | E | 600 mg/dia | 800 mg/dia | 1.200 mg/dia | 1.200 mg/dia |

---

### Efeitos Adversos — Conduta e Manejo

| Fármaco | Efeito Adverso Principal | Conduta |
|---|---|---|
| Rifampicina | Hepatotoxicidade (TGO/TGP > 3–5× LSN com sintomas) | Suspender RHZE; reintroduzir individualmente após normalização |
| Rifampicina | Coloração alaranjada de urina, saliva, lágrimas | Orientar paciente — esperado, sem conduta |
| Isoniazida (H) | Neuropatia periférica (parestesias, queimação MMII) | Piridoxina (vitamina B6) 25–50 mg/dia profilática em grupos de risco (HIV, DM, gestantes, alcoolistas) |
| Isoniazida (H) | Hepatotoxicidade | Suspender se TGO/TGP > 5× LSN assintomático ou > 3× com sintomas |
| Pirazinamida (Z) | Hiperuricemia (artralgia — "crise gotosa") | Alopurinol se sintomático; suspender Z se gota franca |
| Etambutol (E) | Neurite óptica (redução de acuidade visual, discromatopsia verde-vermelho) | Teste de Ishihara + acuidade visual antes de iniciar; suspender E se alteração |

**Hepatotoxicidade — quando suspender e como reintroduzir:**
- Suspender RHZE se: TGO/TGP > 5× LSN assintomático OU > 3× LSN com sintomas (náusea, icterícia)
- Esquema de ponte: estreptomicina + etambutol + fluoroquinolona até reintrodução
- Reintroduzir individualmente após normalização: R → H → Z → E (cada 3–7 dias, aguardar tolerância)

---

### Tuberculose Resistente — Definições e Tratamento

| Tipo | Definição | Esquema Preconizado | Duração |
|---|---|---|---|
| TB-RR | Resistência somente à Rifampicina (qualquer padrão) | Tratar como TB-MDR | 6–9 meses (regime BDQ) |
| TB-MDR | Resistência à Rifampicina + Isoniazida (drogas de 1ª linha mais importantes) | BDQ + PZA + LFX + Cfz (regime curto de 6 meses — BPaLM se disponível) | 6–18 meses |
| TB-XDR | MDR + resistência a fluoroquinolonas E a pelo menos 1 injetável de 2ª linha | Esquemas individualizados em centros de referência; pretomanida + BDQ + linezolida (ZeNix) | 6 meses (BPaL) |

**Legenda:** BDQ = bedaquilina; LFX = levofloxacino; Cfz = clofazimina; PZA = pirazinamida; BPaLM = bedaquilina + pretomanida + linezolida + moxifloxacino.

> TB-MDR: suspeitar quando: falha do esquema RIPE após 4 meses de uso supervisionado (DOTS), reingresso após abandono em área de alta MDR, contato com caso MDR confirmado, PVHIV com TB sem resposta.

---

### TB-HIV — Interações e Timing da TARV

A coinfecção TB-HIV é a principal causa de morte em PVHIV no Brasil. Pontos críticos:

**Quando iniciar TARV após início do RIPE:**
- CD4 < 50 células/mm³: iniciar TARV em **2 semanas** (ACTG A5221 STRIDE — redução de mortalidade de 40%)
- CD4 ≥ 50 células/mm³: iniciar TARV em **2–8 semanas** após RIPE
- TB meningite/SNC: aguardar **8 semanas** (risco de síndrome de reconstituição imune — IRIS mais grave no SNC)

**Interação Rifampicina × Antirretrovirais (indução do CYP3A4 e glicoproteína-P):**
- Rifampicina induz CYP3A4 → reduz drasticamente níveis de inibidores de protease e NNRTI
- **Dolutegravir (DTG):** aumentar para **50 mg 2×/dia** durante uso de rifampicina (vs 50 mg 1×/dia padrão)
- **Efavirenz:** manter dose padrão 600 mg/dia (indução CYP autolimitada — efavirenz também induz CYP3A4)
- **Lopinavir/ritonavir:** evitar — concentrações subterêuticas mesmo com dose dobrada
- **Após suspensão da rifampicina:** retornar DTG para 50 mg 1×/dia após 2 semanas

---

### ILTB — Infecção Latente por Tuberculose

**Definição:** infecção pelo M. tuberculosis sem sinais, sintomas ou evidência bacteriológica de TB ativa (BAAR e cultura negativos; imagem sem atividade).

**Indicações de rastreamento e tratamento:**

| Grupo | Critério de TST Positivo | Critério de IGRA Positivo |
|---|---|---|
| PVHIV, imunossuprimidos, transplantados, anti-TNF | ≥ 5 mm (independente de BCG) | Qualquer resultado positivo |
| Contatos de TB bacilífera, profissionais de saúde, população geral | ≥ 10 mm | Qualquer resultado positivo |
| Viragem tuberculínica (aumento ≥ 10 mm em 2 anos) | ≥ 10 mm | — |

**Regimes de tratamento da ILTB (após excluir TB ativa com Rx tórax e clínica):**
- Isoniazida (INH) 300 mg/dia × 6 meses (270 doses) — esquema clássico, mais usado no SUS
- Rifampicina 600 mg/dia × 4 meses — menor duração, mesma eficácia, menor toxicidade hepática
- INH + Rifapentina × 12 doses mensais (3HP) — regime supervisionado, alta adesão

> Antes de tratar ILTB com anti-TNF (adalimumabe, infliximabe, etanercepte): obrigatório excluir TB ativa (TST/IGRA + Rx tórax). Se ILTB confirmada, tratar por pelo menos 1 mês antes de iniciar anti-TNF (FEBRASGO/SBR recomendação).

---

### Caso Clínico — TB Multidrogas Resistente

**Cenário:** Homem, 34 anos, retratamento de TB (abandono do RIPE após 2 meses há 1 ano). Retorna com tosse produtiva purulenta há 3 meses, hemoptise leve, perda de 12 kg, febre vespertina. BAAR ++ em 2 amostras. GeneXpert: MTB detectado, **resistência à rifampicina detectada**. HIV negativo. Rx tórax: caverna apical direita + infiltrado bilateral.

**Diagnóstico:** TB-RR/MDR (resistência à rifampicina — tratar como MDR até TSA completo).

**Conduta:**
1. Hospitalização em quarto de isolamento respiratório (pressão negativa ou quarto individual com ventilação para fora)
2. Cultura de escarro em meio líquido (MGIT) + TSA completo (2ª linha) — resultado em 2–3 semanas
3. Notificação compulsória imediata no SINAN + investigação de contatos
4. Iniciar regime MDR empírico: Bedaquilina 400 mg/dia × 2 semanas → 200 mg 3×/semana × 22 semanas + Levofloxacino 750 mg/dia + Clofazimina 100 mg/dia + Pirazinamida 1.500 mg/dia (≥ 45 kg)
5. ECG basal + a cada 2 semanas (bedaquilina prolonga QTc — suspender se QTc > 500 ms)
6. Ajustar esquema após TSA completo (6 meses total — regime curto se sensível a FQ e PZA)
7. DOTS (tratamento diretamente observado) obrigatório — supervisionado por ACS ou serviço de saúde`, ativo: true,
    },
    {
      titulo: 'Doenças Sexualmente Transmissíveis (ISTs)',
      descricao: 'Sífilis primária/secundária/congênita, gonorreia, clamídia, HPV, herpes genital. Diagnóstico, tratamento e abordagem de parcerias.',
      disciplina: 'Clínica Médica', tema: 'Infectologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 41, ordem: 4, mes: 5, semana: 3,
      videoUrl: null,
      conteudo: `## Doenças Sexualmente Transmissíveis (ISTs)

**Base:** MS Brasil PCDT IST 2022 + CDC STI Guidelines 2021

---

### Abordagem Sindrômica das ISTs

A abordagem sindrômica permite tratamento empírico imediato baseado na síndrome clínica, sem esperar resultado laboratorial — estratégia preconizada pelo MS em serviços de atenção primária.

| Síndrome | Agentes principais | Conduta empírica |
|---|---|---|
| **Úlcera genital** | Sífilis (T. pallidum), Herpes (HSV-1/2), Cancroide (H. ducreyi), LGV (C. trachomatis L1-L3) | PGB 2,4M UI IM + aciclovir 400 mg 3×/dia × 7d |
| **Corrimento uretral masculino** | Gonorreia + Clamídia (coinfecção em 30–40%) | Ceftriaxona 500 mg IM + doxiciclina 100 mg 2×/dia × 7d |
| **Corrimento cervical** | Gonorreia + Clamídia | Ceftriaxona 500 mg IM + doxiciclina 100 mg 2×/dia × 7d |
| **Síndrome DIP** | N. gonorrhoeae + C. trachomatis + anaeróbios | Ver seção DIP |
| **Verrugas genitais** | HPV (tipos 6 e 11) | Imiquimode 5% tópico OU ATA 80–90% OU crioterapia |

---

### Sífilis — Estadiamento Completo e Tratamento

| Estágio | Manifestações Clínicas | VDRL (RPR) | Tratamento |
|---|---|---|---|
| **Primária** | Cancro duro: úlcera indolor, base endurecida, borda bem definida, adenopatia inguinal bilateral indolor — auto-resolve em 4–6 semanas | Negativo ou baixo título | **PGB 2,4M UI IM dose única** |
| **Secundária** | Rash máculo-papular palmoplantar (patognomônico), condiloma lata, alopecia em "traça", adenomegalia generalizada, placas mucosas | **Alto título ≥ 1:16** | **PGB 2,4M UI IM — 3 doses** (semanas 1, 2 e 3) |
| **Latente recente** (< 1 ano) | Assintomático (diagnóstico sorológico) | Positivo | PGB 2,4M UI IM — 3 doses semanais |
| **Latente tardia** (> 1 ano ou indeterminada) | Assintomático | Positivo (título variável) | PGB 2,4M UI IM — 3 doses semanais |
| **Terciária** | Goma sifilítica, aortite, aneurisma aórtico, neurossífilis | Baixo ou negativo | Penicilina G cristalina IV 18–24M UI/dia × 10–14 dias |

**Critérios de resposta:** queda de ≥ 2 diluições no VDRL em 6 meses (sífilis recente) ou 12 meses (sífilis tardia) = resposta adequada. Título estabilizado (serofast) sem aumento = não reinfecção, observar.

**Neurossífilis:** VDRL no LCR positivo OU FTA-ABS no LCR + pleocitose. Suspeitar em: sífilis terciária, falha terapêutica, HIV+. Tratamento: penicilina G cristalina 3–4M UI IV 4/4h × 14 dias.

---

### Sífilis Congênita — Diagnóstico e Tratamento

> **Regra absoluta:** APENAS penicilina G benzatina atravessa a barreira placentária eficazmente. Eritromicina, azitromicina e ceftriaxona NÃO previnem sífilis congênita. Gestante alérgica à penicilina deve ser dessensibilizada.

**Notificação compulsória:** todo caso de sífilis em gestante ou congênita deve ser notificado no SINAN imediatamente.

| Situação | Critério diagnóstico no RN | Tratamento |
|---|---|---|
| Sífilis congênita confirmada | VDRL RN > 4× VDRL materno OU clínica compatível | Penicilina G cristalina 50.000 UI/kg IV 12/12h (7 dias) ou 8/8h (10–14 dias se SNC) |
| Mãe não tratada ou inadequadamente tratada | Qualquer resultado no RN | Penicilina G cristalina 10 dias |
| Mãe adequadamente tratada, assintomático | VDRL RN ≤ materno | PGB 50.000 UI/kg IM dose única |

**Manifestações da sífilis congênita precoce (< 2 anos):** hepatoesplenomegalia, rinorreia sanguinolenta ("coriza"), osteocondrite (dor à movimentação do membro — pseudoparalisia de Parrot), lesões bolhosas palmo-plantares, icterícia, anemia.

---

### Gonorreia e Clamídia — Coinfecção e Tratamento

| Aspecto | Gonorreia (N. gonorrhoeae) | Clamídia (C. trachomatis) |
|---|---|---|
| Corrimento | Purulento, abundante, esverdeado | Mucoso, escasso ou ausente |
| Disúria | Intensa, precoce | Leve ou ausente |
| Incubação | 2–7 dias | 7–21 dias |
| Diagnóstico | Cultura em meio de Thayer-Martin; NAAT (mais sensível) | NAAT (PCR) — padrão-ouro |
| Complicações | DIP, epididimite, artrite gonocócica, conjuntivite neonatal | DIP, salpingite, síndrome de Fitz-Hugh-Curtis, conjuntivite |
| Tratamento | **Ceftriaxona 500 mg IM dose única** | **Doxiciclina 100 mg 2×/dia × 7 dias** |

> **Sempre tratar gonorreia e clamídia juntas** — coinfecção ocorre em 30–40% dos casos. A azitromicina 1 g dose única (alternativa histórica para clamídia) foi removida do PCDT 2022 como 1ª linha por resistência crescente do gonococo.

---

### Herpes Genital — Primo-infecção e Supressão

**Epidemiologia:** HSV-2 responsável por ~90% dos casos genitais; soroprevalência de 15–20% na população adulta brasileira. Maioria das transmissões ocorre por parceiros assintomáticos (shed assintomático).

**Clínica da primo-infecção:** vesículas dolorosas em agrupamentos → úlceras rasas, eritematosas, muito dolorosas; pode haver febre, adenopatia inguinal, disúria; duração 2–3 semanas sem tratamento.

| Indicação | Esquema | Duração |
|---|---|---|
| Primo-infecção | Aciclovir 400 mg 3×/dia OU valaciclovir 1 g 2×/dia | 7–10 dias |
| Recorrência | Aciclovir 400 mg 3×/dia OU valaciclovir 500 mg 2×/dia | 5 dias |
| Supressão crônica (≥ 6 recorrências/ano) | Aciclovir 400 mg 2×/dia OU valaciclovir 500 mg/dia | Contínuo (reavaliar anualmente) |
| Herpes neonatal (RN de mãe com lesão ativa) | Aciclovir 20 mg/kg IV 8/8h | 14–21 dias |

> **Herpes e HIV:** paciente HIV+ com herpes tem recorrências mais frequentes e graves; usar valaciclovir 1 g 2×/dia para episódios; supressão com aciclovir 400 mg 2×/dia reduz transmissão do HIV.

---

### DIP — Doença Inflamatória Pélvica

A DIP resulta de infecção ascendente do trato genital inferior para o superior (endométrio, tubas, ovários, peritônio pélvico).

**Critérios diagnósticos mínimos (basta 1 para tratar empiricamente):**
- Dor à palpação uterina
- Dor à palpação anexial
- Dor ao mobilização do colo uterino

**Critérios adicionais (aumentam especificidade):** temperatura > 38,3°C, leucocitose, VHS/PCR elevados, NAAT positivo para gonorreia/clamídia, exsudato purulento ao exame especular, ultrassom (abscesso tubo-ovariano).

**Critérios de internação:** suspeita de abscesso tubo-ovariano, falha ao tratamento ambulatorial em 72h, gravidez, incapacidade de tolerar VO, dúvida diagnóstica com necessidade de excluir apendicite.

| Cenário | Esquema |
|---|---|
| Ambulatorial | Ceftriaxona 500 mg IM dose única + doxiciclina 100 mg 2×/dia × 14d + metronidazol 500 mg 2×/dia × 14d |
| Internação (IV) | Cefoxitina 2 g IV 6/6h + doxiciclina 100 mg 12/12h; ou clindamicina 900 mg IV 8/8h + gentamicina 2 mg/kg IV dose de ataque |

---

### Caso Clínico

**Homem, 24 anos, MSM (homem que faz sexo com homens), queixa de úlcera peniana única, indolor, base endurecida, há 10 dias. Adenopatia inguinal bilateral indolor. VDRL 1:64. FTA-ABS reagente. Nega outras ISTs. HIV não reagente recente.**

**Análise e Conduta:**
- **Diagnóstico:** Sífilis primária (cancro duro + VDRL + FTA-ABS) com alta carga — VDRL 1:64 pode indicar sífilis secundária concomitante (avaliar outros sintomas)
- **Tratamento:** PGB 2,4M UI IM — **3 doses** (semanas 1, 2 e 3) — protocolo para sífilis com duração indeterminada
- **Notificação:** SINAN obrigatório
- **Parceiros:** rastrear e tratar todos os parceiros dos últimos 12 meses
- **Seguimento:** VDRL mensal × 3 meses, depois trimestral × 9 meses — meta: queda ≥ 2 diluições
- **Rastreamento:** repetir HIV (janela), hepatite B e C, gonorreia/clamídia retal e faríngea (MSM)`, ativo: true,
    },
    {
      titulo: 'Arboviroses: Dengue, Zika, Chikungunya e Leptospirose',
      descricao: 'Classificação MS da dengue por grupos A-D, sinais de alarme, conduta por grupo. Zika e síndrome congênita. Leptospirose: diagnóstico e tratamento.',
      disciplina: 'Clínica Médica', tema: 'Infectologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 66, ordem: 5, mes: 5, semana: 4,
      videoUrl: null,
      conteudo: `## Arboviroses: Dengue, Zika, Chikungunya e Leptospirose

**Base:** MS Brasil PDCT Dengue 2024 + PAHO Dengue Guidelines 2022 + WHO Dengue 2022 + MS Leptospirose 2023

---

### Dengue — Epidemiologia, Fisiopatologia e Sorotipos

O vírus dengue (DENV) pertence à família Flaviviridae, transmitido pelo Aedes aegypti (principal) e Aedes albopictus. Existem 4 sorotipos antigenicamente distintos: DENV-1, DENV-2, DENV-3 e DENV-4.

**Fisiopatologia da dengue grave:**
- Infecção primária por qualquer sorotipo → imunidade homóloga permanente e heteróloga temporária (cruzada entre sorotipos por 3–12 meses)
- Infecção secundária por sorotipo diferente → anticorpos heterólogos formam complexos com o novo vírus → ligação ao receptor Fc de macrófagos → amplificação da replicação viral (ADE — Antibody-Dependent Enhancement) → pico de viremia mais alto → maior extravasamento plasmático → dengue grave
- Trombocitopenia: destruição plaquetária imunomediada + supressão da medula óssea pelo vírus

**Diagnóstico laboratorial:**

| Exame | Janela | Interpretação |
|---|---|---|
| NS1 (antígeno viral) | Dias 1–5 dos sintomas | Alta sensibilidade na fase virêmica; detecta todos os sorotipos |
| RT-PCR | Dias 1–5 | Padrão-ouro na fase aguda; identifica sorotipo |
| IgM (ELISA) | A partir do dia 5 | Infecção aguda ou recente; pode persistir 90 dias |
| IgG (ELISA) | A partir do dia 5 | Infecção prévia (sorotipo diferente) ou reinfecção (títulos altos) |
| Hemograma seriado | Ao longo da doença | Leucopenia + trombocitopenia + hemoconcentração (Htc ≥ 20% = alarme) |

---

### Classificação MS 2024 — Grupos A, B, C e D

| Grupo | Critérios | Conduta Específica |
|---|---|---|
| A | Sem comorbidades, sem sinais de alarme, sem sangramento | Alta com hidratação oral 60 mL/kg/dia (mínimo 2L adulto). Retorno em 48h ou imediato se piora. Paracetamol para febre. |
| B | Comorbidade significativa (DM, DRC, cardiopatia, gestante) OU sangramento leve OU risco social (mora sozinho, difícil acesso) | Observação 4h na UPA/PA. Hidratação oral supervisionada. Hemograma + Htc. Alta se estável. |
| C | Presença de ≥ 1 sinal de alarme (ver abaixo) | Internação hospitalar. Hidratação IV fase de expansão: 10 mL/kg Ringer lactato em 1h. Reavaliação seriada. |
| D | Choque (PA divergente, extremidades frias, taquicardia + hipotensão) OU sangramento grave OU disfunção orgânica | UTI. Hidratação IV rápida 20 mL/kg em 15–30 min. Avaliar necessidade de vasopressores. |

**Sinais de alarme — critérios para Grupo C:**
- Dor abdominal intensa e contínua ou à palpação do abdome
- Vômitos persistentes (≥ 3 episódios/hora)
- Acúmulo de líquidos: ascite, derrame pleural, edema palpebral
- Hipotensão postural ou lipotímia
- Hepatomegalia > 2 cm abaixo do rebordo costal
- Sangramento de mucosas (gengivorragia, epistaxe, metrorragia)
- Letargia, irritabilidade, sonolência excessiva
- Hematócrito crescente + queda abrupta de plaquetas

**Prova do laço:** positiva se ≥ 20 petéquias em área de 2,5 × 2,5 cm². Mede fragilidade capilar — não diagnóstica sozinha, mas contexto epidêmico = suspeita de dengue.

**Plaquetas — critérios de transfusão:**
- Plaquetas < 20.000/mm³ sem sangramento → transfusão profilática discutida
- Plaquetas < 50.000/mm³ com sangramento ativo → transfusão indicada
- NÃO transfundir plaquetas baseado apenas em contagem sem sangramento e acima de 20.000

> AAS, ibuprofeno e outros AINEs são ABSOLUTAMENTE CONTRAINDICADOS na dengue (risco de síndrome de Reye em crianças e agravamento do sangramento). Usar apenas paracetamol ou dipirona para analgesia/antipirexia.

---

### Diagnóstico Diferencial — Dengue vs Zika vs Chikungunya

| Característica | Dengue | Zika | Chikungunya |
|---|---|---|---|
| Febre | Alta (39–40°C) + intensa | Baixa (37,5–38,5°C) ou ausente | Alta (39–40°C) |
| Artralgia | Leve, difusa | Moderada, poliartralgias | INTENSA, incapacitante, simétrica de pequenas articulações |
| Exantema | Tardio (após febre cair), maculopapular com ilhas de pele sã | PRECOCE, maculopapular pruriginoso generalizado | Maculopapular, menos intenso |
| Prurido | Leve | INTENSO (característico) | Moderado |
| Conjuntivite | Rara | Comum (não purulenta) | Ocasional |
| Hemorragia | SIM (característica) | Ausente | Ausente |
| Trombocitopenia | SIM (sinal de alarme) | Discreta | Discreta |
| Complicações graves | Choque por extravasamento plasmático | Guillain-Barré, microcefalia fetal | Artralgia crônica (30–40% por > 3 meses) |

---

### Zika — Síndrome Congênita e Guillain-Barré

**Transmissão:** Aedes aegypti (principal) + via sexual (sêmen: até 3 meses) + transfusão sanguínea

**Síndrome congênita do Zika (SCZ):**
- Microcefalia: PC < 32 cm ao nascer (ou < 28 cm em prematuros) — critério OMS para notificação
- Calcificações intracranianas periventriculares (TC/RM crânio)
- Malformações oculares (coriorretinite, atrofia óptica), artrogripose, hipertonia
- Risco maior quando infecção materna no 1º trimestre (período de organogênese neurológica)
- Rastreio em gestantes na epidemia: RT-PCR urina ou sangue até 7 dias dos sintomas; IgM soro até 12 semanas

**Síndrome de Guillain-Barré pós-Zika:**
- Polirradiculoneuropatia desmielinizante aguda, 2–4 semanas após infecção pelo Zika
- Fraqueza ascendente + arreflexia + LCR: dissociação proteico-citológica
- Tratamento: IVIG 0,4 g/kg/dia × 5 dias ou plasmaférese

---

### Chikungunya — Fases e Tratamento da Artralgia Crônica

**Fase aguda (< 3 semanas):** febre alta, artralgia intensa simétrica bilateral (mãos, punhos, tornozelos, joelhos), exantema maculopapular, mialgias.

**Fase subaguda (3 semanas–3 meses):** artralgia persistente em padrão reumatológico, tenossinovites, edema articular.

**Fase crônica (> 3 meses):** ocorre em 30–40% dos pacientes — artralgia poliarticular crônica recorrente, similar à artrite reumatoide.

**Tratamento por fase:**
- Fase aguda: repouso, hidratação, paracetamol/dipirona — AINEs com cautela (aguardar confirmação diagnóstica para excluir dengue)
- Fase subaguda/crônica: AINEs (ibuprofeno, naproxeno); fisioterapia; cloroquina 250 mg/dia (alternativa para artralgia crônica refratária — evidência moderada)
- Casos refratários graves: metotrexato ou hidroxicloroquina (similar a artrite reumatoide)

---

### Leptospirose — Fisiopatologia, Diagnóstico e Tratamento

**Agente:** Leptospira interrogans — espiroqueta transmitida por urina de roedores contaminando água/solo. Epidemias associadas a chuvas e enchentes.

**Fisiopatologia bifásica:**

| Fase | Duração | Mecanismo | Manifestações Clínicas |
|---|---|---|---|
| Leptospirêmica | 3–7 dias | Bacteremia — leptospiras circulantes no sangue e LCR | Febre alta abrupta, cefaleia intensa, mialgia (panturrilhas — "sinal de Faget modificado"), prostração, sufusão conjuntival |
| Imune (Weil) | 4–30 dias | Resposta imune contra leptospiras + vasculite | Icterícia intensa (bilirrubina direta) + IRA oligúrica + hemorragia pulmonar (SRPA = síndrome respiratória pulmonar aguda) + plaquetopenia |

**Síndrome de Weil:** tríade de icterícia + insuficiência renal aguda + hemorragia — mortalidade 10–15%.

**Diagnóstico laboratorial:**

| Exame | Janela | Utilidade |
|---|---|---|
| MAT (microaglutinação) | ≥ 7 dias (IgM) | Padrão-ouro sorológico — título ≥ 1:800 ou elevação 4× confirma |
| ELISA IgM | ≥ 5–7 dias | Triagem rápida, alta sensibilidade, menor especificidade |
| PCR sangue/urina | Fase leptospirêmica (1ª semana) | Alta especificidade; pouco disponível no SUS rotineiro |
| Cultura (EMJH) | Fase aguda | Padrão-ouro absoluto — resultado em semanas; complexo |

> Na Síndrome de Weil, a bilirrubina pode atingir valores > 30 mg/dL (predomínio direta). IRA por leptospirose é tubulointerstitial — diferente do IRA pré-renal — e pode requerer hemodiálise em 10–15% dos casos graves. A hemorragia pulmonar (SRPA) é a complicação mais temida — mortalidade > 50%.

**Tratamento:**

| Gravidade | Fármaco | Dose | Duração |
|---|---|---|---|
| Leve (ambulatorial) | Doxiciclina | 100 mg VO 12/12h | 7 dias |
| Moderada/grave (hospitalizado) | Penicilina G cristalina | 1,5 MUI IV 6/6h | 7 dias |
| Alternativa hospitalar | Ampicilina | 1g IV 6/6h | 7 dias |
| Alergia à penicilina | Ceftriaxona | 1g IV/dia | 7 dias |

**Notificação compulsória imediata** (até 24h no SINAN em surtos/epidemias) + investigação da fonte (identificar roedores, caixas d'água contaminadas, áreas alagadas).

---

### Caso Clínico — Epidemia de Chuva com Diagnóstico Diferencial

**Cenário:** Dois pacientes chegam ao PS durante período de enchentes em São Paulo:

**Paciente 1:** Homem, 28 anos, febre 39,5°C há 5 dias, mialgia intensa nas panturrilhas, cefaleia, olhos vermelhos (sufusão conjuntival), sem sangramento. Mora perto do córrego transbordado. Hoje: icterícia leve, oligúria, creatinina 2,1 mg/dL, plaquetas 90.000/mm³, bilirrubina direta 4 mg/dL. ELISA IgM leptospirose: positivo.

- **Diagnóstico:** Leptospirose com síndrome de Weil em instalação (icterícia + IRA + fase imune)
- **Conduta:** Internação + Penicilina G 1,5 MUI IV q6h × 7 dias + hidratação + monitorar diurese e creatinina + notificação SINAN

**Paciente 2:** Mulher, 35 anos, febre 38°C há 4 dias, exantema maculopapular pruriginoso generalizado, artralgia em mãos e punhos, sem sangramento. Hemograma: leucopenia + plaquetas 140.000/mm³. NS1 dengue: negativo. IgM dengue: negativo. RT-PCR Zika: em andamento.

- **Suspeita:** Zika (exantema pruriginoso precoce + artralgia + febre baixa + ausência de hemorragia) ou Chikungunya (artralgia intensa — aguardar resultado)
- **Conduta:** Paracetamol para febre, hidratação, orientação sobre AINEs apenas após excluir dengue; notificar suspeita de arbovirose; rastrear gestação (se mulher em idade fértil → anti-HCG + PCR Zika urina urgente)`, ativo: true,
    },
    // ── Dermatologia — Mês 5 (3 aulas) ──────────────────────────────────────
    {
      titulo: 'Dermatoses Inflamatórias: Psoríase e Dermatites',
      descricao: 'Psoríase (placas eritematosas com escamas prateadas), dermatite atópica (criança/adulto), dermatite de contato alérgica vs irritativa.',
      disciplina: 'Clínica Médica', tema: 'Dermatologia', tipo: 'texto', nivel: 'basico',
      duracao: 31, ordem: 1, mes: 5, semana: 3,
      videoUrl: null, conteudo: `## Dermatoses Inflamatórias: Psoríase e Dermatites

**Base:** SBD 2022 | EuroGuiDerm Psoriasis 2022 | EADV Dermatite Atópica 2023

---

### Psoríase

**Definição:** doença inflamatória crônica, imunomediada (Th1/Th17), com predisposição genética. Acomete pele, unhas e articulações.

**Manifestações clínicas:**

| Forma | Características |
|-------|----------------|
| Psoríase em placas (vulgar) | Placas eritematosas, bem delimitadas, com escamas prateadas. Cotovelos, joelhos, couro cabeludo, região sacra |
| Psoríase gutata | Lesões pequenas, em gota; comum após infecção estreptocócica |
| Psoríase pustulosa | Pústulas estéreis; forma generalizada (Von Zumbusch) é emergência |
| Psoríase eritrodérmica | Eritema > 90% da SCQ; emergência dermatológica |
| Artrite psoriásica | 20–30% dos pacientes; pauciarticular assimétrica, axial, dactilite |

**Sinais clínicos clássicos:**
- **Sinal da vela:** ao raspar a placa, surgem escamas como raspagem de vela
- **Fenômeno de Auspitz:** após retirar as escamas, aparece ponto de sangramento (orvalho hemorrágico)
- **Fenômeno de Koebner:** novas lesões surgem em áreas de trauma

**Avaliação de gravidade — PASI (Psoriasis Area and Severity Index):**

| PASI | Gravidade |
|------|----------|
| < 10 | Leve |
| 10–20 | Moderado |
| > 20 | Grave |

**Tratamento escalonado:**

| Gravidade | Opções |
|-----------|--------|
| Leve (PASI < 10) | Corticoide tópico, análogos da vitamina D (calcipotriol), coaltar |
| Moderada | Fototerapia UVB banda estreita, PUVA |
| Grave (PASI > 10 refratário) | Metotrexato, acitretina, ciclosporina |
| Grave refratária / artrite | Biológicos: anti-TNF (adalimumabe, etanercepte), anti-IL-17 (secuquinumabe), anti-IL-23 (guselcumabe) |

> **Alerta:** Psoríase associa-se a síndrome metabólica, doença cardiovascular e depressão. Tratar o paciente de forma integral.

---

### Dermatite Atópica (DA)

**Definição:** doença inflamatória crônica, pruriginosa, com disfunção da barreira epidérmica (mutação filagrina) e hipersensibilidade IgE-mediada.

**Critérios diagnósticos de Hanifin e Rajka (≥ 3 maiores + ≥ 3 menores):**

| Critérios maiores | Critérios menores (exemplos) |
|------------------|------------------------------|
| Prurido | Xerose |
| Morfologia e distribuição típica | Ictiose |
| Curso crônico e recidivante | Pitiríase alba |
| História pessoal/familiar de atopia | Conjuntivite recorrente |

**Distribuição por idade:**
- Lactente (< 2 anos): face (bochechas), couro cabeludo, superfícies extensoras
- Criança/adulto: flexuras (fossas antecubital, poplítea), pescoço

**Avaliação de gravidade — SCORAD:**

| SCORAD | Gravidade |
|--------|----------|
| < 25 | Leve |
| 25–50 | Moderada |
| > 50 | Grave |

**Tratamento escalonado (Task Force EADV 2023):**

| Degrau | Intervenção |
|--------|------------|
| 1 | Hidratação diária (emolientes), banhos mornos curtos, evitar irritantes |
| 2 | Corticoide tópico (baixa a média potência em face/dobras; alta potência no tronco/membros) |
| 3 | Inibidores de calcineurina tópicos (tacrolimus, pimecrolimus) |
| 4 | Fototerapia NB-UVB |
| 5 | Imunossupressores sistêmicos (ciclosporina, metotrexato, azatioprina) |
| 6 | Biológicos: dupilumabe (anti-IL-4Rα); inibidores JAK (baricitinibe, upadacitinibe) |

---

### Dermatite de Contato (DC)

**Dois tipos principais:**

| Característica | DC Irritativa | DC Alérgica |
|---------------|--------------|-------------|
| Mecanismo | Dano direto (causticidade) | Hipersensibilidade tipo IV (celular) |
| Sensibilização prévia | Não necessária | Necessária (> 1 exposição) |
| Início | Rápido (horas após exposição intensa) | 24–72 h após re-exposição |
| Morfologia | Circunscrita ao contato, eritema ± vesículas | Pode disseminar além do contato |
| Agentes comuns | Detergentes, ácidos, bases, solventes | Níquel, látex, fragrâncias, parafenilenodiamina (tinta cabelo) |
| Diagnóstico | Clínico + história de exposição | Patch test (teste de contato) — padrão ouro |
| Tratamento | Remover irritante + emolientes | Remover alérgeno + corticoide tópico/sistêmico |

> **Patch test:** baterias de alérgenos aplicadas nas costas por 48 h; leitura em 48 e 96 h. Indica alérgeno responsável pela DC alérgica.

---

### Diagnóstico Diferencial Resumido

| Doença | Localização preferencial | Morfologia característica |
|--------|--------------------------|--------------------------|
| Psoríase | Cotovelos, joelhos, sacro, couro cabeludo | Placa eritematoescamosa bem delimitada |
| DA | Flexuras (adulto), face (lactente) | Eczema pruriginoso + xerose + liquenificação |
| DC alérgica | Onde ocorreu o contato | Eritema, vesículas, exsudação |
| DC irritativa | Onde ocorreu o contato | Eritema ± erosão, sem disseminação |

---

### Caso Clínico

Homem, 35 anos, com lesões eritematoescamosas em cotovelos e joelhos há 3 anos. Refere melhora no verão e piora no inverno. Ao exame: placas bem delimitadas com escamas prateadas. Pai e tio têm lesões semelhantes.

**Análise:**
- Diagnóstico: Psoríase em placas — critérios: morfologia, localização, sazonalidade, história familiar
- Sinal da vela e Auspitz: confirmariam se realizados
- PASI: calcular para estadiar (< 10 = leve → tratar topicamente)
- Tratamento: corticoide tópico de média potência + calcipotriol (alternados ou em combinação)
- Solicitar: avaliação de artropatia (dor articular?), glicemia, colesterol (síndrome metabólica)

> **Ponto de prova:** "Sangramento em orvalho ao raspar escama" = fenômeno de Auspitz = Psoríase.`, ativo: true,
    },
    {
      titulo: 'Infecções Cutâneas: Bacterianas, Fúngicas e Parasitárias',
      descricao: 'Impetigo (crostoso vs bolhoso), erisipela, celulite, fasciite necrosante, dermatofitoses (tinha), escabiose (sarna). Diagnóstico e tratamento.',
      disciplina: 'Clínica Médica', tema: 'Dermatologia', tipo: 'texto', nivel: 'basico',
      duracao: 37, ordem: 2, mes: 5, semana: 4,
      videoUrl: null,
      conteudo: `## Infecções Cutâneas: Bacterianas, Fúngicas e Parasitárias

**Base:** SBD 2023 + IDSA Skin and Soft Tissue Infections Guidelines 2014 + DermNet NZ

---

### Infecções Bacterianas — Diagnóstico Diferencial e Tratamento

As infecções bacterianas cutâneas variam de superficiais (epidérmicas) a profundas (fáscia e músculo), com implicações diagnósticas e terapêuticas distintas.

| Infecção | Plano anatômico | Agente principal | Características clínicas | Tratamento |
|---|---|---|---|---|
| **Impetigo não-bolhoso** | Epidérmico | S. pyogenes → S. aureus | Vesículas → crostas melicéricas em face/membros, autoinoculável | Mupirocina tópica 2% 3×/dia × 5–7d (lesões limitadas); cefalexina 25–50 mg/kg/d VO × 7d (disseminado) |
| **Impetigo bolhoso** | Epidérmico | S. aureus (toxina esfoliativa A/B) | Bolhas flácidas transparentes → erosões com colarete; sem febre | Oxacilina VO (criança) OU cefalexina; se MRSA: SMX-TMP |
| **Erisipela** | Derme superficial | S. pyogenes (SBHGA) | Placa eritematosa, borda **bem definida/elevada**, quente, brilhante; febre alta; linfangite; adenopatia regional | Penicilina G cristalina 1–2M UI IV 4/4h (grave) OU amoxicilina 500 mg 3×/dia VO (leve) × 10–14d |
| **Celulite** | Derme profunda + subcutâneo | S. aureus + S. pyogenes | Eritema, calor, edema — borda **mal definida**, difusa; sem elevação; pode ter porta de entrada | Cefalexina 500 mg 4×/dia VO (leve) OU oxacilina 2 g IV 4/4h (grave); amoxicilina-clavulanato se mordedura |
| **Fasciite necrotizante** | Fáscia superficial | Tipo I: polimicrobiano; Tipo II: S. pyogenes | Dor desproporcional ao exame, crepitação (gás), necrose cutânea, toxemia, progressão rápida — EMERGÊNCIA CIRÚRGICA | Desbridamento cirúrgico IMEDIATO + piperacilina-tazobactam 4,5 g IV 8/8h + clindamicina 900 mg IV 8/8h + vancomicina |

**LRINEC Score (Laboratory Risk Indicator for Necrotizing Fasciitis):** PCR > 150, leucócitos > 15.000, hemoglobina < 13,5, sódio < 135, creatinina > 1,6, glicose > 180. Score ≥ 6 = suspeita; ≥ 8 = alta probabilidade. **Tomografia com contraste** mostra gás e espessamento fascial. Diagnóstico definitivo é intraoperatório.

> **Pérola clínica:** "Dedão" de Cheyne — dedo que afunda sem resistência no tecido durante cirurgia de fasciite = tecido necrótico sem adesão ao plano fascial. Não esperar TC se há suspeita clínica — cirurgia imediata.

> **Alerta clínico:** Celulite bilateral em MMII é diagnóstico RARO — sempre pensar em dermatite de estase, lipodermosclerose, eczema de contato bilateral antes de tratar como celulite.

---

### Infecções Fúngicas — Dermatofitoses e Candidíase

| Localização | Nome popular | Agente | Tratamento tópico | Tratamento sistêmico |
|---|---|---|---|---|
| Pé (tinea pedis) | Pé de atleta | T. rubrum, T. mentagrophytes | Terbinafina 1% 2×/dia × 1–2 semanas | Terbinafina VO 250 mg/dia × 2 semanas (refratário) |
| Corpo (tinea corporis) | Tinha do corpo | T. rubrum | Terbinafina ou clotrimazol × 2–4 semanas | — |
| Couro cabeludo (tinea capitis) | Tinha da cabeça | T. tonsurans, M. canis | **Ineficaz isolado** | **Griseofulvina VO** 10–20 mg/kg/d × 6–8 semanas (criança); terbinafina adulto |
| Unhas (onicomicose) | Tinha da unha | T. rubrum | Ciclopirox esmalte (eficácia limitada) | **Terbinafina VO 250 mg/dia × 6sem (mãos) ou 12sem (pés)** OU itraconazol pulsoterapia 400 mg/d × 1 semana/mês × 3 meses |
| Tronco (tinea versicolor) | Pano branco | Malassezia furfur | **Cetoconazol xampu 2%** × 3 noites OU itraconazol tópico | Fluconazol 300 mg dose única (recidivante) |

**Candidíase:**
- Oral (muguet): fluconazol 150 mg dose única OU nistatina suspensão 100.000 UI/mL 4×/dia × 7–14d
- Esofágica (em imunossuprimidos): fluconazol 200–400 mg/dia VO/IV × 14–21d
- Candidíase invasiva (fungemia): equinocandinas (caspofungina 70 mg IV ataque → 50 mg/dia) OU anfotericina B lipossomal 3 mg/kg/dia — remover cateter central

> **Pérola:** Onicomicose confirmada antes de tratar — a maioria das distrofias ungueais NÃO é fúngica. Cultura de fragmento subungueal antes de 12 semanas de terbinafina (hepatotoxicidade, custo).

---

### Infecções Parasitárias Cutâneas

**Escabiose (Sarna):**
- **Agente:** Sarcoptes scabiei var. hominis — ácaro que cava sulcos na camada córnea
- **Clínica:** prurido noturno intenso (pior à noite e após banho quente) + sulcos lineares + pápulas eritematosas em espaços interdigitais, punhos, região umbilical, genitália masculina; poupa face em adultos (exceto idosos e imunossuprimidos)
- **Sarna norueguesa (crostosa):** imunossuprimidos — hiperinfestação, lesões crostosas generalizadas, altamente contagiosa

| Forma | Tratamento 1ª linha | Alternativa |
|---|---|---|
| Clássica | **Permetrina 5% creme** — aplicar pescoço abaixo, 8–12h, repetir em 7–14 dias | Ivermectina 200 mcg/kg VO dose única, repetir D8 |
| Norueguesa | Ivermectina VO 200 mcg/kg D1, D8, D15 + permetrina diária × 7 dias | — |
| Gestante | Permetrina 5% (segura) | Evitar ivermectina |

**Tratar TODOS os contatos domiciliares simultâneos.** Lavar roupas e cama a ≥ 60°C ou embalar por 72h.

**Larva migrans cutânea (bicho geográfico):**
- Agente: larvas de Ancylostoma brasiliense (ancilostomídeo de cães/gatos)
- Clínica: serpiginosa, eritematosa, pruriginosa, progressão 1–2 cm/dia; áreas expostas à areia contaminada
- Tratamento: **ivermectina 200 mcg/kg VO dose única** (1ª linha) OU albendazol 400 mg/dia × 3–7 dias OU tiabendazol tópico

---

### Populações Especiais

**Imunossuprimidos (HIV/transplantados):** infecções fúngicas atípicas (criptococose cutânea, histoplasmose disseminada com lesões dérmicas), escabiose norueguesa, infecções por patógenos oportunistas (Aspergillus cutâneo em neutropênicos). Limiar baixo para biópsia.

**Diabéticos:** celulite e fasciite de maior gravidade; maior prevalência de MRSA; risco de gangrena de Fournier (fasciite necrotizante perineal — mortalidade 20–40%). Controle glicêmico rigoroso acelera cicatrização.

**Gestantes:** permetrina 5% segura (categoria B). Evitar fluconazol sistêmico no 1º trimestre (risco de malformação cardíaca com doses altas). Terbinafina VO — evitar. Candidíase vaginal — miconazol tópico 7 dias.

**Neonatos e lactentes:** impetigo bolhoso pode evoluir para SSSS (síndrome da pele escaldada estafilocócica) — toxina esfoliativa sistêmica; tratar com oxacilina IV 150–200 mg/kg/dia.

---

### Caso Clínico

**Homem, 62 anos, diabético tipo 2 mal controlado (HbA1c 10,2%), deu entrada com eritema e edema em perna direita há 3 dias, inicialmente com borda definida (tratado com amoxicilina ambulatorialmente). Hoje: área central com escurecimento, crepitação à palpação, dor intensa (8/10), febre 39,5°C, FC 118 bpm, PA 95/60 mmHg. LRINEC score calculado: 9 pontos.**

**Análise e Conduta:**
- **Diagnóstico:** Fasciite necrotizante tipo I (polimicrobiana) em diabético — sinal de alarme: progressão apesar de ATB, crepitação, necrose cutânea, sepse, LRINEC ≥ 8
- **Conduta imediata:**
  - Estabilização hemodinâmica (SF 0,9% bolus 30 mL/kg), acesso venoso calibroso
  - Antibioticoterapia IV empírica ampla: piperacilina-tazobactam 4,5 g IV 8/8h + clindamicina 900 mg IV 8/8h (cobertura de toxina) + vancomicina 25–30 mg/kg IV (MRSA)
  - **Cirurgia de desbridamento IMEDIATO** — não aguardar TC se há suspeita clínica forte; atraso cirúrgico = maior mortalidade
  - Controle glicêmico intensivo (insulina IV se glicemia > 180 mg/dL)
  - UTI + monitorização hemodinâmica
- **Prognóstico:** mortalidade 20–40% em diabéticos mesmo com tratamento adequado`, ativo: true,
    },
    {
      titulo: 'Câncer de Pele: Melanoma, CBC e CEC',
      descricao: 'ABCDE do melanoma, estadiamento (Breslow), carcinoma basocelular (mais comum), carcinoma espinocelular. Fotoproteção e rastreamento.',
      disciplina: 'Clínica Médica', tema: 'Dermatologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 40, ordem: 3, mes: 5, semana: 4,
      videoUrl: null, conteudo: `## Câncer de Pele: Melanoma, CBC e CEC

**Base:** NCCN Guidelines Melanoma/Basal/Squamous Cell 2024 | SBD — Consenso Brasileiro de Melanoma 2022 | INCA — Estimativa 2023

---

### Epidemiologia e Fatores de Risco

O câncer de pele é o mais comum do Brasil, correspondendo a ~33% de todos os tumores malignos (INCA 2023).

| Fator de Risco | CBC | CEC | Melanoma |
|---|---|---|---|
| Exposição solar crônica/acumulada | Principal | Principal | Importante |
| Queimaduras solares (episódicas/infância) | Moderado | Moderado | **Principal para melanoma** |
| Fototipo I–II (pele clara, olhos azuis/verdes) | Alto | Alto | **Maior risco** |
| Imunossupressão (transplante, HIV) | Aumentado | Muito aumentado | Aumentado |
| Infecção por HPV | Não | CEC mucosa | Não |
| Lesões precursoras | — | Ceratose actínica | Nevos displásicos, nevos congênitos |
| História familiar | Moderado | Moderado | **Síndrome do nevo displásico — alto risco** |
| Radiação ionizante, arsênico, alcatrão | Aumentado | Aumentado | Menor associação |

---

### Carcinoma Basocelular (CBC)

**O mais comum dos cânceres humanos** (~75–80% dos cânceres de pele).

**Características:**
- Originado nas células basais da epiderme
- Crescimento lento, raramente metastatiza (< 0,1%)
- Localização: 80% em cabeça e pescoço (nariz, região periorbital, sulco nasolabial)

**Tipos clínicos:**
- **Nódulo-ulcerativo (mais comum):** Pápula/nódulo pérola-translúcido, com vasos telangiectásicos, centro ulcerado (úlcera rodente)
- **Superficial:** Placa eritematosa descamativa, pode simular eczema
- **Esclerodermiforme/infiltrativo:** Placa branco-amarelada, bordas mal definidas — pior prognóstico, recidiva frequente
- **Pigmentado:** Similar ao melanoma, cor escura

**Tratamento:**
- Excisão cirúrgica com margem de 3–5 mm (CBC de baixo risco) ou 5–10 mm (alto risco)
- **Cirurgia de Mohs:** Padrão-ouro para CBC de alto risco (área H da face, esclerodermiforme, recidivado) — margens histológicas controladas
- Alternativas para casos selecionados: curetagem + eletrocoagulação, criocirurgia, terapia fotodinâmica, imiquimode tópico
- **Vismodegibe (hedgehog pathway inhibitor):** CBC localmente avançado ou metastático irressecável

---

### Carcinoma Espinocelular (CEC) — Carcinoma de Células Escamosas

**Características:**
- Originado nos queratinócitos da epiderme
- Potencial de metástase: 2–5% dos casos (linfonodos regionais, depois a distância)
- Localização: lábio inferior, pavilhão auricular, dorso das mãos, mucosa oral, genitália

**Lesão precursora: Ceratose Actínica**
- Placa eritematosa áspera, rugosa, em áreas fotoexpostas
- Risco de progressão para CEC invasor: 0,025–16% por lesão/ano
- Tratamento: criocirurgia, 5-FU tópico, imiquimode, terapia fotodinâmica

**Apresentação clínica do CEC invasor:** Nódulo ou placa eritematosa, ceratósica, ulcerada, firme, de crescimento progressivo.

**Fatores de alto risco (maior chance de metástase):**
- Espessura > 2 mm (Breslow do CEC)
- Invasão perineural
- Localização: lábio, orelha, genitália
- Imunossupressão
- Recidiva

**Tratamento:**
- Excisão cirúrgica com margem de 4–6 mm (baixo risco) ou 6–10 mm (alto risco)
- Cirurgia de Mohs para CEC de alto risco em áreas críticas
- Radioterapia adjuvante se margem positiva ou invasão perineural
- Pesquisa de linfonodo sentinela em casos selecionados de alto risco

---

### Melanoma

**Características:**
- Originado dos melanócitos (crista neural)
- Tumor altamente agressivo — responsável por ~80% das mortes por câncer de pele
- Incidência crescente; diagnóstico precoce é determinante do prognóstico

**Critérios ABCDE:**

| Letra | Critério | Significado |
|---|---|---|
| A | Assimetria | Uma metade não corresponde à outra |
| B | Borda | Irregular, entalhada, mal definida |
| C | Cor | Variegada (preto, marrom, vermelho, branco, azul) |
| D | Diâmetro | > 6 mm (tamanho de um lápis) |
| E | Evolução | Mudança em tamanho, forma, cor ou qualquer sintoma novo |

> **"Patinho Feio" (Ugly Duckling Sign):** Nevo que se destaca dos demais — mais importante que critérios isolados.

**Tipos histológicos:**
- **Extensivo superficial:** 70% dos casos, crescimento horizontal antes de vertical
- **Nodular:** 15–20%, crescimento vertical rápido, pior prognóstico
- **Lentigo maligno melanoma:** Em face de idosos, crescimento lento
- **Acral lentiginoso:** Palmas, plantas, subungual — mais comum em negros; pior prognóstico

**Estadiamento — Breslow (espessura tumoral):**

| Espessura (Breslow) | Estágio T (AJCC) | Margem Cirúrgica | Linfonodo Sentinela |
|---|---|---|---|
| In situ | Tis | 0,5–1 cm | Não indicado |
| ≤ 1,0 mm | T1 | 1 cm | Se T1b (ulcerado ou mitose ≥ 1/mm²) |
| 1,01–2,0 mm | T2 | 1–2 cm | **Indicado** |
| 2,01–4,0 mm | T3 | 2 cm | **Indicado** |
| > 4,0 mm | T4 | 2 cm | **Indicado** |

**Estadiamento AJCC 8ª edição (Simplificado):**

| Estágio | Definição | Sobrevida 5 anos |
|---|---|---|
| I | T1-T2a, N0, M0 | > 90% |
| II | T2b-T4b, N0, M0 | 65–80% |
| III | Qualquer T, N1-N3, M0 (metástase linfonodal regional) | 30–70% |
| IV | M1 (metástase a distância) | 10–25% (melhorou com imunoterapia) |

**Biópsia do Linfonodo Sentinela (BLS):**
- Indicada em melanomas ≥ 1 mm ou T1b
- Mapeamento linfocintilográfico + injeção de corante azul
- Se positivo → complementação linfonodal ou observação (PD-1 adjuvante)

**Tratamento sistêmico (estágio III/IV):**
- **Imunoterapia (anti-PD-1):** Pembrolizumabe ou Nivolumabe — primeira linha, independente de mutação
- **Terapia-alvo (BRAF mutado V600E, ~50% dos casos):** Vemurafenibe + Cobimetinibe, Dabrafenibe + Trametinibe
- **Ipilimumabe (anti-CTLA-4):** Segunda linha ou combinação com nivolumabe em doença avançada

---

### Prevenção e Rastreamento

**Prevenção primária:**
- Protetor solar FPS ≥ 30 (resistente à água, reaplicar a cada 2h em exposição contínua)
- Evitar exposição solar entre 10h e 16h
- Uso de roupas protetoras com FPU, chapéu de aba larga, óculos UV
- Evitar câmaras de bronzeamento artificial (aumenta risco de melanoma em 75%)

**Rastreamento:**
- Autoexame mensal da pele
- Exame dermatológico anual (populações de risco: fototipo I/II, história familiar, > 50 anos)
- Dermatoscopia: aumenta sensibilidade diagnóstica para melanoma (sensibilidade ~90% vs 70% a olho nu)

---

### Caso Clínico

**Mulher de 48 anos, fototipo II, apresenta nevo em dorso de 8 mm, assimétrico, com bordas irregulares, coloração variando de marrom a negro, que "mudou de tamanho" nos últimos 3 meses. Sem linfonodomegalia palpável.**

- **Suspeita:** Melanoma (critérios ABCDE: A+B+C+D+E presentes)
- **Conduta inicial:** Biópsia excisional com margem de 1–2 mm (não incisar, não fazer shave — comprometeria o estadiamento de Breslow)
- **Se confirmado melanoma T2 (1,01–2,0 mm):** Ampliação de margem para 1–2 cm + biópsia do linfonodo sentinela
- **Pesquisa de mutação BRAF:** Solicitar no tumor primário para planejamento de terapia sistêmica se necessário
- **Vigilância:** Exame físico completo a cada 3–6 meses × 5 anos + rastreamento por imagem conforme estadiamento`, ativo: true,
    },
    // ── Urgência/Emergência — Mês 6 (4 aulas) ────────────────────────────────
    {
      titulo: 'Fibrilação Atrial — Diagnóstico e Manejo',
      descricao: 'Framework AF-CARE (ESC 2024), escore CHA₂DS₂-VASc completo, DOACs vs Varfarina, controle de frequência e ritmo, cardioversão, ablação por cateter. Base: ESC 2024.',
      disciplina: 'Clínica Médica', tema: 'Cardiologia', tipo: 'texto', nivel: 'avancado',
      duracao: 47, ordem: 1, mes: 6, semana: 1,
      videoUrl: null,
      conteudo: `## Fibrilação Atrial — Diretrizes ESC 2024

**Base:** 2024 ESC Guidelines for the management of atrial fibrillation (Van Gelder IC et al., Eur Heart J 2024).

---

## 1. Epidemiologia e Impacto Clínico

A FA é a arritmia sustentada mais comum, afetando 2-4% da população adulta. Prevalência aumenta com a idade: < 0,5% em < 40 anos vs 10% em > 80 anos. É responsável por **20-30% dos AVCs isquêmicos** e aumenta em 5× o risco tromboembólico. FA assintomática é frequente — screening com ECG de 30s recomendado em ≥ 65 anos.

---

## 2. Framework AF-CARE (ESC 2024)

A ESC 2024 introduziu o framework **AF-CARE** como estrutura de manejo holístico integrado:

| Pilar | Significado | Ações principais |
|-------|-------------|-----------------|
| **C** — Comorbidities | Tratar comorbidades | HAS, DM, obesidade, SAOS, álcool, sedentarismo |
| **A** — Avoid stroke | Prevenir AVC/TEP | CHA₂DS₂-VASc → anticoagulação (NOACs) |
| **R** — Rate/Rhythm | Controle FC ou ritmo | Betabloqueador, amiodarona, cardioversão, ablação |
| **E** — Evaluation | Avaliar sintomas/QV | EHRA score, monitorização contínua, follow-up |

> Este framework substitui a abordagem dicotômica "rate vs rhythm control" e coloca o tratamento de comorbidades como prioridade — reversão dos fatores de risco pode estabilizar ou reverter a FA.

---

## 3. Classificação da FA

- **Paroxística:** episódios que terminam espontaneamente em < 7 dias
- **Persistente:** duração > 7 dias, requer intervenção para terminar
- **Persistente de longa duração:** > 12 meses de duração contínua
- **Permanente:** decisão conjunta médico-paciente de não tentar restaurar ritmo sinusal

---

## 4. Prevenção de AVC — Escore CHA₂DS₂-VASc

| Fator de risco | Pontuação |
|----------------|-----------|
| Insuficiência Cardíaca / FE reduzida (C) | 1 ponto |
| Hipertensão arterial (H) | 1 ponto |
| Idade ≥ 75 anos (A₂) | **2 pontos** |
| Diabetes Mellitus (D) | 1 ponto |
| AVC / AIT / tromboembolismo prévio (S₂) | **2 pontos** |
| Doença vascular: IAM, placa aórtica, DAP (V) | 1 ponto |
| Idade 65-74 anos (A) | 1 ponto |
| Sexo feminino (Sc) | 1 ponto |

**Indicação de anticoagulação:**
- Homens com escore ≥ 1 → anticoagular; escore ≥ 2 → obrigatório
- Mulheres com escore ≥ 2 → anticoagular (sexo feminino isolado não indica)
- Avaliar risco de sangramento: escore HAS-BLED (modificável > não modificável → corrigir fatores antes de contraindicar)

**Anticoagulante de escolha — NOACs preferidos sobre Varfarina na FA não valvar:**

| NOAC | Dose padrão | Destaque |
|------|-------------|----------|
| Apixabana | 5 mg 2×/dia | Melhor perfil de segurança hemorrágica (ARISTOTLE) |
| Rivaroxabana | 20 mg/dia com jantar | 1×/dia — maior adesão |
| Dabigatrana | 150 mg 2×/dia | Maior eficácia na prevenção de AVC (RE-LY) |
| Varfarina (INR 2-3) | Conforme INR | Apenas FA valvar (prótese metálica, estenose mitral reumática) |

---

## 5. Controle de Frequência (Rate Control)

Alvo: FC ≤ 110 bpm em repouso (estratégia lenient — estudo RACE II) ou < 80 bpm se sintomático.

- **1ª linha:** Betabloqueador (metoprolol succinato, bisoprolol, carvedilol) — preferência em IC-FEr
- **1ª linha:** Bloqueador de canal de cálcio não-dihidropiridínico (diltiazem, verapamil) — **contraindicado em IC-FEr**
- **2ª linha:** Digoxina (sedentários; não controla FC no exercício; índice terapêutico estreito)
- Amiodarona: última opção para controle de frequência (toxicidade cumulativa)

---

## 6. Controle de Ritmo (Rhythm Control)

Indicado em: sintomas persistentes apesar do controle de frequência, FA recente (< 1 ano), pacientes jovens, IC piorando por FA.

**Cardioversão elétrica (CVE):**
- FA < 48h: CVE imediata (baixo risco de trombo atrial)
- FA > 48h ou duração desconhecida: **anticoagular ≥ 3 semanas** OU ecocardiograma transesofágico (para excluir trombo) antes da CVE
- Energia: 120-200J bifásico sincronizado (sincronização obrigatória para evitar FV)
- Manter anticoagulação ≥ 4 semanas após CVE (risco de "atordoamento atrial")

**Cardioversão farmacológica (FA < 48h, hemodinâmica estável):**
- Amiodarona 300mg IV em 1h → infusão manutenção (preferência em cardiopatia estrutural/IC)
- Flecainida ou propafenona: contraindicado em cardiopatia estrutural (risco de pró-arritmia)
- Pill-in-the-pocket (flecainida 200mg VO): pacientes sem cardiopatia, FA paroxística episódica

**Ablação por cateter — Isolamento de Veias Pulmonares (IVP):**
- Indicada em FA paroxística sintomática refratária a ≥ 1 antiarrítmico
- ESC 2024: considerar IVP antes de antiarrítmicos em pacientes selecionados (jovens, FA recente)
- Taxa de sucesso: 70-80% no primeiro procedimento (paroxística > persistente)
- Complicações: tamponamento (1%), AVC peri-procedimento (< 1%), estenose de veias pulmonares

---

## 7. Emergência: FA com Instabilidade Hemodinâmica

> Se FA + hipotensão, síncope, angina ou IC aguda descompensada → **cardioversão elétrica sincronizada IMEDIATA**. Não perder tempo com farmacológico em paciente instável.

Sequência:
1. Sedação (midazolam + fentanil) ou anestesia geral rápida
2. CVE sincronizada 120-200J bifásico
3. Repetir com maior energia se não reverter (máximo 360J monofásico equivalente)
4. Anticoagulação pós-CVE + monitorização

---

## 8. Caso Clínico

**Cenário:** Mulher, 72 anos, diabética (DM2 em metformina), hipertensa (enalapril), sem AVC prévio. ECG: FA com FC 118 bpm. PA 138/85 mmHg, sem dispneia (NYHA I). Ecocardiograma: FE 55%, sem trombo. FA identificada há 36 horas.

**Resolvendo:**

1. **CHA₂DS₂-VASc:** HAS (1) + DM (1) + Sexo F (1) + Idade 65-74 (1) = **4 pontos** → anticoagulação obrigatória → apixabana 5mg 2×/dia.

2. **Controle de ritmo ou frequência?** FA < 48h + sem cardiopatia estrutural → indicação de cardioversão. ECO sem trombo → CVE imediata possível após anticoagulação.

3. **Conduta:** Anticoagular (apixabana ou HBPM IV), controle de FC com betabloqueador, CVE eletiva em 24-48h ou farmacológica (amiodarona). Manter anticoagulação ≥ 4 semanas pós-CVE + reavaliação longo prazo.

---

## 9. Referências

- Van Gelder IC et al. 2024 ESC Guidelines for the management of atrial fibrillation. Eur Heart J. 2024;45(36):3314-3414.
- Hindricks G et al. 2020 ESC Guidelines for the diagnosis and management of atrial fibrillation. Eur Heart J. 2021;42(5):373-498.`,
      ativo: true,
    },
    {
      titulo: 'Tromboembolia Pulmonar e Trombose Venosa Profunda',
      descricao: 'Critérios de Wells, algoritmo diagnóstico (D-dímero → angioTC), estratificação de gravidade, anticoagulação e trombólise no TEP maciço.',
      disciplina: 'Clínica Médica', tema: 'Pneumologia', tipo: 'texto', nivel: 'avancado',
      duracao: 63, ordem: 2, mes: 6, semana: 1,
      videoUrl: null,
      conteudo: `## Tromboembolia Pulmonar e Trombose Venosa Profunda

**Base:** ESC 2023 Guidelines on Pulmonary Embolism + ACCP 2022 + ISTH 2023

---

### Fisiopatologia — Tríade de Virchow

A formação de trombo venoso depende da coexistência de três fatores clássicos descritos por Rudolf Virchow em 1856:

| Fator | Exemplos Clínicos |
|---|---|
| **Estase venosa** | Imobilização prolongada, viagens longas, paresia de membros, ICC |
| **Hipercoagulabilidade** | Trombofilias (Fator V Leiden, mutação G20210A protrombina, deficiência proteínas C/S, anticoagulante lúpico), neoplasias, gestação, ACO |
| **Lesão endotelial** | Cirurgia, trauma, catéteres, vasculite |

> **Pérola clínica:** A TVP proximal (ilíaca, femoral, poplítea) embola com muito maior frequência que a distal (panturrilha). O risco de TEP em TVP proximal não tratada é de 50%.

---

### TVP — Diagnóstico e Escore de Wells

**Escore de Wells para TVP:**

| Critério | Pontos |
|---|---|
| Câncer ativo (tratamento < 6 meses ou paliativo) | 1 |
| Paralisia, paresia ou imobilização recente do membro inferior | 1 |
| Acamado > 3 dias OU cirurgia de grande porte < 12 semanas | 1 |
| Dor localizada ao longo da distribuição do sistema venoso profundo | 1 |
| Edema de todo o membro inferior | 1 |
| Panturrilha inchada > 3 cm vs membro contralateral | 1 |
| Edema com cacifo (fóvea) confinado ao membro sintomático | 1 |
| Veias superficiais colaterais (não varicosas) | 1 |
| Diagnóstico alternativo pelo menos tão provável quanto TVP | −2 |

**Interpretação e conduta:**
- **Score ≥ 2 (alta probabilidade):** US duplex com compressão imediato
- **Score < 2 (baixa probabilidade):** D-dímero → se negativo (< 500 ng/mL ou ajustado pela idade), exclui TVP; se positivo → US duplex

> **D-dímero ajustado pela idade:** pacientes > 50 anos usar limiar = idade × 10 ng/mL (ex: 70 anos = 700 ng/mL). Reduz número de angioTC desnecessárias em 20–30%.

---

### TEP — Estratificação de Risco e Algoritmo Diagnóstico

**Escore de Wells para TEP (versão simplificada):**

| Critério | Pontos |
|---|---|
| Sinais/sintomas clínicos de TVP | 3 |
| Diagnóstico alternativo menos provável que TEP | 3 |
| FC > 100 bpm | 1,5 |
| Imobilização ≥ 3 dias ou cirurgia < 4 semanas | 1,5 |
| TVP ou TEP prévio | 1,5 |
| Hemoptise | 1 |
| Malignidade (tratamento ativo ou < 6 meses) | 1 |

**Algoritmo diagnóstico (ESC 2023):**
- **Score > 4 (alta probabilidade):** AngioTC tórax diretamente (padrão-ouro)
- **Score ≤ 4 (baixa probabilidade):** D-dímero → se negativo = TEP excluído; se positivo → AngioTC tórax

**Classificação de Risco do TEP:**

| Classe | Critérios | PESI/sPESI | Mortalidade | Conduta |
|---|---|---|---|---|
| **Alto risco (maciço)** | Parada cardíaca OU choque OU hipotensão (PAS < 90 por > 15 min) | Qualquer | > 15% | Anticoagulação imediata + trombólise sistêmica |
| **Risco intermediário-alto** | Sem hipotensão + disfunção VD (eco/TC) + troponina elevada | sPESI ≥ 1 | 3–15% | Anticoagulação + monitorização; considerar trombólise de resgate |
| **Risco intermediário-baixo** | Sem hipotensão + (disfunção VD OU troponina — não ambos) | sPESI ≥ 1 | 3–15% | Anticoagulação + internação |
| **Baixo risco** | Sem hipotensão + sem disfunção VD + biomarcadores normais | sPESI = 0 | < 1% | Anticoagulação ambulatorial (NOAC) — alta precoce |

**sPESI (Simplified PESI) — 1 ponto cada:**
- Idade > 80 anos, câncer ativo, doença cardiorrespiratória crônica, FC ≥ 110 bpm, PAS < 100 mmHg, SpO2 < 90%
- **sPESI = 0:** baixo risco; **sPESI ≥ 1:** risco elevado

---

### Tratamento — Anticoagulação Imediata

| Fase | Agente | Dose | Duração |
|---|---|---|---|
| **Aguda (NOAC de escolha)** | Rivaroxabana | 15 mg 2×/dia × 21 dias → 20 mg/dia | Iniciar imediatamente |
| **Aguda (NOAC alternativo)** | Apixabana | 10 mg 2×/dia × 7 dias → 5 mg 2×/dia | Iniciar imediatamente |
| **Aguda (parenteral)** | Enoxaparina | 1 mg/kg SC 12/12h (ou 1,5 mg/kg SC 1×/dia) | Ponte para warfarina ou NOAC |
| **Manutenção** | Rivaroxabana ou apixabana | Conforme acima | 3–6 meses (provocado) ou indefinido (idiopático recorrente) |
| **Casos especiais** | Warfarina | INR 2–3 | Válvulas mecânicas, estenose mitral reumática, gravidez (1º tri) |

**Duração da anticoagulação:**
- TEP provocado por fator transitório de alto risco (cirurgia, trauma): **3 meses**
- TEP idiopático 1º episódio: **3–6 meses** (avaliar extensão, risco de sangramento)
- TEP recorrente OU trombofilia grave OU neoplasia ativa: **indefinido**

---

### Trombólise no TEP Maciço

**Indicações absolutas:** TEP de alto risco com colapso hemodinâmico (PAS < 90 mmHg por > 15 min não responsiva a fluidos)

**Contraindicações absolutas:**
- AVC hemorrágico ou de causa desconhecida em qualquer tempo
- AVC isquêmico nos últimos 3 meses
- Neoplasia intracraniana
- Trauma craniano grave < 3 meses
- Cirurgia intracraniana/espinhal recente
- Sangramento ativo significativo (exceto menstruação)

**Contraindicações relativas:** AVC isquêmico > 3 meses, cirurgia de grande porte < 3 semanas, punção em local não compressível, HAS grave (> 180/110), gestação, ressuscitação cardiopulmonar traumática

**Protocolo Alteplase (rt-PA):**
- Dose: **100 mg IV em 2 horas** (50 mg em bolus + 50 mg em 1h se colapso iminente)
- Anticoagulação: SUSPENDER heparina durante infusão; reiniciar quando TTPa < 80s após término

> **Pérola clínica:** Trombólise de resgate — considerar em TEP de risco intermediário-alto com deterioração hemodinâmica nas primeiras 24–48h sob anticoagulação plena. Embolectomia cirúrgica ou ECMO se trombólise contraindicada.

---

### Filtro de Veia Cava Inferior (FVCI)

**Indicações absolutas:** TEP/TVP comprovados com contraindicação absoluta à anticoagulação (hemorragia ativa, pós-neurocirurgia imediata)

**NÃO indicado rotineiramente:** não reduz mortalidade e aumenta risco de TVP recorrente a longo prazo.

---

### Trombofilia — Quando Investigar

| Situação | Investigar? |
|---|---|
| TEP/TVP idiopático em < 50 anos | Sim |
| TVP recorrente | Sim |
| TEP em local incomum (portal, mesentérica, cerebral) | Sim |
| História familiar positiva de TEP/TVP | Sim |
| Perdas fetais recorrentes | Sim (SAF) |
| TEP provocado por cirurgia/imobilização em > 50 anos | Geralmente não necessário |

**Painel de trombofilia:** Fator V Leiden, mutação protrombina G20210A, proteína C, proteína S, antitrombina III, anticoagulante lúpico, anticardiolipina, beta-2 glicoproteína I

> **Pérola clínica:** Solicitar trombofilia ao menos 3 meses APÓS o evento agudo e FORA do uso de anticoagulantes — anticoagulantes interferem nos resultados de proteína C, S e antitrombina.

---

### Populações Especiais

**Gestação:** HBPM é o anticoagulante de escolha (warfarina e NOACs são contraindicados). Dose enoxaparina: 1 mg/kg SC 12/12h; ajustar anti-Xa 4h após dose (alvo: 0,6–1,0 UI/mL).

**Câncer ativo:** NOACs (rivaroxabana, apixabana, edoxabana) são superiores à HBPM para tratamento de TEP/TVP — exceto risco aumentado de sangramento gastrointestinal em tumores luminais.

**Idosos (> 75 anos):** risco aumentado de sangramento com NOACs (especialmente apixabana tem melhor perfil de segurança). Reduzir dose conforme clearance de creatinina.

**Insuficiência renal:** para ClCr < 30 mL/min evitar NOACs; usar warfarina com monitorização rigorosa de INR ou HBPM em doses ajustadas.

---

### Caso Clínico

**Mulher, 52 anos, em quimioterapia por câncer de mama há 3 meses. Edema progressivo em MID há 5 dias, dor em panturrilha. Hoje: dispneia súbita com SpO2 93%, taquicardia 118 bpm, PA 108/70 mmHg. US duplex: trombose femoral superficial e poplítea direita. AngioTC: falha de enchimento em artéria pulmonar interlobar direita. Ecocardiograma: disfunção leve do VD. Troponina I: 0,12 ng/mL (LSN 0,04).**

**Análise Estruturada:**
- **Diagnóstico:** TEP de risco intermediário-alto + TVP proximal direita em contexto oncológico
- **PESI simplificado:** câncer ativo (1 pt) + FC > 110 (0, pois é 118 — 1 pt) = sPESI ≥ 1 (risco não baixo)
- **Classificação:** intermediário-alto (sem hipotensão + disfunção VD + troponina elevada)
- **Conduta imediata:** anticoagulação com enoxaparina 1 mg/kg SC 12/12h (preferir HBPM em câncer ativo vs NOAC oral) ou rivaroxabana 15 mg 2×/dia por 21 dias → 20 mg/dia
- **Trombólise:** NÃO indicada (sem hipotensão nem colapso hemodinâmico)
- **Duração:** anticoagulação por tempo indefinido enquanto houver atividade tumoral
- **Investigação adicional:** avaliar progressão tumoral, plaquetometria (contraindicação HBPM < 50.000)
- **Filtro de VCI:** não indicado (sem contraindicação à anticoagulação)`, ativo: true,
    },
    {
      titulo: 'Trauma: TCE e Lesões Torácicas Graves',
      descricao: 'TCE grave (Glasgow ≤ 8), hipertensão intracraniana, pneumotórax hipertensivo, hemotórax maciço, tamponamento cardíaco.',
      disciplina: 'Cirurgia', tema: 'Trauma', tipo: 'texto', nivel: 'avancado',
      duracao: 57, ordem: 3, mes: 6, semana: 2,
      videoUrl: null,
      conteudo: `## Trauma: TCE e Lesões Torácicas Graves

**Base:** ATLS 11ª Ed. — ACS 2025 + Brain Trauma Foundation (BTF) 4ª Ed. + WSES 2023

---

### Trauma Craniencefálico (TCE) — Classificação e GCS

A **Escala de Coma de Glasgow (GCS)** é a pedra fundamental da classificação do TCE. Avalia três domínios com pontuação máxima de 15 e mínima de 3.

| Componente | Resposta | Pontos |
|---|---|---|
| **Abertura ocular (O)** | Espontânea / Ao comando verbal / À dor / Ausente | 4 / 3 / 2 / 1 |
| **Resposta verbal (V)** | Orientado / Confuso / Palavras inapropriadas / Sons / Ausente | 5 / 4 / 3 / 2 / 1 |
| **Resposta motora (M)** | Obedece / Localiza / Retira / Flexão anormal / Extensão / Ausente | 6 / 5 / 4 / 3 / 2 / 1 |

| Classificação | GCS | Conduta inicial |
|---|---|---|
| **Leve** | 13–15 | Observação; TC conforme critérios (New Orleans ou Canadian CT Head Rule) |
| **Moderado** | 9–12 | TC de crânio + internação + monitorização neurológica serial |
| **Grave** | ≤ 8 | **IOT imediata** + TC urgente + monitorização PIC + avaliação neurocirúrgica |

**Indicações de TC no TCE leve — Regra de New Orleans (qualquer 1 critério):** cefaleia, vômitos, amnésia, uso de álcool/drogas, convulsão, déficit de memória de curto prazo, evidência de trauma craniano acima da clavícula.

**Canadian CT Head Rule (pacientes com perda de consciência ou amnésia):** indicação TC se: GCS < 15 em 2h, suspeita de fratura crânio aberta, sinal de Battle (equimose retroauricular), "olhos de guaxinim", vômitos ≥ 2 episódios, amnésia ≥ 30 min, idade ≥ 65 anos, mecanismo perigoso.

---

### Hematomas Intracranianos — Tipos e Características

| Tipo | Mecanismo | Imagem TC | Intervalo Lúcido | Cirurgia |
|---|---|---|---|---|
| **Epidural (HED)** | Fratura temporal → ruptura a. meníngea média | Lenticular biconvexo, hiperdensa, não cruza suturas | Clássico (50%) — lucidez seguida de deterioração | Urgente se espessura > 1 cm ou desvio > 5 mm |
| **Subdural agudo (HSD)** | Aceleração/desaceleração → ruptura veias ponte | Crescente hiperdensa, cruza suturas, segue contorno cerebral | Ausente (coma desde o início) | Urgente se espessura > 10 mm ou desvio > 5 mm |
| **Subdural crônico** | Idoso + trauma mínimo + anticoagulação | Crescente isodensa ou hipodensa | Semanas após trauma (amolece) | Trepanação se sintomático |
| **Contusão hemorrágica** | Impacto direto + golpe-contragolpe | Lesões heterogêneas, múltiplas, bifrontais/temporais | Não | Conservador ou cirurgia se expansão |

---

### Hipertensão Intracraniana (HIC) — Manejo Escalonado

**Valores normais e metas:**
- PIC normal: < 20 mmHg
- PPC (Pressão de Perfusão Cerebral) = PAM − PIC; **meta PPC 60–70 mmHg**
- PAM meta: ≥ 80 mmHg para garantir PPC

> **Tríade de Cushing:** Hipertensão sistólica + Bradicardia + Alteração do padrão respiratório — sinal de HERNIAÇÃO IMINENTE, emergência máxima.

**Protocolo escalonado BTF (linha 1 → linha 2 → linha 3):**

| Nível | Intervenção | Detalhe |
|---|---|---|
| Linha 1 | Cabeceira 30°, cabeça em posição neutra | Reduz PIC sem reduzir PPC |
| Linha 1 | Normocapnia (PaCO₂ 35–40 mmHg) | Hipercapnia = vasodilatação cerebral = ↑PIC |
| Linha 1 | Sedação e analgesia adequadas | Propofol + fentanil infusão; evitar agitação |
| Linha 2 | **Manitol 0,5–1 g/kg IV** em 20 min | Osmoterapia; manter osmolaridade < 320 mOsm/L |
| Linha 2 | **Solução salina hipertônica 23,4% (SSH)** | 30 mL IV bolus; mais segura que manitol em hipovolemia |
| Linha 3 | Hipotermia terapêutica (34–35°C) | UTI; complicações: arritmias, infecção |
| Linha 3 | **Craniectomia descompressiva** | Última linha; melhora sobrevida mas pode aumentar sequela |

---

### Lesões Torácicas — "Seis que Matam Imediatamente"

| Lesão | Mecanismo | Diagnóstico | Conduta IMEDIATA |
|---|---|---|---|
| **Pneumotórax hipertensivo** | Válvula unidirecional → ar não sai | CLÍNICO: desvio traqueal + ausência MV ipsilateral + hipotensão + TJE. NÃO aguardar Rx | **Toracocentese de alívio: 2°EIC LMC + dreno logo após** |
| **Hemotórax maciço** | Vaso intercostal ou pulmonar | Macicez percussão + hipovolemia | Dreno torácico 5°–6°EIC; toracotomia se ≥ 1.500 mL inicial OU > 200 mL/h por 2–4h |
| **Tamponamento cardíaco** | Sangue no pericárdio → compressão diastólica | **Tríade de Beck:** hipotensão + TJE + bulhas abafadas. Eco FAST confirma | Pericardiocentese subxifóidea (agulha 18G) OU janela pericárdica cirúrgica |
| **Pneumotórax aberto** | Ferida torácica aspirativa > 2/3 do diâmetro traqueal | Sucção audível pela ferida | Curativo oclusivo 3 lados ("válvula de folha") → dreno em local separado |
| **Tórax instável (Flail chest)** | Fraturas de 3+ costelas consecutivas em 2 pontos | Respiração paradoxal + hipoxemia | Analgesia adequada + O₂; IOT se falência respiratória |
| **Ruptura de aorta** | Desaceleração brusca → local de fixação (istmo aórtico) | **Alargamento mediastino > 8 cm** em Rx tórax AP | AngioTC urgente → tratamento endovascular (TEVAR) ou cirurgia |

**Contusão miocárdica:** suspeitar após trauma esternal/aceleração-desaceleração. Troponina + ECG (arritmias, bloqueio de ramo) + ecocardiograma. Monitorar 24–48h; tratar arritmias.

---

### FAST e eFAST no Trauma

O **FAST (Focused Assessment with Sonography in Trauma)** avalia 4 janelas em < 2 minutos:
1. Janela pericárdica (tamponamento)
2. Quadrante superior direito — espaço de Morrison (hemoperitônio)
3. Quadrante superior esquerdo — espaço esplenorrenal (hemoperitônio)
4. Pelve — fundo de saco de Douglas

O **eFAST (estendido)** adiciona janelas pleurais bilaterais (pneumotórax): ausência de deslizamento pleural.

> **Pérola:** FAST positivo em paciente instável hemodinamicamente = indicação de cirurgia imediata (laparotomia exploradora) SEM aguardar TC abdominal.

---

### Populações Especiais em Trauma

**Idosos:** GCS pode subestimar a lesão (menor reserva cognitiva); anticoagulação aumenta risco de HSD mesmo com trauma mínimo; reserva fisiológica reduzida → taquicardia pode estar ausente mesmo com choque. Meta PAM mais alta.

**Gestante:** desvio uterino para esquerda (aorta-cava) em decúbito; FAST menos confiável; monitorização fetal contínua ≥ 4h após trauma; causa mais comum de morte fetal é o choque hemorrágico materno.

**Criança:** GCS pediátrico modificado para verbal e motor; crânio maior relativo ao corpo → TCE mais frequente; ossos mais flexíveis → fratura de costela em criança = trauma de alta energia.

---

### Caso Clínico

**Homem, 28 anos, acidente moto vs caminhão (alta energia). Chega ao pronto-socorro: GCS 14 (O4V4M6), queda para GCS 10 em 20 min (O3V3M4). PA 130/80 mmHg, FC 88 bpm. Pupila esquerda midriática e arreativa. Fratura temporal esquerda ao Rx. TC urgente: imagem lenticular biconvexo hiperdensa em região temporal esquerda, espessura 15 mm, desvio de linha média 7 mm.**

**Análise e Conduta:**
- **Diagnóstico:** Hematoma epidural esquerdo — fratura temporal + lenticular biconvexo (a. meníngea média esquerda) + midríase ipsilateral (herniação uncal incipiente)
- **Classificação:** TCE moderado evoluindo para grave (queda do GCS + sinal de herniação)
- **Conduta imediata:**
  - IOT em sequência rápida (ketamina 1,5 mg/kg + succinilcolina 1,5 mg/kg) — proteger PPC
  - Manitol 1 g/kg IV bolus (osmoterapia de ponte)
  - Cabeceira 30°, normocapnia (capnografia alvo EtCO₂ 35–38)
  - **Neurocirurgia emergencial — craniotomia descompressiva e evacuação do hematoma**
  - Meta PPC ≥ 60 mmHg (PAM alvo ≥ 80 mmHg)
- **Prognóstico:** HED tratado precocemente tem excelente prognóstico (recuperação completa em maioria)`, ativo: true,
    },
    {
      titulo: 'Toxicologia: Intoxicações Agudas Mais Frequentes',
      descricao: 'Intoxicação por organofosforados, benzodiazepínicos, opioides, paracetamol, anticolinérgicos e antidepressivos tricíclicos. Antídotos específicos.',
      disciplina: 'Clínica Médica', tema: 'Toxicologia', tipo: 'texto', nivel: 'avancado',
      duracao: 67, ordem: 4, mes: 6, semana: 2,
      videoUrl: null,
      conteudo: `## Toxicologia: Intoxicações Agudas Mais Frequentes

**Base:** SINITOX 2023 + UpToDate Toxicology 2024 + Goldfrank's Toxicologic Emergencies 11ª Ed. + Poisindex

---

### Abordagem Geral — ABCDE Toxicológico

**Prioridade absoluta: estabilização antes de identificação do agente.**

**Via aérea (A):** rebaixamento de consciência → IOT precoce; vômito aspirado é letal.

**Respiração (B):** opioides e sedativos causam apneia — ventilação com bolsa-máscara enquanto prepara naloxona.

**Circulação (C):** monitor cardíaco obrigatório — tricíclicos causam taquicardia e alargamento de QRS; digitálicos causam bradicardia/BAV.

**Descontaminação (D):**
- **Carvão ativado:** 1 g/kg VO/SNG (máx 50–100 g) — indicado para maioria das intoxicações orais em < 1–2h; CONTRAINDICADO em cáusticos, hidrocarbonetos, convulsivantes sem via aérea protegida, íleo paralítico
- **Lavagem gástrica:** uso restrito — < 1h da ingestão, agente sem antídoto específico, paciente com via aérea protegida; CONTRAINDICADO em cáusticos, hidrocarbonetos, substâncias com risco de convulsão
- **Lavagem/irrigação intestinal:** polietilenoglicol — útil para "body packers", ferro, lítio

**Eliminação aumentada (E):** alcalinização urinária (bicarbonato) para salicilatos e herbicidas; hemodiálise para metanol, etilenoglicol, lítio, salicilatos graves.

---

### Toxidromos — Reconhecimento Rápido

| Toxídrome | Agentes Típicos | Pupila | FC | PA | Temp | Pele | Conduta Principal |
|---|---|---|---|---|---|---|---|
| **Colinérgico (muscarínico)** | Organofosforados, carbamatos, pilocarpina | Miose intensa | ↓ | ↓/variável | N | Úmida, sudorese | Atropina + pralidoxima |
| **Anticolinérgico** | Antihistamínicos, tricíclicos, escopolamina, cogumelos Amanita | Midríase | ↑ | ↑ | ↑↑ | Seca, quente, rubra | Suporte; fisostigmina casos graves |
| **Opioide** | Morfina, heroína, codeína, fentanil, metadona | Miose puntiforme | ↓ | ↓ | ↓ | Normal | Naloxona IV |
| **Simpaticomimético** | Cocaína, anfetaminas, efedrina, cafeína | Midríase | ↑↑ | ↑↑ | ↑ | Úmida | BDZ para agitação; evitar bloqueador beta puro |
| **Sedativo-hipnótico** | BDZ, barbitúricos, GABA-érgicos | Normal/miose | ↓ | ↓ | ↓ | Normal | Suporte; flumazenil se BDZ (cuidado) |
| **Serotoninérgico** | ISRS + IMAO, tramadol + ISRS, lítio | Midríase | ↑ | ↑ | ↑↑ | Diaforese, clonus | Ciproeptadina; BDZ; suporte |

---

### Intoxicações Específicas com Antídotos

**Organofosforados/Carbamatos — Síndrome Colinérgica Aguda:**

Mecanismo: inibição irreversível (OP) ou reversível (carbamatos) da acetilcolinesterase → acúmulo de ACh nas sinapses muscarínicas e nicotínicas.

Mnemônico SLUDGE: Salivação + Lacrimejamento + Urina (incontinência) + Diarreia + GI (cólica) + Êmese

- **Atropina:** 2–4 mg IV — repetir a cada 5–10 min até endpoint correto = secreções secas (NÃO usar FC ou PA como endpoint)
- **Pralidoxima (2-PAM):** 1–2 g IV lento (em 30 min) → reativa acetilcolinesterase APENAS se administrada em < 24–48h (janela antes de "envelhecimento" do complexo OP-enzima)

> **Pérola clínica:** O endpoint da atropina é dessecamento das secreções brônquicas, não taquicardia. Midríase e FC elevada indicam atropinização excessiva — reduzir dose, não parar.

**Paracetamol (Acetaminofeno):**
- Dose tóxica: > 150 mg/kg (adultos ~7,5 g em dose única) → necrose hepática centrolobular por NAPQI
- **Nomograma de Rumack-Matthew:** traçar nível sérico × tempo da ingestão — linha de risco determina necessidade de N-acetilcisteína
- **N-acetilcisteína (NAC):** 
  - Oral: 140 mg/kg → 70 mg/kg 4/4h × 17 doses
  - IV (3-bag): 150 mg/kg em 15 min → 50 mg/kg em 4h → 100 mg/kg em 16h (total 21h)
  - Eficaz até 24h; pode ser benéfica até 36–72h em casos graves com hepatite instalada

**Antidepressivos Tricíclicos (ADT) — Amitriptilina, Imipramina:**
- **ECG:** QRS > 100 ms = risco de arritmia ventricular; QTc prolongado + QRS alargado = padrão típico
- **Bicarbonato de sódio 1–2 mEq/kg IV em bolus** → reverte bloqueio dos canais de sódio (QRS estreita) e alcalinização aumenta ligação proteica do tricíclico
- Meta: pH sérico 7,45–7,55; repetir bicarbonato se QRS permanecer > 100 ms
- **EVITAR:** flumazenil (rebaixamento do limiar convulsivo), fisostigmina, antiarrítmicos classe IA/IC

> **Pérola clínica:** Tricíclico com QRS > 160 ms → risco iminente de taquicardia ventricular e FV. Indicação de infusão contínua de bicarbonato de sódio.

**Benzodiazepínicos:**
- Isolados raramente causam morte — monitorar por depressão respiratória principalmente em idosos e coingesta de álcool
- **Flumazenil:** 0,2 mg IV → repetir 0,1 mg a cada 60s (máx 1 mg total); meia-vida curta (30–60 min) — reavaliar
- **CUIDADO:** contraindicado em dependência crônica (precipita abstinência grave com convulsões) e em coingesta de tricíclicos (abaixa limiar convulsivo)

**Opioides:**
- **Naloxona:** 0,4–2 mg IV/IM/SC/intranasal — repetir a cada 2–3 min (máx 10 mg)
- Meia-vida da naloxona (30–90 min) é menor que a maioria dos opioides → risco de resedação
- Infusão contínua de naloxona: 2/3 da dose de reversão por hora em SF 0,9%
- Observação mínima de 4–6h após reversão

**Monóxido de Carbono (CO):**
- Fonte: queima incompleta (incêndios, motor a combustão, aquecedores a gás em espaços fechados)
- Patologia: COHb se liga à hemoglobina com afinidade 200× maior que O₂; também inibe citocromo c-oxidase mitocondrial
- Clínica: cefaleia, tontura, confusão, síncope, coma — pele "rósea cereja" é clássica mas rara
- **Tratamento:** O₂ a 100% por máscara não-reinalante por 4–6h (reduz meia-vida da COHb de 5h para 60–90 min)
- **Câmara hiperbárica (O₂ a 2–3 ATM):** indicada se COHb > 25%, perda de consciência, sequelas neurológicas, gestante com COHb > 15%, criança com COHb > 15%

**Álcool Etílico e Síndrome de Wernicke:**
- Alcoolismo crônico → deficiência de tiamina (vitamina B1) → encefalopatia de Wernicke
- Tríade clássica (incompleta em 90%): oftalmoplegia + ataxia + confusão mental
- **Tiamina:** 100–500 mg IV ANTES de qualquer glicose (glicose sem tiamina precipita encefalopatia de Wernicke aguda)

---

### Antídotos — Tabela Rápida de Referência

| Toxina | Antídoto | Dose |
|---|---|---|
| Opioides | Naloxona | 0,4–2 mg IV/IM, repetir 2–3 min |
| Benzodiazepínicos | Flumazenil | 0,2 mg IV, máx 1 mg |
| Organofosforados | Atropina + Pralidoxima | Atropina 2–4 mg IV; 2-PAM 1–2 g IV |
| Paracetamol | N-acetilcisteína | 150 mg/kg IV (3-bag, 21h) |
| Tricíclicos | Bicarbonato de sódio | 1–2 mEq/kg IV bolus |
| CO | Oxigênio 100% / câmara hiperbárica | O₂ máscara 4–6h; HBO se grave |
| Digoxina | Anticorpos Fab (Digibind) | 10–20 frascos IV |
| Beta-bloqueador | Glucagon | 5–10 mg IV bolus |
| Bloqueador de Ca | Gluconato de Ca + insulina + glucagon | Ca glu 1–2 g IV + insulina-glicose |
| Heparina | Protamina | 1 mg por 100 UI de heparina |
| Warfarina | Vitamina K + CCP | VitK 10 mg IV lento; CCP 25–50 UI/kg |
| Metanol/Etilenoglicol | Fomepizol (4-metilpirazol) ou etanol | Fomepizol 15 mg/kg IV |

---

### Populações Especiais

**Gestante:** carvão ativado pode ser usado; evitar ipeca (vômitos prolongados). Alcalinização urinária é segura. NAC para paracetamol — segura e deve ser usada. Naloxona — segura mas pode precipitar síndrome de abstinência fetal com SOFRIMENTO FETAL.

**Idosos:** maior sensibilidade a BDZ e opioides; metabolismo hepático reduzido aumenta toxicidade de paracetamol; creatinina normal pode mascarar IR com ClCr reduzido.

**Imunossuprimidos:** maior risco de infecção secundária pós-aspiração e hepatite fulminante por paracetamol.

**Crianças:** doses tóxicas diferentes — paracetamol > 150 mg/kg; intoxicação acidental mais comum < 6 anos; intoxicação intencional/abuso suspeitar em adolescentes.

---

### Caso Clínico

**Trabalhador rural, 38 anos, encontrado inconsciente no campo. Miose puntiforme, salivação profusa, broncoespasmo audível, sudorese intensa, FC 48 bpm, PA 80/50 mmHg, evacuações involuntárias. Colegas relatam uso de pesticida organofosforado (malationa) há 2 horas.**

**Análise Estruturada:**
- **Toxídrome:** colinérgico muscarínico (SLUDGE completo) — intoxicação por organofosforado
- **Conduta ABCDE:**
  - Airway: posição lateral de segurança; se apneia → IOT com succinilcolina (atenção — OP potencializa succinilcolina, preferir rocurônio)
  - Breathing: O₂ 100%, broncodilatação com atropina
  - Circulation: acesso venoso calibroso, atropina imediata
- **Atropina:** iniciar 4 mg IV — repetir a cada 5–10 min; meta = secreções brônquicas secas (NÃO FC/midríase)
- **Pralidoxima:** 1–2 g IV em 30 min — iniciar imediatamente (dentro de 24h para ser eficaz)
- **Carvão ativado:** NÃO indicado (via oral comprometida, rebaixamento de consciência)
- **Descontaminação da pele:** retirar roupas, lavar com água e sabão (proteção da equipe — luvas)
- **Notificação:** intoxicação por agrotóxico é de notificação compulsória no SINAN`, ativo: true,
    },
    // ── Clínica Médica — Mês 6 (4 aulas) ────────────────────────────────────
    {
      titulo: 'Reumatologia: Artrite Reumatoide, Gota e Espondiloartrites',
      descricao: 'AR: critérios ACR/EULAR 2010, DMARDs (metotrexato, biológicos). Gota: hiperuricemia, crise aguda (colchicina) e prevenção (alopurinol). Espondiloartrites.',
      disciplina: 'Clínica Médica', tema: 'Reumatologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 69, ordem: 1, mes: 6, semana: 1,
      videoUrl: null,
      conteudo: `## Reumatologia: Artrite Reumatoide, Gota e Espondiloartrites

**Base:** ACR/EULAR 2023 + SBR 2022 + EUSTAR + EULAR Gota 2016

---

### Artrite Reumatoide (AR) — Critérios, Atividade e Tratamento

A AR é uma doença inflamatória crônica autoimune, sinovite simétrica de pequenas e grandes articulações, com potencial destrutivo e manifestações sistêmicas.

**Critérios ACR/EULAR 2010 — Pontuação (≥ 6/10 = AR definida):**

| Domínio | Critério | Pontos |
|---|---|---|
| Articulações acometidas | 1 articulação grande | 0 |
| | 2–10 articulações grandes | 1 |
| | 1–3 pequenas articulações | 2 |
| | 4–10 pequenas articulações | 3 |
| | > 10 articulações (pelo menos 1 pequena) | **5** |
| Sorologia | FR e anti-CCP negativos | 0 |
| | FR OU anti-CCP baixo positivo (≤ 3× LSN) | 2 |
| | FR OU anti-CCP alto positivo (> 3× LSN) | **3** |
| Fase aguda | PCR e VHS normais | 0 |
| | PCR OU VHS anormais | 1 |
| Duração dos sintomas | < 6 semanas | 0 |
| | ≥ 6 semanas | 1 |

**Anti-CCP:** especificidade 95–98% para AR (superior ao FR); pode preceder a doença em anos; prediz erosão articular.

**Índices de atividade da doença:**
- **DAS28:** pontuação 0–9,4; remissão < 2,6; baixa atividade 2,6–3,2; moderada 3,2–5,1; alta > 5,1
- **CDAI (Clinical Disease Activity Index):** sem exames laboratoriais; remissão ≤ 2,8; meta treat-to-target

**Tratamento — "Treat to Target" (ACR/EULAR):**

| Fase | Tratamento | Dose | Monitorização |
|---|---|---|---|
| Diagnóstico (1ª linha) | **Metotrexato (MTX)** | 10 mg/sem → escalar 2,5 mg/sem até 20–25 mg/sem | Hemograma + TGO/TGP/albumina trimestral |
| MTX isolado — adicionar | + Ácido fólico | 5 mg/semana (dia seguinte ao MTX) | Reduz toxicidade mucosa e hepática |
| Falha MTX em 3–6 meses | + Leflunomida 20 mg/dia OU + Sulfassalazina | Combinação DMARD sintético convencional | Monitorar PA (leflunomida) |
| Falha 2 DMARDs sintéticos | Biológico: **anti-TNF** (etanercepte, adalimumabe, certolizumabe) | — | Rastrear TB (IGRA), hepatite B antes |
| Falha anti-TNF ou contraindicação | Tocilizumabe (anti-IL-6R) OU abatacepte (anti-CTLA4-Ig) | — | IL-6: monitorar colesterol, neutrófilos |
| Falha biológico | **JAK inibidores** (tofacitinibe, baricitinibe, upadacitinibe) | — | Risco TEV, herpes zóster, dislipidemia |

> **Pérola:** Anti-CCP positivo + poliartrite simétrica de pequenas articulações + rigidez matinal > 1h = tratar como AR mesmo antes de atingir 6 pontos nos critérios formais.

**Manifestações extra-articulares da AR:**
- Nódulos reumatoides (25% — superfícies extensoras, olécrano; associado a FR positivo alto)
- Vasculite reumatoide (rara; lesões isquêmicas; mortalidade aumentada)
- Doença pulmonar intersticial (DPI) — mais comum com anti-CCP alto
- Síndrome de Felty: AR + esplenomegalia + neutropenia
- Cardiopatia: pericardite, doença cardiovascular aterosclerótica acelerada

---

### Gota — Fisiopatologia, Diagnóstico e Tratamento

A gota resulta do acúmulo de cristais de urato monossódico (MSU) em articulações e tecidos moles, secundário à hiperuricemia crônica.

**Fisiopatologia:** hiperuricemia (ácido úrico sérico > 6,8 mg/dL) → supersaturação → precipitação de cristais MSU → fagocitose por neutrófilos → ativação NLRP3 inflamassoma → IL-1β → inflamação aguda intensa.

**Análise do líquido sinovial (padrão-ouro):** cristais aciculados birrefringentes negativos (amarelos paralelos ao compensador, azuis perpendiculares) — distingue definitivamente de pseudogota (pirofosfato de cálcio = birrefringência positiva fraca).

| Fase | Tratamento | Dose/Protocolo | Observação |
|---|---|---|---|
| **Crise aguda** | **Colchicina** | **1,2 mg VO na 1ª hora → 0,6 mg 1h depois**; depois 0,6 mg 2×/dia até resolução | 1ª linha para crise < 12h. Ajustar em IR. |
| Crise aguda | AINEs (naproxeno, indometacina) | Naproxeno 500 mg 2×/dia × 5–7 dias | Evitar em IR, úlcera, anticoagulados |
| Crise aguda | Corticoide (se colchicina/AINE contraindicados) | Prednisona 30–35 mg/dia × 5 dias | Útil em poliarticular/idoso |
| **Profilaxia de crise** | Colchicina 0,5–0,6 mg/dia | Manter durante titulação de uricosúrico | Prevenir crises ao iniciar alopurinol |
| **Hipouricemiante** | **Alopurinol** (inibidor XO) | Iniciar 100 mg/dia → titular 100 mg/4 semanas → meta AU < 6 mg/dL | Iniciar 2–4 semanas após crise |
| Falha/intolerância ao alopurinol | **Febuxostate** 40–80 mg/dia | Dose fixa, independe de função renal (leve-moderada) | Mais caro; risco cardiovascular debatido |

> **Alerta:** Síndrome de hipersensibilidade ao alopurinol (AHS) / DRESS — eritema descamativo generalizado + febre + eosinofilia + hepatite. Risco aumentado em: HLA-B*5801 (prevalente em asiáticos), IR grave, dose inicial alta. Suspender imediatamente.

**Hiperuricemia assintomática — quando tratar:** alvo AU < 6 mg/dL se tofos OU artrite gotosa ≥ 2 crises/ano. Hiperuricemia isolada sem manifestações = NÃO tratar (EULAR 2016, ACR 2020).

**Dieta na gota:** reduzir: vísceras, mariscos, carne vermelha, frutose, álcool (especialmente cerveja e destilados). Aumentar: leite desnatado, cerejas, hidratação.

---

### Espondiloartrites — Classificação e Tratamento

| Tipo | Características | HLA-B27 | Tratamento |
|---|---|---|---|
| **Espondilite anquilosante (EA)** | Dor lombar inflamatória (piora repouso, melhora exercício), sacroileíte grau ≥ 2 bilateral (Rx) | 90% | AINEs 1ª linha × 4 semanas; anti-TNF se falha |
| **Espondiloartrite axial não-radiográfica** | Critérios ASAS; sacroileíte em RM sem alteração Rx | 70% | Igual à EA; anti-IL-17 (secucinumabe) |
| **Artrite psoriásica** | 5 padrões: oligoarticular, poliarticular, DIP, axial, artrite mutilante; dactilite, entesite | 30–50% | MTX (pele) ou anti-TNF/IL-17 (articular grave) |
| **Artrite reativa** | Pós-infecção (C. trachomatis, Salmonella, Campylobacter) — tríade: artrite + uretrite + conjuntivite | 50–60% | AINEs; tratar infecção; autolimitada geralmente |

**Critérios ASAS para espondiloartrite axial (1 braço + critério):**
- Braço de imagem: sacroileíte em Rx ou RM + ≥ 1 característica de SpA
- Braço clínico: HLA-B27+ + ≥ 2 características de SpA (dor lombar inflamatória, artrite, entesite calcânea, uveíte, dactilite, psoríase, DII, resposta a AINE, história familiar, HLA-B27, PCR elevada)

---

### LES — Critérios EULAR/ACR 2019 e Tratamento Base

| Domínio | Critério | Pontos |
|---|---|---|
| Geral | Febre inexplicada | 2 |
| Hematológico | Leucopenia < 4.000 / Trombocitopenia < 100.000 / Anemia hemolítica | 3 / 4 / 4 |
| Mucocutâneo | Rash malar agudo / Lúpus discoide / Fotossensibilidade / Úlcera oral | 6 / 4 / 3 / 2 |
| Neuropsiquiátrico | Convulsão / Psicose / Delirium | 5 / 3 / 2 |
| Renal | Proteinúria > 0,5 g/24h / Biópsia classe II ou V / Biópsia classe III ou IV | 4 / 8 / 10 |
| Anticorpos | Anti-dsDNA 6 / Anti-Sm 6 / Anticardiolipina ou anti-B2GPI 2–3 / Complemento baixo 3 | — |

**Classificação:** FAN positivo (ANA-HEp2 ≥ 1:80) = critério de entrada + pontuação ≥ 10 = LES.

**Tratamento base LES:** Hidroxicloroquina (HCQ) 5 mg/kg/dia para TODOS os pacientes (reduz flares, melhora sobrevida, protege cardiovascular). Rastreamento oftalmológico anual.

---

### Populações Especiais

**Gestante com AR:** MTX e leflunomida são TERATOGÊNICOS — suspender 3 meses antes da concepção. Sulfassalazina e HCQ são seguros. Biológicos anti-TNF permitem uso até 20ª semana; suspender após (passagem placentária aumentada no 3º trimestre).

**Gestante com LES:** risco de flare aumentado. Monitorar anti-SSA/SSB (risco de lúpus neonatal e bloqueio AV fetal). HCQ manter durante toda gestação. Prednisona < 20 mg/dia preferível.

**Idoso com gota:** IR é frequente — ajustar dose de colchicina e AINEs. Febuxostate pode ser preferido ao alopurinol em IR moderada. Interações medicamentosas: estatinas + colchicina (miopatia); ciclosporina + colchicina (toxicidade grave).

---

### Caso Clínico

**Mulher, 38 anos, professora, queixas de dor e rigidez matinal > 1h em articulações MCF, IFP bilaterais e punhos há 4 meses. Edema fusiforme de dedos. FR 1:640 (alto positivo). Anti-CCP 180 UI/mL (VR < 17). PCR 18 mg/L. Rx mãos: redução discreta do espaço articular em MCF3 bilateral. Sem outras comorbidades.**

**Análise e Conduta:**
- **Pontuação ACR/EULAR 2010:** articulações (MCF/IFP bilaterais = > 10 pequenas: 5 pts) + anti-CCP alto positivo (3 pts) + PCR alta (1 pt) + duração ≥ 6 semanas (1 pt) = **10/10 pontos → AR definida**
- **Atividade:** calcular DAS28 (provável alta atividade: PCR 18, múltiplas articulações)
- **Tratamento:**
  - MTX 10 mg/semana → escalar até 20–25 mg/semana ao longo de 8 semanas
  - Ácido fólico 5 mg/semana (dia seguinte ao MTX)
  - Prednisona 10 mg/dia (ponte enquanto MTX não atinge efeito — máx 3 meses)
  - Reavaliação em 3 meses: se DAS28 não caiu ≥ 1,2 → adicionar leflunomida ou biológico
- **Antes do MTX:** Rx tórax, sorologias (HBsAg, anti-HCV), função hepática e renal, beta-HCG
- **Orientação:** anticoncepção eficaz (MTX teratogênico), evitar gestação por pelo menos 3 meses após suspender MTX`, ativo: true,
    },
    {
      titulo: 'Hematologia: Anemias — Diagnóstico e Tratamento',
      descricao: 'Algoritmo diagnóstico das anemias (microcítica, normocítica, macrocítica). Anemia ferropriva, megaloblástica, hemolítica e de doença crônica.',
      disciplina: 'Clínica Médica', tema: 'Hematologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 45, ordem: 2, mes: 6, semana: 2,
      videoUrl: null,
      conteudo: `## Hematologia: Anemias — Diagnóstico e Tratamento

**Base:** ASH 2024 + SBH + BCSH + Harrison's Principles 21ª Ed.

---

### Classificação Morfológica das Anemias — Algoritmo Diagnóstico

A anemia é definida como Hb < 13 g/dL (homens) ou < 12 g/dL (mulheres). O VCM é o primeiro passo do algoritmo diagnóstico.

| VCM | Tipo | Causas Principais |
|---|---|---|
| **< 80 fL** | **Microcítica** | Ferropriva (+ comum), talassemia, doença crônica, anemia sideroblástica |
| **80–100 fL** | **Normocítica** | Doença crônica, hemolítica, aplástica, IR crônica, hemorragia aguda, hipotireoidismo leve |
| **> 100 fL** | **Macrocítica** | Megaloblástica (B12/folato), hipotireoidismo, hepatopatia crônica, álcool, medicamentos (MTX, hidroxiureia, AZT) |

**Segundo passo — Reticulócitos:** hiperregenerativa (↑ reticulócitos = hemólise, sangramento) vs hiporregenerativa (↓ reticulócitos = aplasia, deficiência, doença crônica).

---

### Anemia Ferropriva — Diagnóstico Laboratorial e Tratamento

**Etiologia:** sangramento crônico (GI, ginecológico), má absorção (doença celíaca, gastrectomia), demanda aumentada (gestação, infância).

| Parâmetro | Ferropriva | Doença Crônica | Talassemia minor |
|---|---|---|---|
| Ferro sérico | ↓↓ | ↓ | Normal |
| **Ferritina** | **↓ (< 30 ng/mL)** | Normal ou ↑ | Normal ou ↑ |
| TIBC | **↑** (> 400 mcg/dL) | ↓ ou normal | Normal |
| Saturação transferrina | ↓ (< 16%) | ↓ | Normal |
| RDW | **↑** (anisocitose) | Normal | Normal |
| Eritrócitos | ↓ | ↓ | **↑ ou normal** (microcitose sem anemia) |

> **Ferritina < 30 ng/mL = diagnóstico de ferropriva** mesmo sem anemia (depleção de estoques). Ferritina entre 30–100 ng/mL com PCR elevada (inflamação) = inconclusivo — dosar receptor solúvel de transferrina (RsTf) ou índice RsTf/log ferritina.

**Tratamento:**
- Identificar e corrigir a causa (endoscopia digestiva em homens > 50 anos e mulheres pós-menopausa)
- Sulfato ferroso 200 mg VO (= 65 mg Fe elementar) 1–3×/dia em jejum + vitamina C (aumenta absorção)
- Dose pediátrica: 3–5 mg/kg/dia de Fe elementar
- **Resposta esperada:** reticulocitose em 4–7 dias; Hb sobe 1–2 g/dL em 4 semanas
- **Duração total:** 3–6 meses após normalização da Hb para repor estoques (ferritina > 50)
- **Ferro parenteral (ferrocarboxymaltose):** má absorção, intolerância VO, DII ativa, pré-cirurgia, doença renal crônica

---

### Anemia de Doença Crônica (ADC)

**Fisiopatologia:** inflamação → hepcidina ↑ → sequestro de ferro no SMF → redução da eritropoiese. Presente em: câncer, IRC, ICC, DII, infecções crônicas, artrite reumatoide.

| Parâmetro | Valor |
|---|---|
| Ferritina | Normal ou ↑ (reactante de fase aguda) |
| TIBC | ↓ |
| Ferro sérico | ↓ |
| Saturação transferrina | ↓ |

**Tratamento:** tratar a doença de base. Eritropoietina (EPO) recombinante em IRC dialítica. Ferro IV se coexistência de ferropriva (TSAT < 20% + ferritina < 200).

---

### Anemia Megaloblástica — B12 e Folato

**Mecanismo:** deficiência de cofatores necessários para síntese de DNA → megaloblastose (precursores grandes e imaturos na medula).

| Aspecto | Deficiência de B12 | Deficiência de Folato |
|---|---|---|
| VCM | > 100 fL (às vezes > 130 fL) | > 100 fL |
| Neutrófilos hipersegmentados | Presentes | Presentes |
| Manifestações neurológicas | **SIM — DASEM (degeneração subaguda da medula):** parestesias simétricas, ataxia, sinal de Romberg, demência | **NÃO** — folato não causa neurológico |
| Nível diagnóstico | B12 < 200 pg/mL (deficiência; < 300 com sintomas) | Folato sérico < 2 ng/mL |
| Etiologias comuns | Anemia perniciosa (anti-FI), veganos, gastrectomia, metformina (reduz absorção B12) | Dieta pobre, álcool, gestação, MTX, fenitoína |

**Tratamento B12:** cianocobalamina 1.000 mcg IM diário × 7 dias → semanal × 4 semanas → mensal (manutenção)

> **Alerta crítico:** NUNCA tratar com folato isolado em deficiência de B12 — corrige a anemia mas piora IRREVERSIVELMENTE a neuropatia. Sempre dosar ambos antes de tratar.

---

### Anemia Hemolítica

**Diagnóstico de hemólise:** LDH ↑ + bilirrubina indireta ↑ + haptoglobina ↓ + reticulocitose. Coombs direto (TAD) diferencia imune de não-imune.

| Tipo | Etiologia | Diagnóstico | Tratamento |
|---|---|---|---|
| AHAI por anticorpos quentes (IgG) | Idiopática, LES, LLC, drogas | TAD+ (IgG) + esferócitos | Prednisona 1 mg/kg/dia → esplenectomia → rituximabe |
| AHAI por crioaglutininas (IgM) | Mycoplasma, mononucleose, linfoma | TAD+ (C3d); piora com frio | Evitar frio; rituximabe |
| Esferocitose hereditária | Mutação na espectrina/anquirina | Osmotic fragility test; ektacytometry | Esplenectomia (casos graves) |
| Deficiência de G6PD | Ligada ao X; gatilhos: primaquina, dapsona, fava | Dosagem G6PD (após crise) | Suspender gatilho; suporte |
| **Anemia falciforme** | Hb SS (homozigoto); mutação β-globina | Hemograma + eletroforese Hb | Hidroxiureia (aumenta HbF) — reduz crises; transplante de MO curativo |

**Anemia falciforme — complicações e manejo:**
- Crise vasooclusiva (dor): hidratação IV + AINEs + opioides; O₂ se hipoxemia
- Síndrome torácica aguda (febre + infiltrado + hipoxemia + dor torácica): O₂ + ATB (cobertura atípica) + transfusão de troca
- AVC: transfusão de troca emergencial; profilaxia com transfusão crônica (meta HbS < 30%)
- Sequestro esplênico (criança): queda rápida Hb + esplenomegalia → transfusão urgente
- Hidroxiureia: 15–35 mg/kg/dia VO; aumenta HbF ≥ 10% após 3–6 meses; reduz crises e hospitalização em ~50%

---

### Anemia Aplástica

Pancitopenia com hipocelularidade de medula óssea (< 25% de celularidade). Fisiopatologia: destruição imunológica dos progenitores hematopoéticos por linfócitos T autorreativos.

| Classificação | Critérios | Mortalidade sem tratamento |
|---|---|---|
| Grave (SAA) | 2 de 3: neutrófilos < 500, plaquetas < 20.000, reticulócitos < 20.000 + hipocelularidade MO | > 80% em 1 ano |
| Muito grave (VSAA) | Igual + neutrófilos < 200 | > 90% |
| Não grave | Não preenche critérios acima | Variável |

**Tratamento:**
- **Transplante alogênico de MO (TCPH):** 1ª linha em pacientes < 40 anos com doador compatível — taxa de cura 80–90%
- **ATG + Ciclosporina:** pacientes sem doador ou > 40 anos; ATG equina (cavalo) preferida sobre ATG coelho; adicionar eltrombopag (agonista TPO) melhora resposta
- Suporte: concentrado de hemácias e plaquetas; antibioticoterapia para febre neutropênica; G-CSF controverso

---

### Populações Especiais

**Gestante:** anemia ferropriva é a mais comum (necessidade Fe aumenta 3× no 3º trimestre). Meta Hb ≥ 11 g/dL. Folato 400–800 mcg/dia (prevenção de defeitos do tubo neural) — iniciar antes da concepção. B12 VO se vegana. Ferro IV seguro no 2º e 3º trimestres.

**Criança (< 2 anos):** aleitamento materno exclusivo até 6 meses; sulfato ferroso profilático em prematuros e MBPN a partir de 30–45 dias; anemia falciforme — triagem neonatal obrigatória (teste do pezinho).

**Idoso:** sempre investigar causa (neoplasia GI, mielodisplasia). Anemia normocítica em idoso com pancitopenia = síndrome mielodisplásica até prova em contrário — biópsia de MO.

**IRC em diálise:** EPO darbepoetina alfa SC + ferro IV; meta Hb 10–11,5 g/dL; Hb > 12 aumenta risco cardiovascular.

---

### Caso Clínico

**Homem, 58 anos, queixa de fadiga progressiva há 3 meses, sem sangramento visível. Hb 9,1 g/dL, VCM 72 fL, RDW 18%, ferritina 8 ng/mL, TIBC 480 mcg/dL, saturação transferrina 8%. Nega uso de AINEs. Sem história de cirurgia gástrica. Ex-tabagista.**

**Análise e Conduta:**
- **Diagnóstico:** Anemia ferropriva microcítica grave (VCM < 80 + ferritina < 30 + TIBC ↑ + RDW ↑)
- **Causa a investigar:** homem de meia-idade com ferropriva sem causa óbvia = investigação obrigatória de sangramento oculto GI
  - Colonoscopia + endoscopia digestiva alta (prioridade — neoplasia colorretal)
  - Pesquisa de sangue oculto nas fezes
- **Tratamento:**
  - Sulfato ferroso 200 mg 3×/dia VO + vitamina C
  - Controle: reticulocitose esperada em 7 dias; Hb deve subir ≥ 1 g/dL em 4 semanas
  - Se má resposta: considerar ferro IV (ferrocarboxymaltose 1.000 mg em dose única)
  - Duração: mínimo 6 meses após normalização da Hb e ferritina ≥ 50 ng/mL
- **Alerta:** não tratar sem investigar a causa — anemia ferropriva em homem adulto = sangramento GI oculto até prova em contrário`, ativo: true,
    },
    {
      titulo: 'Ortopedia: Fraturas, Princípios e Emergências',
      descricao: 'Classificação de fraturas (aberta vs fechada, completa vs incompleta), princípios de imobilização, síndrome compartimental, fat embolism.',
      disciplina: 'Cirurgia', tema: 'Ortopedia', tipo: 'texto', nivel: 'intermediario',
      duracao: 39, ordem: 1, mes: 6, semana: 3,
      videoUrl: null,
      conteudo: `## Ortopedia: Fraturas, Princípios e Emergências

**Base:** AO Foundation | ATLS 11ª Ed. | SBO 2023

---

### Classificação das Fraturas

| Parâmetro | Tipos |
|---|---|
| **Traço** | Transversa, oblíqua, espiral, cominutiva |
| **Exposição** | Fechada (pele íntegra) × Aberta/exposta (comunicação com exterior) |
| **Estabilidade** | Estável (sem tendência ao deslocamento) × Instável |
| **Completude** | Completa × Incompleta (galho-verde em criança) |

**Classificação de Gustilo (fratura exposta):**

| Grau | Ferida | Contaminação | ATB |
|---|---|---|---|
| I | < 1 cm | Mínima | Cefalosporina 1ª G |
| II | 1–10 cm | Moderada | Cefalosporina 1ª G |
| IIIA | > 10 cm com cobertura adequada | Alta | Cefalosporina + Gentamicina |
| IIIB | Perda de tecido mole, osso exposto | Muito alta | + Penicilina G (contaminação terrosa) |
| IIIC | Lesão vascular associada | — | + Cirurgia vascular urgente |

---

### Síndrome Compartimental

> **Clínica:** Dor desproporcional + Dor à extensão passiva dos dedos + Parestesia + Palidez (5 P's)

- **Pressão compartimental > 30 mmHg** OU **< 30 mmHg abaixo da diastólica** = indicação de **fasciotomia de emergência**
- **Causa:** fraturas, queimaduras, esmagamento, reperfusão
- **Cuidado:** nunca elevar o membro (reduz perfusão)

---

### Fratura de Quadril no Idoso

- **Epidemiologia:** osteoporose + queda da própria altura
- **Tipos:** subtrocantérica, intertrocantérica (extracapsular) vs femoral intracapsular (colo femoral)
- **Tratamento:** cirurgia em **< 48h** reduz mortalidade em 30–50%
  - Colo femoral deslocado: **artroplastia total ou parcial** (risco de necrose avascular)
  - Intertrocantérica: **fixação interna** (haste intramedular)

---

### Princípios Gerais — Imobilização

- **Gessado:** imobilizar articulação acima e abaixo da fratura
- **Tala** (gessada ou sintética): preferida no agudo (edema)
- **RICE:** Rest, Ice, Compression, Elevation — para entorses leves/fraturas sem desvio

| Fratura | Imobilização | Duração |
|---|---|---|
| Tíbia (fechada, sem desvio) | Gesso circular | 6–8 sem |
| Fêmur | Tração + haste intramedular | 12–16 sem |
| Úmero proximal (sem desvio) | Tipóia | 4–6 sem |
| Rádio distal (Colles) | Tala/gesso | 4–6 sem |

---

### Indicações Cirúrgicas vs Conservador

**Operar se:**
- Fratura exposta (Gustilo II/III)
- Lesão vascular ou nervosa associada
- Deslocamento > 2 cm ou angulação > 15°
- Fratura intra-articular deslocada
- Múltiplas fraturas (politrauma)
- Fratura patológica (tumor, osteoporose severa)
- Fratura de quadril no idoso (< 48h)

**Conservador se:**
- Fechada, estável, sem desvio significativo
- Galho-verde em criança
- Fratura de clavícula sem desvio (tipóia)
- Contraindicação clínica à cirurgia (comorbidades graves)

---

### Luxação de Ombro

> A luxação anterior é responsável por **95% dos casos**, geralmente por queda com braço em abdução e rotação externa.

- **Clínica:** dor aguda, ombro "quadrado", incapacidade de elevar o braço
- **Rx:** projeção AP e Y da escápula — confirma posição da cabeça umeral
- **Conduta:** redução imediata sob analgesia/sedação leve (técnica de Hippócrates, Stimson ou Cunningham)
- **Complicações imediatas:** lesão de Bankart (lábio glenoidal), Hill-Sachs (impactação cabeça umeral), lesão do nervo axilar
- **Imobilização pós-redução:** tipóia por 3 semanas; fisioterapia precoce

---

### Embolia Gordurosa (Fat Embolism Syndrome — FES)

Ocorre em **1–3%** das fraturas de ossos longos (fêmur, tíbia), mais freqüente em fraturas fechadas cominutivas.

**Critérios de Gurd (2 maiores OU 1 maior + 4 menores):**

| Critérios Maiores | Critérios Menores |
|---|---|
| Insuficiência respiratória (PaO₂ < 60) | Taquicardia > 110 bpm |
| Petéquias (axilas, conjuntiva — patognomônico) | Febre > 38,5°C |
| Alteração neurológica (agitação, confusão) | Trombocitopenia |
| | Anemia (Hb < 10 g/dL) |
| | Lipúria (gotas de gordura na urina) |

**Tratamento:** suporte respiratório (O₂ ou VM), corticoide controverso, **imobilização precoce é a melhor prevenção.**

---

### Complicações das Fraturas

**Agudas:** síndrome compartimental, embolia gordurosa, TVP/TEP, lesão vascular/nervosa

**Tardias:**
- **Pseudartrose:** consolidação não ocorre após 6–9 meses → cirurgia (enxerto + fixação)
- **Consolidação viciosa:** fratura cura em posição inadequada → osteotomia corretiva
- **Necrose avascular:** principalmente colo femoral e escafoide — interrompe vascularização óssea
- **Artrose pós-traumática:** destruição da cartilagem após fratura intra-articular
- **Osteomielite:** em fraturas expostas mal tratadas — Staphylococcus aureus é o principal agente

---

### Algoritmo de Decisão Clínica

**Fratura aguda →**
- **Exposta?** → Gustilo → ATB IV + Lavagem cirúrgica urgente
  - Gustilo I/II: Cefazolina
  - Gustilo III: Cefazolina + Gentamicina (± Penicilina G)
- **Síndrome compartimental?** → Pressão > 30 mmHg → **FASCIOTOMIA imediata**
- **Fratura de quadril no idoso?** → Cirurgia nas primeiras **48h**
- **Demais:** avaliar desvio, estabilidade, intra-articular → cirurgia ou conservador

---

### Caso Clínico

**Homem, 22 anos, fratura de tíbia em acidente motociclístico. Ferida de 3 cm com gordura exposta, contaminação moderada. Dor intensa, pé com parestesia e dor ao estender os dedos passivamente.**

- **Fratura exposta Gustilo II:** lavagem cirúrgica + fixação externa + cefalosporina 1ª G IV
- **Síndrome compartimental:** suspeita → medir pressão → se indicado: fasciotomia imediata
- Profilaxia antitetânica se não vacinado
- Vigilância de FES nas primeiras 48–72h (petéquias, hipóxia, agitação)`, ativo: true,
    },
    {
      titulo: 'Geriatria: Síndromes Geriátricas e Polifarmácia',
      descricao: 'Os 5 Géis (Imobilidade, Instabilidade, Incontinência, Incapacidade cognitiva, Iatrogenia). Critérios de Beers, avaliação geriátrica ampla.',
      disciplina: 'Clínica Médica', tema: 'Geriatria', tipo: 'texto', nivel: 'intermediario',
      duracao: 74, ordem: 1, mes: 6, semana: 4,
      videoUrl: null,
      conteudo: `## Geriatria: Síndromes Geriátricas e Polifarmácia

**Base:** SBGeriatria 2022 + AGS Beers Criteria 2023 + STOPP/START v3 2023 + ILPI 2022

---

### 1. Avaliação Geriátrica Ampla (AGA) — Instrumentos e Cortes

A AGA é a ferramenta estruturada para identificar síndromes geriátricas, vulnerabilidades ocultas e planejar intervenções. Deve ser realizada em toda consulta geriátrica e ao internar idosos frágeis.

**Cognição:**

| Instrumento | Corte por Escolaridade | O que Avalia |
|---|---|---|
| MEEM (Mini-Exame do Estado Mental) | Analfabeto: ≤ 13; 1–4 anos: ≤ 18; 5–8 anos: ≤ 21; ≥ 9 anos: ≤ 26 | Orientação, memória, linguagem, cálculo, praxia |
| MoCA (Montreal Cognitive Assessment) | ≤ 25 sugere comprometimento (ajustar +1 se < 12 anos escolaridade) | Funções executivas, visuoespacial — mais sensível para CCL |
| CDR (Clinical Dementia Rating) | 0=normal; 0,5=CCL; 1=demência leve; 2=moderada; 3=grave | Estadiamento da demência |

**Funcionalidade:**

| Escala | Atividades Avaliadas | Comprometimento |
|---|---|---|
| Katz ADL (básicas) | Banho, vestir, toilete, transferência, continência, alimentação (0–6) | 1–2 dependências = leve; ≥ 3 = grave |
| Lawton IADL (instrumentais) | Telefone, compras, preparo de alimentos, limpeza, transporte, medicamentos, finanças (0–8) | Perda isolada de 1–2 = alerta para início de declínio funcional |

**Fragilidade (Fenótipo de Fried — 5 critérios):**

| Critério | Como Medir | Ponto de Corte |
|---|---|---|
| Perda de peso não intencional | Autorrelato | > 4,5 kg ou > 5% do peso no último ano |
| Exaustão | Escala CES-D (questões 7 e 20) | Resposta positiva a "senti que tudo que fazia era um esforço" ou "não conseguia ir em frente" |
| Fraqueza muscular | Dinamometria (força de preensão palmar) | Homens: < 27 kg; Mulheres: < 16 kg (corte por quartil do IMC) |
| Lentidão da marcha | Velocidade de marcha (4 metros) | < 0,8 m/s OU tempo > 7 segundos |
| Baixo nível de atividade física | MLTA (Minnesota Leisure-Time Activity) | < 383 kcal/semana (H); < 270 kcal/semana (M) |

Interpretação: 0 critérios = robusto; 1–2 = pré-frágil; ≥ 3 = frágil. FRAIL Scale (alternativa mais rápida): Fatigue, Resistance, Aerobic, Illness, Loss of weight — 0=robusto, 1–2=pré-frágil, 3–5=frágil.

**Risco de queda:** Timed Up and Go (TUG) — levantar de cadeira sem usar os braços, caminhar 3m, retornar e sentar. Tempo > 12 segundos = risco aumentado de quedas. Teste de equilíbrio de Berg ≤ 45/56 pontos = alto risco.

**Humor:** GDS-15 (Geriatric Depression Scale — versão curta): ≥ 6 pontos = triagem positiva para depressão; confirmar com avaliação clínica.

---

### 2. Síndrome de Imobilidade — Complicações e Prevenção

A imobilidade prolongada em idosos desencadeia complicações multissistêmicas que aumentam mortalidade:

| Complicação | Mecanismo | Prevenção/Tratamento |
|---|---|---|
| TVP/TEP | Estase venosa + hipercoagulabilidade | Mobilização precoce; meias compressivas; HBPM se alto risco trombótico |
| Úlceras por pressão (LPP) | Isquemia local por pressão prolongada | Reposicionamento a cada 2h; superfície redutora de pressão; nutrição adequada |
| Pneumonia aspirativa | Disfagia + posição supina | Manter cabeceira 30–45°; fisioterapia respiratória; fonoaudiologia |
| Sarcopenia acelerada | Catabolismo proteico + desuso muscular | Exercício resistido progressivo + proteína 1,2–1,5 g/kg/dia |
| Obstipação | Redução do peristaltismo + desidratação | Hidratação 1,5–2L/dia; fibra; laxativos osmóticos; mobilização |

**Estadiamento de Lesões por Pressão (NPUAP/EPUAP):**

| Estágio | Descrição | Tecido Atingido |
|---|---|---|
| I | Eritema não branqueável em pele íntegra | Epiderme |
| II | Perda parcial da espessura da pele; flictena/úlcera rasa | Derme |
| III | Perda total da espessura; gordura subcutânea visível | Subcutâneo |
| IV | Perda total com exposição de músculo, osso ou tendão | Profundo |

---

### 3. Delirium — Critérios CAM, Subtipos e Protocolo HELP

**Critérios CAM (Confusion Assessment Method):** diagnóstico requer critérios 1 + 2 + (3 OU 4):

1. Início agudo com flutuação do estado mental ao longo do dia
2. Desatenção (dificuldade em focar, manter, desviar atenção — teste dos meses do ano ao contrário)
3. Pensamento desorganizado (raciocínio incoerente, fluxo ilógico de ideias)
4. Nível de consciência alterado (vigilante/agitado, letárgico/difícil de despertar, estupor)

| Subtipo | Características | Prognóstico |
|---|---|---|
| Hiperativo (25%) | Agitação, agressividade, alucinações, arrancamento de cateter | Mais facilmente reconhecido |
| Hipoativo (50%) | Letargia, bradilalia, recusa alimentar — frequentemente confundido com depressão | Pior prognóstico; maior mortalidade |
| Misto (25%) | Alternância entre hiperatividade e hipoatividade | — |

**Fatores precipitantes:** infecção (ITU, pneumonia), retenção urinária, impactação fecal, dor não tratada, privação de sono, privação sensorial (sem óculos/aparelho auditivo), hipóxia, distúrbios eletrolíticos, fármacos (benzodiazepínicos, anticolinérgicos, opioides, corticoides).

**Protocolo HELP (Hospital Elder Life Program):** orientação realidade 3x/dia, atividade cognitiva, mobilização precoce, higiene do sono (reduzir barulho noturno, evitar medicamentos sedativos), hidratação, adequação sensorial (óculos + aparelho auditivo). Reduz incidência de delirium em 33%.

Tratamento farmacológico: reservar para delirium hiperativo grave com risco de auto/heteroagressão. Haloperidol 0,5–1 mg EV/IM (idosos) — NÃO aprova pela FDA para demência; quetiapina 12,5–25 mg se parkinsonismo. BZD apenas em delirium por abstinência alcoólica ou privação de BZD.

---

### 4. Sarcopenia — Diagnóstico EWGSOP2 e Tratamento

**Algoritmo diagnóstico (EWGSOP2 2019):**
1. Triagem: SARC-F ≥ 4 pontos OU baixa velocidade de marcha
2. Confirmação: força de preensão palmar (homens < 27 kg; mulheres < 16 kg) OU teste de levantar da cadeira (< 5 repetições em 15 segundos)
3. Confirmação de baixa massa muscular: FEVE-TCS (composição corporal por tomografia) ou DXA (DEXA) — índice de massa muscular apendicular: homens < 7,0 kg/m2; mulheres < 5,5 kg/m2

| Estágio | Critério | Implicação Clínica |
|---|---|---|
| Pré-sarcopenia | Baixa massa apenas | Risco aumentado |
| Sarcopenia | Baixa massa + baixa força OU baixo desempenho | Diagnóstico estabelecido |
| Sarcopenia grave | Baixa massa + baixa força + baixo desempenho (velocidade marcha < 0,8 m/s) | Alto risco de incapacidade, hospitalização |

**Tratamento:** exercício resistido progressivo (2–3x/semana, 8–12 repetições, intensidade 60–80% 1RM) + proteína 1,2–1,5 g/kg/dia (whey protein ou suplemento proteico). Vitamina D 800–2000 UI/dia se deficiência (25-OH-D < 30 ng/mL). Creatina monoidratada 3–5 g/dia como adjuvante em estudos recentes.

---

### 5. Polifarmácia — Critérios de Beers 2023 e STOPP/START

**Definição:** uso concomitante de ≥ 5 medicamentos. Prevalência: 30–40% dos idosos na atenção primária. Consequências: reações adversas, interações, quedas, hospitalizações, não adesão.

**Medicamentos a EVITAR no idoso ≥ 65 anos (Beers 2023):**

| Classe | Exemplos | Risco Específico |
|---|---|---|
| Benzodiazepínicos (todos) | Diazepam, clonazepam, alprazolam | Quedas (RR 2,1x), delirium, dependência física, fraturas quadril |
| Anti-histamínicos 1a geração | Difenidramina, prometazina, hidroxizina | Potente anticolinérgico: delirium, retenção urinária, obstipação |
| AINEs (uso crônico) | Ibuprofeno, naproxeno, diclofenaco | Sangramento GI (3x), IRA, HAS, descompensação IC |
| Hipoglicemiantes de longa ação | Glibenclamida, glipizida de longa ação, insulina NPH sem ajuste | Hipoglicemia grave — risco aumentado por irregularidade alimentar |
| DOACs em alto risco de queda | Varfarina, rivaroxabana | Sangramento intracraniano pós-queda |
| Antipsicóticos sem indicação psiquiátrica | Quetiapina, haloperidol para "agitação" | AVC (OR 1,7), morte súbita, sedação excessiva |

**STOPP (critérios de PARAR):** regras para identificar medicamentos potencialmente inapropriados (ex: IECA + BRA concomitante — hipotensão/IRA; digoxina > 0,125 mg/dia em idoso com clearance < 50; opioide sem laxante).

**START (critérios de INICIAR):** medicamentos que DEVEM ser prescritos e frequentemente são omitidos (ex: estatina se DCV estabelecida; IECA se IC-FEr; bisfosfonato se osteoporose + corticoide crônico).

**Desprescrição:** processo estruturado de redução ou suspensão de medicamentos inapropriados, supervisado pelo médico, com monitoramento de sintomas de retirada e efetividade.

---

### 6. Populações Especiais — Idoso Institucionalizado (ILPI) e Multimorbidade

**ILPI (Instituição de Longa Permanência para Idosos):** prevalência de fragilidade > 80%; risco de úlceras por pressão, delirium e infecções relacionadas à assistência. Intervenções prioritárias: revisão de medicamentos trimestral, fisioterapia preventiva, programa de continência, nutrição.

**Idoso com multimorbidade (≥ 3 doenças crônicas):** considerar hierarquização de metas — preferir qualidade de vida e sintomas sobre metas numéricas estritas (ex: HbA1c 7–8% aceitável se risco hipoglicemia alto; PA 140/90 pode ser meta em ≥ 80 anos frágeis).

> Em idosos frágeis, a hipotensão ortostática (queda ≥ 20 mmHg sistólica ao levantar) é fator de risco independente para quedas e síncope — sempre medir PA deitado e em pé após 1 e 3 minutos.

---

### 7. Caso Clínico

**Cenário:** Mulher, 82 anos, vive sozinha, hipertensa, diabética tipo 2, com insônia crônica e artroses múltiplas. Trazida pela filha após 3 quedas nos últimos 2 meses (sem fraturas). Faz uso de: enalapril 20 mg/dia, metformina 500 mg 2x/dia, diazepam 10 mg/noite, ibuprofeno 600 mg 3x/dia, amitriptilina 25 mg/noite, omeprazol 20 mg/dia, atorvastatina 40 mg/noite, losartana 50 mg/dia, glibenclamida 5 mg/dia. Total: 9 medicamentos.

**Avaliação AGA:**
- MEEM: 22/30 (escolaridade 4 anos — abaixo do corte de 26; CCL ou demência inicial)
- TUG: 17 segundos (normal < 12s) — alto risco de quedas
- Katz ADL: dependente em banho e transferência (dependência em 2 AVDs)
- Força preensão: 13 kg (< 16 kg — critério sarcopenia)
- FRAIL Scale: 4/5 (frágil)

**Problemas identificados:**
1. Diazepam: Beers 2023 — quedas, delirium. Desprescrever gradualmente (reduzir 25% a cada 2 semanas); substituir por melatonina 1–3 mg ou TCC para insônia
2. Ibuprofeno: Beers 2023 — IRA, sangramento GI, HAS. Substituir por paracetamol 500 mg 3x/dia; capsaicina tópica para artrose
3. Glibenclamida: Beers 2023 — hipoglicemia grave. Substituir por glipizida de ação curta ou gliquidona
4. Amitriptilina: potente anticolinérgico — delirium, retenção, taquicardia. Substituir por mirtazapina 7,5 mg se necessário antidepressivo
5. Duplo bloqueio SRAA (enalapril + losartana): STOPP — hipotensão, IRA, hipercalemia. Manter apenas um (preferencialmente IECA)
6. Exercício resistido + fisioterapia de equilíbrio 3x/semana para sarcopenia e prevenção de quedas
7. Revisão do ambiente domiciliar: retirar tapetes, instalar barras de apoio no banheiro`, ativo: true,
    },
  ]

  const aulas = await Promise.all(aulasData.map((a) => db.aula.create({ data: a })))
  console.log('✅ Aulas criadas:', aulas.length)

  // ── PROVAS (4) ───────────────────────────────────────────────────────────────
  const provaENARE = await db.prova.create({
    data: {
      nome: 'ENARE 2025',
      tipo: 'ENARE',
      subtipo: 'completa',
      ano: 2025,
      descricao: 'Exame Nacional de Residência 2025 — Simulado completo multidisciplinar.',
      tempoPrevisto: 240,
      dificuldade: 'dificil',
      ativo: true,
    },
  })

  const provaCajuru = await db.prova.create({
    data: {
      nome: 'CAJURU 2024',
      tipo: 'CAJURU',
      subtipo: 'completa',
      ano: 2024,
      descricao: 'Hospital Cajuru de Curitiba — Clínica Médica e Cirurgia.',
      tempoPrevisto: 180,
      dificuldade: 'medio',
      ativo: true,
    },
  })

  const provaSimulado = await db.prova.create({
    data: {
      nome: 'Simulado Clínica Médica',
      tipo: 'SIMULADO',
      subtipo: 'tematica',
      disciplina: 'Clínica Médica',
      descricao: 'Simulado temático de Clínica Médica com foco em cardiologia e endocrinologia.',
      tempoPrevisto: 60,
      dificuldade: 'medio',
      ativo: true,
    },
  })

  const provaRapido = await db.prova.create({
    data: {
      nome: 'Teste Rápido: Emergências',
      tipo: 'TEMATICA',
      subtipo: 'resumida',
      descricao: 'Quiz rápido de condutas em emergências médicas e cirúrgicas.',
      tempoPrevisto: 30,
      dificuldade: 'dificil',
      ativo: true,
    },
  })

  console.log('✅ Provas criadas')

  // ── QUESTÕES (80 total, 20 por prova) ────────────────────────────────────────
  const questoesENARE = [
    {
      enunciado: 'Paciente de 58 anos, hipertensa, PA = 165/105 mmHg em duas medidas. Qual o tratamento de primeira linha segundo as diretrizes brasileiras?',
      opcaoA: 'Furosemida isolada', opcaoB: 'Anlodipino ou enalapril', opcaoC: 'Propranolol isolado',
      opcaoD: 'Hidroclorotiazida em dose máxima', opcaoE: 'Espironolactona 100mg',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'medio',
      explicacao: 'Primeira linha: IECA/BRA, bloqueadores de canal de cálcio ou tiazídicos. Anlodipino e enalapril são opções de alta eficácia e boa tolerância.', ordem: 1,
    },
    {
      enunciado: 'Qual o critério diagnóstico de DM2 pela glicemia de jejum?',
      opcaoA: '≥ 100 mg/dL em 2 ocasiões', opcaoB: '≥ 110 mg/dL em 2 ocasiões', opcaoC: '≥ 126 mg/dL em 2 ocasiões',
      opcaoD: '≥ 140 mg/dL em 2 ocasiões', opcaoE: '≥ 200 mg/dL em 1 ocasião com sintomas',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Endocrinologia', dificuldade: 'facil',
      explicacao: 'Glicemia de jejum ≥ 126 mg/dL em duas ocasiões distintas, ou combinado com outro critério. A opção E também está correta mas descreve cenário diferente.', ordem: 2,
    },
    {
      enunciado: 'Paciente de 25 anos, gestante 30 semanas, PA = 150/100 mmHg e proteinúria de 400mg/24h. Diagnóstico?',
      opcaoA: 'Hipertensão gestacional', opcaoB: 'Pré-eclâmpsia', opcaoC: 'Eclâmpsia',
      opcaoD: 'Síndrome HELLP', opcaoE: 'Hipertensão crônica',
      gabarito: 'B', disciplina: 'Ginecologia', tema: 'Obstetrícia', dificuldade: 'medio',
      explicacao: 'Pré-eclâmpsia = HAS após 20 semanas + proteinúria > 300mg/24h. Eclâmpsia adiciona convulsões. HELLP requer hemólise + enzimas + plaquetopenia.', ordem: 3,
    },
    {
      enunciado: 'Lactente de 4 meses, tosse, sibilância após 3 dias de coriza. FR 58, Sat 92%. Diagnóstico mais provável?',
      opcaoA: 'Pneumonia bacteriana', opcaoB: 'Asma aguda', opcaoC: 'Bronquiolite viral aguda',
      opcaoD: 'Laringite aguda', opcaoE: 'Coqueluche',
      gabarito: 'C', disciplina: 'Pediatria', tema: 'Pneumologia Pediátrica', dificuldade: 'medio',
      explicacao: 'Bronquiolite: lactente < 2 anos, IVAS evoluindo para sibilância. Principal agente: VSR. Taquipneia e queda de saturação são sinais de gravidade.', ordem: 4,
    },
    {
      enunciado: 'Qual princípio do SUS garante atenção em todos os níveis de assistência?',
      opcaoA: 'Universalidade', opcaoB: 'Equidade', opcaoC: 'Integralidade',
      opcaoD: 'Descentralização', opcaoE: 'Hierarquização',
      gabarito: 'C', disciplina: 'Saúde Pública', tema: 'SUS', dificuldade: 'facil',
      explicacao: 'Integralidade: atenção em todos os níveis (primário, secundário e terciário), abrangendo promoção, proteção, recuperação e reabilitação.', ordem: 5,
    },
    {
      enunciado: 'Homem de 45 anos com dor torácica opressiva há 2h, sudorese fria. ECG: supradesnivelamento de ST em V1-V4. Conduta imediata?',
      opcaoA: 'Metoprolol IV + heparina não fracionada', opcaoB: 'AAS + clopidogrel + trombolítico ou cateterismo urgente',
      opcaoC: 'Morfina + furosemida IV', opcaoD: 'Aguardar enzimas cardíacas', opcaoE: 'Ecocardiograma de urgência',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'dificil',
      explicacao: 'IAM com supra de ST: antiagregação dupla (AAS + P2Y12) + reperfusão urgente (trombolítico se > 2h do cateterismo, ou ICP primária preferencial em até 90min da chegada).', ordem: 6,
    },
    {
      enunciado: 'Paciente com IC sistólica (FE 30%), NYHA III, em uso de enalapril e furosemida. O que deve ser ACRESCENTADO para reduzir mortalidade?',
      opcaoA: 'Digoxina 0,25mg/dia', opcaoB: 'Amlodipina 5mg/dia', opcaoC: 'Carvedilol 3,125mg 2x/dia',
      opcaoD: 'Hidralazina + nitrato', opcaoE: 'Espironolactona 100mg/dia',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'dificil',
      explicacao: 'Na IC-FEr, betabloqueadores (carvedilol, bisoprolol, metoprolol XL) reduzem mortalidade em ~35%. Espironolactona seria adicionada se FE ≤ 35% e NYHA II-IV, mas o betabloqueador tem prioridade aqui.', ordem: 7,
    },
    {
      enunciado: 'Qual o escore utilizado para estratificação de gravidade da Pneumonia Adquirida na Comunidade e decisão de internação?',
      opcaoA: 'APACHE II', opcaoB: 'SOFA', opcaoC: 'CURB-65',
      opcaoD: 'Ranson', opcaoE: 'GRACE',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Pneumologia', dificuldade: 'medio',
      explicacao: 'CURB-65: Confusão, Ureia > 42, FR ≥ 30, PA < 90/60, idade ≥ 65. 0-1: ambulatorial; 2: internação; ≥ 3: UTI. PSI/PORT também é aceito.', ordem: 8,
    },
    {
      enunciado: 'Estágio de DRC com TFG entre 30-44 mL/min/1,73m²?',
      opcaoA: 'G1', opcaoB: 'G2', opcaoC: 'G3a',
      opcaoD: 'G3b', opcaoE: 'G4',
      gabarito: 'D', disciplina: 'Clínica Médica', tema: 'Nefrologia', dificuldade: 'medio',
      explicacao: 'Estadiamento KDIGO: G1 ≥ 90, G2 60-89, G3a 45-59, G3b 30-44, G4 15-29, G5 < 15 mL/min/1,73m².', ordem: 9,
    },
    {
      enunciado: 'Paciente de 70 anos, afasia súbita + hemiplegia D. TC de crânio sem alterações. Janela para tPA IV?',
      opcaoA: '2 horas', opcaoB: '3 horas (pode estender até 4,5h em selecionados)', opcaoC: '6 horas',
      opcaoD: '12 horas', opcaoE: '24 horas',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Neurologia', dificuldade: 'dificil',
      explicacao: 'Janela padrão para tPA IV: 3h do início dos sintomas. Pode ser estendida até 4,5h em pacientes selecionados (sem anticoagulação, < 80 anos, NIHSS < 25, sem AVC prévio + DM). TC sem contraindicações.', ordem: 10,
    },
    {
      enunciado: 'Sepse-3: qual a definição de choque séptico?',
      opcaoA: 'Infecção + SIRS ≥ 2 critérios', opcaoB: 'Sepse + PAM < 65 mmHg responsiva a fluidos',
      opcaoC: 'Sepse + PAM < 65 mmHg refratária a fluidos + lactato > 2 mmol/L',
      opcaoD: 'Sepse + disfunção orgânica + vasopressor', opcaoE: 'SOFA score ≥ 4',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'UTI', dificuldade: 'dificil',
      explicacao: 'Sepsis-3: choque séptico = sepse + hipotensão refratária a reposição volêmica (necessita vasopressor para PAM ≥ 65) + lactato > 2 mmol/L. Mortalidade hospitalar > 40%.', ordem: 11,
    },
    {
      enunciado: 'Fármaco de primeira escolha para tratamento da hipertireoidismo de Graves durante a gestação?',
      opcaoA: 'Metimazol no 1º trimestre', opcaoB: 'Propiltiouracil (PTU) no 1º trimestre, metimazol nos 2º e 3º',
      opcaoC: 'Iodo radioativo', opcaoD: 'Propranolol monoterapia', opcaoE: 'Cirurgia imediata',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Endocrinologia', dificuldade: 'dificil',
      explicacao: 'PTU no 1º trimestre (metimazol tem risco de aplasia cutis). Trocar para metimazol no 2º e 3º trimestres (PTU tem hepatotoxicidade). Iodo radioativo é contraindicado na gestação.', ordem: 12,
    },
    {
      enunciado: 'Marcador diagnóstico mais sensível de infarto agudo do miocárdio nas primeiras 3 horas?',
      opcaoA: 'CK-MB massa', opcaoB: 'Troponina I convencional', opcaoC: 'Troponina T ultrassensível',
      opcaoD: 'Mioglobina', opcaoE: 'LDH',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'medio',
      explicacao: 'Troponina ultrassensível (hs-TnT/hs-TnI) permite rule-out/rule-in em 0-1h ou 0-2h. Mioglobina sobe mais cedo mas não é específica. Troponina convencional detecção ≥ 3-4h.', ordem: 13,
    },
    {
      enunciado: 'Mulher de 32 anos com febre, poliartralgia, rash malar e ANA 1:320. Qual o critério diagnóstico mais específico para LES?',
      opcaoA: 'ANA positivo', opcaoB: 'Anti-Sm positivo', opcaoC: 'Anti-DNA ds positivo',
      opcaoD: 'Anemia hemolítica', opcaoE: 'Artrite não erosiva',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Reumatologia', dificuldade: 'dificil',
      explicacao: 'Anti-Sm é o mais ESPECÍFICO para LES (~25% sensibilidade, >99% especificidade). Anti-DNA ds é específico e se correlaciona com atividade/nefrite. ANA é sensível mas não específico.', ordem: 14,
    },
    {
      enunciado: 'Fármaco que causa hiperpotassemia e deve ser evitado em DRC estágio G4-G5?',
      opcaoA: 'Furosemida', opcaoB: 'Anlodipino', opcaoC: 'Espironolactona',
      opcaoD: 'Hidroclorotiazida', opcaoE: 'Atenolol',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Nefrologia', dificuldade: 'medio',
      explicacao: 'Espironolactona (antagonista da aldosterona) retém potássio. Em DRC avançada, já há hiperpotassemia. Usar com cautela; preferir eplerenona ou evitar. IECA/BRA também requerem monitorização do K+.', ordem: 15,
    },
    {
      enunciado: 'Qual a causa mais comum de cirrose hepática no Brasil?',
      opcaoA: 'Hepatite autoimune', opcaoB: 'Hepatite C', opcaoC: 'Álcool + DHGNA',
      opcaoD: 'Hepatite B', opcaoE: 'Colangite biliar primária',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Gastroenterologia', dificuldade: 'facil',
      explicacao: 'No Brasil, álcool e doença hepática gordurosa não alcoólica (DHGNA/NASH) são as causas mais prevalentes de cirrose. Hepatite C era a segunda causa antes do tratamento com antivirais de ação direta.', ordem: 16,
    },
    {
      enunciado: 'Paciente com TB pulmonar confirmada. Qual esquema de tratamento deve ser iniciado?',
      opcaoA: 'Isoniazida + Rifampicina por 6 meses', opcaoB: 'RIPE (Rifampicina + Isoniazida + Pirazinamida + Etambutol) 2 meses + RI 4 meses',
      opcaoC: 'Claritromicina + Etambutol por 12 meses', opcaoD: 'Levofloxacino por 6 meses', opcaoE: 'RIPE por 9 meses',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Pneumologia', dificuldade: 'facil',
      explicacao: 'Esquema básico TB (MS Brasil): RIPE por 2 meses (fase intensiva) + Rifampicina + Isoniazida por 4 meses (fase de manutenção) = 6 meses total. Adulto: RH150/75+Z400+E275 em dose fixa combinada.', ordem: 17,
    },
    {
      enunciado: 'Método contraceptivo mais eficaz disponível no SUS com menor taxa de falha?',
      opcaoA: 'Preservativo masculino', opcaoB: 'Pílula combinada', opcaoC: 'Dispositivo intrauterino de cobre (DIU)',
      opcaoD: 'Implante subdérmico de etonogestrel', opcaoE: 'Injeção mensal',
      gabarito: 'D', disciplina: 'Ginecologia', tema: 'Ginecologia Geral', dificuldade: 'medio',
      explicacao: 'Implante subdérmico: eficácia > 99,9% (< 1 falha/1000 mulheres/ano). DIU de cobre: >99%. Ambos são de longa duração. A pílula, quando usada perfeitamente, tem 99,7% mas com uso típico cai para 91%.', ordem: 18,
    },
    {
      enunciado: 'Recém-nascido com icterícia nas primeiras 24 horas de vida. Principal causa?',
      opcaoA: 'Icterícia fisiológica', opcaoB: 'Incompatibilidade ABO', opcaoC: 'Atresia biliar',
      opcaoD: 'Hepatite neonatal', opcaoE: 'Hipotireoidismo congênito',
      gabarito: 'B', disciplina: 'Pediatria', tema: 'Neonatologia', dificuldade: 'medio',
      explicacao: 'Icterícia < 24h é SEMPRE patológica. Principal causa: incompatibilidade Rh ou ABO (hemólise). Icterícia fisiológica aparece após 24-48h. Diagnóstico: Coombs direto, hematócrito, reticulócitos.', ordem: 19,
    },
    {
      enunciado: 'Qual a imunização recomendada para o RN cuja mãe é HBsAg positivo, além da vacina hepatite B ao nascer?',
      opcaoA: 'Nada além da vacina', opcaoB: 'Imunoglobulina anti-hepatite B (HBIG) nas primeiras 12h',
      opcaoC: 'HBIG + vacina em locais diferentes', opcaoD: 'Vacina hepatite B + antiviral',
      opcaoE: 'HBIG nas primeiras 72h',
      gabarito: 'C', disciplina: 'Pediatria', tema: 'Imunização', dificuldade: 'dificil',
      explicacao: 'RN de mãe HBsAg+: vacina hepatite B + HBIG (imunoglobulina específica) nas primeiras 12h de vida, em locais diferentes. Reduz transmissão vertical para < 5%. Vacina sozinha é insuficiente.', ordem: 20,
    },
  ]

  const questoesCajuru = [
    {
      enunciado: 'Politraumatizado, inconsciente. Na avaliação primária ATLS, primeira prioridade?',
      opcaoA: 'Circulação', opcaoB: 'Via aérea com proteção cervical', opcaoC: 'Glasgow',
      opcaoD: 'Exposição', opcaoE: 'Ventilação',
      gabarito: 'B', disciplina: 'Cirurgia', tema: 'Trauma', dificuldade: 'medio',
      explicacao: 'ATLS: ABCDE. Airway sempre primeiro — via aérea não pérvia é imediatamente fatal. Imobilização cervical simultânea.', ordem: 1,
    },
    {
      enunciado: 'Classe de choque hemorrágico com perda de 30-40% da volemia, requerendo hemoderivados?',
      opcaoA: 'Classe I', opcaoB: 'Classe II', opcaoC: 'Classe III',
      opcaoD: 'Classe IV', opcaoE: 'Classe V',
      gabarito: 'C', disciplina: 'Cirurgia', tema: 'Trauma', dificuldade: 'medio',
      explicacao: 'Classe III: 1500-2000mL (30-40%). Requer cristaloides + hemoderivados. Classe IV (> 40%): risco de vida, cirurgia de controle de dano.', ordem: 2,
    },
    {
      enunciado: 'Tratamento de escolha para bronquiolite viral aguda com saturação 92%?',
      opcaoA: 'Amoxicilina 50mg/kg/dia', opcaoB: 'Prednisolona 1mg/kg/dia', opcaoC: 'Salbutamol contínuo',
      opcaoD: 'Oxigenioterapia e hidratação', opcaoE: 'Adrenalina + corticoide',
      gabarito: 'D', disciplina: 'Pediatria', tema: 'Pneumologia Pediátrica', dificuldade: 'medio',
      explicacao: 'Bronquiolite: tratamento é de SUPORTE — oxigênio (Sat < 95%), hidratação e posicionamento. Antibióticos, corticoides e broncodilatadores não recomendados rotineiramente.', ordem: 3,
    },
    {
      enunciado: 'Gestante 32 sem, PA = 170/115, cefaleia intensa e escotomas. Conduta imediata?',
      opcaoA: 'Observação 24h', opcaoB: 'MgSO4 + anti-hipertensivo + avaliação para interrupção',
      opcaoC: 'Anti-hipertensivo oral ambulatorial', opcaoD: 'Cesárea imediata', opcaoE: 'Repouso e retorno 48h',
      gabarito: 'B', disciplina: 'Ginecologia', tema: 'Obstetrícia', dificuldade: 'dificil',
      explicacao: 'PE grave com iminência de eclâmpsia: MgSO4 IV (prevenção de convulsões) + anti-hipertensivo IV (hidralazina ou nifedipina) + avaliação materno-fetal para interrupção da gestação.', ordem: 4,
    },
    {
      enunciado: 'Lei que regula as condições para promoção, proteção e recuperação da saúde no Brasil?',
      opcaoA: 'Lei 8.142/1990', opcaoB: 'Lei 8.080/1990', opcaoC: 'Lei 9.394/1996',
      opcaoD: 'EC 29/2000', opcaoE: 'CF Art. 196',
      gabarito: 'B', disciplina: 'Saúde Pública', tema: 'SUS', dificuldade: 'medio',
      explicacao: 'Lei 8.080/1990 (Lei Orgânica da Saúde): organização e funcionamento do SUS. Lei 8.142/1990: controle social e transferências financeiras.', ordem: 5,
    },
    {
      enunciado: 'Homem de 35 anos, acidente de moto, fratura exposta de fêmur. FC 130, PA 85/60, extremidades frias, estado mental alterado. Classe de choque?',
      opcaoA: 'Classe I', opcaoB: 'Classe II', opcaoC: 'Classe III',
      opcaoD: 'Classe IV', opcaoE: 'Não é choque hemorrágico',
      gabarito: 'D', disciplina: 'Cirurgia', tema: 'Trauma', dificuldade: 'dificil',
      explicacao: 'Classe IV: PA < 90, FC > 120, confusão mental, extremidades frias. Perda > 40% volemia. Risco de vida, exige cirurgia de controle de dano e transfusão maciça.', ordem: 6,
    },
    {
      enunciado: 'Paciente com apendicite aguda confirmada. Qual o antibiótico profilático de escolha?',
      opcaoA: 'Vancomicina', opcaoB: 'Cefazolina + Metronidazol', opcaoC: 'Amoxicilina + Clavulanato',
      opcaoD: 'Ciprofloxacino monoterapia', opcaoE: 'Penicilina G cristalina',
      gabarito: 'B', disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', dificuldade: 'medio',
      explicacao: 'Profilaxia cirúrgica para cirurgia do cólon/abdome: cefazolina (gram+) + metronidazol (anaeróbios). Administrar 30-60 min antes da incisão.', ordem: 7,
    },
    {
      enunciado: 'Escore de Glasgow com abertura ocular ao estímulo verbal (3), resposta verbal confusa (4) e resposta motora flexão (3). Total?',
      opcaoA: '8', opcaoB: '9', opcaoC: '10',
      opcaoD: '11', opcaoE: '7',
      gabarito: 'C', disciplina: 'Cirurgia', tema: 'Trauma', dificuldade: 'facil',
      explicacao: 'Glasgow = Ocular (3) + Verbal (4) + Motor (3) = 10. TCE grave < 9, moderado 9-12, leve 13-15. Flexão motora (postura de decorticação) = 3 pontos.', ordem: 8,
    },
    {
      enunciado: 'Critério de Ranson no 1º dia indicando pancreatite grave?',
      opcaoA: 'Idade > 55 anos', opcaoB: 'Leucócitos > 16.000 + glicose > 200 + LDH elevado',
      opcaoC: 'Amilase > 1000', opcaoD: 'Lipase 3x normal', opcaoE: 'PCR > 150',
      gabarito: 'B', disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', dificuldade: 'dificil',
      explicacao: 'Critérios de Ranson na admissão: Idade > 55, GB > 16.000, Glicose > 200, LDH > 350, AST > 250. ≥ 3 critérios = pancreatite grave. Os critérios de 48h avaliam evolução.', ordem: 9,
    },
    {
      enunciado: 'Paciente com hérnia inguinal encarcerada há 6h. Conduta?',
      opcaoA: 'Tentativa de redução manual e observação', opcaoB: 'Cirurgia de urgência',
      opcaoC: 'Antibióticos IV e reavaliação', opcaoD: 'TC de abdome antes de qualquer conduta',
      opcaoE: 'Redução manual + cirurgia eletiva em 4-6 semanas',
      gabarito: 'B', disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', dificuldade: 'dificil',
      explicacao: 'Hérnia encarcerada (irredutível) sem isquemia: pode tentar redução manual. Com sinais de isquemia/estrangulamento ou falha da redução: cirurgia de urgência para evitar necrose intestinal.', ordem: 10,
    },
    {
      enunciado: 'Queimadura de 2º grau profunda em membro superior de 9% SCQ em adulto de 70kg. Volume de Parkland nas primeiras 8h?',
      opcaoA: '630mL', opcaoB: '1260mL', opcaoC: '2520mL',
      opcaoD: '1890mL', opcaoE: '3150mL',
      gabarito: 'B', disciplina: 'Cirurgia', tema: 'Trauma', dificuldade: 'dificil',
      explicacao: 'Parkland: 4mL × kg × % SCQ = 4 × 70 × 9 = 2520mL em 24h. Metade nas primeiras 8h = 1260mL. Metade nas 16h seguintes = 1260mL. Ringer lactato, excluir face e genitais do cálculo.', ordem: 11,
    },
    {
      enunciado: 'Principal rastreamento para câncer colorretal em paciente de 50 anos sem fatores de risco?',
      opcaoA: 'Pesquisa de sangue oculto nas fezes anual', opcaoB: 'Colonoscopia a cada 5 anos',
      opcaoC: 'Colonoscopia a cada 10 anos ou pesquisa de sangue oculto anual',
      opcaoD: 'TC colonografia a cada 5 anos', opcaoE: 'Retossigmoidoscopia a cada 5 anos',
      gabarito: 'C', disciplina: 'Cirurgia', tema: 'Oncologia Cirúrgica', dificuldade: 'medio',
      explicacao: 'Rastreamento CCR (risco médio): colonoscopia a cada 10 anos a partir dos 50 anos (ou 45 pelo ACS), ou pesquisa de sangue oculto de alta sensibilidade anual. Início mais precoce em risco elevado (história familiar, PAF, HNPCC).', ordem: 12,
    },
    {
      enunciado: 'Recém-nascido a termo com APGAR 3 no 1º minuto. Conduta imediata na sala de parto?',
      opcaoA: 'Massagem cardíaca imediata', opcaoB: 'Intubação orotraqueal', opcaoC: 'Reanimação: estabilizar + VPP com máscara',
      opcaoD: 'Adrenalina IV umbilical', opcaoE: 'Apenas aspiração de vias aéreas',
      gabarito: 'C', disciplina: 'Pediatria', tema: 'Neonatologia', dificuldade: 'dificil',
      explicacao: 'APGAR 3 (0-3 = muito deprimido): iniciar VPP com máscara. Se FC < 60 após 30s de VPP adequado: IOT + massagem cardíaca. APGAR orienta mas não define a conduta — a FC é o principal indicador de reanimação.', ordem: 13,
    },
    {
      enunciado: 'Criança de 2 anos com febre há 5 dias, exantema polimorfo, conjuntivite bilateral, língua em framboesa e eritema das palmas. Diagnóstico?',
      opcaoA: 'Escarlatina', opcaoB: 'Sarampo', opcaoC: 'Doença de Kawasaki',
      opcaoD: 'Síndrome de Stevens-Johnson', opcaoE: 'Dengue',
      gabarito: 'C', disciplina: 'Pediatria', tema: 'Infectologia Pediátrica', dificuldade: 'medio',
      explicacao: 'Kawasaki: febre ≥ 5 dias + ≥ 4 critérios (conjuntivite, alterações labiais/língua, exantema, eritema palmoplantar, linfonodomegalia cervical). Risco: aneurisma de artérias coronárias. Tratamento: IVIG + AAS.', ordem: 14,
    },
    {
      enunciado: 'Critério para rastreamento de câncer de colo de útero pelo Ministério da Saúde?',
      opcaoA: 'Inicio na menarca', opcaoB: 'A partir dos 21 anos, independente da atividade sexual',
      opcaoC: 'A partir dos 25 anos com vida sexual ativa',
      opcaoD: 'A partir dos 30 anos', opcaoE: 'Anual de 18 aos 65 anos',
      gabarito: 'C', disciplina: 'Ginecologia', tema: 'Oncologia Ginecológica', dificuldade: 'medio',
      explicacao: 'MS Brasil: rastreamento com Papanicolaou a partir dos 25 anos em mulheres com vida sexual ativa. A cada 3 anos após 2 resultados negativos. Encerrar aos 64 anos com exames adequados.', ordem: 15,
    },
    {
      enunciado: 'Qual é a conduta para eclâmpsia em gestante de 36 semanas após as medidas iniciais?',
      opcaoA: 'Manutenção da gestação com controle rigoroso', opcaoB: 'Parto (cesárea ou indução) após estabilização',
      opcaoC: 'Aguardar 37 semanas', opcaoD: 'Apenas MgSO4 e reavaliação em 48h',
      opcaoE: 'Diazepam como anticonvulsivante de escolha',
      gabarito: 'B', disciplina: 'Ginecologia', tema: 'Obstetrícia', dificuldade: 'dificil',
      explicacao: 'Eclâmpsia: estabilizar (MgSO4 + anti-hipertensivo), depois interromper a gestação. Com 36 semanas, o risco de prematuridade é baixo e o benefício de interrupção é alto. Diazepam é inferior ao MgSO4.', ordem: 16,
    },
    {
      enunciado: 'Qual o método de diagnóstico padrão-ouro para apendicite aguda?',
      opcaoA: 'Laparotomia exploradora', opcaoB: 'TC de abdome com contraste', opcaoC: 'Ultrassonografia de abdome',
      opcaoD: 'Clínico-laboratorial (Alvarado ≥ 7)', opcaoE: 'Laparoscopia diagnóstica',
      gabarito: 'B', disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', dificuldade: 'medio',
      explicacao: 'TC abdome com contraste: padrão-ouro para apendicite — sensibilidade 94-98%, especificidade 95-99%. US é 1ª opção em crianças e gestantes (sem radiação). Clínico + Alvarado orienta, mas TC confirma.', ordem: 17,
    },
    {
      enunciado: 'Qual nutriente deve ser suplementado para prevenção de defeitos do tubo neural durante a gestação?',
      opcaoA: 'Vitamina D 2000UI/dia', opcaoB: 'Ácido fólico 0,4-4mg/dia idealmente pré-concepcional',
      opcaoC: 'Ferro 60mg/dia', opcaoD: 'Cálcio 1200mg/dia', opcaoE: 'Vitamina B12 1mg/dia',
      gabarito: 'B', disciplina: 'Ginecologia', tema: 'Obstetrícia', dificuldade: 'facil',
      explicacao: 'Ácido fólico: dose 0,4-0,8mg/dia para risco usual, 4mg para risco elevado (história prévia de DTN, antiepilépticos). Iniciar pelo menos 1 mês antes da concepção e manter até 12 semanas de gestação.', ordem: 18,
    },
    {
      enunciado: 'Estratégia de Saúde da Família: número máximo recomendado de pessoas por equipe?',
      opcaoA: '1.000 pessoas', opcaoB: '2.000 pessoas', opcaoC: '3.000 pessoas (até 4.000 em áreas urbanas)',
      opcaoD: '5.000 pessoas', opcaoE: '6.000 pessoas',
      gabarito: 'C', disciplina: 'Saúde Pública', tema: 'Atenção Primária', dificuldade: 'medio',
      explicacao: 'PNAB: cada equipe de SF é responsável por 2.000-3.500 pessoas (máximo 4.000 em situações especiais). Cada equipe: médico, enfermeiro, auxiliar/técnico de enfermagem e ACS.', ordem: 19,
    },
    {
      enunciado: 'Definição epidemiológica de surto?',
      opcaoA: 'Qualquer caso de doença infectocontagiosa', opcaoB: 'Ocorrência de 2 ou mais casos relacionados no tempo e espaço além do esperado',
      opcaoC: 'Epidemia de âmbito nacional', opcaoD: 'Pandemia em > 3 continentes',
      opcaoE: 'Incremento de casos acima de 2 desvios padrão da média',
      gabarito: 'B', disciplina: 'Saúde Pública', tema: 'Epidemiologia', dificuldade: 'medio',
      explicacao: 'Surto: ocorrência de casos de uma doença em número maior que o esperado, num mesmo lugar e período, com vínculo epidemiológico. Diferente de epidemia (área maior) e endemia (ocorrência habitual).', ordem: 20,
    },
  ]

  const questoesSimulado = [
    {
      enunciado: 'Paciente de 62 anos, tabagista, com tosse produtiva há 3 meses, dispneia ao esforço moderado e VEF1/CVF = 0,65 pós-broncodilatador. Estadiamento GOLD?',
      opcaoA: 'GOLD 1 — Leve', opcaoB: 'GOLD 2 — Moderado', opcaoC: 'GOLD 3 — Grave',
      opcaoD: 'GOLD 4 — Muito grave', opcaoE: 'Não é DPOC',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Pneumologia', dificuldade: 'dificil',
      explicacao: 'DPOC confirmado: VEF1/CVF < 0,70 pós-BD. Estadiamento GOLD pelo VEF1 (% predito): GOLD 1 ≥ 80%, GOLD 2 50-79%, GOLD 3 30-49%, GOLD 4 < 30%. VEF1/CVF = 0,65 confirma obstrução; VEF1% predito define o grau.', ordem: 1,
    },
    {
      enunciado: 'Mulher de 45 anos com polidipsia, poliúria, constipação e nefrolitíase. Cálcio sérico 12 mg/dL, PTH elevado. Diagnóstico?',
      opcaoA: 'Hipercalcemia maligna (metástases ósseas)', opcaoB: 'Hiperparatireoidismo primário',
      opcaoC: 'Sarcoidose', opcaoD: 'Intoxicação por vitamina D', opcaoE: 'Síndrome de leite-álcali',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Endocrinologia', dificuldade: 'dificil',
      explicacao: 'HPP: hipercalcemia + PTH elevado (ou inapropriadamente normal). Causa mais comum de hipercalcemia em ambulatório. Sintomas: "bones, stones, groans, psychic moans". Tratamento: paratireoidectomia.', ordem: 2,
    },
    {
      enunciado: 'Paciente com FA de início < 48h. Qual a conduta em relação à anticoagulação para cardioversão?',
      opcaoA: 'Anticoagular por 4 semanas antes da cardioversão', opcaoB: 'Cardioversão imediata sem anticoagulação',
      opcaoC: 'Anticoagular na dose plena e cardioverter sem esperar', opcaoD: 'ETE para excluir trombo, depois cardioverter + anticoagular 4 semanas',
      opcaoE: 'Cardioverter e anticoagular apenas se CHA2DS2-VASc ≥ 2',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'dificil',
      explicacao: 'FA < 48h: risco de trombo baixo — anticoagular na dose terapêutica e cardioverter sem esperar 3 semanas. Manter anticoagulação por pelo menos 4 semanas pós-cardioversão (risco de "atordoamento atrial"). ETE é opção em FA > 48h.', ordem: 3,
    },
    {
      enunciado: 'Homem de 55 anos com úlcera gástrica e H. pylori positivo. Qual o esquema de erradicação de primeira linha?',
      opcaoA: 'Amoxicilina + Claritromicina 7 dias', opcaoB: 'IBP + Amoxicilina + Claritromicina 14 dias (terapia tríplice)',
      opcaoC: 'IBP + Bismuto + Metronidazol + Tetraciclina 14 dias', opcaoD: 'Apenas IBP por 8 semanas',
      opcaoE: 'Metronidazol + Claritromicina 10 dias',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Gastroenterologia', dificuldade: 'medio',
      explicacao: 'Primeira linha: IBP 2x/dia + Amoxicilina 1g 2x/dia + Claritromicina 500mg 2x/dia por 14 dias (terapia tríplice). Taxa de erradicação ~80%. Onde resistência à claritromicina é alta, preferir quadriterapia com bismuto.', ordem: 4,
    },
    {
      enunciado: 'Qual a meta de HbA1c em idoso frágil de 80 anos com DM2, múltiplas comorbidades e hipoglicemias frequentes?',
      opcaoA: '< 6,5%', opcaoB: '< 7,0%', opcaoC: '< 7,5%',
      opcaoD: '< 8,0-8,5% (meta menos estrita)', opcaoE: 'Não há meta definida',
      gabarito: 'D', disciplina: 'Clínica Médica', tema: 'Endocrinologia', dificuldade: 'medio',
      explicacao: 'Metas devem ser individualizadas. Idoso frágil, história de hipoglicemia, pouca expectativa de vida: meta menos estrita (HbA1c < 8-8,5%) para evitar hipoglicemia grave. ADA/SBD recomendam personalização.', ordem: 5,
    },
    {
      enunciado: 'Paciente com síndrome nefrótica: proteinúria > 3,5g/dia, albumina 2,1 g/dL, edema e hiperlipidemia. Causa mais comum em adultos?',
      opcaoA: 'Nefropatia por IgA', opcaoB: 'Glomeruloesclerose segmentar e focal (GESF)',
      opcaoC: 'Nefropatia membranosa', opcaoD: 'Doença de lesão mínima', opcaoE: 'Glomerulonefrite membranoproliferativa',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Nefrologia', dificuldade: 'dificil',
      explicacao: 'Nefropatia membranosa: causa mais comum de síndrome nefrótica em adultos brancos (GESF em negros). Anticorpos anti-PLA2R positivos em 70-80% dos casos primários. Tratamento: IECA/BRA + imunossupressão.', ordem: 6,
    },
    {
      enunciado: 'Mulher de 28 anos com artrite de punhos, mãos e joelhos, simétrica, rigidez matinal > 1h há 3 meses. Qual o critério diagnóstico mais relevante?',
      opcaoA: 'VHS elevada', opcaoB: 'Anti-CCP positivo + fator reumatoide positivo',
      opcaoC: 'Rx mostrando erosões', opcaoD: 'Sinovite confirmada por ultrassom', opcaoE: 'Critérios ACR/EULAR 2010 ≥ 6 pontos',
      gabarito: 'E', disciplina: 'Clínica Médica', tema: 'Reumatologia', dificuldade: 'dificil',
      explicacao: 'Diagnóstico de AR pela ACR/EULAR 2010: ≥ 6 pontos (articulações envolvidas, sorologias, reagentes de fase aguda, duração). Anti-CCP é o marcador mais específico. O escore classifica, não diagnostica isoladamente.', ordem: 7,
    },
    {
      enunciado: 'Principal causa de morte por câncer em homens no Brasil?',
      opcaoA: 'Câncer de próstata', opcaoB: 'Câncer de pulmão', opcaoC: 'Câncer colorretal',
      opcaoD: 'Câncer de estômago', opcaoE: 'Leucemia',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Oncologia', dificuldade: 'medio',
      explicacao: 'Câncer de pulmão: principal causa de morte por câncer em homens (e em mulheres, segundo INCA). Câncer de próstata é o mais incidente, mas tem menor mortalidade. Tabagismo é o principal fator de risco.', ordem: 8,
    },
    {
      enunciado: 'Paciente com cefaleia em salvas (cluster). Característica diagnóstica?',
      opcaoA: 'Dor bilateral, opressiva, piora com atividade física', opcaoB: 'Aura visual precedendo a dor',
      opcaoC: 'Dor unilateral periorbitária intensa + sinais autonômicos ipsilaterais (lacrimejamento, ptose)',
      opcaoD: 'Rigidez de nuca + fotofobia', opcaoE: 'Pior cefaleia da vida de início súbito',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Neurologia', dificuldade: 'medio',
      explicacao: 'Cefaleia em salvas: dor unilateral periorbitária/temporal intensa (VAS 9-10/10), duração 15-180min, sinais autonômicos ipsilaterais (lacrimejamento, injeção conjuntival, rinorreia, ptose). Muito mais comum em homens.', ordem: 9,
    },
    {
      enunciado: 'Qual a indicação de hemotransfusão em paciente estável sem cardiopatia?',
      opcaoA: 'Hb < 10 g/dL', opcaoB: 'Hb < 8 g/dL', opcaoC: 'Hb < 7 g/dL',
      opcaoD: 'Hb < 6 g/dL com sintomas', opcaoE: 'Qualquer anemia sintomática',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Hematologia', dificuldade: 'medio',
      explicacao: 'Estratégia restritiva (evidência grau A): transfundir com Hb < 7 g/dL em pacientes estáveis sem cardiopatia isquêmica. Limiar de 8 g/dL para cardiopatas ou cirurgia ortopédica. Estratégia restritiva reduz mortalidade.', ordem: 10,
    },
    {
      enunciado: 'Paciente com dor lombar, perda de força bilateral em MMII e incontinência urinária de início agudo. Diagnóstico de emergência?',
      opcaoA: 'Hérnia de disco L4-L5', opcaoB: 'Estenose de canal lombar', opcaoC: 'Síndrome de cauda equina',
      opcaoD: 'Compressão de cone medular por tumor', opcaoE: 'Lombociatalgia',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Neurologia', dificuldade: 'dificil',
      explicacao: 'Síndrome de cauda equina: EMERGÊNCIA CIRÚRGICA. Tríade: lombalgia + déficit motor bilateral em MMII + disfunção vesical/intestinal (incontinência ou retenção). Causa: hérnia discal L4-L5 ou L5-S1 mediana volumosa. RNM urgente → cirurgia.', ordem: 11,
    },
    {
      enunciado: 'Anticoagulante de escolha na gestação?',
      opcaoA: 'Warfarina (antagonista de vitamina K)', opcaoB: 'Rivaroxabana (DOAC)',
      opcaoC: 'Heparina de baixo peso molecular (HBPM)',
      opcaoD: 'Dabigatrana', opcaoE: 'Heparina não fracionada em bolus IV',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Hematologia', dificuldade: 'medio',
      explicacao: 'HBPM (enoxaparina): não atravessa a placenta, segura na gestação. Warfarina: teratogênica no 1º trimestre (embriopatia) e risco de hemorragia fetal. DOACs (rivaroxabana, dabigatrana): contraindicados na gestação.', ordem: 12,
    },
    {
      enunciado: 'Qual o diagnóstico em paciente com febre, hepatoesplenomegalia, pancitopenia e ferritina > 10.000?',
      opcaoA: 'Leucemia mieloide aguda', opcaoB: 'Síndrome hemofagocítica (linfohistiocitose hemofagocítica)',
      opcaoC: 'Linfoma de Hodgkin', opcaoD: 'Doença de Still do adulto', opcaoE: 'Leishmaniose visceral',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Hematologia', dificuldade: 'dificil',
      explicacao: 'LHH/síndrome hemofagocítica: febre + esplenomegalia + citopenias + hipertrigliceridemia + ferritina muito elevada + fibrinogênio baixo. Critérios HScore. Alta mortalidade, tratamento: etoposídeo + dexametasona.', ordem: 13,
    },
    {
      enunciado: 'Paciente de 70 anos, hipertenso em uso de IECA, com K+ sérico de 6,2 mEq/L e ECG com ondas T apiculadas. Primeira conduta?',
      opcaoA: 'Sulfato de magnésio IV', opcaoB: 'Gliconato de cálcio IV + monitorização', opcaoC: 'Bicarbonato de sódio IV',
      opcaoD: 'Kayexalate (poliestireno) oral', opcaoE: 'Furosemida IV',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Nefrologia', dificuldade: 'dificil',
      explicacao: 'Hiperpotassemia com alterações no ECG: EMERGÊNCIA. 1ª medida = Gliconato de cálcio IV (estabiliza membrana cardíaca em 2-3 min, não reduz K+). Depois: insulina+glicose, beta2, bicarbonato, kayexalate ou diálise para remover K+.', ordem: 14,
    },
    {
      enunciado: 'Qual a meta pressórica para paciente diabético com nefropatia (proteinúria > 300mg/dia)?',
      opcaoA: '< 140/90 mmHg', opcaoB: '< 130/80 mmHg', opcaoC: '< 125/75 mmHg',
      opcaoD: '< 120/70 mmHg', opcaoE: 'Não há meta específica',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Endocrinologia', dificuldade: 'medio',
      explicacao: 'Diabético com nefropatia/proteinúria: meta PA < 130/80 mmHg (SBC/SBD). Fármaco de escolha: IECA ou BRA (nefroproteção e redução da proteinúria). Preferir IECA/BRA mesmo com PA controlada em diabéticos com albuminúria.', ordem: 15,
    },
    {
      enunciado: 'Exame de rastreamento para hipotireoidismo congênito no RN?',
      opcaoA: 'T4 livre no cordão umbilical', opcaoB: 'TSH no teste do pezinho (3-7 dias de vida)',
      opcaoC: 'T3 e T4 totais no sangue venoso', opcaoD: 'Ecografia de tireoide ao nascimento',
      opcaoE: 'TSH materno no pré-natal',
      gabarito: 'B', disciplina: 'Pediatria', tema: 'Neonatologia', dificuldade: 'facil',
      explicacao: 'Triagem neonatal (teste do pezinho): TSH para hipotireoidismo congênito, PKU (fenilalanina), hemoglobinas (drepanocitose), galactosemia, hiperplasia adrenal congênita, biotinidase. Coleta: 3-7 dias de vida.', ordem: 16,
    },
    {
      enunciado: 'Paciente com insuficiência hepática aguda grave. Qual o antídoto para intoxicação por paracetamol?',
      opcaoA: 'Flumazenil', opcaoB: 'N-acetilcisteína (NAC)', opcaoC: 'Naloxona',
      opcaoD: 'Vitamina K', opcaoE: 'Dimercaprol (BAL)',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Gastroenterologia', dificuldade: 'facil',
      explicacao: 'N-acetilcisteína (NAC): antídoto específico para intoxicação por paracetamol. Repõe glutationa hepática esgotada pelo metabólito tóxico NAPQI. Eficaz até 24-36h após ingestão (idealmente nas primeiras 8-10h).', ordem: 17,
    },
    {
      enunciado: 'Triagem para doença celíaca: qual o anticorpo de escolha?',
      opcaoA: 'Anti-gliadina IgA', opcaoB: 'Anti-endomísio IgG', opcaoC: 'Anti-transglutaminase tecidual IgA (anti-tTG IgA)',
      opcaoD: 'Anti-gliadina desamidada IgG', opcaoE: 'Anti-reticulina IgA',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Gastroenterologia', dificuldade: 'medio',
      explicacao: 'Anti-tTG IgA: triagem de escolha para doença celíaca (sensibilidade 93%, especificidade 97%). Dosar IgA total simultaneamente (deficiência de IgA falso-negativo). Confirmação: biópsia de duodeno (atrofia de vilosidades, Marsh 3).', ordem: 18,
    },
    {
      enunciado: 'Qual a abordagem inicial no manejo da crise hipertensiva emergência (PA = 220/130 com sintomas neurológicos)?',
      opcaoA: 'Captopril 25mg sublingual', opcaoB: 'Nitroprussiato de sódio IV com redução de 25% nas primeiras 2h',
      opcaoC: 'Enalapril IV em bolus rápido', opcaoD: 'Anlodipino 10mg VO + observação',
      opcaoE: 'Reduzir PA para < 120/80 imediatamente',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'dificil',
      explicacao: 'Crise hipertensiva emergência: reduzir PAM em 25% na 1ª hora (não zerar!), depois 160/100 nas próximas 2-6h. Drogas IV: nitroprussiato, labetalol, nicardipina. Captopril SL não é recomendado (redução imprevisível).', ordem: 19,
    },
    {
      enunciado: 'Mulher de 35 anos, tabagista, usando anticoncepcional combinado, com dor em panturrilha e edema. Doppler com TVP confirmada. Conduta?',
      opcaoA: 'Suspender ACO e iniciar HBPM', opcaoB: 'Manter ACO e adicionar AAS', opcaoC: 'Apenas meias elásticas',
      opcaoD: 'Heparina não fracionada por 5 dias e suspender ACO', opcaoE: 'Warfarina isolada desde o início',
      gabarito: 'A', disciplina: 'Clínica Médica', tema: 'Hematologia', dificuldade: 'medio',
      explicacao: 'TVP: suspender ACO (fator de risco trombogênico + tabagismo) e iniciar anticoagulação terapêutica. HBPM ou DOAC por pelo menos 3 meses. Warfarina sozinha sem heparinização inicial é inadequada (efeito pró-coagulante inicial).', ordem: 20,
    },
  ]

  const questoesRapido = [
    {
      enunciado: 'Conduta imediata no choque anafilático?',
      opcaoA: 'Anti-histamínico IV + corticoide', opcaoB: 'Adrenalina 0,3-0,5mg IM na coxa anterolateral',
      opcaoC: 'Salbutamol inalatório', opcaoD: 'Cristaloides 2L rápido', opcaoE: 'Corticoide IV isolado',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Alergia', dificuldade: 'medio',
      explicacao: 'Anafilaxia: adrenalina IM é o tratamento de PRIMEIRA LINHA, sem exceções. 0,3-0,5mg (0,3-0,5mL de solução 1:1000) na face anterolateral da coxa. Anti-histamínico e corticoide são adjuvantes, nunca substitutos.', ordem: 1,
    },
    {
      enunciado: 'Paciente em PCR sem pulso, ritmo: FV. Primeira conduta após reconhecer?',
      opcaoA: 'Adrenalina 1mg IV', opcaoB: 'Amiodarona 300mg IV', opcaoC: 'Desfibrilação imediata (360J monofásico / 200J bifásico)',
      opcaoD: 'Compressões 30:2 por 2 minutos', opcaoE: 'Intubação orotraqueal',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'UTI', dificuldade: 'medio',
      explicacao: 'FV/TVSP: ritmos "chocáveis" → desfibrilação o mais rápido possível. Cada minuto sem desfibrilação reduz a chance de sobrevida em 7-10%. RCP de alta qualidade enquanto carrega o desfibrilador.', ordem: 2,
    },
    {
      enunciado: 'Sinal de Babinski positivo indica lesão em qual estrutura?',
      opcaoA: 'Neurônio motor inferior', opcaoB: 'Neurônio motor superior (trato corticospinal)',
      opcaoC: 'Cerebelo', opcaoD: 'Gânglio da raiz dorsal', opcaoE: 'Nervos periféricos',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Neurologia', dificuldade: 'facil',
      explicacao: 'Babinski: extensão do hálux + abertura em leque dos demais dedos. Sinal de neurônio motor superior (lesão do trato piramidal). Em RN até 1-2 anos: fisiológico. Adulto: sempre patológico.', ordem: 3,
    },
    {
      enunciado: 'Antídoto para intoxicação por benzodiazepínico?',
      opcaoA: 'Naloxona', opcaoB: 'N-acetilcisteína', opcaoC: 'Flumazenil',
      opcaoD: 'Atropina', opcaoE: 'Pralidoxima',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Toxicologia', dificuldade: 'facil',
      explicacao: 'Flumazenil: antagonista competitivo dos receptores GABA-A/benzodiazepínico. Cuidado em epilépticos crônicos (pode precipitar convulsão). Naloxona = opioides. Atropina/pralidoxima = organofosforados.', ordem: 4,
    },
    {
      enunciado: 'Conduta no caso de trauma raquimedular cervical com instabilidade hemodinâmica?',
      opcaoA: 'Corticoide em altas doses imediato', opcaoB: 'Imobilização + ressuscitação volêmica cautelosa + vasopressores se choque neurogênico',
      opcaoC: 'Cirurgia descompressiva de urgência', opcaoD: 'TC de crânio prioritária',
      opcaoE: 'Analgesia e observação',
      gabarito: 'B', disciplina: 'Cirurgia', tema: 'Trauma', dificuldade: 'dificil',
      explicacao: 'Trauma raquimedular: imobilização cervical obrigatória. Choque neurogênico (vasodilatação sem taquicardia): hidratação + vasopressores (noradrenalina). Corticoide de alta dose: NÃO recomendado rotineiramente (evidência fraca). IOT precoce se tetraplegia.', ordem: 5,
    },
    {
      enunciado: 'Glucagon está indicado em qual tipo de intoxicação?',
      opcaoA: 'Intoxicação por opioides', opcaoB: 'Bloqueio de canal de cálcio',
      opcaoC: 'Intoxicação por betabloqueador',
      opcaoD: 'Hipoglicemia por insulina (apenas via SC)', opcaoE: 'Intoxicação por benzodiazepínico',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Toxicologia', dificuldade: 'dificil',
      explicacao: 'Glucagon: antídoto para intoxicação por betabloqueadores (bypass dos receptores beta bloqueados, estimula cAMP diretamente). Dose: 3-10mg IV. Também usado em bloqueadores de canal de cálcio como adjuvante.', ordem: 6,
    },
    {
      enunciado: 'Paciente com crise convulsiva generalizada em andamento há 5 minutos. Primeira medicação?',
      opcaoA: 'Fenitoína IV 20mg/kg', opcaoB: 'Diazepam 10mg IV (ou midazolam IM)',
      opcaoC: 'Fenobarbital IV', opcaoD: 'Propofol em infusão', opcaoE: 'Valproato IV',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Neurologia', dificuldade: 'medio',
      explicacao: 'Manejo da crise convulsiva ativa: 1ª linha = benzodiazepínico (diazepam IV ou lorazepam IV; midazolam IM se sem acesso). 2ª linha (SE refratário > 5-10 min): fenitoína, valproato, levetiracetam IV. 3ª linha: fenobarbital, anestesia.', ordem: 7,
    },
    {
      enunciado: 'Critério de Glasgow para IOT em sala de emergência?',
      opcaoA: 'Glasgow ≤ 10', opcaoB: 'Glasgow ≤ 8', opcaoC: 'Glasgow < 12',
      opcaoD: 'Glasgow ≤ 6', opcaoE: 'Qualquer rebaixamento de consciência',
      gabarito: 'B', disciplina: 'Cirurgia', tema: 'Trauma', dificuldade: 'facil',
      explicacao: 'Glasgow ≤ 8 = incapaz de proteger a via aérea = indicação de IOT. Regra prática: "GCS ≤ 8, intubate". Além disso: falência respiratória iminente, obstrução de via aérea, queda rápida do Glasgow.', ordem: 8,
    },
    {
      enunciado: 'Qual é o vasopressor de primeira escolha no choque séptico?',
      opcaoA: 'Adrenalina', opcaoB: 'Dopamina', opcaoC: 'Noradrenalina',
      opcaoD: 'Vasopressina', opcaoE: 'Dobutamina',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'UTI', dificuldade: 'facil',
      explicacao: 'Noradrenalina: vasopressor de PRIMEIRA LINHA no choque séptico (SSC 2021). Menos arritmogênica que dopamina, melhor sobrevida. Vasopressina e adrenalina: adjuvantes de 2ª e 3ª linha. Dobutamina: se disfunção miocárdica associada.', ordem: 9,
    },
    {
      enunciado: 'Qual o manejo da obstrução de via aérea por corpo estranho em adulto consciente?',
      opcaoA: 'Compressão abdominal (manobra de Heimlich)', opcaoB: 'Intubação imediata',
      opcaoC: 'Cricotireoidostomia de emergência', opcaoD: 'Tapas no dorso apenas', opcaoE: 'Aspiração com sonda grossa',
      gabarito: 'A', disciplina: 'Clínica Médica', tema: 'Emergências', dificuldade: 'facil',
      explicacao: 'OVACE em adulto consciente: manobra de Heimlich (compressões abdominais). Se inconsciente: RCP + retirada do objeto visível. Em gestante ou obeso: compressões torácicas. BLS protocolo atual: 5 tapas no dorso + 5 compressões abdominais (alternados).', ordem: 10,
    },
    {
      enunciado: 'Em qual situação a hipotensão permissiva está indicada no trauma?',
      opcaoA: 'Qualquer paciente em choque hemorrágico', opcaoB: 'TCE grave associado a choque',
      opcaoC: 'Trauma penetrante de tronco sem TCE (pré-hemostasia definitiva)',
      opcaoD: 'Trauma fechado com fraturas de pelve', opcaoE: 'Choque séptico',
      gabarito: 'C', disciplina: 'Cirurgia', tema: 'Trauma', dificuldade: 'dificil',
      explicacao: 'Hipotensão permissiva (PAM 50-60, PAS 80-90): estratégia no trauma penetrante de tronco SEM TCE, antes do controle definitivo da hemorragia. Objetivo: não "explodir" o coágulo. Contraindicada no TCE (precisa de PAM ≥ 70-80 para perfusão cerebral).', ordem: 11,
    },
    {
      enunciado: 'Paciente com dor torácica pleurítica, atrito pericárdico, alterações difusas no ECG. Diagnóstico?',
      opcaoA: 'IAM com supra de ST', opcaoB: 'Pericardite aguda', opcaoC: 'TEP',
      opcaoD: 'Dissecção de aorta', opcaoE: 'Espasmo coronariano',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'medio',
      explicacao: 'Pericardite aguda: tríade clássica (dor pleurítica, atrito pericárdico, alterações no ECG). ECG: supradesnivelamento difuso côncavo (sadela) + depressão de PR. Tratamento: AAS 750-1000mg 3x/dia ou ibuprofeno + colchicina.', ordem: 12,
    },
    {
      enunciado: 'Paciente com hematúria macroscópica, dor em flanco, massa palpável em flanco. Diagnóstico mais provável?',
      opcaoA: 'Cálculo renal', opcaoB: 'Carcinoma de células renais', opcaoC: 'Cistite hemorrágica',
      opcaoD: 'Glomerulonefrite', opcaoE: 'Rins policísticos',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Nefrologia', dificuldade: 'medio',
      explicacao: 'Tríade de Virchow do carcinoma renal: hematúria + dor em flanco + massa palpável (presente em apenas 10-15% dos casos, indica doença avançada). Mais comum: hematúria indolor. TC abdome com contraste: exame diagnóstico.', ordem: 13,
    },
    {
      enunciado: 'Qual a conduta no caso de hemorragia subaracnóidea confirmada por TC?',
      opcaoA: 'AAS + estatina imediatos', opcaoB: 'Angiografia cerebral para identificar e tratar o aneurisma roto',
      opcaoC: 'Anticoagulação plena', opcaoD: 'Dexametasona IV', opcaoE: 'Observação e controle da PA',
      gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Neurologia', dificuldade: 'dificil',
      explicacao: 'HSA por aneurisma roto: angioTC ou angiografia para identificar o aneurisma. Tratamento: clipagem cirúrgica ou coiling endovascular para evitar ressangramento. Nimodipina 60mg 4/4h VO previne vasospasmo. Ressangramento = principal causa de morte.', ordem: 14,
    },
    {
      enunciado: 'Em qual situação a pesquisa de SARS-CoV-2 por RT-PCR é obrigatória segundo vigilância epidemiológica?',
      opcaoA: 'Toda síndrome gripal', opcaoB: 'SRAG (síndrome respiratória aguda grave) hospitalizada',
      opcaoC: 'Apenas óbitos por Covid-19', opcaoD: 'Contatos assintomáticos de casos confirmados',
      opcaoE: 'Qualquer febre > 38°C',
      gabarito: 'B', disciplina: 'Saúde Pública', tema: 'Epidemiologia', dificuldade: 'medio',
      explicacao: 'Vigilância de SRAG: casos hospitalizados por síndrome respiratória aguda grave são notificados compulsoriamente e coletam RT-PCR para vírus respiratórios (influenza, SARS-CoV-2, VSR). Casos de síndrome gripal leve: notificação por sentinela.', ordem: 15,
    },
    {
      enunciado: 'Qual o sinal do sinal clínico de ruptura de aneurisma de aorta abdominal?',
      opcaoA: 'Dor torácica irradiando para o braço', opcaoB: 'Dor lombar súbita intensa + hipotensão + massa pulsátil abdominal',
      opcaoC: 'Dor em flanco + hematúria', opcaoD: 'Distensão abdominal + parada intestinal',
      opcaoE: 'Choque hemorrágico sem foco óbvio',
      gabarito: 'B', disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', dificuldade: 'medio',
      explicacao: 'Ruptura de AAA: tríade clássica (dor lombar/abdominal súbita intensa + hipotensão + massa abdominal pulsátil). Mortalidade cirúrgica 50%. Diagnóstico clínico → sala de operações diretamente. TC se hemodinamicamente estável.', ordem: 16,
    },
    {
      enunciado: 'Qual medicação está contraindicada no choque cardiogênico por disfunção sistólica grave?',
      opcaoA: 'Dobutamina', opcaoB: 'Noradrenalina', opcaoC: 'Metoprolol IV em bolus',
      opcaoD: 'Milrinona', opcaoE: 'Adrenalina',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'dificil',
      explicacao: 'Betabloqueadores IV no choque cardiogênico agudo: contraindicados (diminuem inotropismo e cronotropismo, pioram o choque). Betabloqueadores são benéficos na IC compensada, mas devem ser suspensos ou não iniciados no choque agudo. Suporte: dobutamina, levosimendan, DAM.', ordem: 17,
    },
    {
      enunciado: 'Critério de gravidade da dengue que indica hospitalização obrigatória?',
      opcaoA: 'Febre há 3 dias', opcaoB: 'Plaquetas entre 100.000 e 150.000', opcaoC: 'Hematócrito elevado + dor abdominal intensa + sangramento de mucosas',
      opcaoD: 'Dor de cabeça e mialgia', opcaoE: 'Leucopenia',
      gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Infectologia', dificuldade: 'medio',
      explicacao: 'Dengue com sinais de alarme (grupo C): dor abdominal intensa, vômitos persistentes, acúmulo de líquidos (ascite, derrame), sangramento de mucosas, letargia/irritabilidade, hepatomegalia > 2cm, hematócrito crescente. Internação obrigatória com hidratação IV.', ordem: 18,
    },
    {
      enunciado: 'Paciente gestante em choque hemorrágico por descolamento prematuro de placenta. Volume de reposição inicial?',
      opcaoA: 'Albumina 5% 500mL', opcaoB: 'Cristaloide (SF ou Ringer Lactato) 1-2L IV rápido + hemoderivados',
      opcaoC: 'Sangue total 2 unidades apenas', opcaoD: 'Coloides 1L + aguardar tipo sanguíneo',
      opcaoE: 'Nada VO + cirurgia imediata sem reposição',
      gabarito: 'B', disciplina: 'Ginecologia', tema: 'Obstetrícia', dificuldade: 'dificil',
      explicacao: 'Choque hemorrágico obstétrico: ressuscitação com cristaloides 1-2L e ativação do protocolo de transfusão maciça (1:1:1 — concentrado de hemácias:plasma:plaquetas). Cesárea de urgência simultânea. Ácido tranexâmico precoce reduz mortalidade.', ordem: 19,
    },
    {
      enunciado: 'Qual a conduta no traumatismo cranioencefálico grave (Glasgow ≤ 8) com herniação iminente (anisocoria, extensão)?',
      opcaoA: 'TC de crânio urgente sem outras intervenções', opcaoB: 'Hiperventilação temporária + Manitol IV + IOT + neurocirurgia urgente',
      opcaoC: 'Dexametasona 10mg IV + furosemida', opcaoD: 'Punção lombar para diagnóstico diferencial',
      opcaoE: 'Observação com escores neuro a cada hora',
      gabarito: 'B', disciplina: 'Cirurgia', tema: 'Trauma', dificuldade: 'dificil',
      explicacao: 'TCE grave com herniação iminente: IOT + hiperventilação temporária (PCO2 30-35, reduz PIC por vasoconstrição) + manitol 1g/kg IV (osmoterapia) + neurocirurgia urgente. Corticoide NÃO indicado no TCE (piora desfecho). Cabeceira 30°.', ordem: 20,
    },
  ]

  // Insert all questions
  for (const q of questoesENARE) await db.questao.create({ data: { ...q, provaId: provaENARE.id, geradaPorIA: false } })
  for (const q of questoesCajuru) await db.questao.create({ data: { ...q, provaId: provaCajuru.id, geradaPorIA: false } })
  for (const q of questoesSimulado) await db.questao.create({ data: { ...q, provaId: provaSimulado.id, geradaPorIA: false } })
  for (const q of questoesRapido) await db.questao.create({ data: { ...q, provaId: provaRapido.id, geradaPorIA: false } })

  // ── PROVAS MENSAIS (6) ───────────────────────────────────────────────────
  const provaMes1 = await db.prova.create({ data: { nome: 'Simulado Mês 1 — Clínica Médica I', tipo: 'SIMULADO', subtipo: 'mensal', disciplina: 'Clínica Médica', descricao: 'Cardiologia e Endocrinologia. HAS, DM, IC, SCA, arritmias, dislipidemia.', tempoPrevisto: 60, dificuldade: 'medio', ativo: true } })
  const provaMes2 = await db.prova.create({ data: { nome: 'Simulado Mês 2 — Clínica Médica II', tipo: 'SIMULADO', subtipo: 'mensal', disciplina: 'Clínica Médica', descricao: 'Pneumologia, Nefrologia, Neurologia. DPOC, PAC, DRC, AVC, epilepsia.', tempoPrevisto: 60, dificuldade: 'medio', ativo: true } })
  const provaMes3 = await db.prova.create({ data: { nome: 'Simulado Mês 3 — Cirurgia', tipo: 'SIMULADO', subtipo: 'mensal', disciplina: 'Cirurgia', descricao: 'Cirurgia abdominal, trauma, oncologia cirúrgica, pancreatite, queimaduras.', tempoPrevisto: 60, dificuldade: 'medio', ativo: true } })
  const provaMes4 = await db.prova.create({ data: { nome: 'Simulado Mês 4 — GO + Pediatria + Saúde Pública', tipo: 'SIMULADO', subtipo: 'mensal', descricao: 'Pré-natal, DHEG, parto, CCU, neonatologia, pediatria, SUS, epidemiologia.', tempoPrevisto: 60, dificuldade: 'medio', ativo: true } })
  const provaMes5 = await db.prova.create({ data: { nome: 'Simulado Mês 5 — Psiquiatria + Infectologia', tipo: 'SIMULADO', subtipo: 'mensal', descricao: 'Depressão, esquizofrenia, ansiedade, HIV, TB, sífilis, dengue, hepatites, dermatologia.', tempoPrevisto: 60, dificuldade: 'medio', ativo: true } })
  const provaMes6 = await db.prova.create({ data: { nome: 'Simulado Final — Revisão Multidisciplinar', tipo: 'SIMULADO', subtipo: 'final', descricao: 'Revisão completa ENARE/CAJURU. Questões de alto rendimento de todas as disciplinas.', tempoPrevisto: 90, dificuldade: 'dificil', ativo: true } })

  // ── QUESTÕES MÊS 1 — Clínica Médica I (20) ──────────────────────────────
  const qMes1 = [
    { enunciado: 'Paciente 55a, assintomático, PA 145/92 em 3 medidas. Sem lesão de órgão-alvo. Tratamento inicial?', opcaoA: 'Apenas MEV por 6 meses', opcaoB: 'MEV + anti-hipertensivo de 1ª linha imediatamente', opcaoC: 'Furosemida 40mg/dia', opcaoD: 'Espironolactona 25mg/dia', opcaoE: 'Propranolol 40mg 2x/dia', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'medio', explicacao: 'HAS estágio 1 (140-159/90-99) sem lesão de órgão-alvo: MEV + medicamento desde o início conforme diretriz brasileira 2020. 1ª linha: IECA/BRA, BCC ou tiazídico.', ordem: 1 },
    { enunciado: 'HbA1c 8,2% em DM2. Em uso de metformina dose máxima. Melhor acréscimo para reduzir eventos cardiovasculares?', opcaoA: 'Sulfonilureia (glibenclamida)', opcaoB: 'Insulina NPH', opcaoC: 'iSGLT2 (empagliflozina)', opcaoD: 'Acarbose', opcaoE: 'Pioglitazona', gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Endocrinologia', dificuldade: 'dificil', explicacao: 'iSGLT2 (empagliflozina, dapagliflozina) e GLP-1 (liraglutida, semaglutida) têm benefício CV independente do controle glicêmico. EMPA-REG: redução de 38% em morte CV. Indicados quando DCV estabelecida ou alto risco CV.', ordem: 2 },
    { enunciado: 'IC-FEr (FE 35%), em uso de IECA + betabloqueador. Creatinina 1,4 e K+ 4,8. Próximo passo para reduzir mortalidade?', opcaoA: 'Adicionar furosemida', opcaoB: 'Substituir IECA por sacubitril/valsartana (ARNI)', opcaoC: 'Adicionar espironolactona', opcaoD: 'Aumentar dose de betabloqueador', opcaoE: 'Adicionar digoxina', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'dificil', explicacao: 'ARNI (sacubitril/valsartana): estudo PARADIGM-HF mostrou superioridade ao enalapril em IC-FEr. Substituir IECA por ARNI se tolerado, com washout de 36h. K+ 4,8 é limítrofe para espironolactona.', ordem: 3 },
    { enunciado: 'Fibrilação atrial com FC 150, PA 80/50, dispneia intensa. Conduta imediata?', opcaoA: 'Amiodarona 300mg IV em 60 min', opcaoB: 'Digoxina 0,5mg IV', opcaoC: 'Cardioversão elétrica sincronizada imediata', opcaoD: 'Metoprolol IV bolus', opcaoE: 'Verapamil IV', gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'dificil', explicacao: 'FA com instabilidade hemodinâmica (hipotensão, choque, dispneia grave): cardioversão elétrica sincronizada imediata é a conduta padrão ACLS. Não perder tempo com farmacológico.', ordem: 4 },
    { enunciado: 'Escore de risco cardiovascular de Framingham de 18%. Classificação e meta de LDL?', opcaoA: 'Baixo risco — LDL < 130 mg/dL', opcaoB: 'Moderado risco — LDL < 100 mg/dL', opcaoC: 'Alto risco — LDL < 70 mg/dL', opcaoD: 'Muito alto risco — LDL < 50 mg/dL', opcaoE: 'Intermediário — LDL < 160 mg/dL', gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'medio', explicacao: 'Framingham 10-20%: alto risco cardiovascular. Meta LDL < 70 mg/dL pela diretriz brasileira 2017. Muito alto risco (> 20% ou DCV estabelecida): LDL < 50 mg/dL.', ordem: 5 },
    { enunciado: 'DM1, 22 anos, internado com glicemia 480, pH 7,18, bicarbonato 8, cetonúria. Diagnóstico e conduta inicial?', opcaoA: 'EHHNC — soro hipertônico', opcaoB: 'CAD — insulina regular IV + SF 0,9% 1L/h', opcaoC: 'CAD — insulina NPH subcutânea imediata', opcaoD: 'Hipoglicemia rebote — glicose IV', opcaoE: 'CAD — bicarbonato IV imediato', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Endocrinologia', dificuldade: 'dificil', explicacao: 'CAD: glicemia > 250, pH < 7,3, bicarbonato < 18, corpos cetônicos. Hidratação: SF 0,9% 1L/h na 1ª hora. Insulina regular IV 0,1 UI/kg/h. Bicarbonato apenas se pH < 6,9.', ordem: 6 },
    { enunciado: 'Hipotireoidismo primário confirmado (TSH 45, T4 livre 0,4). Tratamento?', opcaoA: 'Liotironina (T3) isolada', opcaoB: 'Levotiroxina em jejum, dose por peso (1,6 mcg/kg/dia)', opcaoC: 'Não tratar se assintomático', opcaoD: 'Metimazol para reduzir TSH', opcaoE: 'Iodo radioativo', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Endocrinologia', dificuldade: 'facil', explicacao: 'Hipotireoidismo primário: levotiroxina (T4 sintético) em jejum, 30 min antes do café. Dose inicial: 1,6 mcg/kg/dia (reduzir em idosos e cardiopatas). Reavaliação com TSH em 6-8 semanas.', ordem: 7 },
    { enunciado: 'Síndrome de Cushing: qual exame tem melhor custo-efetividade como triagem?', opcaoA: 'Cortisol basal matinal', opcaoB: 'Teste de supressão com 1mg de dexametasona (overnight)', opcaoC: 'ACTH plasmático', opcaoD: 'TC de adrenal', opcaoE: 'Ressonância de hipófise', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Endocrinologia', dificuldade: 'medio', explicacao: 'Triagem de Cushing: cortisol salivar noturno, cortisol urinário livre 24h ou teste de supressão overnight com 1mg dexametasona (cortisol ≥ 1,8 mcg/dL = positivo). Após triagem positiva: teste de 2mg por 2 dias.', ordem: 8 },
    { enunciado: 'Paciente com Síndrome de Marfan, aneurisma de aorta ascendente 4,8cm, assintomático. Conduta?', opcaoA: 'Cirurgia imediata', opcaoB: 'Betabloqueador + losartana + vigilância com eco/angioTC a cada 6-12 meses', opcaoC: 'Apenas monitorização anual', opcaoD: 'Anticoagulação plena', opcaoE: 'Esperar sintomas para operar', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'dificil', explicacao: 'Marfan com aneurisma < 5cm: tratamento clínico com betabloqueador (reduz pressão de pulso) + losartana (reduz progressão). Cirurgia eletiva recomendada quando ≥ 5cm (ou 4,5cm se alto risco/cirurgia em gestante).', ordem: 9 },
    { enunciado: 'Acromegalia: exame confirmatório e tratamento primário?', opcaoA: 'GH basal elevado → cirurgia hipofisária transesfenoidal', opcaoB: 'GH após TOTG não suprimido + IGF-1 elevado → cirurgia', opcaoC: 'Prolactina elevada → bromocriptina', opcaoD: 'IGF-1 isolado → radioterapia', opcaoE: 'ACTH elevado → adrenalectomia', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Endocrinologia', dificuldade: 'dificil', explicacao: 'Acromegalia: screening com IGF-1; confirmação com GH após TOTG (ausência de supressão a < 1 ng/mL = positivo). Tratamento 1ª linha: ressecção cirúrgica transesfenoidal. Análogos de somatostatina (octreotida) se não curado ou inoperável.', ordem: 10 },
    { enunciado: 'Paciente com dor precordial típica, ECG sem alterações, troponina convencional negativa à admissão. Conduta?', opcaoA: 'Alta imediata com AAS', opcaoB: 'Repetir troponina em 3-6h ou usar hs-troponina protocolo 0/1h', opcaoC: 'Cateterismo urgente', opcaoD: 'Cintilografia imediata', opcaoE: 'TC coronária imediata', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'medio', explicacao: 'Síndrome coronariana aguda sem supra: uma troponina negativa não exclui SCA. Protocolo padrão: repetir troponina convencional em 3-6h. Com hs-troponina: protocolo 0/1h ou 0/2h permite alta mais rápida se negativa e sem fatores de risco.', ordem: 11 },
    { enunciado: 'Anticorpo mais sensível para diagnóstico de DM1?', opcaoA: 'Anti-GAD (anti-descarboxilase do ácido glutâmico)', opcaoB: 'Anti-insulina', opcaoC: 'Anti-ilhota (ICA)', opcaoD: 'Anti-ZnT8', opcaoE: 'Anti-TPO', gabarito: 'A', disciplina: 'Clínica Médica', tema: 'Endocrinologia', dificuldade: 'medio', explicacao: 'Anti-GAD65 é o mais sensível (presente em 70-80% dos DM1). Anti-insulina é positivo no início. ICA detecta múltiplos autoanticorpos. Na prática clínica, anti-GAD é o mais solicitado.', ordem: 12 },
    { enunciado: 'Paciente com flutter atrial 2:1, FC 150, estável. Qual a alternativa NÃO é apropriada?', opcaoA: 'Controle de frequência com betabloqueador', opcaoB: 'Ablação por cateter (alta taxa de cura)', opcaoC: 'Cardioversão elétrica sincronizada', opcaoD: 'Verapamil para controle de frequência', opcaoE: 'Anticoagulação se > 48h de duração', gabarito: 'D', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'dificil', explicacao: 'Verapamil IV é contraindicado em flutter/FA com pré-excitação (WPW) pois pode acelerar condução acessória → FV. Betabloqueadores IV são seguros. Na ausência de WPW, verapamil seria aceitável, mas beta é preferido.', ordem: 13 },
    { enunciado: 'Hipercalcemia assintomática, PTH elevado, sem nefrolitíase. Diagnóstico e conduta?', opcaoA: 'Hipercalcemia da sarcoidose — corticoide', opcaoB: 'Hiperparatireoidismo primário — acompanhamento se assintomático e cálcio < 1mg acima do limite', opcaoC: 'Hipervitaminose D — suspender suplementação', opcaoD: 'Hipercalcemia maligna — investigar tumor', opcaoE: 'Hipercalcemia familiar benigna — nenhuma conduta', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Endocrinologia', dificuldade: 'medio', explicacao: 'HPP: hipercalcemia + PTH elevado inapropriadamente. Assintomático sem critérios cirúrgicos (< 50 anos, Ca > 1mg acima do normal, DXA T-score < -2,5, ClCr < 60, nefrolitíase): vigilância. Critérios presentes → cirurgia.', ordem: 14 },
    { enunciado: 'Valvopatia com maior risco de endocardite infecciosa nos casos de bacteremia?', opcaoA: 'Prolapso de valva mitral sem regurgitação', opcaoB: 'Estenose aórtica calcificada degenerativa', opcaoC: 'Prótese valvar mecânica ou histórico de EI prévia', opcaoD: 'Comunicação interatrial do tipo ostium secundum', opcaoE: 'Insuficiência tricúspide leve', gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'medio', explicacao: 'Alto risco de EI (profilaxia obrigatória em procedimentos dentários): prótese valvar (mecânica ou biológica), histórico de EI prévia, cardiopatia congênita cianótica não corrigida, CIV corrigida com material protético nos primeiros 6 meses.', ordem: 15 },
    { enunciado: 'Mulher 48a, obesa, pré-diabetes (glicemia jejum 112mg/dL, HbA1c 5,9%). Melhor intervenção para prevenir progressão para DM2?', opcaoA: 'Metformina imediata', opcaoB: 'Insulina NPH profilática', opcaoC: 'MEV intensiva (perda de peso + atividade física)', opcaoD: 'Acarbose 50mg 3x/dia', opcaoE: 'Apenas monitorização semestral', gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Endocrinologia', dificuldade: 'facil', explicacao: 'DPP (Diabetes Prevention Program): MEV intensiva (perda 5-7% peso + 150 min/semana exercício) reduz progressão para DM em 58%. Metformina reduz 31% (2ª opção em obesidade/IMC > 35). MEV é superior.', ordem: 16 },
    { enunciado: 'ECG: onda P ausente, complexo QRS alargado (> 0,12s) e irregular com FC 32bpm. Diagnóstico?', opcaoA: 'BAV 2° grau Mobitz I', opcaoB: 'BAV 3° grau (BAVT)', opcaoC: 'FA com bloqueio de ramo', opcaoD: 'Ritmo juncional', opcaoE: 'Flutter atrial com bloqueio variável', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'dificil', explicacao: 'BAVT: dissociação atrioventricular completa. FC < 40 (ritmo de escape ventricular → QRS alargado). P e QRS sem relação. Causa: doença de condução, IAM inferior, fármacos. Tratamento: marcapasso.', ordem: 17 },
    { enunciado: 'Nódulo tireoidiano sólido de 1,8cm, sem características suspeitas ao US. TSH normal. Próxima etapa?', opcaoA: 'Cintilografia de tireóide', opcaoB: 'Punção aspirativa por agulha fina (PAAF)', opcaoC: 'Dosagem de calcitonina', opcaoD: 'Cirurgia preventiva', opcaoE: 'Apenas US de controle em 1 ano', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Endocrinologia', dificuldade: 'medio', explicacao: 'Nódulo ≥ 1cm sem características suspeitas: PAAF. Com características suspeitas ao US (margens irregulares, microcalcificações, hipervascularização central, mais alto que largo): PAAF a partir de 1cm. TSH suprimido → cintilografia antes.', ordem: 18 },
    { enunciado: 'Insuficiência cardíaca descompensada com congestão pulmonar, PA 130/85. Tratamento de 1ª linha?', opcaoA: 'Inotrópico (dobutamina)', opcaoB: 'Diurético de alça IV (furosemida)', opcaoC: 'Corticoide IV', opcaoD: 'Digoxina IV', opcaoE: 'Betabloqueador em dose máxima', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'medio', explicacao: 'IC descompensada com congestão (ortopneia, EAP, B3): furosemida IV 40-80mg é o tratamento de 1ª linha. Vasodilatador (nitroglicerina) se PA ≥ 110. Inotrópico apenas em choque cardiogênico. Betabloqueador deve ser reduzido (não aumentado) na descompensação.', ordem: 19 },
    { enunciado: 'Síndrome do QT longo congênita. Qual medicamento é MAIS perigoso?', opcaoA: 'Metformina', opcaoB: 'Enalapril', opcaoC: 'Azitromicina', opcaoD: 'Metoprolol', opcaoE: 'AAS', gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'medio', explicacao: 'Azitromicina prolonga o intervalo QT → risco de Torsades de Pointes e FV em pacientes com QT longo basal. Outros que prolongam QT: antipsicóticos, antifúngicos azólicos, antiarrítmicos classe Ia e III, metadona.', ordem: 20 },
  ]
  for (const q of qMes1) await db.questao.create({ data: { ...q, provaId: provaMes1.id, geradaPorIA: false } })

  // ── QUESTÕES MÊS 2 — Clínica Médica II (20) ─────────────────────────────
  const qMes2 = [
    { enunciado: 'Paciente DPOC Gold 2, CAT 18, 1 exacerbação hospitalar no último ano. Tratamento de manutenção?', opcaoA: 'SABA isolado (salbutamol)', opcaoB: 'LAMA (tiotrópio) ou LABA + LAMA', opcaoC: 'LABA + CI (formoterol + budesonida)', opcaoD: 'Teofilina oral', opcaoE: 'Antibiótico profilático mensal', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Pneumologia', dificuldade: 'medio', explicacao: 'DPOC GOLD 2, alto risco (GOLD E: ≥ 2 exacerbações ou ≥ 1 hospitalizacao): LAMA ou LABA+LAMA são preferidos. CI adicionado se eosinófilos ≥ 300 ou asma sobreposta. Referência: GOLD 2024.', ordem: 1 },
    { enunciado: 'Asma moderada persistente, não controlada com CI dose média. Melhor acréscimo?', opcaoA: 'Aumentar CI para dose máxima', opcaoB: 'Adicionar LABA (formoterol ou salmeterol)', opcaoC: 'Adicionar teofilina oral', opcaoD: 'Adicionar SABA frequente', opcaoE: 'Prednisolona oral', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Pneumologia', dificuldade: 'facil', explicacao: 'Degrau 3 GINA: CI dose média OU CI dose baixa + LABA. Não controlada com CI dose média: adicionar LABA (CI+LABA é a combinação mais eficaz). LABA nunca sozinho na asma (sem CI).', ordem: 2 },
    { enunciado: 'DRC estágio G4 (TFG 22), potássio 5,8. Qual intervenção é PRIORITÁRIA?', opcaoA: 'Iniciar diálise imediatamente', opcaoB: 'Resinas quelantes de potássio + dieta hipossódica e hipopotássica', opcaoC: 'Aumentar dose de espironolactona', opcaoD: 'Furosemida em dose alta', opcaoE: 'Iniciar IECA', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Nefrologia', dificuldade: 'medio', explicacao: 'Hipercalemia em DRC: dieta hipopotássica (<2g/dia), resinas (patiromer, ciclosilicato de zircônio, kayexalate). IECA contraindicado se K+ > 5,5. Diálise se K+ > 6,5 ou refratário. Espironolactona retém K+.', ordem: 3 },
    { enunciado: 'Síndrome nefrótica: proteinúria 4g/24h, albumina 2,1, edema. Principal complicação trombótica?', opcaoA: 'TEP (tromboembolismo pulmonar)', opcaoB: 'Trombose da veia renal', opcaoC: 'TVP de MMII', opcaoD: 'AVC isquêmico', opcaoE: 'Trombose arterial periférica', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Nefrologia', dificuldade: 'medio', explicacao: 'Síndrome nefrótica: perda urinária de proteínas anticoagulantes (ATIII, proteína C e S) → estado protrombótico. Complicação trombótica mais característica: trombose da veia renal (dor em flanco, hematúria, queda súbita da TFG). TEP pode ocorrer em consequência.', ordem: 4 },
    { enunciado: 'AVC isquêmico há 2h, NIHSS 8, TC sem hemorragia. Contraindicação ao tPA IV?', opcaoA: 'Idade 82 anos', opcaoB: 'NIHSS 8', opcaoC: 'Cirurgia abdominal há 10 dias', opcaoD: 'PA 175/95 após duas doses de anti-hipertensivo', opcaoE: 'Glicemia 220mg/dL', gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Neurologia', dificuldade: 'dificil', explicacao: 'Contraindicações ao tPA: cirurgia ou trauma grave nos últimos 14 dias (risco de hemorragia na ferida). Idade não é contraindicação absoluta. PA deve estar < 185/110 antes de iniciar. Glicemia deve estar entre 50-400. NIHSS não é contraindicação.', ordem: 5 },
    { enunciado: 'Epilepsia focal com generalização. Primeira crise. Exame de imagem normal. Deve medicar?', opcaoA: 'Não — apenas orientar e aguardar segunda crise', opcaoB: 'Sim — iniciar antiepilético após qualquer primeira crise', opcaoC: 'Sim se EEG mostrar alterações epileptiformes ou risco elevado', opcaoD: 'Apenas se NIHSS alterado', opcaoE: 'Apenas em crianças', gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Neurologia', dificuldade: 'medio', explicacao: 'Primeira crise não provocada: iniciar FAE se: EEG com descarga epileptiforme, imagem com lesão epileptogênica, déficit neurológico, síndrome epiléptica definida, ou condição associada a alto risco de recorrência (> 60%). Risco de recorrência em 2 anos: 40-50%.', ordem: 6 },
    { enunciado: 'Pneumonia hospitalar (> 48h internado), paciente em VM há 5 dias. Agente mais comum?', opcaoA: 'Streptococcus pneumoniae', opcaoB: 'Legionella pneumophila', opcaoC: 'Pseudomonas aeruginosa e gram-negativos MDR', opcaoD: 'Mycoplasma pneumoniae', opcaoE: 'Vírus influenza', gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Pneumologia', dificuldade: 'medio', explicacao: 'PAH/PAV > 5 dias: predominam gram-negativos MDR (Pseudomonas, Acinetobacter, Klebsiella, ESBL+) e Staphylococcus aureus (MRSA). Antibioticoterapia ampla + ajustar conforme cultura. PAH precoce (< 5 dias sem fatores de risco): agentes semelhantes à PAC.', ordem: 7 },
    { enunciado: 'Síndrome de abstinência de álcool: início dos sintomas mais graves (convulsão e delirium tremens)?', opcaoA: '1-6h após última dose', opcaoB: '6-24h (convulsão) e 24-72h (DT)', opcaoC: '72-96h para ambos', opcaoD: 'Apenas em uso crônico > 20 anos', opcaoE: '> 1 semana após parar', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Neurologia', dificuldade: 'medio', explicacao: 'Timeline: 6-8h tremor/ansiedade, 10-24h alucinações, 24-48h convulsão, 24-72h delirium tremens (tremor + alucinações visuais + confusão + instabilidade autonômica). Tratamento: BDZ + tiamina ANTES glicose.', ordem: 8 },
    { enunciado: 'ITU complicada em mulher diabética, E. coli ESBL+. Tratamento?', opcaoA: 'Amoxicilina-clavulanato VO', opcaoB: 'Nitrofurantoína', opcaoC: 'Ertapenem IV ou imipenem', opcaoD: 'Ciprofloxacino VO', opcaoE: 'Ampicilina IV', gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Nefrologia', dificuldade: 'dificil', explicacao: 'ESBL (beta-lactamase de espectro estendido): resistente a penicilinas, cefalosporinas e quinolonas geralmente. Tratamento de escolha: carbapenêmico (ertapenem, imipenem, meropeném). ESBL+ = carbapenem-sensível na maioria.', ordem: 9 },
    { enunciado: 'Gasometria: pH 7,28, pCO2 55, HCO3 24. Diagnóstico?', opcaoA: 'Acidose metabólica simples', opcaoB: 'Acidose respiratória aguda', opcaoC: 'Acidose respiratória crônica compensada', opcaoD: 'Alcalose respiratória', opcaoE: 'Alcalose metabólica com compensação respiratória', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Pneumologia', dificuldade: 'medio', explicacao: 'pH ↓ = acidose. pCO2 ↑ = componente respiratório. HCO3 normal = sem compensação renal ainda = AGUDA. Na acidose respiratória crônica, HCO3 estaria elevado (compensação). Causa: hipoventilação aguda (broncoespasmo, sedação, OVA).', ordem: 10 },
    { enunciado: 'Meningite bacteriana: LCR com proteína 320, glicose 20, celularidade 850 (> 80% PMN). Tratamento empírico em adulto sem imunossupressão?', opcaoA: 'Aciclovir IV', opcaoB: 'Ceftriaxona + Ampicilina + Dexametasona', opcaoC: 'Ceftriaxona + Dexametasona', opcaoD: 'Vancomicina isolada', opcaoE: 'Azitromicina IV', gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Neurologia', dificuldade: 'medio', explicacao: 'Meningite bacteriana adulto (18-50 anos, imunocompetente): Ceftriaxona 2g 12/12h + Dexametasona 0,15mg/kg 6/6h (reduz sequelas neurológicas, especialmente em pneumococo). Ampicilina acrescenta cobertura para Listeria em > 50 anos, gestantes e imunossuprimidos.', ordem: 11 },
    { enunciado: 'Derrame pleural: exsudato vs transudato. LDH pleural/LDH sérico = 0,7. Classificação?', opcaoA: 'Transudato — critério de Light LDH < 0,6', opcaoB: 'Exsudato — critério de Light LDH > 0,6', opcaoC: 'Inconclusivo sem proteína', opcaoD: 'Exsudato apenas se glicose baixa', opcaoE: 'Transudato se pH > 7,3', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Pneumologia', dificuldade: 'medio', explicacao: 'Critérios de Light (exsudato se ≥ 1): proteína pleural/sérica > 0,5 OU LDH pleural/sérico > 0,6 OU LDH pleural > 2/3 limite superior. LDH relação 0,7 > 0,6 = exsudato. Causas: pneumonia, neoplasia, TB, embolia, pancreatite.', ordem: 12 },
    { enunciado: 'Pielonefrite aguda em mulher jovem, hemodinamicamente estável. Tratamento ambulatorial?', opcaoA: 'Nitrofurantoína 100mg 6/6h', opcaoB: 'Ciprofloxacino 500mg 12/12h por 7 dias', opcaoC: 'Amoxicilina 500mg 8/8h', opcaoD: 'Fosfomicina dose única', opcaoE: 'Apenas hidratação e analgesia', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Nefrologia', dificuldade: 'facil', explicacao: 'Pielonefrite não complicada: quinolona VO 7 dias (ciprofloxacino) ou SMX-TMP 14 dias. Nitrofurantoína inadequada (não atinge tecido renal). Internação se: vômitos, sepse, imunossupressão, gestação, obstrução.', ordem: 13 },
    { enunciado: 'Doença de Parkinson: o que diferencia do parkinsonismo secundário?', opcaoA: 'Presença de tremor de repouso', opcaoB: 'Rigidez em roda denteada', opcaoC: 'Resposta dramática à levodopa e início assimétrico', opcaoD: 'Bradicinesia', opcaoE: 'Instabilidade postural', gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Neurologia', dificuldade: 'medio', explicacao: 'Critérios positivos para DP (UK Brain Bank): bradicinesia + 1 de: tremor de repouso, rigidez, instabilidade postural. Fatores de suporte para DP vs parkinsonismo secundário: início unilateral, boa resposta à levodopa (> 30% melhora), curso progressivo, corpos de Lewy.', ordem: 14 },
    { enunciado: 'Sarcoidose pulmonar estágio I (adenopatia hilar bilateral, sem infiltrado). Conduta?', opcaoA: 'Prednisona 40mg/dia imediatamente', opcaoB: 'Antituberculosos empíricos', opcaoC: 'Observação — remissão espontânea em até 80%', opcaoD: 'Metrotrexato imediato', opcaoE: 'Biópsia pulmonar imediata', gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Pneumologia', dificuldade: 'medio', explicacao: 'Sarcoidose estágio I (adenopatia + raio X normal): remissão espontânea em 60-80%. Tratamento com corticoide apenas em: hipercalcemia, uveíte, envolvimento cardíaco/neurológico, sintomas progressivos, comprometimento funcional pulmonar.', ordem: 15 },
    { enunciado: 'Hemorragia digestiva alta: endoscopia mostra úlcera com vaso visível (Forrest Ia). Conduta?', opcaoA: 'Alta com IBP e H. pylori', opcaoB: 'IBP em infusão contínua + hemostasia endoscópica', opcaoC: 'Cirurgia de urgência', opcaoD: 'Apenas IBP bolus 80mg IV', opcaoE: 'Vasopressina IV', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Gastroenterologia', dificuldade: 'dificil', explicacao: 'Forrest I (sangramento ativo) e IIa (vaso visível): hemostasia endoscópica (injeção de adrenalina + termocoagulação ou clip). Após hemostasia: IBP infusão contínua 72h (omeprazol 80mg bolus + 8mg/h) reduz ressangramento. Forrest IIb-III: sem intervenção, alta com IBP oral.', ordem: 16 },
    { enunciado: 'Cirrose Child-Pugh B, ascite volumosa. Paracentese de grande volume: qual o risco principal e prevenção?', opcaoA: 'Peritonite bacteriana espontânea — ATB profilático', opcaoB: 'Disfunção circulatória pós-paracentese — albumina IV 8g/L retirado', opcaoC: 'Hemorragia varicosa — propranolol', opcaoD: 'Encefalopatia — lactulose antes da paracentese', opcaoE: 'Hiponatremia — restrição hídrica', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Gastroenterologia', dificuldade: 'dificil', explicacao: 'Paracentese > 5L: risco de disfunção circulatória pós-paracentese (queda do debito cardíaco por redistribuição) → albumina IV 8g por litro retirado acima de 5L previne disfunção e síndrome hepatorrenal. Abaixo de 5L: expansor alternativo ou sem reposição.', ordem: 17 },
    { enunciado: 'Qual medicação está contraindicada em paciente com insuficiência renal aguda oligúrica (creatinina 4,8mg/dL)?', opcaoA: 'Furosemida IV', opcaoB: 'Metformina', opcaoC: 'Hidrocortisona IV', opcaoD: 'Meropeném ajustado para TFG', opcaoE: 'Heparina não fracionada', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Nefrologia', dificuldade: 'facil', explicacao: 'Metformina acumula em IRA/IRC avançada → risco de acidose lática grave. Contraindicada se TFG < 30 (suspender temporariamente se TFG < 45 em situações de risco). Também contraindicada em uso de contraste iodado e cirurgias.', ordem: 18 },
    { enunciado: 'Pleurite seca: causa mais comum em jovem com febre, artralgia e rash malar?', opcaoA: 'TB pleural', opcaoB: 'Derrame parapneumônico', opcaoC: 'LES (pleurite lúpica)', opcaoD: 'Neoplasia pulmonar', opcaoE: 'Embolia pulmonar', gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Pneumologia', dificuldade: 'medio', explicacao: 'Pleurite/serosites são manifestações comuns do LES. Jovem com febre + artralgia + rash malar + pleurite → LES até prova em contrário. ANA positivo em > 95%, anti-DNA e anti-Sm específicos. Tratamento com corticoide.', ordem: 19 },
    { enunciado: 'Doença pulmonar intersticial (DPI) com padrão tomográfico de UIP (faveolamento + bronquiectasias de tração). Diagnóstico provável e conduta?', opcaoA: 'Sarcoidose — corticoide', opcaoB: 'FPI (fibrose pulmonar idiopática) — nintedanibe ou pirfenidona', opcaoC: 'PH (pneumonite de hipersensibilidade) — afastar exposição', opcaoD: 'COP — corticoide em dose alta', opcaoE: 'Linfangioleiomiomatose — sirolimus', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Pneumologia', dificuldade: 'dificil', explicacao: 'Padrão UIP (usual interstitial pneumonia): faveolamento + bronquiectasias de tração, predomínio basal e periférico → FPI. Diagnóstico clínico-radiológico em maiores de 60 anos sem causa identificável. Antifibróticos (nintedanibe/pirfenidona) reduzem progressão. Corticoide piora FPI.', ordem: 20 },
  ]
  for (const q of qMes2) await db.questao.create({ data: { ...q, provaId: provaMes2.id, geradaPorIA: false } })

  // ── QUESTÕES MÊS 3 — Cirurgia (20) ─────────────────────────────────────
  const qMes3 = [
    { enunciado: 'Paciente com escore de Alvarado 8. TC abdome confirma apendicite. Conduta?', opcaoA: 'Antibióticos IV por 5 dias e alta', opcaoB: 'Apendicectomia (laparoscópica ou aberta)', opcaoC: 'Observação 24h e repetir TC', opcaoD: 'Drenagem percutânea guiada por TC', opcaoE: 'Colonoscopia diagnóstica', gabarito: 'B', disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', dificuldade: 'facil', explicacao: 'Apendicite aguda confirmada: apendicectomia. Laparoscópica preferida (menor infecção de ferida, alta precoce). Conservador com ATB pode ser tentado em casos selecionados (sem perfuração/abscesso, paciente estável), mas com 20-30% de recorrência no 1° ano.', ordem: 1 },
    { enunciado: 'Colecistite aguda grau II (TG18): Tokyo Guidelines. Qual a conduta cirúrgica adequada?', opcaoA: 'Cirurgia imediata independente das condições', opcaoB: 'Colecistectomia laparoscópica precoce (< 72h) após estabilização', opcaoC: 'Antibióticos por 6 semanas e cirurgia eletiva', opcaoD: 'Drenagem percutânea definitiva', opcaoE: 'Apenas antibióticos, sem cirurgia', gabarito: 'B', disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', dificuldade: 'medio', explicacao: 'TG18 Grau II (moderada): colecistectomia laparoscópica precoce (< 72h) é recomendada após adequado preparo. Grau I: cirurgia imediata ou precoce. Grau III (grave com disfunção orgânica): estabilização + drenagem → cirurgia eletiva.', ordem: 2 },
    { enunciado: 'Hérnia inguinal indireta em homem de 45 anos, assintomática. Conduta?', opcaoA: 'Cirurgia imediata para evitar encarceramento', opcaoB: 'Observação ativa ("watchful waiting") é segura', opcaoC: 'Hérnia indireta nunca encarcera', opcaoD: 'Trusses (faixa) como tratamento definitivo', opcaoE: 'Correção apenas se encarcerada', gabarito: 'B', disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', dificuldade: 'medio', explicacao: 'Hérnia inguinal assintomática ou levemente sintomática em homens: watchful waiting é seguro (risco de encarceramento < 0,3%/ano). Cirurgia indicada se: dor, limitação funcional, crescimento, ou preferência do paciente. Em mulheres, cirurgia preferencial (hérnia femoral tem maior risco de encarceramento).', ordem: 3 },
    { enunciado: 'Pancreatite aguda, escore APACHE-II 10, sem resposta ao tratamento conservador. Imagem mostra necrose de 50%. Conduta?', opcaoA: 'Cirurgia imediata (necrosectomia cirúrgica)', opcaoB: 'ATB profilático + suporte + aguardar demarcação', opcaoC: 'CPRE urgente', opcaoD: 'Corticoide IV', opcaoE: 'Nutrição parenteral total como único tratamento', gabarito: 'B', disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', dificuldade: 'dificil', explicacao: 'Necrose pancreática estéril: tratamento conservador (suporte nutricional — enteral preferido, ATB NÃO recomendado profilaticamente). Intervenção (step-up: drenagem percutânea → videoscópica → cirurgia) apenas se necrose infectada ou deterioração clínica. Cirurgia precoce aumenta mortalidade.', ordem: 4 },
    { enunciado: 'Obstrução intestinal por bridas (história de apendicectomia prévia). Sinal radiológico clássico?', opcaoA: 'Distensão gástrica isolada', opcaoB: 'Pneumoperitônio', opcaoC: 'Níveis hidroaéreos em escada (step-ladder) em intestino delgado', opcaoD: 'Sinal de ceco dilatado', opcaoE: 'Ar livre subdiafragmático', gabarito: 'C', disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', dificuldade: 'medio', explicacao: 'Obstrução de intestino delgado: níveis hidroaéreos em "escada" com alças centrais dilatadas (> 3cm) ao RX simples. Ceco dilatado > 12cm → risco de perfuração em vólvulo cecal/obstrução de cólon. Pneumoperitônio = perfuração.', ordem: 5 },
    { enunciado: 'Câncer retal a 5cm da borda anal, T3N1M0. Tratamento?', opcaoA: 'Ressecção anterior baixa isolada', opcaoB: 'Amputação abdominoperineal (Miles)', opcaoC: 'Quimiorradioterapia neoadjuvante + cirurgia', opcaoD: 'Apenas radioterapia paliativa', opcaoE: 'Polipectomia endoscópica', gabarito: 'C', disciplina: 'Cirurgia', tema: 'Oncologia Cirúrgica', dificuldade: 'dificil', explicacao: 'Câncer retal localmente avançado (T3/T4 ou N+): QRT neoadjuvante (capecitabina + RT 45-50Gy) seguida de cirurgia após 6-8 semanas. Reduz recidiva local de 26% para 6%. Preservação esfincteriana possível se boa resposta.', ordem: 6 },
    { enunciado: 'Paciente em RCP há 3 min (FV), já recebeu 3 choques e adrenalina. Próximo fármaco?', opcaoA: 'Lidocaína 1,5mg/kg IV', opcaoB: 'Amiodarona 300mg IV bolus', opcaoC: 'Atropina 1mg IV', opcaoD: 'Bicarbonato de sódio 1mEq/kg', opcaoE: 'Vasopressina 40UI', gabarito: 'B', disciplina: 'Cirurgia', tema: 'Trauma', dificuldade: 'medio', explicacao: 'ACLS FV/TV sem pulso refratária: após 3 choques + adrenalina, antiarrítmico de escolha é amiodarona 300mg IV bolus. Segunda dose 150mg se persistir. Lidocaína é alternativa se amiodarona indisponível.', ordem: 7 },
    { enunciado: 'Queimadura em adulto: face (4,5%), tórax anterior (9%), braço direito (9%), coxa esquerda (9%). Total % SCQ pela Regra dos 9?', opcaoA: '22,5%', opcaoB: '27%', opcaoC: '31,5%', opcaoD: '36%', opcaoE: '18%', gabarito: 'C', disciplina: 'Cirurgia', tema: 'Trauma', dificuldade: 'medio', explicacao: 'Regra dos 9: cabeça/pescoço 9% (face = 4,5%), tórax anterior 9%, MMSS 9% cada, MMII 18% cada (coxa = 9%). Total: 4,5 + 9 + 9 + 9 = 31,5% SCQ. Volume Parkland: 4 × 70 × 31,5 = 8820mL em 24h.', ordem: 8 },
    { enunciado: 'Perfuração de úlcera duodenal há 6h: achado cirúrgico e conduta?', opcaoA: 'Drenagem percutânea guiada por TC', opcaoB: 'Laparotomia + rafia simples (sutura de Graham) + lavagem', opcaoC: 'Gastrectomia parcial', opcaoD: 'IBP IV + jejum + reavaliação em 24h', opcaoE: 'Colonoscopia terapêutica', gabarito: 'B', disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', dificuldade: 'medio', explicacao: 'Perfuração de úlcera péptica: laparotomia urgente (ou laparoscopia). Rafia de Graham (sutura + epíploon) é o padrão-ouro. Gastrectomia reservada para casos selecionados. Lavagem abundante da cavidade. ATB perioperatório.', ordem: 9 },
    { enunciado: 'Fístula arteriovenosa traumática: qual sinal clínico é patognomônico?', opcaoA: 'Edema distal ao trauma', opcaoB: 'Sopro contínuo (machinery murmur) sobre a lesão', opcaoC: 'Síndrome compartimental aguda', opcaoD: 'Hipotensão sem sangramento externo visível', opcaoE: 'Perda sensitiva no membro afetado', gabarito: 'B', disciplina: 'Cirurgia', tema: 'Cirurgia Vascular', dificuldade: 'dificil', explicacao: 'FAV traumática: shunt arteriovenoso → sopro e frêmito contínuo ("machinery murmur" — mais intenso na sístole, mas presente na diástole). Pode causar ICC de alto débito a longo prazo, isquemia distal, hipertensão venosa.', ordem: 10 },
    { enunciado: 'Esôfago de Barrett sem displasia confirmado. Conduta?', opcaoA: 'Esofagectomia preventiva', opcaoB: 'Ablação por radiofrequência imediata', opcaoC: 'IBP + endoscopia de vigilância a cada 3-5 anos', opcaoD: 'Cirurgia anti-refluxo (Nissen) para reversão', opcaoE: 'Apenas estilo de vida, sem IBP', gabarito: 'C', disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', dificuldade: 'medio', explicacao: 'Barrett sem displasia: IBP para controle sintomático + endoscopia a cada 3-5 anos. Displasia de baixo grau: ablação ou vigilância intensa. Displasia de alto grau: ablação por radiofrequência ou mucosectomia. Progressão para adenocarcinoma: 0,1-0,3%/ano (sem displasia).', ordem: 11 },
    { enunciado: 'Qual a principal causa de mortalidade nos primeiros 24h após trauma grave?', opcaoA: 'Sepse', opcaoB: 'Hemorragia incontrolada', opcaoC: 'Insuficiência respiratória', opcaoD: 'TCE grave', opcaoE: 'Falência de múltiplos órgãos', gabarito: 'B', disciplina: 'Cirurgia', tema: 'Trauma', dificuldade: 'facil', explicacao: 'Trimodalidade da morte por trauma: imediata (SNC + grandes vasos), precoce (< 24h, principal: hemorragia incontrolável — exsanguinação e TCE), tardia (dias a semanas: SIRS, sepse, FMO). Hemorragia é a causa mais comum de morte EVITÁVEL por trauma.', ordem: 12 },
    { enunciado: 'Isquemia mesentérica aguda: artéria mais frequentemente afetada?', opcaoA: 'Artéria mesentérica inferior', opcaoB: 'Artéria celíaca', opcaoC: 'Artéria mesentérica superior (AMS)', opcaoD: 'Tronco celíaco', opcaoE: 'Aorta abdominal', gabarito: 'C', disciplina: 'Cirurgia', tema: 'Cirurgia Vascular', dificuldade: 'medio', explicacao: 'Isquemia mesentérica aguda: AMS (embolia 50%, trombose 25%, vasospasmo 20%). Quadro: dor abdominal súbita intensa desproporcional ao exame. Diagnóstico: angioTC ou arteriografia. Tratamento: embolectomia + ressecção do intestino não viável. Alta mortalidade (60-90%).', ordem: 13 },
    { enunciado: 'Doença diverticular do cólon com abscesso pericólico (Hinchey II). Conduta?', opcaoA: 'Cirurgia imediata (Hartmann)', opcaoB: 'Drenagem percutânea guiada por TC + ATB IV', opcaoC: 'Apenas ATB IV sem drenagem', opcaoD: 'Colonoscopia urgente', opcaoE: 'Alta com ATB oral', gabarito: 'B', disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', dificuldade: 'medio', explicacao: 'Hinchey I (abscesso pericólico < 4cm): ATB IV. Hinchey II (abscesso à distância > 4cm): drenagem percutânea + ATB IV. Hinchey III (peritonite purulenta) e IV (fecal): cirurgia urgente. Tratamento conservador bem-sucedido → colectomia eletiva.', ordem: 14 },
    { enunciado: 'Pneumotórax espontâneo primário pequeno (< 20%), assintomático, primeira ocorrência. Conduta?', opcaoA: 'Drenagem em selo d\'água imediata', opcaoB: 'Toracoscopia diagnóstica', opcaoC: 'Observação + O2 suplementar → alta em 6h se estável', opcaoD: 'Pleurodese química imediata', opcaoE: 'Punção com agulha (cateter de Heimlich)', gabarito: 'C', disciplina: 'Cirurgia', tema: 'Cirurgia Torácica', dificuldade: 'medio', explicacao: 'PTX espontâneo primário pequeno (< 2cm da cúpula ou < 20% volume), assintomático: observação + O2 100% (acelera reabsorção) + RX em 6h. Alta se estável. Drenagem se: > 2cm, sintomático, segundo episódio, ou falha da observação.', ordem: 15 },
    { enunciado: 'Qual o estadiamento TNM de carcinoma gástrico com invasão da muscular própria, sem linfonodos, sem metástases?', opcaoA: 'T1N0M0 — Estágio IA', opcaoB: 'T2N0M0 — Estágio IB', opcaoC: 'T3N0M0 — Estágio IIA', opcaoD: 'T4aN0M0 — Estágio IIB', opcaoE: 'T2N1M0 — Estágio IIA', gabarito: 'B', disciplina: 'Cirurgia', tema: 'Oncologia Cirúrgica', dificuldade: 'dificil', explicacao: 'TNM gástrico: T1 = mucosa/submucosa; T2 = muscular própria; T3 = subserosa; T4a = serosa; T4b = estruturas adjacentes. T2N0M0 = Estágio IB. Tratamento: gastrectomia total ou subtotal + linfadenectomia D2.', ordem: 16 },
    { enunciado: 'Cirrose hepática com varizes esofágicas grandes (F3). Profilaxia primária de sangramento?', opcaoA: 'Escleroterapia endoscópica', opcaoB: 'TIPS (shunt portossistêmico trans-hepático)', opcaoC: 'Propranolol ou ligadura endoscópica a bandas', opcaoD: 'Apenas trinitrato de isossorbida', opcaoE: 'Sem necessidade de profilaxia em varizes grades', gabarito: 'C', disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', dificuldade: 'medio', explicacao: 'Profilaxia primária de HDA varicosa: betabloqueador não seletivo (propranolol, nadolol) OU ligadura endoscópica a bandas (LEB) têm eficácia equivalente. LEB preferida em intolerância ou contraindicação a BBloq. Escleroterapia não é 1ª escolha na profilaxia primária.', ordem: 17 },
    { enunciado: 'Toracotrauma: qual lesão é diagnosticada clinicamente e DEVE ser drenada ANTES da TC de tórax?', opcaoA: 'Contusão pulmonar', opcaoB: 'Pneumotórax hipertensivo', opcaoC: 'Hemotórax mínimo', opcaoD: 'Fratura de arco costal isolada', opcaoE: 'Derrame parapneumônico', gabarito: 'B', disciplina: 'Cirurgia', tema: 'Trauma', dificuldade: 'medio', explicacao: 'PTX hipertensivo: desvio traqueal contralateral + ausência de MV + hipotensão + turgência jugular = emergência clínica. DIAGNÓSTICO CLÍNICO → descompressão imediata (punção 2°EIC LMC) → drenagem. Perder tempo com TC pode ser fatal.', ordem: 18 },
    { enunciado: 'Litíase biliar assintomática em paciente diabética de 52 anos. Conduta?', opcaoA: 'Colecistectomia eletiva profilática', opcaoB: 'Dieta baixa em gordura e UDCA oral', opcaoC: 'Observação — colelitíase assintomática não requer cirurgia', opcaoD: 'CPRE para limpeza da via biliar', opcaoE: 'Litotripsia extracorpórea', gabarito: 'C', disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', dificuldade: 'medio', explicacao: 'Colelitíase assintomática: observação em geral. Cirurgia profilática discutida em: paciente com vesícula em porcelana (risco CCK), cálculo > 3cm, anemia falciforme, transplante planejado. Diabetes não é indicação absoluta de cirurgia profilática.', ordem: 19 },
    { enunciado: 'Trauma abdominal contuso, paciente instável. FAST positivo (líquido livre). Conduta?', opcaoA: 'TC abdome urgente', opcaoB: 'Laparotomia exploradora imediata', opcaoC: 'Drenagem percutânea', opcaoD: 'DPL (lavado peritoneal diagnóstico)', opcaoE: 'Observação e FAST repetido em 30 min', gabarito: 'B', disciplina: 'Cirurgia', tema: 'Trauma', dificuldade: 'medio', explicacao: 'Trauma abdominal + INSTABILIDADE hemodinâmica + FAST positivo: laparotomia exploradora IMEDIATA (controle de dano). TC só em pacientes estáveis. DPL substituído pelo FAST. A instabilidade hemdinâmica é o determinante da conduta.', ordem: 20 },
  ]
  for (const q of qMes3) await db.questao.create({ data: { ...q, provaId: provaMes3.id, geradaPorIA: false } })

  // ── QUESTÕES MÊS 4 — GO + Pediatria + Saúde Pública (20) ────────────────
  const qMes4 = [
    { enunciado: 'Gestante 32 semanas com RCIU (peso < P10). Exame mais importante para avaliar bem-estar fetal?', opcaoA: 'Cardiotocografia basal', opcaoB: 'Dopplervelocimetria da artéria umbilical', opcaoC: 'Biometria fetal semanal', opcaoD: 'Amniocentese', opcaoE: 'Perfil biofísico fetal isolado', gabarito: 'B', disciplina: 'Ginecologia', tema: 'Obstetrícia', dificuldade: 'dificil', explicacao: 'RCIU: Doppler umbilical é o exame de 1ª linha para avaliação hemodinâmica fetal. Fluxo diastólico ausente ou reverso = pior prognóstico → interrupção discutida. Doppler da ACM e ducto venoso complementam a avaliação.', ordem: 1 },
    { enunciado: 'Placenta prévia total: qual é a via de parto?', opcaoA: 'Parto vaginal com amniotomia precoce', opcaoB: 'Cesariana eletiva', opcaoC: 'Fórceps se dilatação > 8cm', opcaoD: 'Parto normal se placenta posterior', opcaoE: 'Depende da localização anterior ou posterior', gabarito: 'B', disciplina: 'Ginecologia', tema: 'Obstetrícia', dificuldade: 'facil', explicacao: 'Placenta prévia total: cesariana obrigatória (parto vaginal causaria descolamento placentário e hemorragia grave). Planejada às 36-37 semanas ou antes se sangramento. Preparar hemoderivados.', ordem: 2 },
    { enunciado: 'Puerpério de 5 dias. Febre 38,8°C, dor e hiperemia em mama esquerda. Diagnóstico e conduta?', opcaoA: 'Ingurgitamento: ordenha e anti-inflamatório', opcaoB: 'Mastite puerperal: amoxicilina-clavulanato + manter amamentação', opcaoC: 'Mastite: suspender amamentação + cefalexina', opcaoD: 'Abscesso mamário: suspender + drenagem imediata', opcaoE: 'Galactocele: aspiração e alta', gabarito: 'B', disciplina: 'Ginecologia', tema: 'Ginecologia Geral', dificuldade: 'medio', explicacao: 'Mastite puerperal (sem flutuação = sem abscesso): antibiótico (cefalexina ou amoxicilina-clavulanato cobre S.aureus) + MANTER amamentação (alivia estase, drena o leite). Abscesso (flutuação): drenagem cirúrgica + ATB + suspender amamentação no lado afetado.', ordem: 3 },
    { enunciado: 'HPV: vacina bivalente disponível no PNI para meninas 9-14 anos. Esquema?', opcaoA: '3 doses: 0, 1, 6 meses', opcaoB: '2 doses: 0 e 6 meses', opcaoC: '1 dose única', opcaoD: '2 doses: 0 e 12 meses', opcaoE: '3 doses: 0, 2, 6 meses para todos', gabarito: 'B', disciplina: 'Ginecologia', tema: 'Oncologia Ginecológica', dificuldade: 'facil', explicacao: 'PNI Brasil: HPV quadrivalente ou nonavalente. 9-14 anos (meninas e meninos): 2 doses (0 e 6 meses). ≥ 15 anos ou imunossuprimidos: 3 doses (0, 2, 6 meses). Protege contra HPV 6, 11, 16, 18 (quadrivalente) + 31, 33, 45, 52, 58 (nonavalente).', ordem: 4 },
    { enunciado: 'Trabalho de parto: fase ativa estacionada há 3h com DU adequada e LA claro. Variedade occipito-anterior. Conduta?', opcaoA: 'Cesariana imediata', opcaoB: 'Amniotomia + ocitocina', opcaoC: 'Parto instrumentado (fórceps)', opcaoD: 'Aguardar mais 4h', opcaoE: 'Morfina para relaxamento', gabarito: 'B', disciplina: 'Ginecologia', tema: 'Obstetrícia', dificuldade: 'medio', explicacao: 'Distócia de progressão com bolsa íntegra: amniotomia para estimular contrações. Se DU inadequada após amniotomia: ocitocina. Cesariana após falha da conduta ativa. Variedade OA = favorável para parto vaginal.', ordem: 5 },
    { enunciado: 'RN de 38 semanas, 5 min APGAR 4, FC 85, resposta ao estímulo fraca. Conduta?', opcaoA: 'Alta com orientações', opcaoB: 'VPP com máscara + O2', opcaoC: 'IOT + massagem cardíaca', opcaoD: 'Adrenalina IV umbilical', opcaoE: 'Surfactante profilático', gabarito: 'B', disciplina: 'Pediatria', tema: 'Neonatologia', dificuldade: 'medio', explicacao: 'APGAR 4-6 (depressão moderada): VPP com máscara a 40-60 rpm. Se FC < 60 após 30s de VPP efetiva: IOT + massagem cardíaca. FC é o parâmetro mais importante na reanimação neonatal, não o APGAR.', ordem: 6 },
    { enunciado: 'Icterícia neonatal: RN de 3 dias, a termo, bilirrubina total 15mg/dL (zona dérmica IV). Conduta?', opcaoA: 'Alta com sol — exposição ao sol direto', opcaoB: 'Fototerapia intensa', opcaoC: 'Exsanguinotransfusão', opcaoD: 'Apenas hidratação IV', opcaoE: 'Fenobarbital oral', gabarito: 'B', disciplina: 'Pediatria', tema: 'Neonatologia', dificuldade: 'medio', explicacao: 'Fototerapia: bilirrubina acima dos limites (Bhutani nomogram/tabela AAP por IG e idade). Zona IV já indica fototerapia intensive. Exsanguinotransfusão: bilirrubina muito elevada ou falha da fototerapia. Exposição ao sol é insuficiente e não recomendada como tratamento.', ordem: 7 },
    { enunciado: 'Criança de 6 anos com hiperatividade, desatenção e impulsividade em ≥ 2 ambientes há > 6 meses. Diagnóstico e tratamento de 1ª linha?', opcaoA: 'Autismo — ABA terapia', opcaoB: 'TDAH — metilfenidato + psicoeducação', opcaoC: 'Déficit cognitivo — escola especial', opcaoD: 'Ansiedade de separação — ISRS', opcaoE: 'Transtorno de conduta — antipsicótico', gabarito: 'B', disciplina: 'Pediatria', tema: 'Desenvolvimento', dificuldade: 'medio', explicacao: 'TDAH: tríade atenção/hiperatividade/impulsividade em ≥ 2 ambientes, > 6 meses, início < 12 anos. Tratamento: metilfenidato (estimulante) é o mais eficaz. Associar intervenção comportamental e psicoeducação familiar. > 6 anos: farmacoterapia + comportamental. < 6 anos: apenas comportamental.', ordem: 8 },
    { enunciado: 'Calendário vacinal PNI: vacina VIP (inativada) está no esquema básico para qual faixa etária?', opcaoA: 'Somente em surtos', opcaoB: '2, 4, 6 meses (3 doses) + reforço 15 meses e 4 anos', opcaoC: 'Apenas ao nascer', opcaoD: '12 meses dose única', opcaoE: 'Adolescentes não vacinados', gabarito: 'B', disciplina: 'Pediatria', tema: 'Imunização', dificuldade: 'facil', explicacao: 'VIP (Salk inativada): 2, 4, 6 meses + reforço 15 meses. VOP (Sabin oral) mantida na campanha e no reforço de 4 anos. Esquema atual: VIP primária + VOP nos reforços. Estratégia de erradicação global mantém VOP em campanhas.', ordem: 9 },
    { enunciado: 'Febre reumática: qual critério de Jones maior está presente em TODOS os casos sintomáticos?', opcaoA: 'Cardite', opcaoB: 'Poliartrite migratória', opcaoC: 'Coreia de Sydenham', opcaoD: 'Eritema marginado', opcaoE: 'Nenhum critério isolado é obrigatório', gabarito: 'E', disciplina: 'Pediatria', tema: 'Infectologia Pediátrica', dificuldade: 'dificil', explicacao: 'Critérios de Jones revisados: 2 maiores OU 1 maior + 2 menores + evidência de infecção estreptocócica. Maiores: cardite, artrite, coreia, eritema, nódulos. Nenhum critério isolado é obrigatório para diagnóstico. Cardite é o critério mais grave (sequelas). Artrite é o mais comum.', ordem: 10 },
    { enunciado: 'Taxa de mortalidade infantil de um município: 15 óbitos de < 1 ano / 1000 nascidos vivos. Interpretação?', opcaoA: 'Alta — indica colapso do sistema de saúde', opcaoB: 'Baixa — < 10 seria muito baixa, 15 é aceitável', opcaoC: 'Média — OMS considera < 10 como baixa; 15 é moderada', opcaoD: 'Não calculada corretamente', opcaoE: 'Comparável com países desenvolvidos', gabarito: 'C', disciplina: 'Saúde Pública', tema: 'Epidemiologia', dificuldade: 'facil', explicacao: 'TMI: óbitos < 1 ano / nascidos vivos × 1000. < 10 = baixa (países desenvolvidos); 10-29 = moderada; 30-49 = alta; ≥ 50 = muito alta. Brasil TMI 2022: ~12. Meta ODM 4: reduzir 2/3. Principal causa: neonatal precoce (< 7 dias) — prematuridade.', ordem: 11 },
    { enunciado: 'Tipo de estudo que melhor estabelece causalidade em epidemiologia?', opcaoA: 'Estudo transversal (prevalência)', opcaoB: 'Estudo de caso-controle', opcaoC: 'Ensaio clínico randomizado (ECR)', opcaoD: 'Estudo de coorte retrospectivo', opcaoE: 'Série de casos', gabarito: 'C', disciplina: 'Saúde Pública', tema: 'Epidemiologia', dificuldade: 'facil', explicacao: 'Hierarquia de evidências: ECR > coorte > caso-controle > transversal > série de casos. ECR é padrão-ouro pela randomização (controla confundimento). Caso-controle: bom para doenças raras. Coorte: bom para desfechos raros e temporalidade.', ordem: 12 },
    { enunciado: 'Síndrome de HELLP: critérios diagnósticos?', opcaoA: 'HAS + proteinúria + plaquetas < 50.000', opcaoB: 'Hemólise + enzimas hepáticas elevadas + plaquetas < 100.000', opcaoC: 'Edema + proteinúria + PA > 140/90', opcaoD: 'Convulsões + hipertensão + coma', opcaoE: 'Anemia + icterícia + insuficiência hepática', gabarito: 'B', disciplina: 'Ginecologia', tema: 'Obstetrícia', dificuldade: 'medio', explicacao: 'HELLP: H=Hemolysis (esquizócitos, LDH ↑, bilirrubinas ↑), EL=Elevated Liver enzymes (AST/ALT ↑), LP=Low Platelets (< 100.000). Pode ocorrer sem hipertensão ou proteinúria significativas. Tratamento: estabilizar + interromper gestação (> 34 semanas ou instabilidade materna).', ordem: 13 },
    { enunciado: 'Qual complicação está associada à macrossomia fetal (peso > 4kg)?', opcaoA: 'Prematuridade', opcaoB: 'Distócia de ombro', opcaoC: 'Descolamento prematuro de placenta', opcaoD: 'Malformações cardíacas', opcaoE: 'Microcefalia', gabarito: 'B', disciplina: 'Ginecologia', tema: 'Obstetrícia', dificuldade: 'medio', explicacao: 'Macrossomia: principal risco intraparto = distócia de ombro (ombro anterior impactado no púbis após saída da cabeça). Manobra de McRoberts (hiperflexão de quadris) + suprapúbica. Diabetes gestacional é principal causa de macrossomia. Indicação de cesariana se > 5000g.', ordem: 14 },
    { enunciado: 'Meningococcemia (meningococcemia sem meningite): antibiótico de escolha?', opcaoA: 'Amoxicilina VO', opcaoB: 'Penicilina G cristalina IV ou Ceftriaxona IV', opcaoC: 'Eritromicina VO', opcaoD: 'Azitromicina VO', opcaoE: 'Rifampicina VO', gabarito: 'B', disciplina: 'Pediatria', tema: 'Infectologia Pediátrica', dificuldade: 'medio', explicacao: 'Meningococcemia: Penicilina G cristalina 300.000 UI/kg/dia IV OU ceftriaxona 100mg/kg/dia IV. Profilaxia de contactantes domiciliares: rifampicina 2 dias (ou ciprofloxacino dose única em adultos). Mortalidade alta se choque meningocócico (púrpura fulminante).', ordem: 15 },
    { enunciado: 'Qual é o SINAN? Para que serve?', opcaoA: 'Sistema de Informação de Mortalidade — óbitos', opcaoB: 'Sistema de Informação de Agravos de Notificação — doenças de notificação compulsória', opcaoC: 'Sistema de Informações Hospitalares — internações SUS', opcaoD: 'Sistema de Nascidos Vivos — natalidade', opcaoE: 'Sistema de Regulação de Transplantes', gabarito: 'B', disciplina: 'Saúde Pública', tema: 'Epidemiologia', dificuldade: 'facil', explicacao: 'Sistemas de informação em saúde: SINAN (agravos de notificação), SIM (mortalidade), SINASC (nascimentos), SIH (hospitalizações), SIAB (atenção básica). SINAN alimenta a vigilância epidemiológica e permite detectar surtos.', ordem: 16 },
    { enunciado: 'Endometriose estágio IV: tratamento definitivo?', opcaoA: 'ACO combinado contínuo indefinidamente', opcaoB: 'Análogo de GnRH por 6 meses', opcaoC: 'Cirurgia (laparoscopia) com exérese de focos + tratamento clínico adjuvante', opcaoD: 'DIU de levonorgestrel isolado', opcaoE: 'Histerectomia total sempre', gabarito: 'C', disciplina: 'Ginecologia', tema: 'Ginecologia Geral', dificuldade: 'dificil', explicacao: 'Endometriose grave: tratamento cirúrgico laparoscópico com exérese/ablação dos focos é o padrão para estadio III-IV e infertilidade. Tratamento clínico (ACO, progestágenos, análogos GnRH) controla dor mas não elimina focos e é temporário. Histerectomia reservada para casos selecionados.', ordem: 17 },
    { enunciado: 'Percentil de peso de criança de 2 anos: P85-P97. Classificação pelo MS Brasil?', opcaoA: 'Eutrófica', opcaoB: 'Risco de sobrepeso', opcaoC: 'Sobrepeso', opcaoD: 'Obesidade', opcaoE: 'Baixo peso', gabarito: 'C', disciplina: 'Pediatria', tema: 'Nutrição Pediátrica', dificuldade: 'medio', explicacao: 'Classificação nutricional pediátrica (MS/OMS para P/I): < P3 = magreza acentuada; P3-P10 = magreza; P10-P85 = eutrófico; P85-P97 = risco de sobrepeso; > P97 = sobrepeso. Para > 5 anos: IMC/idade. Sobrepeso = P85-P97 nessa faixa.', ordem: 18 },
    { enunciado: 'Qual a definição de caso suspeito de dengue segundo o Ministério da Saúde?', opcaoA: 'Febre > 39°C + artralgia', opcaoB: 'Febre ≤ 7 dias + 2 sintomas (cefaleia, mialgia, artralgia, exantema, dor retroorbital) + área epidêmica', opcaoC: 'Febre + leucocitose + plaquetopenia', opcaoD: 'Febre + hemorragia + choque', opcaoE: 'Apenas confirmado por NS1 ou sorologia', gabarito: 'B', disciplina: 'Saúde Pública', tema: 'Epidemiologia', dificuldade: 'facil', explicacao: 'Caso suspeito de dengue: febre de início súbito ≤ 7 dias + ≥ 2 sintomas (cefaleia, mialgia, artralgia, prostração, exantema, dor retroorbital, petéquias) em área com transmissão ativa. NS1 e sorologia confirmam, mas não são obrigatórios para notificação.', ordem: 19 },
    { enunciado: 'Qual método anticoncepcional é CONTRAINDICADO em mulher com mioma uterino submucoso volumoso?', opcaoA: 'ACO combinado', opcaoB: 'DIU de cobre', opcaoC: 'Implante subdérmico', opcaoD: 'Injeção de medroxiprogesterona', opcaoE: 'Preservativo feminino', gabarito: 'B', disciplina: 'Ginecologia', tema: 'Ginecologia Geral', dificuldade: 'medio', explicacao: 'DIU de cobre: contraindicado em cavidade uterina distorcida por mioma submucoso (interfere na inserção e eficácia). Outros métodos podem ser usados. DIU levonorgestrel: também cautela em distorção importante. ACO pode ajudar a controlar o sangramento do mioma.', ordem: 20 },
  ]
  for (const q of qMes4) await db.questao.create({ data: { ...q, provaId: provaMes4.id, geradaPorIA: false } })

  // ── QUESTÕES MÊS 5 — Psiquiatria + Infectologia (20) ────────────────────
  const qMes5 = [
    { enunciado: 'Paciente com alucinações auditivas, delírios de perseguição, sem história de abuso de substâncias, há 8 meses. Qual diagnóstico?', opcaoA: 'Transtorno depressivo maior com características psicóticas', opcaoB: 'Transtorno esquizoafetivo', opcaoC: 'Esquizofrenia', opcaoD: 'Transtorno delirante', opcaoE: 'Psicose breve reativa', gabarito: 'C', disciplina: 'Psiquiatria', tema: 'Psicoses', dificuldade: 'facil', explicacao: 'Esquizofrenia: ≥ 2 critérios (delírios, alucinações, discurso desorganizado, sintomas negativos) por ≥ 6 meses com disfunção social. Psicose breve: < 1 mês. Transtorno delirante: delírios sem outros sintomas. Esquizoafetivo: psicose + episódio de humor simultâneos.', ordem: 1 },
    { enunciado: 'Fármaco de 1ª linha para transtorno de pânico?', opcaoA: 'Haloperidol', opcaoB: 'Alprazolam isolado (longo prazo)', opcaoC: 'ISRS (paroxetina ou sertralina)', opcaoD: 'Valproato de sódio', opcaoE: 'Propranolol', gabarito: 'C', disciplina: 'Psiquiatria', tema: 'Transtornos Ansiosos', dificuldade: 'facil', explicacao: 'Transtorno de pânico 1ª linha: ISRS (paroxetina, sertralina, escitalopram) + TCC. BDZ (alprazolam) para alívio agudo, evitar uso crônico (dependência). Propranolol para ansiedade de desempenho (situacional), não para pânico.', ordem: 2 },
    { enunciado: 'Episódio maníaco grave com agitação psicomotora: conduta de emergência?', opcaoA: 'Litio 300mg 3x/dia isolado', opcaoB: 'Haloperidol IM + lorazepam IM para sedação + estabilizador', opcaoC: 'Fluoxetina 20mg/dia', opcaoD: 'Diazepam VO', opcaoE: 'Carbamazepina VO isolada', gabarito: 'B', disciplina: 'Psiquiatria', tema: 'Emergências Psiquiátricas', dificuldade: 'medio', explicacao: 'Mania com agitação grave: sedação rápida com antipsicótico (haloperidol 5mg IM) + BDZ (lorazepam 2mg IM). Iniciar estabilizador (lítio ou valproato). Lítio sozinho demora 5-7 dias para efeito e não sedativa. Antidepressivo piora mania.', ordem: 3 },
    { enunciado: 'Parâmetro para monitorização do lítio (além do nível sérico)?', opcaoA: 'Hemograma mensal', opcaoB: 'Creatinina e TSH (função renal e tireoidiana)', opcaoC: 'ECG semanal', opcaoD: 'Enzimas hepáticas mensais', opcaoE: 'Glicemia de jejum', gabarito: 'B', disciplina: 'Psiquiatria', tema: 'Transtornos de Humor', dificuldade: 'medio', explicacao: 'Lítio: monitorar periodicamente creatinina/TFG (nefrotoxicidade) e TSH (hipotireoidismo em 20-40% dos casos). Nível sérico terapêutico: 0,6-1,2 mEq/L (tóxico > 1,5). Intoxicação: tremor grosseiro, ataxia, confusão, convulsão → diálise em casos graves.', ordem: 4 },
    { enunciado: 'HIV: contagem de CD4 200, carga viral 45.000. Qual profilaxia é obrigatória?', opcaoA: 'Fluconazol para candidíase', opcaoB: 'Sulfametoxazol-trimetoprim (SMX-TMP) contra P. jirovecii e Toxoplasma', opcaoC: 'Aciclovir profilático', opcaoD: 'Isoniazida imediata independente do PPD', opcaoE: 'Rifampicina profilática', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Infectologia', dificuldade: 'medio', explicacao: 'CD4 < 200: SMX-TMP profilaxia primária contra Pneumocystis jirovecii (PCP) e Toxoplasma. Pode ser suspenso se CD4 > 200 por ≥ 3 meses sob TARV. Isoniazida: profilaxia de ILTB (indicada em PVHIV com PPD ≥ 5mm, excluindo TB ativa).', ordem: 5 },
    { enunciado: 'Sífilis terciária: manifestação mais temida?', opcaoA: 'Cancro duro', opcaoB: 'Rash palmoplantar', opcaoC: 'Aneurisma sifilítico de aorta + goma + neurossífilis', opcaoD: 'Condiloma lata', opcaoE: 'Lesão oral', gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Infectologia', dificuldade: 'medio', explicacao: 'Sífilis terciária (anos após infecção não tratada): gomas sifilíticas (granulomas), sífilis cardiovascular (aortite + aneurisma de aorta ascendente, insuficiência aórtica), neurossífilis (tabes dorsalis, demência). Tratamento: penicilina G cristalina IV por 10-14 dias.', ordem: 6 },
    { enunciado: 'Dengue com sinais de alarme: plaquetas 45.000, hematócrito 50% (aumento 20%). Grupo de classificação?', opcaoA: 'Grupo A — ambulatorial', opcaoB: 'Grupo B — hidratação supervisionada', opcaoC: 'Grupo C — internação + hidratação IV', opcaoD: 'Grupo D — UTI', opcaoE: 'Sem classificação — apenas plaquetopenia', gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Infectologia', dificuldade: 'medio', explicacao: 'Grupo C (sinais de alarme): dor abdominal intensa, vômitos persistentes, acúmulo de líquidos, sangramento de mucosas, letargia, hematócrito crescente ≥ 20%, plaquetas < 50.000. Internação + hidratação IV + monitorização. Grupo D: choque.', ordem: 7 },
    { enunciado: 'Tuberculose em HIV+ com CD4 50: quando iniciar TARV após iniciar RIPE?', opcaoA: 'Só após completar RIPE (6 meses)', opcaoB: 'Após 2 semanas (2ª a 4ª semana), exceto em meningite TB', opcaoC: 'Simultaneamente ao RIPE', opcaoD: 'Após 2 meses', opcaoE: 'Após CD4 subir para 200', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Infectologia', dificuldade: 'dificil', explicacao: 'TB + HIV CD4 < 50: iniciar TARV em 2 semanas após RIPE (estudo ACTG A5221 STRIDE). Exceção: TB do SNC (meningite) — aguardar 8 semanas (SDRC mais grave). Rifampicina induz CYP3A4 → usar dolutegravir (mais estável que efavirenz).', ordem: 8 },
    { enunciado: 'Qual dermatose apresenta pápulas pruriginosas com túneis lineares entre os dedos e piora noturna?', opcaoA: 'Psoríase vulgar', opcaoB: 'Escabiose (sarna)', opcaoC: 'Dermatite atópica', opcaoD: 'Urticária aguda', opcaoE: 'Líquen plano', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Dermatologia', dificuldade: 'facil', explicacao: 'Escabiose: Sarcoptes scabiei. Túneis (burrows) + pápulas pruriginosas entre os dedos, punhos, axilas, genitais. Prurido noturno característico. Tratamento: permetrina 5% tópica (noite, corpo todo exceto face) × 2 aplicações. Tratamento de todos os contactantes simultâneo.', ordem: 9 },
    { enunciado: 'Febre tifoide: antibiótico de 1ª escolha e contraindicado nesta doença?', opcaoA: 'Amoxicilina — cloranfenicol contraindicado', opcaoB: 'Ciprofloxacino — cloranfenicol antigamente usado mas mantém atividade', opcaoC: 'Metronidazol — ampicilina contraindicada', opcaoD: 'Cloranfenicol — penicilina contraindicada', opcaoE: 'Azitromicina — tetraciclina contraindicada', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Infectologia', dificuldade: 'medio', explicacao: 'Febre tifoide (Salmonella typhi): 1ª linha fluoroquinolona (ciprofloxacino) ou ceftriaxona se resistente. Azitromicina para resistentes. Cloranfenicol foi 1ª linha histórica (ainda eficaz, mas resistência crescente e toxicidade). Perfuração intestinal: cirurgia.', ordem: 10 },
    { enunciado: 'Lúpus com nefrite lúpica (proteína 2g/24h, hematúria, C3/C4 baixos, anti-DNA alto). Tratamento imunossupressor de 1ª linha?', opcaoA: 'Cloroquina isolada', opcaoB: 'Metotrexato IM', opcaoC: 'Pulsoterapia com metilprednisolona + ciclofosfamida ou micofenolato', opcaoD: 'Rituximabe imediato', opcaoE: 'Tacrolimus isolado', gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Reumatologia', dificuldade: 'dificil', explicacao: 'Nefrite lúpica proliferativa (classes III/IV): indução com pulsoterapia de metilprednisolona + ciclofosfamida (NIH) ou micofenolato mofetil (preferido por menor gonadotoxicidade). Hidroxicloroquina como base para todos os pacientes lúpicos. Manutenção: micofenolato ou azatioprina.', ordem: 11 },
    { enunciado: 'Transtorno depressivo maior: critério mínimo de duração dos sintomas?', opcaoA: '1 semana', opcaoB: '2 semanas', opcaoC: '1 mês', opcaoD: '6 meses', opcaoE: 'Sem critério de duração', gabarito: 'B', disciplina: 'Psiquiatria', tema: 'Transtornos de Humor', dificuldade: 'facil', explicacao: 'DSM-5: episódio depressivo maior = ≥ 5 sintomas por ≥ 2 semanas consecutivas, representando mudança do funcionamento prévio. Humor deprimido ou anedonia = obrigatório. Distimia: humor deprimido por ≥ 2 anos (menos intenso). Luto normal: < 2 semanas, sem comprometimento grave.', ordem: 12 },
    { enunciado: 'Hepatite B aguda ictérica, bilirrubina 8, INR 1,2, assintomático além da icterícia. Conduta?', opcaoA: 'Tenofovir imediato', opcaoB: 'Suporte clínico — 95% resolvem espontaneamente', opcaoC: 'Corticoide para ictérica grave', opcaoD: 'Transplante hepático de urgência', opcaoE: 'Interferon-alfa', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Infectologia', dificuldade: 'medio', explicacao: 'HBV aguda: resolução espontânea em > 95% dos adultos imunocompetentes. Tratamento de suporte (repouso, hidratação). Antiviral indicado em: hepatite fulminante (INR > 1,5), imunossuprimidos, gestantes, coinfecção HCV/HDV. Monitorar por 6 meses para cronicidade (HBsAg+).', ordem: 13 },
    { enunciado: 'Ceratose actínica (carcinoma in situ) em homem de 60 anos, área de sol. Conduta?', opcaoA: 'Biopsia excisional imediata', opcaoB: 'Criocirurgia, 5-fluorouracil tópico ou imiquimode', opcaoC: 'Apenas protetor solar e reavaliação', opcaoD: 'Radioterapia local', opcaoE: 'Esfoliação química profunda', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Dermatologia', dificuldade: 'medio', explicacao: 'Ceratose actínica: lesão pré-maligna (risco ~1-5% de progressão para CEC/ano). Tratamento lesão única: crioterapia. Lesões múltiplas/campo de cancerização: 5-FU 5% tópico (2x/dia × 4 semanas) ou imiquimode. Dermatoabrasão ou peeling para múltiplas lesões. Vigilância semestral.', ordem: 14 },
    { enunciado: 'Leishmania visceral (Calazar): tratamento de 1ª linha no Brasil?', opcaoA: 'Pentamidina IM', opcaoB: 'Miltefosina VO', opcaoC: 'Anfotericina B lipossomal IV', opcaoD: 'Antimoniato de meglumina IM (Glucantime)', opcaoE: 'Ivermectina VO', gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Infectologia', dificuldade: 'dificil', explicacao: 'Calazar no Brasil (Ministério da Saúde 2023): Anfotericina B lipossomal IV é 1ª linha (menor toxicidade vs desoxicolato). Glucantime IM = 2ª linha (cardiotoxicidade, resistência crescente). Indicação hospitalar obrigatória. Febre + esplenomegalia + pancitopenia em área endêmica = suspeitar Calazar.', ordem: 15 },
    { enunciado: 'TOC com obsessões de contaminação e compulsões de lavagem (3h/dia). Tratamento combinado de maior eficácia?', opcaoA: 'Benzodiazepínico + TCC', opcaoB: 'ISRS em dose alta + TCC com ERP (exposição e prevenção de resposta)', opcaoC: 'Antipsicótico isolado', opcaoD: 'Lítio + psicoeducação', opcaoE: 'Apenas apoio familiar', gabarito: 'B', disciplina: 'Psiquiatria', tema: 'Transtornos Ansiosos', dificuldade: 'medio', explicacao: 'TOC: melhor resposta com combinação ISRS (fluoxetina, sertralina em dose alta — maior que para depressão) + TCC com ERP. Resposta parcial ao ISRS: adicionar antipsicótico atípico (risperidona). BDZ pode piorar TOC (reduz ansiedade que motivaria ERP).', ordem: 16 },
    { enunciado: 'Qual é o mecanismo de ação do metronidazol na Giardia lamblia?', opcaoA: 'Inibe síntese da parede celular', opcaoB: 'Forma radicais livres tóxicos ao DNA anaeróbio', opcaoC: 'Bloqueia síntese de ácido fólico', opcaoD: 'Inibe síntese proteica ribossomial', opcaoE: 'Inibe topoisomerase II', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Infectologia', dificuldade: 'medio', explicacao: 'Metronidazol (imidazol): reduzido em condições anaeróbias a radical nitroso → quebra de fitas de DNA. Eficaz contra protozoários (Giardia, Trichomonas, Entamoeba) e bactérias anaeróbias (Bacteroides, C. difficile leve-mod). Não cobre aeróbios.', ordem: 17 },
    { enunciado: 'Efeito adverso MAIS comum dos antipsicóticos de 1ª geração?', opcaoA: 'Síndrome metabólica', opcaoB: 'Agranulocitose', opcaoC: 'Sintomas extrapiramidais (SEP)', opcaoD: 'Hiperprolactinemia isolada', opcaoE: 'Ganho de peso', gabarito: 'C', disciplina: 'Psiquiatria', tema: 'Psicoses', dificuldade: 'facil', explicacao: 'Antipsicóticos 1ª geração (haloperidol, clorpromazina): SEP = distonias agudas, parkinsonismo medicamentoso, acatisia, discinesia tardia (irreversível). 2ª geração (atípicos): menor SEP mas maior síndrome metabólica, ganho de peso. Clozapina: agranulocitose (monitorar neutrófilos).', ordem: 18 },
    { enunciado: 'Infecção pelo SARS-CoV-2 com SpO2 92%, FR 28, sem necessidade de ventilação. Tratamento?', opcaoA: 'Ivermectina + cloroquina', opcaoB: 'Dexametasona 6mg/dia + O2 suplementar', opcaoC: 'Antibiótico profilático para pneumonia bacteriana', opcaoD: 'Alta sem tratamento específico', opcaoE: 'Azitromicina + hidroxicloroquina', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Infectologia', dificuldade: 'medio', explicacao: 'COVID-19 grave (SpO2 < 94%, necessidade de O2): dexametasona 6mg/dia IV ou VO por 10 dias (RECOVERY trial: reduz mortalidade 35% em pacientes em O2). Antivirais (remdesivir, nirmatrelvir/ritonavir): indicados em fases precoces (< 5-7 dias) em pacientes de alto risco.', ordem: 19 },
    { enunciado: 'Síndrome de abstinência de benzodiazepínico: principal risco e tratamento?', opcaoA: 'Depressão grave — ISRS', opcaoB: 'Convulsões — desmame gradual do próprio BDZ', opcaoC: 'Psicose — antipsicótico', opcaoD: 'Delirium apenas em idosos', opcaoE: 'Sem risco de convulsão (diferente do álcool)', gabarito: 'B', disciplina: 'Psiquiatria', tema: 'Dependência Química', dificuldade: 'medio', explicacao: 'Abstinência de BDZ (semelhante ao álcool — ambos GABAérgicos): ansiedade, tremor, insônia, convulsões, delirium. Risco de convulsões e morte. Tratamento: desmame gradual (redução 10-25%/semana) do próprio BDZ ou substituição por diazepam de ação longa. Nunca suspender abruptamente.', ordem: 20 },
  ]
  for (const q of qMes5) await db.questao.create({ data: { ...q, provaId: provaMes5.id, geradaPorIA: false } })

  // ── QUESTÕES MÊS 6 — Revisão Final (20) ────────────────────────────────
  const qMes6 = [
    { enunciado: 'ACLS: paciente em parada cardiorrespiratória com ritmo de assistolia. Qual fármaco é indicado?', opcaoA: 'Amiodarona 300mg IV', opcaoB: 'Adrenalina 1mg IV a cada 3-5 min', opcaoC: 'Atropina 1mg IV', opcaoD: 'Bicarbonato 1mEq/kg', opcaoE: 'Vasopressina 20UI', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'medio', explicacao: 'Assistolia/AESP: ritmo não chocável. Adrenalina 1mg IV a cada 3-5 min + RCP contínua. Atropina foi removida do ACLS 2010 para assistolia. Amiodarona apenas para FV/TV. Identificar e tratar causas reversíveis (5H/5T).', ordem: 1 },
    { enunciado: 'Eritroblastose fetal por incompatibilidade Rh: quando administrar imunoglobulina anti-D (Rhogam)?', opcaoA: 'Apenas após o parto', opcaoB: '28 semanas + até 72h após o parto em mãe Rh- com RN Rh+', opcaoC: 'Apenas se coombs indireto positivo', opcaoD: 'Somente em hemorragias durante a gestação', opcaoE: 'Não é mais utilizada', gabarito: 'B', disciplina: 'Ginecologia', tema: 'Obstetrícia', dificuldade: 'medio', explicacao: 'Profilaxia Rh: imunoglobulina anti-D (300mcg) em mãe Rh- com parceiro Rh+ às 28 semanas + em até 72h após parto de RN Rh+. Também após: aborto, gravidez ectópica, amniocentese, versão cefálica externa, hemorragia anteparto. Não administrar se coombs indireto+ (já sensibilizada).', ordem: 2 },
    { enunciado: 'Síndrome coronariana aguda sem supradesnivelamento de ST (NSTEMI), alto risco (GRACE > 140). Estratégia preferida?', opcaoA: 'Tratamento conservador com apenas medicação', opcaoB: 'Estratégia invasiva precoce (cateterismo em < 24h)', opcaoC: 'Fibrinólise IV', opcaoD: 'Estratégia invasiva seletiva apenas se isquemia recorrente', opcaoE: 'Aguardar estabilização clínica por 72h antes de qualquer invasão', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Cardiologia', dificuldade: 'dificil', explicacao: 'NSTEMI alto risco (GRACE > 140, troponina+, instabilidade hemodinâmica, isquemia recorrente): estratégia invasiva precoce (< 24h). Risco muito alto (refratário, choque): imediata. Baixo risco: estratégia conservadora ou invasiva seletiva. IAMCSST: cateterismo em < 90 min.', ordem: 3 },
    { enunciado: 'Qual fármaco é de escolha para crises de status epilepticus refratário (3ª linha)?', opcaoA: 'Diazepam retal', opcaoB: 'Fenitoína IV', opcaoC: 'Midazolam intranasal', opcaoD: 'Propofol IV em infusão contínua (anestesia geral)', opcaoE: 'Lorazepam IV', gabarito: 'D', disciplina: 'Clínica Médica', tema: 'Neurologia', dificuldade: 'dificil', explicacao: 'Status epilepticus: 1ª linha = BDZ (lorazepam IV, diazepam retal, midazolam IM). 2ª linha = fenitoína/fosfenitoína, valproato, levetiracetam IV. 3ª linha (refratário, > 30 min ou 2 agentes sem resposta): anestesia geral (propofol, midazolam, tiopental em infusão contínua com EEG contínuo).', ordem: 4 },
    { enunciado: 'Criança de 18 meses que não fala (nenhuma palavra), não aponta, não faz contato visual. Diagnóstico provável?', opcaoA: 'TDAH', opcaoB: 'Deficiência auditiva (hipoacusia)', opcaoC: 'Transtorno do Espectro Autista (TEA)', opcaoD: 'Atraso global do desenvolvimento', opcaoE: 'Depressão infantil', gabarito: 'C', disciplina: 'Pediatria', tema: 'Desenvolvimento', dificuldade: 'medio', explicacao: 'TEA sinais de alerta precoce: sem balbucio aos 12m, sem palavras aos 16m, sem frases 2 palavras aos 24m, perda de habilidades adquiridas. Marcos sociais: não aponta, não faz contato visual, não responde ao nome. Encaminhar imediatamente para avaliação multidisciplinar + AASI (audição).', ordem: 5 },
    { enunciado: 'Qual é o mecanismo principal da ação do sulfato de magnésio na pré-eclâmpsia grave?', opcaoA: 'Anti-hipertensivo direto', opcaoB: 'Neuroproteção e anticonvulsivante (bloqueio receptor NMDA + vasodilatação cerebral)', opcaoC: 'Tocolítico para cessar contrações', opcaoD: 'Diurético para reduzir edema', opcaoE: 'Anti-inflamatório placentário', gabarito: 'B', disciplina: 'Ginecologia', tema: 'Obstetrícia', dificuldade: 'dificil', explicacao: 'MgSO4 na pré-eclâmpsia: antagonista de receptor NMDA + vasodilatação cerebral → previne convulsões (eclâmpsia). Não é anti-hipertensivo primário (reduz PA marginalmente). Estudo Magpie: reduz eclâmpsia em 58%. Toxicidade: reflexos abolidos (8-12 mEq/L), paralisia (15 mEq/L). Antídoto: gluconato de Ca.', ordem: 6 },
    { enunciado: 'Pancreatite aguda biliar grave. Quando a CPRE está indicada?', opcaoA: 'Rotineiramente em toda pancreatite biliar', opcaoB: 'Apenas se coledocolitíase confirmada + colangite aguda concomitante', opcaoC: 'Após 72h em todos os casos', opcaoD: 'Imediatamente em toda pancreatite grave', opcaoE: 'Apenas para diagnóstico diferencial', gabarito: 'B', disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', dificuldade: 'dificil', explicacao: 'CPRE na pancreatite biliar: indicada se: colangite aguda (febre + icterícia + dor = Charcot) OU coledocolitíase confirmada com obstrução. Em pancreatite biliar sem colangite: CPRE precoce NÃO melhora prognóstico (vários RCT). Colecistectomia eletiva na mesma internação após resolução.', ordem: 7 },
    { enunciado: 'Fratura de fêmur proximal em idosa de 78 anos. Melhor tempo para cirurgia?', opcaoA: '>72h — aguardar otimização clínica completa', opcaoB: 'Nas primeiras 48h — reduz mortalidade e complicações', opcaoC: 'Apenas após resolver todas as comorbidades', opcaoD: 'Sem urgência — 2 semanas com tração', opcaoE: 'Imediata se acordada (< 6h)', gabarito: 'B', disciplina: 'Cirurgia', tema: 'Ortopedia', dificuldade: 'medio', explicacao: 'Fratura de quadril em idosos: cirurgia precoce (< 48h) reduz mortalidade, TVP, escaras, tempo de hospitalização. Mobilização precoce pós-operatória é fundamental. Atraso > 48h aumenta mortalidade em ~40% no 1° ano. Otimização clínica rápida sem atraso desnecessário.', ordem: 8 },
    { enunciado: 'DPOC exacerbação moderada sem indicação de UTI. Tratamento?', opcaoA: 'Apenas broncodilatadores inalados', opcaoB: 'SABA + SAMA inalados + corticoide sistêmico + ATB + considerar VNI', opcaoC: 'Intubação orotraqueal profilática', opcaoD: 'Azitromicina IV por 5 dias isolado', opcaoE: 'Corticoide isolado', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Pneumologia', dificuldade: 'medio', explicacao: 'Exacerbação DPOC hospitalar: broncodilatadores inalados (SABA + SAMA) + corticoide sistêmico (prednisolona 40mg/dia × 5 dias) + ATB se: escarro purulento/aumento de escarro/dispneia (amoxicilina-clavulanato ou quinolona respiratória) + VNI se hipercapnia/acidose (pH 7,25-7,35).', ordem: 9 },
    { enunciado: 'Diagnóstico diferencial entre AR e artropatia por gota: qual exame distingue definitivamente?', opcaoA: 'Fator reumatoide', opcaoB: 'Anti-CCP', opcaoC: 'Análise do líquido sinovial (cristais de urato monossódico birrefringentes negativos)', opcaoD: 'Ácido úrico sérico', opcaoE: 'VSH e PCR', gabarito: 'C', disciplina: 'Clínica Médica', tema: 'Reumatologia', dificuldade: 'medio', explicacao: 'Artrite gotosa: cristais de urato monossódico aciculados birrefringentes negativos (amarelos paralelos ao compensador). AR: ausência de cristais, às vezes FR+ (70%) e anti-CCP (95% especificidade). Ácido úrico normal não exclui gota (durante a crise pode estar normal).', ordem: 10 },
    { enunciado: 'Criança de 4 anos com otite média aguda (OMA), sem melhora em 48h com amoxicilina. Próxima conduta?', opcaoA: 'Suspender antibiótico e observar', opcaoB: 'Amoxicilina-clavulanato ou ceftriaxona IM (3 dias)', opcaoC: 'Miringotomia imediata', opcaoD: 'Azitromicina por 5 dias', opcaoE: 'Timpanotomia com tubo de ventilação', gabarito: 'B', disciplina: 'Pediatria', tema: 'Infectologia Pediátrica', dificuldade: 'medio', explicacao: 'OMA sem melhora em 48-72h de amoxicilina: suspeitar resistência por H. influenzae produtor de beta-lactamase → amoxicilina-clavulanato 80-90mg/kg/dia amox. Alternativa: ceftriaxona IM 3 dias (boa penetração timpânica). OMA recorrente ≥ 3 crises/6 meses: tubos de ventilação.', ordem: 11 },
    { enunciado: 'Paciente com TEP maciço em choque: tPA contraindicado (cirurgia recente). Alternativa?', opcaoA: 'Embolectomia cirúrgica de emergência', opcaoB: 'Anticoagulação plena com HBPM', opcaoC: 'NOAC (rivaroxabana)', opcaoD: 'Filtro de veia cava inferior', opcaoE: 'Aguardar resolução espontânea', gabarito: 'A', disciplina: 'Clínica Médica', tema: 'Pneumologia', dificuldade: 'dificil', explicacao: 'TEP maciço com contraindicação à trombólise sistêmica: embolectomia cirúrgica (mortalidade 30-40% mas melhor que sem tratamento) OU trombólise local guiada por cateter (menor dose, menor risco hemorrágico). Anticoagulação sozinha é insuficiente no choque.', ordem: 12 },
    { enunciado: 'Qual vacina é CONTRAINDICADA em gestante?', opcaoA: 'Influenza inativada', opcaoB: 'Hepatite B', opcaoC: 'dTpa (difteria, tétano, coqueluche acelular)', opcaoD: 'Febre amarela (vírus vivo atenuado)', opcaoE: 'Pneumocócica conjugada', gabarito: 'D', disciplina: 'Ginecologia', tema: 'Obstetrícia', dificuldade: 'facil', explicacao: 'Vacinas com vírus vivos atenuados contraindicadas na gestação: febre amarela (exceto áreas de alto risco endêmico), varicela, sarampo-rubéola-caxumba. Permitidas: influenza inativada (recomendada), hepatite B, dTpa (recomendada 27-36 sem para proteção do RN), pneumocócica, raiva.', ordem: 13 },
    { enunciado: 'Varredura do câncer colorretal com colonoscopia: quando iniciar em paciente com PAF (Polipose Adenomatosa Familiar)?', opcaoA: '50 anos como a população geral', opcaoB: '30 anos', opcaoC: 'Desde a adolescência (10-12 anos)', opcaoD: 'Após 1° caso familiar identificado (independente da idade)', opcaoE: 'Apenas se sintomático', gabarito: 'C', disciplina: 'Cirurgia', tema: 'Oncologia Cirúrgica', dificuldade: 'medio', explicacao: 'PAF clássica (mutação APC): colonoscopia anual a partir dos 10-12 anos. Risco de CCR chega a 100% se não tratado. Colectomia profilática antes dos 20-25 anos. Lynch (HNPCC): colonoscopia a cada 1-2 anos a partir dos 20-25 anos (ou 5 anos antes do caso mais jovem da família).', ordem: 14 },
    { enunciado: 'Glomerulonefrite rapidamente progressiva (GNRP): apresentação clínica e diagnóstico?', opcaoA: 'Síndrome nefrótica + biópsia com glomerulosclerose focal', opcaoB: 'Perda rápida de função renal (dias/semanas) + hematúria + proteinúria + crescentes à biópsia', opcaoC: 'IRA oligúrica pós-cirurgia + cilindros granulosos', opcaoD: 'Hematúria assintomática isolada + biópsia normal', opcaoE: 'Síndrome nefrótica + depósitos mesangiais de IgA', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Nefrologia', dificuldade: 'dificil', explicacao: 'GNRP: deterioração rápida da função renal (horas/dias) + síndrome nefrítica + crescentes em > 50% dos glomérulos na biópsia. Causas: vasculites ANCA+ (GPA, MPA), Goodpasture (anti-MBG), LES. Tratamento: pulsoterapia + ciclofosfamida + plasmaférese (Goodpasture). Prognóstico ruim sem tratamento precoce.', ordem: 15 },
    { enunciado: 'Qual o índice de APGAR avalia aos 5 minutos? O que indica APGAR 7-10?', opcaoA: 'Avalia apenas frequência cardíaca; 7-10 = ótimo', opcaoB: 'Vitalidade geral: FC, respiração, tônus, irritabilidade, cor; 7-10 = boa vitalidade/normal', opcaoC: 'Apenas cor da pele; 7 é limítrofe', opcaoD: 'APGAR não é usado nos 5 minutos', opcaoE: 'Avalia metabolismo; 7 indica acidose leve', gabarito: 'B', disciplina: 'Pediatria', tema: 'Neonatologia', dificuldade: 'facil', explicacao: 'APGAR: Atividade (tônus), Pulso (FC), Grimace (reflexo), Aparência (cor), Respiração. 0-3 = depressão grave, 4-6 = moderada, 7-10 = boa vitalidade. Avaliado 1 e 5 minutos. Se < 7 aos 5 min: repetir a cada 5 min até 20 min. NÃO é o parâmetro principal para iniciar reanimação (FC é).', ordem: 16 },
    { enunciado: 'Qual medicação é de 1ª linha para hipertensão em gestante?', opcaoA: 'Enalapril', opcaoB: 'Losartana', opcaoC: 'Metildopa ou nifedipina', opcaoD: 'Furosemida', opcaoE: 'Espironolactona', gabarito: 'C', disciplina: 'Ginecologia', tema: 'Obstetrícia', dificuldade: 'medio', explicacao: 'Anti-hipertensivos seguros na gestação: metildopa (mais utilizado), nifedipina, labetalol, hidralazina. Contraindicados: IECA e BRA (fetotoxicidade, oligodrâmnio, malformações renais), betabloqueadores em doses altas (RCIU), diuréticos (reduzem volemia já comprometida).', ordem: 17 },
    { enunciado: 'Tumor de Wilms (nefroblastoma): em qual faixa etária é mais comum e qual o tratamento?', opcaoA: 'Adultos > 40 anos — cirurgia + quimio', opcaoB: 'Adolescentes — radioterapia exclusiva', opcaoC: 'Crianças 1-5 anos — nefrectomia + quimioterapia ± RT', opcaoD: 'RN — manejo conservador', opcaoE: 'Lactentes < 1 ano — apenas quimioterapia', gabarito: 'C', disciplina: 'Pediatria', tema: 'Oncologia Pediátrica', dificuldade: 'medio', explicacao: 'Tumor de Wilms: neoplasia renal mais comum em crianças (pico 3-4 anos). Apresentação: massa abdominal assintomática + hematúria. Diagnóstico: US + TC. Tratamento: nefrectomia radical + quimioterapia (actinomicina D + vincristina) ± radioterapia. Sobrevida > 90% em estágios I-II.', ordem: 18 },
    { enunciado: 'Efeito adverso mais grave da vancomicina IV em infusão rápida?', opcaoA: 'Nefrotoxicidade isolada', opcaoB: 'Síndrome do homem vermelho (flushing + hipotensão) + anafilaxia', opcaoC: 'Ototoxicidade irreversível', opcaoD: 'Hepatotoxicidade grave', opcaoE: 'Trombocitopenia', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Infectologia', dificuldade: 'medio', explicacao: 'Vancomicina rápida (< 60 min): liberação de histamina → síndrome do homem vermelho (eritema, prurido, flushing, hipotensão). NÃO é reação alérgica verdadeira — não é IgE-mediada. Prevenção: infundir em ≥ 60 min. Nefrotoxicidade e ototoxicidade com uso prolongado/altas doses. Monitorar: nível sérico, creatinina.', ordem: 19 },
    { enunciado: 'Qual a principal causa de insuficiência adrenal aguda (crise addisoniana) em paciente previamente hígido?', opcaoA: 'Supressão por corticoide exógeno crônico', opcaoB: 'Hemorragia adrenal bilateral (Síndrome de Waterhouse-Friderichsen — meningococcemia)', opcaoC: 'Hipopituitarismo pós-irradiação', opcaoD: 'Tumor de adrenal bilateral', opcaoE: 'Doença de Addison autoimune crônica', gabarito: 'B', disciplina: 'Clínica Médica', tema: 'Endocrinologia', dificuldade: 'dificil', explicacao: 'Síndrome de Waterhouse-Friderichsen: hemorragia adrenal bilateral em meningococcemia/sepse grave → insuficiência adrenal aguda fulminante. Quadro: choque + púrpura + meningite. Tratamento: hidrocortisona IV 100mg bolus + reposição volêmica. Principal causa aguda em hígido; Addison é crônica.', ordem: 20 },
  ]
  for (const q of qMes6) await db.questao.create({ data: { ...q, provaId: provaMes6.id, geradaPorIA: false } })

  console.log('✅ Questões criadas: 80')

  // Usuário novo — sem progresso, sem testes, sem notas
  console.log('✅ Progresso: zerado (usuário novo)')
  console.log('✅ Testes e notas: zerado (usuário novo)')

  console.log('\n🎉 Seed v3 — 6 meses concluído!')
  console.log('   📧 alanis@med.com | 🔑 alanis123')
  console.log('   🏆 54 aulas | 10 provas | 200 questões | 10 badges | 6 meses de conteúdo')
}

main()
  .then(async () => { await db.$disconnect() })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e)
    await db.$disconnect()
    process.exit(1)
  })
