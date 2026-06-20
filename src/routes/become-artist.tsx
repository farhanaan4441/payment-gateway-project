import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Palette } from "lucide-react";

export const Route = createFileRoute("/become-artist")({
  head: () => ({ meta: [{ title: "Jadi Artist — Rumah Commis" }] }),
  component: BecomeArtist,
});

function BecomeArtist() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [basePrice, setBasePrice] = useState<number | "">("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { mode: "signup", redirect: "/become-artist" } });
  }, [loading, user, navigate]);

  const { data: existing } = useQuery({
    queryKey: ["artist-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("artist_profiles").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (existing) {
      setTagline(existing.tagline ?? "");
      setBio(existing.long_bio ?? "");
      setBasePrice(existing.base_price_min ?? "");
    }
  }, [existing]);

  const save = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Login dulu");
      const { error: e1 } = await supabase.from("artist_profiles").upsert({
        user_id: user.id,
        tagline,
        long_bio: bio,
        base_price_min: basePrice ? Number(basePrice) : null,
      });
      if (e1) throw e1;
      const { data: hasRole } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "artist").maybeSingle();
      if (!hasRole) {
        await supabase.from("user_roles").insert({ user_id: user.id, role: "artist" });
      }
    },
    onSuccess: () => {
      toast.success("Profil artist tersimpan!");
      navigate({ to: "/artist/commissions" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (loading || !user) return null;

  return (
    <SiteShell>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-grid place-items-center h-14 w-14 rounded-2xl bg-primary text-primary-foreground mb-4">
            <Palette className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-semibold">Jadi Artist di Rumah Commis</h1>
          <p className="text-muted-foreground mt-2">Lengkapi profil artistmu untuk mulai menerima komisi.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div>
            <Label htmlFor="tagline">Tagline singkat</Label>
            <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Ilustrator chibi & pet portrait dari Bandung" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="bio">Bio panjang</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Ceritakan tentang gaya seni & pengalaman kamu..." className="mt-1 min-h-[150px]" />
          </div>
          <div>
            <Label htmlFor="price">Harga mulai dari (Rp)</Label>
            <Input id="price" type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value ? Number(e.target.value) : "")} placeholder="50000" className="mt-1" />
          </div>
          <Button type="submit" disabled={save.isPending} className="w-full h-11">
            {save.isPending ? "Menyimpan..." : existing ? "Simpan perubahan" : "Aktifkan profil artist"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Setelah aktif, kamu bisa membuat paket komisi di <Link to="/artist/commissions" className="text-primary">Kelola Komisi</Link>.
          </p>
        </form>
      </div>
    </SiteShell>
  );
}