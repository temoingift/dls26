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

      {liveMatches && liveMatches.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-xl font-bold">Currently Live</h2>
          <div className="space-y-2">
            {liveMatches.map((m) => (
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
                <span className="font-display text-lg text-gold">
                  {m.home_score} - {m.away_score}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}