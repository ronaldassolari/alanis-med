-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ALUNO',
    "especialidade" TEXT,
    "pontos" INTEGER NOT NULL DEFAULT 0,
    "streakDias" INTEGER NOT NULL DEFAULT 0,
    "ultimoEstudo" TIMESTAMP(3),
    "planoAtivo" TEXT NOT NULL DEFAULT 'basico',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "icone" TEXT NOT NULL,
    "cor" TEXT NOT NULL DEFAULT '#0066FF',
    "criterio" TEXT NOT NULL,
    "pontos" INTEGER NOT NULL DEFAULT 50,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "ganhoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "meta" INTEGER NOT NULL,
    "atual" INTEGER NOT NULL DEFAULT 0,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aulas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "videoUrl" TEXT,
    "conteudo" TEXT,
    "disciplina" TEXT NOT NULL,
    "tema" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'video',
    "nivel" TEXT NOT NULL DEFAULT 'basico',
    "duracao" INTEGER,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "mes" INTEGER,
    "semana" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "subtipo" TEXT NOT NULL DEFAULT 'completa',
    "ano" INTEGER,
    "disciplina" TEXT,
    "tema" TEXT,
    "descricao" TEXT,
    "tempoPrevisto" INTEGER,
    "dificuldade" TEXT NOT NULL DEFAULT 'medio',
    "geradaPorIA" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questoes" (
    "id" TEXT NOT NULL,
    "provaId" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "opcaoA" TEXT NOT NULL,
    "opcaoB" TEXT NOT NULL,
    "opcaoC" TEXT NOT NULL,
    "opcaoD" TEXT NOT NULL,
    "opcaoE" TEXT,
    "gabarito" TEXT NOT NULL,
    "explicacao" TEXT,
    "referencia" TEXT,
    "disciplina" TEXT,
    "tema" TEXT,
    "dificuldade" TEXT NOT NULL DEFAULT 'medio',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "geradaPorIA" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "questoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provaId" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'tematico',
    "respostas" TEXT NOT NULL DEFAULT '{}',
    "acertos" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "tempo" INTEGER,
    "pontos" INTEGER NOT NULL DEFAULT 0,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "analise" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testeId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "aprovado" BOOLEAN NOT NULL,
    "percentil" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progresso" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aulaId" TEXT NOT NULL,
    "percentual" INTEGER NOT NULL DEFAULT 0,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFim" TIMESTAMP(3),
    "tempoGasto" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "progresso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "notas_testeId_key" ON "notas"("testeId");

-- CreateIndex
CREATE UNIQUE INDEX "progresso_userId_aulaId_key" ON "progresso"("userId", "aulaId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metas" ADD CONSTRAINT "metas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questoes" ADD CONSTRAINT "questoes_provaId_fkey" FOREIGN KEY ("provaId") REFERENCES "provas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testes" ADD CONSTRAINT "testes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testes" ADD CONSTRAINT "testes_provaId_fkey" FOREIGN KEY ("provaId") REFERENCES "provas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas" ADD CONSTRAINT "notas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas" ADD CONSTRAINT "notas_testeId_fkey" FOREIGN KEY ("testeId") REFERENCES "testes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso" ADD CONSTRAINT "progresso_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso" ADD CONSTRAINT "progresso_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "aulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
