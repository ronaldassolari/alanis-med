# Graph Report - .  (2026-04-10)

## Corpus Check
- 69 files · ~195,379 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 167 nodes · 282 edges · 19 communities detected
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `main()` - 16 edges
2. `Prisma Server Client Entry Point` - 16 edges
3. `Auth Library (src/lib/auth)` - 14 edges
4. `Prisma Browser Entry Point` - 12 edges
5. `Prisma Models Barrel` - 12 edges
6. `Prisma DB Client (@/lib/db)` - 11 edges
7. `Entity: User` - 9 edges
8. `Model: Teste` - 7 edges
9. `Questao Prisma Model` - 7 edges
10. `API Route: POST /api/testes (Submit Test, Scoring, Gamification)` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Neon PostgreSQL Adapter` --rationale_for--> `CLAUDE - Project Rules and Stack`  [INFERRED]
  src/lib/db.ts → CLAUDE.md
- `Aulas Content - Psychiatry (Ansiedade/TOC)` --shares_data_with--> `Aula DB Model`  [INFERRED]
  scripts/aulas-content.md → src/app/(dashboard)/aulas/page.tsx
- `Aulas Content - Psychiatry (Ansiedade/TOC)` --references--> `Medical Disciplines Taxonomy`  [INFERRED]
  scripts/aulas-content.md → src/app/(dashboard)/gerar/page.tsx
- `Prisma Config` --rationale_for--> `Prisma Server Client Entry Point`  [INFERRED]
  prisma.config.ts → src/generated/prisma/client.ts
- `Server Action Pattern` --rationale_for--> `CLAUDE - Project Rules and Stack`  [EXTRACTED]
  src/app/(dashboard)/aulas/[id]/page.tsx → CLAUDE.md

## Hyperedges (group relationships)
- **Prisma Generated Code Layer** — generated_browser, generated_client, generated_models, generated_enums, generated_commoninputs, internal_class, internal_prismans, internal_prismans_browser [EXTRACTED 1.00]
- **User Domain Models** — entity_user, model_account, model_session, model_meta, model_userbadge, model_badge [EXTRACTED 1.00]
- **Study Progress Domain Models** — model_aula, model_progresso, entity_user [EXTRACTED 1.00]
- **Exam / Simulado Domain Models** — model_prova, model_teste, model_nota, entity_questao, entity_user [EXTRACTED 1.00]
- **Seed Data Initialization Operations** — seed_main, adapter_neon, db_neon, generated_client [EXTRACTED 1.00]
- **Authentication Middleware Flow** — proxy_auth, lib_auth, model_session, entity_user [INFERRED 0.80]
- **Authentication Guard Pattern (auth() + redirect)** — dashboard_layout, dashboard_home, page_perfil, page_revisar, page_testes, page_progresso, page_provas, page_buscar, action_auth, action_gerar, api_testes, api_provas_id [EXTRACTED 1.00]
- **DeepSeek AI Integration Layer** — action_gerar, api_analise, api_gerar, deepseek_api [EXTRACTED 1.00]
- **Gamification System (streak, badges, XP, metas)** — api_testes, model_user, dashboard_home, page_perfil [INFERRED 0.85]
- **Exam Flow (list → detail → submit → score)** — page_provas, page_prova_detail, api_provas_id, api_testes, model_questao [EXTRACTED 1.00]
- **Prisma Database Access Layer** — lib_db, model_questao, model_user, action_auth, action_gerar, api_testes, api_provas_id, dashboard_home, page_perfil, page_revisar, page_testes, page_progresso, page_provas, page_buscar [EXTRACTED 1.00]
- **Dashboard Pages Auth Guard Pattern** — notaspage_notaspage, aulaspage_aulaspage, aulasidpage_auladetailpage, libauth_auth [EXTRACTED 1.00]
- **Shared UI Component System** — card_card, progressbar_progressbar, badge_badge, button_button, statcard_statcard [INFERRED 0.90]
- **Aula Progress Tracking Flow** — aulaspage_aulaspage, aulasidpage_auladetailpage, concept_progressomodel, concept_serveraction, libdb_db [EXTRACTED 1.00]
- **AI Question Generation Pipeline** — gerarpage_gerarpage, gerarlayout_gerarlayout, concept_apigerar, concept_questaogerada, concept_maxduration [EXTRACTED 1.00]
- **Auth Providers Stack** — libauth_auth, concept_nextauth, concept_autoprovisioning, loginpage_loginpage [EXTRACTED 1.00]
- **Database Layer** — libdb_db, concept_prismaclient, concept_nextneon [EXTRACTED 1.00]
- **Project Architecture Conventions** — claude_claude, agents_agents, concept_serveraction, concept_prismaclient [EXTRACTED 1.00]

## Communities

### Community 0 - "Aulas e Conteúdo Médico"
Cohesion: 0.09
Nodes (32): AGENTS - Next.js Breaking Changes Warning, Aulas Content - Psychiatry (Ansiedade/TOC), Aula Detail Page, Aulas Page, Badge(), CLAUDE - Project Rules and Stack, API Route /api/gerar, Approval Scoring Logic (nota 0-10) (+24 more)

### Community 1 - "Auth e Database Core"
Cohesion: 0.1
Nodes (7): Prisma Neon Adapter, gerarQuestoes(), getClient(), atualizarMetas(), atualizarStreak(), POST(), verificarBadges()

### Community 2 - "API Routes e Server Actions"
Cohesion: 0.15
Nodes (26): Auth Server Actions (handleLogin, handleRegister, handleSignOut), Gerar Questoes Server Action, API Route: POST /api/analise (DeepSeek AI Analysis), API Route: POST /api/gerar (Edge: AI Question Generation), API Route: NextAuth Handlers, API Route: GET /api/provas/[id] (Fetch Prova with Questoes), API Route: POST /api/testes (Submit Test, Scoring, Gamification), AnaliseIA Client Component (+18 more)

### Community 3 - "Prisma ORM e Entidades"
Cohesion: 0.26
Nodes (24): Neon PostgreSQL Database, Entity: Questao, Entity: User, Prisma Browser Entry Point, Prisma Server Client Entry Point, Prisma Common Input Types, Prisma Enums (empty), Prisma Models Barrel (+16 more)

### Community 4 - "Modelos de Domínio"
Cohesion: 0.21
Nodes (0): 

### Community 5 - "Progresso e Análise IA"
Cohesion: 0.12
Nodes (3): handleConcluir(), handleIniciar(), marcarProgresso()

### Community 6 - "UI Components (Card)"
Cohesion: 0.5
Nodes (2): Card(), StatCard UI Component

### Community 7 - "Prisma Browser Layer"
Cohesion: 1.0
Nodes (0): 

### Community 8 - "StatCard Component"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "Prisma Config"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Next.js Env Types"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Next.js Config"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "NextAuth Types"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Button Component"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Next.js Config Alt"
Cohesion: 1.0
Nodes (1): Next.js Config

### Community 15 - "Env Types Alt"
Cohesion: 1.0
Nodes (1): Next.js Environment Types

### Community 16 - "VerificationToken"
Cohesion: 1.0
Nodes (1): Entity: VerificationToken

### Community 17 - "App Layout"
Cohesion: 1.0
Nodes (1): Root App Layout

### Community 18 - "Button UI"
Cohesion: 1.0
Nodes (1): Button UI Component

## Knowledge Gaps
- **19 isolated node(s):** `Next.js Config`, `Next.js Environment Types`, `Prisma Namespace (browser)`, `Entity: VerificationToken`, `NextAuth Session Type Extension` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Prisma Browser Layer`** (2 nodes): `browser.ts`, `prismaNamespaceBrowser.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `StatCard Component`** (2 nodes): `stat-card.tsx`, `StatCard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Prisma Config`** (1 nodes): `prisma.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Env Types`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Config`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `NextAuth Types`** (1 nodes): `next-auth.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Button Component`** (1 nodes): `button.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Config Alt`** (1 nodes): `Next.js Config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Env Types Alt`** (1 nodes): `Next.js Environment Types`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `VerificationToken`** (1 nodes): `Entity: VerificationToken`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Layout`** (1 nodes): `Root App Layout`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Button UI`** (1 nodes): `Button UI Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `main()` connect `Prisma ORM e Entidades` to `Auth e Database Core`?**
  _High betweenness centrality (0.360) - this node is a cross-community bridge._
- **Why does `Badge()` connect `Aulas e Conteúdo Médico` to `Modelos de Domínio`?**
  _High betweenness centrality (0.271) - this node is a cross-community bridge._
- **Why does `Auth Library (src/lib/auth)` connect `API Routes e Server Actions` to `Prisma ORM e Entidades`?**
  _High betweenness centrality (0.233) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Prisma Server Client Entry Point` (e.g. with `Prisma Config` and `Auth Proxy Middleware`) actually correct?**
  _`Prisma Server Client Entry Point` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Next.js Config`, `Next.js Environment Types`, `Prisma Namespace (browser)` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Aulas e Conteúdo Médico` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Auth e Database Core` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._