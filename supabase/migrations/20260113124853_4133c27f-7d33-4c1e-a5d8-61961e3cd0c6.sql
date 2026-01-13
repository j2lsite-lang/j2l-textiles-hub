-- Update existing products to extract world_fr from raw_data
-- The world field is an array of objects with language translations
UPDATE products
SET world_fr = (
  SELECT string_agg(world_item->>'fr', ', ')
  FROM jsonb_array_elements(raw_data->'world') AS world_item
  WHERE world_item->>'fr' IS NOT NULL AND world_item->>'fr' != ''
)
WHERE raw_data->'world' IS NOT NULL 
  AND jsonb_typeof(raw_data->'world') = 'array';

-- Also update family_fr and sub_family_fr if they're empty
UPDATE products
SET family_fr = COALESCE(raw_data->'family'->>'fr', family_fr)
WHERE (family_fr IS NULL OR family_fr = '')
  AND raw_data->'family'->>'fr' IS NOT NULL;

UPDATE products
SET sub_family_fr = COALESCE(raw_data->'sub_family'->>'fr', sub_family_fr)
WHERE (sub_family_fr IS NULL OR sub_family_fr = '')
  AND raw_data->'sub_family'->>'fr' IS NOT NULL;