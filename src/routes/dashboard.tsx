import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteShell, StatusBadge } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatIDR, formatRelative } from "@/lib/format";
import { ShoppingBag, Palette, Wallet, Plus, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Rumah Commis" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/dashboard" } });
  }, [loading, user, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: roles } = useQuery({
    queryKey: ["roles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      return data?.map((r) => r.role) ?? [];
    },
  });

  const { data: buyerOrders } = useQuery({
    queryKey: ["orders", "buyer", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("id, brief, status, total_amount, created_at, commissions(title)").eq("buyer_id", user!.id).order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  const isArtist = roles?.includes("artist");

  const { data: artistOrders } = useQuery({
    queryKey: ["orders", "artist", user?.id],
    enabled: !!user && !!isArtist,
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("id, brief, status, total_amount, created_at, commissions(title), profiles:buyer_id(display_name)").eq("artist_id", user!.id).order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  const { data: walletBalance } = useQuery({
    queryKey: ["wallet", user?.id],
    enabled: !!user && !!isArtist,
    queryFn: async () => {
      const { data } = await supabase.from("wallet_transactions").select("amount").eq("user_id", user!.id);
      return (data ?? []).reduce((sum, t) => sum + t.amount, 0);
    },
  });

  if (loading || !user) return null;

  return (
    <SiteShell>
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
          <div>
            <p className="text-sm text-muted-foreground">Halo,</p>
            <h1 className="font-display text-3xl font-semibold">{profile?.display_name ?? "Pengguna"} 👋</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/orders"><Button variant="outline">Pesananku</Button></Link>
            {isArtist ? (
              <Link to="/artist/commissions"><Button>Kelola Komisi</Button></Link>
            ) : (
              <Link to="/become-artist"><Button><Palette className="h-4 w-4" /> Jadi Artist</Button></Link>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <StatCard icon={<ShoppingBag className="h-5 w-5" />} label="Pesanan saya" value={buyerOrders?.length ?? 0} href="/orders" />
          {isArtist && <StatCard icon={<Palette className="h-5 w-5" />} label="Pesanan masuk" value={artistOrders?.length ?? 0} href="/orders" />}
          {isArtist && <StatCard icon={<Wallet className="h-5 w-5" />} label="Saldo dompet" value={formatIDR(walletBalance ?? 0)} href="/wallet" />}
        </div>

        <Section title="Pesanan saya" href="/orders">
          <OrderList items={buyerOrders ?? []} empty="Belum ada pesanan. Jelajahi katalog!" emptyHref="/explore" />
        </Section>

        {isArtist && (
          <Section title="Pesanan masuk" href="/orders">
            <OrderList items={artistOrders ?? []} empty="Belum ada pesanan masuk." />
          </Section>
        )}
      </div>
    </SiteShell>
  );
}

function StatCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: any; href: string }) {
  return (
    <Link to={href} className="rounded-2xl border border-border bg-card p-5 hover:border-primary transition">
      <div className="flex items-center gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary">{icon}</div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-display text-2xl font-semibold">{value}</div>
        </div>
      </div>
    </Link>
  );
}

function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {href && <Link to={href} className="text-sm text-primary hover:underline">Lihat semua →</Link>}
      </div>
      {children}
    </section>
  );
}

function OrderList({ items, empty, emptyHref }: { items: any[]; empty: string; emptyHref?: string }) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
        {empty}
        {emptyHref && <div className="mt-3"><Link to={emptyHref}><Button size="sm" variant="outline">Jelajahi <ArrowRight className="h-4 w-4" /></Button></Link></div>}
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
      {items.map((o) => (
        <Link key={o.id} to="/orders/$id" params={{ id: o.id }} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition">
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">{o.commissions?.title ?? "Komisi"}</div>
            <div className="text-xs text-muted-foreground truncate">{o.brief}</div>
            <div className="text-xs text-muted-foreground mt-1">{formatRelative(o.created_at)}</div>
          </div>
          <div className="flex flex-col items-end gap-1 ml-3">
            <StatusBadge status={o.status} />
            <div className="text-sm font-semibold">{formatIDR(o.total_amount)}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}