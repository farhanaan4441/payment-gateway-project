import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatIDR } from "@/lib/format";
import { toast } from "sonner";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const METHODS = [
  { id: "qris", name: "QRIS", desc: "Scan dengan e-wallet apapun" },
  { id: "va_bca", name: "Virtual Account BCA", desc: "Transfer ke nomor VA" },
  { id: "va_mandiri", name: "Virtual Account Mandiri", desc: "Transfer ke nomor VA" },
  { id: "gopay", name: "GoPay", desc: "Bayar via aplikasi GoPay" },
  { id: "ovo", name: "OVO", desc: "Bayar via aplikasi OVO" },
  { id: "dana", name: "DANA", desc: "Bayar via aplikasi DANA" },
];

export const Route = createFileRoute("/orders/$id/checkout")({
  head: () => ({ meta: [{ title: "Pembayaran — Ngommis-yok" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState("qris");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: `/orders/${id}/checkout` } });
  }, [loading, user, navigate, id]);

  const { data: order } = useQuery({
    queryKey: ["order", id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, commissions(title), artist:artist_id(display_name)").eq("id", id).maybeSingle();
      return data as any;
    },
  });

  const pay = useMutation({
    mutationFn: async () => {
      // MOCK payment: in real impl this would create Midtrans/Stripe session
      const { error: e1 } = await supabase.from("payments").insert({
        order_id: id, provider: "mock", method, amount: order!.total_amount, status: "succeeded",
        provider_txn_id: `MOCK-${Date.now()}`,
      });
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("orders").update({ status: "paid" }).eq("id", id);
      if (e2) throw e2;
    },
    onSuccess: () => {
      toast.success("Pembayaran berhasil! (mode demo)");
      navigate({ to: "/orders/$id", params: { id } });
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (loading || !user || !order) return null;
  if (order.status !== "pending_payment") {
    return (
      <SiteShell>
        <div className="container mx-auto px-4 py-20 text-center max-w-md">
          <CheckCircle2 className="h-12 w-12 mx-auto text-primary mb-3" />
          <h2 className="font-display text-2xl font-semibold">Pesanan sudah dibayar</h2>
          <p className="text-muted-foreground mt-2">Status saat ini: {order.status}</p>
          <Link to="/orders/$id" params={{ id }}><Button className="mt-4">Lihat Pesanan</Button></Link>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="font-display text-3xl font-semibold mb-1">Pembayaran</h1>
        <p className="text-muted-foreground mb-2">Dana akan ditahan oleh platform sampai karya selesai.</p>
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 mb-6">
          <ShieldCheck className="h-3.5 w-3.5" /> Mode demo — pembayaran disimulasikan, tanpa pemotongan asli
        </div>

        <div className="grid md:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold mb-2">Pilih metode pembayaran</h3>
            {METHODS.map((m) => (
              <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                className={cn("w-full text-left rounded-xl border p-4 transition flex items-center gap-3",
                  method === m.id ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border bg-card hover:border-primary/50")}>
                <div className={cn("h-5 w-5 rounded-full border-2 grid place-items-center",
                  method === m.id ? "border-primary" : "border-border")}>
                  {method === m.id && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.desc}</div>
                </div>
              </button>
            ))}
          </div>
          <aside className="rounded-2xl border border-border bg-card p-5 h-fit">
            <h3 className="font-semibold mb-3">Ringkasan</h3>
            <div className="text-sm space-y-1.5">
              <div className="font-medium">{order.commissions?.title}</div>
              <div className="text-muted-foreground text-xs">Artist: {order.artist?.display_name}</div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between"><span className="text-muted-foreground">Budget</span><span>{formatIDR(order.budget_idr)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Biaya layanan (5%)</span><span>{formatIDR(order.service_fee)}</span></div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between font-semibold text-base"><span>Total</span><span className="text-primary">{formatIDR(order.total_amount)}</span></div>
            </div>
            <Button onClick={() => pay.mutate()} disabled={pay.isPending} className="w-full h-11 mt-5">
              <Lock className="h-4 w-4" /> {pay.isPending ? "Memproses..." : "Bayar Sekarang"}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-3">
              Klik = simulasi pembayaran berhasil
            </p>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}