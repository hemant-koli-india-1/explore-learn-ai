-- Call the create-admin edge function to create the admin user
SELECT extensions.http_post(
  'https://yfyuwmpvhokdiyqcjgyg.supabase.co/functions/v1/create-admin',
  '{}',
  'application/json'
);