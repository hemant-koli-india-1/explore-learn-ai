-- First, create managers table
CREATE TABLE IF NOT EXISTS public.managers (
  employee_id integer GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  name text NOT NULL,
  description character varying NOT NULL,
  photo text,
  CONSTRAINT managers_pkey PRIMARY KEY (employee_id)
);

-- Update departments table structure
DROP TABLE IF EXISTS public.departments CASCADE;
CREATE TABLE public.departments (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE,
  description character varying NOT NULL,
  image_url text NOT NULL,
  manager_id integer,
  CONSTRAINT departments_pkey PRIMARY KEY (id),
  CONSTRAINT fk_departments_manager FOREIGN KEY (manager_id) REFERENCES public.managers(employee_id)
);

-- Update profiles table structure (drop and recreate to change primary key)
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
  employee_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  first_name text,
  last_name text,
  role text DEFAULT 'Trainee'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (employee_id)
);

-- Update courses table to add foreign key to departments
ALTER TABLE public.courses 
ADD CONSTRAINT fk_courses_department FOREIGN KEY (department_id) REFERENCES public.departments(id);

-- Update locations table structure
ALTER TABLE public.locations 
ADD CONSTRAINT locations_location_unique UNIQUE (location);

-- Update user_location_visits table structure
DROP TABLE IF EXISTS public.user_location_visits CASCADE;
CREATE TABLE public.user_location_visits (
  visited_at timestamp with time zone NOT NULL DEFAULT now(),
  quiz_score integer,
  employee_id integer,
  location_id integer NOT NULL,
  CONSTRAINT user_location_visits_pkey PRIMARY KEY (location_id),
  CONSTRAINT fk_user_location_visits_location FOREIGN KEY (location_id) REFERENCES public.locations(location_id)
);

-- Update user_progress table to add constraints
ALTER TABLE public.user_progress 
ADD CONSTRAINT fk_user_progress_employee FOREIGN KEY (employee_id) REFERENCES public.profiles(employee_id),
ADD CONSTRAINT status_check CHECK (status = ANY (ARRAY['available'::text, 'in_progress'::text, 'completed'::text, 'locked'::text]));

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for new tables
CREATE POLICY "Anyone can view managers" ON public.managers FOR SELECT USING (true);
CREATE POLICY "Anyone can view departments" ON public.departments FOR SELECT USING (true);