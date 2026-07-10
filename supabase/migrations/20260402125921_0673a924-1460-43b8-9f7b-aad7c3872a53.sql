ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to books"
ON public.books
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);