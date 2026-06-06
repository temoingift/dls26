import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, Upload, User } from "lucide-react";
import { toast } from "sonner";
import authBg from "@/assets/auth-bg.jpg";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    phone: "",
    email: "",
    password: "",
  });

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile photo must be under 2MB");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) {
      toast.error("Username: 3-20 letters, numbers or underscores");
      return;
    }
    setLoading(true);
    const { data: signupData, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: form.full_name,
          username: form.username,
          phone: form.phone,
        },
      },
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    // Ensure a profiles row exists for the new user (create or update)
    if (signupData.user) {
      const { error: profileErr } = await supabase
        .from("profiles")
        .upsert(
          {
            id: signupData.user.id,
            username: form.username,
            full_name: form.full_name,
            phone: form.phone,
          },
          { onConflict: "id" },
        );
      if (profileErr) {
        setLoading(false);
        toast.error(`Could not create profile: ${profileErr.message}`);
        return;
      }
    }

    // Upload avatar if provided
    if (avatarFile && signupData.user) {
      const ext = avatarFile.name.split(".").pop() || "jpg";
      const path = `${signupData.user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
      if (!upErr) {
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", signupData.user.id);
      }
    }

    setLoading(false);
    toast.success("Welcome to DLS Gamers Hub!");
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
          <h1 className="font-display text-3xl font-bold">Create your gamer profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join the league. Verified players only.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-gold/40 bg-muted">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-7 w-7 text-muted-foreground" />
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-input/60 px-3 py-2 text-sm hover:border-gold/50">
                <Upload className="h-4 w-4 text-gold" />
                {avatarFile ? "Change photo" : "Upload profile photo (optional)"}
                <input type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
              </label>
            </div>
            <Field label="Gamer name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
            <Field label="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} required placeholder="dls_legend7" />
            <Field label="Phone number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required placeholder="+1 234 567 8900" />
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already a player?{" "}
            <Link to="/login" className="text-gold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input type={type} value={value} required={required} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}