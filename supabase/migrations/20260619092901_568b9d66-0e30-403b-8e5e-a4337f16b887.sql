
-- Drop redundant auth.users FKs (profiles.id already references auth.users with cascade)
ALTER TABLE public.commissions DROP CONSTRAINT IF EXISTS commissions_artist_id_fkey;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_buyer_id_fkey;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_artist_id_fkey;
ALTER TABLE public.order_messages DROP CONSTRAINT IF EXISTS order_messages_sender_id_fkey;
