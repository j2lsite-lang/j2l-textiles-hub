-- Enable realtime for sync_status table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'sync_status'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sync_status;
  END IF;
END $$;

-- Enable RLS on sync_status if not already enabled
ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to recreate properly
DROP POLICY IF EXISTS "Admin can view sync_status" ON public.sync_status;
DROP POLICY IF EXISTS "Admin can manage sync_status" ON public.sync_status;

-- Create admin-only read policy (correct argument order: user_id first, role second)
CREATE POLICY "Admin can view sync_status" 
ON public.sync_status 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create admin-only write policy
CREATE POLICY "Admin can manage sync_status" 
ON public.sync_status 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));