import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck, Sparkles, Wallet, Star, Brush } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/format";
import heroImage from "@/assets/hero-collage.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rumah Commis — Marketplace Komisi Seni Indonesia" },
      { name: "description", content: "Tempat berkarya & berkomisi. Pesan ilustrasi, chibi, portrait, dan logo dari artist Indonesia — aman dengan sistem escrow." },
      { property: "og:title", content: "Rumah Commis — Marketplace Komisi Seni Indonesia" },
      { property: "og:description", content: "Marketplace komisi seni Indonesia. Pesan aman, artist sejahtera." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteShell>
      <Hero />
      <CategoryStrip />
      <FeaturedCommissions />
      <HowItWorks />
      <ArtistCTA />
    </SiteShell>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/30 via-background to-secondary" />
      <div className="container mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5">
            <Sparkles className="h-3.5 w-3.5" /> Marketplace #1 untuk komisi seni lokal
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
            Tempat berkarya &<br />
            <span className="text-primary italic">berkomisi.</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl">
            Pesan karya original dari ratusan seniman Indonesia. Bayar aman dengan
            sistem escrow — dana baru cair setelah karya kamu terima.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/explore">
              <Button size="lg" className="h-12 px-6 text-base">
                Jelajahi Komisi <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/become-artist">
              <Button size="lg" variant="outline" className="h-12 px-6 text-base">
                Jadi Artist
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Escrow aman</div>
            <div className="flex items-center gap-2"><Star className="h-4 w-4 text-primary" /> Artist terverifikasi</div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 bg-primary/10 rounded-[2rem] rotate-2" />
          <img src={heroImage} alt="Kumpulan contoh komisi seni" className="relative rounded-[1.75rem] shadow-xl border border-border w-full object-cover aspect-[4/3]" />
          <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl shadow-lg p-4 flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary text-primary-foreground"><Wallet className="h-5 w-5" /></div>
            <div>
              <div className="text-xs text-muted-foreground">Mulai dari</div>
              <div className="font-semibold">{formatIDR(35000)}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryStrip() {
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("position");
      if (error) throw error;
      return data;
    },
  });
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-end justify-between mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-semibold">Pilih Kategori</h2>
        <Link to="/explore" className="text-sm text-primary font-medium hover:underline">Lihat semua →</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {(data ?? []).map((c) => (
          <Link key={c.id} to="/explore" search={{ category: c.slug }}
            className="group rounded-2xl border border-border bg-card p-4 hover:border-primary hover:shadow-md transition">
            <div className="h-10 w-10 grid place-items-center rounded-xl bg-accent/40 text-accent-foreground mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition">
              <Brush className="h-5 w-5" />
            </div>
            <div className="font-semibold text-sm">{c.name}</div>
            <div className="text-xs text-muted-foreground truncate">{c.description}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedCommissions() {
  const { data, isLoading } = useQuery({
    queryKey: ["commissions", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commissions")
        .select("id, title, slug, base_price, turnaround_days, cover_image_url, artist_id, profiles:artist_id(display_name, avatar_url)")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-semibold">Komisi pilihan</h2>
          <p className="text-muted-foreground text-sm mt-1">Karya hangat dari artist lokal.</p>
        </div>
        <Link to="/explore" className="text-sm text-primary font-medium hover:underline">Semua →</Link>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-2xl bg-secondary animate-pulse" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyShowcase />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((c: any) => <CommissionCard key={c.id} c={c} />)}
        </div>
      )}
    </section>
  );
}

export function CommissionCard({ c }: { c: any }) {
  return (
    <Link to="/commissions/$slug" params={{ slug: c.slug }} className="group">
      <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-secondary border border-border relative">
        {c.cover_image_url ? (
          <img src={c.cover_image_url} alt={c.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition" />
        ) : (
          <div className="w-full h-full grid place-items-center bg-gradient-to-br from-accent/30 to-primary/20">
            <Brush className="h-10 w-10 text-primary/60" />
          </div>
        )}
        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-background/90 backdrop-blur text-xs font-semibold">
          {formatIDR(c.base_price)} • {c.turnaround_days}h
        </div>
      </div>
      <div className="mt-2.5">
        <div className="font-medium text-sm line-clamp-1">{c.title}</div>
        <div className="text-xs text-muted-foreground line-clamp-1">oleh {c.profiles?.display_name ?? "Artist"}</div>
      </div>
    </Link>
  );
}

function EmptyShowcase() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <Brush className="h-10 w-10 mx-auto text-primary/60 mb-3" />
      <p className="font-medium">Belum ada komisi yang ditampilkan.</p>
      <p className="text-sm text-muted-foreground mt-1">Jadi artist pertama yang membuka komisi di Rumah Commis!</p>
      <Link to="/become-artist" className="inline-block mt-4">
        <Button>Mulai sebagai Artist</Button>
      </Link>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { n: 1, t: "Pilih komisi", d: "Telusuri ratusan paket dari artist lokal sesuai gaya & budget kamu." },
    { n: 2, t: "Bayar aman", d: "Dana ditahan platform sampai karya selesai. Jika ada masalah, bisa diajukan sengketa." },
    { n: 3, t: "Terima karya", d: "Diskusi langsung dengan artist via chat. Konfirmasi untuk lepaskan dana." },
  ];
  return (
    <section className="bg-secondary/40 border-y border-border/60 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-semibold">Cara kerjanya</h2>
          <p className="text-muted-foreground mt-2">Sederhana, transparan, aman untuk kedua belah pihak.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl bg-card border border-border p-6">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-display font-semibold mb-4">{s.n}</div>
              <h3 className="font-display text-xl font-semibold">{s.t}</h3>
              <p className="text-sm text-muted-foreground mt-2">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArtistCTA() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 md:p-14 grid md:grid-cols-[1fr_auto] items-center gap-6">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold">Kamu seniman? Buka lapakmu hari ini.</h2>
          <p className="mt-3 text-primary-foreground/90 max-w-2xl">
            Tanpa biaya buka akun. Hanya 5% biaya layanan saat ada pesanan selesai.
            Cair ke rekening / e-wallet kamu langsung.
          </p>
        </div>
        <Link to="/become-artist">
          <Button size="lg" variant="secondary" className="h-12 px-6 text-base">Mulai sekarang</Button>
        </Link>
      </div>
    </section>
  );
}
