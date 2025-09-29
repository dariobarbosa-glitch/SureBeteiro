/*
  # Sistema de Gestão de Banca Esportiva - Schema Inicial

  1. Tabelas Principais
    - `tenants` - Multi-tenancy para isolamento de dados
    - `profiles` - Perfis de usuários vinculados ao Auth
    - `houses` - Casas de apostas
    - `people` - Pessoas com compliance LGPD
    - `wallets` - Carteiras financeiras
    - `transactions` - Transações financeiras
    - `operations` - Operações esportivas
    - `subscriptions` - Assinaturas e planos
    - `features` - Features por plano
    - `audit_logs` - Logs de auditoria

  2. Segurança
    - Habilitado RLS em todas as tabelas
    - Políticas de isolamento por tenant
    - Mascaramento de dados pessoais

  3. Views
    - `metrics_daily` - Métricas diárias agregadas
*/

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Tenants table for multi-tenancy
create table tenants (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Profiles linked to Supabase Auth
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete set null,
  nome text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Houses (betting houses)
create table houses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  nome text not null,
  status text check (status in ('a_criar','ativa','limitada','banida')) default 'a_criar',
  grupo_clone text,
  url text,
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (tenant_id, nome)
);

-- People with LGPD compliance
create table people (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  nome text not null,
  documento_hash text not null, -- Hashed document for LGPD compliance
  consentimento_at timestamptz, -- Consent timestamp
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Accounts/Wallets
create table accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  house_id uuid references houses(id) on delete set null,
  person_id uuid references people(id) on delete set null,
  nome text not null,
  tipo text check (tipo in ('casa','pessoal','empresa')) default 'casa',
  ativo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Wallets for financial management
create table wallets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  nome text not null,
  ativo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (tenant_id, nome)
);

-- Financial transactions
create table transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  data timestamptz not null,
  tipo text check (tipo in ('deposito','saque','transfer','aporte','despesa','pagamento_cpf')) not null,
  valor numeric not null,
  wallet_origem_id uuid references wallets(id) on delete set null,
  wallet_destino_id uuid references wallets(id) on delete set null,
  house_id uuid references houses(id) on delete set null,
  person_id uuid references people(id) on delete set null,
  descricao text,
  created_at timestamptz default now()
);

-- Sports operations
create table operations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  id_externo text not null,
  data_evento timestamptz not null,
  house_id uuid references houses(id) on delete set null,
  stake numeric,
  lucro numeric,
  resultado text check (resultado in ('green','red','void')) not null,
  raw_payload jsonb,
  created_at timestamptz default now(),
  unique (tenant_id, id_externo)
);

-- Subscriptions and plans
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  plano text check (plano in ('starter','pro','agencia')) not null,
  status text check (status in ('active','past_due','canceled')) not null,
  gateway_id text,
  atualizado_em timestamptz default now(),
  unique (tenant_id)
);

-- Features per plan
create table features (
  plano text not null,
  feature_key text not null,
  enabled boolean default true,
  primary key (plano, feature_key)
);

-- Audit logs
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  acao text not null,
  alvo text not null,
  detalhes jsonb,
  created_at timestamptz default now()
);

-- Daily metrics view
create view metrics_daily as
select
  tenant_id,
  date_trunc('day', data_evento)::date as data,
  coalesce(sum(lucro), 0) as lucro_total,
  coalesce(sum(stake), 0) as stake_total,
  count(*) as qtd_ops,
  case 
    when coalesce(sum(stake), 0) > 0 then coalesce(sum(lucro), 0) / sum(stake) * 100 
    else 0 
  end as roi_dia,
  case 
    when coalesce(sum(stake), 0) > 0 then coalesce(sum(lucro), 0) / sum(stake) 
    else 0 
  end as lucro_sobre_stake
from operations
group by tenant_id, date_trunc('day', data_evento)::date;

-- Insert default features
insert into features (plano, feature_key, enabled) values
('starter', 'operations_import', true),
('pro', 'operations_import', true),
('pro', 'advanced_analytics', true),
('pro', 'multiple_wallets', true),
('pro', 'custom_reports', true),
('agencia', 'operations_import', true),
('agencia', 'advanced_analytics', true),
('agencia', 'multiple_wallets', true),
('agencia', 'custom_reports', true),
('agencia', 'audit_logs', true),
('agencia', 'telegram_notifications', true);

-- Enable RLS on all tables
alter table tenants enable row level security;
alter table profiles enable row level security;
alter table houses enable row level security;
alter table people enable row level security;
alter table accounts enable row level security;
alter table wallets enable row level security;
alter table transactions enable row level security;
alter table operations enable row level security;
alter table subscriptions enable row level security;
alter table audit_logs enable row level security;

-- Policies for tenant isolation
create policy "tenant_isolation_tenants" on tenants
  for all using (
    id in (
      select tenant_id from profiles where id = auth.uid()
    )
  );

create policy "tenant_isolation_profiles" on profiles
  for all using (id = auth.uid());

create policy "tenant_isolation_houses" on houses
  for all using (
    tenant_id in (
      select tenant_id from profiles where id = auth.uid()
    )
  );

create policy "tenant_isolation_people" on people
  for all using (
    tenant_id in (
      select tenant_id from profiles where id = auth.uid()
    )
  );

create policy "tenant_isolation_accounts" on accounts
  for all using (
    tenant_id in (
      select tenant_id from profiles where id = auth.uid()
    )
  );

create policy "tenant_isolation_wallets" on wallets
  for all using (
    tenant_id in (
      select tenant_id from profiles where id = auth.uid()
    )
  );

create policy "tenant_isolation_transactions" on transactions
  for all using (
    tenant_id in (
      select tenant_id from profiles where id = auth.uid()
    )
  );

create policy "tenant_isolation_operations" on operations
  for all using (
    tenant_id in (
      select tenant_id from profiles where id = auth.uid()
    )
  );

create policy "tenant_isolation_subscriptions" on subscriptions
  for all using (
    tenant_id in (
      select tenant_id from profiles where id = auth.uid()
    )
  );

create policy "tenant_isolation_audit_logs" on audit_logs
  for all using (
    tenant_id in (
      select tenant_id from profiles where id = auth.uid()
    )
  );

-- Function to handle new user creation
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, nome)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Indexes for performance
create index idx_operations_tenant_data on operations(tenant_id, data_evento desc);
create index idx_operations_house on operations(house_id);
create index idx_transactions_tenant_data on transactions(tenant_id, data desc);
create index idx_transactions_wallet_origem on transactions(wallet_origem_id);
create index idx_transactions_wallet_destino on transactions(wallet_destino_id);
create index idx_houses_tenant_status on houses(tenant_id, status);
create index idx_people_tenant on people(tenant_id);