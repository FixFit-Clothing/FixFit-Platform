-- FixFit initial application schema.
--
-- This migration is intentionally schema-only. The source catalog is verified
-- in the frontend, but its full 19-garment / 143-issue dataset belongs in a
-- separately reviewed seed migration before application writes are enabled.
-- Garment photos are client-side previews today and are deliberately not
-- represented here; storage is a later, separate design decision.

create extension if not exists pgcrypto;

-- These functions are intentionally security-invoker. Trusted order creation
-- will run on the server and must not expose a service-role credential to a
-- browser client.
create or replace function public.fixfit_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.fixfit_enforce_order_item_option_cardinality()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  option_count integer;
  multiple_options_allowed boolean;
begin
  select issues.allows_multiple_options
    into multiple_options_allowed
  from public.order_item_issues
  join public.issues on issues.id = order_item_issues.issue_id
  where order_item_issues.id = new.order_item_issue_id
    and order_item_issues.issue_id = new.issue_id;

  if multiple_options_allowed is null then
    raise exception 'Selected option must belong to the selected order item issue'
      using errcode = '23514';
  end if;

  if not multiple_options_allowed then
    select count(*)
      into option_count
    from public.order_item_options
    where order_item_issue_id = new.order_item_issue_id
      and id <> new.id;

    if option_count > 0 then
      raise exception 'This issue permits only one selected option'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.garment_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null unique check (length(trim(name)) > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.service_tiers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code in ('spot', 'quick', 'schedule')),
  name text not null unique check (name in ('SpotFix', 'QuickFix', 'ScheduleFix')),
  turnaround_label text not null check (length(trim(turnaround_label)) > 0),
  display_rank smallint not null unique check (display_rank between 1 and 3),
  starting_price integer not null check (starting_price >= 0),
  maximum_price integer not null check (maximum_price >= starting_price),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  garment_type_id uuid not null references public.garment_types (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  category text not null check (category in ('alteration', 'replacement', 'enhancement')),
  allows_multiple_options boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (garment_type_id, name, category),
  unique (id, garment_type_id)
);

create table if not exists public.issue_options (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  display_rank smallint not null default 0 check (display_rank >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (issue_id, name),
  unique (id, issue_id)
);

create table if not exists public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  rule_type text not null check (rule_type in ('booking_fee', 'rush_fee', 'starting_price')),
  label text not null check (length(trim(label)) > 0),
  amount integer not null check (amount >= 0),
  service_tier_id uuid references public.service_tiers (id) on delete restrict,
  applies_per_garment boolean not null default false,
  is_estimate boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  address_line1 text not null check (length(trim(address_line1)) > 0),
  landmark text,
  locality text not null default 'HSR Layout' check (length(trim(locality)) > 0),
  city text not null default 'Bengaluru' check (length(trim(city)) > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- A future trusted transaction must copy catalog snapshots, calculate the
-- order rush fee as the sum of qualifying item fees, and set final amounts.
-- Client roles intentionally have no write privilege on this table or its
-- child tables.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete restrict,
  address_id uuid not null references public.addresses (id) on delete restrict,
  shared_service_tier_id uuid references public.service_tiers (id) on delete restrict,
  shared_service_tier_code_snapshot text check (shared_service_tier_code_snapshot in ('spot', 'quick', 'schedule')),
  shared_service_tier_name_snapshot text check (shared_service_tier_name_snapshot in ('SpotFix', 'QuickFix', 'ScheduleFix')),
  shared_service_tier_turnaround_snapshot text check (shared_service_tier_turnaround_snapshot is null or length(trim(shared_service_tier_turnaround_snapshot)) > 0),
  status text not null default 'draft' check (status in ('draft', 'pending', 'confirmed', 'cancelled')),
  payment_method text check (payment_method in ('upi', 'card')),
  booking_fee_amount integer not null default 99 check (booking_fee_amount = 99),
  booking_fee_credit_amount integer not null default 0 check (booking_fee_credit_amount between 0 and 99),
  rush_fee_amount integer not null default 0 check (rush_fee_amount >= 0 and rush_fee_amount % 99 = 0),
  estimated_work_amount integer check (estimated_work_amount >= 0),
  final_work_amount integer check (final_work_amount >= 0),
  final_payable_amount integer check (final_payable_amount >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    (shared_service_tier_id is null
      and shared_service_tier_code_snapshot is null
      and shared_service_tier_name_snapshot is null
      and shared_service_tier_turnaround_snapshot is null)
    or (shared_service_tier_id is not null
      and shared_service_tier_code_snapshot is not null
      and shared_service_tier_name_snapshot is not null
      and shared_service_tier_turnaround_snapshot is not null)
  ),
  -- When a final price exists, the paid ₹99 visit fee is credited once.
  check (
    (final_work_amount is null
      and final_payable_amount is null
      and booking_fee_credit_amount = 0)
    or (final_work_amount is not null
      and final_payable_amount is not null
      and booking_fee_credit_amount = booking_fee_amount
      and final_payable_amount = final_work_amount + rush_fee_amount - booking_fee_credit_amount)
  )
);

-- One order item represents one garment, preserving the estimator's rush fee
-- rule: ₹99 per garment, not per issue.
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  garment_type_id uuid references public.garment_types (id) on delete restrict,
  custom_garment_name text,
  service_tier_id uuid not null references public.service_tiers (id) on delete restrict,
  garment_name_snapshot text not null check (length(trim(garment_name_snapshot)) > 0),
  service_tier_code_snapshot text not null check (service_tier_code_snapshot in ('spot', 'quick', 'schedule')),
  service_tier_name_snapshot text not null check (service_tier_name_snapshot in ('SpotFix', 'QuickFix', 'ScheduleFix')),
  service_tier_turnaround_snapshot text not null check (length(trim(service_tier_turnaround_snapshot)) > 0),
  is_rush boolean not null default false,
  rush_fee_amount integer not null default 0 check (rush_fee_amount in (0, 99)),
  estimate_from_amount integer check (estimate_from_amount >= 0),
  final_work_amount integer check (final_work_amount >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    (garment_type_id is not null and custom_garment_name is null)
    or (garment_type_id is null and length(trim(custom_garment_name)) > 0)
  ),
  check (
    (is_rush and rush_fee_amount = 99)
    or (not is_rush and rush_fee_amount = 0)
  ),
  unique (id, garment_type_id)
);

