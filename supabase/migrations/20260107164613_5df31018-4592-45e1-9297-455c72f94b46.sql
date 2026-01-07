-- Ajout des colonnes d'observabilité (IF NOT EXISTS = safe)
ALTER TABLE public.sync_status 
ADD COLUMN IF NOT EXISTS eta text,
ADD COLUMN IF NOT EXISTS s3_content_length bigint,
ADD COLUMN IF NOT EXISTS s3_poll_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS download_bytes bigint,
ADD COLUMN IF NOT EXISTS finished_in_ms bigint;

-- Index unique partiel pour garantir 1 seul job actif par type
CREATE UNIQUE INDEX IF NOT EXISTS sync_status_one_active_per_type 
ON public.sync_status (sync_type) 
WHERE status IN ('pending', 'running');