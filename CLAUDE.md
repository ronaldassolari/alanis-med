@AGENTS.md

# Alanis Med — Contexto do Projeto

## Objetivo
Plataforma de residência médica. Questões, simulados, progresso de estudo.

## Stack
- Next.js 16 (App Router, Server Components, Server Actions)
- Prisma 7 + SQLite (dev.db local) → migrar para Neon PostgreSQL em produção
- TypeScript + Tailwind CSS
- Vercel deploy

## Estrutura de pastas
```
src/
├── app/          ← rotas (App Router)
├── components/   ← componentes reutilizáveis
├── lib/          ← prisma client, utils
└── actions/      ← Server Actions (mutations aqui, não API routes)
prisma/
├── schema.prisma
└── migrations/
```

## Regras obrigatórias
- **Server Actions** para toda mutation — não criar API routes desnecessárias
- **Prisma Client:** importar de `@/lib/prisma` — nunca instanciar direto
- **Schema changes:** sempre `npx prisma migrate dev --name <desc>` + `npx prisma generate`
- **Nunca editar dev.db manualmente**
- Dados sensíveis nunca em Client Components — usar Server Components/Actions

## Comandos
```bash
cd "/Users/ronaldsantosassolari/Desktop/AI/PROJETO_MASTER/alanis-med"

npm run dev                                    # dev server
npx prisma migrate dev --name <nome>           # após mudar schema
npx prisma generate                            # após migrate
npx prisma studio                              # visualizar banco
npm run build                                  # verificar build antes de deploy
npx prisma migrate reset                       # DESTRUTIVO — confirmar antes
```

## Segurança
- dev.db nunca no git (.gitignore)
- Validar inputs antes de passar ao Prisma
- Verificar sessão em toda Server Action que muta dados
