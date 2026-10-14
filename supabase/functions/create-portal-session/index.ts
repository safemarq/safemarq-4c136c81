// Edge Function : ouvre le Stripe Customer Portal pour qu'un owner gère son abonnement
// Secrets requis : STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Non authentifié' }, 401);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return json({ error: 'Non authentifié' }, 401);

    const { garage_id, origin } = await req.json();
    if (!garage_id) return json({ error: 'garage_id requis' }, 400);

    const { data: ownership } = await supabase
      .from('garage_owners')
      .select('id')
      .eq('garage_id', garage_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!ownership) return json({ error: "Vous n'êtes pas propriétaire" }, 403);

    const { data: sub } = await supabase
      .from('garage_subscriptions')
      .select('stripe_customer_id')
      .eq('garage_id', garage_id)
      .maybeSingle();

    if (!sub?.stripe_customer_id) return json({ error: 'Aucun abonnement existant' }, 404);

    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${origin}/dashboard`,
      locale: 'fr',
    });

    return json({ url: portal.url });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
