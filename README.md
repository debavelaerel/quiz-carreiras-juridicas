# Diagnóstico da Base — Quiz VDE Carreiras Jurídicas

> **Vai subir na AWS?** Comece por [`docs/DEPLOY.md`](docs/DEPLOY.md). Este repo nasceu do
> `quiz-tribunais`. Usa o mesmo projeto Supabase, mas em **tabelas próprias** `quiz_cj_*`
> (padrão da OAB) — ver `docs/DEPLOY.md`.

Funil de quiz comercial: a pessoa responde um teste graduado (5 questões
reais de concurso, uma por disciplina) + um perfilamento (alvo, cargo, tempo de estudo, dor,
momento etc.), e o sistema devolve um resultado personalizado na tela, um
**diagnóstico em PDF** (gerado sozinho, em background) e — sob demanda, pelo
painel administrativo — uma **apresentação comercial em PDF** (deck pra
call 1:1 de vendas).

> Design system (cores, tipografia, componentes) está em [DESIGN.md](DESIGN.md) —
> não duplicado aqui.

## Stack

| Camada | Tecnologia |
|---|---|
| Front-end + API | Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 |
| Banco de dados | Supabase (Postgres), acessado só pela `service_role` (sem policy pública) |
| Geração de PDF | Serviço próprio em Python (FastAPI + Playwright/Chromium headless), deploy separado, como container |
| Armazenamento de PDF | S3 (AWS SDK v3 no lado Next.js; boto3 no lado Python) |
| Autenticação do painel admin | Senha única + cookie HMAC-SHA256 (`node:crypto`), sem tabela de usuário |
| Testes | Vitest + Testing Library |

## Arquitetura

```
┌──────────────┐   fetch (JSON)    ┌────────────────────────┐
│  Quiz (React) │ ───────────────▶ │  Next.js API routes     │
│ components/   │ ◀─────────────── │  app/api/quiz/*          │
│  Quiz.tsx     │                  │  (Node.js runtime)       │
└──────────────┘                  └───────────┬──────────────┘
                                               │ service_role
                                               ▼
                                   ┌────────────────────────┐
                                   │   Supabase (Postgres)    │
                                   │   quiz_cj_sessions           │
                                   │   quiz_cj_leads_desqualificados   │
                                   └───────────┬──────────────┘
                                               │
                     diagnóstico em background ┤──── apresentação sob demanda
                     (após /quiz/finish)       │     (clique do admin)
                                               ▼
                                   ┌────────────────────────┐
                                   │ services/diagnostico-pdf  │
                                   │ FastAPI + Chromium (Python)│
                                   │ POST /laudo, /apresentacao │
                                   └───────────┬──────────────┘
                                               │ sobe o PDF
                                               ▼
                                   ┌────────────────────────┐
                                   │           S3               │
                                   └────────────────────────┘
```

Dois containers na AWS (mesmo modelo do quiz OAB — ver [`docs/DEPLOY.md`](docs/DEPLOY.md)):
- **App Next.js** (`Dockerfile` na raiz, `output: 'standalone'`) — quiz público + painel `/admin`.
  Precisa ser container de longa duração: o PDF é disparado com `after()`.
- **`services/diagnostico-pdf`** — container à parte (Playwright precisa de Chromium instalado
  no sistema), só na rede interna.

## Estrutura de pastas

```
app/
  page.tsx                    — página pública do quiz (renderiza <Quiz />)
  api/quiz/                   — start, answer, perfil, finish, result, whatsapp
  api/leads/desqualificado/   — captura de lead fora do público-alvo
  api/laudo/[token]/          — link estável do diagnóstico (redirect pro S3), usado no CRM
  api/apresentacao/[token]/   — (mesma família de rota, ver abaixo)
  api/admin/                  — login/logout, export CSV, geração de PDF sob demanda
  admin/                      — painel administrativo (login, leads, analytics)
components/
  Quiz.tsx                    — máquina de estados do funil inteiro (todas as telas)
  admin/                      — gráficos e tabelas do painel
lib/
  quizContent.ts              — conteúdo do funil (perguntas de perfil, editais, textos)
  questions.ts                — as 4 questões graduadas (deriva de quizContent.ts)
  scoring.ts / perfil.ts / blocos.ts / normalize.ts / validacao.ts / mascara.ts
  server/                     — tudo que roda só no servidor (ver abaixo)
services/diagnostico-pdf/     — serviço Python de geração de PDF (deploy próprio)
reference/raio-x-da-base/     — pacote de referência de conteúdo/estrutura do diagnóstico (não editar)
supabase/migrations/          — schema do banco, em ordem cronológica
```

`lib/server/` é o núcleo do backend:

