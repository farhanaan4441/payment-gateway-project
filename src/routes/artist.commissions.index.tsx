import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatIDR } from "@/lib/format";
import { Plus, Brush, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/artist/commissions")({
  head: () => ({ meta: [{ title: "Kelola Komisi — Rumah Commis" }] }),
  component: ArtistCommissions,
});

function ArtistCommissions() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/artist/commissions" } });
  }, [loading, user, navigate]);

  const { data } = useQuery({
    queryKey: ["artist-commissions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("commissions").select("*, categories(name)").eq("artist_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("commissions").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["artist-commissions"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("commissions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["artist-commissions"] }); toast.success("Komisi dihapus"); },
  });

  if (loading || !user) return null;

  return (
    <SiteShell>
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="font-display text-3xl font-semibold">Kelola Komisi</h1>
            <p className="text-muted-foreground">Paket komisi yang kamu tawarkan.</p>
          </div>
          <Link to="/artist/commissions/new"><Button><Plus className="h-4 w-4" /> Komisi Baru</Button></Link>
        </div>

        {!data?.length ? (
          <div className="rounded-2xl border border-dashed p-12 text-center">
            <Brush className="h-10 w-10 mx-auto text-primary/60 mb-3" />
            <p className="font-medium">Belum ada komisi</p>
            <p className="text-sm text-muted-foreground mt-1">Buat komisi pertamamu agar bisa menerima pesanan.</p>
            <Link to="/artist/commissions/new" className="inline-block mt-4">
              <Button>Buat Komisi</Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {data.map((c: any) => (
              <div key={c.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="aspect-[4/3] bg-secondary">
                  {c.cover_image_url ? <img src={c.cover_image_url} alt={c.title} className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full grid place-items-center"><Brush className="h-10 w-10 text-primary/40" /></div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{c.title}</div>
                      <div className="text-xs text-muted-foreground">{c.categories?.name} • {formatIDR(c.base_price)}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${c.is_active ? "bg-emerald-100 text-emerald-900 border-emerald-200" : "bg-zinc-200 text-zinc-700 border-zinc-300"}`}>
                      {c.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => toggleActive.mutate({ id: c.id, is_active: !c.is_active })}>
                      {c.is_active ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                    <Link to="/commissions/$slug" params={{ slug: c.slug }} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">Lihat</Button>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={() => confirm("Hapus komisi ini?") && del.mutate(c.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}