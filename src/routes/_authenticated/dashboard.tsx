import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Trophy, Swords, Bell, Award, ShieldCheck, Radio, Eye, MessageSquare } from "lucide-react";
import { FootballScene } from "@/components/FootballScene";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user, profile, isAdmin } = useAuth();

  const { data: participations } = useQuery({
    queryKey: ["my-participations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_participants")
        .select("status, tournament:tournaments(id, name, status, start_date, end_date, prize_amount)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const joined = participations?.length ?? 0;
  const approved = participations?.filter((p) => p.status === "approved").length ?? 0;

  return (
    <div className="relative space-y-8">
      <FootballScene className="pointer-events-none fixed inset-0 -z-10 opacity-40" />
      <div className="flex items-center gap-5">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gold/40 bg-muted md:h-24 md:w-24">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-3xl font-bold text-gold">
              {profile?.full_name?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
        </div>
        <div>
          <p className="text-sm uppercase tracking-widest text-gold">Welcome back</p>
          <h1 className="mt-1 font-display text-4xl font-bold md:text-5xl">
            {profile?.full_name ?? "Gamer"}
          </h1>
          <p className="mt-1 text-muted-foreground">@{profile?.username}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/play" className="group relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/15 to-primary/5 p-6 transition-all hover:border-gold/60 hover:shadow-xl hover:shadow-gold/20 hover:-translate-y-1">
          <div className="absolute -right-8 -top-8 h-24 w-24 bg-gold/20 rounded-full blur-2xl group-hover:bg-gold/40 transition-all opacity-40" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold/70 text-gold-foreground shadow-lg">
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display text-lg font-bold">Start Match</div>
              <div className="text-xs text-muted-foreground mt-1">Go live with screen or camera</div>
            </div>
          </div>
        </Link>
        <Link to="/watch" className="group relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/15 to-primary/5 p-6 transition-all hover:border-gold/60 hover:shadow-xl hover:shadow-gold/20 hover:-translate-y-1">
          <div className="absolute -right-8 -top-8 h-24 w-24 bg-gold/20 rounded-full blur-2xl group-hover:bg-gold/40 transition-all opacity-40" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-gold/30 to-gold/10 text-gold shadow-lg">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display text-lg font-bold">Watch Live</div>
              <div className="text-xs text-muted-foreground mt-1">Enter join code to spectate</div>
            </div>
          </div>
        </Link>
        <Link to="/messages" className="group relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/15 to-primary/5 p-6 transition-all hover:border-gold/60 hover:shadow-xl hover:shadow-gold/20 hover:-translate-y-1">
          <div className="absolute -right-8 -top-8 h-24 w-24 bg-gold/20 rounded-full blur-2xl group-hover:bg-gold/40 transition-all opacity-40" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-gold/30 to-gold/10 text-gold shadow-lg">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display text-lg font-bold">Messages</div>
              <div className="text-xs text-muted-foreground mt-1">Connect with other players</div>
            </div>
          </div>
        </Link>
      </div>

      {isAdmin && (
        <Link
          to="/admin"
          className="group relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-r from-gold/20 to-gold/5 p-6 transition-all hover:border-gold/60 hover:shadow-xl hover:shadow-gold/20"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-gold/10 to-transparent" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-gold/40 to-gold/10 text-gold">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="font-display text-lg font-bold">Admin Control Panel</div>
                <div className="text-xs text-muted-foreground">
                  Manage tournaments and payments
                </div>
              </div>
            </div>
            <span className="text-sm text-gold font-bold">→</span>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 to-primary/5 p-6 hover:border-gold/50 transition-all hover:shadow-lg hover:shadow-gold/20">
          <div className="absolute -right-12 -top-12 h-28 w-28 bg-gold/20 rounded-full blur-2xl group-hover:bg-gold/40 transition-all opacity-40" />
          <div className="relative">
            <Trophy className="h-5 w-5 text-gold mb-3" />
            <div className="font-display text-3xl font-bold text-white">{profile?.wins ?? 0}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Wins</div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 to-primary/5 p-6 hover:border-gold/50 transition-all hover:shadow-lg hover:shadow-gold/20">
          <div className="absolute -right-12 -top-12 h-28 w-28 bg-gold/20 rounded-full blur-2xl group-hover:bg-gold/40 transition-all opacity-40" />
          <div className="relative">
            <Swords className="h-5 w-5 text-gold mb-3" />
            <div className="font-display text-3xl font-bold text-white">{profile?.losses ?? 0}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Losses</div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 to-primary/5 p-6 hover:border-gold/50 transition-all hover:shadow-lg hover:shadow-gold/20">
          <div className="absolute -right-12 -top-12 h-28 w-28 bg-gold/20 rounded-full blur-2xl group-hover:bg-gold/40 transition-all opacity-40" />
          <div className="relative">
            <Award className="h-5 w-5 text-gold mb-3" />
            <div className="font-display text-3xl font-bold text-white">{joined}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Tournaments</div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 to-primary/5 p-6 hover:border-gold/50 transition-all hover:shadow-lg hover:shadow-gold/20">
          <div className="absolute -right-12 -top-12 h-28 w-28 bg-gold/20 rounded-full blur-2xl group-hover:bg-gold/40 transition-all opacity-40" />
          <div className="relative">
            <Bell className="h-5 w-5 text-gold mb-3" />
            <div className="font-display text-3xl font-bold text-white">{approved}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Active</div>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Your tournaments</h2>
          <Link to="/tournaments" className="text-sm text-gold hover:underline">
            Browse all →
          </Link>
        </div>

        {participations && participations.length > 0 ? (
          <div className="space-y-3">
            {participations.map((p, idx) => {
              const t = p.tournament as { id: string; name: string; status: string; start_date: string; end_date: string; prize_amount: number } | null;
              if (!t) return null;
              return (
                <Link
                  key={idx}
                  to="/tournaments/$id"
                  params={{ id: t.id }}
                  className="surface-card flex items-center justify-between rounded-xl p-5 transition-colors hover:border-gold/50"
                >
                  <div>
                    <div className="font-display text-lg font-semibold">{t.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {t.start_date} → {t.end_date} · Prize ${t.prize_amount.toLocaleString()}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="surface-card rounded-xl p-10 text-center">
            <Trophy className="mx-auto h-10 w-10 text-gold/60" />
            <p className="mt-4 text-muted-foreground">You haven't joined a tournament yet.</p>
            <Link to="/tournaments" className="mt-4 inline-block text-gold hover:underline">
              Find a tournament →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="surface-card rounded-xl p-4">
      <Icon className="h-5 w-5 text-gold" />
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}


export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-gold/15 text-gold border-gold/30",
    pending_approval: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    pending_payment: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    rejected: "bg-destructive/10 text-destructive border-destructive/30",
  };
  return (
    <span className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.replace("_", " ")}
    </span>
  );
}