import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Sparkles, Heart, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "Tentang — Ngommis-yok" }] }),
  component: About,
});

function About() {
  return (
    <SiteShell>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="font-display text-4xl md:text-5xl font-semibold">Tentang Ngommis-yok</h1>
        <p className="text-lg text-muted-foreground mt-4">
          Ngommis-yok adalah marketplace komisi seni Indonesia. Misi kami:
          membuat proses pesan-memesan komisi jadi <em className="font-display">aman, transparan, dan adil</em> —
          untuk seniman dan kolektor.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mt-10">
          <Card icon={<ShieldCheck className="h-5 w-5" />} title="Escrow aman" desc="Dana ditahan platform sampai karya selesai dan dikonfirmasi buyer." />
          <Card icon={<Sparkles className="h-5 w-5" />} title="Artist lokal" desc="Mendukung seniman Indonesia dengan biaya layanan yang adil — hanya 5%." />
          <Card icon={<MessageCircle className="h-5 w-5" />} title="Diskusi terpusat" desc="Semua komunikasi pesanan terekam rapi di satu tempat." />
          <Card icon={<Heart className="h-5 w-5" />} title="Sengketa terbuka" desc="Tim admin memediasi setiap masalah agar adil untuk kedua pihak." />
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl font-semibold">FAQ singkat</h2>
          <Faq q="Bagaimana cara kerja escrow?" a="Saat kamu bayar, dana masuk ke rekening platform — bukan langsung ke artist. Setelah karya selesai dan kamu konfirmasi, dana akan dilepas ke dompet artist." />
          <Faq q="Berapa biaya layanan?" a="5% dari nilai pesanan, dibayar oleh buyer di atas budget. Artist menerima 100% nilai budget yang disepakati." />
          <Faq q="Bisa refund?" a="Bisa, sebelum artist mulai mengerjakan. Setelah pengerjaan dimulai, refund bergantung pada hasil mediasi sengketa." />
          <Faq q="Metode pembayaran apa saja?" a="QRIS, Virtual Account bank besar, GoPay, OVO, DANA, dan ShopeePay. (Saat ini dalam mode demo.)" />
        </div>

        <div className="mt-10 text-center">
          <Link to="/explore"><Button size="lg">Mulai Jelajahi</Button></Link>
        </div>
      </div>
    </SiteShell>
  );
}

function Card({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-3">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="border-t border-border py-3 group">
      <summary className="cursor-pointer font-medium flex items-center justify-between">{q}<span className="text-muted-foreground group-open:rotate-180 transition">⌄</span></summary>
      <p className="text-sm text-muted-foreground mt-2">{a}</p>
    </details>
  );
}