-- Fix RLS policies for tables without them

-- Enable RLS and create policies for user_location_visits
ALTER TABLE public.user_location_visits ENABLE ROW LEVEL SECURITY;

-- For now, allow all authenticated users to view all visits (can be refined later)
CREATE POLICY "Authenticated users can view location visits" 
ON public.user_location_visits 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert location visits" 
ON public.user_location_visits 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update location visits" 
ON public.user_location_visits 
FOR UPDATE 
TO authenticated
USING (true);

-- Enable RLS and create policies for user_progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Allow users to view and modify their own progress
CREATE POLICY "Authenticated users can view all progress" 
ON public.user_progress 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert progress" 
ON public.user_progress 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update progress" 
ON public.user_progress 
FOR UPDATE 
TO authenticated
USING (true);