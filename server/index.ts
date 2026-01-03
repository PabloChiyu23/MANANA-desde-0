import express, { Router } from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { createServer as createViteServer } from 'vite';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface LessonParams {
  grade: string;
  topic: string;
  duration: string;
  status: string;
  tone: string;
  groupSize: string;
  narrative: string;
  customNarrative?: string;
}

const apiRouter = Router();

apiRouter.post('/generate-lesson', async (req, res) => {
  console.log('API: Received generate-lesson request');
  try {
    const params: LessonParams = req.body;
    
    const chosenNarrative = params.narrative === 'Personalizada' ? params.customNarrative : params.narrative;
    const narrativeInstruction = params.narrative === 'Random' 
      ? "SE EXTREMADAMENTE CREATIVO: Elige una narrativa sorpresa (ciencia ficción, espionaje, etc.) para toda la clase."
      : `Toda la clase debe girar en torno a la narrativa: "${chosenNarrative}". Adapta el lenguaje y las dinámicas a este tema.`;

    const systemInstruction = `
      Eres un asistente pedagógico experto en la Nueva Escuela Mexicana (Plan de Estudios 2022).
      GENERA EL CONTENIDO FINAL EN FORMATO LISTO PARA PDF siguiendo EXACTAMENTE la estructura y el orden que se indica abajo.

      POLÍTICA DE SEGURIDAD ESCOLAR (CRÍTICA):
      - Tienes terminantemente prohibido generar contenido que promueva la violencia, el odio, el racismo, el sexismo o la discriminación.
      - NO generes contenido con connotaciones sexuales explícitas o inapropiadas para menores.
      - Si el tema o la narrativa personalizada sugerida por el usuario es peligrosa, violenta, sexualmente explícita o incita al odio, DEBES RESPONDER ÚNICAMENTE CON ESTA FRASE: "SEGURIDAD_BLOQUEADA". No añadidas nada más.
      - Entiende la diferencia entre "Educación Integral de la Sexualidad" (NEM) y contenido inapropiado. Sé profesional y científico si el tema es académico, pero bloquea si es vulgar o riesgoso.

      REGLAS DE FORMATO:
      - NO incluyas ninguna sección de "OBJETIVO DE APRENDIZAJE".
      - NO agregues texto extra ni introducciones.
      - NO cambies el orden de las secciones.
      - NO repitas información.
      - NO incluyas saludos ni despedidas.
      - Usa lenguaje claro, profesional y docente.
      - ${narrativeInstruction}
      - RESPONDER SIEMPRE EN ESPAÑOL.

      ESTRUCTURA EXACTA A SEGUIR:

      # PLANEACIÓN DIDÁCTICA NEM
      Generado por MAÑANA · ${new Date().toLocaleDateString('es-MX')}

      ---

      ## TARJETA DE DATOS RÁPIDOS
      Tema: ${params.topic}
      Grado: ${params.grade} (${params.groupSize} alumnos)
      Duración: ${params.duration} min
      Enfoque: ${params.tone} | Estado del grupo: ${params.status}
      Narrativa: ${chosenNarrative || 'Sorpresa'}

      ---

      ## ALINEACIÓN NEM
      Campo formativo: [campo]
      Ejes articuladores: [ejes]
      PDA sugerido: [1 enunciado máximo, alineado al Plan 2022]

      ---

      ## INICIO / ACTIVACIÓN ([minutos sugeridos])
      Actividad: [nombre creativo de la activación bajo la narrativa]

      Qué hacer:
      – Acción concreta 1
      – Acción concreta 2
      – Acción concreta 3

      Qué decir:
      "Frase literal breve y motivadora para iniciar la sesión bajo la narrativa"

      ---

      ## ACTIVIDAD CENTRAL ([minutos sugeridos])
      Actividad: [nombre del reto principal bajo la narrativa]

      Organización:
      – Tipo de agrupamiento sugerido

      Paso a paso:
      1. Acción concreta
      2. Acción concreta
      3. Acción concreta
      4. Acción concreta
      5. Acción concreta

      ---

      ## CIERRE / EVALUACIÓN ([minutos sugeridos])
      Actividad: [nombre del cierre bajo la narrativa]

      Cómo evaluar:
      – Qué observar
      – Pregunta clave
      – Evidencia concreta del aprendizaje

      ---

      ## 📝 MATERIALES (CHECKLIST)
      ☐ [Material esencial 1]
      ☐ [Material esencial 2]
      ☐ [Material esencial 3]
      ☐ [Material opcional]
    `;

    const prompt = `Genera la planeación para el tema "${params.topic}" dirigida a ${params.grade} con un enfoque ${params.tone}. El grupo está ${params.status}. Usa la narrativa: ${chosenNarrative || 'libre'}.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 4000,
    });

    const text = response.choices[0]?.message?.content || "";
    
    if (text.includes("SEGURIDAD_BLOQUEADA")) {
      return res.status(400).json({ error: "El tema o la narrativa elegida no es apta para un entorno escolar por razones de seguridad." });
    }
    
    console.log('API: Successfully generated lesson');
    res.json({ content: text || "No pude generar la clase." });
  } catch (error: any) {
    console.error("Error de generación:", error);
    res.status(500).json({ error: "Error al conectar con la IA de planeación." });
  }
});

apiRouter.post('/generate-planb', async (req, res) => {
  console.log('API: Received generate-planb request');
  try {
    const params: LessonParams = req.body;
    
    const systemInstruction = `
      Eres un maestro experto en manejo de grupos difíciles. 
      Da un "PLAN B" de rescate rápido para ${params.grade} sobre "${params.topic}".
      Considera un grupo de ${params.groupSize} alumnos que están "${params.status}".
      Sin materiales extras. 3 pasos claros y directos. Estilo scannable. No incluyas objetivos.
      Aplica las mismas reglas de seguridad: Si el tema es violento o inapropiado, responde "SEGURIDAD_BLOQUEADA".
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: "Genera un Plan B de emergencia con un estilo práctico." }
      ],
      temperature: 0.9,
      max_tokens: 2000,
    });
    
    const text = response.choices[0]?.message?.content || "";
    
    if (text.includes("SEGURIDAD_BLOQUEADA")) {
      return res.status(400).json({ error: "Contenido bloqueado por seguridad." });
    }
    
    console.log('API: Successfully generated Plan B');
    res.json({ content: text });
  } catch (error) {
    console.error("Error Plan B:", error);
    res.status(500).json({ error: "Error al generar Plan B." });
  }
});

