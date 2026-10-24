-- FixFit verified catalog seed.
--
-- Source of truth: lib/estimator-data.ts (19 garments, 143 guide issues,
-- 467 options) and the published price menu in
-- fixfit-platform-final-version.html. All source catalog entries are active;
-- the source contains no inactive entries.
--
-- This migration seeds catalog data only. It does not create customer,
-- address, order, or photo data and does not alter RLS or client privileges.

insert into public.service_tiers (
  code,
  name,
  turnaround_label,
  display_rank,
  starting_price,
  maximum_price,
  is_active
)
values
  ('spot', 'SpotFix', 'Up to 30 minutes', 1, 199, 299, true),
  ('quick', 'QuickFix', '2–3 hours', 2, 350, 599, true),
  ('schedule', 'ScheduleFix', 'Same/next day', 3, 599, 999, true)
on conflict (code) do update
set
  name = excluded.name,
  turnaround_label = excluded.turnaround_label,
  display_rank = excluded.display_rank,
  starting_price = excluded.starting_price,
  maximum_price = excluded.maximum_price,
  is_active = excluded.is_active,
  updated_at = timezone('utc', now());

-- Natural keys make the catalog repeatable: garment_types.slug,
-- issues.(garment_type_id, name, category), and issue_options.(issue_id, name).
do $seed$
declare
  catalog jsonb := $catalog$[{"slug":"blouse","name":"Blouse","issues":[{"name":"Sleeveless","category":"enhancement","allows_multiple_options":false,"options":["Wing sleeve","Gathered sleeve","Puff sleeve","Cap sleeve"]},{"name":"Short Sleeve","category":"enhancement","allows_multiple_options":false,"options":["Bell sleeve","Flared sleeve","Gathered sleeve"]},{"name":"Tight Sleeve","category":"enhancement","allows_multiple_options":false,"options":["Flared sleeve","Bell sleeve","Gathered sleeve"]},{"name":"Damaged Sleeve","category":"replacement","allows_multiple_options":false,"options":["Puff sleeve","Bell sleeve","Gathered sleeve"]},{"name":"Deep Neck","category":"enhancement","allows_multiple_options":false,"options":["Yoke","Neck panel","Lace panel"]},{"name":"Wide Neck","category":"enhancement","allows_multiple_options":false,"options":["Yoke","Piping","Lace border"]},{"name":"Deep Back","category":"enhancement","allows_multiple_options":false,"options":["Back panel","Net panel","Sheer panel"]},{"name":"Backless","category":"enhancement","allows_multiple_options":false,"options":["Net back","Sheer panel","Fabric back panel"]},{"name":"Damaged Front","category":"replacement","allows_multiple_options":false,"options":["New front panel","Embroidered panel","Appliqué panel"]},{"name":"Damaged Back","category":"replacement","allows_multiple_options":false,"options":["New back panel","Embroidered panel","Net panel"]},{"name":"Old Lining","category":"replacement","allows_multiple_options":false,"options":["Cotton lining","Satin lining","Breathable lining"]},{"name":"Missing Padding","category":"replacement","allows_multiple_options":false,"options":["Foam padding","Removable cups","Padded cups"]},{"name":"Plain Blouse","category":"enhancement","allows_multiple_options":true,"options":["Tassels","Latkans","Lace","Embroidery","Embellishments"]},{"name":"Missing Tassels","category":"replacement","allows_multiple_options":false,"options":["Fabric tassels","Latkans","Pom-poms"]},{"name":"Missing Border","category":"replacement","allows_multiple_options":false,"options":["Lace","Zari border","Piping","Fabric border"]},{"name":"Missing Hooks","category":"replacement","allows_multiple_options":false,"options":["Hook-and-eye","Fabric-covered hooks"]},{"name":"Damaged Zip","category":"replacement","allows_multiple_options":false,"options":["Concealed zip","Side zip","Back zip"]},{"name":"Missing Buttons","category":"replacement","allows_multiple_options":false,"options":["Fabric buttons","Decorative buttons","Covered buttons"]},{"name":"Shoulder Too Narrow","category":"enhancement","allows_multiple_options":false,"options":["Shoulder panel","Sleeve attachment","Fabric extension"]},{"name":"Bust Coverage Needed","category":"enhancement","allows_multiple_options":false,"options":["Yoke","Modesty panel","Inner panel"]},{"name":"Blouse Too Plain","category":"enhancement","allows_multiple_options":true,"options":["Cutwork","Embroidery","Lace","Appliqué","Handwork"]},{"name":"Dori Missing","category":"replacement","allows_multiple_options":false,"options":["Fabric dori","Braided dori","Beaded dori","Tassel dori"]},{"name":"Dori Damaged","category":"replacement","allows_multiple_options":false,"options":["New dori","Braided dori","Embellished dori"]}]},{"slug":"dress","name":"Dress","issues":[{"name":"Neckline Too Deep","category":"enhancement","allows_multiple_options":false,"options":["Neck insert","Keyhole closure","Lace-up neckline","Modesty panel"]},{"name":"Neckline Damaged","category":"replacement","allows_multiple_options":false,"options":["Neck facing","New neckline panel","Piping finish"]},{"name":"Shoulder Too Open","category":"enhancement","allows_multiple_options":false,"options":["Shoulder straps","Shoulder extension","Decorative straps"]},{"name":"Strap Damaged","category":"replacement","allows_multiple_options":false,"options":["Replace straps","Adjustable straps","Tie-up straps"]},{"name":"Bust Area Too Tight","category":"enhancement","allows_multiple_options":false,"options":["Bust panel","Princess-panel adjustment","Side gusset"]},{"name":"Waist Too Loose","category":"enhancement","allows_multiple_options":false,"options":["Waist darts","Waist ties","Elastic insert","Belt"]},{"name":"Skirt Too Straight","category":"enhancement","allows_multiple_options":false,"options":["Godets","Gore panels","Circular flare"]},{"name":"Dress Too Short","category":"enhancement","allows_multiple_options":false,"options":["Tier extension","Contrast hem","Ruffle extension"]},{"name":"Side Seam Damaged","category":"replacement","allows_multiple_options":false,"options":["Side panel","Seam reinforcement","New side section"]},{"name":"Hem Damaged","category":"replacement","allows_multiple_options":false,"options":["New hem facing","Lace finish","Ruffle hem"]},{"name":"Plain Dress","category":"enhancement","allows_multiple_options":true,"options":["Ruffles","Pleats","Smocking","Appliqué","Embroidery"]},{"name":"Missing Belt","category":"replacement","allows_multiple_options":false,"options":["Fabric belt","Tie belt","Waist sash","Corset belt"]},{"name":"Missing Pockets","category":"replacement","allows_multiple_options":false,"options":["In-seam pocket","Patch pocket","Hidden pocket"]},{"name":"Dress Damaged","category":"replacement","allows_multiple_options":false,"options":["Panel replacement","Section reconstruction","Fabric patching"]}]},{"slug":"gown","name":"Gown","issues":[{"name":"Sleeveless","category":"enhancement","allows_multiple_options":false,"options":["Wing sleeve","Cap sleeve","Gathered sleeve","Puff sleeve"]},{"name":"Deep Neck","category":"enhancement","allows_multiple_options":false,"options":["Yoke","Neck panel","Lace panel"]},{"name":"Deep Back","category":"enhancement","allows_multiple_options":false,"options":["Back panel","Net panel","Sheer panel"]},{"name":"Damaged Gown","category":"replacement","allows_multiple_options":false,"options":["Panel replacement","Lining replacement","Partial reconstruction"]},{"name":"Plain Gown","category":"enhancement","allows_multiple_options":true,"options":["Lace","Embroidery","Appliqué","Sequins","Embellishments"]},{"name":"Missing Border","category":"replacement","allows_multiple_options":false,"options":["Lace","Zari border","Sequin border","Fabric border"]},{"name":"Dori Missing","category":"replacement","allows_multiple_options":false,"options":["Fabric dori","Braided dori","Beaded dori","Tassel dori"]},{"name":"Missing Zip","category":"replacement","allows_multiple_options":false,"options":["Concealed zip","Back zip","Side zip"]},{"name":"Missing Hooks / Buttons","category":"replacement","allows_multiple_options":false,"options":["Hook-and-eye","Fabric buttons","Decorative buttons"]}]},{"slug":"kurti","name":"Kurti","issues":[{"name":"Neck Design Change Required","category":"enhancement","allows_multiple_options":true,"options":["Round neck","V-neck","Keyhole neck","Boat neck"]},{"name":"Placket Required","category":"enhancement","allows_multiple_options":false,"options":["Button placket","Loop placket","Concealed placket"]},{"name":"Buttons Missing","category":"replacement","allows_multiple_options":false,"options":["Fabric buttons","Wooden buttons","Decorative buttons"]},{"name":"Sleeve Style Change Required","category":"enhancement","allows_multiple_options":false,"options":["Bell sleeve","Flared sleeve","Bishop sleeve","3/4 sleeve"]},{"name":"Side Slit Required","category":"enhancement","allows_multiple_options":false,"options":["Straight slit","Curved slit","High slit"]},{"name":"Pocket Required","category":"enhancement","allows_multiple_options":false,"options":["Side pocket","Patch pocket","Hidden pocket"]},{"name":"Dupatta Required","category":"enhancement","allows_multiple_options":false,"options":["Matching dupatta","Contrast dupatta","Printed dupatta"]},{"name":"Plain Kurti","category":"enhancement","allows_multiple_options":true,"options":["Embroidery","Gota work","Appliqué","Lace detailing"]},{"name":"Kurti Damaged","category":"replacement","allows_multiple_options":false,"options":["Panel replacement","Section replacement","Fabric replacement"]}]},{"slug":"lehenga","name":"Lehenga","issues":[{"name":"Plain Lehenga","category":"enhancement","allows_multiple_options":true,"options":["Embroidery","Lace","Tassels","Appliqué","Embellishments"]},{"name":"Damaged Lehenga","category":"replacement","allows_multiple_options":false,"options":["Panel replacement","Border replacement","Partial reconstruction"]},{"name":"Missing Border","category":"replacement","allows_multiple_options":false,"options":["Zari border","Lace","Fabric border","Sequin border"]},{"name":"Missing Tassels","category":"replacement","allows_multiple_options":false,"options":["Fabric tassels","Latkans","Pom-poms","Beaded tassels"]},{"name":"Missing Can-Can","category":"replacement","allows_multiple_options":false,"options":["Add can-can for more flare/volume"]},{"name":"Missing Hooks","category":"replacement","allows_multiple_options":false,"options":["Hook-and-eye","Extra hooks"]},{"name":"Damaged Zip","category":"replacement","allows_multiple_options":false,"options":["Replace with concealed/side zip"]},{"name":"Dupatta Missing","category":"replacement","allows_multiple_options":false,"options":["Add matching/contrast dupatta"]},{"name":"Heavy Lehenga Feels Uncomfortable","category":"enhancement","allows_multiple_options":false,"options":["Change/add lighter lining","Modify layers"]}]},{"slug":"jeans","name":"Jeans","issues":[{"name":"Waistband Damaged","category":"replacement","allows_multiple_options":false,"options":["New waistband","Contrast waistband","Elastic waistband"]},{"name":"Button Missing","category":"replacement","allows_multiple_options":false,"options":["Jeans button","Metal button","Snap button"]},{"name":"Zip Damaged","category":"replacement","allows_multiple_options":false,"options":["Metal zip","Concealed zip","Replacement zip"]},{"name":"Pocket Damaged","category":"replacement","allows_multiple_options":false,"options":["Replace pocket","New pocket bag","Patch pocket"]},{"name":"Knee Area Damaged","category":"replacement","allows_multiple_options":false,"options":["Denim patch","Contrast patch","Embroidery"]},{"name":"Hem Damaged","category":"replacement","allows_multiple_options":false,"options":["Raw hem","Frayed hem","Cuffed hem"]},{"name":"Plain Jeans","category":"enhancement","allows_multiple_options":true,"options":["Embroidery","Appliqué","Studs","Patchwork"]}]},{"slug":"shirt","name":"Shirt","issues":[{"name":"Collar Missing","category":"replacement","allows_multiple_options":false,"options":["Mandarin collar","Band collar","Peter Pan collar"]},{"name":"Collar Damaged","category":"replacement","allows_multiple_options":false,"options":["Replace collar","Contrast collar","Printed collar"]},{"name":"Cuff Missing","category":"replacement","allows_multiple_options":false,"options":["Button cuff","French cuff","Folded cuff"]},{"name":"Button Missing","category":"replacement","allows_multiple_options":false,"options":["Wooden button","Metal button","Pearl button"]},{"name":"Pocket Missing","category":"replacement","allows_multiple_options":false,"options":["Patch pocket","Flap pocket","Welt pocket"]},{"name":"Plain Shirt","category":"enhancement","allows_multiple_options":true,"options":["Embroidery","Patchwork","Appliqué","Pintucks"]},{"name":"Shirt Damaged","category":"replacement","allows_multiple_options":false,"options":["Panel replacement","Collar replacement","Cuff replacement"]}]},{"slug":"trouser","name":"Trouser","issues":[{"name":"Waistband Change Required","category":"enhancement","allows_multiple_options":false,"options":["Plain waistband","Extended waistband","Contrast waistband"]},{"name":"Belt Loops Missing","category":"replacement","allows_multiple_options":false,"options":["Add belt loops","Wide belt loops","Contrast belt loops"]},{"name":"Zip Damaged","category":"replacement","allows_multiple_options":false,"options":["Concealed zip","Metal zip","Nylon zip"]},{"name":"Pocket Required","category":"enhancement","allows_multiple_options":false,"options":["Side pocket","Welt pocket","Back pocket"]},{"name":"Cuff Required","category":"enhancement","allows_multiple_options":false,"options":["Turn-up cuff","Plain cuff","Contrast cuff"]},{"name":"Lining Required","category":"enhancement","allows_multiple_options":false,"options":["Half lining","Full lining","Soft inner lining"]}]},{"slug":"jacket","name":"Jacket","issues":[{"name":"Collar Missing","category":"replacement","allows_multiple_options":false,"options":["Stand collar","Shawl collar","Lapel collar"]},{"name":"Button Missing","category":"replacement","allows_multiple_options":false,"options":["Metal button","Wooden button","Fabric-covered button"]},{"name":"Zip Damaged","category":"replacement","allows_multiple_options":false,"options":["Metal zip","Nylon zip","Decorative zip"]},{"name":"Pocket Missing","category":"replacement","allows_multiple_options":false,"options":["Patch pocket","Flap pocket","Welt pocket"]},{"name":"Lining Missing","category":"replacement","allows_multiple_options":false,"options":["Full lining","Half lining","Quilted lining"]},{"name":"Plain Jacket","category":"enhancement","allows_multiple_options":true,"options":["Embroidery","Patchwork","Studs","Appliqué"]},{"name":"Jacket Damaged","category":"replacement","allows_multiple_options":false,"options":["Panel replacement","Collar replacement","Sleeve replacement"]}]},{"slug":"gharara","name":"Gharara","issues":[{"name":"Ghera Less","category":"enhancement","allows_multiple_options":false,"options":["Gore panels","Flare panels","Extra kalis"]},{"name":"Kali Damaged","category":"replacement","allows_multiple_options":false,"options":["Replace kali","Matching fabric kali","Contrast kali"]},{"name":"Can-Can Missing","category":"replacement","allows_multiple_options":false,"options":["Add can-can","Double can-can","Layered can-can"]},{"name":"Waist Dori Missing","category":"replacement","allows_multiple_options":false,"options":["Fabric dori","Braided dori","Beaded dori"]},{"name":"Border Missing","category":"replacement","allows_multiple_options":false,"options":["Zari border","Lace border","Sequin border"]},{"name":"Plain Ghagra","category":"enhancement","allows_multiple_options":true,"options":["Embroidery","Gota patti","Sequins","Appliqué","Beadwork"]},{"name":"Ghagra Damaged","category":"replacement","allows_multiple_options":false,"options":["Kali replacement","Panel replacement","Fabric replacement"]}]},{"slug":"sharara","name":"Sharara","issues":[{"name":"Ghera Missing","category":"replacement","allows_multiple_options":false,"options":["Add flare panels","Godet panels","Extra kali"]},{"name":"Bottom Border Missing","category":"replacement","allows_multiple_options":false,"options":["Lace","Gota","Zari border","Sequin border"]},{"name":"Waistband Missing","category":"replacement","allows_multiple_options":false,"options":["Fabric waistband","Zari waistband","Contrast waistband"]},{"name":"Tassel Missing","category":"replacement","allows_multiple_options":false,"options":["Fabric tassel","Beaded tassel","Latkan"]},{"name":"Plain Sharara","category":"enhancement","allows_multiple_options":true,"options":["Gota work","Embroidery","Sequins","Beadwork"]},{"name":"Dupatta Missing","category":"replacement","allows_multiple_options":false,"options":["Matching dupatta","Contrast dupatta","Embellished dupatta"]}]},{"slug":"maxi-dress","name":"Maxi Dress","issues":[{"name":"Sleeveless","category":"enhancement","allows_multiple_options":false,"options":["Cape sleeve","Cold-shoulder sleeve","Bishop sleeve","Flutter sleeve"]},{"name":"Deep Neck","category":"enhancement","allows_multiple_options":false,"options":["Illusion net panel","Sweetheart insert","High-neck yoke"]},{"name":"Damaged Maxi Dress","category":"replacement","allows_multiple_options":false,"options":["Panel replacement","Bodice replacement","Partial reconstruction"]},{"name":"Plain Maxi Dress","category":"enhancement","allows_multiple_options":true,"options":["Ruffles","Pleats","Appliqué","Beadwork","Embroidery"]},{"name":"Missing Zip","category":"replacement","allows_multiple_options":false,"options":["Invisible zip","Side zip","Back zip"]},{"name":"Missing Pockets","category":"replacement","allows_multiple_options":false,"options":["Side-seam pockets","Hidden pockets"]}]},{"slug":"bodycon-dress","name":"Bodycon Dress","issues":[{"name":"Neckline Change Required","category":"enhancement","allows_multiple_options":false,"options":["Sweetheart neck","Square neck","One-shoulder","Halter neck"]},{"name":"Sleeve Addition Required","category":"enhancement","allows_multiple_options":false,"options":["Off-shoulder sleeve","One-side sleeve","Mesh sleeve","Long sleeve"]},{"name":"Back Closure Missing","category":"replacement","allows_multiple_options":false,"options":["Concealed zip","Hook closure","Lace-up closure"]},{"name":"Slit Required","category":"enhancement","allows_multiple_options":false,"options":["Side slit","Front slit","Back slit"]},{"name":"Plain Bodycon Dress","category":"enhancement","allows_multiple_options":true,"options":["Ruching","Draping","Sequins","Embroidery","Appliqué"]}]},{"slug":"jumpsuit","name":"Jumpsuit","issues":[{"name":"Shoulder Strap Missing","category":"replacement","allows_multiple_options":false,"options":["Adjustable strap","Tie-up strap","Fabric strap"]},{"name":"Waist Belt Missing","category":"replacement","allows_multiple_options":false,"options":["Fabric belt","Tie belt","Sash belt"]},{"name":"Front Closure Missing","category":"replacement","allows_multiple_options":false,"options":["Button closure","Zip closure","Hook closure"]},{"name":"Side Pocket Missing","category":"replacement","allows_multiple_options":false,"options":["Side pocket","Cargo pocket","Patch pocket"]},{"name":"Jumpsuit Too Plain","category":"enhancement","allows_multiple_options":true,"options":["Ruffles","Pleats","Lace","Embroidery","Embellishments"]},{"name":"Jumpsuit Damaged","category":"replacement","allows_multiple_options":false,"options":["Panel replacement","Section replacement","Fabric replacement"]}]},{"slug":"kaftan","name":"Kaftan","issues":[{"name":"Sleeveless","category":"enhancement","allows_multiple_options":false,"options":["Wing sleeve","Bell sleeve","Batwing sleeve"]},{"name":"Damaged Kaftan","category":"replacement","allows_multiple_options":false,"options":["Panel replacement","Fabric replacement","Partial reconstruction"]},{"name":"Plain Kaftan","category":"enhancement","allows_multiple_options":true,"options":["Embroidery","Lace","Appliqué","Sequins","Embellishments"]},{"name":"Missing Border","category":"replacement","allows_multiple_options":false,"options":["Lace","Zari border","Sequin border","Fabric border"]},{"name":"Missing Zip","category":"replacement","allows_multiple_options":false,"options":["Concealed zip","Side zip","Back zip"]}]},{"slug":"palazzo","name":"Palazzo","issues":[{"name":"Plain Palazzo","category":"enhancement","allows_multiple_options":true,"options":["Lace","Embroidery","Border","Appliqué"]},{"name":"Damaged Panel","category":"replacement","allows_multiple_options":false,"options":["New panel","Matching fabric panel","Contrast panel"]},{"name":"Missing Border","category":"replacement","allows_multiple_options":false,"options":["Lace","Zari border","Fabric border","Sequin border"]},{"name":"Missing Pockets","category":"replacement","allows_multiple_options":false,"options":["Side pockets","Patch pockets"]}]},{"slug":"office-wear","name":"Office Wear","issues":[{"name":"Collar Change Required","category":"enhancement","allows_multiple_options":false,"options":["Mandarin collar","Band collar","Shirt collar"]},{"name":"Buttons Missing","category":"replacement","allows_multiple_options":false,"options":["Fabric buttons","Pearl buttons","Metal buttons"]},{"name":"Sleeve Style Change Required","category":"enhancement","allows_multiple_options":false,"options":["3/4 sleeve","Bell sleeve","Bishop sleeve","Roll-up sleeve"]},{"name":"Pocket Required","category":"enhancement","allows_multiple_options":false,"options":["Welt pocket","Patch pocket","Side pocket"]},{"name":"Plain Office Wear","category":"enhancement","allows_multiple_options":true,"options":["Piping","Minimal embroidery","Appliqué","Fabric buttons"]}]},{"slug":"dhoti-pants","name":"Dhoti Pants","issues":[{"name":"Dori Missing","category":"replacement","allows_multiple_options":false,"options":["Fabric dori","Braided dori","Beaded dori"]},{"name":"Waistband Missing","category":"replacement","allows_multiple_options":false,"options":["Fabric waistband","Embroidered waistband","Contrast waistband"]},{"name":"Pocket Missing","category":"replacement","allows_multiple_options":false,"options":["Side pocket","Patch pocket","Hidden pocket"]},{"name":"Embroidery Missing/Damaged","category":"replacement","allows_multiple_options":false,"options":["Embroidery","Gota work","Appliqué","Beadwork"]}]},{"slug":"pattu-pavadai","name":"Pattu Pavadai","issues":[{"name":"Border Missing","category":"replacement","allows_multiple_options":false,"options":["Zari border","Temple border","Contrast border"]},{"name":"Tassel Missing","category":"replacement","allows_multiple_options":false,"options":["Silk tassel","Beaded tassel","Fabric tassel"]},{"name":"Waistband Missing","category":"replacement","allows_multiple_options":false,"options":["Silk waistband","Zari waistband","Contrast waistband"]},{"name":"Plain Pavadai","category":"enhancement","allows_multiple_options":true,"options":["Gota patti","Zari work","Embroidery","Beadwork"]}]}]$catalog$::jsonb;
