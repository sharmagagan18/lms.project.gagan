CREATE TABLE public.activity_log (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  book_id TEXT,
  book_name TEXT,
  student_name TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to activity_log"
ON public.activity_log
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE INDEX idx_activity_log_created_at ON public.activity_log (created_at DESC);