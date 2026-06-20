import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Search } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { CommissionCard } from "./index";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const searchSchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/explore")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Jelajahi Komisi — Rumah Commis" }] }),
  component: ExplorePage,
});

function ExplorePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.q ?? "");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("position");
      return data ?? [];
    },
  });

  const { data: commissions, isLoading } = useQuery({
    queryKey: ["commissions", search.category, search.q],
    queryFn: async () => {
      let query = supabase
        .from("commissions")
        .select("id, title, slug, base_price, turnaround_days, cover_image_url, category_id, artist_id, profiles:artist_id(display_name, avatar_url), categories(slug,name)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (search.category) {
        const cat = categories?.find((c) => c.slug === search.category);
        if (cat) query = query.eq("category_id", cat.id);
      }
      if (search.q) query = query.ilike("title", `%${search.q}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !search.category || !!categories,
  });

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ search: (prev: any) => ({ ...prev, q: q || undefined }) });
  }

  return (
    <SiteShell>
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col gap-3 mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-semibold">Jelajahi Komisi</h1>
          <p className="text-muted-foreground">Temukan artist yang cocok dengan gaya & budget kamu.</p>
          <form onSubmit={applySearch} className="relative max-w-xl">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari ilustrasi, chibi, logo..." className="pl-9 h-11" />
          </form>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          <Link to="/explore" search={{}} className={chipCls(!search.category)}>Semua</Link>
          {categories?.map((c) => (
            <Link key={c.id} to="/explore" search={{ category: c.slug }} className={chipCls(search.category === c.slug)}>
              {c.name}
            </Link>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[4/5] rounded-2xl bg-secondary animate-pulse" />)}
          </div>
        ) : !commissions || commissions.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
            Belum ada komisi {search.category ? "di kategori ini" : ""}. Coba kategori lain.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {commissions.map((c: any) => <CommissionCard key={c.id} c={c} />)}
          </div>
        )}
      </div>
    </SiteShell>
  );
}

function chipCls(active: boolean) {
  return `px-4 py-2 rounded-full text-sm border transition ${
    active ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-secondary border-border"
  }`;
}