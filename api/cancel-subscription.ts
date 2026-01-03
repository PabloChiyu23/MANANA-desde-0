import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const mercadopagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase credentials not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!mercadopagoAccessToken) {
    console.error('MERCADOPAGO_ACCESS_TOKEN not configured');
    return res.status(500).json({ error: 'Payment system not configured' });
  }

  try {
    const { userId, reason, feedback } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('subscription_id, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('User not found:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    const subscriptionId = user.subscription_id;

    if (subscriptionId) {
      console.log('Canceling subscription in Mercado Pago:', subscriptionId);
      
      const mpResponse = await fetch(
        `https://api.mercadopago.com/preapproval/${subscriptionId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${mercadopagoAccessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'cancelled'
          })
        }
      );

      const mpResult = await mpResponse.json();
      console.log('Mercado Pago cancellation result:', JSON.stringify(mpResult, null, 2));

      if (!mpResponse.ok) {
        console.error('Failed to cancel in Mercado Pago:', mpResult);
      }
    } else {
      console.log('No subscription_id found for user, skipping Mercado Pago cancellation');
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_pro: false,
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update user:', updateError);
      return res.status(500).json({ error: 'Failed to update user status' });
    }

    console.log('Subscription cancelled successfully for user:', userId);
    return res.status(200).json({ 
      success: true, 
      message: 'Suscripción cancelada exitosamente' 
    });

  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return res.status(500).json({ 
      error: 'Error al cancelar la suscripción',
      message: error.message 
    });
  }
}
