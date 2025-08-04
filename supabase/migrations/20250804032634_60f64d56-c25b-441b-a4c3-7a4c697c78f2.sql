-- Create an admin user in auth.users and give them admin role
-- First, insert a test admin user (this is a manual insert for testing)
-- Note: In production, you'd typically create users through the auth API

-- Insert admin user data into profiles table
INSERT INTO public.profiles (user_id, first_name, last_name, employee_id, role)
VALUES (
  'admin-user-uuid-12345678901234567890', 
  'Admin', 
  'User', 
  'ADM001',
  'Admin'
) ON CONFLICT (user_id) DO NOTHING;

-- Give the admin user admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('admin-user-uuid-12345678901234567890', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create a manual auth.users entry for testing (this is not typical but needed for testing)
-- In real scenarios, users are created through Supabase Auth API
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  'admin-user-uuid-12345678901234567890',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@company.com',
  '$2a$10$rZ7bKw0fVLPxKx6bJ9J0g.KJ3vJ0HjvQvJ0J0J0J0J0J0J0J0J0J0',  -- This is 'admin123' hashed
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Admin","last_name":"User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;