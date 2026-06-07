import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Radio } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/watch")({
  component: WatchIndex,
});

function WatchIndex() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  // Static local streams (falls back when no live matches from the backend).
  // To enable these, copy your MP3 files into `public/assets` with the
  // filenames `argfr.mp3` and `phantom.mp3` (see instructions after patch).
  const staticStreams = [
    {
      id: "static-argfr",
      join_code: "ARGFR",
      home_player: "Argentina",
      away_player: "France",
      isStatic: true,
    },
    {
      id: "static-phant",
      join_code: "PHANT",
      home_player: "FC PHANTOM WARRIOR",
      away_player: "The Toughest Opponent",
      isStatic: true,
    },
  ];

  const { data: liveMatches } = useQuery({
    queryKey: ["live-matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_matches")
        .select("*")
        .eq("status", "live")
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000,
  });

  const join = async () => {
    const c = code.trim().toUpperCase();
    if (c.length < 4) return toast.error("Enter a valid code");
    const { data } = await supabase
      .from("live_matches")
      .select("join_code,status")
      .eq("join_code", c)
      .maybeSingle();
    if (!data) return toast.error("No match found for that code");
    if (data.status !== "live") return toast.error("That match is no longer live");
    navigate({ to: "/watch/$code", params: { code: c } });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-widest text-gold">Watch Live</p>
        <h1 className="font-display text-4xl font-bold">Join a live match</h1>
        <p className="mt-2 text-muted-foreground">
          Enter the live broadcast code shared by a host, or pick an active match from the list below.
        </p>
      </div>

      <div className="surface-card rounded-xl p-6">
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ENTER CODE"
            className="font-display text-2xl tracking-[0.4em]"
            maxLength={8}
          />
          <Button onClick={join} size="lg">
            <Eye className="mr-2 h-4 w-4" /> Watch
          </Button>
        </div>
      </div>

      {(() => {
        const combined = [
          ...(liveMatches || []),
          ...staticStreams.filter((s) => !(liveMatches || []).some((l) => l.join_code === s.join_code)),
        ];
        if (combined.length === 0) return null;
        return (
          <div>
            <h2 className="mb-3 font-display text-xl font-bold">Currently Live</h2>
            <div className="space-y-2">
              {combined.map((m: any) => (
                <Link
                  key={m.id}
                  to="/watch/$code"
                  params={{ code: m.join_code }}
                  className="surface-card flex items-center justify-between rounded-lg p-4 transition-colors hover:border-gold/50"
                >
                  <div className="flex items-center gap-3">
                    <Radio className="h-4 w-4 animate-pulse text-destructive" />
                    <span className="font-semibold">
                      {m.home_player} <span className="text-muted-foreground">vs</span> {m.away_player}
                    </span>
                  </div>
                  {m.isStatic ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      LIVE
                    </span>
                  ) : (
                    <span className="font-display text-lg text-gold">
                      {m.home_score} - {m.away_score}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}