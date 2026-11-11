-- Aplicação do quiz CJ no Supabase de PRODUÇÃO (compartilhado com Tribunais/OAB).
-- Cole o arquivo INTEIRO no SQL Editor. Só cria objetos novos quiz_cj_*.
--
-- 1º ENSAIO: rode como está (termina em ROLLBACK: nada fica gravado). Confira que
--    toda linha da verificação deu ok = true.
-- 2º DE VERDADE: troque o ROLLBACK do fim por COMMIT e rode de novo.
-- Depois: rode supabase/producao/verificar-quiz-cj.sql (deve dar tudo ok).
-- Desfazer: drop table public.quiz_cj_sessions, public.quiz_cj_leads_desqualificados;
--           drop function public.quiz_cj_set_updated_at();

begin;
set local lock_timeout = '3s';

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
-- repair`/`db reset` deste repo contra a produção: as 9 migrations do Tribunais
-- nesta pasta são só pro Supabase LOCAL.
--
-- Esquema = estado final de quiz_sessions/leads_desqualificados após as 9
-- migrations do Tribunais (ver migrations 20260904000001..20260929000000).
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

-- ===== Verificação (somente leitura). Todas as linhas devem ter ok = true. =====
select 'tabelas existem' v, to_regclass('public.quiz_cj_sessions') is not null and to_regclass('public.quiz_cj_leads_desqualificados') is not null ok
union all select 'RLS ligado nas 2', (select bool_and(relrowsecurity) from pg_class where oid in ('public.quiz_cj_sessions'::regclass,'public.quiz_cj_leads_desqualificados'::regclass))
union all select 'nenhuma policy', (select count(*)=0 from pg_policies where schemaname='public' and tablename like 'quiz_cj_%')
union all select 'service_role com 4 privilegios nas 2', (select bool_and(has_table_privilege('service_role', t, p)) from unnest(array['public.quiz_cj_sessions','public.quiz_cj_leads_desqualificados']) t, unnest(array['SELECT','INSERT','UPDATE','DELETE']) p)
union all select 'anon/authenticated sem privilegio', (select not bool_or(has_table_privilege(r, t, p)) from unnest(array['anon','authenticated']) r, unnest(array['public.quiz_cj_sessions','public.quiz_cj_leads_desqualificados']) t, unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE']) p)
union all select 'colunas = quiz_sessions (so default de evento difere)', (select count(*)=1 from (
   select column_name from (select column_name, ordinal_position, data_type, is_nullable, column_default from information_schema.columns where table_schema='public' and table_name='quiz_sessions'
   except select column_name, ordinal_position, data_type, is_nullable, column_default from information_schema.columns where table_schema='public' and table_name='quiz_cj_sessions') d1
   union select column_name from (select column_name, ordinal_position, data_type, is_nullable, column_default from information_schema.columns where table_schema='public' and table_name='quiz_cj_sessions'
   except select column_name, ordinal_position, data_type, is_nullable, column_default from information_schema.columns where table_schema='public' and table_name='quiz_sessions') d2) d)
union all select 'colunas = leads_desqualificados (idem)', (select count(*)=1 from (
   select column_name, ordinal_position, data_type, is_nullable, column_default from information_schema.columns where table_schema='public' and table_name='leads_desqualificados'
   except select column_name, ordinal_position, data_type, is_nullable, column_default from information_schema.columns where table_schema='public' and table_name='quiz_cj_leads_desqualificados') d)
union all select '6 indices em sessions, 2 em leads', (select count(*) filter (where tablename='quiz_cj_sessions')=6 and count(*) filter (where tablename='quiz_cj_leads_desqualificados')=2 from pg_indexes where schemaname='public')
union all select 'checks: 2 em sessions, 4 em leads', (select count(*) filter (where conrelid='public.quiz_cj_sessions'::regclass)=2 and count(*) filter (where conrelid='public.quiz_cj_leads_desqualificados'::regclass)=4 from pg_constraint where contype='c')
union all select 'trigger updated_at presente', exists (select 1 from pg_trigger where tgrelid='public.quiz_cj_sessions'::regclass and tgname='trg_quiz_cj_sessions_updated_at' and not tgisinternal)
union all select 'funcao propria com search_path vazio', exists (select 1 from pg_proc where oid=to_regprocedure('public.quiz_cj_set_updated_at()') and 'search_path=""' = any(proconfig))
union all select 'fora do realtime', (select count(*)=0 from pg_publication_tables where tablename like 'quiz_cj_%')
union all select 'trigger do Tribunais intacto', exists (select 1 from pg_trigger where tgrelid='public.quiz_sessions'::regclass and tgname='trg_quiz_sessions_updated_at');

rollback;  -- ensaio. Para aplicar de verdade: troque por  commit;
