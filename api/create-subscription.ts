import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const mercadopagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const PROMO_END_DATE = new Date('2026-01-07T06:00:00Z');
const PROMO_PRICE = 29;
const REGULAR_PRICE = 49;

function getCurrentPrice(): number {
  const now = new Date();
  return now < PROMO_END_DATE ? PROMO_PRICE : REGULAR_PRICE;
}

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

  try {
    const { userId, userEmail, cardToken, paymentMethodId, issuerId } = req.body;

    if (!userId || !userEmail) {
      return res.status(400).json({ error: 'User ID and email are required' });
    }

    if (!mercadopagoAccessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured');
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    const price = getCurrentPrice();
    const isPromo = price === PROMO_PRICE;

    const subscriptionData: any = {
      reason: 'MAÑANA PRO - Suscripción Mensual',
      external_reference: userId,
      payer_email: userEmail,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: price,
        currency_id: 'MXN'
      },
      back_url: `${req.headers.origin || 'https://manana-desde-0.vercel.app'}?subscription=success`
    };

    if (cardToken) {
      subscriptionData.card_token_id = cardToken;
      if (paymentMethodId) subscriptionData.payment_method_id = paymentMethodId;
    }

    console.log('Creating subscription for user:', userId, 'Price:', price);

    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadopagoAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscriptionData),
    });

    const result = await response.json();
    
    console.log('Subscription result:', result);

    if (result.id) {
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            is_pro: result.status === 'authorized',
            subscription_id: result.id,
            subscription_status: result.status,
            subscription_price: price
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating user subscription:', updateError);
        } else {
          console.log('User subscription created:', userId, result.id);
        }
      }

      if (result.init_point) {
        return res.status(200).json({
          status: 'redirect',
          init_point: result.init_point,
          subscription_id: result.id,
          price: price,
          isPromo: isPromo,
          message: isPromo 
            ? `¡Precio promocional de $${price} MXN/mes bloqueado!` 
            : `Suscripción de $${price} MXN/mes`
        });
      }

      if (result.status === 'authorized') {
        return res.status(200).json({
          status: 'authorized',
          subscription_id: result.id,
          price: price,
          isPromo: isPromo,
          message: '¡Suscripción activa! Tu cuenta PRO está lista.'
        });
      }

      return res.status(200).json({
        status: result.status || 'pending',
        subscription_id: result.id,
        init_point: result.init_point,
        price: price,
        isPromo: isPromo,
        message: 'Suscripción creada. Completa el pago para activar PRO.'
      });

    } else {
      console.error('Subscription creation failed:', result);
      return res.status(400).json({
        status: 'error',
        message: result.message || 'No se pudo crear la suscripción',
        details: result
      });
    }

  } catch (error: any) {
    console.error('Create subscription error:', error);
    return res.status(500).json({ 
      error: 'Error al crear la suscripción',
      message: error.message 
    });
  }
}