begin
  insert into public.garment_types (slug, name, is_active)
  select
    garment ->> 'slug',
    garment ->> 'name',
    true
  from jsonb_array_elements(catalog) as garment
  on conflict (slug) do update
  set
    name = excluded.name,
    is_active = excluded.is_active,
    updated_at = timezone('utc', now());

  with issue_source as (
    select
      garment ->> 'slug' as garment_slug,
      issue ->> 'name' as name,
      issue ->> 'category' as category,
      (issue ->> 'allows_multiple_options')::boolean as allows_multiple_options
    from jsonb_array_elements(catalog) as garment
    cross join lateral jsonb_array_elements(garment -> 'issues') as issue
  )
  insert into public.issues (
    garment_type_id,
    name,
    category,
    allows_multiple_options,
    is_active
  )
  select
    garment_types.id,
    issue_source.name,
    issue_source.category,
    issue_source.allows_multiple_options,
    true
  from issue_source
  join public.garment_types
    on garment_types.slug = issue_source.garment_slug
  on conflict (garment_type_id, name, category) do update
  set
    allows_multiple_options = excluded.allows_multiple_options,
    is_active = excluded.is_active,
    updated_at = timezone('utc', now());

  with option_source as (
    select
      garment ->> 'slug' as garment_slug,
      issue ->> 'name' as issue_name,
      issue ->> 'category' as issue_category,
      option_value.value #>> '{}' as name,
      option_value.ordinality::smallint as display_rank
    from jsonb_array_elements(catalog) as garment
    cross join lateral jsonb_array_elements(garment -> 'issues') as issue
    cross join lateral jsonb_array_elements(issue -> 'options') with ordinality
      as option_value(value, ordinality)
  )
  insert into public.issue_options (issue_id, name, display_rank, is_active)
  select
    issues.id,
    option_source.name,
    option_source.display_rank,
    true
  from option_source
  join public.garment_types
    on garment_types.slug = option_source.garment_slug
  join public.issues
    on issues.garment_type_id = garment_types.id
    and issues.name = option_source.issue_name
    and issues.category = option_source.issue_category
  on conflict (issue_id, name) do update
  set
    display_rank = excluded.display_rank,
    is_active = excluded.is_active,
    updated_at = timezone('utc', now());
