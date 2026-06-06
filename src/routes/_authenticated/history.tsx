import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Clock, Radio, Play } from "lucide-react";
import { FootballLoader } from "@/components/FootballLoader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/history")({
  component: HistoryPage,
});

type EndedMatch = {
  id: string;
  join_code: string;
  home_player: string;
  away_player: string;
  home_score: number;
  away_score: number;
  status: "live" | "ended";
  started_at: string;
  ended_at: string | null;
  recording_url: string | null;
};

function HistoryPage() {
  const [replay, setReplay] = useState<{ match: EndedMatch; url: string } | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["match-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_matches")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as EndedMatch[];
    },
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <FootballLoader label="Loading match history..." />
      </div>
    );
  }

  const live = data?.filter((m) => m.status === "live") ?? [];
  const ended = data?.filter((m) => m.status === "ended") ?? [];

  const openReplay = async (m: EndedMatch) => {
    if (!m.recording_url) return;
    const { data: signed } = await supabase.storage
      .from("match-recordings")
      .createSignedUrl(m.recording_url, 60 * 60);
    if (signed?.signedUrl) setReplay({ match: m, url: signed.signedUrl });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-widest text-gold">Archive</p>
        <h1 className="font-display text-4xl font-bold">Match History</h1>
        <p className="mt-2 text-muted-foreground">Every recorded match with its final score.</p>
      </div>

      {live.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold">
            <Radio className="h-4 w-4 animate-pulse text-destructive" /> Live now
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {live.map((m) => (
              <Link
                key={m.id}
                to="/watch/$code"
                params={{ code: m.join_code }}
                className="surface-card rounded-xl p-4 transition-colors hover:border-gold/50"
              >
                <MatchRow m={m} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold">
          <Trophy className="h-4 w-4 text-gold" /> Completed
        </h2>
        {ended.length === 0 ? (
          <p className="surface-card rounded-xl p-8 text-center text-muted-foreground">
            No completed matches yet. Start one from the Go Live page.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {ended.map((m) => (
              <div key={m.id} className="surface-card rounded-xl p-4">
                <MatchRow m={m} />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${m.recording_url ? "bg-gold/15 text-gold" : "bg-muted text-muted-foreground"}`}>
                    {m.recording_url ? "Replay available" : "No replay recorded"}
                  </span>
                  {m.recording_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full md:w-auto"
                      onClick={() => openReplay(m)}
                    >
                      <Play className="mr-2 h-4 w-4" /> Watch replay
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog open={!!replay} onOpenChange={(o) => !o && setReplay(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {replay?.match.home_player} {replay?.match.home_score} -{" "}
              {replay?.match.away_score} {replay?.match.away_player}
            </DialogTitle>
          </DialogHeader>
          {replay && (
            <video
              src={replay.url}
              controls
              autoPlay
              className="w-full rounded-lg bg-black"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MatchRow({ m }: { m: EndedMatch }) {
  const date = new Date(m.ended_at ?? m.started_at);
  const winner =
    m.home_score === m.away_score
      ? "Draw"
      : m.home_score > m.away_score
        ? m.home_player
        : m.away_player;
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-semibold">
            {m.home_player} <span className="text-muted-foreground">vs</span> {m.away_player}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {date.toLocaleString()}
          </div>
        </div>
        <span className="font-display text-3xl font-bold text-gold">
          {m.home_score}-{m.away_score}
        </span>
      </div>
      {m.status === "ended" && (
        <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
          Winner: <span className="text-foreground">{winner}</span>
        </div>
      )}
    </div>
  );
}