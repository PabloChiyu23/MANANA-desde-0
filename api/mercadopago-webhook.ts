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
    const trimmedKey = key?.trim();
    const trimmedValue = value?.trim();
    if (trimmedKey === 'ts') ts = trimmedValue;
    if (trimmedKey === 'v1') hash = trimmedValue;
  }

  if (!ts || !hash) {
    console.error('Could not parse ts or v1 from x-signature:', xSignature);
    return false;
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expectedHash = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  
  console.log('SIGNATURE VERIFICATION:', { manifest, expectedHash, receivedHash: hash, match: hash === expectedHash });

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

    if (type === 'subscription_preapproval') {
      const subscriptionId = data?.id;
      if (!subscriptionId) {
        return res.status(400).json({ error: 'Missing subscription ID' });
      }

      const subResponse = await fetch(
        `https://api.mercadopago.com/preapproval/${subscriptionId}`,
        {
          headers: {
            'Authorization': `Bearer ${mercadopagoAccessToken}`,
          },
        }
      );

      if (!subResponse.ok) {
        console.error('Failed to fetch subscription details:', subResponse.status);
        return res.status(500).json({ error: 'Failed to verify subscription' });
      }

      const subscription = await subResponse.json();
      console.log('SUBSCRIPTION DETAILS:', JSON.stringify(subscription, null, 2));

      const userId = subscription.external_reference;
      if (!userId) {
        console.error('No external_reference in subscription');
        return res.status(400).json({ error: 'Missing user reference' });
      }

      const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
      
      const isPro = subscription.status === 'authorized';
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          is_pro: isPro,
          subscription_id: subscription.id,
          subscription_status: subscription.status,
          subscription_price: subscription.auto_recurring?.transaction_amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update subscription status:', updateError);
        return res.status(500).json({ error: 'Failed to update user' });
      }

      console.log('SUCCESS: User', userId, 'subscription status:', subscription.status);
      return res.status(200).json({ success: true, userId, status: subscription.status });
    }

    if (type !== 'payment') {
      console.log('Ignoring notification type:', type);
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

    const externalReference = payment.external_reference;
    if (!externalReference) {
      console.error('No external_reference in payment');
      return res.status(400).json({ error: 'Missing user reference' });
    }

    const [userId, planId] = externalReference.includes('|') 
      ? externalReference.split('|') 
      : [externalReference, 'unknown'];

    console.log('PAYMENT INFO:', { userId, planId, amount: payment.transaction_amount });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_pro: true,
        subscription_plan: planId,
        subscription_amount: payment.transaction_amount,
        subscription_date: new Date().toISOString(),
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
