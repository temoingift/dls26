
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('tournament-covers', 'tournament-covers', true)
  ON CONFLICT (id) DO NOTHING;

-- Avatars: public read
CREATE POLICY "Avatars are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Tournament covers: public read, admin write
CREATE POLICY "Tournament covers are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'tournament-covers');

CREATE POLICY "Admins upload tournament covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tournament-covers' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update tournament covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tournament-covers' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete tournament covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tournament-covers' AND public.has_role(auth.uid(), 'admin'::app_role));
