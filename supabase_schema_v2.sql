-- ============================================================
-- Vidyamruta V2 — Extended Schema
-- Run this AFTER supabase_schema.sql
-- ============================================================

-- Saved Kundli Charts (auto-saved when user generates)
CREATE TABLE IF NOT EXISTS public.saved_kundlis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  time_of_birth TIME NOT NULL,
  birth_location TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  chart_data JSONB NOT NULL DEFAULT '{}',
  ascendant_rashi TEXT,
  moon_rashi TEXT,
  nakshatra TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Astrologer Profiles (extends user_profiles for astrologer role)
CREATE TABLE IF NOT EXISTS public.astrologer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  specializations TEXT[] DEFAULT '{}',
  experience_years INT DEFAULT 0,
  languages TEXT[] DEFAULT '{"Hindi", "English"}',
  bio TEXT,
  hourly_rate DECIMAL DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  rating DECIMAL DEFAULT 5.0,
  total_consultations INT DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultation Bookings
CREATE TABLE IF NOT EXISTS public.consultation_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  astrologer_id UUID REFERENCES public.astrologer_profiles(id) ON DELETE CASCADE NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_minutes INT DEFAULT 30,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  consultation_type TEXT DEFAULT 'chat' CHECK (consultation_type IN ('chat', 'video', 'call')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.saved_kundlis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.astrologer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;

-- Saved Kundlis: Users can manage own
CREATE POLICY "Users can manage own kundlis" ON public.saved_kundlis FOR ALL USING (auth.uid() = user_id);

-- Astrologer Profiles: Public read, owner write
CREATE POLICY "Anyone can view astrologer profiles" ON public.astrologer_profiles FOR SELECT USING (true);
CREATE POLICY "Astrologers can update own profile" ON public.astrologer_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Astrologers can insert own profile" ON public.astrologer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Consultation Bookings: Users and astrologers can view their own
CREATE POLICY "Users can view own bookings" ON public.consultation_bookings FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM public.astrologer_profiles WHERE id = consultation_bookings.astrologer_id
  ));
CREATE POLICY "Users can create bookings" ON public.consultation_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Astrologers can update booking status" ON public.consultation_bookings FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM public.astrologer_profiles WHERE id = consultation_bookings.astrologer_id
  ));
