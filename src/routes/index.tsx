import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Crown, Flame, Zap, Users, Target, Shield, Gamepad2, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FootballScene } from "@/components/FootballScene";
import heroBg from "@/assets/hero-bg.jpg";
import coverStrike from "@/assets/cover-strike.jpg";
import coverTactics from "@/assets/cover-tactics.jpg";
import coverMedal from "@/assets/cover-medal.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const gamerRoster = [
  { name: "NeonStriker", role: "Strike Specialist", score: "+420 XP", status: "Rising Champ", wins: 24 },
  { name: "CyberKeeper", role: "Defensive Wall", score: "+385 XP", status: "Unbeaten", wins: 18 },
  { name: "VortexAce", role: "Playmaker", score: "+398 XP", status: "Elite", wins: 22 },
  { name: "StormWing", role: "Speedster", score: "+362 XP", status: "Legend", wins: 20 },
];

const topFeatures = [
  { icon: Flame, label: "Live Streaming", desc: "Go live instantly with screen or camera" },
  { icon: Shield, label: "Verified Players", desc: "Secure matchmaking with authentic profiles" },
  { icon: Zap, label: "Instant Replays", desc: "Auto-save and review every moment" },
];

function Index() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy via-background to-background">
      {/* Enhanced Header with Gaming Aesthetic */}
      <header className="fixed top-0 w-full z-50 border-b border-gold/10 backdrop-blur-xl bg-background/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-gold/70 shadow-lg shadow-gold/40">
              <Gamepad2 className="h-6 w-6 text-gold-foreground" />
            </div>
            <div>
              <div className="font-display text-lg font-black tracking-tight">DLS 2026</div>
              <div className="text-xs text-gold/80 font-semibold">GAMING HUB</div>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button asChild className="bg-gradient-to-r from-gold to-gold/80 hover:shadow-lg hover:shadow-gold/40">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="hover:text-gold">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-gold to-gold/80 hover:shadow-lg hover:shadow-gold/40">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Premium Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <FootballScene className="pointer-events-none absolute inset-0 opacity-50" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gold/20 rounded-full blur-3xl animate-pulse opacity-20" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse opacity-20 animation-delay-2000" />
        </div>

        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})`, opacity: 0.15 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-gold/40 bg-gold/8 px-5 py-3 text-xs uppercase tracking-[0.4em] font-bold text-gold backdrop-blur-sm hover:border-gold/60 transition-all cursor-pointer">
                <Flame className="h-4 w-4 animate-pulse" />
                <span>🔥 2026 Season Active</span>
              </div>

              <div className="space-y-6">
                <h1 className="font-display text-6xl md:text-7xl font-black leading-tight tracking-tight">
                  <span className="block text-white">Play</span>
                  <span className="block bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent">DLS 2026</span>
                  <span className="block text-white">Competitively</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                  Live tournaments, instant replays, and verified competitive matches. Go live with your screen or camera and challenge players worldwide in Dream League Soccer 2026.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-gold to-gold/80 hover:shadow-2xl hover:shadow-gold/50 text-gold-foreground font-bold">
                  <Link to={isAuthenticated ? "/play" : "/signup"}>
                    <Flame className="mr-2 h-5 w-5" />
                    {isAuthenticated ? "Go Live Now" : "Start Playing"}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/60 font-bold">
                  <Link to={isAuthenticated ? "/watch" : "/signup"}>
                    <Target className="mr-2 h-5 w-5" />
                    Watch Live
                  </Link>
                </Button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gold/10">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gold">2,400+</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Active Players</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gold">1.2K</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Live Matches</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gold">$50K</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Prize Pool</div>
                </div>
              </div>
            </div>

            {/* Right Side - Featured Showcase */}
            <div className="space-y-6">
              {/* Main Featured Card */}
              <div className="relative group overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/15 to-primary/10 p-8 hover:border-gold/60 transition-all duration-300">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-transparent to-primary/10" />
                </div>
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <Crown className="h-8 w-8 text-gold drop-shadow-lg" />
                    <div className="rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-gold uppercase tracking-wider">Featured</div>
                  </div>
                  <div>
                    <h3 className="font-display text-3xl font-bold">Championship</h3>
                    <p className="text-gold/80 mt-2">Season 2026 Grand Tournament</p>
                  </div>
                  <div className="pt-4 flex gap-3">
                    <div className="flex-1 rounded-2xl bg-primary/10 border border-primary/30 p-4 hover:border-primary/50 transition-all">
                      <div className="text-xs text-muted-foreground uppercase">Total Prize</div>
                      <div className="text-xl font-bold text-gold mt-1">$50,000</div>
                    </div>
                    <div className="flex-1 rounded-2xl bg-primary/10 border border-primary/30 p-4 hover:border-primary/50 transition-all">
                      <div className="text-xs text-muted-foreground uppercase">Players</div>
                      <div className="text-xl font-bold text-gold mt-1">2,400+</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Players Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 to-transparent p-5 hover:border-gold/50 transition-all cursor-pointer">
                  <div className="absolute -right-8 -top-8 h-24 w-24 bg-gold/20 rounded-full blur-2xl group-hover:bg-gold/40 transition-all" />
                  <div className="relative space-y-3">
                    <Star className="h-5 w-5 text-gold" />
                    <div>
                      <div className="text-sm font-bold">Elite Players</div>
                      <div className="text-xs text-muted-foreground mt-1">Top 100 Ranked</div>
                    </div>
                  </div>
                </div>
                <div className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 to-transparent p-5 hover:border-gold/50 transition-all cursor-pointer">
                  <div className="absolute -right-8 -top-8 h-24 w-24 bg-gold/20 rounded-full blur-2xl group-hover:bg-gold/40 transition-all" />
                  <div className="relative space-y-3">
                    <TrendingUp className="h-5 w-5 text-gold" />
                    <div>
                      <div className="text-sm font-bold">Rising Stars</div>
                      <div className="text-xs text-muted-foreground mt-1">Fastest Growing</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 border-t border-gold/10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-display text-4xl font-bold">Why DLS 2026 Hub?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need for competitive Dream League Soccer</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {topFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.label} className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/8 to-primary/5 p-8 hover:border-gold/50 transition-all hover:shadow-lg hover:shadow-gold/20">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-gold/10 to-transparent" />
                  <div className="relative space-y-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-gold/30 transition-all">
                      <Icon className="h-7 w-7 text-gold" />
                    </div>
                    <h3 className="font-display text-xl font-bold">{feature.label}</h3>
                    <p className="text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top Players Section */}
      <section className="relative py-20 border-t border-gold/10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
            <div>
              <h2 className="font-display text-4xl font-bold mb-3">Top Ranked Players</h2>
              <p className="text-muted-foreground">Elite competitors in DLS 2026 Season</p>
            </div>
            <Link to={isAuthenticated ? "/dashboard" : "/signup"} className="text-gold font-bold hover:text-gold/80 transition-colors">
              View Leaderboard →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gamerRoster.map((player, idx) => (
              <div
                key={player.name}
                className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 to-primary/5 p-6 hover:border-gold/50 transition-all hover:shadow-xl hover:shadow-gold/20 hover:-translate-y-1"
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 bg-gold/20 rounded-full blur-2xl group-hover:bg-gold/40 transition-all opacity-40 group-hover:opacity-60" />
                
                {/* Rank Badge */}
                <div className="absolute top-4 right-4">
                  <div className="relative w-10 h-10">
                    {idx === 0 && <Crown className="h-6 w-6 text-gold absolute" />}
                    {idx !== 0 && <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-sm font-bold text-gold">#{idx + 1}</div>}
                  </div>
                </div>

                <div className="relative space-y-4">
                  <div className="pr-6">
                    <h3 className="font-display text-2xl font-bold group-hover:text-gold transition-colors">{player.name}</h3>
                    <p className="text-sm text-gold/70 uppercase tracking-wider">{player.role}</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gold/10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Wins</span>
                      <span className="font-bold text-gold">{player.wins}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rating</span>
                      <span className="font-bold text-gold">2,480</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Points</span>
                      <span className="font-bold text-gold">{player.score}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 border-gold/20 hover:border-gold/50 hover:bg-gold/5">
                      Challenge
                    </Button>
                    <Button size="sm" className="flex-1 bg-gold/20 hover:bg-gold/30 text-gold">
                      Profile
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 border-t border-gold/10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-r from-gold/20 via-primary/10 to-gold/10 p-12 md:p-16 text-center">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent" />
            </div>
            
            <div className="relative space-y-6">
              <Flame className="h-12 w-12 text-gold mx-auto" />
              <h2 className="font-display text-4xl md:text-5xl font-bold">Ready to Compete?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of players battling for championships, prizes, and glory in the DLS 2026 season.
              </p>
              <Button asChild size="lg" className="mx-auto bg-gradient-to-r from-gold to-gold/80 hover:shadow-2xl hover:shadow-gold/50">
                <Link to={isAuthenticated ? "/play" : "/signup"}>
                  <Gamepad2 className="mr-2 h-5 w-5" />
                  Start Your Journey
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gold/10 py-12 text-center text-sm text-muted-foreground">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Gamepad2 className="h-5 w-5 text-gold" />
            <span className="font-bold text-white">DLS 2026 Gaming Hub</span>
          </div>
          <p>© 2026 Dream League Soccer Competitive Platform · Built for Champions</p>
        </div>
      </footer>
    </div>
  );
}
