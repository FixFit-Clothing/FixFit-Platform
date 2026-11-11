# FixFit V1 manual UPI operations

Only a trusted Supabase project operator should run these statements in the
Supabase SQL Editor. They are not customer-facing APIs and do not require a
service-role credential in the application.

## Allowed lifecycle transitions

- Customer RPC: `awaiting_payment` → `submitted` only.
- Trusted operator: `submitted` → `verified` with `pending` → `confirmed`, or
  `submitted` → `rejected` while the order stays `pending`.
- There is no documented reverse transition. Do not manually reset a submitted,
  rejected, or verified payment to an earlier state.
- Historical orders with a `NULL` payment status retain their existing state;
  do not infer or backfill a payment outcome.

Before every operation, reconcile the actual received transaction's recipient,
UTR/reference, timestamp, and amount against the target order. The expected
initial amount is `booking_fee_amount + rush_fee_amount`; estimated work is not
collected at this stage.

```sql
select
  id,
  order_reference,
  status,
  payment_status,
  payment_reference,
  payment_submitted_at,
  payment_verified_at,
  payment_rejection_reason,
  design_executive_name,
  design_executive_assigned_at,
  booking_fee_amount,
  rush_fee_amount,
  booking_fee_amount + rush_fee_amount as initial_amount_due
from public.orders
where id = 'REPLACE_WITH_ORDER_UUID'::uuid;
```

## Verify a submitted payment and confirm the booking

Replace the UUID once. The `DO` block aborts the transaction unless exactly one
eligible row changes. Run `COMMIT` only after the block and the result query
complete without error.

```sql
begin;

do $$
declare
  v_updated_rows bigint;
begin
  update public.orders
  set
    payment_status = 'verified',
    payment_verified_at = now(),
    status = 'confirmed',
    design_executive_name = 'Varshitha',
    design_executive_assigned_at = now()
  where id = 'REPLACE_WITH_ORDER_UUID'::uuid
    and status = 'pending'
    and payment_status = 'submitted'
    and payment_method = 'upi'
    and design_executive_name is null
    and design_executive_assigned_at is null;

  get diagnostics v_updated_rows = row_count;
  if v_updated_rows <> 1 then
    raise exception
      'Payment verification requires exactly one pending submitted order; updated % rows.',
      v_updated_rows;
  end if;
end;
$$;

select
  id,
  order_reference,
  status,
  payment_status,
  payment_verified_at,
  design_executive_name,
  design_executive_assigned_at
from public.orders
where id = 'REPLACE_WITH_ORDER_UUID'::uuid;

commit;
```

## Reject a submitted payment

The reason is customer-visible. Use a short, customer-safe explanation only:
5–280 characters, with no internal reconciliation notes, bank details, UTRs,
personal data, or staff-only instructions. This keeps the order status
unchanged.

```sql
begin;

do $$
declare
  v_rejection_reason text := trim('REPLACE_WITH_CUSTOMER_SAFE_REASON');
  v_updated_rows bigint;
begin
  if length(v_rejection_reason) not between 5 and 280 then
    raise exception 'A customer-visible rejection reason must be 5–280 characters.';
  end if;

  update public.orders
  set
    payment_status = 'rejected',
    payment_rejection_reason = v_rejection_reason
  where id = 'REPLACE_WITH_ORDER_UUID'::uuid
    and status = 'pending'
    and payment_status = 'submitted';

  get diagnostics v_updated_rows = row_count;
  if v_updated_rows <> 1 then
    raise exception
      'Payment rejection requires exactly one pending submitted order; updated % rows.',
      v_updated_rows;
  end if;
end;
$$;

select
  id,
  order_reference,
  status,
  payment_status,
  payment_rejection_reason
from public.orders
where id = 'REPLACE_WITH_ORDER_UUID'::uuid;

commit;
```

## Assign Varshitha to an already confirmed booking

Use this only for an order that was already verified and confirmed before the
automatic assignment above was introduced. It does not modify payment fields
or re-verify the payment, and it refuses to overwrite an existing assignment.

```sql
begin;

do $$
declare
  v_updated_rows bigint;
begin
  update public.orders
  set
    design_executive_name = 'Varshitha',
    design_executive_assigned_at = now()
  where id = 'REPLACE_WITH_ORDER_UUID'::uuid
    and status = 'confirmed'
    and payment_status = 'verified'
    and design_executive_name is null
    and design_executive_assigned_at is null;

  get diagnostics v_updated_rows = row_count;
  if v_updated_rows <> 1 then
    raise exception
      'Executive assignment requires exactly one unassigned verified confirmed order; updated % rows.',
      v_updated_rows;
  end if;
end;
$$;

select
  id,
  order_reference,
  status,
  design_executive_name,
  design_executive_assigned_at
from public.orders
where id = 'REPLACE_WITH_ORDER_UUID'::uuid;

commit;
```

If any block raises an exception, the transaction is aborted. Run `rollback;`,
inspect the order again, and do not force an update. Do not overwrite an
existing assignment or clear only one assignment field.
