import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site-shell";
import { supabase } from "@/integrations/supabase/client";
import { Brush } from "lucide-react";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Kategori — Rumah Commis" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("position")).data ?? [],
  });
  return (
    <SiteShell>
      <div className="container mx-auto px-4 py-10">
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">Semua Kategori</h1>
        <p className="text-muted-foreground mb-8">Pilih kategori untuk menemukan komisi favoritmu.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map((c) => (
            <Link key={c.id} to="/explore" search={{ category: c.slug }}
              className="rounded-2xl border border-border bg-card p-6 hover:border-primary hover:shadow-md transition group">
              <div className="h-12 w-12 grid place-items-center rounded-xl bg-accent/40 text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground transition mb-4">
                <Brush className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold">{c.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}