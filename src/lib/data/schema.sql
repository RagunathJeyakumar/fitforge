-- FitForge Database Schema & Row Level Security Policies
-- Supabase PostgreSQL Migration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    fitness_goal TEXT NOT NULL DEFAULT 'hypertrophy' CHECK (fitness_goal IN ('hypertrophy', 'strength', 'endurance', 'weight_loss', 'general_fitness')),
    experience_level TEXT NOT NULL DEFAULT 'intermediate' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'elite')),
    weight_unit TEXT NOT NULL DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lbs')),
    target_days_per_week INT NOT NULL DEFAULT 4 CHECK (target_days_per_week BETWEEN 1 AND 7),
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. USER PRIVACY SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.user_privacy_settings (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    share_workouts BOOLEAN NOT NULL DEFAULT true,
    share_bodyweight BOOLEAN NOT NULL DEFAULT false, -- Strict privacy for personal metrics
    share_prs BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. EXERCISES TABLE
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    instructions TEXT[] NOT NULL DEFAULT '{}',
    primary_muscles TEXT[] NOT NULL DEFAULT '{}',
    secondary_muscles TEXT[] NOT NULL DEFAULT '{}',
    equipment TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    movement_type TEXT NOT NULL CHECK (movement_type IN ('Compound', 'Isolation', 'Cardio', 'Isometric')),
    media_url TEXT,
    alternatives TEXT[] DEFAULT '{}',
    is_custom BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. EXERCISE FAVORITES
CREATE TABLE IF NOT EXISTS public.user_exercise_favorites (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, exercise_id)
);

-- 5. WORKOUT PLANS (ROUTINES) TABLE
CREATE TABLE IF NOT EXISTS public.workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    split_type TEXT NOT NULL DEFAULT 'Custom',
    days_count INT NOT NULL DEFAULT 1,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. PLAN EXERCISES (EXERCISES WITHIN A ROUTINE)
CREATE TABLE IF NOT EXISTS public.plan_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    day_name TEXT DEFAULT 'Day 1',
    order_index INT NOT NULL DEFAULT 0,
    target_sets INT NOT NULL DEFAULT 3,
    target_reps TEXT NOT NULL DEFAULT '8-12',
    target_weight_kg NUMERIC(6,2),
    rest_seconds INT NOT NULL DEFAULT 90,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. WORKOUT SESSIONS (LOGGED WORKOUTS)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    end_time TIMESTAMPTZ,
    duration_seconds INT NOT NULL DEFAULT 0,
    total_volume_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
    notes TEXT,
    pr_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. WORKOUT SETS (SETS WITHIN A SESSION)
CREATE TABLE IF NOT EXISTS public.workout_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    set_number INT NOT NULL DEFAULT 1,
    set_type TEXT NOT NULL DEFAULT 'normal' CHECK (set_type IN ('normal', 'warmup', 'dropset', 'failure')),
    weight_kg NUMERIC(6,2) NOT NULL DEFAULT 0,
    reps INT NOT NULL DEFAULT 0,
    rpe NUMERIC(3,1) CHECK (rpe IS NULL OR (rpe >= 6 AND rpe <= 10)),
    is_completed BOOLEAN NOT NULL DEFAULT false,
    is_pr BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. BODY METRICS TABLE
CREATE TABLE IF NOT EXISTS public.body_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg NUMERIC(5,2) NOT NULL,
    body_fat_pct NUMERIC(4,2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. FRIEND GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    invite_code VARCHAR(12) NOT NULL UNIQUE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. GROUP MEMBERSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.group_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(group_id, user_id)
);

-- 12. GROUP CHALLENGES TABLE
CREATE TABLE IF NOT EXISTS public.group_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    challenge_type TEXT NOT NULL CHECK (challenge_type IN ('total_volume', 'workout_count', 'streak', 'bench_target')),
    target_value NUMERIC(10,2) NOT NULL,
    unit TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES FOR FAST QUERIES
