import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, Plus, Check, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { COVER_PRESETS, resolveCoverUrl } from "@/lib/coverPresets";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
  beforeLoad: async () => {
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) throw redirect({ to: "/login" });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userRes.user.id);
    const isAdmin = !!roles?.some((r: { role: string }) => r.role === "admin");
    if (!isAdmin) throw redirect({ to: "/dashboard" });
  },
});

function AdminPage() {
  const { isAdmin, user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: tournaments } = useQuery({
    queryKey: ["admin-tournaments"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("tournaments").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: pending } = useQuery({
    queryKey: ["pending-parts"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_participants")
        .select("id, user_id, transaction_id, status, tournament_id, tournament:tournaments(name)")
        .in("status", ["pending_approval", "pending_payment"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      const ids = (data ?? []).map((p) => p.user_id);
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("id, username, full_name").in("id", ids)
        : { data: [] };
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      return (data ?? []).map((p) => ({ ...p, profile: map.get(p.user_id) }));
    },
  });

  const decide = async (pid: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("tournament_participants")
      .update({ status, approved_at: status === "approved" ? new Date().toISOString() : null })
      .eq("id", pid);
    if (error) return toast.error(error.message);
    toast.success(`Participant ${status}`);
    qc.invalidateQueries({ queryKey: ["pending-parts"] });
  };

  if (!isAdmin) {
    return (
      <div className="surface-card rounded-xl p-10 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Admins only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-gold">Control Panel</p>
          <h1 className="mt-1 font-display text-4xl font-bold">Admin</h1>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="mr-1 h-4 w-4" /> New Tournament
        </Button>
      </div>

      {showForm && (
        <CreateTournamentForm
          userId={user!.id}
          onCreated={() => {
            setShowForm(false);
            qc.invalidateQueries({ queryKey: ["admin-tournaments"] });
            qc.invalidateQueries({ queryKey: ["tournaments"] });
          }}
        />
      )}

      <section>
        <h2 className="mb-3 font-display text-2xl font-bold">Pending approvals</h2>
        {pending && pending.length > 0 ? (
          <div className="space-y-2">
            {pending.map((p) => {
              const prof = p.profile as { username: string; full_name: string } | undefined;
              const tour = p.tournament as { name: string } | null;
              return (
                <div key={p.id} className="surface-card flex flex-wrap items-center justify-between gap-3 rounded-lg p-4">
                  <div>
                    <div className="font-semibold">{prof?.full_name ?? "Unknown"} <span className="text-muted-foreground">@{prof?.username}</span></div>
                    <div className="text-xs text-muted-foreground">
                      {tour?.name} · TX: {p.transaction_id ?? "—"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => decide(p.id, "rejected")}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => decide(p.id, "approved")}>
                      <Check className="mr-1 h-4 w-4" /> Approve
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No pending requests.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-2xl font-bold">All tournaments</h2>
        <div className="space-y-2">
          {tournaments?.map((t) => (
            <div key={t.id} className="surface-card flex flex-wrap items-center justify-between gap-3 rounded-lg p-4">
              <div>
                <div className="font-display font-bold">{t.name}</div>
                <div className="text-xs text-muted-foreground">
                  {t.start_date} → {t.end_date} · {t.max_players} players · ${t.prize_amount.toLocaleString()}
                </div>
              </div>
              <select
                className="rounded-md border border-border bg-input px-2 py-1 text-sm"
                value={t.status}
                onChange={async (e) => {
                  const { error } = await supabase
                    .from("tournaments")
                    .update({ status: e.target.value as "open" | "ongoing" | "completed" | "archived" | "upcoming" })
                    .eq("id", t.id);
                  if (error) return toast.error(error.message);
                  toast.success("Status updated");
                  qc.invalidateQueries({ queryKey: ["admin-tournaments"] });
                }}
              >
                {["open", "ongoing", "completed", "archived", "upcoming"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CreateTournamentForm({ userId, onCreated }: { userId: string; onCreated: () => void }) {
  const [f, setF] = useState({
    name: "DLS World Cup 2026",
    description: "",
    max_players: 8,
    num_groups: 2,
    entry_fee: 10,
    prize_amount: 100,
    second_prize: 50,
    mvp_reward: "Special Badge",
    momo_number: "",
    momo_instructions: "Send payment, then enter transaction ID when joining.",
    cover_image_url: "preset:pitch",
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...f, cover_image_url: f.cover_image_url.trim() || null, created_by: userId, status: "open" as const };
    const { error } = await supabase.from("tournaments").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Tournament created");
    onCreated();
  };

  const num = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [k]: Number(e.target.value) });
  const str = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  const onUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("tournament-covers").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    setUploading(false);
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("tournament-covers").getPublicUrl(path);
    setF({ ...f, cover_image_url: data.publicUrl });
    toast.success("Cover uploaded");
  };

  return (
    <form onSubmit={submit} className="surface-card grid gap-3 rounded-xl p-6 md:grid-cols-2">
      <FormField label="Name" className="md:col-span-2">
        <Input value={f.name} onChange={str("name")} required />
      </FormField>
      <FormField label="Description" className="md:col-span-2">
        <Textarea value={f.description} onChange={str("description")} rows={2} />
      </FormField>
      <FormField label="Max players"><Input type="number" value={f.max_players} onChange={num("max_players")} /></FormField>
      <FormField label="Groups"><Input type="number" value={f.num_groups} onChange={num("num_groups")} /></FormField>
      <FormField label="Entry fee ($)"><Input type="number" value={f.entry_fee} onChange={num("entry_fee")} /></FormField>
      <FormField label="1st prize ($)"><Input type="number" value={f.prize_amount} onChange={num("prize_amount")} /></FormField>
      <FormField label="2nd prize ($)"><Input type="number" value={f.second_prize} onChange={num("second_prize")} /></FormField>
      <FormField label="MVP reward"><Input value={f.mvp_reward} onChange={str("mvp_reward")} /></FormField>
      <FormField label="Payment number / ID"><Input value={f.momo_number} onChange={str("momo_number")} placeholder="e.g. +1 234 567 8900" /></FormField>
      <FormField label="MoMo instructions" className="md:col-span-2">
        <Textarea value={f.momo_instructions} onChange={str("momo_instructions")} rows={2} />
      </FormField>
      <div className="md:col-span-2">
        <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
          Tournament cover
        </Label>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {COVER_PRESETS.map((p) => {
            const active = f.cover_image_url === p.key;
            return (
              <button
                type="button"
                key={p.key}
                onClick={() => setF({ ...f, cover_image_url: p.key })}
                className={`group overflow-hidden rounded-md border-2 transition-all ${
                  active ? "border-gold gold-glow" : "border-border hover:border-gold/50"
                }`}
              >
                <img src={p.url} alt={p.label} className="aspect-video w-full object-cover" loading="lazy" />
                <div className={`px-1 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                  active ? "text-gold" : "text-muted-foreground"
                }`}>{p.label}</div>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-input px-3 py-2 text-sm hover:border-gold/50">
            <Upload className="h-4 w-4 text-gold" />
            {uploading ? "Uploading..." : "Upload custom cover"}
            <input type="file" accept="image/*" className="hidden" onChange={onUploadCover} disabled={uploading} />
          </label>
          {f.cover_image_url && !f.cover_image_url.startsWith("preset:") && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <img src={resolveCoverUrl(f.cover_image_url)} alt="" className="h-8 w-14 rounded object-cover" />
              Custom image selected
            </div>
          )}
        </div>
      </div>
      <FormField label="Start date"><Input type="date" value={f.start_date} onChange={str("start_date")} /></FormField>
      <FormField label="End date"><Input type="date" value={f.end_date} onChange={str("end_date")} /></FormField>
      <Button type="submit" disabled={saving} className="md:col-span-2" size="lg">
        {saving ? "Creating..." : "Create tournament"}
      </Button>
    </form>
  );
}

function FormField({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}