const PROMO_END_DATE = new Date('2026-01-07T00:00:00-06:00');
const PROMO_PRICE = 29;
const REGULAR_PRICE = 49;

function getCurrentPrice(): number {
  const now = new Date();
  return now < PROMO_END_DATE ? PROMO_PRICE : REGULAR_PRICE;
}

apiRouter.post('/create-subscription', async (req, res) => {
  console.log('API: Received create-subscription request');
  try {
    const { userId, userEmail } = req.body;
    const mercadopagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!userId || !userEmail) {
      return res.status(400).json({ error: 'User ID and email are required' });
    }

    if (!mercadopagoAccessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured');
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    const price = getCurrentPrice();
    const isPromo = price === PROMO_PRICE;

    const baseUrl = process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'http://localhost:5000';

    const subscriptionData = {
      reason: 'MAÑANA PRO - Suscripción Mensual',
      external_reference: userId,
      payer_email: userEmail,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: price,
        currency_id: 'MXN'
      },
      back_url: `${baseUrl}/?subscription=success`
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

    if (result.id) {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
      
      if (supabaseUrl && supabaseServiceKey) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase
          .from('users')
          .update({ 
            subscription_id: result.id,
            subscription_status: result.status,
            subscription_price: price
          })
          .eq('id', userId);
      }

      return res.json({
        status: result.status || 'pending',
        subscription_id: result.id,
        init_point: result.init_point,
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
        message: result.message || 'No se pudo crear la suscripción',
        details: result
      });
    }

  } catch (error: any) {
    console.error('Create subscription error:', error);
    res.status(500).json({ 
      error: 'Error al crear la suscripción',
      message: error.message 
    });
  }
});

