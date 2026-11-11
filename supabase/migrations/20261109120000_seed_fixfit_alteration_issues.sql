-- Sprint 11B Phase 2: predefined garment-specific alteration catalog.
-- The estimator intentionally supplies no option values for these selections.

do $$
declare
  v_expected constant jsonb := $expected$
[
  {"garment_name":"Blouse","issue_name":"Tight"},
  {"garment_name":"Blouse","issue_name":"Loose"},
  {"garment_name":"Blouse","issue_name":"Short"},
  {"garment_name":"Blouse","issue_name":"Misplaced"},
  {"garment_name":"Blouse","issue_name":"Gaping"},
  {"garment_name":"Blouse","issue_name":"Uneven"},
  {"garment_name":"Bodycon Dress","issue_name":"Tight"},
  {"garment_name":"Bodycon Dress","issue_name":"Short"},
  {"garment_name":"Bodycon Dress","issue_name":"Loose"},
  {"garment_name":"Bodycon Dress","issue_name":"Uneven"},
  {"garment_name":"Bodycon Dress","issue_name":"Broken"},
  {"garment_name":"Bodycon Dress","issue_name":"Damaged"},
  {"garment_name":"Bodycon Dress","issue_name":"Missing"},
  {"garment_name":"Dhoti Pants","issue_name":"Broken"},
  {"garment_name":"Dhoti Pants","issue_name":"Uneven"},
  {"garment_name":"Dhoti Pants","issue_name":"Tight"},
  {"garment_name":"Dhoti Pants","issue_name":"Small"},
  {"garment_name":"Dhoti Pants","issue_name":"Bulky"},
  {"garment_name":"Dhoti Pants","issue_name":"Long"},
  {"garment_name":"Dress","issue_name":"Small"},
  {"garment_name":"Dress","issue_name":"Uneven"},
  {"garment_name":"Dress","issue_name":"Stuck"},
  {"garment_name":"Dress","issue_name":"Twisted"},
  {"garment_name":"Dress","issue_name":"Loose"},
  {"garment_name":"Dress","issue_name":"Tight"},
  {"garment_name":"Gharara","issue_name":"Tight"},
  {"garment_name":"Gharara","issue_name":"Uneven"},
  {"garment_name":"Gharara","issue_name":"Long"},
  {"garment_name":"Gharara","issue_name":"Broken"},
  {"garment_name":"Gharara","issue_name":"Short"},
  {"garment_name":"Gharara","issue_name":"Missing"},
  {"garment_name":"Gown","issue_name":"Tight"},
  {"garment_name":"Gown","issue_name":"Loose"},
  {"garment_name":"Gown","issue_name":"Long"},
  {"garment_name":"Gown","issue_name":"Uneven"},
  {"garment_name":"Gown","issue_name":"Short"},
  {"garment_name":"Jacket","issue_name":"Tight"},
  {"garment_name":"Jacket","issue_name":"Loose"},
  {"garment_name":"Jacket","issue_name":"Long"},
  {"garment_name":"Jacket","issue_name":"Uneven"},
  {"garment_name":"Jacket","issue_name":"Short"},
  {"garment_name":"Jeans","issue_name":"Loose"},
  {"garment_name":"Jeans","issue_name":"Stuck"},
  {"garment_name":"Jeans","issue_name":"Low"},
  {"garment_name":"Jeans","issue_name":"Twisted"},
  {"garment_name":"Jeans","issue_name":"Small"},
  {"garment_name":"Jeans","issue_name":"Broken"},
  {"garment_name":"Jumpsuit","issue_name":"Tight"},
  {"garment_name":"Jumpsuit","issue_name":"Uneven"},
  {"garment_name":"Jumpsuit","issue_name":"Small"},
  {"garment_name":"Jumpsuit","issue_name":"Broken"},
  {"garment_name":"Jumpsuit","issue_name":"Short"},
  {"garment_name":"Jumpsuit","issue_name":"Long"},
  {"garment_name":"Kaftan","issue_name":"Long"},
  {"garment_name":"Kaftan","issue_name":"Tight"},
  {"garment_name":"Kaftan","issue_name":"Loose"},
  {"garment_name":"Kaftan","issue_name":"Uneven"},
  {"garment_name":"Kaftan","issue_name":"Broken"},
  {"garment_name":"Kaftan","issue_name":"Short"},
  {"garment_name":"Kurti","issue_name":"Open"},
  {"garment_name":"Kurti","issue_name":"Loose"},
  {"garment_name":"Kurti","issue_name":"Small"},
  {"garment_name":"Kurti","issue_name":"Uneven"},
  {"garment_name":"Kurti","issue_name":"Twisted"},
  {"garment_name":"Kurti","issue_name":"Tight"},
  {"garment_name":"Lehenga","issue_name":"Broken"},
  {"garment_name":"Lehenga","issue_name":"Uneven"},
  {"garment_name":"Lehenga","issue_name":"Long"},
  {"garment_name":"Lehenga","issue_name":"Tight"},
  {"garment_name":"Lehenga","issue_name":"Loose"},
  {"garment_name":"Lehenga","issue_name":"Short"},
  {"garment_name":"Maxi Dress","issue_name":"Tight"},
  {"garment_name":"Maxi Dress","issue_name":"Uneven"},
  {"garment_name":"Maxi Dress","issue_name":"Small"},
  {"garment_name":"Maxi Dress","issue_name":"Broken"},
  {"garment_name":"Maxi Dress","issue_name":"Short"},
  {"garment_name":"Maxi Dress","issue_name":"Long"},
  {"garment_name":"Office Wear","issue_name":"Broken"},
  {"garment_name":"Office Wear","issue_name":"Uneven"},
  {"garment_name":"Office Wear","issue_name":"Tight"},
  {"garment_name":"Office Wear","issue_name":"High"},
  {"garment_name":"Office Wear","issue_name":"Long"},
  {"garment_name":"Office Wear","issue_name":"Loose"},
  {"garment_name":"Palazzo","issue_name":"Small"},
  {"garment_name":"Palazzo","issue_name":"Uneven"},
  {"garment_name":"Palazzo","issue_name":"Short"},
  {"garment_name":"Palazzo","issue_name":"Broken"},
  {"garment_name":"Palazzo","issue_name":"Thick"},
  {"garment_name":"Palazzo","issue_name":"Loose"},
  {"garment_name":"Pattu Pavadai","issue_name":"Broken"},
  {"garment_name":"Pattu Pavadai","issue_name":"Uneven"},
  {"garment_name":"Pattu Pavadai","issue_name":"Long"},
  {"garment_name":"Pattu Pavadai","issue_name":"Tight"},
  {"garment_name":"Pattu Pavadai","issue_name":"Loose"},
  {"garment_name":"Pattu Pavadai","issue_name":"Short"},
  {"garment_name":"Sharara","issue_name":"Loose"},
  {"garment_name":"Sharara","issue_name":"Uneven"},
  {"garment_name":"Sharara","issue_name":"Long"},
  {"garment_name":"Sharara","issue_name":"Broken"},
  {"garment_name":"Sharara","issue_name":"Small"},
  {"garment_name":"Sharara","issue_name":"Tight"},
  {"garment_name":"Shirt","issue_name":"Uneven"},
  {"garment_name":"Shirt","issue_name":"Small"},
  {"garment_name":"Shirt","issue_name":"Tight"},
  {"garment_name":"Shirt","issue_name":"Low"},
  {"garment_name":"Shirt","issue_name":"Twisted"},
  {"garment_name":"Shirt","issue_name":"Open"},
  {"garment_name":"Trouser","issue_name":"Tight"},
  {"garment_name":"Trouser","issue_name":"Loose"},
  {"garment_name":"Trouser","issue_name":"Short"},
  {"garment_name":"Trouser","issue_name":"Long"},
  {"garment_name":"Trouser","issue_name":"Uneven"}
]
$expected$::jsonb;
  v_expected_count integer;
  v_expected_distinct_count integer;
  v_invalid_garments text[];
  v_invalid_associations text[];
