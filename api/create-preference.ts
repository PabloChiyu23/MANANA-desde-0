import type { VercelRequest, VercelResponse } from '@vercel/node';

const mercadopagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
}

const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  'navidad-2024': {
    id: 'navidad-2024',
    name: 'MAÑANA PRO - Oferta Navidad',
    description: 'Acceso ilimitado a generación de planeaciones NEM',
    price: 29,
    currency: 'MXN',
  },
  'early-bird': {
    id: 'early-bird',
    name: 'MAÑANA PRO - Early Bird',
    description: 'Precio especial para los primeros 100 usuarios',
    price: 19,
    currency: 'MXN',
  },
  'regular': {
    id: 'regular',
    name: 'MAÑANA PRO - Mensual',
    description: 'Acceso ilimitado a generación de planeaciones NEM',
    price: 49,
    currency: 'MXN',
  },
  'anual': {
    id: 'anual',
    name: 'MAÑANA PRO - Anual',
    description: '12 meses de acceso ilimitado',
    price: 490,
    currency: 'MXN',
  },
};

const ACTIVE_PLAN_ID = 'navidad-2024';

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
    const { userId, userEmail, planId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!mercadopagoAccessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured');
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    const selectedPlanId = planId || ACTIVE_PLAN_ID;
    const plan = SUBSCRIPTION_PLANS[selectedPlanId] || SUBSCRIPTION_PLANS[ACTIVE_PLAN_ID];

    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'http://localhost:5000';

    const preference = {
      items: [
        {
          id: plan.id,
          title: plan.name,
          description: plan.description,
          quantity: 1,
          currency_id: plan.currency,
          unit_price: plan.price,
        },
      ],
      payer: {
        email: userEmail || undefined,
      },
      external_reference: `${userId}|${plan.id}`,
      back_urls: {
        success: `${baseUrl}/?payment=success`,
        failure: `${baseUrl}/?payment=failure`,
        pending: `${baseUrl}/?payment=pending`,
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/mercadopago-webhook`,
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadopagoAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Mercado Pago error:', error);
      return res.status(500).json({ error: 'Failed to create payment preference' });
    }

    const data = await response.json();
    console.log('PREFERENCE CREATED:', data.id);

    return res.status(200).json({
      preferenceId: data.id,
      initPoint: data.init_point,
      sandboxInitPoint: data.sandbox_init_point,
    });

  } catch (error) {
    console.error('Create preference error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
