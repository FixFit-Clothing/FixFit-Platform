-- Sprint 12: manual UPI payment lifecycle and trusted customer submission.
-- Existing orders deliberately retain a NULL payment_status because their
-- payment history is unknown. New orders receive the default awaiting state.

alter table public.orders
  add column if not exists payment_status text,
  add column if not exists payment_reference text,
  add column if not exists payment_submitted_at timestamptz,
  add column if not exists payment_verified_at timestamptz,
  add column if not exists payment_rejection_reason text,
  add column if not exists design_executive_name text,
  add column if not exists design_executive_assigned_at timestamptz;

alter table public.orders
  alter column payment_status set default 'awaiting_payment';

alter table public.orders
  drop constraint if exists orders_payment_lifecycle_check,
  add constraint orders_payment_lifecycle_check check (
    (
      payment_status is null
      and payment_reference is null
      and payment_submitted_at is null
      and payment_verified_at is null
      and payment_rejection_reason is null
    )
    or (
      payment_status = 'awaiting_payment'
      and payment_reference is null
      and payment_submitted_at is null
      and payment_verified_at is null
      and payment_rejection_reason is null
    )
    or (
      payment_status = 'submitted'
      and payment_reference is not null
      and payment_submitted_at is not null
      and payment_verified_at is null
      and payment_rejection_reason is null
    )
    or (
      payment_status = 'verified'
      and payment_reference is not null
      and payment_submitted_at is not null
      and payment_verified_at is not null
      and payment_rejection_reason is null
    )
    or (
      payment_status = 'rejected'
      and payment_reference is not null
      and payment_submitted_at is not null
      and payment_verified_at is null
      and payment_rejection_reason is not null
      and length(trim(payment_rejection_reason)) between 5 and 280
    )
  ),
  drop constraint if exists orders_payment_reference_format,
  add constraint orders_payment_reference_format check (
    payment_reference is null
    or payment_reference ~ '^[A-Z0-9]{6,64}$'
  ),
  drop constraint if exists orders_payment_order_status_check,
  add constraint orders_payment_order_status_check check (
    payment_status is null
    or status = 'cancelled'
    or (payment_status = 'verified' and status = 'confirmed')
    or (
      payment_status in ('awaiting_payment', 'submitted', 'rejected')
      and status = 'pending'
    )
  ),
  drop constraint if exists orders_design_executive_assignment_check,
  add constraint orders_design_executive_assignment_check check (
    (design_executive_name is null and design_executive_assigned_at is null)
    or (
      design_executive_name is not null
      and length(trim(design_executive_name)) > 0
      and design_executive_assigned_at is not null
    )
  );

create unique index if not exists orders_payment_reference_key
  on public.orders (payment_reference)
  where payment_reference is not null;

create index if not exists orders_payment_status_created_at_idx
  on public.orders (payment_status, created_at desc)
  where payment_status is not null;

create or replace function public.fixfit_enforce_payment_status_transition()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if old.payment_status is null
    and new.payment_status is distinct from old.payment_status then
    raise exception using
      errcode = '23514',
      message = 'Historical orders with no recorded payment status cannot be transitioned.';
  end if;

  if old.payment_status is distinct from new.payment_status
    and not (
      (old.payment_status = 'awaiting_payment' and new.payment_status = 'submitted')
      or (
        old.payment_status = 'submitted'
        and new.payment_status in ('verified', 'rejected')
      )
    ) then
    raise exception using
      errcode = '23514',
      message = 'Invalid FixFit payment status transition.';
  end if;

  return new;
end;
$$;

revoke all on function public.fixfit_enforce_payment_status_transition()
  from public, anon, authenticated;

drop trigger if exists orders_enforce_payment_status_transition on public.orders;
create trigger orders_enforce_payment_status_transition
before update on public.orders
for each row execute function public.fixfit_enforce_payment_status_transition();

-- Customers retain read-only table access. Their only write path is the
-- narrowly scoped RPC below, which derives ownership from auth.uid().
revoke insert, update, delete on public.orders from anon, authenticated;

create or replace function public.fixfit_submit_customer_upi_payment(
  p_order_id uuid,
  p_payment_reference text
)
returns table (
  order_id uuid,
  order_reference text,
  payment_status text,
  payment_submitted_at timestamptz
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_customer_id uuid := auth.uid();
  v_payment_reference text := upper(
    regexp_replace(trim(coalesce(p_payment_reference, '')), '[[:space:]-]+', '', 'g')
  );
  v_order public.orders%rowtype;
begin
  if v_customer_id is null then
    raise exception using
      errcode = 'P0001',
      message = 'Authentication is required to submit payment details.';
  end if;

  if p_order_id is null or v_payment_reference !~ '^[A-Z0-9]{6,64}$' then
    raise exception using
      errcode = 'P0001',
      message = 'Enter a valid UPI transaction reference.';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
    and profile_id = v_customer_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'This booking is not available for payment submission.';
  end if;

  if v_order.status is distinct from 'pending' then
    raise exception using
      errcode = 'P0001',
      message = 'This booking is not eligible for payment submission.';
  end if;

  if v_order.payment_method is distinct from 'upi' then
    raise exception using
      errcode = 'P0001',
      message = 'This booking is not eligible for UPI payment submission.';
  end if;

  if v_order.payment_status = 'submitted' then
    if v_order.payment_reference = v_payment_reference then
      return query
      select v_order.id,
        v_order.order_reference,
        v_order.payment_status,
        v_order.payment_submitted_at;
      return;
    end if;

    raise exception using
      errcode = 'P0001',
      message = 'Payment details were already submitted for this booking.';
  end if;

  if v_order.payment_status is distinct from 'awaiting_payment' then
    raise exception using
      errcode = 'P0001',
      message = 'This booking is not eligible for payment submission.';
  end if;

  begin
    update public.orders as orders
    set payment_status = 'submitted',
      payment_reference = v_payment_reference,
      payment_submitted_at = now()
    where orders.id = v_order.id
    returning orders.id,
      orders.order_reference,
      orders.payment_status,
      orders.payment_submitted_at
      into order_id, order_reference, payment_status, payment_submitted_at;
  exception
    when unique_violation then
      raise exception using
        errcode = 'P0001',
        message = 'This transaction reference cannot be submitted for this booking.';
  end;

  return next;
end;
$$;

revoke all on function public.fixfit_submit_customer_upi_payment(uuid, text)
  from public, anon, authenticated;

grant execute on function public.fixfit_submit_customer_upi_payment(uuid, text)
  to authenticated;
