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
      descricao: 'Diagnóstico, estratificação de risco e tratamento. Metas pressóricas e farmacoterapia de primeira e segunda linha.',
      disciplina: 'Clínica Médica', tema: 'Cardiologia', tipo: 'video', nivel: 'basico',
      duracao: 45, ordem: 1, mes: 1, semana: 1,
      videoUrl: 'https://www.youtube.com/watch?v=PfCPaFjq_I8',
      conteudo: `**Diagnóstico (PA ≥ 140/90 mmHg):** Confirmação em ≥ 2 ocasiões, 5 min repouso, sem deambulação prévia\n\n**Estratificação de Risco Cardiovascular:** Baixo, moderado, alto e muito alto conforme PA + fatores de risco (tabagismo, diabetes, dislipidemia, obesidade, histórico familiar)\n\n**Metas:** < 130/80 mmHg (geral) | < 140/90 (idosos ≥ 65 anos tolerando bem)\n\n**Farmacoterapia 1ª linha:** IECA, BRA, bloqueador de canal de cálcio, tiazídico. Associações: IECA + tiazídico ou bloqueador de cálcio\n\n**Monitorização:** MAPA 24h ou MRPA se controle inadequado`, ativo: true,
    },
    {
      titulo: 'Diabetes Mellitus Tipo 2',
      descricao: 'Fisiopatologia, diagnóstico, metas terapêuticas e farmacoterapia do DM2. Insulinoterapia e novos antidiabéticos.',
      disciplina: 'Clínica Médica', tema: 'Endocrinologia', tipo: 'video', nivel: 'intermediario',
      duracao: 60, ordem: 2, mes: 1, semana: 1,
      videoUrl: 'https://www.youtube.com/watch?v=1810QksWM04',
      conteudo: `**Diagnóstico de Diabetes Mellitus:**\n- Glicemia de jejum ≥ 126 mg/dL (2 ocasiões)\n- Glicemia 2h pós-TOTG ≥ 200 mg/dL\n- HbA1c ≥ 6,5%\n- Glicemia aleatória ≥ 200 mg/dL com sintomas\n\n**Metas:** HbA1c < 7%, PA < 130/80, LDL < 70\n\n**Tratamento:** MEV → Metformina → Associações (iSGLT2, GLP-1, sulfoniluréias) → Insulina`,
      ativo: true,
    },
    {
      titulo: 'Síndrome Coronariana Aguda',
      descricao: 'IAM com e sem supradesnivelamento de ST. Diagnóstico eletrocardiográfico, marcadores e tratamento de reperfusão.',
      disciplina: 'Clínica Médica', tema: 'Cardiologia', tipo: 'video', nivel: 'avancado',
      duracao: 70, ordem: 3, mes: 1, semana: 2,
      videoUrl: 'https://www.youtube.com/watch?v=KLW4rBTNHtk', conteudo: `**IAMCST:** Supradesnivelamento ST em derivações contíguas → reperfusão urgente (angioplastia primária < 120 min ou trombolíse < 30 min)\n\n**IAMSST:** Sem supradesnivelamento mas troponina elevada ou mudanças dinâmicas ST-T → estratificação de risco (GRACE)\n\n**Marcadores:** Troponina I/T (elevação 3-12h, pico 48h, normaliza 7-14d), CK-MB (mais específico para miocárdio)\n\n**Tratamento (DAPT + Anticoagulação):** AAS 300mg + Clopidogrel/Ticagrelor + HBPM + Nitrato + Betabloqueador\n\n**Angioplastia primária:** padrão-ouro em IAMCST com < 12h de sintomas`, ativo: true,
    },
    {
      titulo: 'Insuficiência Cardíaca',
      descricao: 'IC sistólica e diastólica. Classificação NYHA, diagnóstico e tratamento farmacológico baseado em evidências.',
      disciplina: 'Clínica Médica', tema: 'Cardiologia', tipo: 'video', nivel: 'intermediario',
      duracao: 55, ordem: 4, mes: 1, semana: 2,
      videoUrl: 'https://www.youtube.com/watch?v=03j0wVOXFcA',
      conteudo: `**Diagnóstico:** Critérios de Framingham (2 maiores ou 1 maior + 2 menores)\n\n**Classificação NYHA:** I → IV conforme limitação funcional\n\n**Tratamento IC-FEr (FE < 40%):**\n- IECA/BRA (enalapril, losartana)\n- Betabloqueador (carvedilol, bisoprolol)\n- Espironolactona (se FE ≤ 35%)\n- Sacubitril/valsartana (ARNI) → substitui IECA se tolerado`,
      ativo: true,
    },
    {
      titulo: 'Pneumonia Adquirida na Comunidade',
      descricao: 'Epidemiologia, diagnóstico, estratificação de gravidade (CURB-65, PSI) e tratamento da PAC no adulto.',
      disciplina: 'Clínica Médica', tema: 'Pneumologia', tipo: 'video', nivel: 'intermediario',
      duracao: 50, ordem: 5, mes: 2, semana: 1,
      videoUrl: 'https://www.youtube.com/watch?v=Oe_vi3epuGI', conteudo: `**Diagnóstico:** Tosse + sintomas sistêmicos + infiltrado pulmonar à ausculta/radiografia + critérios menores (febre, leucocitose, purulência)\n\n**CURB-65:** Confusão, Uréia > 7, Respiração > 30, PA sistólica < 90, idade ≥ 65 anos. 0-1 = baixo risco | 2 = moderado | ≥ 3 = alto (considerar internação)\n\n**Agentes:** Pneumococo, Haemophilus, Legionella. Em > 40 anos tabagista: incluir cobertura para anaeróbios\n\n**Tratamento:** Ambulatorial: Amoxicilina-clavulanato ou Fluorquinolona respiratória | Internado: Cefalosporina 3ª geração + Fluorquinolona ou Macrolídeo\n\n**Saturação O2 meta:** ≥ 90% (≥ 88% em DPOC)`, ativo: true,
    },
    {
      titulo: 'Doença Renal Crônica',
      descricao: 'Estadiamento pela TFG, causas principais, diagnóstico de complicações e tratamento conservador e renal substitutivo.',
      disciplina: 'Clínica Médica', tema: 'Nefrologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 55, ordem: 6, mes: 2, semana: 1,
      videoUrl: null, conteudo: `**Estágios pela TFG (KDIGO):** Estágio 1 (TFG ≥ 90) e 2 (60-89) = normal; Estágio 3a (45-59) e 3b (30-44); Estágio 4 (15-29); Estágio 5 (< 15)\n\n**Causas principais:** Diabetes (> 35%), HAS, glomerulonefrite, rins policísticos, uropatia obstrutiva\n\n**Complicações:** Anemia (EPO deficiente), hipertensão, doença mineral óssea, dislipidemia, desnutrição proteica. Progressão para IRCT\n\n**Tratamento:** Controlar PA (< 130/80 em DRC), glicemia, proteinúria (IECA/BRA) | Terapia renal substitutiva se TFG < 15 (diálise ou transplante)\n\n**Monitorização:** TFG, creatinina, eletrólitos, albumina, fósforo, cálcio, PTH semestral`, ativo: true,
    },
    {
      titulo: 'Acidente Vascular Cerebral',
      descricao: 'AVC isquêmico e hemorrágico. Diagnóstico por imagem, janela terapêutica para trombólise e prevenção secundária.',
      disciplina: 'Clínica Médica', tema: 'Neurologia', tipo: 'video', nivel: 'avancado',
      duracao: 65, ordem: 7, mes: 2, semana: 2,
      videoUrl: 'https://www.youtube.com/watch?v=SObDP-BpdA4', conteudo: `**AVC Isquêmico (80%):** Trombose ou embolia cerebral. Escala NIHSS para graduação. RM/TC para descartar hemorragia\n\n**Trombólise (rt-PA):** Janela até 4,5h sintomas, NIHSS leve-moderado, sem HAS mal controlada ou sangramento recente. Dose: 0,9 mg/kg\n\n**Trombectomia mecânica:** Até 24h se oclusão de grande vaso e <24h (DAWN/DEFUSE 3); melhora funcional comprovada\n\n**AVC Hemorrágico:** Hipodensidade à TC. Rever anticoagulação, trombocitopenia. Abordagem cirúrgica se volume significativo\n\n**Prevenção 2ária:** AAS 100mg/dia, Clopidogrel se intolerância, Atorvastatina 80mg, PA < 140/90, Warfarina se FA`, ativo: true,
    },
    {
      titulo: 'Sepse e Choque Séptico',
      descricao: 'Critérios diagnósticos (Sepsis-3), bundle de 1h, antibioticoterapia e suporte hemodinâmico no choque séptico.',
      disciplina: 'Clínica Médica', tema: 'UTI', tipo: 'video', nivel: 'avancado',
      duracao: 75, ordem: 8, mes: 3, semana: 1,
      videoUrl: 'https://www.youtube.com/watch?v=AqgH3jtGmM8', conteudo: `**Sepsis-3:** Infecção + SIRS (ou QSOFA em nível de criação: alteração mental OU PA sistólica ≤ 100 OU FR > 22)\n\n**Bundle de 1h:** 1) Lactato sérico | 2) Hemoculturas antes ATB | 3) ATB amplo IV (fluorquinolona + cephalosporina ou carbapenem) | 4) Cristaloides 30mL/kg se hipotensão\n\n**Choque Séptico:** Sepse + hipotensão requerendo vasopressor + lactato > 2 mmol/L (metabolismo anaeróbico)\n\n**Suporte hemodinâmico:** Norepinefrina 1ª linha se hipotensão refratária a fluidos | Vasopressina/Epinefrina se refratário\n\n**Controle de foco:** Retirada de cateter, drenagem de coleção, antibioticoterapia dirigida por cultura`, ativo: true,
    },
    // ── Cirurgia (6 aulas) ──
    {
      titulo: 'Abdome Agudo: Diagnóstico e Conduta',
      descricao: 'Diagnóstico diferencial do abdome agudo. Apendicite, colecistite, obstrução intestinal e perfuração de víscera.',
      disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', tipo: 'video', nivel: 'intermediario',
      duracao: 55, ordem: 1, mes: 1, semana: 3,
      videoUrl: 'https://www.youtube.com/watch?v=sSbaQtguG4I', conteudo: `**Apendicite:** dor periumbilical → FID, anorexia, náusea. Score de Alvarado (8+ = provável). TC > US. Tratamento: apendicectomia emergencial\n\n**Colecistite:** dor epigástrio/QSD com Murphy (+), febre. ECO com vesícula distendida, parede espessada, fluido perivesicular. Colecistectomia\n\n**Obstrução intestinal:** dor cólica, ausência de evacuação/flatos, vômitos, distensão. RX: níveis aéreos. Causa: bridas (pós-cirurgia), hérnias, massas, volvo\n\n**Perfuração de víscera:** dor súbita + peritonite, pneumoperitônio na TC. Abdome agudo cirúrgico: cirurgia emergencial\n\n**Avaliação:** Anamnese (início, localização, intensidade), exame (defesa, rigidez, Blumberg, Rebound), US/TC para confirmação`, ativo: true,
    },
    {
      titulo: 'Trauma e ATLS',
      descricao: 'Protocolo ATLS: ABCDE do trauma, avaliação primária e secundária, controle de hemorragia e classes de choque.',
      disciplina: 'Cirurgia', tema: 'Trauma', tipo: 'texto', nivel: 'avancado',
      duracao: 70, ordem: 2, mes: 1, semana: 3,
      videoUrl: null,
      conteudo: `**Avaliação Primária (ABCDE):**\nA - Airway + proteção cervical\nB - Breathing → pneumotórax, hemotórax\nC - Circulation → choque, hemorragia\nD - Disability → Glasgow, pupilas\nE - Exposure\n\n**Classes de Choque:**\nI: < 15% | II: 15-30% | III: 30-40% → hemoderivados | IV: > 40% → cirurgia`,
      ativo: true,
    },
    {
      titulo: 'Hérnias Abdominais',
      descricao: 'Classificação, diagnóstico clínico e indicações cirúrgicas das hérnias inguinal, umbilical, incisional e femoral.',
      disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', tipo: 'texto', nivel: 'basico',
      duracao: 40, ordem: 3, mes: 2, semana: 3,
      videoUrl: null, conteudo: `**Hérnia Inguinal:** Passagem através do anel/canal inguinal. Indireta (lateral ao ligamento falciforme de Hesselbach) vs Direta. Diagnóstico clínico; US se dúvida\n\n**Indicações cirúrgicas:** Hérnia sintomática (dor), risco de estrangulamento, atividade intensa. Hérnia incarcerrada/estrangulada = emergência\n\n**Hérnia Umbilical:** Defeito em tecido subjacente ao umbigo. Criança < 2-3 anos: observar (90% fecham espontaneamente). Persistente: cirurgia eletiva\n\n**Hérnia Incisional:** Após cirurgia abdominal anterior (falha técnica, infecção, obesidasade). Reparação se sintomática ou > 2-3 cm\n\n**Hérnia Femoral:** Rara mas alto risco de encarceração (50-60%). Diâmetro pequeno favorece aprisionamento do intestino`, ativo: true,
    },
    {
      titulo: 'Câncer Colorretal',
      descricao: 'Rastreamento, diagnóstico, estadiamento TNM e tratamento cirúrgico do câncer de cólon e reto.',
      disciplina: 'Cirurgia', tema: 'Oncologia Cirúrgica', tipo: 'texto', nivel: 'intermediario',
      duracao: 60, ordem: 4, mes: 3, semana: 1,
      videoUrl: null, conteudo: `**Rastreamento:** > 50 anos sem risco aumentado → colonoscopia a cada 10 anos (ou FOBT anual + sigmoidoscopia a cada 5 anos)\n\n**Fatores de risco:** Idade, história familiar, polipose, IBD, tabagismo, álcool, dieta pobre em fibras\n\n**Diagnóstico:** Colonoscopia com biópsia (padrão-ouro). Apresentação: sangramento retal, mudança hábito intestinal, anemia, dor abdominal\n\n**Estadiamento TNM:** T (invasão parede), N (linfonodos), M (metástase). Terapia complementar e quimioterapia conforme estadio\n\n**Tratamento cirúrgico:** Ressecção com margens livres ≥ 5 cm. Colectomia parcial ou total conforme localização. Ileostomia se necessário`, ativo: true,
    },
    {
      titulo: 'Queimaduras',
      descricao: 'Classificação por profundidade e extensão, fórmula de Parkland, indicações de UTI-Q e curativos.',
      disciplina: 'Cirurgia', tema: 'Trauma', tipo: 'texto', nivel: 'intermediario',
      duracao: 45, ordem: 5, mes: 3, semana: 2,
      videoUrl: null, conteudo: `**Profundidade:** 1º grau (hiperemia, sem bolhas) | 2º grau superficial (bolhas, hiperemia) | 2º grau profundo (palidez, bolhas) | 3º grau (necrose, couro)\n\n**Extensão (Regra dos 9s):** Cabeça 9%, tronco ant. 18%, post. 18%, MI 18% c/u, genitais 1%\n\n**Fórmula de Parkland:** Cristaloides (SBRI) = 4 × peso (kg) × %SCQ | Metade em 8h, metade em 16h | Meta: diurese 0,5-1 mL/kg/h\n\n**Indicações de internação:** > 10-15% 2º grau adulto, > 5-10% criança/idoso, qualquer 3º grau, circunferencial de extremidade/tórax\n\n**Curativos:** Limpeza, remoção de tecido necrótico, antibióticos tópicos (sulfadiazina de prata). Autoenxerto quando viável (epitelização > 70%)`, ativo: true,
    },
    {
      titulo: 'Pancreatite Aguda',
      descricao: 'Etiologia, escore de Ranson e APACHE II, tratamento clínico e indicações de intervenção na pancreatite grave.',
      disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', tipo: 'texto', nivel: 'avancado',
      duracao: 65, ordem: 6, mes: 4, semana: 1,
      videoUrl: null, conteudo: `**Diagnóstico:** Amilase/lipase > 3x LSN + dor epigastral. Etiologia: biliar (80%), álcool, fármacos, hipertrigliceridemia (>1500), hipercalcemia\n\n**Escore de Ranson:** 5 critérios admissão (idade, glicemia, LDH, AST, leucócitos) + 6 em 48h → cada ponto = 1% risco de mortalidade\n\n**APACHE II:** Sistema de pontuação multifatorial. ≥ 8 = pancreatite grave (risco de morte e necessidade de intervenção)\n\n**Tratamento:** Jejum, hidratação agressiva IV (SBRI 250-500 mL/h), analgesia, suporte nutricional (nutrição enteral em < 48h se grave)\n\n**Complicações:** Pseudocistos (após 4 semanas, se > 6cm considerar drenagem), necrose pancreática (vidrado à TC) → antibióticos profiláticos`, ativo: true,
    },
    // ── Pediatria (6 aulas) ──
    {
      titulo: 'Crescimento e Desenvolvimento Normal',
      descricao: 'Marcos do DNPM, curvas de crescimento OMS, triagem auditiva, visual e desenvolvimento neurológico.',
      disciplina: 'Pediatria', tema: 'Desenvolvimento', tipo: 'texto', nivel: 'basico',
      duracao: 40, ordem: 1, mes: 1, semana: 4,
      videoUrl: null, conteudo: `**Marcos DNPM:** Sorriso social 6 sem | Riso 4 meses | Senta sem apoio 6 meses | Engatinha 8 meses | Palavras 12 meses | Frases 2 anos\n\n**Curvas OMS:** Perímetro cefálico, comprimento/altura, peso avaliar regularmente. Desvio > 2 DP = investigar patologia\n\n**Triagem Auditiva:** TANU no pós-parto imediato (até 48h). AABR (audiometria de tronco encefálico) se falha TANU\n\n**Avaliação Visual:** Reflexo vermelho (detecta catarata, leuco ou retinoblastoma). Testes de visão formais > 3 anos\n\n**Desenvolvimento motor/cognitivo:** Avaliação sistemática em cada consulta. Escalas: Denver, Bayley se atraso suspeito`, ativo: true,
    },
    {
      titulo: 'Infecções Respiratórias na Infância',
      descricao: 'IVAS, amigdalite, bronquiolite, pneumonia e asma em pediatria. Diagnóstico, tratamento e critérios de internação.',
      disciplina: 'Pediatria', tema: 'Pneumologia Pediátrica', tipo: 'texto', nivel: 'intermediario',
      duracao: 50, ordem: 2, mes: 1, semana: 4,
      videoUrl: null,
      conteudo: `**Bronquiolite Viral Aguda:**\n- VSR, < 2 anos\n- Tratamento: SUPORTE (O2, hidratação)\n- NÃO usar: antibióticos, corticoides, broncodilatadores\n\n**PAC Pediátrica:**\n- < 5 anos: Pneumococo → Amoxicilina 50mg/kg\n- Critérios de internação: FR aumentada, Sat < 95%, tiragem`,
      ativo: true,
    },
    {
      titulo: 'Neonatologia: RN de Risco',
      descricao: 'Prematuridade, RCIU, icterícia neonatal, hipoglicemia e sepse neonatal. Manejo na sala de parto e UTI Neonatal.',
      disciplina: 'Pediatria', tema: 'Neonatologia', tipo: 'texto', nivel: 'avancado',
      duracao: 80, ordem: 3, mes: 2, semana: 4,
      videoUrl: null, conteudo: `**Prematuridade:** < 37 semanas. Complicações: SDR (surfactante deficiente) → ventilação/CPAP | BPD (displasia broncopulmonar) | ROP (retinopatia prematuridade)\n\n**RCIU:** Peso < p10 ou peso/altura desproporcional. Diferencial: simétrico (genético, TORCH, cromossomopatias) vs assimétrico (insuficiência placentária)\n\n**Icterícia Neonatal:** Bilirrubina indireta > níveis foterapia conforme idade (dias de vida/peso). Fototerapia ou exsanguineotransfusão se critério crítico\n\n**Hipoglicemia Neonatal:** Glicose < 40 mg/dL. Risco em prematuros, PIG, hipotermia, infecção. Tratamento: dextrosol 10% IV ou amamentação frequente\n\n**Sepse Neonatal:** Risco em ruptura membrana > 18h, febre materna, colonização GBS. Hemoculturas + ATB empírico (ampicilina + gentamicina ± cefalosporina)`, ativo: true,
    },
    {
      titulo: 'Doenças Exantemáticas',
      descricao: 'Sarampo, rubéola, varicela, escarlatina, doença de Kawasaki. Diagnóstico diferencial e complicações.',
      disciplina: 'Pediatria', tema: 'Infectologia Pediátrica', tipo: 'texto', nivel: 'intermediario',
      duracao: 45, ordem: 4, mes: 3, semana: 3,
      videoUrl: null, conteudo: `**Sarampo:** Prodroma (3C: coriza, conjuntivite, tosse) → manchas de Koplik → rash máculo-papular. Complicações: encefalite, otite, pneumonia\n\n**Rubéola:** Rash rosa-claró maculopapular (rosto → corpo). Linfadenopatia posterior-cervical. Teratogênico < 20 sem (STORCH)\n\n**Varicela:** Vesículas "gota de orvalho em pétala rosa" em ondas. Prurido intenso. Risco: herpes zoster em imunocompromissados\n\n**Escarlatina:** Estreptococo β-hemolítico. Rash micropapular "lixa". Língua em morango. Complicação: febre reumática\n\n**Doença de Kawasaki:** Criança < 5 anos, febre > 5 dias, rash, conjuntivite, lábios inflamados, língua morango, edema extremidades. Risco: aneurisma coronariano → imunoglobulina IV + AAS`, ativo: true,
    },
    {
      titulo: 'Desnutrição e Distúrbios Nutricionais',
      descricao: 'Marasmo, kwashiorkor, hipovitaminoses, anemia ferropriva. Diagnóstico e tratamento em pediatria.',
      disciplina: 'Pediatria', tema: 'Nutrição Pediátrica', tipo: 'texto', nivel: 'basico',
      duracao: 40, ordem: 5, mes: 4, semana: 1,
      videoUrl: null, conteudo: `**Marasmo:** Deficiência calórica crônica. Criança magra, sem edema, aspecto "envelhecido". Albumina normal ou baixa\n\n**Kwashiorkor:** Deficiência proteica. Edema bilateral (pulmões, extremidades), dermatose de padrão periférico, hepatomegalia, apatia. Albumina baixa\n\n**Avitaminose A:** Cegueira noturna, xerose corneal, úlcera córneal (reversível se tratado rápido). Suplementação: 200.000 UI/dia por 2 dias\n\n**Anemia Ferropriva:** Mais comum em pediatria. Causa: alimentação inadequada (leite de vaca puro), parasitismo, hemorragia. Sulfato ferroso oral 30-60 mg Fe elementar/dia\n\n**Beribéri (B1), Pelagra (B3), Escorbuto (Vit C):** Desnutrição severa. Tratamento com suplementação específica e reabilitação nutricional`, ativo: true,
    },
    {
      titulo: 'Imunização: Calendário Vacinal',
      descricao: 'Calendário vacinal do Ministério da Saúde. Vacinas obrigatórias, esquemas de recuperação e contraindicações.',
      disciplina: 'Pediatria', tema: 'Imunização', tipo: 'texto', nivel: 'basico',
      duracao: 35, ordem: 6, mes: 4, semana: 2,
      videoUrl: null, conteudo: `**Calendário (2024 Brasil):** BCG (RN) | Hepatite B (RN) | Poliomielite/difteria/tétano/coqueluche/Haemophilus (2, 4, 6, 15 meses) | Pneumococo (2, 4, 6, 12 meses)\n\n**Continuação:** Meningococo (3, 5, 12 meses) | Rotavírus (2, 4 meses) | Sarampo/rubéola/caxumba (12 meses) | Varicela (12-15 meses)\n\n**Adolescentes:** HPV (11-12 anos) | Influenza anual | Meningococo Conjugado (dose única)\n\n**Esquema de Recuperação:** Doses atrasadas podem ser recuperadas (ajustar intervalos mínimos entre doses)\n\n**Contraindicações:** Alergia a componentes, encefalopatia progressiva, imunodeficiência severa (relativa para vivas), GBS após Guillain-Barré`, ativo: true,
    },
    // ── Ginecologia e Obstetrícia (5 aulas) ──
    {
      titulo: 'Pré-Natal de Baixo Risco',
      descricao: 'Rotina de pré-natal: exames, vacinas, suplementação, intercorrências frequentes e consultas.',
      disciplina: 'Ginecologia', tema: 'Obstetrícia', tipo: 'video', nivel: 'basico',
      duracao: 45, ordem: 1, mes: 2, semana: 2,
      videoUrl: 'https://www.youtube.com/watch?v=pUQPr2T_Weg', conteudo: `**Frequência de consultas:** Mensal < 28 sem, quinzenal 28-36 sem, semanal > 36 sem | Parto > 37 sem (termo) e ≤ 41+6 sem\n\n**Exames:** Sorologia (anti-HIV, Sífilis, Hepatites B/C), tipagem sanguínea, Coombs, sangue periférico, glicemia jejum (24-28 sem TOTG), urocultura\n\n**Suplementação:** Ácido fólico 400 mcg/dia (prevenção DTN), Ferro 30-60 mg/dia (prevenção anemia), Cálcio 1000-1200 mg/dia\n\n**Vacinas:** dT (influenza anual se grávida), Hepatite B se não vacinada | CONTRA: sarampo, varicela (vivas)\n\n**Intercorrências:** Hiperêmese (< 12 sem), sangramento vaginal, queixa urinária (ITU/pielonefrite), HAS gestacional, DMG`, ativo: true,
    },
    {
      titulo: 'Síndromes Hipertensivas da Gestação',
      descricao: 'DHEG, pré-eclâmpsia com e sem critérios de gravidade, eclâmpsia e HELLP. Tratamento e interrupção.',
      disciplina: 'Ginecologia', tema: 'Obstetrícia', tipo: 'texto', nivel: 'avancado',
      duracao: 60, ordem: 2, mes: 2, semana: 2,
      videoUrl: null,
      conteudo: `**Classificação:**\n1. Hipertensão Gestacional: PA ≥ 140/90 após 20 sem, sem proteinúria\n2. Pré-eclâmpsia: HAS + proteinúria > 300mg/24h\n3. Eclâmpsia: + convulsão\n4. HELLP: Hemólise + Enzimas hepáticas ↑ + Plaquetas ↓\n\n**Tratamento:**\n- MgSO4 (prevenção e tratamento das convulsões)\n- Anti-hipertensivo: Hidralazina IV, Nifedipina VO`,
      ativo: true,
    },
    {
      titulo: 'Trabalho de Parto e Parto Normal',
      descricao: 'Mecanismo do parto, fases do trabalho de parto, partograma, cardiotocografia e assistência ao parto.',
      disciplina: 'Ginecologia', tema: 'Obstetrícia', tipo: 'texto', nivel: 'intermediario',
      duracao: 55, ordem: 3, mes: 3, semana: 2,
      videoUrl: null, conteudo: `**Fases TP:** Latente (0-3 cm dilatação), Ativa (3-7 cm), Desaceleração (7-10 cm), Expulsivo (10 cm + puxos), Dequitadura (placentário)\n\n**Mecanismo 7 movimentos:** Acomodação, descida, flexão, rotação interna, extensão, rotação externa, expulsão\n\n**Cardiotocografia:** FBC 110-160 bpm, variabilidade ≥ 5-25 bpm, acelerações (bom prognóstico), desacelerações (avaliar tipo: leve, variável, tardia)\n\n**Partograma:** Gráfico progresso dilatação (linha ação se cruzar limite parto prolongado) + velocidade descida, contrações, bem-estar fetal\n\n**Complicações:** Distócia funcional, desproporcionalidade céfalo-pélvica, apresentação anômala → indicação para cesariana`, ativo: true,
    },
    {
      titulo: 'Câncer de Colo do Útero',
      descricao: 'HPV, rastreamento (Papanicolaou), colposcopia, estadiamento e tratamento do CCU.',
      disciplina: 'Ginecologia', tema: 'Oncologia Ginecológica', tipo: 'texto', nivel: 'intermediario',
      duracao: 50, ordem: 4, mes: 4, semana: 1,
      videoUrl: null, conteudo: `**HPV e carcinogênese:** HPV 16 e 18 alto risco. Displasia: CIN I/II/III → carcinoma invasor se não tratado\n\n**Rastreamento (Papanicolaou):** Mulheres 25-64 anos, início sexual anterior. Resultado: Normal | ASC (Células escamosas atípicas) | LSIL/HSIL | Carcinoma\n\n**Colposcopia:** ASC-US ou HSIL → colposcopia com biópsia. Achados: mosaico, pontilhado, iodo-negativo\n\n**Estadiamento FIGO:** IA (microinvasão) → IIA (parametrial livre) → IIB (parametrial) → III (pelviano) → IV (bexiga/reto ou metástase)\n\n**Tratamento:** Conização/eletroconização CIN II/III | Histerectomia + radioterapia se invasor | Quimioterapia neoadjuvante em avançados`, ativo: true,
    },
    {
      titulo: 'Contracepção e Planejamento Familiar',
      descricao: 'Métodos contraceptivos, eficácia (índice de Pearl), contraindicações e anticoncepção de emergência.',
      disciplina: 'Ginecologia', tema: 'Ginecologia Geral', tipo: 'texto', nivel: 'basico',
      duracao: 40, ordem: 5, mes: 4, semana: 2,
      videoUrl: null, conteudo: `**Eficácia (Índice de Pearl/100 mulher-ano):** DIU cobre 0,8-1,0 | Hormonal combinado 0,3 | Progestágeno puro 0,3 | Condom 18 | Coito interrompido 20\n\n**Métodos reversíveis:** ACO, injetável (medroxiprogesterona 150mg IM 12/12 sem), adesivo/anel, DIU-Cu, DIU-LNG, implante subdérmico\n\n**Métodos irreversíveis:** Laqueadura tubária, vasectomia | Avaliar: número filhos, idade, relação estável\n\n**Anticoncepção de emergência:** Levonorgestrel 1,5mg dose única (até 72h, máximo efetivo < 12h) | Acetato de ulipristal 30mg (até 120h)\n\n**Contraindicações absolutas ACO:** Tromboembolismo, AVC, >35 anos + tabagismo, migrânea com aura, câncer mama/endométrio`, ativo: true,
    },
    // ── Saúde Pública (5 aulas) ──
    {
      titulo: 'SUS: Princípios, Diretrizes e Financiamento',
      descricao: 'Fundamentos do SUS, CF88, leis 8.080 e 8.142, princípios doutrinários e organizativos, financiamento.',
      disciplina: 'Saúde Pública', tema: 'SUS', tipo: 'texto', nivel: 'basico',
      duracao: 35, ordem: 1, mes: 1, semana: 2,
      videoUrl: null,
      conteudo: `**Princípios Doutrinários:** Universalidade, Integralidade, Equidade\n\n**Princípios Organizativos:** Descentralização, Hierarquização, Participação social\n\n**Leis:** 8.080/1990 (organização) + 8.142/1990 (controle social e financiamento)\n\n**Níveis:** Primária (UBS) → Secundária (especialidades) → Terciária (alta complexidade)`,
      ativo: true,
    },
    {
      titulo: 'Epidemiologia: Indicadores de Saúde',
      descricao: 'Incidência, prevalência, mortalidade, morbidade, coeficientes epidemiológicos e medidas de associação.',
      disciplina: 'Saúde Pública', tema: 'Epidemiologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 50, ordem: 2, mes: 2, semana: 3,
      videoUrl: null, conteudo: `**Incidência:** Novos casos / população sob risco × 1000/100.000 | Mede risco de adoecer\n\n**Prevalência:** Casos existentes / população total × 100 | Fotografo no tempo | Prevalência = Incidência × Duração\n\n**Mortalidade:** Óbitos / população média × 1000 | Mortalidade geral vs específica (idade, causa)\n\n**Morbidade:** Casos de doença / população total | Incapacidade, qualidade de vida\n\n**Medidas de associação:** RR (Risco Relativo) = risco expostos / risco não expostos | OR (Odds Ratio) = odds expostos / odds não expostos | NNT (número necessário para tratar)`, ativo: true,
    },
    {
      titulo: 'Vigilância Epidemiológica',
      descricao: 'SINAN, notificação compulsória, investigação de surtos, controle de doenças endêmicas e epidêmicas.',
      disciplina: 'Saúde Pública', tema: 'Epidemiologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 45, ordem: 3, mes: 3, semana: 3,
      videoUrl: null, conteudo: `**SINAN (Sistema de Informação Agravos Notificáveis):** Coleta dados sobre doença de notificação compulsória. Objetivo: detecção, acompanhamento, controle\n\n**Notificação compulsória:** Meningite, tuberculose, dengue, sarampo, febre amarela, hepatites virais, AIDS, sífilis, gonorreia, doença de Chagas\n\n**Investigação de Surtos:** ≥ 2 casos de mesma doença + vínculo epidemiológico | Descrever casos, investigar fonte/modo transmissão, controle (isolamento, quarentena, vacinação)\n\n**Controle de doenças:** Eliminação (varíola) | Erradicação (polio almeja) | Controle (TB, malária) | Vigilância contínua\n\n**Inquéritos epidemiológicos:** Estimam prevalência, identificam fatores risco, avaliam efetividade de programas`, ativo: true,
    },
    {
      titulo: 'Saúde da Família e ESF',
      descricao: 'Estratégia de Saúde da Família, composição das equipes, área de abrangência, ações prioritárias e PMAQ.',
      disciplina: 'Saúde Pública', tema: 'Atenção Primária', tipo: 'texto', nivel: 'basico',
      duracao: 40, ordem: 4, mes: 4, semana: 3,
      videoUrl: null, conteudo: `**Equipe ESF:** Médico, enfermeiro, técnico de enfermagem, agente comunitário saúde (ACS) | Cobertura: 3.000-4.000 pessoas | 12 consultas/médico/dia\n\n**Área de abrangência:** Territorialização (mapeamento problemas saúde), vínculo com comunidade, responsabilização\n\n**Ações prioritárias:** Pré-natal/puerpério, puericultura, vacinação, hipertensão/diabetes, saúde bucal, controle TB/DSTs, saúde mental\n\n**PMAQ (Programa Melhoria Acesso Qualidade):** Autoavaliação → acreditação → reacreditação. Metas: acesso, acolhimento, linhas de cuidado\n\n**Diferencial:** Integralidade, longitudinalidade, primeiro contato, abordagem familiar/comunitária`, ativo: true,
    },
    {
      titulo: 'Políticas de Saúde e Programas Nacionais',
      descricao: 'PNAB, Rede Cegonha, Rede de Urgência e Emergência, Programa Saúde na Escola e políticas prioritárias.',
      disciplina: 'Saúde Pública', tema: 'Políticas de Saúde', tipo: 'texto', nivel: 'intermediario',
      duracao: 45, ordem: 5, mes: 4, semana: 4,
      videoUrl: null, conteudo: `**PNAB (Política Nacional Atenção Básica):** Direcionamento ESF, cobertura universal, ações estratégicas, avaliação qualidade\n\n**Rede Cegonha:** Gravidez segura, parto normal, nascimento seguro, puerpério/aleitamento, planejamento familiar. Referência para parto, urgência obstétrica\n\n**Rede Urgência e Emergência:** PAM (porta ambulatorial) → Pronto Atendimento → SAMU/urgência hospitalar | Acesso único 192 (SAMU)\n\n**Programa Saúde na Escola:** Integra SUS + Educação. Ações: vacinação, saúde mental, prevenção DST, promoção alimentar, educação física\n\n**Programas prioritários:** Tuberculose (DOTS), AIDS (TARV universal), diabetes (Hiperdia), HAS, saúde mental (CAPS)`, ativo: true,
    },
    // ── Psiquiatria — Mês 5 (4 aulas) ────────────────────────────────────────
    {
      titulo: 'Depressão e Transtorno Bipolar',
      descricao: 'Critérios DSM-5 para episódio depressivo maior. Diferenciação bipolar I e II. Farmacoterapia: antidepressivos e estabilizadores de humor.',
      disciplina: 'Psiquiatria', tema: 'Transtornos de Humor', tipo: 'texto', nivel: 'intermediario',
      duracao: 55, ordem: 1, mes: 5, semana: 1,
      videoUrl: null,
      conteudo: `**EDM (DSM-5):** 5+ sintomas ≥ 2 semanas (humor deprimido ou anedonia obrigatório)\n\n**Antidepressivos:** ISRS 1ª linha; início do efeito 2-4 semanas\n\n**Bipolar I:** maníaco ≥ 7 dias | Bipolar II: hipomaníaco + depressivo\n\n**Estabilizadores:** Lítio (monitorar Cr, TSH, Li sérico), Valproato, Lamotrigina\n\n**NUNCA** antidepressivo isolado no bipolar sem estabilizador → risco de virada maníaca`,
      ativo: true,
    },
    {
      titulo: 'Transtornos de Ansiedade e TOC',
      descricao: 'TAG, transtorno de pânico, fobia social, TEPT e TOC. Diagnóstico diferencial e abordagem farmacológica e psicoterápica.',
      disciplina: 'Psiquiatria', tema: 'Transtornos Ansiosos', tipo: 'texto', nivel: 'basico',
      duracao: 45, ordem: 2, mes: 5, semana: 1,
      videoUrl: null,
      conteudo: `**TAG:** ansiedade difusa, musculotensão, irritabilidade. Tratamento: ISRS/IRSN + TCC\n\n**Pânico:** episódios paroxísticos com sintomas físicos intensos + medo de novos ataques. ISRS + alprazolam agudo\n\n**TOC:** obsessões + compulsões. ISRS em dose alta + TCC (exposição e prevenção de resposta)\n\n**TEPT:** reexperiência + evitação + hipervigilância após trauma. 1ª linha: ISRS`,
      ativo: true,
    },
    {
      titulo: 'Psicoses: Esquizofrenia e Transtornos Relacionados',
      descricao: 'Critérios diagnósticos, sintomas positivos e negativos, antipsicóticos típicos vs atípicos, efeitos adversos e monitorização.',
      disciplina: 'Psiquiatria', tema: 'Psicoses', tipo: 'texto', nivel: 'intermediario',
      duracao: 55, ordem: 3, mes: 5, semana: 2,
      videoUrl: null,
      conteudo: `**Critérios diagnósticos:** ≥ 2 de: delírios, alucinações, discurso desorganizado, comportamento desorganizado, sintomas negativos. Duração ≥ 6 meses\n\n**Típicos (1ª geração):** Haloperidol — efeitos extrapiramidais (distonia, parkinsonismo, acatisia, discinesia tardia)\n\n**Atípicos (2ª geração):** Risperidona, Olanzapina, Clozapina (refratário — monitorar neutrófilos)\n\n**Síndrome maligna dos neurolépticos:** febre + rigidez + instabilidade autonômica + CPK elevada → suspender antipsicótico`,
      ativo: true,
    },
    {
      titulo: 'Emergências Psiquiátricas e Dependência Química',
      descricao: 'Agitação psicomotora, avaliação de risco suicida, delirium tremens, síndrome de abstinência opioides. Abordagem e farmacologia de emergência.',
      disciplina: 'Psiquiatria', tema: 'Emergências Psiquiátricas', tipo: 'texto', nivel: 'avancado',
      duracao: 60, ordem: 4, mes: 5, semana: 2,
      videoUrl: null,
      conteudo: `**Delirium Tremens (abstinência álcool):** tremor, alucinações visuais, convulsões, confusão (24-72h após última dose). Tratamento: Diazepam IV + Tiamina 200mg IV ANTES glicose\n\n**Agitação psicomotora:** contenção física + haloperidol 5mg IM + midazolam 2-5mg IM\n\n**Risco suicida alto:** ideação + plano definido + meios disponíveis + intenção → internação compulsória se necessário\n\n**Overdose opioide:** Naloxona 0,4mg IV (pode repetir)`,
      ativo: true,
    },
    // ── Infectologia — Mês 5 (5 aulas) ──────────────────────────────────────
    {
      titulo: 'HIV/AIDS: Diagnóstico, TARV e Profilaxias',
      descricao: 'Diagnóstico (testes rápidos + confirmatório), estadiamento clínico (OMS e CDC), critérios para TARV, esquemas de 1ª linha e profilaxias de IO.',
      disciplina: 'Clínica Médica', tema: 'Infectologia', tipo: 'texto', nivel: 'avancado',
      duracao: 70, ordem: 1, mes: 5, semana: 1,
      videoUrl: null,
      conteudo: `**Diagnóstico:** 2 testes rápidos reagentes ou ELISA + Western Blot confirmador\n\n**TARV Brasil (2024):** TDF + 3TC + DTG (Dolutegravir) → universal, independente de CD4\n\n**CD4 < 200:** sulfametoxazol-trimetoprim (profilaxia P. jirovecii + toxoplasma)\n\n**TV:** TARV durante gestação + AZT IV no parto + AZT para RN 4 semanas + suspender amamentação\n\n**PEP:** iniciar em até 72h, duração 28 dias. PrEP: TDF+3TC`,
      ativo: true,
    },
    {
      titulo: 'Hepatites Virais B e C',
      descricao: 'Interpretação sorológica da hepatite B. Hepatite B crônica: tratamento com tenofovir/entecavir. Hepatite C: cura com antivirais de ação direta.',
      disciplina: 'Clínica Médica', tema: 'Infectologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 55, ordem: 2, mes: 5, semana: 2,
      videoUrl: null,
      conteudo: `**Sorologia HBV:** HBsAg+ = infecção ativa | Anti-HBs isolado = vacinado | Anti-HBc IgM = aguda | Anti-HBc IgG + Anti-HBs = cura | HBsAg+ + Anti-HBc IgG = crônico\n\n**HBV crônico:** TDF ou Entecavir (antivirais orais, inibem replicação — NÃO curam)\n\n**HCV:** Antivirais de ação direta (sofosbuvir + daclatasvir 12 semanas → cura > 95%). Genótipos 1-6; esquemas diferem`,
      ativo: true,
    },
    {
      titulo: 'Tuberculose: Tratamento, Resistência e ILTB',
      descricao: 'Diagnóstico (BAAR, cultura, GeneXpert), esquema RIPE, TB resistente (TB-MDR), infecção latente por TB e quimioprofilaxia.',
      disciplina: 'Clínica Médica', tema: 'Infectologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 50, ordem: 3, mes: 5, semana: 3,
      videoUrl: null,
      conteudo: `**Diagnóstico:** BAAR em 2 amostras (59-80% sensível) + cultura (padrão-ouro). GeneXpert MTB/RIF: rápido, detecta resistência à rifampicina\n\n**RIPE:** Rifampicina + Isoniazida + Pirazinamida + Etambutol × 2 meses → RI × 4 meses\n\n**TB-MDR:** resistente a R + H. Tratamento 18-20 meses com agentes de 2ª linha\n\n**ILTB (Teste Tuberculínico ≥ 5mm em imunossuprimido, ≥ 10mm em geral):** Isoniazida 270 dias`,
      ativo: true,
    },
    {
      titulo: 'Doenças Sexualmente Transmissíveis (ISTs)',
      descricao: 'Sífilis primária/secundária/congênita, gonorreia, clamídia, HPV, herpes genital. Diagnóstico, tratamento e abordagem de parcerias.',
      disciplina: 'Clínica Médica', tema: 'Infectologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 50, ordem: 4, mes: 5, semana: 3,
      videoUrl: null,
      conteudo: `**Sífilis 1ária:** cancro duro (indolor, borda endurecida). VDRL pode ser negativo. Tratamento: Penicilina G Benzatina 2,4M UI IM dose única\n\n**Sífilis 2ária:** VDRL alto título, rash palmoplantar, condiloma lata. PGB 2,4M UI × 3 semanas\n\n**Sífilis gestação:** APENAS penicilina G benzatina tem eficácia documentada na prevenção de sífilis congênita\n\n**Gonorreia:** Ceftriaxona 500mg IM + Azitromicina 1g VO (cobertura clamídia simultânea)`,
      ativo: true,
    },
    {
      titulo: 'Arboviroses: Dengue, Zika, Chikungunya e Leptospirose',
      descricao: 'Classificação MS da dengue por grupos A-D, sinais de alarme, conduta por grupo. Zika e síndrome congênita. Leptospirose: diagnóstico e tratamento.',
      disciplina: 'Clínica Médica', tema: 'Infectologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 45, ordem: 5, mes: 5, semana: 4,
      videoUrl: null,
      conteudo: `**Dengue (MS 2024):**\nGrupo A: ambulatorial, hidratação oral\nGrupo B: hidratação supervisionada (Htc/Plaquetas)\nGrupo C: sinais de alarme → hidratação IV\nGrupo D: choque → UTI\n\n**Sinais de alarme:** dor abdominal intensa, vômitos persistentes, acúmulo líquidos, sangramento mucosas, letargia, Htc crescente, plaquetas < 100.000\n\n**Leptospirose:** contato água + febre + icterícia + mialgia (panturrilha). Penicilina G cristalina ou Doxiciclina`,
      ativo: true,
    },
    // ── Dermatologia — Mês 5 (3 aulas) ──────────────────────────────────────
    {
      titulo: 'Dermatoses Inflamatórias: Psoríase e Dermatites',
      descricao: 'Psoríase (placas eritematosas com escamas prateadas), dermatite atópica (criança/adulto), dermatite de contato alérgica vs irritativa.',
      disciplina: 'Clínica Médica', tema: 'Dermatologia', tipo: 'texto', nivel: 'basico',
      duracao: 40, ordem: 1, mes: 5, semana: 3,
      videoUrl: null, conteudo: `**Psoríase:** Placas eritematosas com escamas prateadas, fenômeno de Auspitz (sangramento ao raspar). Cutânea, ungueal, artropatia. Tratamento: tópico (corticoide, análogo vit D) → sistêmico\n\n**Dermatite Atópica:** Prurido intenso, xerose, déficit barreira. Criança < 2 anos → adulto. Hidratação + corticoide tópico. Evitar irritantes, banhos longos\n\n**Dermatite Contato Alérgica:** Reação tipo IV. Contato alérgeno → eritema → vesículas → exsudação. Teste epicutâneo confirma. Tratamento: remover alérgeno + corticoide tópico\n\n**Dermatite Contato Irritativa:** Causticidade do agente (sem sensibilização prévia). Mais frequente que alérgica. Limite barreira com emolientes\n\n**Diferencial:** Alérgica pode ter disseminação; irritativa segue contorno contato. História exposição importante`, ativo: true,
    },
    {
      titulo: 'Infecções Cutâneas: Bacterianas, Fúngicas e Parasitárias',
      descricao: 'Impetigo (crostoso vs bolhoso), erisipela, celulite, fasciite necrosante, dermatofitoses (tinha), escabiose (sarna). Diagnóstico e tratamento.',
      disciplina: 'Clínica Médica', tema: 'Dermatologia', tipo: 'texto', nivel: 'basico',
      duracao: 40, ordem: 2, mes: 5, semana: 4,
      videoUrl: null,
      conteudo: `**Erisipela vs Celulite:** erisipela tem bordo bem delimitado (dermis superficial), celulite é difusa (tecido subcutâneo). Ambas: estreptococo. Trat: Penicilina G (erisipela) ou Oxacilina (celulite se S.aureus)\n\n**Fasciite necrosante:** emergência cirúrgica. "Crepitação" + necrose rápida + toxemia. Cirurgia + antibióticos amplos\n\n**Escabiose:** pápulas + túneis + prurido noturno. Permetrina 5% tópica`,
      ativo: true,
    },
    {
      titulo: 'Câncer de Pele: Melanoma, CBC e CEC',
      descricao: 'ABCDE do melanoma, estadiamento (Breslow), carcinoma basocelular (mais comum), carcinoma espinocelular. Fotoproteção e rastreamento.',
      disciplina: 'Clínica Médica', tema: 'Dermatologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 35, ordem: 3, mes: 5, semana: 4,
      videoUrl: null, conteudo: `**Melanoma — ABCDE:** Assimetria, Borda irregular, Cor (variegada), Diâmetro > 6mm, Evolução (mudança)\n\n**Breslow:** < 0,76mm (nível I-II) bom prognóstico | 0,76-1,5mm (nível III) | > 1,5mm (nível IV-V) → necessita linfadenectomia, prognóstico ruim\n\n**CBC (mais comum, 80%):** Nódulo pérola/translúcido com vasos telangiectásicos. Invasão lenta. Tratamento: cirurgião com margem 4-5mm\n\n**CEC (Carcinoma Espinocelular):** Nódulo ou úlcera em áreas expostas. Risco metástase maior que CBC. Margem 4-6mm conforme profundidade\n\n**Fotoproteção:** FPS ≥ 30 diária, evitar horário pico (10-16h), roupas protetoras, óculos UV. Rastreamento visual anual em alto risco`, ativo: true,
    },
    // ── Urgência/Emergência — Mês 6 (4 aulas) ────────────────────────────────
    {
      titulo: 'Urgências Cardiológicas: Arritmias e Cardioversão',
      descricao: 'Fibrilação atrial, flutter, taquicardia ventricular e FV. Algoritmo ACLS, cardioversão elétrica e farmacológica, desfibrilação.',
      disciplina: 'Clínica Médica', tema: 'Cardiologia', tipo: 'texto', nivel: 'avancado',
      duracao: 65, ordem: 1, mes: 6, semana: 1,
      videoUrl: null,
      conteudo: `**FA com instabilidade:** cardioversão elétrica sincronizada imediata\n\nFA estável, < 48h: cardioversão farmacológica (amiodarona) ou elétrica\nFA > 48h: anticoagular 3 semanas antes de cardioverter (risco de trombo atrial)\n\n**TV com pulso + instabilidade:** cardioversão sincronizada 100J\n**TV sem pulso / FV:** desfibrilação não sincronizada 200J (bifásico) + RCP + adrenalina 1mg IV\n\n**Bradiarritmias:** atropina 0,5mg IV → marcapasso transcutâneo`,
      ativo: true,
    },
    {
      titulo: 'Tromboembolia Pulmonar e Trombose Venosa Profunda',
      descricao: 'Critérios de Wells, algoritmo diagnóstico (D-dímero → angioTC), estratificação de gravidade, anticoagulação e trombólise no TEP maciço.',
      disciplina: 'Clínica Médica', tema: 'Pneumologia', tipo: 'texto', nivel: 'avancado',
      duracao: 60, ordem: 2, mes: 6, semana: 1,
      videoUrl: null,
      conteudo: `**Escore de Wells TEP:** > 4 = alta probabilidade → angioTC direto\n\n**Diagnóstico:** angioTC tórax (padrão-ouro). D-dímero: exclui TEP se negativo em baixa/moderada probabilidade\n\n**TEP maciço** (hipotensão/choque): trombólise tPA + suporte hemodinâmico\n\n**TEP submaciço** (disfunção VD sem choque): anticoagulação plena; discutir trombólise\n\n**Anticoagulação:** HBPM → NOAC (rivaroxabana, apixabana) 3-6 meses mínimo`,
      ativo: true,
    },
    {
      titulo: 'Trauma: TCE e Lesões Torácicas Graves',
      descricao: 'TCE grave (Glasgow ≤ 8), hipertensão intracraniana, pneumotórax hipertensivo, hemotórax maciço, tamponamento cardíaco.',
      disciplina: 'Cirurgia', tema: 'Trauma', tipo: 'texto', nivel: 'avancado',
      duracao: 70, ordem: 3, mes: 6, semana: 2,
      videoUrl: null,
      conteudo: `**TCE grave:** IOT + hiperventilação moderada (PCO2 35) + manitol 1g/kg IV + cabeceira 30° + neurocirurgia\n\n**Pneumotórax hipertensivo:** DESCOMPRESSÃO IMEDIATA (punção 2°EIC linha hemiclavicular) → drenagem\n\n**Hemotórax maciço:** drenagem + reposição. > 1500mL inicial ou > 200mL/h → toracotomia\n\n**Tamponamento cardíaco:** Beck: hipotensão + turgência jugular + bulhas abafadas. Pericardiocentese de emergência`,
      ativo: true,
    },
    {
      titulo: 'Toxicologia: Intoxicações Agudas Mais Frequentes',
      descricao: 'Intoxicação por organofosforados, benzodiazepínicos, opioides, paracetamol, anticolinérgicos e antidepressivos tricíclicos. Antídotos específicos.',
      disciplina: 'Clínica Médica', tema: 'Toxicologia', tipo: 'texto', nivel: 'avancado',
      duracao: 55, ordem: 4, mes: 6, semana: 2,
      videoUrl: null,
      conteudo: `**Organofosforados (colinérgico):** miose, sialorréia, broncospasmo, bradic, fasciculações → ATROPINA + pralidoxima\n\n**Opioides:** miose puntiforme, bradipneia, rebaixamento → NALOXONA 0,4mg IV\n\n**Benzodiazepínicos:** sedação, hipotonia, ataxia → FLUMAZENIL 0,2mg IV (curta ação)\n\n**Paracetamol:** hepatotoxicidade (> 7,5g adulto). N-acetilcisteína IV em até 24h\n\n**Tricíclicos:** arritmia + convulsão + hipotensão → Bicarbonato de Na IV`,
      ativo: true,
    },
    // ── Clínica Médica — Mês 6 (4 aulas) ────────────────────────────────────
    {
      titulo: 'Reumatologia: Artrite Reumatoide, Gota e Espondiloartrites',
      descricao: 'AR: critérios ACR/EULAR 2010, DMARDs (metotrexato, biológicos). Gota: hiperuricemia, crise aguda (colchicina) e prevenção (alopurinol). Espondiloartrites.',
      disciplina: 'Clínica Médica', tema: 'Reumatologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 55, ordem: 1, mes: 6, semana: 1,
      videoUrl: null,
      conteudo: `**AR:** poliartrite simétrica de pequenas articulações, FR+, anti-CCP+. DMARDs: metotrexato 1ª linha. Biológicos (anti-TNF, abatacepte, tocilizumabe) se falha DMARD\n\n**Gota aguda:** colchicina 0,5mg 2x/dia ou AINEs. NÃO iniciar alopurinol na crise\n\n**Profilaxia:** alopurinol após resolução da crise. Meta: urato sérico < 6 mg/dL\n\n**LES:** ver módulo anterior (Anti-Sm específico, anti-DNA correlaciona com nefrite)`,
      ativo: true,
    },
    {
      titulo: 'Hematologia: Anemias — Diagnóstico e Tratamento',
      descricao: 'Algoritmo diagnóstico das anemias (microcítica, normocítica, macrocítica). Anemia ferropriva, megaloblástica, hemolítica e de doença crônica.',
      disciplina: 'Clínica Médica', tema: 'Hematologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 50, ordem: 2, mes: 6, semana: 2,
      videoUrl: null,
      conteudo: `**Microcítica hipocromica:** ferropriva (ferro ↓, ferritina ↓, TIBC ↑) vs doença crônica (ferro ↓, ferritina ↑, TIBC ↓) vs talassemia\n\n**Macrocítica:** B12 (neurológico: parestesias, subaguda medular) vs folato (só megaloblástica, sem neuro)\n\n**Anemia ferropriva:** sulfato ferroso 60-120mg/dia (em jejum, com vit. C). Hemoglobina normaliza em 4-8 sem, continuar por 3-6 meses\n\n**Hemolítica autoimune:** Coombs direto +, esferócitos → corticoide`,
      ativo: true,
    },
    {
      titulo: 'Ortopedia: Fraturas, Princípios e Emergências',
      descricao: 'Classificação de fraturas (aberta vs fechada, completa vs incompleta), princípios de imobilização, síndrome compartimental, fat embolism.',
      disciplina: 'Cirurgia', tema: 'Ortopedia', tipo: 'texto', nivel: 'intermediario',
      duracao: 50, ordem: 1, mes: 6, semana: 3,
      videoUrl: null,
      conteudo: `**Síndrome compartimental:** dor desproporcional + dor à extensão passiva + parestesias. Pressão > 30mmHg ou < 30mmHg abaixo da diastólica → FASCIOTOMIA de emergência\n\n**Fratura exposta (Gustilo):** I < 1cm, II 1-10cm, IIIA-C com perda vascular. Lavagem + estabilização + ATB (cefalosporina ± gentamicina)\n\n**Fratura de quadril (idoso):** cirurgia precoce (< 48h) reduz mortalidade. Arthroplastia vs fixação interna`,
      ativo: true,
    },
    {
      titulo: 'Geriatria: Síndromes Geriátricas e Polifarmácia',
      descricao: 'Os 5 Géis (Imobilidade, Instabilidade, Incontinência, Incapacidade cognitiva, Iatrogenia). Critérios de Beers, avaliação geriátrica ampla.',
      disciplina: 'Clínica Médica', tema: 'Geriatria', tipo: 'texto', nivel: 'intermediario',
      duracao: 45, ordem: 1, mes: 6, semana: 4,
      videoUrl: null,
      conteudo: `**Síndrome da imobilidade:** complicações (úlceras por pressão, TVP, pneumonia aspirativa, atrofia). Prevenção > tratamento\n\n**Delirium:** agudo + flutuante + atenção prejudicada. Causas: infecção, fármacos, retenção urinária, dor. Haloperidol se agitação\n\n**Critérios de Beers:** medicamentos a evitar no idoso: BDZ, anticolinérgicos, AINEs, certos anti-hipertensivos\n\n**Polifarmácia:** ≥ 5 medicamentos. Revisão + desprescrição`,
      ativo: true,
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
