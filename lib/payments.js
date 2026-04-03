import { PLANS } from '@/lib/utils'

export const ONE_TIME_SERVICES = [
  {
    id: 'single_job_post',
    label: 'Single Job Post',
    description: 'Post one job without a subscription',
    price: 2,
  },
  {
    id: 'bulk_job_posts',
    label: 'Bulk Job Posts (x10)',
    description: '10 job posts at a discounted rate',
    price: 15,
  },
  {
    id: 'portfolio_package',
    label: 'Professional Portfolio Page',
    description: 'Standalone portfolio with custom URL',
    price: 5,
  },
]

export const PAYMENT_METHODS = [
  {
    id: 'card',
    title: 'Debit / Credit Card',
    shortLabel: 'Card',
    description: 'Visa, Mastercard, and other supported cards through Tap hosted checkout.',
    helper: 'Best for general web checkout and 3D Secure flows.',
    badge: 'Instant',
    provider: 'tap',
    sourceId: 'src_card',
  },
  {
    id: 'apple_pay',
    title: 'Apple Pay',
    shortLabel: 'Apple Pay',
    description: 'Fast checkout for supported Apple devices and Safari browsers.',
    helper: 'Requires Apple Pay to be enabled on your Tap account and verified domain.',
    badge: 'Wallet',
    provider: 'tap',
    sourceId: 'src_apple_pay',
  },
  {
    id: 'benefit_pay',
    title: 'Benefit / BenefitPay',
    shortLabel: 'Benefit',
    description: 'Bahrain-friendly local payment flow in BHD through Tap redirection.',
    helper: 'Strong fit for local Bahrain customers and domestic debit behavior.',
    badge: 'Local',
    provider: 'tap',
    sourceId: 'src_bh.benefit',
  },
]

export function getPaymentMethod(methodId) {
  return PAYMENT_METHODS.find(method => method.id === methodId) || null
}

export function getPlanCheckoutItem(planId) {
  const plan = PLANS[planId]
  if (!plan || planId === 'free') return null

  return {
    itemType: 'plan',
    itemId: planId,
    name: `${plan.label} Plan`,
    description: `${plan.label} subscription for ConnectHub`,
    amount: plan.price,
    interval: 'month',
    isRecurring: true,
  }
}

export function getServiceCheckoutItem(serviceId) {
  const service = ONE_TIME_SERVICES.find(item => item.id === serviceId)
  if (!service) return null

  return {
    itemType: 'service',
    itemId: service.id,
    name: service.label,
    description: service.description,
    amount: service.price,
    interval: null,
    isRecurring: false,
  }
}

export function resolveCheckoutItem(itemType, itemId) {
  if (itemType === 'plan') return getPlanCheckoutItem(itemId)
  if (itemType === 'service') return getServiceCheckoutItem(itemId)
  return null
}

export function formatTapAmount(amount) {
  return Number(amount || 0).toFixed(3)
}

export function getTapSourceId(methodId) {
  return getPaymentMethod(methodId)?.sourceId || null
}

export function getAppUrl(origin = '') {
  return process.env.NEXT_PUBLIC_APP_URL || origin || 'http://localhost:3000'
}
