
-- Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

-- Storage policies for commission-images (private bucket, public read)
CREATE POLICY "commission images public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'commission-images');
CREATE POLICY "commission images artist upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'commission-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "commission images artist update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'commission-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "commission images artist delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'commission-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage policies for order-files (private)
CREATE POLICY "order files participants read" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'order-files' AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id::text = (storage.foldername(name))[1]
        AND (auth.uid() = o.buyer_id OR auth.uid() = o.artist_id OR public.has_role(auth.uid(),'admin'))
    )
  );
CREATE POLICY "order files participants upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'order-files' AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id::text = (storage.foldername(name))[1]
        AND (auth.uid() = o.buyer_id OR auth.uid() = o.artist_id)
    )
  );
