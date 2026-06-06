ALTER TABLE public.live_matches ADD COLUMN IF NOT EXISTS recording_url TEXT;

CREATE POLICY "hosts upload own recordings"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'match-recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "hosts update own recordings"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'match-recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "hosts delete own recordings"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'match-recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "anyone signed-in can read recordings"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'match-recordings');