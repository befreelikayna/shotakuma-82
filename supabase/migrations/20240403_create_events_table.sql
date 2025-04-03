
-- Create table for events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  place TEXT NOT NULL,
  location TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'culture',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable row-level security (if needed later)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Add function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update updated_at
CREATE TRIGGER handle_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add RLS policies (public read)
CREATE POLICY "Allow public to select events" 
ON public.events FOR SELECT 
USING (true);

-- Add RLS policies (auth users for everything else)
CREATE POLICY "Allow authenticated users to insert events" 
ON public.events FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update events" 
ON public.events FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to delete events" 
ON public.events FOR DELETE 
TO authenticated 
USING (true);

-- Add realtime support
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER TABLE public.events REPLICA IDENTITY FULL;