begin
  select count(*)
    into v_expected_count
  from jsonb_to_recordset(v_expected)
    as expected(garment_name text, issue_name text);

  select count(*)
    into v_expected_distinct_count
  from (
    select expected.garment_name, expected.issue_name
    from jsonb_to_recordset(v_expected)
      as expected(garment_name text, issue_name text)
    group by expected.garment_name, expected.issue_name
  ) as distinct_expected;

  if v_expected_count <> 112
    or v_expected_distinct_count <> v_expected_count then
    raise exception using
      errcode = 'P0001',
      message = 'FixFit alteration seed must contain exactly 112 unique associations.';
  end if;

  select coalesce(
    array_agg(
      format('%s (%s active matches)', garment_name, active_matches)
      order by garment_name
    ),
    '{}'::text[]
  )
    into v_invalid_garments
  from (
    with expected_garments as (
      select distinct expected.garment_name
      from jsonb_to_recordset(v_expected)
        as expected(garment_name text, issue_name text)
    )
    select
      expected_garments.garment_name,
      count(garment_type.id) as active_matches
    from expected_garments
    left join public.garment_types as garment_type
      on garment_type.name = expected_garments.garment_name
      and garment_type.is_active
    group by expected_garments.garment_name
  ) as garment_matches
  where active_matches <> 1;

  if cardinality(v_invalid_garments) > 0 then
    raise exception using
      errcode = 'P0001',
      message = format(
        'FixFit alteration seed requires exactly one active garment type per name: %s',
        array_to_string(v_invalid_garments, ', ')
      );
  end if;

  insert into public.issues (
    garment_type_id,
    name,
    category,
    allows_multiple_options,
    is_active
  )
  select
    garment_type.id,
    expected.issue_name,
    'alteration',
    false,
    true
  from jsonb_to_recordset(v_expected)
    as expected(garment_name text, issue_name text)
  join public.garment_types as garment_type
    on garment_type.name = expected.garment_name
    and garment_type.is_active
  on conflict (garment_type_id, name, category) do nothing;

  select coalesce(
    array_agg(
      format(
        '%s / %s (%s active issue matches)',
        garment_name,
        issue_name,
        active_matches
      )
      order by garment_name, issue_name
    ),
    '{}'::text[]
  )
    into v_invalid_associations
  from (
    select
      expected.garment_name,
      expected.issue_name,
      count(issue.id) as active_matches
    from jsonb_to_recordset(v_expected)
      as expected(garment_name text, issue_name text)
    join public.garment_types as garment_type
      on garment_type.name = expected.garment_name
      and garment_type.is_active
    left join public.issues as issue
      on issue.garment_type_id = garment_type.id
      and issue.name = expected.issue_name
      and issue.category = 'alteration'
      and issue.is_active
    group by expected.garment_name, expected.issue_name
  ) as association_matches
  where active_matches <> 1;

  if cardinality(v_invalid_associations) > 0 then
    raise exception using
      errcode = 'P0001',
      message = format(
        'FixFit alteration seed failed to verify active issue associations: %s',
        array_to_string(v_invalid_associations, ', ')
      );
  end if;
end;
$$;
