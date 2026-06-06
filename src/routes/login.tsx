import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy } from "lucide-react";
import { toast } from "sonner";
import authBg from "@/assets/auth-bg.jpg";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-6 py-12"
      style={{ backgroundImage: `url(${authBg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background/95" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-gold" />
          <span className="font-display text-lg font-bold">DLS Gamers Hub</span>
        </Link>
        <div className="surface-card rounded-2xl p-8 backdrop-blur-xl">
          <h1 className="font-display text-3xl font-bold">Welcome back, champion</h1>
          <p className="mt-2 text-sm text-muted-foreground">Log in to your dashboard.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input type="email" value={email} required onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
              <Input type="password" value={password} required onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New player?{" "}
            <Link to="/signup" className="text-gold hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}