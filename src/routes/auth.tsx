import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Brush, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Masuk / Daftar — Ngommis-yok" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode = "signin", redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: (redirect as any) ?? "/dashboard", replace: true });
  }, [user, redirect, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
            data: { display_name: name },
          },
        });
        if (error) throw error;
        toast.success("Akun dibuat! Cek email jika diminta verifikasi.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Selamat datang kembali!");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function googleSignIn() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) toast.error("Gagal login Google");
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground p-12">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <Brush className="h-6 w-6" /> Ngommis-yok
        </Link>
        <div>
          <h2 className="font-display text-4xl font-semibold leading-tight">
            Berkarya. <br />Berkomisi. <br /><span className="italic">Bersama.</span>
          </h2>
          <p className="mt-4 text-primary-foreground/90 max-w-md">
            Bergabunglah dengan komunitas seniman & kolektor Indonesia.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">© Ngommis-yok</p>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8">
            <Link to="/" className="inline-flex items-center gap-2 font-display text-xl font-semibold">
              <Brush className="h-5 w-5 text-primary" /> Ngommis-yok
            </Link>
          </div>
          <h1 className="font-display text-3xl font-semibold">{isSignUp ? "Daftar gratis" : "Masuk"}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isSignUp ? "Buat akun untuk mulai memesan komisi." : "Selamat datang kembali."}
          </p>

          <Button variant="outline" className="w-full mt-6 h-11" onClick={googleSignIn}>
            <GoogleIcon /> Lanjut dengan Google
          </Button>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">atau email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {isSignUp && (
              <div>
                <Label htmlFor="name">Nama tampilan</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="mt-1" />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 mt-2">
              {loading ? "Memproses..." : isSignUp ? "Buat akun" : "Masuk"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-5">
            {isSignUp ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-medium hover:underline">
              {isSignUp ? "Masuk" : "Daftar"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
  );
}