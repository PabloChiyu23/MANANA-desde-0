import type { VercelRequest, VercelResponse } from '@vercel/node';

const mercadopagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

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

    const subscriptionData = {
      reason: 'MAÑANA PRO - Suscripción Mensual',
      external_reference: userId,
      payer_email: userEmail,
      back_url: `${origin}?subscription=success`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: price,
        currency_id: 'MXN'
      }
    };

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
    
    console.log('Subscription result:', JSON.stringify(result, null, 2));

    if (result.id && result.init_point) {
      return res.status(200).json({
        status: 'redirect',
        init_point: result.init_point,
        subscription_id: result.id,
        price: price,
        isPromo: isPromo,
        message: isPromo 
          ? `¡Precio promocional de $${price} MXN/mes!` 
          : `Suscripción de $${price} MXN/mes`
      });
    } else {
      console.error('Subscription creation failed:', result);
      return res.status(400).json({
        status: 'error',
        message: result.message || result.cause?.[0]?.description || 'No se pudo crear la suscripción',
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
