-- ================================================================
-- Vidyamruta V2 — RLS Hotfix Patch
-- Run this in the Supabase SQL Editor to fix save failures.
-- ================================================================

-- FIX 1: Allow users to INSERT their own profile row
-- (Required for OAuth users and anyone whose profile wasn't auto-created)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id)';
  END IF;
END $$;

-- FIX 2: Ensure saved_kundlis INSERT policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'saved_kundlis' 
    AND policyname = 'Users can insert own kundlis'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert own kundlis" ON public.saved_kundlis FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

-- FIX 3: Make astrologer_profiles publicly readable (no auth required)
-- This ensures new astrologers show up on the /consultations page for ALL visitors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'astrologer_profiles' 
    AND policyname = 'Anyone can view astrologer profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view astrologer profiles" ON public.astrologer_profiles FOR SELECT USING (true)';
  END IF;
END $$;

-- FIX 4: Verify user_metadata role is honoured for astrologer profile insert
-- Astrologers registered via the app must be able to insert their profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'astrologer_profiles' 
    AND policyname = 'Astrologers can insert own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Astrologers can insert own profile" ON public.astrologer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

-- VERIFY: Check all active policies on key tables
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('user_profiles', 'saved_kundlis', 'astrologer_profiles')
ORDER BY tablename, cmd;
