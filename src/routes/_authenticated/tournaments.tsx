import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users, Coins, Trophy } from "lucide-react";
import { resolveCoverUrl } from "@/lib/coverPresets";

export const Route = createFileRoute("/_authenticated/tournaments")({
  component: TournamentsPage,
});

type Tournament = {
  id: string;
  name: string;
  description: string | null;
  max_players: number;
  entry_fee: number;
  prize_amount: number;
  start_date: string;
  end_date: string;
  status: string;
  cover_image_url: string | null;
};

function TournamentsPage() {
  const { data: tournaments, isLoading } = useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data as Tournament[];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-widest text-gold">Compete</p>
        <h1 className="mt-1 font-display text-4xl font-bold">Tournaments</h1>
        <p className="mt-2 text-muted-foreground">
          Browse open competitions and claim your spot.
        </p>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {tournaments && tournaments.length === 0 && (
        <div className="surface-card rounded-xl p-12 text-center">
          <Trophy className="mx-auto h-12 w-12 text-gold/40" />
          <p className="mt-4 text-muted-foreground">
            No tournaments yet. Check back soon — the next cup is coming.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {tournaments?.map((t) => (
          <Link
            key={t.id}
            to="/tournaments/$id"
            params={{ id: t.id }}
            className="surface-card group block overflow-hidden rounded-xl transition-all hover:border-gold/50 hover:gold-glow"
          >
            <div
              className="relative h-40 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${resolveCoverUrl(t.cover_image_url)})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              <div className="absolute right-3 top-3"><StatusPill status={t.status} /></div>
            </div>
            <div className="p-6">
            <div className="flex items-start justify-between">
              <h3 className="font-display text-xl font-bold group-hover:text-gold">{t.name}</h3>
            </div>
            {t.description && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{t.description}</p>
            )}
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <Info icon={Users} label={`${t.max_players} players`} />
              <Info icon={Coins} label={`$${t.entry_fee.toLocaleString()} entry`} />
              <Info icon={Trophy} label={`$${t.prize_amount.toLocaleString()} prize`} />
              <Info icon={Calendar} label={t.start_date} />
            </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Info({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4 text-gold/70" /> {label}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: "bg-gold/15 text-gold border-gold/30",
    ongoing: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    completed: "bg-muted text-muted-foreground border-border",
    upcoming: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    archived: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}