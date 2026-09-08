---
type: community
cohesion: 0.10
members: 26
---

# Auth e Database Core

**Cohesion:** 0.10 - loosely connected
**Members:** 26 nodes

## Members
- [[DashboardLayout()]] - code - src/app/(dashboard)/layout.tsx
- [[GET()]] - code - src/app/api/provas/[id]/route.ts
- [[GerarLayout()]] - code - src/app/(dashboard)/gerar/layout.tsx
- [[POST()]] - code - src/app/api/gerar/route.ts
- [[Prisma Neon Adapter]] - code - prisma/seed.ts
- [[RootLayout()]] - code - src/app/layout.tsx
- [[atualizarMetas()]] - code - src/app/api/testes/route.ts
- [[atualizarStreak()]] - code - src/app/api/testes/route.ts
- [[auth.ts]] - code - src/lib/auth.ts
- [[createPrismaClient()]] - code - src/lib/db.ts
- [[db.ts]] - code - src/lib/db.ts
- [[gerar.ts]] - code - src/app/actions/gerar.ts
- [[gerarQuestoes()]] - code - src/app/actions/gerar.ts
- [[gerarUma()]] - code - src/app/api/gerar/route.ts
- [[getClient()]] - code - src/app/actions/gerar.ts
- [[handleLogin()]] - code - src/app/actions/auth.ts
- [[handleRegister()]] - code - src/app/actions/auth.ts
- [[handleSignOut()]] - code - src/app/actions/auth.ts
- [[isActive()]] - code - src/components/sidebar.tsx
- [[layout.tsx]] - code - src/app/(dashboard)/gerar/layout.tsx
- [[proxy.ts]] - code - src/proxy.ts
- [[route.ts]] - code - src/app/api/gerar/route.ts
- [[salvarQuestoesGeradas()]] - code - src/app/actions/gerar.ts
- [[seed.ts]] - code - prisma/seed.ts
- [[sidebar.tsx]] - code - src/components/sidebar.tsx
- [[verificarBadges()]] - code - src/app/api/testes/route.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Auth_e_Database_Core
SORT file.name ASC
```

## Connections to other communities
- 3 edges to [[_COMMUNITY_Progresso e Análise IA]]
- 2 edges to [[_COMMUNITY_Modelos de Domínio]]
- 2 edges to [[_COMMUNITY_Prisma ORM e Entidades]]

## Top bridge nodes
- [[db.ts]] - degree 7, connects to 2 communities
- [[seed.ts]] - degree 3, connects to 2 communities
- [[auth.ts]] - degree 11, connects to 1 community
- [[gerar.ts]] - degree 6, connects to 1 community
- [[Prisma Neon Adapter]] - degree 3, connects to 1 community