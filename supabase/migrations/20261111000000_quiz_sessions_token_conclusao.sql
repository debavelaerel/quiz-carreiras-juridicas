-- Prova exigida pelo botão "Refazer o quiz" (ver iniciarSessao em
-- lib/server/quizService.ts): o session_token vigente quando a sessão foi
-- concluída. Nunca é alterado pela retomada por contato nem devolvido pelo
-- /start. Linhas antigas ficam null: para elas o refazer não zera nada.
alter table quiz_sessions add column if not exists token_conclusao text;
