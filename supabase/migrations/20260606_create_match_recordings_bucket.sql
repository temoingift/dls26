-- Create match-recordings storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('match-recordings', 'match-recordings', false)
  ON CONFLICT (id) DO NOTHING;
