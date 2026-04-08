-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================
-- TABLES
-- ============================================

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Mój dom',
  invite_code text unique not null default substr(md5(random()::text), 1, 6),
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid not null references households(id) on delete cascade,
  email text not null,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  barcode text,
  category text not null default 'inne',
  image_url text,
  expiry_date date not null,
  opened_at timestamptz,
  freshness_days integer not null default 3,
  quantity integer not null default 1,
  location text not null default 'lodówka',
  added_by uuid references profiles(id),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table shopping_list (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  quantity integer not null default 1,
  category text,
  checked boolean not null default false,
  source text not null default 'manual',
  added_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table shopping_templates (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table freshness_rules (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  category text not null,
  default_days integer not null,
  is_custom boolean not null default false,
  created_at timestamptz not null default now(),
  unique(household_id, category)
);

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  household_id uuid not null references households(id) on delete cascade,
  endpoint text not null,
  keys jsonb not null,
  created_at timestamptz not null default now()
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_products_household_status on products(household_id, status);
create index idx_products_expiry on products(expiry_date) where status = 'active';
create index idx_shopping_list_household on shopping_list(household_id);
create index idx_profiles_household on profiles(household_id);

-- ============================================
-- AUTO-UPDATE updated_at
-- ============================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on products
  for each row execute function update_updated_at();

create trigger shopping_list_updated_at
  before update on shopping_list
  for each row execute function update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table households enable row level security;
alter table profiles enable row level security;
alter table products enable row level security;
alter table shopping_list enable row level security;
alter table shopping_templates enable row level security;
alter table freshness_rules enable row level security;
alter table push_subscriptions enable row level security;

-- Helper function: get current user's household_id
create or replace function get_my_household_id()
returns uuid as $$
  select household_id from profiles where id = auth.uid();
$$ language sql security definer stable;

-- Households: users can read their own household
create policy "households_select" on households
  for select using (id = get_my_household_id());

-- Households: anyone authenticated can insert (for registration)
create policy "households_insert" on households
  for insert with check (true);

-- Profiles: users see profiles in their household
create policy "profiles_select" on profiles
  for select using (household_id = get_my_household_id());

create policy "profiles_insert" on profiles
  for insert with check (id = auth.uid());

-- Products: full CRUD within household
create policy "products_select" on products
  for select using (household_id = get_my_household_id());

create policy "products_insert" on products
  for insert with check (household_id = get_my_household_id());

create policy "products_update" on products
  for update using (household_id = get_my_household_id());

create policy "products_delete" on products
  for delete using (household_id = get_my_household_id());

-- Shopping list: full CRUD within household
create policy "shopping_select" on shopping_list
  for select using (household_id = get_my_household_id());

create policy "shopping_insert" on shopping_list
  for insert with check (household_id = get_my_household_id());

create policy "shopping_update" on shopping_list
  for update using (household_id = get_my_household_id());

create policy "shopping_delete" on shopping_list
  for delete using (household_id = get_my_household_id());

-- Shopping templates: full CRUD within household
create policy "templates_select" on shopping_templates
  for select using (household_id = get_my_household_id());

create policy "templates_insert" on shopping_templates
  for insert with check (household_id = get_my_household_id());

create policy "templates_update" on shopping_templates
  for update using (household_id = get_my_household_id());

create policy "templates_delete" on shopping_templates
  for delete using (household_id = get_my_household_id());

-- Freshness rules: read system (null household) + own household, write own
create policy "rules_select" on freshness_rules
  for select using (household_id is null or household_id = get_my_household_id());

create policy "rules_insert" on freshness_rules
  for insert with check (household_id = get_my_household_id());

create policy "rules_update" on freshness_rules
  for update using (household_id = get_my_household_id());

-- Push subscriptions: own only
create policy "push_select" on push_subscriptions
  for select using (profile_id = auth.uid());

create policy "push_insert" on push_subscriptions
  for insert with check (profile_id = auth.uid());

create policy "push_delete" on push_subscriptions
  for delete using (profile_id = auth.uid());

-- ============================================
-- ENABLE REALTIME
-- ============================================

alter publication supabase_realtime add table products;
alter publication supabase_realtime add table shopping_list;

-- ============================================
-- SEED: Default freshness rules (system-wide)
-- ============================================

insert into freshness_rules (household_id, category, default_days, is_custom) values
  (null, 'nabiał',       3, false),
  (null, 'ser twardy',   7, false),
  (null, 'ser miękki',   3, false),
  (null, 'wędlina',      2, false),
  (null, 'mięso surowe', 1, false),
  (null, 'sos w słoiku', 5, false),
  (null, 'dżem',        14, false),
  (null, 'sok',           3, false),
  (null, 'hummus',        3, false),
  (null, 'konserwy',      2, false),
  (null, 'inne',          3, false);
