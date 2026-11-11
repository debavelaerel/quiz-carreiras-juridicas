-- Quiz Carreiras Jurídicas: tabelas PRÓPRIAS no projeto Supabase compartilhado
-- (Tribunais + OAB + automações tribunais_*/dash_*/clint_*). Mesmo padrão do
-- quiz OAB (prefixo quiz_oab_): só CRIA objetos novos com prefixo quiz_cj_.
-- Não altera, não remove e não escreve em nenhum objeto existente.
--
-- Por que tabelas próprias e não quiz_sessions com outro `evento`? As automações
-- do Tribunais filtram evento hoje, então não haveria vazamento — mas reaproveitar
-- deixaria o app CJ com caminho de escrita em linhas do Tribunais (busca por
-- session_token/laudo_token não filtra evento), misturaria dados e exigiria
-- `alter table` na tabela do Tribunais pra qualquer coluna nova do CJ.
--
-- APLICAR SÓ PELO SQL EDITOR, com supabase/producao/aplicar-quiz-cj.sql (begin +
-- verificação + rollback/commit). NUNCA `supabase link`/`db push`/`migration
-- repair`/`db reset` deste repo contra a produção (banco compartilhado).
--
-- Esquema = estado final de quiz_sessions/leads_desqualificados do Tribunais
-- (repo quiz-tribunais, migrations 20260904000001..20260929000000).
--
-- Reversão (só objetos deste arquivo):
--   drop table public.quiz_cj_sessions, public.quiz_cj_leads_desqualificados;
--   drop function public.quiz_cj_set_updated_at();

-- Sanidade: aborta (dentro do begin, nada fica) se algum nome já existir, em vez
-- de "if not exists" silencioso que mascararia um objeto diferente com o mesmo nome.
do $$
begin
  if to_regclass('public.quiz_cj_sessions') is not null
     or to_regclass('public.quiz_cj_leads_desqualificados') is not null
     or to_regprocedure('public.quiz_cj_set_updated_at()') is not null then
    raise exception 'quiz_cj_*: objeto já existe — abortando sem alterar nada';
  end if;
end $$;

create table public.quiz_cj_sessions (
  id                      bigint generated always as identity primary key,
  session_token           uuid not null unique,
  evento                  text not null default 'diagnostico-carreiras-juridicas',
  nome                    text not null,
  whatsapp                text not null,
  whatsapp_normalizado    text not null,
  email                   text not null,
  email_normalizado       text not null,
  status                  text not null default 'em_andamento'
                            check (status in ('em_andamento', 'concluido')),
  respostas               jsonb not null default '[]'::jsonb,
  areas                   jsonb not null default '{}'::jsonb,
  score_geral_pct         numeric(5,2),
  acertos                 int,
  total                   int,
  area_prioritaria        text,
  started_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  completed_at            timestamptz,
  perfil                  jsonb not null default '{}'::jsonb,
  perfil_calculado        jsonb,
  fluxo                   text not null default 'padrao' check (fluxo in ('padrao', 'final')),
  whatsapp_clicado_em     timestamptz,
  blocos                  jsonb,
  laudo_pdf_s3_key        text,
  laudo_pdf_erro          text,
  laudo_token             uuid not null default gen_random_uuid(),
  apresentacao_pdf_s3_key text,
  apresentacao_pdf_erro   text,
  utm_source              text,
  utm_medium              text,
  utm_campaign            text,
  utm_content             text,
  utm_term                text,

  constraint uq_quiz_cj_sessions_evento_email unique (evento, email_normalizado)
);

-- Nomes de índice são globais no schema: todos com prefixo quiz_cj_.
create index idx_quiz_cj_sessions_status_updated on public.quiz_cj_sessions (status, updated_at);
create index idx_quiz_cj_sessions_evento_whatsapp on public.quiz_cj_sessions (evento, whatsapp_normalizado);
create unique index uq_quiz_cj_sessions_laudo_token on public.quiz_cj_sessions (laudo_token);

-- Função PRÓPRIA (não reaproveita public.set_updated_at do Tribunais): sem
-- acoplamento — mudança ou drop na função do Tribunais não afeta o CJ. `create
-- function` sem `or replace` falha se o nome existir, em vez de sobrescrever.
create function public.quiz_cj_set_updated_at() returns trigger
  language plpgsql set search_path = '' as
$$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_quiz_cj_sessions_updated_at
  before update on public.quiz_cj_sessions
  for each row execute function public.quiz_cj_set_updated_at();

alter table public.quiz_cj_sessions enable row level security;
-- Nenhuma policy: só a service_role (Route Handlers do Next) acessa.

create table public.quiz_cj_leads_desqualificados (
  id                   bigint generated always as identity primary key,
  evento               text not null default 'diagnostico-carreiras-juridicas',
  fluxo                text not null check (fluxo in ('padrao', 'final')),
  motivo               text not null check (motivo in ('outro', 'juridica', 'cargo_baixo')),
  carreira_juridica    text check (carreira_juridica in ('juiz', 'promotor', 'defensor', 'procurador', 'outra')),
  nome                 text not null,
  whatsapp             text not null,
  whatsapp_normalizado text not null,
  email                text not null,
  email_normalizado    text not null,
  criado_em            timestamptz not null default now(),

  constraint chk_quiz_cj_carreira_juridica_so_com_motivo_juridica check (
    (motivo = 'juridica') = (carreira_juridica is not null)
  )
);

create index idx_quiz_cj_leads_desqualificados_evento_criado
  on public.quiz_cj_leads_desqualificados (evento, criado_em desc);

alter table public.quiz_cj_leads_desqualificados enable row level security;

-- Permissões explícitas (não depender do default do projeto): só o servidor
-- (service_role) lê/grava; anon/authenticated sem nenhum privilégio (o RLS não
-- cobre TRUNCATE). Só toca as tabelas novas.
grant select, insert, update, delete
  on public.quiz_cj_sessions, public.quiz_cj_leads_desqualificados to service_role;
revoke all
  on public.quiz_cj_sessions, public.quiz_cj_leads_desqualificados from anon, authenticated;
revoke all on function public.quiz_cj_set_updated_at() from public, anon, authenticated;

comment on table public.quiz_cj_sessions is
  'Quiz Carreiras Jurídicas (repo quiz-carreiras-juridicas). Separada de quiz_sessions (Tribunais) de propósito: não ligar a automações tribunais_*/dash_*.';
comment on table public.quiz_cj_leads_desqualificados is
  'Quiz Carreiras Jurídicas: contatos fora do público. Separada de leads_desqualificados (Tribunais).';