| Arquivo | Responsabilidade |
|---|---|
| `quizService.ts` | Regras do funil: iniciar/retomar sessão, registrar respostas/perfil, concluir, buscar resultado |
| `sessionRepo.ts` / `supabaseSessionRepo.ts` | Interface de persistência + implementação Supabase de `quiz_cj_sessions` |
| `leadsDesqualificados.ts` / `*Repo.ts` | Mesma ideia, pra `quiz_cj_leads_desqualificados` |
| `diagnosticoService.ts` | Cliente HTTP do serviço Python (`/laudo` e `/apresentacao`) |
| `diagnosticoPdfBackground.ts` | Orquestra a geração do diagnóstico em background após `/quiz/finish` |
| `s3.ts` | URL assinada do diagnóstico no S3 |
| `adminAuth.ts` | Login por senha única + cookie assinado (HMAC) |
| `rateLimit.ts` | Rate limit em memória (por IP, por rota) |
| `csv.ts` / `listarTudo.ts` | Exportação CSV do painel admin (com paginação) |

## O funil, passo a passo

1. **Capa / nome** (`components/Quiz.tsx`) — a pessoa informa nome (a
   versão principal do quiz só pede o nome nessa tela; e-mail/whatsapp vêm
   depois, na tela `contato`).
2. **`POST /api/quiz/start`** — cria (ou retoma) uma `quiz_session`.
   - Retomada é por e-mail **ou** whatsapp normalizado, não por
     `session_token` — a mesma pessoa reabrindo o quiz noutro aparelho cai
     na mesma sessão.
   - Uma sessão **já concluída nunca é resetada** — retomar só atualiza
     `session_token`/contato, preserva respostas e resultado.
3. **Vídeo** — tela `video`, autoplay mudo (Panda Video, `CONFIG.videoSrc`
   em `lib/quizContent.ts`).
4. **Teste graduado** (tela `quiz`, 4 questões reais de concurso, gabarito
   oficial FGV/FCC) — cada resposta:
   - **`POST /api/quiz/answer`** (fluxo `padrao`, uma chamada por questão), ou
   - fica em memória e vai tudo junto no fluxo `final` (ver item 6).
5. **Correção** (tela `correcao`) + **Perfilamento** (tela `perfil`, ~13
   perguntas: alvo, cargo, formação, tempo de estudo, provas feitas,
   método, edital de interesse, dor, momento, dinheiro, leitura...).
   - Quem não se qualifica (carreira jurídica, cargo abaixo do alvo) cai em
     `desqualificado` → `desqualificado_contato` → **`POST
     /api/leads/desqualificado`** (tabela separada, não polui as métricas
     do funil principal).
   - Fluxo `padrao`: cada resposta de perfil vai por **`POST
     /api/quiz/perfil`** (merge, não substitui).
6. **Contato + conclusão**
   - Fluxo `padrao`: contato já foi capturado em `start`; a tela final só
     chama **`POST /api/quiz/finish`**.
   - Fluxo `final`: a pessoa respondeu tudo em memória; no clique de
     contato, o app grava respostas + perfil em lote (uma leitura + uma
     escrita) e conclui — evita várias idas ao banco na tela final.
   - `finish` calcula score/áreas (`lib/scoring.ts`), perfil calculado
     (`lib/perfil.ts`) e os blocos de texto condicionais
     (`lib/blocos.ts`), marca `status = concluido` e **dispara em
     background** (via `after()` do Next.js, fire-and-forget) a geração do
     diagnóstico **e** da apresentação comercial em PDF, em paralelo — sem atrasar
     a resposta pra quem terminou.
7. **Resultado** (tela final) — busca via **`GET
   /api/quiz/result?session_token=`**: score geral, áreas fortes/fracas,
   blocos de conteúdo personalizados, CTA de WhatsApp.
   - Clique no CTA dispara **`POST /api/quiz/whatsapp`** (fire-and-forget,
     só grava o primeiro clique — sinal de intenção de compra pro painel).
8. **Diagnóstico em PDF (background)** — `lib/server/diagnosticoPdfBackground.ts`
   chama o serviço Python (`POST /laudo`), que renderiza com Chromium
   headless e sobe pro S3; a chave do objeto S3 fica salva em
   `quiz_cj_sessions.laudo_pdf_s3_key` (erro, se houver, em
   `laudo_pdf_erro` — nunca propaga pro usuário).
9. **Link estável pro CRM** — **`GET /api/laudo/[laudoToken]`**: gera uma
   URL assinada do S3 (5 min) a cada acesso e redireciona (302). O
   `laudoToken` é fixo desde a criação da sessão (ao contrário do
   `session_token`, que muda a cada retomada) — por isso é ele, não o
   `session_token`, que vai pro CRM.
