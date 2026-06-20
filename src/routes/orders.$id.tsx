import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SiteShell, StatusBadge } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatIDR, formatRelative, ORDER_STATUS_LABEL } from "@/lib/format";
import { toast } from "sonner";
import { Send, CheckCircle2, AlertTriangle, Package, CreditCard } from "lucide-react";

export const Route = createFileRoute("/orders/$id")({
  head: () => ({ meta: [{ title: "Detail Pesanan — Rumah Commis" }] }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: `/orders/${id}` } });
  }, [loading, user, navigate, id]);

  const { data: order } = useQuery({
    queryKey: ["order", id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, commissions(title, slug), buyer:buyer_id(display_name, avatar_url), artist:artist_id(display_name, avatar_url)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["messages", id],
    enabled: !!user && !!order,
    queryFn: async () => {
      const { data } = await supabase
        .from("order_messages")
        .select("*, sender:sender_id(display_name, avatar_url)")
        .eq("order_id", id)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
    refetchInterval: 5000,
  });

  const [content, setContent] = useState("");
  const sendMsg = useMutation({
    mutationFn: async () => {
      if (!content.trim()) return;
      const { error } = await supabase.from("order_messages").insert({
        order_id: id, sender_id: user!.id, content,
      });
      if (error) throw error;
    },
    onSuccess: () => { setContent(""); qc.invalidateQueries({ queryKey: ["messages", id] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateOrder = useMutation({
    mutationFn: async (patch: any) => {
      const { error } = await supabase.from("orders").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["order", id] }); toast.success("Status diperbarui"); },
    onError: (e: any) => toast.error(e.message),
  });

  const completeOrder = useMutation({
    mutationFn: async () => {
      const artistAmount = (order!.budget_idr); // artist gets budget, platform keeps fee
      const { error: e1 } = await supabase.from("orders").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("wallet_transactions").insert({
        user_id: order!.artist_id, type: "order_release", amount: artistAmount, order_id: id,
        note: `Pelepasan dana pesanan ${order!.commissions?.title ?? ""}`,
      });
      if (e2) throw e2;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["order", id] });
      toast.success("Pesanan selesai! Dana dilepas ke artist.");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const [disputeReason, setDisputeReason] = useState("");
  const openDispute = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("disputes").insert({
        order_id: id, opener_id: user!.id, reason: disputeReason || "Tidak puas dengan hasil",
      });
      if (error) throw error;
      await supabase.from("orders").update({ status: "disputed" }).eq("id", id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["order", id] }); toast.success("Sengketa diajukan."); },
    onError: (e: any) => toast.error(e.message),
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 99999 }); }, [messages]);

  if (loading || !user || !order) return <SiteShell><div className="container mx-auto px-4 py-20 text-center">Memuat…</div></SiteShell>;

  const isBuyer = user.id === order.buyer_id;
  const isArtist = user.id === order.artist_id;
  const counterparty = isBuyer ? order.artist : order.buyer;

  return (
    <SiteShell>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/orders" className="text-sm text-muted-foreground hover:text-foreground">← Kembali ke pesanan</Link>
        <div className="flex flex-wrap items-start justify-between gap-3 mt-3 mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-semibold">{order.commissions?.title ?? "Komisi kustom"}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isBuyer ? "Artist:" : "Buyer:"} <span className="font-medium text-foreground">{counterparty?.display_name}</span> • {formatRelative(order.created_at)}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-semibold mb-2">Brief pesanan</h3>
              <p className="text-sm whitespace-pre-wrap">{order.brief}</p>
              {order.reference_url && (
                <a href={order.reference_url} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline block mt-2">↗ {order.reference_url}</a>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card flex flex-col h-[480px]">
              <div className="px-5 py-3 border-b border-border font-semibold text-sm">Diskusi</div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {!messages?.length ? (
                  <p className="text-center text-sm text-muted-foreground py-10">Mulai percakapan dengan {counterparty?.display_name}.</p>
                ) : messages.map((m: any) => {
                  const me = m.sender_id === user.id;
                  return (
                    <div key={m.id} className={`flex ${me ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${me ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                        {!me && <div className="text-xs font-medium opacity-70 mb-0.5">{m.sender?.display_name}</div>}
                        <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                        <div className={`text-[10px] mt-1 ${me ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{formatRelative(m.created_at)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); sendMsg.mutate(); }} className="border-t border-border p-3 flex gap-2">
                <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Tulis pesan…" />
                <Button type="submit" disabled={!content.trim() || sendMsg.isPending}><Send className="h-4 w-4" /></Button>
              </form>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-semibold mb-3">Ringkasan</h3>
              <Row label="Budget" value={formatIDR(order.budget_idr)} />
              <Row label="Biaya layanan" value={formatIDR(order.service_fee)} />
              <div className="h-px bg-border my-2" />
              <Row label="Total" value={formatIDR(order.total_amount)} bold />
              <div className="text-xs text-muted-foreground mt-3">Status: {ORDER_STATUS_LABEL[order.status]}</div>
            </div>

            {/* Buyer actions */}
            {isBuyer && order.status === "pending_payment" && (
              <Link to="/orders/$id/checkout" params={{ id }}>
                <Button className="w-full h-11"><CreditCard className="h-4 w-4" /> Bayar Sekarang</Button>
              </Link>
            )}
            {isBuyer && order.status === "awaiting_confirmation" && (
              <Button onClick={() => completeOrder.mutate()} disabled={completeOrder.isPending} className="w-full h-11">
                <CheckCircle2 className="h-4 w-4" /> Konfirmasi Selesai
              </Button>
            )}
            {isBuyer && ["paid", "in_progress", "awaiting_confirmation"].includes(order.status) && (
              <details className="rounded-2xl border border-border bg-card p-4">
                <summary className="cursor-pointer text-sm font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Ajukan sengketa</summary>
                <div className="mt-3 space-y-2">
                  <Textarea value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} placeholder="Jelaskan masalahnya..." className="min-h-[80px]" />
                  <Button variant="destructive" size="sm" onClick={() => openDispute.mutate()} className="w-full">Kirim sengketa</Button>
                </div>
              </details>
            )}

            {/* Artist actions */}
            {isArtist && order.status === "paid" && (
              <Button onClick={() => updateOrder.mutate({ status: "in_progress" })} className="w-full h-11">
                <Package className="h-4 w-4" /> Mulai Kerjakan
              </Button>
            )}
            {isArtist && order.status === "in_progress" && (
              <Button onClick={() => updateOrder.mutate({ status: "awaiting_confirmation", awaiting_confirmation_at: new Date().toISOString() })} className="w-full h-11">
                <CheckCircle2 className="h-4 w-4" /> Kirim Hasil
              </Button>
            )}

            {order.delivery_url && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground">Pengiriman</div>
                <a href={order.delivery_url} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline">↗ Lihat file</a>
              </div>
            )}
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm py-1 ${bold ? "font-semibold text-base" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}