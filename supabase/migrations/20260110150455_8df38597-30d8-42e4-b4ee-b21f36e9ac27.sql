-- Ajouter les colonnes family_fr, sub_family_fr, world_fr à la table products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS family_fr TEXT,
ADD COLUMN IF NOT EXISTS sub_family_fr TEXT,
ADD COLUMN IF NOT EXISTS world_fr TEXT;

-- Index pour filtrage rapide
CREATE INDEX IF NOT EXISTS idx_products_family_fr ON public.products(family_fr);
CREATE INDEX IF NOT EXISTS idx_products_sub_family_fr ON public.products(sub_family_fr);
CREATE INDEX IF NOT EXISTS idx_products_world_fr ON public.products(world_fr);