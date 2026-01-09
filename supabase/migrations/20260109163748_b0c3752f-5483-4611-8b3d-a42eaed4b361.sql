ALTER TABLE public.sync_status
  ADD COLUMN IF NOT EXISTS current_page integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_successful_page integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS page_retry_attempt integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_retry_at timestamp with time zone NULL,
  ADD COLUMN IF NOT EXISTS heartbeat_at timestamp with time zone NOT NULL DEFAULT now();