CREATE INDEX IF NOT EXISTS idx_workout_plans_user ON public.workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_exercises_plan ON public.plan_exercises(plan_id, order_index);
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON public.workout_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sets_session ON public.workout_sets(session_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_body_metrics_user ON public.body_metrics(user_id, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user ON public.group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group ON public.group_memberships(group_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exercise_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_challenges ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by authenticated users"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- PRIVACY SETTINGS POLICIES
CREATE POLICY "Users can view and edit their own privacy settings"
ON public.user_privacy_settings FOR ALL TO authenticated USING (auth.uid() = user_id);

-- EXERCISES POLICIES
-- Global curated exercises (is_custom = false) are visible to everyone
-- Custom exercises are visible to their creator
CREATE POLICY "Exercises visible to all if public or owned"
ON public.exercises FOR SELECT TO authenticated
USING (is_custom = false OR created_by = auth.uid());

CREATE POLICY "Users can insert custom exercises"
ON public.exercises FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by AND is_custom = true);

CREATE POLICY "Users can update custom exercises"
ON public.exercises FOR UPDATE TO authenticated
USING (auth.uid() = created_by AND is_custom = true);

-- FAVORITES POLICIES
CREATE POLICY "Users can manage their exercise favorites"
ON public.user_exercise_favorites FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- WORKOUT PLANS POLICIES
CREATE POLICY "Users can manage their own plans or view public ones"
ON public.workout_plans FOR SELECT TO authenticated
USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can insert their own workout plans"
ON public.workout_plans FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own workout plans"
ON public.workout_plans FOR UPDATE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own workout plans"
ON public.workout_plans FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- PLAN EXERCISES POLICIES
CREATE POLICY "Users can manage exercises for their own plans"
ON public.plan_exercises FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.workout_plans p
        WHERE p.id = plan_exercises.plan_id AND (p.user_id = auth.uid() OR p.is_public = true)
    )
);

-- WORKOUT SESSIONS POLICIES
CREATE POLICY "Users can only view their own workout sessions or group shared"
ON public.workout_sessions FOR SELECT TO authenticated
USING (
    user_id = auth.uid()
    OR (
        EXISTS (
            SELECT 1 FROM public.group_memberships gm1
            JOIN public.group_memberships gm2 ON gm1.group_id = gm2.group_id
            JOIN public.user_privacy_settings ups ON ups.user_id = workout_sessions.user_id
            WHERE gm1.user_id = auth.uid()
              AND gm2.user_id = workout_sessions.user_id
              AND ups.share_workouts = true
        )
    )
);

CREATE POLICY "Users can only modify their own sessions"
ON public.workout_sessions FOR ALL TO authenticated
USING (user_id = auth.uid());

-- WORKOUT SETS POLICIES
CREATE POLICY "Users can view workout sets for viewable sessions"
ON public.workout_sets FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.workout_sessions s
        WHERE s.id = workout_sets.session_id AND (s.user_id = auth.uid())
    )
);

CREATE POLICY "Users can modify workout sets for their own sessions"
ON public.workout_sets FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.workout_sessions s
        WHERE s.id = workout_sets.session_id AND s.user_id = auth.uid()
    )
);

-- BODY METRICS POLICIES (Private by default, never exposed without consent)
CREATE POLICY "Body metrics are strictly private to the user"
ON public.body_metrics FOR ALL TO authenticated
USING (user_id = auth.uid());

-- GROUPS POLICIES
CREATE POLICY "Group members can view their groups"
ON public.groups FOR SELECT TO authenticated
USING (
    created_by = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.group_memberships gm
        WHERE gm.group_id = groups.id AND gm.user_id = auth.uid()
    )
);

CREATE POLICY "Authenticated users can create groups"
ON public.groups FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group creators or admins can update groups"
ON public.groups FOR UPDATE TO authenticated
USING (created_by = auth.uid());

-- GROUP MEMBERSHIPS POLICIES
CREATE POLICY "Members can view membership in their groups"
ON public.group_memberships FOR SELECT TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.group_memberships gm
        WHERE gm.group_id = group_memberships.group_id AND gm.user_id = auth.uid()
    )
);

CREATE POLICY "Users can join groups"
ON public.group_memberships FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave or admins can remove members"
ON public.group_memberships FOR DELETE TO authenticated
USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.group_memberships gm
    WHERE gm.group_id = group_memberships.group_id AND gm.user_id = auth.uid() AND gm.role = 'admin'
));

-- GROUP CHALLENGES POLICIES
CREATE POLICY "Group members can view challenges"
ON public.group_challenges FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.group_memberships gm
        WHERE gm.group_id = group_challenges.group_id AND gm.user_id = auth.uid()
    )
);

CREATE POLICY "Group admins can create challenges"
ON public.group_challenges FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.group_memberships gm
        WHERE gm.group_id = group_challenges.group_id AND gm.user_id = auth.uid() AND gm.role = 'admin'
    )
);

-- TRIGGER TO AUTOMATICALLY CREATE PROFILE AND PRIVACY ROW ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.user_privacy_settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
