import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site-shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatIDR, formatRelative } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Wallet as WalletIcon } from "lucide-react";

export const Route = createFileRoute("/wallet")({
  head: () => ({ meta: [{ title: "Dompet — Rumah Commis" }] }),
  component: WalletPage,
});

function WalletPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/wallet" } });
  }, [loading, user, navigate]);

  const { data: txs } = useQuery({
    queryKey: ["wallet-txs", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("wallet_transactions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });

  const balance = (txs ?? []).reduce((s, t) => s + t.amount, 0);

  if (loading || !user) return null;

  return (
    <SiteShell>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="font-display text-3xl font-semibold mb-6">Dompet</h1>

        <div className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 mb-6">
          <div className="flex items-center gap-2 text-sm opacity-90"><WalletIcon className="h-4 w-4" /> Saldo tersedia</div>
          <div className="font-display text-4xl font-semibold mt-2">{formatIDR(balance)}</div>
          <Button variant="secondary" className="mt-5" disabled={balance < 50000}>Tarik Dana</Button>
          {balance < 50000 && <p className="text-xs opacity-80 mt-2">Minimum penarikan {formatIDR(50000)}</p>}
        </div>

        <h2 className="font-display text-xl font-semibold mb-3">Riwayat Transaksi</h2>
        {!txs?.length ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">Belum ada transaksi</div>
        ) : (
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {txs.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium text-sm">{t.note ?? t.type}</div>
                  <div className="text-xs text-muted-foreground">{formatRelative(t.created_at)}</div>
                </div>
                <div className={`font-semibold ${t.amount > 0 ? "text-emerald-600" : "text-destructive"}`}>
                  {t.amount > 0 ? "+" : ""}{formatIDR(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}