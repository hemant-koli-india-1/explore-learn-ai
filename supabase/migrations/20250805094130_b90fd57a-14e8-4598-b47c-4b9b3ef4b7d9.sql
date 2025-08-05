-- Create admin user directly in auth.users table and assign admin role
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data,
  is_sso_user,
  aud,
  role
) VALUES (
  gen_random_uuid(),
  'admin@company.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"first_name": "Admin", "last_name": "User"}',
  '{}',
  false,
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Get the admin user ID and insert into user_roles
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@company.com';
    
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (admin_user_id, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;