import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const mercadopagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

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
    const { 
      token, 
      issuer_id, 
      payment_method_id, 
      transaction_amount,
      installments,
      payer,
      userId, 
      userEmail, 
      amount, 
      description 
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!mercadopagoAccessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured');
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    const paymentData = {
      token,
      issuer_id,
      payment_method_id,
      transaction_amount: transaction_amount || amount || 29,
      installments: installments || 1,
      description: description || 'MAÑANA PRO - Suscripción Mensual',
      payer: {
        email: payer?.email || userEmail,
        identification: payer?.identification
      },
      external_reference: `${userId}|navidad-2024`,
      statement_descriptor: 'MANANA PRO',
      metadata: {
        user_id: userId,
        plan_id: 'navidad-2024'
      }
    };

    console.log('Processing payment for user:', userId);

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadopagoAccessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${userId}-${Date.now()}`
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();
    
    console.log('Payment result:', result.status, result.id);

    if (result.status === 'approved') {
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ is_pro: true })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating user PRO status:', updateError);
        } else {
          console.log('User upgraded to PRO:', userId);
        }
      }

      return res.status(200).json({
        status: 'approved',
        payment_id: result.id,
        message: '¡Pago aprobado! Tu cuenta PRO está activa.'
      });
    } else if (result.status === 'in_process' || result.status === 'pending') {
      return res.status(200).json({
        status: result.status,
        payment_id: result.id,
        message: 'Tu pago está siendo procesado. Te notificaremos cuando se complete.'
      });
    } else {
      const errorMessage = result.status_detail === 'cc_rejected_bad_filled_card_number'
        ? 'Número de tarjeta incorrecto'
        : result.status_detail === 'cc_rejected_bad_filled_date'
        ? 'Fecha de vencimiento incorrecta'
        : result.status_detail === 'cc_rejected_bad_filled_security_code'
        ? 'Código de seguridad incorrecto'
        : result.status_detail === 'cc_rejected_insufficient_amount'
        ? 'Fondos insuficientes'
        : result.status_detail === 'cc_rejected_other_reason'
        ? 'Tu tarjeta no pudo procesar el pago'
        : 'El pago fue rechazado. Intenta con otra tarjeta.';

      return res.status(400).json({
        status: 'rejected',
        status_detail: result.status_detail,
        message: errorMessage
      });
    }

  } catch (error: any) {
    console.error('Process payment error:', error);
    return res.status(500).json({ 
      error: 'Error al procesar el pago',
      message: error.message 
    });
  }
}
