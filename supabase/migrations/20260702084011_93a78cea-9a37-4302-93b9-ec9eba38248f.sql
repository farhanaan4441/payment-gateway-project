
CREATE POLICY "user_roles self insert artist" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'artist');

-- Backfill: siapa pun yang sudah punya artist_profile tapi belum punya role artist
INSERT INTO public.user_roles (user_id, role)
SELECT ap.user_id, 'artist'::app_role
FROM public.artist_profiles ap
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = ap.user_id AND ur.role = 'artist'
);