-- A garment can have several selected issues in the same visit.
create table if not exists public.order_item_issues (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null,
  garment_type_id uuid not null,
  issue_id uuid not null,
  issue_name_snapshot text not null check (length(trim(issue_name_snapshot)) > 0),
  issue_category_snapshot text not null check (issue_category_snapshot in ('alteration', 'replacement', 'enhancement')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (order_item_id, issue_id),
  unique (id, issue_id),
  foreign key (order_item_id, garment_type_id)
    references public.order_items (id, garment_type_id)
    on delete cascade,
  foreign key (issue_id, garment_type_id)
    references public.issues (id, garment_type_id)
    on delete restrict
);

create table if not exists public.order_item_options (
  id uuid primary key default gen_random_uuid(),
  order_item_issue_id uuid not null,
  issue_id uuid not null,
  issue_option_id uuid not null,
  option_name_snapshot text not null check (length(trim(option_name_snapshot)) > 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (order_item_issue_id, issue_option_id),
  foreign key (order_item_issue_id, issue_id)
    references public.order_item_issues (id, issue_id)
    on delete cascade,
  foreign key (issue_option_id, issue_id)
    references public.issue_options (id, issue_id)
    on delete restrict
);

create index if not exists issues_garment_type_id_idx on public.issues (garment_type_id);
create index if not exists issue_options_issue_id_idx on public.issue_options (issue_id);
create index if not exists pricing_rules_service_tier_id_idx on public.pricing_rules (service_tier_id);
create index if not exists addresses_profile_id_idx on public.addresses (profile_id);
create index if not exists orders_profile_id_created_at_idx on public.orders (profile_id, created_at desc);
create index if not exists orders_address_id_idx on public.orders (address_id);
create index if not exists orders_shared_service_tier_id_idx on public.orders (shared_service_tier_id);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_garment_type_id_idx on public.order_items (garment_type_id);
create index if not exists order_items_service_tier_id_idx on public.order_items (service_tier_id);
create index if not exists order_item_issues_order_item_id_idx on public.order_item_issues (order_item_id);
create index if not exists order_item_issues_issue_id_idx on public.order_item_issues (issue_id);
create index if not exists order_item_options_order_item_issue_id_idx on public.order_item_options (order_item_issue_id);
create index if not exists order_item_options_issue_option_id_idx on public.order_item_options (issue_option_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.fixfit_set_updated_at();

drop trigger if exists garment_types_set_updated_at on public.garment_types;
create trigger garment_types_set_updated_at
before update on public.garment_types
for each row execute function public.fixfit_set_updated_at();

drop trigger if exists service_tiers_set_updated_at on public.service_tiers;
create trigger service_tiers_set_updated_at
before update on public.service_tiers
for each row execute function public.fixfit_set_updated_at();

drop trigger if exists issues_set_updated_at on public.issues;
create trigger issues_set_updated_at
before update on public.issues
for each row execute function public.fixfit_set_updated_at();

drop trigger if exists issue_options_set_updated_at on public.issue_options;
create trigger issue_options_set_updated_at
before update on public.issue_options
for each row execute function public.fixfit_set_updated_at();

drop trigger if exists pricing_rules_set_updated_at on public.pricing_rules;
create trigger pricing_rules_set_updated_at
before update on public.pricing_rules
for each row execute function public.fixfit_set_updated_at();

drop trigger if exists addresses_set_updated_at on public.addresses;
create trigger addresses_set_updated_at
before update on public.addresses
for each row execute function public.fixfit_set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.fixfit_set_updated_at();

drop trigger if exists order_items_set_updated_at on public.order_items;
create trigger order_items_set_updated_at
before update on public.order_items
for each row execute function public.fixfit_set_updated_at();

drop trigger if exists order_item_options_enforce_cardinality on public.order_item_options;
create trigger order_item_options_enforce_cardinality
before insert or update of order_item_issue_id, issue_id on public.order_item_options
for each row execute function public.fixfit_enforce_order_item_option_cardinality();

alter table public.profiles enable row level security;
alter table public.garment_types enable row level security;
alter table public.issues enable row level security;
alter table public.issue_options enable row level security;
alter table public.service_tiers enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_item_issues enable row level security;
alter table public.order_item_options enable row level security;

revoke all on public.profiles, public.garment_types, public.issues,
  public.issue_options, public.service_tiers, public.pricing_rules,
  public.addresses, public.orders, public.order_items,
  public.order_item_issues, public.order_item_options from anon, authenticated;

grant select on public.garment_types, public.issues, public.issue_options,
  public.service_tiers, public.pricing_rules to anon, authenticated;
grant select, insert, update on public.profiles, public.addresses to authenticated;
-- Order records, their catalog snapshots, and all financial fields are created
-- only by a future trusted server-side transaction. Browser clients receive
-- read access to their own records but no write privileges.
grant select on public.orders, public.order_items,
  public.order_item_issues, public.order_item_options to authenticated;

drop policy if exists "Public can read active garment types" on public.garment_types;
create policy "Public can read active garment types"
on public.garment_types for select to anon, authenticated
using (is_active);

drop policy if exists "Public can read active issues" on public.issues;
create policy "Public can read active issues"
on public.issues for select to anon, authenticated
using (
  is_active
  and exists (
    select 1
    from public.garment_types
    where garment_types.id = issues.garment_type_id
      and garment_types.is_active
  )
);

drop policy if exists "Public can read active issue options" on public.issue_options;
create policy "Public can read active issue options"
on public.issue_options for select to anon, authenticated
using (
  is_active
  and exists (
    select 1
    from public.issues
    join public.garment_types on garment_types.id = issues.garment_type_id
    where issues.id = issue_options.issue_id
      and issues.is_active
      and garment_types.is_active
  )
);

drop policy if exists "Public can read active service tiers" on public.service_tiers;
create policy "Public can read active service tiers"
on public.service_tiers for select to anon, authenticated
using (is_active);

drop policy if exists "Public can read active pricing rules" on public.pricing_rules;
create policy "Public can read active pricing rules"
on public.pricing_rules for select to anon, authenticated
using (
  is_active
  and (
    service_tier_id is null
    or exists (
      select 1
      from public.service_tiers
      where service_tiers.id = pricing_rules.service_tier_id
        and service_tiers.is_active
    )
  )
);

drop policy if exists "Customers can read their profile" on public.profiles;
create policy "Customers can read their profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Customers can create their profile" on public.profiles;
create policy "Customers can create their profile"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Customers can update their profile" on public.profiles;
create policy "Customers can update their profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Customers manage their addresses" on public.addresses;
create policy "Customers manage their addresses"
on public.addresses for all to authenticated
using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);

drop policy if exists "Customers can read their orders" on public.orders;
create policy "Customers can read their orders"
on public.orders for select to authenticated
using ((select auth.uid()) = profile_id);

drop policy if exists "Customers can create their orders" on public.orders;

drop policy if exists "Customers can read their order items" on public.order_items;
create policy "Customers can read their order items"
on public.order_items for select to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.profile_id = (select auth.uid())
  )
);

drop policy if exists "Customers can create their order items" on public.order_items;

drop policy if exists "Customers can read their order item issues" on public.order_item_issues;
create policy "Customers can read their order item issues"
on public.order_item_issues for select to authenticated
using (
  exists (
    select 1
    from public.order_items
    join public.orders on orders.id = order_items.order_id
    where order_items.id = order_item_issues.order_item_id
      and orders.profile_id = (select auth.uid())
  )
);

drop policy if exists "Customers can create their order item issues" on public.order_item_issues;

drop policy if exists "Customers can read their order item options" on public.order_item_options;
create policy "Customers can read their order item options"
on public.order_item_options for select to authenticated
using (
  exists (
    select 1
    from public.order_item_issues
    join public.order_items on order_items.id = order_item_issues.order_item_id
    join public.orders on orders.id = order_items.order_id
    where order_item_issues.id = order_item_options.order_item_issue_id
      and orders.profile_id = (select auth.uid())
  )
);

drop policy if exists "Customers can create their order item options" on public.order_item_options;
