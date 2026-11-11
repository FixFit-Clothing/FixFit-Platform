-- Sprint 11B Phase 1A: trusted, idempotent customer order creation.
-- This migration is intentionally not coupled to browser table-write grants.

create sequence if not exists public.fixfit_order_reference_seq
  as bigint start with 1 increment by 1 minvalue 1 no maxvalue cache 1;

revoke all on sequence public.fixfit_order_reference_seq
  from public, anon, authenticated;

create or replace function public.fixfit_format_order_reference(
  p_sequence_value bigint
)
returns text
language sql
immutable
set search_path = pg_catalog
as $$
  select 'FF-' || case
    when length(p_sequence_value::text) < 6
      then lpad(p_sequence_value::text, 6, '0')
    else p_sequence_value::text
  end
$$;

revoke all on function public.fixfit_format_order_reference(bigint)
  from public, anon, authenticated;

alter table public.orders
  add column if not exists order_reference text,
  add column if not exists idempotency_key uuid,
  add column if not exists request_fingerprint text,
  add column if not exists pickup_address_line1_snapshot text,
  add column if not exists pickup_landmark_snapshot text,
  add column if not exists pickup_locality_snapshot text,
  add column if not exists pickup_city_snapshot text;

do $$
declare
  v_max_reference bigint;
begin
  select coalesce(max((substring(order_reference from '^FF-([0-9]+)$'))::bigint), 0)
    into v_max_reference
  from public.orders;

  perform setval(
    'public.fixfit_order_reference_seq',
    greatest(v_max_reference, 1),
    v_max_reference > 0
  );
end;
$$;

update public.orders
set order_reference = public.fixfit_format_order_reference(
  nextval('public.fixfit_order_reference_seq')
)
where order_reference is null;

do $$
declare
  v_max_reference bigint;
begin
  select coalesce(max((substring(order_reference from '^FF-([0-9]+)$'))::bigint), 0)
    into v_max_reference
  from public.orders;

  perform setval(
    'public.fixfit_order_reference_seq',
    greatest(v_max_reference, 1),
    v_max_reference > 0
  );
end;
$$;

alter table public.orders
  alter column order_reference set not null;

alter sequence public.fixfit_order_reference_seq
  owned by public.orders.order_reference;

create unique index if not exists orders_order_reference_key
  on public.orders (order_reference);

create unique index if not exists orders_profile_id_idempotency_key_key
  on public.orders (profile_id, idempotency_key)
  where idempotency_key is not null;

alter table public.orders
  drop constraint if exists orders_order_reference_format,
  add constraint orders_order_reference_format
    check (order_reference ~ '^FF-[0-9]{6,}$'),
  drop constraint if exists orders_request_fingerprint_sha256,
  add constraint orders_request_fingerprint_sha256
    check (request_fingerprint is null or request_fingerprint ~ '^[0-9a-f]{64}$');

-- Resolve the extension schema at migration time; pgcrypto may be installed in
-- public or extensions depending on the Supabase project history.
do $$
declare
  v_extension_schema name;
begin
  select n.nspname into v_extension_schema
  from pg_extension e
  join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'pgcrypto';

  if v_extension_schema is null then
    raise exception 'pgcrypto is required for FixFit order fingerprints';
  end if;

  execute format(
    $sql$
      create or replace function public.fixfit_sha256(p_value text)
      returns text
      language sql
      security definer
      set search_path = pg_catalog, public
      as $function$
        select encode(%1$I.digest(p_value, 'sha256'), 'hex')
      $function$
    $sql$,
    v_extension_schema
  );
end;
$$;

revoke all on function public.fixfit_sha256(text)
  from public, anon, authenticated;

