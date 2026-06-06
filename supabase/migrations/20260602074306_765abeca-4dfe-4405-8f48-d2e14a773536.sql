
-- ============ LIVE MATCHES ============
CREATE TYPE public.live_match_status AS ENUM ('live', 'ended');

CREATE TABLE public.live_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  home_player TEXT NOT NULL,
  away_player TEXT NOT NULL,
  home_score INTEGER NOT NULL DEFAULT 0,
  away_score INTEGER NOT NULL DEFAULT 0,
  status public.live_match_status NOT NULL DEFAULT 'live',
  tournament_id UUID,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_matches TO authenticated;
GRANT ALL ON public.live_matches TO service_role;

ALTER TABLE public.live_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view live matches" ON public.live_matches
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create their live match" ON public.live_matches
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Host updates their live match" ON public.live_matches
  FOR UPDATE TO authenticated USING (auth.uid() = host_id);
CREATE POLICY "Host deletes their live match" ON public.live_matches
  FOR DELETE TO authenticated USING (auth.uid() = host_id);

CREATE INDEX idx_live_matches_code ON public.live_matches(join_code);
CREATE INDEX idx_live_matches_status ON public.live_matches(status);

-- ============ WEBRTC SIGNALING ============
CREATE TABLE public.live_signaling (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.live_matches(id) ON DELETE CASCADE,
  from_user UUID NOT NULL,
  to_user UUID,
  kind TEXT NOT NULL, -- 'offer' | 'answer' | 'ice' | 'join'
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.live_signaling TO authenticated;
GRANT ALL ON public.live_signaling TO service_role;

ALTER TABLE public.live_signaling ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth view signaling" ON public.live_signaling
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert signaling" ON public.live_signaling
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = from_user);
CREATE POLICY "Auth delete own signaling" ON public.live_signaling
  FOR DELETE TO authenticated USING (auth.uid() = from_user);

CREATE INDEX idx_signaling_match ON public.live_signaling(match_id, created_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.live_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_signaling;

-- ============ DIRECT MESSAGES ============
CREATE TABLE public.dm_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL,
  user_b UUID NOT NULL,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dm_threads_pair_unique UNIQUE (user_a, user_b),
  CONSTRAINT dm_threads_ordered CHECK (user_a < user_b)
);

GRANT SELECT, INSERT, UPDATE ON public.dm_threads TO authenticated;
GRANT ALL ON public.dm_threads TO service_role;

ALTER TABLE public.dm_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view threads" ON public.dm_threads
  FOR SELECT TO authenticated USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "Members create threads" ON public.dm_threads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "Members update threads" ON public.dm_threads
  FOR UPDATE TO authenticated USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE TABLE public.dm_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.dm_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.dm_messages TO authenticated;
GRANT ALL ON public.dm_messages TO service_role;

ALTER TABLE public.dm_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view messages" ON public.dm_messages
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.dm_threads t WHERE t.id = thread_id AND (auth.uid() = t.user_a OR auth.uid() = t.user_b))
  );
CREATE POLICY "Members send messages" ON public.dm_messages
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM public.dm_threads t WHERE t.id = thread_id AND (auth.uid() = t.user_a OR auth.uid() = t.user_b))
  );
CREATE POLICY "Sender deletes own message" ON public.dm_messages
  FOR DELETE TO authenticated USING (auth.uid() = sender_id);

CREATE INDEX idx_dm_messages_thread ON public.dm_messages(thread_id, created_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_threads;
