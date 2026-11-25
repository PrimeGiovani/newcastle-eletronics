-- Only needed if you ALREADY ran seed.sql before 25 Nov 2026.
-- Corrects NC 18CFIN/GT from "Gold" to "Rose Gold". Safe to run more than once.
update public.products set
  name = 'Newcastle 2 Tons Inverter Round Standing AC – Rose Gold (NC 18CFIN/GT)',
  short_description = '2 Tons inverter floor-standing (round) air conditioner in rose gold.',
  description = '2 Tons inverter floor-standing (round) air conditioner in rose gold. Designed and manufactured by Newcastle — over 30 years of trusted electronics for Nigerian homes and businesses.',
  highlights = array['2 Tons cooling capacity', 'Inverter compressor for lower power use', 'Floor-standing (round)', 'Rose Gold finish']::text[],
  specs = '{"Capacity": "2 Tons", "Type": "Floor-standing (round)", "Compressor": "Inverter", "Colour": "Rose Gold", "Model": "NC 18CFIN/GT"}'::jsonb
where sku = 'NC-18CFIN-GT';

update public.product_images set url = replace(url, 'ac-round-gold', 'ac-round-rosegold')
where product_id = (select id from public.products where sku = 'NC-18CFIN-GT');

update public.categories set image_url = replace(image_url, 'ac-round-gold', 'ac-round-rosegold') where slug = 'standing-units';
