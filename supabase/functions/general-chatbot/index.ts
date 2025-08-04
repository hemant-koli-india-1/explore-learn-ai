import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { message } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are a helpful onboarding assistant for a company training program. You help new employees with:
            
            - Company policies and procedures
            - General workplace guidance
            - Training program questions
            - Basic HR information
            - Safety protocols
            - Common workplace scenarios
            
            You should be friendly, professional, and helpful. Keep responses concise but informative. If you don't know something specific about the company, acknowledge that and suggest they contact their supervisor or HR department.
            
            This is a general assistant (different from the department-specific assistants) - you handle general company and workplace questions.`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const assistantResponse = data.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';

    return new Response(JSON.stringify({ response: assistantResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in general-chatbot function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'I apologize, but I\'m currently unavailable. Please try again later or contact your supervisor for assistance.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});