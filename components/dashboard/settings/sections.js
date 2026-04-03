'use client'

import { Card, Modal } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn, PLANS, formatDate } from '@/lib/utils'
import { Building2, CheckCircle2 } from 'lucide-react'
import { PAYMENT_METHODS } from '@/lib/payments'
import { PAYMENT_METHOD_ICONS, PLAN_FEATURES } from './constants'

export function Toggle({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0 dark:border-gray-800">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {description && <p className="mt-0.5 text-xs text-gray-400">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative h-6 w-10 flex-shrink-0 rounded-full transition-colors',
          enabled ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'
        )}
      >
        <span
          className={cn(
            'absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all',
            enabled ? 'left-5' : 'left-1'
          )}
        />
      </button>
    </div>
  )
}

export function SecuritySection({ profile, showPasswordModal, setShowPasswordModal, newPassword, setNewPassword, onChangePassword }) {
  return (
    <>
      <Card padding="md">
        <h3 className="mb-4 font-display font-bold text-gray-900 dark:text-white">Security</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Password</p>
              <p className="mt-0.5 text-xs text-gray-400">Last changed: never</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setShowPasswordModal(true)}>
              Change Password
            </Button>
          </div>
          <div className="flex items-center justify-between border-t border-gray-50 py-2 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Email address</p>
              <p className="mt-0.5 text-xs text-gray-400">{profile?.email || 'Not set'}</p>
            </div>
            <Button size="sm" variant="ghost">Change Email</Button>
          </div>
        </div>
      </Card>

      <Modal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
        <div className="flex flex-col gap-4">
          <Input label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" />
          <div className="flex gap-3">
            <Button onClick={onChangePassword} fullWidth>Update Password</Button>
            <Button variant="ghost" onClick={() => setShowPasswordModal(false)} fullWidth>Cancel</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export function FreeAccessCard({ role }) {
  return (
    <Card padding="md" className="border-2 border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/40 dark:bg-emerald-950/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Free Access</p>
          <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
            {role === 'freelancer' ? 'Freelancer access stays free' : 'Job seeker access stays free'}
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            ConnectHub subscriptions are reserved for employer hiring tools. Your account keeps core platform access without a monthly plan.
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {(role === 'freelancer'
          ? ['Browse projects freely', 'Send proposals from your dashboard', 'Manage contracts, escrow, and reviews', 'Build your profile and portfolio']
          : ['Browse and apply for jobs freely', 'Get smart matches and saved jobs', 'Build your CV and profile', 'Access career guidance and messaging']
        ).map(feature => (
          <div key={feature} className="rounded-xl border border-emerald-200/70 bg-white/80 p-4 text-sm text-gray-700 dark:border-emerald-900/40 dark:bg-[#0e1a2b] dark:text-gray-300">
            {feature}
          </div>
        ))}
      </div>
    </Card>
  )
}

export function PaymentMethodsCard() {
  return (
    <Card padding="md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-gray-900 dark:text-white">Accepted Payment Methods</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            ConnectHub billing now supports Bahrain-ready checkout planning through Tap, with cards, Apple Pay, and Benefit in BHD.
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00cffd]/10 text-[#0099cc]">
          <Building2 className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {PAYMENT_METHODS.map(method => {
          const Icon = PAYMENT_METHOD_ICONS[method.id]
          return (
            <div key={method.id} className="rounded-2xl border border-[#00cffd]/10 bg-[#00cffd]/5 p-4 dark:bg-[#102034]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0099cc] shadow-sm dark:bg-[#0e1a2b]">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="rounded-full border border-[#00cffd]/20 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0099cc] dark:bg-[#0e1a2b]">
                  {method.badge}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{method.title}</p>
              <p className="mt-1 text-xs leading-6 text-gray-500 dark:text-gray-400">{method.description}</p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-gray-400">{method.helper}</p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export function CurrentPlanCard({ currentPlan, isEmployerBilling, planMeta, role }) {
  return (
    <Card
      padding="md"
      className={cn(
        'border-2',
        planMeta.key === 'platinum' && 'border-cyan-300 bg-cyan-50 dark:border-cyan-700 dark:bg-cyan-900/10',
        planMeta.key === 'gold' && 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/10',
        planMeta.key === 'silver' && 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/10',
        planMeta.key === 'free' && 'border-gray-200 dark:border-gray-700'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Current Plan</p>
          <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
            {isEmployerBilling ? `${planMeta.label} Plan` : `${planMeta.label} Access`}
          </h3>
          {isEmployerBilling && currentPlan !== 'free' && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              BD {PLANS[currentPlan]?.price}/month · Renews Mar 1, 2027
            </p>
          )}
          {!isEmployerBilling && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No subscription is required for your role.
            </p>
          )}
        </div>
        {isEmployerBilling && currentPlan !== 'free' && <Button size="sm" variant="ghost">Cancel Plan</Button>}
      </div>
      <ul className="mt-4 flex flex-col gap-1">
        {(isEmployerBilling
          ? (PLAN_FEATURES[currentPlan]?.features || [])
          : role === 'freelancer'
            ? ['Project browsing and proposals', 'Escrow, contracts, and disputes', 'Portfolio and profile tools']
            : ['Job search and applications', 'Smart matches and saved jobs', 'CV, profile, and career tools']
        ).map(feature => (
          <li key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex-shrink-0 font-bold text-green-500">•</span> {feature}
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function UpgradePlansSection({ currentPlan, onOpenCheckout }) {
  const upgradePlans = ['silver', 'gold', 'platinum']

  return (
    <div>
      <h3 className="mb-3 font-display font-bold text-gray-900 dark:text-white">Upgrade your plan</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {upgradePlans
          .filter(plan => {
            const order = { free: 0, silver: 1, gold: 2, platinum: 3 }
            return order[plan] > order[currentPlan]
          })
          .map(plan => (
            <div
              key={plan}
              className={cn(
                'rounded-xl border-2 p-4',
                plan === 'platinum' && 'border-cyan-300 dark:border-cyan-700',
                plan === 'gold' && 'border-yellow-300 dark:border-yellow-700',
                plan === 'silver' && 'border-blue-300 dark:border-blue-700'
              )}
            >
              <h4 className="font-display font-bold capitalize text-gray-900 dark:text-white">{plan}</h4>
              <p className="my-1 text-xl font-bold text-brand-500">
                BD {PLANS[plan]?.price}
                <span className="text-sm font-normal text-gray-400">/mo</span>
              </p>
              <ul className="mb-3 flex flex-col gap-1">
                {(PLAN_FEATURES[plan]?.features || []).slice(0, 3).map(feature => (
                  <li key={feature} className="flex gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex-shrink-0 text-green-500">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                fullWidth
                variant={plan === 'platinum' ? 'primary' : 'outline'}
                onClick={() =>
                  onOpenCheckout({
                    itemType: 'plan',
                    itemId: plan,
                    label: `${PLANS[plan]?.label} Plan`,
                    price: PLANS[plan]?.price,
                    recurrence: 'Monthly subscription',
                  })
                }
              >
                Upgrade to {plan}
              </Button>
            </div>
          ))}
      </div>
      <p className="mt-2 text-center text-xs text-gray-400">
        Choose your method at checkout: cards, Apple Pay, or Benefit.
      </p>
    </div>
  )
}

export function OneTimeServicesCard({ services, onOpenCheckout }) {
  return (
    <Card padding="md">
      <h3 className="mb-3 font-display font-bold text-gray-900 dark:text-white">One-Time Services</h3>
      <div className="flex flex-col divide-y divide-gray-50 dark:divide-gray-800">
        {services.map(service => (
          <div key={service.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{service.label}</p>
              <p className="text-xs text-gray-400">{service.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-brand-500">BD {service.price}</span>
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  onOpenCheckout({
                    itemType: 'service',
                    itemId: service.id,
                    label: service.label,
                    price: service.price,
                    recurrence: 'One-time charge',
                  })
                }
              >
                Buy
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function InvoiceHistoryCard({ invoices }) {
  return (
    <Card padding="none">
      <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <h3 className="text-sm font-display font-bold text-gray-900 dark:text-white">Invoice History</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
            {['Date', 'Plan', 'Amount', 'Status', ''].map(header => (
              <th key={header} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => (
            <tr key={index} className="border-b border-gray-50 last:border-0 dark:border-gray-800">
              <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{formatDate(invoice.date)}</td>
              <td className="px-5 py-3 font-semibold text-gray-900 dark:text-white">{invoice.plan}</td>
              <td className="px-5 py-3 font-bold text-brand-500">BD {invoice.amount}</td>
              <td className="px-5 py-3">
                <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-bold text-green-600 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                  {invoice.status}
                </span>
              </td>
              <td className="px-5 py-3">
                <button className="text-xs font-semibold text-brand-500 hover:text-brand-600">Download</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export function PaymentMethodModal({ selectedOffer, selectedMethod, setSelectedMethod, launchingCheckout, closeCheckout, launchCheckout }) {
  return (
    <Modal open={!!selectedOffer} onClose={closeCheckout} title="Choose Payment Method" size="lg">
      {selectedOffer && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#00cffd]/10 bg-[#00cffd]/5 p-4 dark:bg-[#102034]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0099cc]">Checkout summary</p>
            <h4 className="mt-2 font-display text-xl font-bold text-gray-900 dark:text-white">{selectedOffer.label}</h4>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="rounded-full border border-[#00cffd]/15 bg-white px-3 py-1 dark:bg-[#0e1a2b]">BD {selectedOffer.price}</span>
              <span>{selectedOffer.recurrence}</span>
            </div>
          </div>

          <div className="space-y-3">
            {PAYMENT_METHODS.map(method => {
              const Icon = PAYMENT_METHOD_ICONS[method.id]
              const active = selectedMethod === method.id
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  className={cn(
                    'flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all',
                    active
                      ? 'border-[#00cffd] bg-[#00cffd]/5 shadow-sm'
                      : 'border-[#00cffd]/10 hover:border-[#00cffd]/30 hover:bg-[#00cffd]/5'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-xl',
                      active ? 'bg-gradient-to-r from-[#00cffd] to-[#0099cc] text-white' : 'bg-[#00cffd]/10 text-[#0099cc]'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{method.title}</p>
                      <span className="rounded-full border border-[#00cffd]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0099cc]">
                        {method.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{method.description}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-gray-400">{method.helper}</p>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="rounded-2xl border border-dashed border-[#00cffd]/20 px-4 py-3 text-xs leading-6 text-gray-500 dark:text-gray-400">
            Apple Pay depends on supported Apple devices and wallet setup. Benefit uses a Bahrain-local redirect flow. All amounts are prepared in BHD.
          </div>

          <div className="flex gap-3">
            <Button fullWidth onClick={launchCheckout} loading={launchingCheckout}>Continue to Checkout</Button>
            <Button variant="ghost" fullWidth onClick={closeCheckout}>Cancel</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
