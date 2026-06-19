export function formatIDR(amount: number | null | undefined): string {
  if (amount == null) return "Rp—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(input: string | Date | null | undefined): string {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatRelative(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}h lalu`;
  return formatDate(d);
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending_payment: "Menunggu Pembayaran",
  paid: "Sudah Dibayar",
  in_progress: "Sedang Dikerjakan",
  awaiting_confirmation: "Menunggu Konfirmasi",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  disputed: "Sengketa",
  refunded: "Dikembalikan",
};

export const ORDER_STATUS_TONE: Record<string, string> = {
  pending_payment: "bg-amber-100 text-amber-900 border-amber-200",
  paid: "bg-sky-100 text-sky-900 border-sky-200",
  in_progress: "bg-blue-100 text-blue-900 border-blue-200",
  awaiting_confirmation: "bg-violet-100 text-violet-900 border-violet-200",
  completed: "bg-emerald-100 text-emerald-900 border-emerald-200",
  cancelled: "bg-zinc-200 text-zinc-700 border-zinc-300",
  disputed: "bg-rose-100 text-rose-900 border-rose-200",
  refunded: "bg-zinc-200 text-zinc-700 border-zinc-300",
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}