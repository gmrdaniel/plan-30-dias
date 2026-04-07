import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const timestamp = new Date().toISOString();
  console.log(`========== CLAY WEBHOOK TEST ${timestamp} ==========`);
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2));

  let body: unknown = null;
  let bodyError: string | null = null;
  try {
    const text = await req.text();
    console.log('Raw body text:', text);
    if (text) {
      try {
        body = JSON.parse(text);
        console.log('Parsed JSON body:', JSON.stringify(body, null, 2));
      } catch (e) {
        bodyError = `Not valid JSON: ${(e as Error).message}`;
        body = text;
      }
    }
  } catch (e) {
    bodyError = (e as Error).message;
  }

  return new Response(
    JSON.stringify({
      ok: true,
      received_at: timestamp,
      method: req.method,
      body_error: bodyError,
      echo: body,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
});
