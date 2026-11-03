-- Sprint 10B customer profile fields and saved-address default selection.
-- This migration intentionally preserves the existing RLS policies and only
-- extends columns/constraints required by the authenticated customer UI.

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists phone text;

alter table public.profiles
  drop constraint if exists profiles_full_name_not_blank,
  add constraint profiles_full_name_not_blank
    check (full_name is null or length(trim(full_name)) > 0),
  drop constraint if exists profiles_phone_format,
  add constraint profiles_phone_format
    check (phone is null or phone ~ '^\\+?[0-9]{7,15}$');

alter table public.addresses
  add column if not exists is_default boolean not null default false;

-- A customer may have zero or one default address. Existing rows remain valid
-- because the new column defaults to false.
create unique index if not exists addresses_one_default_per_profile_idx
  on public.addresses (profile_id)
  where is_default;

-- The existing RLS policy already permits customer-owned deletes, but the
-- schema migration granted only select/insert/update to authenticated users.
-- Add the missing table privilege without changing any policy.
grant delete on public.addresses to authenticated;
