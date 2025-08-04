-- Create an admin user with proper UUID format
-- Insert admin user data into profiles table
INSERT INTO public.profiles (user_id, first_name, last_name, employee_id, role)
VALUES (
  '12345678-1234-1234-1234-123456789012', 
  'Admin', 
  'User', 
  'ADM001',
  'Admin'
) ON CONFLICT (user_id) DO NOTHING;

-- Give the admin user admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('12345678-1234-1234-1234-123456789012', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;