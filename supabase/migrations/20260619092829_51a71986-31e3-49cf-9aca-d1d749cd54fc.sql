
-- Add explicit FK so PostgREST can resolve profiles join
ALTER TABLE public.commissions
  ADD CONSTRAINT commissions_artist_profiles_fk FOREIGN KEY (artist_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_buyer_profiles_fk FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT orders_artist_profiles_fk FOREIGN KEY (artist_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.order_messages
  ADD CONSTRAINT order_messages_sender_profiles_fk FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
