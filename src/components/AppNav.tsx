import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Trophy, LayoutDashboard, Swords, ShieldCheck, LogOut, Radio, Eye, MessageSquare, History } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { InstallButton } from "@/components/InstallButton";

export function AppNav() {
  const { isAdmin, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const items = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/tournaments", label: "Tournaments", icon: Swords },
    { to: "/play", label: "Play", icon: Radio },
    { to: "/watch", label: "Watch", icon: Eye },
    { to: "/history", label: "History", icon: History },
    { to: "/messages", label: "Chat", icon: MessageSquare },
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: ShieldCheck }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-gold" />
          <span className="font-display text-base font-bold md:text-lg">DLS Esports Arena</span>
        </Link>
        <nav className="hidden gap-1 md:flex">
          {items.map(({ to, label, icon: Icon }) => {
            const active = path === to || path.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-gold/15 text-gold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <InstallButton className="md:hidden" />
          {profile && (
            <Link to="/dashboard" className="hidden items-center gap-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-gold/40 bg-muted">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-gold">
                    {profile.full_name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">@{profile.username}</span>
            </Link>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Mobile nav */}
      <nav className="flex gap-1 overflow-x-auto border-t border-border/40 px-4 py-2 md:hidden">
        {items.map(({ to, label, icon: Icon }) => {
          const active = path === to || path.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium ${
                active ? "bg-gold/15 text-gold" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}