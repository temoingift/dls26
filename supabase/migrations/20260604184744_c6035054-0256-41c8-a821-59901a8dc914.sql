CREATE TABLE public.live_chat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.live_matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.live_chat TO authenticated;
GRANT ALL ON public.live_chat TO service_role;
ALTER TABLE public.live_chat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone signed-in can read live chat" ON public.live_chat FOR SELECT TO authenticated USING (true);
CREATE POLICY "users insert own messages" ON public.live_chat FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX live_chat_match_idx ON public.live_chat(match_id, created_at);
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat;