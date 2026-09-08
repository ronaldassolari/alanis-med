---
type: community
cohesion: 0.15
members: 26
---

# API Routes e Server Actions

**Cohesion:** 0.15 - loosely connected
**Members:** 26 nodes

## Members
- [[API Route GET apiprovasid (Fetch Prova with Questoes)]] - code - src/app/api/provas/[id]/route.ts
- [[API Route NextAuth Handlers]] - code - src/app/api/auth/[...nextauth]/route.ts
- [[API Route POST apianalise (DeepSeek AI Analysis)]] - code - src/app/api/analise/route.ts
- [[API Route POST apigerar (Edge AI Question Generation)]] - code - src/app/api/gerar/route.ts
- [[API Route POST apitestes (Submit Test, Scoring, Gamification)]] - code - src/app/api/testes/route.ts
- [[AnaliseIA Client Component]] - code - src/app/(dashboard)/progresso/analise-ia.tsx
- [[Auth Library (srclibauth)]] - code - src/proxy.ts
- [[Auth Server Actions (handleLogin, handleRegister, handleSignOut)]] - code - src/app/actions/auth.ts
- [[Buscar Page (Full-text Search)]] - code - src/app/(dashboard)/buscar/page.tsx
- [[Dashboard Home Page]] - code - src/app/(dashboard)/page.tsx
- [[Dashboard Layout (Auth Guard + Sidebar)]] - code - src/app/(dashboard)/layout.tsx
- [[DeepSeek AI API (external)]] - code - src/app/actions/gerar.ts
- [[Gerar Questoes Server Action]] - code - src/app/actions/gerar.ts
- [[NextAuth Session Type Extension]] - code - src/types/next-auth.d.ts
- [[NotasChart Client Component (Recharts)]] - code - src/app/(dashboard)/progresso/notas-chart.tsx
- [[Perfil Page]] - code - src/app/(dashboard)/perfil/page.tsx
- [[Prisma DB Client (@libdb)]] - code - src/lib/db.ts
- [[Progresso Page]] - code - src/app/(dashboard)/progresso/page.tsx
- [[Prova Detail Page (Client take exam)]] - code - src/app/(dashboard)/provas/[id]/page.tsx
- [[Provas List Page]] - code - src/app/(dashboard)/provas/page.tsx
- [[Questao Prisma Model]] - code - src/generated/prisma/models/Questao.ts
- [[Register Page]] - code - src/app/register/page.tsx
- [[Revisar Page (Spaced Review)]] - code - src/app/(dashboard)/revisar/page.tsx
- [[Sidebar Component]] - code - src/components/sidebar.tsx
- [[Testes Page (Quick Tests)]] - code - src/app/(dashboard)/testes/page.tsx
- [[User Prisma Model]] - code - src/generated/prisma/models/User.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/API_Routes_e_Server_Actions
SORT file.name ASC
```

## Connections to other communities
- 1 edge to [[_COMMUNITY_Prisma ORM e Entidades]]

## Top bridge nodes
- [[Auth Library (srclibauth)]] - degree 14, connects to 1 community