
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS variants jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Pré-remplir quelques produits avec galerie + variantes pour démo
UPDATE public.products SET
  images = ARRAY[image_url, 'p-boubou-2.jpg'],
  variants = '[
    {"type":"Taille","options":["S","M","L","XL"]},
    {"type":"Couleur","options":["Or","Bordeaux","Émeraude"]}
  ]'::jsonb
WHERE slug LIKE 'boubou%';

UPDATE public.products SET
  images = ARRAY[image_url, 'p-sac-2.jpg'],
  variants = '[{"type":"Couleur","options":["Noir","Caramel","Beige"]}]'::jsonb
WHERE slug LIKE 'sac%';

UPDATE public.products SET
  images = ARRAY[image_url, 'p-chaussure-2.jpg'],
  variants = '[
    {"type":"Pointure","options":["36","37","38","39","40","41"]},
    {"type":"Couleur","options":["Doré","Noir"]}
  ]'::jsonb
WHERE slug LIKE 'chaussure%';

UPDATE public.products SET
  images = ARRAY[image_url, 'p-bijoux-2.jpg'],
  variants = '[{"type":"Modèle","options":["Petit","Moyen","Grand"]}]'::jsonb
WHERE slug LIKE 'bijou%' OR slug LIKE 'collier%' OR slug LIKE 'boucles%';
