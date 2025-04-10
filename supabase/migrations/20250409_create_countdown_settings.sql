
-- Create countdown_settings table
CREATE TABLE IF NOT EXISTS public.countdown_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'COUNTDOWN TO FESTIVAL',
    target_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    background_color TEXT NOT NULL DEFAULT '#1F1F3F',
    text_color TEXT NOT NULL DEFAULT '#00FFB9',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    show_on_load BOOLEAN NOT NULL DEFAULT TRUE,
    display_duration INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Set RLS
ALTER TABLE public.countdown_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users"
ON public.countdown_settings
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON public.countdown_settings
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
ON public.countdown_settings
FOR UPDATE
TO authenticated
USING (true);

-- Ensure updated_at is automatically updated
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.countdown_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Insert default settings
INSERT INTO public.countdown_settings (
    title, 
    target_date, 
    background_color, 
    text_color, 
    enabled, 
    show_on_load,
    display_duration
) 
VALUES (
    'COUNTDOWN TO SHOTAKU FESTIVAL',
    '2025-05-08 00:00:00+00',
    '#1F1F3F',
    '#00FFB9',
    true,
    true,
    0
)
ON CONFLICT DO NOTHING;
