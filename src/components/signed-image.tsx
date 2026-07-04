import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const cache = new Map<string, { url: string; exp: number }>();
const EXPIRES_IN = 60 * 60; // 1 hour

export async function resolveCommissionImage(pathOrUrl: string | null | undefined): Promise<string | null> {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const now = Date.now();
  const cached = cache.get(pathOrUrl);
  if (cached && cached.exp > now) return cached.url;
  const { data, error } = await supabase.storage.from("commission-images").createSignedUrl(pathOrUrl, EXPIRES_IN);
  if (error || !data) return null;
  cache.set(pathOrUrl, { url: data.signedUrl, exp: now + (EXPIRES_IN - 60) * 1000 });
  return data.signedUrl;
}

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  path: string | null | undefined;
  fallback?: React.ReactNode;
};

export function SignedImage({ path, fallback = null, ...rest }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    resolveCommissionImage(path).then((u) => { if (active) setUrl(u); });
    return () => { active = false; };
  }, [path]);
  if (!url) return <>{fallback}</>;
  return <img src={url} {...rest} />;
}