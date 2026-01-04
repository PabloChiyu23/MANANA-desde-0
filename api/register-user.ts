import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, email, acceptedMarketing } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Upserting user with acceptedMarketing:', acceptedMarketing);

    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: email,
        is_pro: false,
        total_generations: 0,
        accepted_terms: true,
        accepted_marketing: acceptedMarketing === true,
        terms_accepted_at: new Date().toISOString()
      }, { 
        onConflict: 'id'
      });

    if (error) {
      console.error('Error upserting user:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('User registered successfully with marketing:', acceptedMarketing);
    return res.json({ success: true });

  } catch (error: any) {
    console.error('Register user error:', error);
    return res.status(500).json({ error: error.message });
  }
}
