// Edge Function : crée une session Stripe Checkout pour Pro ou Premium
// Secrets requis : STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID, STRIPE_PREMIUM_PRICE_ID,
//                  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

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

const PRICE_IDS: Record<string, string> = {
  pro: Deno.env.get('STRIPE_PRO_PRICE_ID') ?? '',
  premium: Deno.env.get('STRIPE_PREMIUM_PRICE_ID') ?? '',
};

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
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return json({ error: 'Non authentifié' }, 401);

    const { garage_id, tier, origin } = await req.json();
    if (!garage_id || !tier || !PRICE_IDS[tier]) {
      return json({ error: 'Paramètres invalides ou tier inconnu' }, 400);
    }

    // Vérifier ownership
    const { data: ownership } = await supabase
      .from('garage_owners')
      .select('id')
      .eq('garage_id', garage_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!ownership) return json({ error: "Vous n'êtes pas propriétaire de ce garage" }, 403);

    // Réutiliser le customer Stripe existant si déjà créé pour ce garage
    const { data: existing } = await supabase
      .from('garage_subscriptions')
      .select('stripe_customer_id, stripe_subscription_id, status')
      .eq('garage_id', garage_id)
      .maybeSingle();

    if (existing?.status === 'active' || existing?.status === 'trialing') {
      return json({ error: 'Un abonnement actif existe déjà pour ce garage' }, 409);
    }

    let customerId = existing?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { garage_id, user_id: user.id },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: PRICE_IDS[tier], quantity: 1 }],
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/cancel`,
      metadata: { garage_id, tier, user_id: user.id },
      subscription_data: { metadata: { garage_id, tier } },
      allow_promotion_codes: true,
      locale: 'fr',
    });

    return json({ url: session.url });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
