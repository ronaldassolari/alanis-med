import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaNeonHttp } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {})
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
      pontos: 1250,
      streakDias: 7,
      ultimoEstudo: new Date(),
      planoAtivo: 'pro',
    },
  })
  console.log('✅ Usuário criado:', user.email)

  // User badges (earned 3)
  await db.userBadge.createMany({
    data: [
      { userId: user.id, badgeId: badges[0].id },
      { userId: user.id, badgeId: badges[2].id },
      { userId: user.id, badgeId: badges[3].id },
    ],
  })

  // ── METAS ───────────────────────────────────────────────────────────────────
  await db.meta.createMany({
    data: [
      { userId: user.id, tipo: 'diaria', descricao: 'Completar 2 aulas', meta: 2, atual: 1, concluida: false },
      { userId: user.id, tipo: 'semanal', descricao: 'Fazer 3 simulados', meta: 3, atual: 2, concluida: false },
      { userId: user.id, tipo: 'mensal', descricao: 'Estudar 40 horas', meta: 40, atual: 28, concluida: false },
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
      videoUrl: 'https://www.youtube.com/watch?v=HAS_video',
      conteudo: null, ativo: true,
    },
    {
      titulo: 'Diabetes Mellitus Tipo 2',
      descricao: 'Fisiopatologia, diagnóstico, metas terapêuticas e farmacoterapia do DM2. Insulinoterapia e novos antidiabéticos.',
      disciplina: 'Clínica Médica', tema: 'Endocrinologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 60, ordem: 2, mes: 1, semana: 1,
      videoUrl: null,
      conteudo: `**Diagnóstico de Diabetes Mellitus:**\n- Glicemia de jejum ≥ 126 mg/dL (2 ocasiões)\n- Glicemia 2h pós-TOTG ≥ 200 mg/dL\n- HbA1c ≥ 6,5%\n- Glicemia aleatória ≥ 200 mg/dL com sintomas\n\n**Metas:** HbA1c < 7%, PA < 130/80, LDL < 70\n\n**Tratamento:** MEV → Metformina → Associações (iSGLT2, GLP-1, sulfoniluréias) → Insulina`,
      ativo: true,
    },
    {
      titulo: 'Síndrome Coronariana Aguda',
      descricao: 'IAM com e sem supradesnivelamento de ST. Diagnóstico eletrocardiográfico, marcadores e tratamento de reperfusão.',
      disciplina: 'Clínica Médica', tema: 'Cardiologia', tipo: 'video', nivel: 'avancado',
      duracao: 70, ordem: 3, mes: 1, semana: 2,
      videoUrl: null, conteudo: null, ativo: true,
    },
    {
      titulo: 'Insuficiência Cardíaca',
      descricao: 'IC sistólica e diastólica. Classificação NYHA, diagnóstico e tratamento farmacológico baseado em evidências.',
      disciplina: 'Clínica Médica', tema: 'Cardiologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 55, ordem: 4, mes: 1, semana: 2,
      videoUrl: null,
      conteudo: `**Diagnóstico:** Critérios de Framingham (2 maiores ou 1 maior + 2 menores)\n\n**Classificação NYHA:** I → IV conforme limitação funcional\n\n**Tratamento IC-FEr (FE < 40%):**\n- IECA/BRA (enalapril, losartana)\n- Betabloqueador (carvedilol, bisoprolol)\n- Espironolactona (se FE ≤ 35%)\n- Sacubitril/valsartana (ARNI) → substitui IECA se tolerado`,
      ativo: true,
    },
    {
      titulo: 'Pneumonia Adquirida na Comunidade',
      descricao: 'Epidemiologia, diagnóstico, estratificação de gravidade (CURB-65, PSI) e tratamento da PAC no adulto.',
      disciplina: 'Clínica Médica', tema: 'Pneumologia', tipo: 'video', nivel: 'intermediario',
      duracao: 50, ordem: 5, mes: 2, semana: 1,
      videoUrl: null, conteudo: null, ativo: true,
    },
    {
      titulo: 'Doença Renal Crônica',
      descricao: 'Estadiamento pela TFG, causas principais, diagnóstico de complicações e tratamento conservador e renal substitutivo.',
      disciplina: 'Clínica Médica', tema: 'Nefrologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 55, ordem: 6, mes: 2, semana: 1,
      videoUrl: null, conteudo: null, ativo: true,
    },
    {
      titulo: 'Acidente Vascular Cerebral',
      descricao: 'AVC isquêmico e hemorrágico. Diagnóstico por imagem, janela terapêutica para trombólise e prevenção secundária.',
      disciplina: 'Clínica Médica', tema: 'Neurologia', tipo: 'video', nivel: 'avancado',
      duracao: 65, ordem: 7, mes: 2, semana: 2,
      videoUrl: null, conteudo: null, ativo: true,
    },
    {
      titulo: 'Sepse e Choque Séptico',
      descricao: 'Critérios diagnósticos (Sepsis-3), bundle de 1h, antibioticoterapia e suporte hemodinâmico no choque séptico.',
      disciplina: 'Clínica Médica', tema: 'UTI', tipo: 'texto', nivel: 'avancado',
      duracao: 75, ordem: 8, mes: 3, semana: 1,
      videoUrl: null, conteudo: null, ativo: true,
    },
    // ── Cirurgia (6 aulas) ──
    {
      titulo: 'Abdome Agudo: Diagnóstico e Conduta',
      descricao: 'Diagnóstico diferencial do abdome agudo. Apendicite, colecistite, obstrução intestinal e perfuração de víscera.',
      disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', tipo: 'video', nivel: 'intermediario',
      duracao: 55, ordem: 1, mes: 1, semana: 3,
      videoUrl: null, conteudo: null, ativo: true,
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
      disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', tipo: 'video', nivel: 'basico',
      duracao: 40, ordem: 3, mes: 2, semana: 3,
      videoUrl: null, conteudo: null, ativo: true,
    },
    {
      titulo: 'Câncer Colorretal',
      descricao: 'Rastreamento, diagnóstico, estadiamento TNM e tratamento cirúrgico do câncer de cólon e reto.',
      disciplina: 'Cirurgia', tema: 'Oncologia Cirúrgica', tipo: 'texto', nivel: 'intermediario',
      duracao: 60, ordem: 4, mes: 3, semana: 1,
      videoUrl: null, conteudo: null, ativo: true,
    },
    {
      titulo: 'Queimaduras',
      descricao: 'Classificação por profundidade e extensão, fórmula de Parkland, indicações de UTI-Q e curativos.',
      disciplina: 'Cirurgia', tema: 'Trauma', tipo: 'video', nivel: 'intermediario',
      duracao: 45, ordem: 5, mes: 3, semana: 2,
      videoUrl: null, conteudo: null, ativo: true,
    },
    {
      titulo: 'Pancreatite Aguda',
      descricao: 'Etiologia, escore de Ranson e APACHE II, tratamento clínico e indicações de intervenção na pancreatite grave.',
      disciplina: 'Cirurgia', tema: 'Cirurgia Abdominal', tipo: 'texto', nivel: 'avancado',
      duracao: 65, ordem: 6, mes: 4, semana: 1,
      videoUrl: null, conteudo: null, ativo: true,
    },
    // ── Pediatria (6 aulas) ──
    {
      titulo: 'Crescimento e Desenvolvimento Normal',
      descricao: 'Marcos do DNPM, curvas de crescimento OMS, triagem auditiva, visual e desenvolvimento neurológico.',
      disciplina: 'Pediatria', tema: 'Desenvolvimento', tipo: 'video', nivel: 'basico',
      duracao: 40, ordem: 1, mes: 1, semana: 4,
      videoUrl: null, conteudo: null, ativo: true,
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
      disciplina: 'Pediatria', tema: 'Neonatologia', tipo: 'video', nivel: 'avancado',
      duracao: 80, ordem: 3, mes: 2, semana: 4,
      videoUrl: null, conteudo: null, ativo: true,
    },
    {
      titulo: 'Doenças Exantemáticas',
      descricao: 'Sarampo, rubéola, varicela, escarlatina, doença de Kawasaki. Diagnóstico diferencial e complicações.',
      disciplina: 'Pediatria', tema: 'Infectologia Pediátrica', tipo: 'texto', nivel: 'intermediario',
      duracao: 45, ordem: 4, mes: 3, semana: 3,
      videoUrl: null, conteudo: null, ativo: true,
    },
    {
      titulo: 'Desnutrição e Distúrbios Nutricionais',
      descricao: 'Marasmo, kwashiorkor, hipovitaminoses, anemia ferropriva. Diagnóstico e tratamento em pediatria.',
      disciplina: 'Pediatria', tema: 'Nutrição Pediátrica', tipo: 'video', nivel: 'basico',
      duracao: 40, ordem: 5, mes: 4, semana: 1,
      videoUrl: null, conteudo: null, ativo: true,
    },
    {
      titulo: 'Imunização: Calendário Vacinal',
      descricao: 'Calendário vacinal do Ministério da Saúde. Vacinas obrigatórias, esquemas de recuperação e contraindicações.',
      disciplina: 'Pediatria', tema: 'Imunização', tipo: 'texto', nivel: 'basico',
      duracao: 35, ordem: 6, mes: 4, semana: 2,
      videoUrl: null, conteudo: null, ativo: true,
    },
    // ── Ginecologia e Obstetrícia (5 aulas) ──
    {
      titulo: 'Pré-Natal de Baixo Risco',
      descricao: 'Rotina de pré-natal: exames, vacinas, suplementação, intercorrências frequentes e consultas.',
      disciplina: 'Ginecologia', tema: 'Obstetrícia', tipo: 'video', nivel: 'basico',
      duracao: 45, ordem: 1, mes: 2, semana: 2,
      videoUrl: null, conteudo: null, ativo: true,
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
      disciplina: 'Ginecologia', tema: 'Obstetrícia', tipo: 'video', nivel: 'intermediario',
      duracao: 55, ordem: 3, mes: 3, semana: 2,
      videoUrl: null, conteudo: null, ativo: true,
    },
    {
      titulo: 'Câncer de Colo do Útero',
      descricao: 'HPV, rastreamento (Papanicolaou), colposcopia, estadiamento e tratamento do CCU.',
      disciplina: 'Ginecologia', tema: 'Oncologia Ginecológica', tipo: 'texto', nivel: 'intermediario',
      duracao: 50, ordem: 4, mes: 4, semana: 1,
      videoUrl: null, conteudo: null, ativo: true,
    },
    {
      titulo: 'Contracepção e Planejamento Familiar',
      descricao: 'Métodos contraceptivos, eficácia (índice de Pearl), contraindicações e anticoncepção de emergência.',
      disciplina: 'Ginecologia', tema: 'Ginecologia Geral', tipo: 'video', nivel: 'basico',
      duracao: 40, ordem: 5, mes: 4, semana: 2,
      videoUrl: null, conteudo: null, ativo: true,
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
      disciplina: 'Saúde Pública', tema: 'Epidemiologia', tipo: 'video', nivel: 'intermediario',
      duracao: 50, ordem: 2, mes: 2, semana: 3,
      videoUrl: null, conteudo: null, ativo: true,
    },
    {
      titulo: 'Vigilância Epidemiológica',
      descricao: 'SINAN, notificação compulsória, investigação de surtos, controle de doenças endêmicas e epidêmicas.',
      disciplina: 'Saúde Pública', tema: 'Epidemiologia', tipo: 'texto', nivel: 'intermediario',
      duracao: 45, ordem: 3, mes: 3, semana: 3,
      videoUrl: null, conteudo: null, ativo: true,
    },
    {
      titulo: 'Saúde da Família e ESF',
      descricao: 'Estratégia de Saúde da Família, composição das equipes, área de abrangência, ações prioritárias e PMAQ.',
      disciplina: 'Saúde Pública', tema: 'Atenção Primária', tipo: 'video', nivel: 'basico',
      duracao: 40, ordem: 4, mes: 4, semana: 3,
      videoUrl: null, conteudo: null, ativo: true,
    },
    {
      titulo: 'Políticas de Saúde e Programas Nacionais',
      descricao: 'PNAB, Rede Cegonha, Rede de Urgência e Emergência, Programa Saúde na Escola e políticas prioritárias.',
      disciplina: 'Saúde Pública', tema: 'Políticas de Saúde', tipo: 'texto', nivel: 'intermediario',
      duracao: 45, ordem: 5, mes: 4, semana: 4,
      videoUrl: null, conteudo: null, ativo: true,
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
  console.log('✅ Questões criadas: 80')

  // ── PROGRESSO (30 entradas) ──────────────────────────────────────────────────
  const progressoEntries = [
    // Concluídas (10)
    { idx: 0, percentual: 100, concluido: true, tempo: 48 },
    { idx: 1, percentual: 100, concluido: true, tempo: 65 },
    { idx: 2, percentual: 100, concluido: true, tempo: 72 },
    { idx: 3, percentual: 100, concluido: true, tempo: 58 },
    { idx: 4, percentual: 100, concluido: true, tempo: 53 },
    { idx: 8, percentual: 100, concluido: true, tempo: 58 },
    { idx: 14, percentual: 100, concluido: true, tempo: 42 },
    { idx: 20, percentual: 100, concluido: true, tempo: 47 },
    { idx: 25, percentual: 100, concluido: true, tempo: 38 },
    { idx: 26, percentual: 100, concluido: true, tempo: 52 },
    // Parciais (10)
    { idx: 5, percentual: 75, concluido: false, tempo: 40 },
    { idx: 6, percentual: 60, concluido: false, tempo: 42 },
    { idx: 7, percentual: 50, concluido: false, tempo: 38 },
    { idx: 9, percentual: 80, concluido: false, tempo: 45 },
    { idx: 10, percentual: 40, concluido: false, tempo: 18 },
    { idx: 15, percentual: 30, concluido: false, tempo: 15 },
    { idx: 16, percentual: 65, concluido: false, tempo: 52 },
    { idx: 21, percentual: 45, concluido: false, tempo: 22 },
    { idx: 22, percentual: 55, concluido: false, tempo: 30 },
    { idx: 27, percentual: 70, concluido: false, tempo: 35 },
    // Mínimo (10)
    { idx: 11, percentual: 10, concluido: false, tempo: 6 },
    { idx: 12, percentual: 15, concluido: false, tempo: 10 },
    { idx: 13, percentual: 5, concluido: false, tempo: 3 },
    { idx: 17, percentual: 20, concluido: false, tempo: 12 },
    { idx: 18, percentual: 10, concluido: false, tempo: 5 },
    { idx: 19, percentual: 5, concluido: false, tempo: 3 },
    { idx: 23, percentual: 10, concluido: false, tempo: 4 },
    { idx: 24, percentual: 15, concluido: false, tempo: 8 },
    { idx: 28, percentual: 5, concluido: false, tempo: 2 },
    { idx: 29, percentual: 10, concluido: false, tempo: 5 },
  ]

  for (const p of progressoEntries) {
    if (p.idx < aulas.length) {
      await db.progresso.create({
        data: {
          userId: user.id,
          aulaId: aulas[p.idx].id,
          percentual: p.percentual,
          concluido: p.concluido,
          dataFim: p.concluido ? new Date() : null,
          tempoGasto: p.tempo,
        },
      })
    }
  }
  console.log('✅ Progresso criado: 30 entradas')

  // ── TESTES + NOTAS (5) ───────────────────────────────────────────────────────
  const testesData = [
    { acertos: 17, total: 20, provaId: provaENARE.id, tipo: 'prova', diasAtras: 20, pontos: 280, percentil: 88 },
    { acertos: 14, total: 20, provaId: provaCajuru.id, tipo: 'prova', diasAtras: 14, pontos: 210, percentil: 72 },
    { acertos: 20, total: 20, provaId: provaSimulado.id, tipo: 'prova', diasAtras: 10, pontos: 350, percentil: 99 },
    { acertos: 12, total: 20, provaId: provaCajuru.id, tipo: 'tematico', diasAtras: 7, pontos: 160, percentil: 55 },
    { acertos: 18, total: 20, provaId: provaRapido.id, tipo: 'tematico', diasAtras: 3, pontos: 310, percentil: 94 },
  ]

  for (const t of testesData) {
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - t.diasAtras)
    const nota = (t.acertos / t.total) * 10
    const aprovado = nota >= 6

    const teste = await db.teste.create({
      data: {
        userId: user.id,
        provaId: t.provaId,
        tipo: t.tipo,
        respostas: JSON.stringify({}),
        acertos: t.acertos,
        total: t.total,
        tempo: Math.floor(60 + Math.random() * 120),
        pontos: t.pontos,
        completado: true,
        createdAt,
      },
    })

    await db.nota.create({
      data: {
        userId: user.id,
        testeId: teste.id,
        valor: nota,
        aprovado,
        percentil: t.percentil,
        createdAt,
      },
    })
  }
  console.log('✅ Testes e notas criados: 5')

  console.log('\n🎉 Seed v2 concluído!')
  console.log('   📧 alanis@med.com | 🔑 alanis123')
  console.log('   🏆 30 aulas | 4 provas | 80 questões | 10 badges')
}

main()
  .then(async () => { await db.$disconnect() })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e)
    await db.$disconnect()
    process.exit(1)
  })
