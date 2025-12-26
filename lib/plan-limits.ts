/**
 * Plan limits and feature gates for the subscription tiers
 */

export type SubscriptionTier = 'free' | 'standard' | 'professional'

export interface PlanLimits {
  customers: number // -1 = unlimited
  events_per_month: number // -1 = unlimited
  products: number // -1 = unlimited
  contracts: number // -1 = unlimited
  storage_gb: number
}

export interface PlanFeatures {
  dashboard: boolean
  calendar_view: boolean
  calendar_add_events: boolean
  discounts: boolean
  colorful_invoice_template: boolean
  simple_invoice_template: boolean
  modern_invoice_template: boolean
  elegant_invoice_template: boolean
  professional_invoice_template: boolean
  terms_editable: boolean
  legal_contract_editable: boolean
  chatbot: boolean
  pdf_csv_export: boolean
  email_support: boolean
  priority_support: boolean
}

export const PLAN_LIMITS: Record<SubscriptionTier, PlanLimits> = {
  free: {
    customers: 5,
    events_per_month: 5,
    products: 20,
    contracts: 10,
    storage_gb: 1,
  },
  standard: {
    customers: 100,
    events_per_month: 50,
    products: 50,
    contracts: 50,
    storage_gb: 5,
  },
  professional: {
    customers: -1, // unlimited
    events_per_month: -1, // unlimited
    products: -1, // unlimited
    contracts: -1, // unlimited
    storage_gb: 50,
  },
}

export const PLAN_FEATURES: Record<SubscriptionTier, PlanFeatures> = {
  free: {
    dashboard: true,
    calendar_view: true,
    calendar_add_events: false, // Can only view, not add
    discounts: true,
    colorful_invoice_template: false,
    simple_invoice_template: true,
    modern_invoice_template: false,
    elegant_invoice_template: false,
    professional_invoice_template: false,
    terms_editable: false,
    legal_contract_editable: false,
    chatbot: false,
    pdf_csv_export: false,
    email_support: false,
    priority_support: false,
  },
  standard: {
    dashboard: true,
    calendar_view: true,
    calendar_add_events: true,
    discounts: true,
    colorful_invoice_template: true,
    simple_invoice_template: false,
    modern_invoice_template: true,
    elegant_invoice_template: true,
    professional_invoice_template: true,
    terms_editable: true,
    legal_contract_editable: false,
    chatbot: false,
    pdf_csv_export: false,
    email_support: true,
    priority_support: false,
  },
  professional: {
    dashboard: true,
    calendar_view: true,
    calendar_add_events: true,
    discounts: true,
    colorful_invoice_template: true,
    simple_invoice_template: false,
    modern_invoice_template: true,
    elegant_invoice_template: true,
    professional_invoice_template: true,
    terms_editable: true,
    legal_contract_editable: true,
    chatbot: true,
    pdf_csv_export: true,
    email_support: true,
    priority_support: true,
  },
}

/**
 * Get limits for a specific subscription tier
 */
export function getPlanLimits(tier: SubscriptionTier): PlanLimits {
  return PLAN_LIMITS[tier]
}

/**
 * Get features for a specific subscription tier
 */
export function getPlanFeatures(tier: SubscriptionTier): PlanFeatures {
  return PLAN_FEATURES[tier]
}

/**
 * Check if a tier has a specific feature
 */
export function hasFeature(tier: SubscriptionTier, feature: keyof PlanFeatures): boolean {
  return PLAN_FEATURES[tier][feature]
}

/**
 * Check if user can perform an action based on current count and limit
 * Returns true if action is allowed, false otherwise
 */
export function canPerformAction(currentCount: number, limit: number): boolean {
  // -1 means unlimited
  if (limit === -1) return true

  return currentCount < limit
}

/**
 * Get user-friendly error message for limit reached
 */
export function getLimitReachedMessage(
  resource: 'customers' | 'events' | 'products' | 'contracts',
  tier: SubscriptionTier
): string {
  const limits = PLAN_LIMITS[tier]
  const limit = resource === 'customers'
    ? limits.customers
    : resource === 'events'
    ? limits.events_per_month
    : resource === 'products'
    ? limits.products
    : limits.contracts

  const resourceName = resource === 'customers'
    ? 'clientes'
    : resource === 'events'
    ? 'eventos este mes'
    : resource === 'products'
    ? 'productos'
    : 'contratos'

  if (tier === 'free') {
    return `Has alcanzado el límite de ${limit} ${resourceName} en el plan Gratis. Actualiza a un plan superior para agregar más.`
  } else if (tier === 'standard') {
    return `Has alcanzado el límite de ${limit} ${resourceName} en el plan Starter. Actualiza a Professional para obtener acceso ilimitado.`
  }

  return `Has alcanzado el límite de ${limit} ${resourceName}.`
}

/**
 * Get upgrade recommendation based on current tier
 */
export function getUpgradeRecommendation(currentTier: SubscriptionTier): {
  tier: SubscriptionTier | null
  message: string
} {
  if (currentTier === 'free') {
    return {
      tier: 'standard',
      message: 'Actualiza a Starter para más clientes, eventos y productos.',
    }
  } else if (currentTier === 'standard') {
    return {
      tier: 'professional',
      message: 'Actualiza a Professional para acceso ilimitado y funciones avanzadas.',
    }
  }

  return {
    tier: null,
    message: 'Ya tienes el plan más avanzado.',
  }
}

/**
 * Format tier name for display
 */
export function formatTierName(tier: SubscriptionTier): string {
  const names: Record<SubscriptionTier, string> = {
    free: 'Gratis',
    standard: 'Starter',
    professional: 'Professional',
  }
  return names[tier]
}
