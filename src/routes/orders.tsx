import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteShell, StatusBadge } from "@/components/site-shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatIDR, formatRelative } from "@/lib/format";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "Pesanan — Rumah Commis" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"buying" | "selling">("buying");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/orders" } });
  }, [loading, user, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["orders-list", user?.id, tab],
    enabled: !!user,
    queryFn: async () => {
      const col = tab === "buying" ? "buyer_id" : "artist_id";
      const { data } = await supabase
        .from("orders")
        .select("id, brief, status, total_amount, created_at, commissions(title), buyer:buyer_id(display_name), artist:artist_id(display_name)")
        .eq(col, user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (loading || !user) return null;

  return (
    <SiteShell>
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="font-display text-3xl font-semibold mb-1">Pesanan</h1>
        <p className="text-muted-foreground mb-6">Kelola semua pesanan kamu di satu tempat.</p>

        <div className="inline-flex p-1 bg-secondary rounded-xl mb-6">
          {[
            ["buying", "Sebagai Buyer"],
            ["selling", "Sebagai Artist"],
          ].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k as any)}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition", tab === k ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}>
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">Memuat…</div>
        ) : !data?.length ? (
          <div className="rounded-2xl border border-dashed p-12 text-center">
            <Inbox className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">Belum ada pesanan</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {data.map((o: any) => (
              <Link key={o.id} to="/orders/$id" params={{ id: o.id }} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition gap-4">
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{o.commissions?.title ?? "Komisi"}</div>
                  <div className="text-xs text-muted-foreground truncate">{o.brief}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {tab === "buying" ? `Artist: ${o.artist?.display_name ?? "—"}` : `Buyer: ${o.buyer?.display_name ?? "—"}`} • {formatRelative(o.created_at)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={o.status} />
                  <div className="text-sm font-semibold">{formatIDR(o.total_amount)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}