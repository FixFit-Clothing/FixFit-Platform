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
    status = 'confirmed'
  where id = 'REPLACE_WITH_ORDER_UUID'::uuid
    and status = 'pending'
    and payment_status = 'submitted';

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
  payment_verified_at
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

## Assign a design executive

Only assign an executive when the booking is confirmed and the name is
confirmed. The database constraint requires the name and assignment timestamp
to be set together.

```sql
begin;

do $$
declare
  v_executive_name text := trim('REPLACE_WITH_EXECUTIVE_NAME');
  v_updated_rows bigint;
begin
  if length(v_executive_name) = 0 then
    raise exception 'An executive name is required.';
  end if;

  update public.orders
  set
    design_executive_name = v_executive_name,
    design_executive_assigned_at = now()
  where id = 'REPLACE_WITH_ORDER_UUID'::uuid
    and status = 'confirmed';

  get diagnostics v_updated_rows = row_count;
  if v_updated_rows <> 1 then
    raise exception
      'Executive assignment requires exactly one confirmed order; updated % rows.',
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
inspect the order again, and do not force an update. To correct an assignment,
run the assignment operation with the corrected name; do not clear only one
assignment field.
