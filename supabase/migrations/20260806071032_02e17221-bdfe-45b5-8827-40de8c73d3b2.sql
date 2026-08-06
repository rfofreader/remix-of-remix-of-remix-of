CREATE TABLE public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  photo_url text,
  created_at timestamptz not null default now()
);
GRANT SELECT ON public.authors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.authors TO authenticated;
GRANT ALL ON public.authors TO service_role;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authors readable by everyone" ON public.authors FOR SELECT USING (true);
CREATE POLICY "admins manage authors" ON public.authors FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

ALTER TABLE public.books
  ADD COLUMN author_id uuid REFERENCES public.authors(id) ON DELETE SET NULL,
  ADD COLUMN cover_url text,
  ADD COLUMN download_url text;

CREATE POLICY "covers read" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "covers admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'covers' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "covers admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'covers' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "covers admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'covers' AND public.has_role(auth.uid(),'admin'));