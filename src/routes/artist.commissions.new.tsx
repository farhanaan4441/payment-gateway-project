import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { slugify } from "@/lib/format";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/artist/commissions/new")({
  head: () => ({ meta: [{ title: "Komisi Baru — Rumah Commis" }] }),
  component: NewCommission,
});

function NewCommission() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/artist/commissions/new" } });
  }, [loading, user, navigate]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("position")).data ?? [],
  });

  // Pastikan user sudah punya role & artist_profile sebelum bisa post komisi
  const { data: readiness, isLoading: readinessLoading } = useQuery({
    queryKey: ["artist-readiness", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: role }, { data: profile }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user!.id).eq("role", "artist").maybeSingle(),
        supabase.from("artist_profiles").select("user_id").eq("user_id", user!.id).maybeSingle(),
      ]);
      return { hasRole: !!role, hasProfile: !!profile };
    },
  });

  useEffect(() => {
    if (user && readiness && (!readiness.hasRole || !readiness.hasProfile)) {
      toast.info("Lengkapi profil artist dulu sebelum membuat komisi.");
      navigate({ to: "/become-artist" });
    }
  }, [user, readiness, navigate]);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState<number | "">("");
  const [turnaround, setTurnaround] = useState(7);
  const [slots, setSlots] = useState(5);
  const [cover, setCover] = useState<File | null>(null);

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Login dulu");
      if (Number(basePrice) <= 0) throw new Error("Harga harus lebih dari 0");
      if (slots <= 0) throw new Error("Slot minimal 1");
      if (turnaround <= 0) throw new Error("Lama pengerjaan minimal 1 hari");
      let coverUrl: string | null = null;
      if (cover) {
        const path = `${user.id}/${Date.now()}-${cover.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("commission-images").upload(path, cover);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("commission-images").getPublicUrl(path);
        coverUrl = pub.publicUrl;
      }
      const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`;
      const { data, error } = await supabase.from("commissions").insert({
        artist_id: user.id,
        title,
        slug,
        description,
        category_id: categoryId || null,
        base_price: Number(basePrice),
        turnaround_days: turnaround,
        slots_available: slots,
        cover_image_url: coverUrl,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (c) => { toast.success("Komisi diterbitkan!"); navigate({ to: "/commissions/$slug", params: { slug: c.slug } }); },
    onError: (e: any) => toast.error(e.message),
  });

  if (loading || !user || readinessLoading) return null;
  if (readiness && (!readiness.hasRole || !readiness.hasProfile)) return null;

  return (
    <SiteShell>
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Link to="/artist/commissions" className="text-sm text-muted-foreground hover:text-foreground">← Kembali</Link>
        <h1 className="font-display text-3xl font-semibold mt-3 mb-6">Komisi Baru</h1>

        <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div>
            <Label htmlFor="title">Judul</Label>
            <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Chibi Full Body Warna" className="mt-1" />
          </div>
          <div>
            <Label>Kategori</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
              <SelectContent>
                {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="desc">Deskripsi</Label>
            <Textarea id="desc" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Apa yang termasuk dalam paket ini, revisi, format file..." className="mt-1 min-h-[140px]" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input id="price" type="number" required value={basePrice} onChange={(e) => setBasePrice(e.target.value ? Number(e.target.value) : "")} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="ta">Lama (hari)</Label>
              <Input id="ta" type="number" min={1} value={turnaround} onChange={(e) => setTurnaround(Number(e.target.value))} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="slots">Slot</Label>
              <Input id="slots" type="number" min={1} value={slots} onChange={(e) => setSlots(Number(e.target.value))} className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="cover">Cover image</Label>
            <label className="mt-1 flex items-center gap-3 p-3 border border-dashed border-border rounded-lg cursor-pointer hover:border-primary">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground truncate">{cover?.name ?? "Pilih gambar..."}</span>
              <input id="cover" type="file" accept="image/*" className="hidden" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <Button type="submit" disabled={create.isPending} className="w-full h-11">
            {create.isPending ? "Menerbitkan..." : "Terbitkan Komisi"}
          </Button>
        </form>
      </div>
    </SiteShell>
  );
}