create or replace function public.fixfit_create_customer_order(
  p_idempotency_key uuid,
  p_address_id uuid,
  p_payment_method text,
  p_items jsonb
)
returns table (
  order_id uuid,
  order_reference text,
  order_status text,
  created_at timestamptz,
  estimated_work_amount integer,
  booking_fee_amount integer,
  rush_fee_amount integer,
  final_payable_amount integer
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  c_max_garments constant integer := 25;
  c_max_issues constant integer := 12;
  c_max_options constant integer := 12;
  v_customer_id uuid := auth.uid();
  v_now timestamptz := now();
  v_phone text;
  v_address public.addresses%rowtype;
  v_existing public.orders%rowtype;
  v_order public.orders%rowtype;
  v_garment public.garment_types%rowtype;
  v_tier public.service_tiers%rowtype;
  v_shared_tier public.service_tiers%rowtype;
  v_issue public.issues%rowtype;
  v_option public.issue_options%rowtype;
  v_item jsonb;
  v_issue_input jsonb;
  v_option_input jsonb;
  v_garment_id uuid;
  v_issue_id uuid;
  v_option_id uuid;
  v_item_id uuid;
  v_item_issue_id uuid;
  v_booking_fee integer;
  v_rush_fee integer;
  v_booking_rule_count integer;
  v_rush_rule_count integer;
  v_estimated_work bigint := 0;
  v_rush_total bigint := 0;
  v_shared_rank smallint := 0;
  v_fingerprint text;
  v_normalized_items jsonb;
begin
  if v_customer_id is null then
    raise exception using errcode = 'P0001', message = 'Authentication is required to create a booking.';
  end if;
  if p_idempotency_key is null or p_address_id is null then
    raise exception using errcode = 'P0001', message = 'Invalid booking submission.';
  end if;
  if p_payment_method is distinct from 'upi' then
    raise exception using errcode = 'P0001', message = 'UPI is the only available payment method for this booking.';
  end if;
  if p_items is null or jsonb_typeof(p_items) is distinct from 'array' then
    raise exception using errcode = 'P0001', message = 'Booking items must be a list.';
  end if;
  if jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > c_max_garments then
    raise exception using errcode = 'P0001', message = 'This booking contains an invalid number of garments.';
  end if;

  -- Validate nested JSON shapes before the canonicalizing JSON expressions
  -- below. This also normalizes UUID spellings before they affect the hash.
  for v_item in select value from jsonb_array_elements(p_items) as input(value) loop
    if jsonb_typeof(v_item) is distinct from 'object'
      or not (v_item ? 'garment_type_id' and v_item ? 'service_tier_code'
        and v_item ? 'rush' and v_item ? 'issues')
      or jsonb_typeof(v_item -> 'garment_type_id') is distinct from 'string'
      or jsonb_typeof(v_item -> 'service_tier_code') is distinct from 'string'
      or jsonb_typeof(v_item -> 'rush') is distinct from 'boolean'
      or jsonb_typeof(v_item -> 'issues') is distinct from 'array'
    then
      raise exception using errcode = 'P0001', message = 'This booking contains an unsupported garment selection.';
    end if;
    if jsonb_array_length(v_item -> 'issues') = 0
      or jsonb_array_length(v_item -> 'issues') > c_max_issues then
      raise exception using errcode = 'P0001', message = 'This garment contains an invalid number of selected issues.';
    end if;
    begin v_garment_id := (v_item ->> 'garment_type_id')::uuid;
    exception when invalid_text_representation then
      raise exception using errcode = 'P0001', message = 'This booking contains an invalid garment identifier.';
    end;
    for v_issue_input in select value from jsonb_array_elements(v_item -> 'issues') as input(value) loop
      if jsonb_typeof(v_issue_input) is distinct from 'object'
        or not (v_issue_input ? 'issue_id' and v_issue_input ? 'option_ids')
        or jsonb_typeof(v_issue_input -> 'issue_id') is distinct from 'string'
        or jsonb_typeof(v_issue_input -> 'option_ids') is distinct from 'array'
      then
        raise exception using errcode = 'P0001', message = 'This booking contains an invalid issue selection.';
      end if;
      if jsonb_array_length(v_issue_input -> 'option_ids') > c_max_options then
        raise exception using errcode = 'P0001', message = 'This issue contains too many selected options.';
      end if;
      begin v_issue_id := (v_issue_input ->> 'issue_id')::uuid;
      exception when invalid_text_representation then
        raise exception using errcode = 'P0001', message = 'This booking contains an invalid issue identifier.';
      end;
      for v_option_input in select value from jsonb_array_elements(v_issue_input -> 'option_ids') as input(value) loop
        if jsonb_typeof(v_option_input) is distinct from 'string' then
          raise exception using errcode = 'P0001', message = 'This booking contains an invalid option identifier.';
        end if;
        begin v_option_id := (v_option_input #>> '{}')::uuid;
        exception when invalid_text_representation then
          raise exception using errcode = 'P0001', message = 'This booking contains an invalid option identifier.';
        end;
      end loop;
    end loop;
  end loop;

  -- JSONB canonicalizes object keys. UUID casts and sorted arrays make the
  -- request fingerprint independent of garment, issue, and option ordering.
  select coalesce(
    jsonb_agg(
      normalized.garment order by (item.value ->> 'garment_type_id')::uuid,
        item.value ->> 'service_tier_code',
        (item.value ->> 'rush')::boolean,
        normalized.garment
    ),
    '[]'::jsonb
  ) into v_normalized_items
  from jsonb_array_elements(p_items) as item(value)
  cross join lateral (
    select jsonb_build_object(
      'garment_type_id', (item.value ->> 'garment_type_id')::uuid::text,
      'service_tier_code', item.value ->> 'service_tier_code',
      'rush', (item.value ->> 'rush')::boolean,
      'issues', (
        select coalesce(
          jsonb_agg(
            jsonb_build_object(
              'issue_id', (issue.value ->> 'issue_id')::uuid::text,
              'option_ids', (
                select coalesce(
                  jsonb_agg((option.value #>> '{}')::uuid::text order by (option.value #>> '{}')::uuid),
                  '[]'::jsonb
                )
                from jsonb_array_elements(issue.value -> 'option_ids') as option(value)
              )
            ) order by (issue.value ->> 'issue_id')::uuid
          ),
          '[]'::jsonb
        )
        from jsonb_array_elements(item.value -> 'issues') as issue(value)
      )
    ) as garment
  ) as normalized;

  v_fingerprint := public.fixfit_sha256(
    jsonb_build_object(
      'address_id', p_address_id::text,
      'payment_method', p_payment_method,
      'items', v_normalized_items
    )::text
  );

  select * into v_existing
  from public.orders
  where profile_id = v_customer_id and idempotency_key = p_idempotency_key
  for share;

  if found then
    if v_existing.request_fingerprint is distinct from v_fingerprint then
      raise exception using errcode = 'P0001', message = 'This submission key was already used for different booking details.';
    end if;
    return query select v_existing.id, v_existing.order_reference, v_existing.status,
      v_existing.created_at, v_existing.estimated_work_amount,
      v_existing.booking_fee_amount, v_existing.rush_fee_amount,
      v_existing.final_payable_amount;
    return;
  end if;

  select phone into v_phone from public.profiles where id = v_customer_id for share;
  if not found or v_phone is null or v_phone !~ '^[+]?[0-9]{7,15}$' then
    raise exception using errcode = 'P0001', message = 'Add a valid phone number before creating a booking.';
  end if;

  select * into v_address from public.addresses
  where id = p_address_id and profile_id = v_customer_id for share;
  if not found then
    raise exception using errcode = 'P0001', message = 'Choose one of your saved pickup addresses.';
  end if;

  -- Code is unique in the existing schema. Lock the exact rows first, then
  -- aggregate with the full validation predicates.
  perform 1 from public.pricing_rules
  where code = 'visit-booking-fee' for share;
  select count(*), min(amount) into v_booking_rule_count, v_booking_fee
  from public.pricing_rules
  where code = 'visit-booking-fee' and rule_type = 'booking_fee' and is_active;

  perform 1 from public.pricing_rules
  where code = 'per-qualifying-garment-rush-fee' for share;
  select count(*), min(amount) into v_rush_rule_count, v_rush_fee
  from public.pricing_rules
  where code = 'per-qualifying-garment-rush-fee'
    and rule_type = 'rush_fee' and applies_per_garment and is_active;

  if v_booking_rule_count <> 1 or v_rush_rule_count <> 1
    or v_booking_fee is distinct from 99 or v_rush_fee is distinct from 99 then
    raise exception using errcode = 'P0001', message = 'Booking pricing is not currently available.';
  end if;

  -- Validate active catalog records and reproduce the estimator's tier-starting
  -- price calculation. Custom garments cannot be represented by issue FKs.
  for v_item in select value from jsonb_array_elements(p_items) as input(value) loop
    if jsonb_typeof(v_item) is distinct from 'object'
      or not (v_item ? 'garment_type_id' and v_item ? 'service_tier_code'
        and v_item ? 'rush' and v_item ? 'issues')
      or jsonb_typeof(v_item -> 'garment_type_id') is distinct from 'string'
      or jsonb_typeof(v_item -> 'service_tier_code') is distinct from 'string'
      or jsonb_typeof(v_item -> 'rush') is distinct from 'boolean'
      or jsonb_typeof(v_item -> 'issues') is distinct from 'array'
    then
      raise exception using errcode = 'P0001', message = 'This booking contains an unsupported garment selection.';
    end if;
    if jsonb_array_length(v_item -> 'issues') = 0 or jsonb_array_length(v_item -> 'issues') > c_max_issues then
      raise exception using errcode = 'P0001', message = 'This garment contains an invalid number of selected issues.';
    end if;
    begin v_garment_id := (v_item ->> 'garment_type_id')::uuid;
    exception when invalid_text_representation then
      raise exception using errcode = 'P0001', message = 'This booking contains an invalid garment identifier.';
    end;
    select * into v_garment from public.garment_types where id = v_garment_id and is_active for share;
    if not found then raise exception using errcode = 'P0001', message = 'A selected garment is no longer available.'; end if;
    select * into v_tier from public.service_tiers where code = v_item ->> 'service_tier_code' and is_active for share;
    if not found then raise exception using errcode = 'P0001', message = 'A selected service tier is no longer available.'; end if;
    if v_estimated_work > 2147483647 - v_tier.starting_price then
      raise exception using errcode = 'P0001', message = 'The booking estimate is too large to process.';
    end if;
    v_estimated_work := v_estimated_work + v_tier.starting_price;
    v_shared_rank := greatest(v_shared_rank, v_tier.display_rank);

    for v_issue_input in select value from jsonb_array_elements(v_item -> 'issues') as input(value) loop
      if jsonb_typeof(v_issue_input) is distinct from 'object'
        or not (v_issue_input ? 'issue_id' and v_issue_input ? 'option_ids')
        or jsonb_typeof(v_issue_input -> 'issue_id') is distinct from 'string'
        or jsonb_typeof(v_issue_input -> 'option_ids') is distinct from 'array'
      then
        raise exception using errcode = 'P0001', message = 'This booking contains an invalid issue selection.';
      end if;
      if jsonb_array_length(v_issue_input -> 'option_ids') > c_max_options then
        raise exception using errcode = 'P0001', message = 'This issue contains too many selected options.';
      end if;
      begin v_issue_id := (v_issue_input ->> 'issue_id')::uuid;
      exception when invalid_text_representation then
        raise exception using errcode = 'P0001', message = 'This booking contains an invalid issue identifier.';
      end;
      select * into v_issue from public.issues
      where id = v_issue_id and garment_type_id = v_garment.id and is_active for share;
      if not found then raise exception using errcode = 'P0001', message = 'A selected issue is unavailable for this garment.'; end if;
      if not v_issue.allows_multiple_options and jsonb_array_length(v_issue_input -> 'option_ids') > 1 then
        raise exception using errcode = 'P0001', message = 'This issue allows only one option.';
      end if;
      for v_option_input in select value from jsonb_array_elements(v_issue_input -> 'option_ids') as input(value) loop
        if jsonb_typeof(v_option_input) is distinct from 'string' then
          raise exception using errcode = 'P0001', message = 'This booking contains an invalid option identifier.';
        end if;
        begin v_option_id := (v_option_input #>> '{}')::uuid;
        exception when invalid_text_representation then
          raise exception using errcode = 'P0001', message = 'This booking contains an invalid option identifier.';
        end;
        select * into v_option from public.issue_options
        where id = v_option_id and issue_id = v_issue.id and is_active for share;
        if not found then raise exception using errcode = 'P0001', message = 'A selected issue option is no longer available.'; end if;
      end loop;
    end loop;
  end loop;

  select * into v_shared_tier from public.service_tiers
  where display_rank = v_shared_rank and is_active for share;
  if not found then raise exception using errcode = 'P0001', message = 'The shared service tier is unavailable.'; end if;

  select count(*)::bigint * v_rush_fee into v_rush_total
  from jsonb_array_elements(p_items) as input(value)
  join public.service_tiers tier on tier.code = input.value ->> 'service_tier_code'
  where (input.value ->> 'rush')::boolean and tier.display_rank < v_shared_tier.display_rank;

  if v_rush_total > 2147483647 then
    raise exception using errcode = 'P0001', message = 'The booking rush fee is too large to process.';
  end if;

  insert into public.orders (
    order_reference, profile_id, address_id,
    pickup_address_line1_snapshot, pickup_landmark_snapshot,
    pickup_locality_snapshot, pickup_city_snapshot,
    shared_service_tier_id, shared_service_tier_code_snapshot,
    shared_service_tier_name_snapshot, shared_service_tier_turnaround_snapshot,
    status, payment_method, booking_fee_amount, booking_fee_credit_amount,
    rush_fee_amount, estimated_work_amount, final_work_amount,
    final_payable_amount, idempotency_key, request_fingerprint, created_at, updated_at
  ) values (
    public.fixfit_format_order_reference(nextval('public.fixfit_order_reference_seq')),
    v_customer_id, v_address.id, v_address.address_line1, v_address.landmark,
    v_address.locality, v_address.city, v_shared_tier.id, v_shared_tier.code,
    v_shared_tier.name, v_shared_tier.turnaround_label, 'pending', 'upi',
    v_booking_fee, 0, v_rush_total::integer, v_estimated_work::integer,
    null, null, p_idempotency_key, v_fingerprint, v_now, v_now
  ) on conflict (profile_id, idempotency_key) where idempotency_key is not null
    do nothing
  returning * into v_order;

  if not found then
    select * into v_existing from public.orders
    where profile_id = v_customer_id and idempotency_key = p_idempotency_key for share;
    if not found or v_existing.request_fingerprint is distinct from v_fingerprint then
      raise exception using errcode = 'P0001', message = 'This submission key was already used for different booking details.';
    end if;
    return query select v_existing.id, v_existing.order_reference, v_existing.status,
      v_existing.created_at, v_existing.estimated_work_amount,
      v_existing.booking_fee_amount, v_existing.rush_fee_amount,
      v_existing.final_payable_amount;
    return;
  end if;

  for v_item in select value from jsonb_array_elements(p_items) as input(value) loop
    select * into v_garment from public.garment_types where id = (v_item ->> 'garment_type_id')::uuid;
    select * into v_tier from public.service_tiers where code = v_item ->> 'service_tier_code';
    insert into public.order_items (
      order_id, garment_type_id, custom_garment_name, service_tier_id,
      garment_name_snapshot, service_tier_code_snapshot, service_tier_name_snapshot,
      service_tier_turnaround_snapshot, is_rush, rush_fee_amount,
      estimate_from_amount, final_work_amount, created_at, updated_at
    ) values (
      v_order.id, v_garment.id, null, v_tier.id, v_garment.name, v_tier.code,
      v_tier.name, v_tier.turnaround_label,
      (v_item ->> 'rush')::boolean and v_tier.display_rank < v_shared_tier.display_rank,
      case when (v_item ->> 'rush')::boolean and v_tier.display_rank < v_shared_tier.display_rank then v_rush_fee else 0 end,
      v_tier.starting_price, null, v_now, v_now
    ) returning id into v_item_id;

    for v_issue_input in select value from jsonb_array_elements(v_item -> 'issues') as input(value) loop
      select * into v_issue from public.issues where id = (v_issue_input ->> 'issue_id')::uuid;
      insert into public.order_item_issues (
        order_item_id, garment_type_id, issue_id, issue_name_snapshot,
        issue_category_snapshot, created_at
      ) values (
        v_item_id, v_garment.id, v_issue.id, v_issue.name, v_issue.category, v_now
      ) returning id into v_item_issue_id;
      for v_option_input in select value from jsonb_array_elements(v_issue_input -> 'option_ids') as input(value) loop
        select * into v_option from public.issue_options where id = (v_option_input #>> '{}')::uuid;
        insert into public.order_item_options (
          order_item_issue_id, issue_id, issue_option_id, option_name_snapshot, created_at
        ) values (
          v_item_issue_id, v_issue.id, v_option.id, v_option.name, v_now
        );
      end loop;
    end loop;
  end loop;

  return query select v_order.id, v_order.order_reference, v_order.status,
    v_order.created_at, v_order.estimated_work_amount,
    v_order.booking_fee_amount, v_order.rush_fee_amount,
    v_order.final_payable_amount;
end;
$$;

revoke all on function public.fixfit_create_customer_order(uuid, uuid, text, jsonb)
  from public, anon, authenticated;

grant execute on function public.fixfit_create_customer_order(uuid, uuid, text, jsonb)
  to authenticated;
