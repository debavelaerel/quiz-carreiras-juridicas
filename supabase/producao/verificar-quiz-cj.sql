-- Verificação do quiz CJ no banco (somente leitura). Todas as linhas: ok = true.

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