apiRouter.get('/subscription-price', (req, res) => {
  const price = getCurrentPrice();
  const isPromo = price === PROMO_PRICE;
  const promoEndsAt = PROMO_END_DATE.toISOString();
  
  res.json({
    price,
    isPromo,
    promoEndsAt,
    regularPrice: REGULAR_PRICE
  });
});

apiRouter.post('/cancel-subscription', async (req, res) => {
  console.log('API: Received cancel-subscription request');
  try {
    const { userId, reason, feedback } = req.body;
    const mercadopagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const { createClient } = await import('@supabase/supabase-js');
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

    if (subscriptionId && mercadopagoAccessToken) {
      console.log('Canceling subscription in Mercado Pago:', subscriptionId);
      
      const mpResponse = await fetch(
        `https://api.mercadopago.com/preapproval/${subscriptionId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${mercadopagoAccessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'cancelled' })
        }
      );

      const mpResult = await mpResponse.json();
      console.log('Mercado Pago cancellation result:', JSON.stringify(mpResult, null, 2));

      if (!mpResponse.ok) {
        console.error('Failed to cancel in Mercado Pago:', mpResult);
      }
    } else {
      console.log('No subscription_id found or no MP token, skipping Mercado Pago cancellation');
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_pro: false,
        subscription_status: 'cancelled',
        cancellation_reason: reason || null,
        cancellation_feedback: feedback || null,
        cancellation_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update user:', updateError);
      return res.status(500).json({ error: 'Failed to update user status' });
    }

    console.log('Subscription cancelled successfully for user:', userId);
    return res.json({ 
      success: true, 
      message: 'Suscripción cancelada exitosamente' 
    });

  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ 
      error: 'Error al cancelar la suscripción',
      message: error.message 
    });
  }
});

apiRouter.post('/create-preference', async (req, res) => {
  console.log('API: Received create-preference request');
  try {
    const { userId, userEmail } = req.body;
    const mercadopagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!mercadopagoAccessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured');
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    const baseUrl = process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'http://localhost:5000';

    const preference = {
      items: [
        {
          id: 'manana-pro-monthly',
          title: 'MAÑANA PRO - Suscripción Mensual',
          description: 'Acceso ilimitado a generación de planeaciones NEM',
          quantity: 1,
          currency_id: 'MXN',
          unit_price: 29,
        },
      ],
      payer: {
        email: userEmail || undefined,
      },
      external_reference: userId,
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

    res.json({
      preferenceId: data.id,
      initPoint: data.init_point,
      sandboxInitPoint: data.sandbox_init_point,
    });

  } catch (error) {
    console.error('Create preference error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

apiRouter.post('/process-payment', async (req, res) => {
  console.log('API: Received process-payment request');
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
    const mercadopagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

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
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
      
      if (supabaseUrl && supabaseServiceKey) {
        const { createClient } = await import('@supabase/supabase-js');
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

      return res.json({
        status: 'approved',
        payment_id: result.id,
        message: '¡Pago aprobado! Tu cuenta PRO está activa.'
      });
    } else if (result.status === 'in_process' || result.status === 'pending') {
      return res.json({
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
    res.status(500).json({ 
      error: 'Error al procesar el pago',
      message: error.message 
    });
  }
});

async function startServer() {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  
  app.use('/api', apiRouter);
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: {
        clientPort: 443,
        protocol: 'wss',
      }
    },
    appType: 'spa'
  });
  
  app.use(vite.middlewares);
  
  app.listen(5000, '0.0.0.0', () => {
    console.log('Server running on port 5000');
    console.log('API routes: /api/generate-lesson, /api/generate-planb, /api/health');
  });
}

startServer();
