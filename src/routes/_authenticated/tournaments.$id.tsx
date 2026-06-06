import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Coins, Trophy, Users, ArrowLeft, Phone, Crown } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "./dashboard";
import { resolveCoverUrl } from "@/lib/coverPresets";

export const Route = createFileRoute("/_authenticated/tournaments/$id")({
  component: TournamentDetail,
});

function TournamentDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [txId, setTxId] = useState("");
  const [joining, setJoining] = useState(false);

  const { data: t } = useQuery({
    queryKey: ["tournament", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("tournaments").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: parts } = useQuery({
    queryKey: ["tournament-parts", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_participants")
        .select("user_id, status")
        .eq("tournament_id", id);
      if (error) throw error;
      const ids = (data ?? []).map((p) => p.user_id);
      if (ids.length === 0) return [] as Array<{ user_id: string; status: string; profile: { username: string; full_name: string; avatar_url: string | null } | null }>;
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", ids);
      const profMap = new Map((profs ?? []).map((p) => [p.id, p]));
      return (data ?? []).map((p) => ({
        user_id: p.user_id,
        status: p.status,
        profile: (profMap.get(p.user_id) ?? null) as { username: string; full_name: string; avatar_url: string | null } | null,
      }));
    },
  });

  const myPart = parts?.find((p) => p.user_id === user?.id);

  const join = async () => {
    if (!user) return;
    if (!txId.trim() && t?.entry_fee && t.entry_fee > 0) {
      toast.error("Please enter the MoMo transaction ID");
      return;
    }
    setJoining(true);
    const { error } = await supabase.from("tournament_participants").insert({
      tournament_id: id,
      user_id: user.id,
      transaction_id: txId.trim() || null,
      status: "pending_approval",
    });
    setJoining(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Joined! Waiting for admin approval.");
    qc.invalidateQueries({ queryKey: ["tournament-parts", id] });
  };

  if (!t) return <p className="text-muted-foreground">Loading...</p>;

  const approved = parts?.filter((p) => p.status === "approved") ?? [];
  const spotsLeft = Math.max(0, t.max_players - approved.length);

  return (
    <div className="space-y-8">
      <Link to="/tournaments" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold">
        <ArrowLeft className="h-4 w-4" /> All tournaments
      </Link>

      <header className="surface-card overflow-hidden rounded-2xl">
        <div
          className="relative h-56 w-full bg-cover bg-center md:h-72"
          style={{ backgroundImage: `url(${resolveCoverUrl(t.cover_image_url)})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
        </div>
        <div className="p-8">
        <p className="text-xs uppercase tracking-widest text-gold">{t.status}</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">{t.name}</h1>
        {t.description && <p className="mt-3 text-muted-foreground">{t.description}</p>}

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Meta icon={Users} label="Players" value={`${approved.length}/${t.max_players}`} />
          <Meta icon={Coins} label="Entry" value={`$${t.entry_fee.toLocaleString()}`} />
          <Meta icon={Trophy} label="Prize" value={`$${t.prize_amount.toLocaleString()}`} />
          <Meta icon={Calendar} label="Schedule" value={`${t.start_date} → ${t.end_date}`} />
        </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="surface-card rounded-xl p-6">
          <Crown className="h-5 w-5 text-gold" />
          <h3 className="mt-3 font-display text-lg font-bold">Rewards</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between"><span>🥇 1st place</span><span className="text-gold">${t.prize_amount.toLocaleString()}</span></li>
            {t.second_prize > 0 && (
              <li className="flex justify-between"><span>🥈 2nd place</span><span>${t.second_prize.toLocaleString()}</span></li>
            )}
            {t.mvp_reward && (
              <li className="flex justify-between"><span>🏅 MVP</span><span>{t.mvp_reward}</span></li>
            )}
          </ul>
        </div>

        <div className="surface-card rounded-xl p-6 md:col-span-2">
          <h3 className="font-display text-lg font-bold">Join this tournament</h3>
          {myPart ? (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Your status:</p>
              <div className="mt-2"><StatusBadge status={myPart.status} /></div>
              {myPart.status === "pending_approval" && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Admin will verify your payment and approve your spot shortly.
                </p>
              )}
            </div>
          ) : spotsLeft === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Tournament is full.</p>
          ) : t.status !== "open" ? (
            <p className="mt-3 text-sm text-muted-foreground">Registration is closed.</p>
          ) : (
            <>
              {t.entry_fee > 0 && t.momo_number && (
                <div className="mt-4 rounded-lg border border-gold/30 bg-gold/5 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-gold">
                    <Phone className="h-4 w-4" /> Pay ${t.entry_fee.toLocaleString()} to host
                  </p>
                  <p className="mt-2 font-mono text-lg">{t.momo_number}</p>
                  {t.momo_instructions && (
                    <p className="mt-2 text-xs text-muted-foreground">{t.momo_instructions}</p>
                  )}
                </div>
              )}
              {t.entry_fee > 0 && (
                <div className="mt-4">
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                    Payment Transaction ID
                  </Label>
                  <Input value={txId} onChange={(e) => setTxId(e.target.value)} placeholder="e.g. 12345ABC" />
                </div>
              )}
              <Button className="mt-4 w-full" onClick={join} disabled={joining}>
                {joining ? "Joining..." : "Participate in Tournament"}
              </Button>
            </>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold">Roster ({approved.length})</h2>
        {approved.length === 0 ? (
          <p className="text-sm text-muted-foreground">No approved players yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {approved.map((p, i) => {
              const prof = p.profile;
              return (
                <div key={i} className="surface-card flex items-center gap-3 rounded-lg p-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gold/20 font-display text-gold">
                    {prof?.avatar_url ? (
                      <img src={prof.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      prof?.full_name?.[0] ?? "?"
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{prof?.full_name}</div>
                    <div className="text-xs text-muted-foreground">@{prof?.username}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Meta({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div>
      <Icon className="h-4 w-4 text-gold" />
      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-display text-base font-bold">{value}</div>
    </div>
  );
}