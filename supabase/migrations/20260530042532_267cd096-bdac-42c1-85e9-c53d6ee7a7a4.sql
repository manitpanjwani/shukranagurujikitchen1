CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  desktop_url TEXT,
  mobile_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read banners" ON public.banners FOR SELECT USING (true);
CREATE POLICY "admin write banners" ON public.banners FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.banners (title, desktop_url, mobile_url, sort_order) VALUES
('', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1600&h=900&q=80', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&h=1100&q=80', 1),
('', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1600&h=900&q=80', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&h=1100&q=80', 2),
('', 'https://images.unsplash.com/photo-1542367597-8849eb950fd8?auto=format&fit=crop&w=1600&h=900&q=80', 'https://images.unsplash.com/photo-1542367597-8849eb950fd8?auto=format&fit=crop&w=800&h=1100&q=80', 3);