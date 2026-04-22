-- Migration 031: Reemplaza los bodies placeholder de las plantillas seed con
-- el contenido real de los AUTHORIZED_*.txt. Reglas aplicadas al texto fuente:
--
--   1. URL de Facebook (https://www.facebook.com/creator_programs/signup?referral_code=laneta)
--      → {{link}} — así el converter usa el branch_link_url del template
--   2. Se inserta {{qr}} en una línea nueva justo después del bloque "Apply here:"
--   3. Las demás variables se preservan literales. Algunas están en el registry
--      como 'unsupported' ({{max_followers}}, {{username}}, {{main_platforme}},
--      {{vertical}}, {{sender_name}}, {{unsubscribe}}) y el validador (Fase 3)
--      las marcará como errores que Marketing debe resolver.
--
-- Solo actualiza las filas v1 existentes de la migración 030 — no crea versiones
-- nuevas. Idempotente: corre múltiples veces sin efecto adicional.

DO $$
DECLARE
  tpl_intro uuid;
  tpl_friction uuid;
  tpl_social uuid;
BEGIN
  SELECT id INTO tpl_intro    FROM templates WHERE name = 'intro_fast_track';
  SELECT id INTO tpl_friction FROM templates WHERE name = 'friction_removal';
  SELECT id INTO tpl_social   FROM templates WHERE name = 'social_proof';

  -- ── intro_fast_track ──────────────────────────────────────────
  IF tpl_intro IS NOT NULL THEN
    UPDATE template_versions
       SET body_plain = E'Hey {{first_name}},\n' ||
                        E'\n' ||
                        E'You''ve put real effort into building a community of over {{max_followers}} followers on @{{username}}. Your {{main_platforme}} is clearly your home base, but Meta is willing to pay you to expand from there.\n' ||
                        E'\n' ||
                        E'Bring your existing {{vertical}} content to Facebook, post 15 reels a month and earn $3K-$9K over a period of 3 months as part of their new Creator Fast Track Program. No new content needed, no engagement minimums.\n' ||
                        E'\n' ||
                        E'Apply to the program directly through the Facebook app by clicking the link below (mobile only), and start your path to Creator Fast Track.\n' ||
                        E'\n' ||
                        E'Apply here:\n' ||
                        E'{{link}}\n' ||
                        E'\n' ||
                        E'{{qr}}\n' ||
                        E'\n' ||
                        E'Important: You must apply through your mobile device. The application is completed through the Facebook app.\n' ||
                        E'\n' ||
                        E'How it works\n' ||
                        E'\n' ||
                        E'Post 15 Reels on Facebook across 10+ days per month and get a fixed monthly payout. No view counts to hit, no engagement minimums, and no new content needed. This is how your secured payout breaks down:\n' ||
                        E'\n' ||
                        E'100K to 999K followers: $3K secured* ($1K/month for 3 months)\n' ||
                        E'1M+ followers: $9K secured* ($3K/month for 3 months)\n' ||
                        E'\n' ||
                        E'*Payment secured when program terms are met.\n' ||
                        E'\n' ||
                        E'Who are we?\n' ||
                        E'\n' ||
                        E'ELEVN, powered by La Neta.\n' ||
                        E'\n' ||
                        E'With over 10 years of experience working with creators, top brands, and the biggest platforms in the world, La Neta built ELEVN to be the creator platform that actually delivers. A place that connects you with the right monetization opportunities, gives you access to free courses and live sessions, and puts you inside a community of creators who are on the same journey.\n' ||
                        E'\n' ||
                        E'Creator Fast Track is one of those opportunities. And whether you qualify for it or not, ELEVN will keep working for you, connecting you with the right programs, the right people, and the right next step for where you are right now.\n' ||
                        E'\n' ||
                        E'Have any questions? Just reply to this email and one of our experts will get back to you. Can''t wait to work together.\n' ||
                        E'\n' ||
                        E'Thanks,\n' ||
                        E'{{sender_name}}\n' ||
                        E'ELEVN\n' ||
                        E'\n' ||
                        E'ELEVN | Powered by La Neta\n' ||
                        E'174 Nassau St. Ste 341 Princeton NJ 08542 United States\n' ||
                        E'\n' ||
                        E'You received this email because your public creator profile meets the eligibility criteria for the Meta Creator Fast Track program.\n' ||
                        E'\n' ||
                        E'Unsubscribe: {{unsubscribe}}\n' ||
                        E'Terms: https://laneta-portal.netlify.app/opportunities/meta-fast-track/terms',
           commit_message = 'Seed real: AUTHORIZED_intro_fast_track.txt con {{link}}/{{qr}}'
     WHERE template_id = tpl_intro AND version = 1;
  END IF;

  -- ── friction_removal ──────────────────────────────────────────
  IF tpl_friction IS NOT NULL THEN
    UPDATE template_versions
       SET body_plain = E'Hi {{first_name}},\n' ||
                        E'\n' ||
                        E'One thing keeps coming up when creators read about Meta''s Creator Fast Track program. So we wanted to address it directly before it holds you back:\n' ||
                        E'\n' ||
                        E'You don''t need to create anything new for Facebook.\n' ||
                        E'\n' ||
                        E'The strategy is simple repurposing. Creators seeing the strongest early results on Meta''s Creator Fast Track program are taking videos they already posted on TikTok, removing the watermark, and reposting them natively to Facebook Reels.\n' ||
                        E'\n' ||
                        E'That''s it.\n' ||
                        E'\n' ||
                        E'This means:\n' ||
                        E'- No new filming\n' ||
                        E'- No new editing workflow\n' ||
                        E'- No change to your existing content calendar\n' ||
                        E'\n' ||
                        E'Your existing content gets a second distribution surface and a second opportunity to earn a secured* monthly payment, totaling $3,000 to $9,000 over three months. Your {{main_platforme}} audience of {{max_followers}} followers qualifies you for this program.\n' ||
                        E'\n' ||
                        E'*Payment secured when program terms are met.\n' ||
                        E'\n' ||
                        E'As part of Creator Fast Track, Meta also gives you increased reach on your Reels from day one, something exclusive to creators in the program. That boosted visibility does not stop when the program ends. The audience you build keeps growing, your Content Monetization stays active, and you keep earning from everything you post going forward.\n' ||
                        E'\n' ||
                        E'What''s next?\n' ||
                        E'\n' ||
                        E'This month''s cohort is closing soon. Secure your spot using the link below.\n' ||
                        E'\n' ||
                        E'Important: The application must be completed through the Facebook app on your mobile device.\n' ||
                        E'\n' ||
                        E'Apply here:\n' ||
                        E'{{link}}\n' ||
                        E'\n' ||
                        E'{{qr}}\n' ||
                        E'\n' ||
                        E'Once applied: just reply to this email and let us know. This helps us track your application and get you a status update as soon as possible.\n' ||
                        E'\n' ||
                        E'When you apply through us, our team is with you from the start. We review your application in real time, keep you updated at every step, and have a direct line to Meta''s partner team if anything comes up. And beyond this program, we regularly connect creators in our network with brand deals and commercial opportunities. If something comes up that fits your profile, we will reach out.\n' ||
                        E'\n' ||
                        E'If you have any questions, we are here to help. Just reply and one of our specialists will get back to you.\n' ||
                        E'\n' ||
                        E'Looking forward to seeing your application.\n' ||
                        E'\n' ||
                        E'Thanks,\n' ||
                        E'{{sender_name}}\n' ||
                        E'ELEVN\n' ||
                        E'\n' ||
                        E'ELEVN | Powered by La Neta | Meta Official Partner\n' ||
                        E'174 Nassau St. Ste 341 Princeton NJ 08542 United States\n' ||
                        E'\n' ||
                        E'You received this email because your public creator profile meets the eligibility criteria for the Meta Creator Fast Track program.\n' ||
                        E'\n' ||
                        E'Unsubscribe: {{unsubscribe}}\n' ||
                        E'Terms: https://laneta-portal.netlify.app/opportunities/meta-fast-track/terms',
           commit_message = 'Seed real: AUTHORIZED_friction_removal.txt con {{link}}/{{qr}}'
     WHERE template_id = tpl_friction AND version = 1;
  END IF;

  -- ── social_proof ──────────────────────────────────────────────
  IF tpl_social IS NOT NULL THEN
    UPDATE template_versions
       SET body_plain = E'Hi {{first_name}},\n' ||
                        E'\n' ||
                        E'The data on creator monetization across platforms is clear, and we think it is worth your attention.\n' ||
                        E'\n' ||
                        E'TIKTOK\n' ||
                        E'$500 to $1K per million views (est.)\n' ||
                        E'Stricter classifications, algorithmic suppression, and zero compensation reported on videos with tens of thousands of views.\n' ||
                        E'\n' ||
                        E'FACEBOOK\n' ||
                        E'$1K to $3K per million views\n' ||
                        E'According to Meta, nearly $3 billion paid to creators in 2025, a 35% increase year over year.\n' ||
                        E'\n' ||
                        E'The most efficient creators right now are not filming anything new. They are simply reposting their existing {{main_platforme}} archive to Facebook Reels. A lifestyle content creator who recently joined one of our programs shared this:\n' ||
                        E'\n' ||
                        E'"I joined a week ago, posting twice a day, and already accumulated over 200,000 views."\n' ||
                        E'\n' ||
                        E'Meta''s Creator Fast Track program was built for exactly this. Creators with 100K or more followers secure a fixed monthly payment for 3 months: $1,000 per month for 100K to 999K followers, $3,000 per month for 1M or more, totaling $3,000 to $9,000 secured over the program period.*\n' ||
                        E'\n' ||
                        E'No new production. No view minimums.\n' ||
                        E'\n' ||
                        E'*Payment secured when posting requirements are met.\n' ||
                        E'\n' ||
                        E'Applying through us also connects you to something bigger. Creators who join through ELEVN stay in our network for ongoing opportunities, including exclusive events, industry sessions, and brand deals we share with our community regularly.\n' ||
                        E'\n' ||
                        E'What''s next?\n' ||
                        E'\n' ||
                        E'Secure your spot using the link below.\n' ||
                        E'\n' ||
                        E'Important: The application must be completed through the Facebook app on your mobile device.\n' ||
                        E'\n' ||
                        E'Apply here:\n' ||
                        E'{{link}}\n' ||
                        E'\n' ||
                        E'{{qr}}\n' ||
                        E'\n' ||
                        E'Once applied: just reply and let us know. If you have any questions regarding your eligibility or during the application process, just reply to this email and we will connect you to one of our specialists.\n' ||
                        E'\n' ||
                        E'Looking forward to seeing your application.\n' ||
                        E'\n' ||
                        E'Thanks,\n' ||
                        E'{{sender_name}}\n' ||
                        E'ELEVN\n' ||
                        E'\n' ||
                        E'ELEVN | Powered by La Neta | Meta Official Partner\n' ||
                        E'174 Nassau St. Ste 341 Princeton NJ 08542 United States\n' ||
                        E'\n' ||
                        E'You received this email because your public creator profile meets the eligibility criteria for the Meta Creator Fast Track program.\n' ||
                        E'\n' ||
                        E'Unsubscribe: {{unsubscribe}}\n' ||
                        E'Terms: https://laneta-portal.netlify.app/opportunities/meta-fast-track/terms',
           commit_message = 'Seed real: AUTHORIZED_social_proof.txt con {{link}}/{{qr}}'
     WHERE template_id = tpl_social AND version = 1;
  END IF;
END $$;
