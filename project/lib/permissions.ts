export const FEATURES = {
  OPERATIONS_IMPORT: 'operations_import',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  MULTIPLE_WALLETS: 'multiple_wallets',
  AUDIT_LOGS: 'audit_logs',
  CUSTOM_REPORTS: 'custom_reports',
  TELEGRAM_NOTIFICATIONS: 'telegram_notifications'
} as const

export const PLANS = {
  STARTER: 'starter',
  PRO: 'pro',
  AGENCIA: 'agencia'
} as const

export const PLAN_FEATURES = {
  [PLANS.STARTER]: [FEATURES.OPERATIONS_IMPORT],
  [PLANS.PRO]: [
    FEATURES.OPERATIONS_IMPORT,
    FEATURES.ADVANCED_ANALYTICS,
    FEATURES.MULTIPLE_WALLETS,
    FEATURES.CUSTOM_REPORTS
  ],
  [PLANS.AGENCIA]: Object.values(FEATURES)
}

export function hasFeature(plan: string, feature: string): boolean {
  return PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES]?.includes(feature as any) ?? false
}