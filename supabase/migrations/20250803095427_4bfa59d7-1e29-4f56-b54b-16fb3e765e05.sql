-- Create an enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'trainee');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add approval status to user_progress table
ALTER TABLE public.user_progress 
ADD COLUMN approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN approved_by UUID REFERENCES auth.users(id),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;

-- Create admin policies for user_progress
CREATE POLICY "Admins can view all user progress"
ON public.user_progress
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update approval status"
ON public.user_progress
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create a view for admin dashboard to get user progress data
CREATE OR REPLACE VIEW public.admin_user_progress AS
SELECT 
    p.id as profile_id,
    p.first_name,
    p.last_name,
    p.employee_id,
    p.role,
    p.created_at as joined_at,
    COALESCE(json_agg(
        json_build_object(
            'course_id', up.course_id,
            'status', up.status,
            'started_at', up.started_at,
            'completed_at', up.completed_at,
            'approval_status', up.approval_status,
            'approved_by', up.approved_by,
            'approved_at', up.approved_at
        )
    ) FILTER (WHERE up.course_id IS NOT NULL), '[]'::json) as progress
FROM public.profiles p
LEFT JOIN public.user_progress up ON p.employee_id::text = up.employee_id::text
GROUP BY p.id, p.first_name, p.last_name, p.employee_id, p.role, p.created_at;

-- Grant access to the view for admins
CREATE POLICY "Admins can view user progress"
ON public.admin_user_progress
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));