import { useState } from "react";
import { Brush } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export function AuthDialog({
  open,
  onOpenChange,
  defaultMode = "signin",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultMode?: "signin" | "signup";
}) {
  const [isSignUp, setIsSignUp] = useState(defaultMode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/",
            data: { display_name: name },
          },
        });
        if (error) throw error;
        setPendingVerification(email);
        toast.success("Akun dibuat — cek email kamu untuk verifikasi.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message?.toLowerCase().includes("email not confirmed")) {
            setPendingVerification(email);
            throw new Error("Email kamu belum diverifikasi. Cek inbox atau kirim ulang link verifikasi.");
          }
          throw error;
        }
        toast.success("Selamat datang kembali!");
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err.message ?? "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    if (!pendingVerification) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: pendingVerification,
        options: { emailRedirectTo: window.location.origin + "/" },
      });
      if (error) throw error;
      toast.success("Email verifikasi terkirim ulang.");
    } catch (err: any) {
      toast.error(err.message ?? "Gagal mengirim ulang");
    } finally {
      setResending(false);
    }
  }

  async function googleSignIn() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/",
    });
    if (result.error) toast.error("Gagal login Google");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <Brush className="h-5 w-5 text-primary" />
            {isSignUp ? "Daftar gratis" : "Masuk ke Rumah Commis"}
          </DialogTitle>
          <DialogDescription>
            {isSignUp ? "Buat akun untuk mulai memesan komisi." : "Selamat datang kembali."}
          </DialogDescription>
        </DialogHeader>

        <Button variant="outline" className="w-full h-11" onClick={googleSignIn}>
          <GoogleIcon /> Lanjut dengan Google
        </Button>

        {pendingVerification && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
            <p className="font-medium text-foreground">Verifikasi email kamu</p>
            <p className="text-muted-foreground mt-1">
              Link verifikasi dikirim ke <span className="font-medium text-foreground">{pendingVerification}</span>.
            </p>
            <button
              type="button"
              onClick={resendVerification}
              disabled={resending}
              className="text-primary font-medium hover:underline mt-2 disabled:opacity-50"
            >
              {resending ? "Mengirim…" : "Kirim ulang email verifikasi"}
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">atau email</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {isSignUp && (
            <div>
              <Label htmlFor="ad-name">Nama tampilan</Label>
              <Input id="ad-name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" />
            </div>
          )}
          <div>
            <Label htmlFor="ad-email">Email</Label>
            <Input id="ad-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="ad-password">Password</Label>
            <Input id="ad-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="mt-1" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 mt-1">
            {loading ? "Memproses..." : isSignUp ? "Buat akun" : "Masuk"}
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground">
          {isSignUp ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-medium hover:underline">
            {isSignUp ? "Masuk" : "Daftar"}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
  );
}