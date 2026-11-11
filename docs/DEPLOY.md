# Guia de deploy (devops) — Quiz Carreiras Jurídicas

Checklist para colocar o **Diagnóstico da Base · Carreiras Jurídicas** no ar na AWS. Mesmo modelo
do quiz OAB: duas imagens Docker, Supabase na nuvem e S3 via IAM role.

## O que sobe

| Serviço | Imagem | Porta | Observação |
| --- | --- | --- | --- |
| **Quiz + admin** (Next.js) | `Dockerfile` na raiz | 3000 | container Node de **longa duração** (não serverless: o PDF é disparado com `after()` depois do `finish`) |
| **Serviço de PDF** (FastAPI + Chromium) | `services/diagnostico-pdf/Dockerfile` | `${PORT:-8000}` | só rede interna; o Next é o único cliente |
| **Banco** | Supabase (nuvem) — mesmo projeto do Tribunais/OAB | — | tabelas próprias `quiz_cj_sessions` e `quiz_cj_leads_desqualificados` |
| **Bucket S3** | — | — | privado, região `sa-east-1` (nome a definir; ex.: `vicio-quiz-cj-s3`) |

As duas imagens saem do mesmo commit e devem ser publicadas **juntas** (o texto dos diagnósticos
fica no Next e no serviço Python, gerado pelo mesmo script).

## 1. Banco (Supabase) — JÁ APLICADO em 11/11/2026

Mesmo projeto Supabase do Tribunais e da OAB, mas com **tabelas próprias**, no padrão da OAB
(`quiz_oab_*`): `quiz_cj_sessions` e `quiz_cj_leads_desqualificados`, mais a função
`quiz_cj_set_updated_at()`. Nada do Tribunais, da OAB ou das automações (`tribunais_*`, `dash_*`,
`clint_*`) foi alterado: só objetos novos foram criados (conferido por impressão digital do esquema
antes e depois).

- Arquivo: `supabase/migrations/20261111120000_quiz_cj_tabelas.sql`; aplicado com
  `supabase/producao/aplicar-quiz-cj.sql` (transação + verificação). Conferência a qualquer momento
  (só leitura): `supabase/producao/verificar-quiz-cj.sql`.
- **NUNCA** rodar `supabase link` / `db push` / `migration repair` / `db reset` deste repo contra a
  produção: as outras migrations da pasta são cópias das do Tribunais, só para o Supabase **local**.
- O app precisa só de `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (chave de servidor).
- Desfazer (só objetos do CJ): `drop table public.quiz_cj_sessions, public.quiz_cj_leads_desqualificados; drop function public.quiz_cj_set_updated_at();`

## 2. Bucket e permissões (IAM role, sem chave)

- Bucket privado em `sa-east-1`. Sem acesso público.
- **Não definir** `ACCESS_KEY`/`SECRET_KEY` em produção: o SDK usa a role da tarefa/pod.
- Role do **Next**: `s3:GetObject` no bucket (só assina URLs de download de 5 min).
- Role do **serviço de PDF**: `s3:PutObject` no bucket (chaves `laudos/<uuid>.pdf` e `apresentacoes/<uuid>.pdf`).
- `S3_ENDPOINT` e `S3_PUBLIC_ENDPOINT` ficam **vazios** (existem só para o MinIO local).

## 3. Build

```bash
docker build -t quiz-carreiras-juridicas .
docker build -t quiz-carreiras-juridicas-pdf services/diagnostico-pdf
```

Nenhuma variável é embutida no build: todas são lidas em runtime.

## 4. Variáveis de ambiente (produção)

**Next (quiz + admin)**

| Variável | Valor |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | do projeto Supabase compartilhado (o mesmo do Tribunais) |
| `ADMIN_PASSWORD` | senha longa e aleatória do `/admin` (pode ser diferente da do Tribunais) |
| `ADMIN_SESSION_SECRET` | `openssl rand -base64 48` — **nunca** reaproveitar o do Tribunais |
| `LAUDO_SERVICE_URL` | URL **interna** do serviço de PDF (ex.: `http://diagnostico-pdf:8000`) |
| `LAUDO_SERVICE_SECRET` | segredo forte (`openssl rand -hex 32`), **igual** nos dois serviços |
| `BUCKET_NAME` / `REGION` | nome do bucket / `sa-east-1` — **as duas são obrigatórias** para o link do PDF funcionar |

**Serviço de PDF**: `LAUDO_SERVICE_SECRET`, `BUCKET_NAME`, `REGION` (e `PORT`, se quiser outra porta).

**Nunca definir em produção:**
- `PREVIA_MEMORIA` — liga um banco em memória só para prévia; em produção os leads seriam perdidos.
- `ACCESS_KEY`, `SECRET_KEY`, `S3_ENDPOINT`, `S3_PUBLIC_ENDPOINT`.

## 5. Verificação depois do deploy

1. `GET <serviço-pdf>/health` → `200`. Logo depois de subir, o Chromium pode levar alguns
   segundos; configure o health check do ALB/ECS com tolerância (período inicial de ~30 s e 3
   falhas seguidas) para não reiniciar a tarefa em loop.
2. Abra o quiz e responda até o fim com o nome **"TESTE"**.
3. Em `/admin`, o lead "TESTE" aparece com o diagnóstico pronto; o botão de baixar o PDF funciona
   (e o da apresentação comercial também).
4. Apague o lead de teste:
   `delete from quiz_cj_sessions where nome = 'TESTE';`

Se o diagnóstico ficar com erro: veja os logs do serviço de PDF (segredo diferente nos dois lados
ou falta de permissão no bucket). A coluna `laudo_pdf_erro` da sessão guarda a última falha.

## 6. Pontos de atenção

- **Rate limit** do login do admin é em memória, por instância.
- **Link do diagnóstico** (`/api/laudo/<laudo_token>`) é público e sem validade (tem dados
  pessoais); a URL assinada do S3 expira em 5 min.
- **Imagem Python** roda como root; endurecer depois.
