import { Link, useNavigate } from "@tanstack/react-router";
import { Brush, Compass, LayoutGrid, LogOut, MessageSquare, Wallet, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthDialog } from "@/components/auth-dialog";

const NAV = [
  { to: "/explore", label: "Jelajahi", icon: Compass },
  { to: "/categories", label: "Kategori", icon: LayoutGrid },
  { to: "/about", label: "Tentang", icon: null },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  function openAuth(mode: "signin" | "signup") {
    setAuthMode(mode);
    setAuthOpen(true);
    setOpen(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid place-items-center h-9 w-9 rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Brush className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">
            Rumah <span className="text-primary">Commis</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition"
              activeProps={{ className: "text-foreground bg-secondary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          {loading ? null : user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" /> Keluar
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => openAuth("signin")}>Masuk</Button>
              <Button size="sm" onClick={() => openAuth("signup")}>Daftar</Button>
            </>
          )}
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen((s) => !s)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto flex flex-col gap-1 p-3">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary">
                {n.label}
              </Link>
            ))}
            <div className="h-px bg-border my-2" />
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary">Dashboard</Link>
                <Link to="/orders" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary">Pesanan</Link>
                <button onClick={signOut} className="text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary">Keluar</button>
              </>
            ) : (
              <>
                <button onClick={() => openAuth("signin")} className="text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary">Masuk</button>
                <button onClick={() => openAuth("signup")} className="text-left px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground">Daftar</button>
              </>
            )}
          </div>
        </div>
      )}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} defaultMode={authMode} />
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40 mt-20">
      <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
              <Brush className="h-4 w-4" />
            </span>
            <span className="font-display font-semibold">Rumah Commis</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Marketplace komisi seni Indonesia. Pesan aman, artist sejahtera.
          </p>
        </div>
        <FooterCol title="Jelajahi" items={[["Semua Komisi", "/explore"], ["Kategori", "/categories"], ["Top Artist", "/explore"]]} />
        <FooterCol title="Untuk Artist" items={[["Jadi Artist", "/become-artist"], ["Panduan", "/about"], ["Dompet", "/wallet"]]} />
        <FooterCol title="Bantuan" items={[["FAQ", "/about"], ["Sengketa", "/about"], ["Kontak", "/about"]]} />
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Rumah Commis. Dibuat dengan ❤️ untuk seniman Indonesia.
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <h4 className="font-semibold mb-3 text-sm">{title}</h4>
      <ul className="space-y-2 text-sm">
        {items.map(([label, href]) => (
          <li key={label + href}><a href={href} className="text-muted-foreground hover:text-foreground">{label}</a></li>
        ))}
      </ul>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const label = ({
    pending_payment: "Menunggu Bayar",
    paid: "Dibayar",
    in_progress: "Dikerjakan",
    awaiting_confirmation: "Konfirmasi",
    completed: "Selesai",
    cancelled: "Batal",
    disputed: "Sengketa",
    refunded: "Refund",
  } as Record<string, string>)[status] ?? status;
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", statusTone(status))}>{label}</span>
  );
}

function statusTone(status: string) {
  switch (status) {
    case "pending_payment": return "bg-amber-100 text-amber-900 border-amber-200";
    case "paid": return "bg-sky-100 text-sky-900 border-sky-200";
    case "in_progress": return "bg-blue-100 text-blue-900 border-blue-200";
    case "awaiting_confirmation": return "bg-violet-100 text-violet-900 border-violet-200";
    case "completed": return "bg-emerald-100 text-emerald-900 border-emerald-200";
    case "disputed": return "bg-rose-100 text-rose-900 border-rose-200";
    default: return "bg-zinc-200 text-zinc-800 border-zinc-300";
  }
}