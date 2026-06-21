-- ============================================================
-- Vidyamruta V2 — Vastu Consultation Schema
-- ============================================================

-- Add offers_vastu flag to existing astrologer profiles
ALTER TABLE public.astrologer_profiles ADD COLUMN IF NOT EXISTS offers_vastu BOOLEAN DEFAULT false;

-- Vastu Bookings Table
CREATE TABLE IF NOT EXISTS public.vastu_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  astrologer_id UUID REFERENCES public.astrologer_profiles(id) ON DELETE CASCADE NOT NULL,
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'denied', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.vastu_bookings ENABLE ROW LEVEL SECURITY;

-- Vastu Bookings Policies
CREATE POLICY "Users can view own vastu bookings" ON public.vastu_bookings FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM public.astrologer_profiles WHERE id = vastu_bookings.astrologer_id
  ));

CREATE POLICY "Users can create vastu bookings" ON public.vastu_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Astrologers can update vastu booking status" ON public.vastu_bookings FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM public.astrologer_profiles WHERE id = vastu_bookings.astrologer_id
  ));

-- Vastu Availability Table
CREATE TABLE IF NOT EXISTS public.vastu_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  astrologer_id UUID REFERENCES public.astrologer_profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.vastu_availability ENABLE ROW LEVEL SECURITY;

-- Vastu Availability Policies
CREATE POLICY "Anyone can view vastu availability" ON public.vastu_availability FOR SELECT USING (true);
CREATE POLICY "Astrologers can manage own availability" ON public.vastu_availability FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.astrologer_profiles WHERE id = vastu_availability.astrologer_id));
