import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@company.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'User'
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Add admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert([{
        user_id: authData.user.id,
        role: 'admin'
      }]);

    if (roleError) {
      console.error('Role error:', roleError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Admin user created successfully',
      email: 'admin@company.com',
      password: 'admin123'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});