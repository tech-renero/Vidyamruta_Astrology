-- Enums for Role
CREATE TYPE app_role AS ENUM ('super_user', 'admin', 'astrologer', 'support', 'user');

-- User Profiles Table (extends auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role app_role DEFAULT 'user'::app_role NOT NULL,
  full_name TEXT,
  date_of_birth DATE,
  time_of_birth TIME,
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Remedies Table
CREATE TABLE public.remedies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages Table (for Supabase Realtime)
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remedies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 5-Tier RBAC RLS Policies

-- Note: SUPER USER bypasses RLS directly via Supabase Service Role Key or PG bypassrls privileges.

-- 1. USER PROFILES
-- Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Admins and Support can view all profiles
CREATE POLICY "Admins/Support can view all profiles" ON public.user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'support')
  )
);

-- 2. REMEDIES
-- Users can view and manage their own remedies
CREATE POLICY "Users can manage own remedies" ON public.remedies FOR ALL USING (auth.uid() = user_id);

-- 3. CHAT MESSAGES
-- Users can view messages they sent or received
CREATE POLICY "Users can view own chat" ON public.chat_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can insert messages if they are the sender
CREATE POLICY "Users can send messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
