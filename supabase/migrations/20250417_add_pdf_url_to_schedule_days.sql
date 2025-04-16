
-- Add the pdf_url column to schedule_days table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'schedule_days' 
        AND column_name = 'pdf_url'
    ) THEN
        ALTER TABLE public.schedule_days ADD COLUMN pdf_url TEXT;
    END IF;
END
$$;

-- Create a function to update the pdf_url field in schedule_days
CREATE OR REPLACE FUNCTION public.update_schedule_day_pdf(day_id UUID, pdf_url_value TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.schedule_days
  SET pdf_url = pdf_url_value,
      updated_at = now()
  WHERE id = day_id;
END;
$$;
