-- ============================================================
-- Vidyamruta V2 — Vastu Migration Fixes
-- ============================================================

-- 1. Enable RLS on both tables
ALTER TABLE IF EXISTS public.vastu_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vastu_availability ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to ensure idempotency
-- vastu_bookings
DROP POLICY IF EXISTS "vastu_bookings_user_select" ON public.vastu_bookings;
DROP POLICY IF EXISTS "vastu_bookings_user_insert" ON public.vastu_bookings;
DROP POLICY IF EXISTS "vastu_bookings_astrologer_select" ON public.vastu_bookings;
DROP POLICY IF EXISTS "vastu_bookings_astrologer_update" ON public.vastu_bookings;

-- vastu_availability
DROP POLICY IF EXISTS "vastu_availability_public_select" ON public.vastu_availability;
DROP POLICY IF EXISTS "vastu_availability_astrologer_all" ON public.vastu_availability;
DROP POLICY IF EXISTS "vastu_availability_astrologer_insert" ON public.vastu_availability;
DROP POLICY IF EXISTS "vastu_availability_astrologer_update" ON public.vastu_availability;
DROP POLICY IF EXISTS "vastu_availability_astrologer_delete" ON public.vastu_availability;

-- 3. Create fresh policies

-- Vastu Bookings: Users
CREATE POLICY "vastu_bookings_user_select" ON public.vastu_bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "vastu_bookings_user_insert" ON public.vastu_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Vastu Bookings: Astrologers
CREATE POLICY "vastu_bookings_astrologer_select" ON public.vastu_bookings FOR SELECT
  USING (astrologer_id IN (
    SELECT id FROM public.astrologer_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "vastu_bookings_astrologer_update" ON public.vastu_bookings FOR UPDATE
  USING (astrologer_id IN (
    SELECT id FROM public.astrologer_profiles WHERE user_id = auth.uid()
  ));

-- Vastu Availability: Public / Authenticated Users
CREATE POLICY "vastu_availability_public_select" ON public.vastu_availability FOR SELECT USING (true);

-- Vastu Availability: Astrologers (Insert, Update, Delete)
CREATE POLICY "vastu_availability_astrologer_insert" ON public.vastu_availability FOR INSERT
  WITH CHECK (astrologer_id IN (
    SELECT id FROM public.astrologer_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "vastu_availability_astrologer_update" ON public.vastu_availability FOR UPDATE
  USING (astrologer_id IN (
    SELECT id FROM public.astrologer_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "vastu_availability_astrologer_delete" ON public.vastu_availability FOR DELETE
  USING (astrologer_id IN (
    SELECT id FROM public.astrologer_profiles WHERE user_id = auth.uid()
  ));

-- 4. Create Triggers safely
DO $$ BEGIN
  -- Trigger for vastu_bookings
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_vastu_bookings'
  ) THEN
    CREATE TRIGGER set_updated_at_vastu_bookings
    BEFORE UPDATE ON public.vastu_bookings
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;

  -- Trigger for vastu_availability
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_vastu_availability'
  ) THEN
    CREATE TRIGGER set_updated_at_vastu_availability
    BEFORE UPDATE ON public.vastu_availability
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;

-- Add is_available column to astrologer_profiles just in case it is missing
ALTER TABLE public.astrologer_profiles
ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT false;