10. **Apresentação comercial (sob demanda)** — no painel admin, o botão
    "Baixar apresentação comercial" chama **`GET
    /api/admin/leads/[token]/apresentacao`**: mesmo serviço Python, mesmo
    payload de perfil, endpoint `/apresentacao` (deck de 22 telas pra call
    1:1, template HTML diferente do diagnóstico). Não roda em background, não
    tem link público — o PDF volta direto na resposta pro admin.

## Banco de dados

Duas tabelas em Supabase/Postgres, sem policy pública de RLS — só a
`service_role` (usada nas Route Handlers) acessa. Schema evolui por
migrations em `supabase/migrations/` (ordem cronológica no nome do
arquivo):

**`quiz_cj_sessions`** — uma linha por pessoa/sessão de quiz.
- Identidade: `session_token` (uuid, reescrito a cada retomada),
  `laudo_token` (uuid, fixo — usado no link do CRM), `evento`, `fluxo`
  (`padrao`/`final`, só informativo).
- Contato: `nome`, `whatsapp[_normalizado]`, `email[_normalizado]` (unique
  por `evento` + `email_normalizado`).
- Progresso/resultado: `status`, `respostas` (jsonb), `areas` (jsonb),
  `score_geral_pct`, `acertos`, `total`, `area_prioritaria`, `perfil`
  (jsonb), `blocos` (jsonb).
- Sinal comercial: `whatsapp_clicado_em`.
- Materiais gerados: `laudo_pdf_s3_key`/`laudo_pdf_erro`,
  `apresentacao_pdf_s3_key`/`apresentacao_pdf_erro` — **colunas na mesma
  tabela**, não tabelas separadas; os dois materiais pertencem 1:1 à mesma
  sessão. Os dois são gerados automaticamente em background na conclusão do
  quiz e reaproveitam o mesmo `laudo_token` pro link estável de cada um.
- `started_at`, `updated_at` (trigger automático), `completed_at`.

**`quiz_cj_leads_desqualificados`** — captura de contato de quem não é público-alvo
do Tribunais (interesse em carreira jurídica, cargo abaixo do alvo). Tabela
independente, sem dedupe, sem update — captura de uma vez só, pra não
contaminar as métricas do funil principal.

## Perguntas frequentes

**Criou uma tabela nova pros 2 materiais (diagnóstico e apresentação)?**
Não. Os dois vivem como colunas na mesma tabela `quiz_cj_sessions`:
`laudo_pdf_s3_key`/`laudo_pdf_erro` (já existiam) e
`apresentacao_pdf_s3_key`/`apresentacao_pdf_erro` (novas, adicionadas no
mesmo padrão — ver `supabase/migrations/20261111120000_quiz_cj_tabelas.sql`).

**É relacionada com a outra?**
Mais que relacionada — é a **mesma linha**. Não existe chave estrangeira nem
tabela separada, porque os dois materiais pertencem 1:1 à mesma sessão de
quiz (ver seção "Banco de dados" acima).

**Em quanto tempo ele gera os materiais?**
Os dois, em segundo plano, assim que o quiz termina (`POST
/api/quiz/finish`) — a pessoa não espera nada, e as duas chamadas ao serviço
Python rodam em paralelo (`Promise.all`, ver
`lib/server/diagnosticoPdfBackground.ts`), não uma depois da outra. Cada uma tem
um teto de segurança de 55s (`AbortSignal.timeout`, ver
`lib/server/diagnosticoService.ts`); na prática sai bem mais rápido, é um PDF só.
Se por algum motivo a geração em background falhar ou ainda estiver rodando
quando alguém acessar o link antes da hora: `/api/laudo/[token]` devolve
425 (tenta de novo em instantes) até a chave existir, e
`/api/apresentacao/[token]` se vira sozinho, gerando na hora como rede de
segurança. Em qualquer um dos dois casos, o admin também pode forçar a
regeração a qualquer momento pelo painel.

## API

Convenção: fronteira JSON em `snake_case`; internamente o código é
`camelCase`. Toda rota roda em `runtime = 'nodejs'` (não Edge — algumas
dependem de `node:crypto`). Rotas de escrita passam por rate limit em
memória (`lib/server/rateLimit.ts`), por IP.

### Público (quiz)