end;
$seed$;

-- The schema has no garment/issue foreign key for published price-menu rows,
-- so labels retain the exact verified menu wording. Every menu value is a
-- starting anchor; no exact post-assessment price is seeded.
insert into public.pricing_rules (
  code,
  rule_type,
  label,
  amount,
  service_tier_id,
  applies_per_garment,
  is_estimate,
  is_active
)
select
  pricing.code,
  pricing.rule_type,
  pricing.label,
  pricing.amount,
  service_tiers.id,
  pricing.applies_per_garment,
  pricing.is_estimate,
  true
from (
  values
    ('visit-booking-fee', 'booking_fee', 'Visit booking fee (credited against final bill)', 99, null::text, false, false),
    ('per-qualifying-garment-rush-fee', 'rush_fee', 'Rush fee per qualifying garment', 99, null::text, true, false),
    ('button-starting-price', 'starting_price', 'Button', 99, 'spot', false, true),
    ('hook-starting-price', 'starting_price', 'Hook', 99, 'spot', false, true),
    ('small-seam-starting-price', 'starting_price', 'Small seam', 149, 'spot', false, true),
    ('hem-shortening-starting-price', 'starting_price', 'Hem shortening', 249, 'quick', false, true),
    ('zip-replacement-starting-price', 'starting_price', 'Zip replacement', 299, 'quick', false, true),
    ('blouse-alteration-starting-price', 'starting_price', 'Blouse alteration', 599, 'schedule', false, true),
    ('saree-fall-edging-starting-price', 'starting_price', 'Saree fall / edging', 349, 'quick', false, true),
    ('dress-alteration-starting-price', 'starting_price', 'Dress alteration', 499, 'schedule', false, true),
    ('waist-adjustment-starting-price', 'starting_price', 'Waist adjustment', 249, 'quick', false, true),
    ('sleeve-shortening-starting-price', 'starting_price', 'Sleeve shortening', 199, 'quick', false, true)
) as pricing(
  code,
  rule_type,
  label,
  amount,
  service_tier_code,
  applies_per_garment,
  is_estimate
)
left join public.service_tiers
  on service_tiers.code = pricing.service_tier_code
on conflict (code) do update
set
  rule_type = excluded.rule_type,
  label = excluded.label,
  amount = excluded.amount,
  service_tier_id = excluded.service_tier_id,
  applies_per_garment = excluded.applies_per_garment,
  is_estimate = excluded.is_estimate,
  is_active = excluded.is_active,
  updated_at = timezone('utc', now());

