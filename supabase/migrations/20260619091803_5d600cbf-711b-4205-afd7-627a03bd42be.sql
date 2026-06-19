
-- Enums
CREATE TYPE public.app_role AS ENUM ('buyer', 'artist', 'admin');
CREATE TYPE public.order_status AS ENUM ('pending_payment','paid','in_progress','awaiting_confirmation','completed','cancelled','disputed','refunded');
CREATE TYPE public.payment_status AS ENUM ('pending','succeeded','failed','refunded');
CREATE TYPE public.payout_status AS ENUM ('pending','processing','paid','failed');
CREATE TYPE public.payout_method AS ENUM ('bank_transfer','gopay','ovo','dana','shopeepay');
CREATE TYPE public.dispute_status AS ENUM ('open','reviewing','resolved_buyer','resolved_artist','resolved_split');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT NOT NULL DEFAULT 'Pengguna',
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles public read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles self read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Handle new user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1), 'Pengguna'),
    NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'buyer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ARTIST PROFILES
CREATE TABLE public.artist_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tagline TEXT,
  long_bio TEXT,
  style_tags TEXT[] DEFAULT '{}',
  base_price_min INTEGER,
  is_open BOOLEAN NOT NULL DEFAULT true,
  payout_method public.payout_method,
  payout_account_name TEXT,
  payout_account_number TEXT,
  payout_verified BOOLEAN NOT NULL DEFAULT false,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.artist_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.artist_profiles TO authenticated;
GRANT ALL ON public.artist_profiles TO service_role;
ALTER TABLE public.artist_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "artist public read" ON public.artist_profiles FOR SELECT USING (true);
CREATE POLICY "artist self upsert" ON public.artist_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "artist self update" ON public.artist_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER artist_profiles_updated BEFORE UPDATE ON public.artist_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CATEGORIES
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  position INTEGER NOT NULL DEFAULT 0
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);

INSERT INTO public.categories (slug, name, description, icon, position) VALUES
  ('illustration','Ilustrasi','Karakter, fanart, ilustrasi penuh','palette',1),
  ('chibi','Chibi','Karakter chibi imut','heart',2),
  ('portrait','Portrait','Potret realistis & semi realistis','user',3),
  ('pet','Pet Portrait','Lukisan hewan kesayangan','paw',4),
  ('logo','Logo & Branding','Identitas visual & maskot','sparkles',5),
  ('emote','Emote & Stiker','Untuk Twitch/Discord/WA',':)',6),
  ('comic','Komik','Strip pendek & halaman komik','book',7);

-- COMMISSIONS
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  base_price INTEGER NOT NULL,
  turnaround_days INTEGER NOT NULL DEFAULT 7,
  slots_available INTEGER NOT NULL DEFAULT 5,
  cover_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX commissions_artist_idx ON public.commissions(artist_id);
CREATE INDEX commissions_category_idx ON public.commissions(category_id);
GRANT SELECT ON public.commissions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.commissions TO authenticated;
GRANT ALL ON public.commissions TO service_role;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "commissions public read active" ON public.commissions FOR SELECT USING (is_active = true OR auth.uid() = artist_id);
CREATE POLICY "commissions artist insert" ON public.commissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = artist_id);
CREATE POLICY "commissions artist update" ON public.commissions FOR UPDATE TO authenticated USING (auth.uid() = artist_id);
CREATE POLICY "commissions artist delete" ON public.commissions FOR DELETE TO authenticated USING (auth.uid() = artist_id);
CREATE TRIGGER commissions_updated BEFORE UPDATE ON public.commissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- COMMISSION IMAGES
CREATE TABLE public.commission_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id UUID NOT NULL REFERENCES public.commissions(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX commission_images_commission_idx ON public.commission_images(commission_id);
GRANT SELECT ON public.commission_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.commission_images TO authenticated;
GRANT ALL ON public.commission_images TO service_role;
ALTER TABLE public.commission_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "commission_images public read" ON public.commission_images FOR SELECT USING (true);
CREATE POLICY "commission_images artist write" ON public.commission_images FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.commissions c WHERE c.id = commission_id AND c.artist_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.commissions c WHERE c.id = commission_id AND c.artist_id = auth.uid()));

-- ORDERS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  commission_id UUID REFERENCES public.commissions(id) ON DELETE SET NULL,
  brief TEXT NOT NULL,
  reference_url TEXT,
  budget_idr INTEGER NOT NULL,
  service_fee INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL,
  deadline DATE,
  status public.order_status NOT NULL DEFAULT 'pending_payment',
  delivery_url TEXT,
  delivery_note TEXT,
  awaiting_confirmation_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_buyer_idx ON public.orders(buyer_id);
CREATE INDEX orders_artist_idx ON public.orders(artist_id);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders participants read" ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = artist_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders buyer create" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "orders participants update" ON public.orders FOR UPDATE TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = artist_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ORDER MESSAGES
CREATE TABLE public.order_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX order_messages_order_idx ON public.order_messages(order_id);
GRANT SELECT, INSERT ON public.order_messages TO authenticated;
GRANT ALL ON public.order_messages TO service_role;
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages participants read" ON public.order_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (auth.uid() = o.buyer_id OR auth.uid() = o.artist_id OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "messages participants send" ON public.order_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (auth.uid() = o.buyer_id OR auth.uid() = o.artist_id)));

-- REVIEWS
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX reviews_artist_idx ON public.reviews(artist_id);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews buyer create" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "reviews buyer update" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = buyer_id);

-- PAYMENTS (dummy)
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'mock',
  method TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  provider_txn_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX payments_order_idx ON public.payments(order_id);
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments participants read" ON public.payments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (auth.uid() = o.buyer_id OR auth.uid() = o.artist_id OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "payments buyer create" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND auth.uid() = o.buyer_id));
CREATE POLICY "payments buyer update" ON public.payments FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND auth.uid() = o.buyer_id));

-- WALLET TRANSACTIONS
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  payout_id UUID,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX wallet_user_idx ON public.wallet_transactions(user_id);
GRANT SELECT ON public.wallet_transactions TO authenticated;
GRANT ALL ON public.wallet_transactions TO service_role;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallet self read" ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- PAYOUTS
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  method public.payout_method NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  status public.payout_status NOT NULL DEFAULT 'pending',
  provider_txn_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX payouts_artist_idx ON public.payouts(artist_id);
GRANT SELECT, INSERT ON public.payouts TO authenticated;
GRANT ALL ON public.payouts TO service_role;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payouts self read" ON public.payouts FOR SELECT TO authenticated USING (auth.uid() = artist_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "payouts self create" ON public.payouts FOR INSERT TO authenticated WITH CHECK (auth.uid() = artist_id);
CREATE TRIGGER payouts_updated BEFORE UPDATE ON public.payouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- DISPUTES
CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  opener_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status public.dispute_status NOT NULL DEFAULT 'open',
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.disputes TO authenticated;
GRANT UPDATE ON public.disputes TO authenticated;
GRANT ALL ON public.disputes TO service_role;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "disputes participants read" ON public.disputes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (auth.uid() = o.buyer_id OR auth.uid() = o.artist_id OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "disputes participants open" ON public.disputes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = opener_id AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (auth.uid() = o.buyer_id OR auth.uid() = o.artist_id)));
CREATE POLICY "disputes admin update" ON public.disputes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER disputes_updated BEFORE UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
