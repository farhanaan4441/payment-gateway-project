import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, Clock, ShieldCheck, Star, ArrowRight, Brush } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatIDR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/commissions/$slug")({
  head: ({ params }) => ({ meta: [{ title: `${params.slug} — Komisi` }] }),
  component: CommissionDetail,
});

function CommissionDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["commission", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commissions")
        .select("*, profiles:artist_id(display_name, avatar_url, bio, location), categories(name, slug), commission_images(url, position)")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data as any;
    },
  });

  const [brief, setBrief] = useState("");
  const [reference, setReference] = useState("");
  const [budget, setBudget] = useState<number | "">("");

  const orderMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Silakan masuk dulu.");
      const amount = Number(budget) || data!.base_price;
      const fee = Math.round(amount * 0.05);
      const total = amount + fee;
      const { data: order, error } = await supabase.from("orders").insert({
        buyer_id: user.id,
        artist_id: data!.artist_id,
        commission_id: data!.id,
        brief,
        reference_url: reference || null,
        budget_idr: amount,
        service_fee: fee,
        total_amount: total,
      }).select().single();
      if (error) throw error;
      return order;
    },
    onSuccess: (order) => {
      toast.success("Pesanan dibuat — lanjut ke pembayaran");
      navigate({ to: "/orders/$id/checkout", params: { id: order.id } });
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <SiteShell><div className="container mx-auto px-4 py-20 text-center">Memuat…</div></SiteShell>;
  if (!data) return null;

  const images = (data.commission_images ?? []).sort((a: any, b: any) => a.position - b.position);

  return (
    <SiteShell>
      <div className="container mx-auto px-4 py-8">
        <div className="text-sm text-muted-foreground mb-3">
          <Link to="/explore" className="hover:text-foreground">Jelajahi</Link>
          {data.categories && <> / <Link to="/explore" search={{ category: data.categories.slug }} className="hover:text-foreground">{data.categories.name}</Link></>}
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          <div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-secondary border border-border">
              <SignedImage
                path={data.cover_image_url}
                alt={data.title}
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full grid place-items-center bg-gradient-to-br from-accent/40 to-primary/20">
                    <Brush className="h-16 w-16 text-primary/50" />
                  </div>
                }
              />
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {images.slice(0, 4).map((img: any, i: number) => (
                  <img key={i} src={img.url} alt="" className="aspect-square rounded-lg object-cover border border-border" />
                ))}
              </div>
            )}

            <h1 className="font-display text-3xl md:text-4xl font-semibold mt-6">{data.title}</h1>
            <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
              <Link to="/explore" className="flex items-center gap-2 group">
                <div className="h-8 w-8 rounded-full bg-secondary grid place-items-center overflow-hidden">
                  {data.profiles?.avatar_url ? <img src={data.profiles.avatar_url} alt="" /> : <span className="font-semibold">{data.profiles?.display_name?.[0]}</span>}
                </div>
                <span className="text-foreground font-medium group-hover:underline">{data.profiles?.display_name}</span>
              </Link>
              {data.profiles?.location && <span>• {data.profiles.location}</span>}
            </div>

            <div className="mt-6 prose prose-sm max-w-none whitespace-pre-wrap text-foreground">{data.description}</div>
          </div>

          <aside className="lg:sticky lg:top-20 self-start">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-sm text-muted-foreground">Mulai dari</div>
              <div className="font-display text-3xl font-semibold text-primary mt-1">{formatIDR(data.base_price)}</div>
              <div className="flex gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {data.turnaround_days} hari</div>
                <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {data.slots_available} slot</div>
              </div>
              <div className="h-px bg-border my-5" />
              <h3 className="font-semibold mb-3">Pesan komisi ini</h3>
              <form onSubmit={(e) => { e.preventDefault(); orderMutation.mutate(); }} className="space-y-3">
                <div>
                  <Label htmlFor="brief">Brief / deskripsi pesanan</Label>
                  <Textarea id="brief" required value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Ceritakan apa yang ingin kamu pesan..." className="mt-1 min-h-[100px]" />
                </div>
                <div>
                  <Label htmlFor="ref">Link referensi (opsional)</Label>
                  <Input id="ref" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="https://..." className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="budget">Budget (Rp)</Label>
                  <Input id="budget" type="number" min={data.base_price} value={budget} onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : "")} placeholder={String(data.base_price)} className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">Minimum {formatIDR(data.base_price)}. +5% biaya layanan.</p>
                </div>
                {user ? (
                  <Button type="submit" disabled={orderMutation.isPending} className="w-full h-11">
                    {orderMutation.isPending ? "Memproses..." : <>Buat Pesanan <ArrowRight className="h-4 w-4" /></>}
                  </Button>
                ) : (
                  <Link to="/auth" search={{ mode: "signup", redirect: `/commissions/${slug}` }} className="block">
                    <Button type="button" className="w-full h-11">Masuk untuk Memesan</Button>
                  </Link>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                  <ShieldCheck className="h-3.5 w-3.5" /> Dilindungi escrow Rumah Commis
                </div>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}