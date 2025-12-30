import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function verifyMercadoPagoSignature(req: VercelRequest): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('MERCADOPAGO_WEBHOOK_SECRET not configured, skipping verification');
    return true;
  }

  const xSignature = req.headers['x-signature'] as string;
  const xRequestId = req.headers['x-request-id'] as string;

  if (!xSignature || !xRequestId) {
    console.error('Missing signature headers');
    return false;
  }

  const dataId = req.query?.['data.id'] || req.body?.data?.id;
  const parts = xSignature.split(',');
  let ts = '';
  let hash = '';

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 'ts') ts = value;
    if (key === 'v1') hash = value;
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expectedHash = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  return hash === expectedHash;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('WEBHOOK RECEIVED:', JSON.stringify(req.body, null, 2));

  if (!verifyMercadoPagoSignature(req)) {
    console.error('Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  const mercadopagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  try {
    const { type, data } = req.body;

    if (type !== 'payment') {
      console.log('Ignoring non-payment notification:', type);
      return res.status(200).json({ received: true });
    }

    if (!mercadopagoAccessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      console.error('No payment ID in webhook');
      return res.status(400).json({ error: 'Missing payment ID' });
    }

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${mercadopagoAccessToken}`,
        },
      }
    );

    if (!paymentResponse.ok) {
      console.error('Failed to fetch payment details:', paymentResponse.status);
      return res.status(500).json({ error: 'Failed to verify payment' });
    }

    const payment = await paymentResponse.json();
    console.log('PAYMENT DETAILS:', JSON.stringify(payment, null, 2));

    if (payment.status !== 'approved') {
      console.log('Payment not approved, status:', payment.status);
      return res.status(200).json({ received: true, status: payment.status });
    }

    const userId = payment.external_reference;
    if (!userId) {
      console.error('No user ID in external_reference');
      return res.status(400).json({ error: 'Missing user reference' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_pro: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update user PRO status:', updateError);
      return res.status(500).json({ error: 'Failed to update user' });
    }

    console.log('SUCCESS: User', userId, 'is now PRO');
    return res.status(200).json({ success: true, userId });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
