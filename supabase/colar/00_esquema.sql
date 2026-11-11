-- Eric Águas — esquema do banco (Supabase / Postgres)
-- Segurança: RLS ligada em TODAS as tabelas; só usuários listados em `equipe` leem/escrevem.

create table if not exists public.equipe (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  papel text not null default 'operador' check (papel in ('admin','operador','leitura')),
  criado_em timestamptz not null default now()
);

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.equipe where user_id = auth.uid());
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.equipe where user_id = auth.uid() and papel = 'admin');
$$;

create table if not exists public.produtos (
  id bigint generated always as identity primary key,
  codigo_versao text,
  cod_produto text not null,
  descricao text not null,
  preco_compra numeric(10,2),
  preco_venda numeric(10,2),
  inicio_vigencia date,
  fim_vigencia date
);

create table if not exists public.clientes (
  id bigint generated always as identity primary key,
  cod_cliente bigint,
  nome text not null,
  data_cadastro date,
  residencia text,
  endereco_completo text,
  whatsapp boolean,
  telefone text,
  forma_pagamento text,
  banco text,
  desconto boolean,
  status text,
  cod_produto text,
  produto text,
  observacoes text
);

create table if not exists public.vendas (
  id bigint generated always as identity primary key,
  pedido integer unique,
  data date not null,
  entregador text,
  telefone text,
  cliente_nome text,
  cod_produto text,
  produto text,
  qtde numeric(10,2) not null default 1,
  valor_custo numeric(10,2),
  valor_venda numeric(10,2),
  valor numeric(10,2) not null,
  desconto boolean default false,
  forma_pagamento text,
  instituicao text,
  saldo_devedor numeric(10,2) default 0,
  garrafao_emprestado integer default 0,
  data_pagamento date
);
create index if not exists vendas_data_idx on public.vendas (data);
create index if not exists vendas_cliente_idx on public.vendas (cliente_nome);

create table if not exists public.estoque_mov (
  id bigint generated always as identity primary key,
  data date not null,
  cod_produto text,
  produto text,
  quantidade integer not null,
  valor_custo numeric(10,2),
  valor_total numeric(10,2)
);

create table if not exists public.gastos (
  id bigint generated always as identity primary key,
  data date not null,
  categoria text not null,
  produto text,
  quantidade numeric(10,2) default 1,
  valor_custo numeric(10,2),
  valor_total numeric(10,2) not null
);
create index if not exists gastos_data_idx on public.gastos (data);

create table if not exists public.cobrancas (
  id bigint generated always as identity primary key,
  data date,
  cliente text,
  descricao text,
  qtde numeric(10,2),
  valor numeric(10,2),
  pago boolean not null default false
);

-- RLS
do $$
declare t text;
begin
  foreach t in array array['produtos','clientes','vendas','estoque_mov','gastos','cobrancas'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists staff_select on public.%I', t);
    execute format('drop policy if exists staff_write on public.%I', t);
    execute format('create policy staff_select on public.%I for select to authenticated using (public.is_staff())', t);
    execute format($p$create policy staff_write on public.%I for all to authenticated
      using (public.is_staff() and not exists (select 1 from public.equipe where user_id = auth.uid() and papel = 'leitura'))
      with check (public.is_staff() and not exists (select 1 from public.equipe where user_id = auth.uid() and papel = 'leitura'))$p$, t);
  end loop;
end $$;

alter table public.equipe enable row level security;
drop policy if exists equipe_self on public.equipe;
drop policy if exists equipe_admin on public.equipe;
create policy equipe_self on public.equipe for select to authenticated using (user_id = auth.uid());
create policy equipe_admin on public.equipe for all to authenticated using (public.is_admin()) with check (public.is_admin());

revoke all on all tables in schema public from anon;
revoke execute on function public.is_staff(), public.is_admin() from anon;

-- Permissões para usuários logados (projetos novos não concedem acesso automático)
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.is_staff(), public.is_admin() to authenticated;
revoke execute on function public.is_staff(), public.is_admin() from public, anon;