| Rota | Método | Descrição |
|---|---|---|
| `/api/quiz/start` | POST | Cria/retoma sessão |
| `/api/quiz/answer` | POST | Registra 1 resposta do teste graduado |
| `/api/quiz/perfil` | POST | Registra 1 campo de perfilamento |
| `/api/quiz/finish` | POST | Conclui a sessão, calcula resultado, dispara diagnóstico + apresentação em background (em paralelo) |
| `/api/quiz/result` | GET | Busca resultado de uma sessão concluída |
| `/api/quiz/whatsapp` | POST | Registra clique no CTA de WhatsApp (fire-and-forget) |
| `/api/leads/desqualificado` | POST | Captura contato de lead fora do público-alvo |
| `/api/laudo/[laudoToken]` | GET | Redireciona pra URL assinada do diagnóstico no S3 (link estável, usado no CRM) |
| `/api/apresentacao/[laudoToken]` | GET | Mesma ideia, pra apresentação comercial — gera na hora como fallback se a chave ainda não existir |

### Admin (protegidas por `middleware.ts`, cookie de sessão)

| Rota | Método | Descrição |
|---|---|---|
| `/api/admin/login` | POST | Autentica com `ADMIN_PASSWORD`, emite cookie assinado |
| `/api/admin/logout` | POST | Derruba o cookie |
| `/api/admin/export` | GET | Exporta leads em CSV (filtros de status/fluxo/busca) |
| `/api/admin/leads/[token]/pdf` | GET | Gera (ou regenera) o diagnóstico sob demanda e devolve o PDF direto |
| `/api/admin/leads/[token]/apresentacao` | GET | Gera a apresentação comercial sob demanda e devolve o PDF direto |

### Painel `/admin` (páginas)

`app/admin/(painel)/` — `layout.tsx` (nav), `leads/page.tsx` (lista +
filtros + export), `leads/[token]/page.tsx` (detalhe de um lead, botões de
baixar diagnóstico/apresentação), `analytics/page.tsx` (funil, gráficos —
`components/admin/*`). Login em `app/admin/login/page.tsx`.

## Serviço de PDF (`services/diagnostico-pdf`)

FastAPI fino em volta de `reference/raio-x-da-base/diagnosis` (pacote de
referência de conteúdo/estrutura, mantido intocado — overrides de marca em
`brand.py`). Autenticado por segredo compartilhado (header
`X-Laudo-Secret`, falha fechada sem ele configurado).

- `POST /laudo` — recebe perfil + respostas + editais, devolve o PDF do
  diagnóstico. Sobe pro S3 se `session_token` vier no
  payload; devolve a chave no header `X-Laudo-S3-Key`.
- `POST /apresentacao` — mesmo payload, template diferente (deck de 22
  telas pra call 1:1, `vendor/vde-tribunais-call/deck.html`); chave no
  header `X-Apresentacao-S3-Key`.
- Renderização com Chromium headless via Playwright (`render.py`).
- `s3.py` — sobe o objeto; ausência de `S3_BUCKET` configurado não é erro,
  é "recurso ainda não ligado" (o lado Next.js trata isso como "sem link
  ainda", não como falha).

Deploy: container Docker próprio (`Dockerfile`, Python 3.12 slim-bookworm — não "slim" puro,
ver comentário no arquivo). S3 via IAM role (sem chave) na AWS.

## Variáveis de ambiente

Tabela de produção em [`docs/DEPLOY.md`](docs/DEPLOY.md#4-variáveis-de-ambiente-produção); valores
de desenvolvimento em [`.env.example`](.env.example). Em resumo:

| Variável | Onde | Descrição |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Next.js | Conexão com o Postgres (só service role) |
| `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | Next.js | Senha do `/admin` e segredo do cookie (HMAC) |
| `LAUDO_SERVICE_URL`, `LAUDO_SERVICE_SECRET` | Next.js (+ segredo no serviço) | Chamada ao `services/diagnostico-pdf` |
| `BUCKET_NAME`, `REGION` | Next.js **e** serviço | Bucket do S3 |
| `ACCESS_KEY`, `SECRET_KEY`, `S3_ENDPOINT`, `S3_PUBLIC_ENDPOINT` | Next.js **e** serviço | **Só local (MinIO).** Na AWS ficam vazias: o SDK usa a IAM role |
| `PREVIA_MEMORIA` | Next.js | `1` = banco em memória pra prévia sem Supabase. **Nunca em produção** |

## Rodando localmente

```bash
npm install
cp .env.example .env.local
npx supabase start                    # Supabase local (portas 655xx); copie a service_role pro .env.local
docker compose -p quiz-cj --env-file .env.local up -d --build   # MinIO + bucket + serviço de PDF
npm run dev                           # http://localhost:3000
```

O PDF gerado fica no MinIO (console em http://localhost:9101, usuário/senha `minioadmin`).

## Testes

```bash
npm test   # vitest run — cobre lib/, lib/server/ e componentes
```
Convenção do projeto: teste automatizado é reservado pra lógica de negócio
(scoring, normalização, validação, serviços de servidor); mudanças
puramente visuais/UX são validadas manualmente no navegador.
