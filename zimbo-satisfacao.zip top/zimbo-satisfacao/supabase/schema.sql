-- Execute este script no SQL Editor do seu projeto Supabase
-- (Supabase → SQL Editor → New query → cole e clique em RUN)

create table if not exists public.respostas (
  id uuid primary key default gen_random_uuid(),
  loja text not null,
  geral smallint not null check (geral between 1 and 5),
  atendimento smallint not null check (atendimento between 1 and 5),
  limpeza smallint not null check (limpeza between 1 and 5),
  variedade smallint not null check (variedade between 1 and 5),
  preco smallint not null check (preco between 1 and 5),
  agilidade smallint not null check (agilidade between 1 and 5),
  nps text not null check (nps in ('sim', 'talvez', 'nao')),
  caixa text,
  operador text,
  comentario text,
  nome text,
  contato text,
  criado_em timestamptz not null default now()
);

-- Habilita Row Level Security
alter table public.respostas enable row level security;

-- Qualquer pessoa (cliente respondendo a pesquisa) pode INSERIR uma resposta
create policy "Qualquer um pode enviar avaliação"
  on public.respostas for insert
  to anon
  with check (true);

-- Só usuários logados (equipe, via Supabase Auth) podem LER as respostas.
-- Isso impede que qualquer pessoa com a chave anônima (pública, visível
-- no código do site) consiga baixar todas as avaliações direto pela API,
-- sem passar pelo login do painel.
create policy "Leitura restrita a usuários logados"
  on public.respostas for select
  to authenticated
  using (true);

-- Índice para consultas por loja e data
create index if not exists respostas_loja_idx on public.respostas (loja);
create index if not exists respostas_criado_em_idx on public.respostas (criado_em desc);

-- Se você JÁ tinha criado a tabela antes (sem as colunas caixa/operador),
-- rode só este bloco abaixo para adicioná-las sem perder os dados existentes:
-- alter table public.respostas add column if not exists caixa text;
-- alter table public.respostas add column if not exists operador text;

-- Se você já tinha rodado este script ANTES da mudança de segurança acima
-- (ou seja, a leitura ainda está liberada para "anon"), rode só este bloco
-- para atualizar a política sem precisar recriar a tabela:
-- drop policy if exists "Leitura pública das avaliações" on public.respostas;
-- create policy "Leitura restrita a usuários logados"
--   on public.respostas for select
--   to authenticated
--   using (true);
--
-- IMPORTANTE: essa política exige que o Supabase Auth esteja configurado
-- (veja o README, seção "Como criar logins individuais para a equipe").
-- Sem isso, ninguém — nem o próprio painel — vai conseguir ler as respostas.
