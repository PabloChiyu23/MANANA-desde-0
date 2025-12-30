export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  features: string[];
  badge?: string;
  isPromo?: boolean;
  maxUsers?: number;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  'navidad-2024': {
    id: 'navidad-2024',
    name: 'MAÑANA PRO - Oferta Navidad',
    description: 'Acceso ilimitado a generación de planeaciones NEM',
    price: 29,
    originalPrice: 49,
    currency: 'MXN',
    badge: '🎄 Oferta de Navidad',
    isPromo: true,
    features: [
      'Generaciones ilimitadas',
      'Exportar a PDF profesional',
      'Biblioteca sin límites',
    ],
  },
  'early-bird': {
    id: 'early-bird',
    name: 'MAÑANA PRO - Early Bird',
    description: 'Precio especial para los primeros 100 usuarios',
    price: 19,
    originalPrice: 49,
    currency: 'MXN',
    badge: '🐦 Early Bird',
    isPromo: true,
    maxUsers: 100,
    features: [
      'Generaciones ilimitadas',
      'Exportar a PDF profesional',
      'Biblioteca sin límites',
    ],
  },
  'regular': {
    id: 'regular',
    name: 'MAÑANA PRO - Mensual',
    description: 'Acceso ilimitado a generación de planeaciones NEM',
    price: 49,
    currency: 'MXN',
    features: [
      'Generaciones ilimitadas',
      'Exportar a PDF profesional',
      'Biblioteca sin límites',
    ],
  },
  'anual': {
    id: 'anual',
    name: 'MAÑANA PRO - Anual',
    description: '12 meses de acceso ilimitado (2 meses gratis)',
    price: 490,
    originalPrice: 588,
    currency: 'MXN',
    badge: '💰 Ahorra 17%',
    isPromo: true,
    features: [
      'Generaciones ilimitadas',
      'Exportar a PDF profesional',
      'Biblioteca sin límites',
      '2 meses gratis incluidos',
    ],
  },
};

export const ACTIVE_PLAN_ID = 'navidad-2024';

export function getActivePlan(): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[ACTIVE_PLAN_ID];
}

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS[planId];
}
