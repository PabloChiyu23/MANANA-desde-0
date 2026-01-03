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
    const { userId, userEmail } = req.body;

    if (!userId || !userEmail) {
      return res.status(400).json({ error: 'User ID and email are required' });
    }

    if (!mercadopagoAccessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured');
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    const price = getCurrentPrice();
    const isPromo = price === PROMO_PRICE;
    const origin = req.headers.origin || 'https://manana-desde-0.vercel.app';

    const preferenceData = {
      items: [
        {
          id: 'manana-pro-monthly',
          title: 'MAÑANA PRO - Suscripción Mensual',
          description: isPromo 
            ? `Precio promocional $${price} MXN/mes (precio normal: $${REGULAR_PRICE})` 
            : `Suscripción mensual $${price} MXN/mes`,
          quantity: 1,
          currency_id: 'MXN',
          unit_price: price
        }
      ],
      payer: {
        email: userEmail
      },
      back_urls: {
        success: `${origin}?payment=success&user_id=${userId}&price=${price}`,
        failure: `${origin}?payment=failure`,
        pending: `${origin}?payment=pending&user_id=${userId}&price=${price}`
      },
      auto_return: 'approved',
      external_reference: userId,
      notification_url: `${origin}/api/mercadopago-webhook`,
      statement_descriptor: 'MANANA PRO',
      expires: false
    };

    console.log('Creating Checkout Pro preference for user:', userId, 'Price:', price);

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadopagoAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceData),
    });

    const result = await response.json();
    
    console.log('Checkout Pro result:', result);

    if (result.id && result.init_point) {
      return res.status(200).json({
        status: 'redirect',
        init_point: result.init_point,
        preference_id: result.id,
        price: price,
        isPromo: isPromo,
        message: isPromo 
          ? `¡Precio promocional de $${price} MXN/mes!` 
          : `Suscripción de $${price} MXN/mes`
      });
    } else {
      console.error('Preference creation failed:', result);
      return res.status(400).json({
        status: 'error',
        message: result.message || 'No se pudo crear la preferencia de pago',
        details: result
      });
    }

  } catch (error: any) {
    console.error('Create preference error:', error);
    return res.status(500).json({ 
      error: 'Error al crear la preferencia de pago',
      message: error.message 
    });
  }
}
