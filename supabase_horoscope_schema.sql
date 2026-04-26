-- ============================================================
-- Daily Horoscopes Table Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS public.daily_horoscopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sunsign TEXT NOT NULL,
  prediction TEXT NOT NULL,
  horoscope_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (sunsign, horoscope_date)
);

-- Index for faster lookups by sign and date
CREATE INDEX IF NOT EXISTS idx_horoscopes_sign_date ON public.daily_horoscopes (sunsign, horoscope_date DESC);

-- Enable RLS
ALTER TABLE public.daily_horoscopes ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access for horoscopes" 
ON public.daily_horoscopes FOR SELECT 
USING (true);

-- Only allow service role to manage (for Edge Functions/Cron)
CREATE POLICY "Service role can manage horoscopes" 
ON public.daily_horoscopes FOR ALL 
USING (auth.jwt()->>'role' = 'service_role');
