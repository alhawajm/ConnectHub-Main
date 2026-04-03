'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Card, useToast, Modal } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn, PLANS, formatDate } from '@/lib/utils'

// ── Toggle Switch component ───────────────────────────────────────
function Toggle({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative w-10 h-6 rounded-full transition-colors flex-shrink-0',
          enabled ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'
        )}
      >
        <span className={cn(
          'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all',
          enabled ? 'left-5' : 'left-1'
        )} />
      </button>
    </div>
  )
}

/**
 * SettingsPage — notification preferences, password change, account settings
 */
export function SettingsPage({ profile }) {
  const supabase = createClient()
  const toast    = useToast()
  const [saving, setSaving] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  // Notification toggles (stored in profile.settings JSONB in a real app)
  const [notifs, setNotifs] = useState({
    newApplications:    true,
    aiMatches:          true,
    messages:           true,
    interviewReminders: true,
    weeklyDigest:       false,
    marketingEmails:    false,
  })
  const toggle = (key) => setNotifs(n => ({ ...n, [key]: !n[key] }))

  const saveNotifications = async () => {
    setSaving(true)
    // In a full implementation, save to a settings table
    setTimeout(() => {
      toast.success('Notification preferences saved ✓')
      setSaving(false)
    }, 600)
  }

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { toast.error(error.message); return }
    toast.success('Password changed ✓')
    setShowPasswordModal(false)
    setNewPassword('')
  }

  return (
    <div className="max-w-2xl flex flex-col gap-5">

      {/* Notifications */}
      <Card padding="md">
        <h3 className="font-display font-bold text-gray-900 dark:text-white mb-4">Notifications</h3>
        <Toggle enabled={notifs.newApplications}    onChange={() => toggle('newApplications')}    label="New applications"         description="When someone applies to your job post" />
        <Toggle enabled={notifs.aiMatches}          onChange={() => toggle('aiMatches')}          label="AI candidate matches"     description="When AI finds a strong match for your role" />
        <Toggle enabled={notifs.messages}           onChange={() => toggle('messages')}           label="New messages"             description="Direct messages from candidates or employers" />
        <Toggle enabled={notifs.interviewReminders} onChange={() => toggle('interviewReminders')} label="Interview reminders"      description="24hr and 1hr reminders before scheduled interviews" />
        <Toggle enabled={notifs.weeklyDigest}       onChange={() => toggle('weeklyDigest')}       label="Weekly digest"            description="Weekly summary of platform activity" />
        <Toggle enabled={notifs.marketingEmails}    onChange={() => toggle('marketingEmails')}    label="Product updates"          description="ConnectHub news and new feature announcements" />
        <Button className="mt-4" loading={saving} onClick={saveNotifications}>Save Preferences</Button>
      </Card>

      {/* Security */}
      <Card padding="md">
        <h3 className="font-display font-bold text-gray-900 dark:text-white mb-4">Security</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Password</p>
              <p className="text-xs text-gray-400 mt-0.5">Last changed: never</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setShowPasswordModal(true)}>
              Change Password
            </Button>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-gray-50 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Email address</p>
              <p className="text-xs text-gray-400 mt-0.5">{profile?.email || 'Not set'}</p>
            </div>
            <Button size="sm" variant="ghost">Change Email</Button>
          </div>
        </div>
      </Card>

      {/* Danger zone */}
      <Card padding="md" className="border-red-200 dark:border-red-900">
        <h3 className="font-display font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button variant="danger" size="sm">Delete Account</Button>
      </Card>

      {/* Password modal */}
      <Modal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
        <div className="flex flex-col gap-4">
          <Input label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" />
          <div className="flex gap-3">
            <Button onClick={changePassword} fullWidth>Update Password</Button>
            <Button variant="ghost" onClick={() => setShowPasswordModal(false)} fullWidth>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── Billing & subscription page ───────────────────────────────────
const PLAN_FEATURES = {
  free: {
    color: 'gray',
    features: ['Browse jobs (limited)', 'Apply to 5 jobs/month', 'Basic profile'],
  },
  silver: {
    color: 'blue',
    features: ['Limited CV database', 'Up to 5 job posts/month', 'Freelancer portfolio access (limited)', 'Email alerts'],
  },
  gold: {
    color: 'yellow',
    features: ['Full CV database', 'Unlimited job posts', 'Application analytics', 'Freelancer portfolios (unlimited)', 'AI candidate matching'],
  },
  platinum: {
    color: 'cyan',
    features: ['Unrestricted database access', 'AI recommendations', 'Recruitment counselling sessions', 'Job matching', 'Priority support', 'AI job description optimiser'],
  },
}

/**
 * BillingPage — current plan, upgrade options, invoice history
 */
export function BillingPage({ profile }) {
  const toast = useToast()
  const currentPlan = profile?.plan || 'free'

  const UPGRADE_PLANS = ['silver', 'gold', 'platinum']

  const handleUpgrade = (plan) => {
    // In production: integrate with Tap Payments / BenefitPay
    toast.info(`Redirecting to payment for ${plan} plan… (Tap Payments integration coming soon)`)
  }

  const INVOICES = [
    { date: '2026-03-01', amount: 28, plan: 'Platinum', status: 'Paid' },
    { date: '2026-02-01', amount: 28, plan: 'Platinum', status: 'Paid' },
    { date: '2026-01-01', amount: 23, plan: 'Gold',     status: 'Paid' },
  ]

  return (
    <div className="max-w-2xl flex flex-col gap-5">

      {/* Current plan */}
      <Card padding="md" className={cn(
        'border-2',
        currentPlan === 'platinum' && 'border-cyan-300 dark:border-cyan-700 bg-cyan-50 dark:bg-cyan-900/10',
        currentPlan === 'gold'     && 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10',
        currentPlan === 'silver'   && 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10',
        currentPlan === 'free'     && 'border-gray-200 dark:border-gray-700',
      )}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current Plan</p>
            <h3 className="font-display font-bold text-2xl text-gray-900 dark:text-white capitalize">
              {currentPlan === 'platinum' && '💎 '}
              {currentPlan === 'gold'     && '🥇 '}
              {currentPlan === 'silver'   && '🥈 '}
              {currentPlan} Plan
            </h3>
            {currentPlan !== 'free' && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                BD {PLANS[currentPlan]?.price}/month · Renews Mar 1, 2027
              </p>
            )}
          </div>
          {currentPlan !== 'free' && (
            <Button size="sm" variant="ghost">Cancel Plan</Button>
          )}
        </div>
        {/* Current plan features */}
        <ul className="mt-4 flex flex-col gap-1">
          {(PLAN_FEATURES[currentPlan]?.features || []).map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="text-green-500 font-bold flex-shrink-0">✓</span> {f}
            </li>
          ))}
        </ul>
      </Card>

      {/* Upgrade options */}
      {currentPlan !== 'platinum' && (
        <div>
          <h3 className="font-display font-bold text-gray-900 dark:text-white mb-3">Upgrade your plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {UPGRADE_PLANS.filter(p => {
              const order = { free: 0, silver: 1, gold: 2, platinum: 3 }
              return order[p] > order[currentPlan]
            }).map(plan => (
              <div
                key={plan}
                className={cn(
                  'border-2 rounded-xl p-4',
                  plan === 'platinum' && 'border-cyan-300 dark:border-cyan-700',
                  plan === 'gold'     && 'border-yellow-300 dark:border-yellow-700',
                  plan === 'silver'   && 'border-blue-300 dark:border-blue-700',
                )}
              >
                <h4 className="font-display font-bold capitalize text-gray-900 dark:text-white">
                  {plan === 'platinum' && '💎 '}
                  {plan === 'gold'     && '🥇 '}
                  {plan === 'silver'   && '🥈 '}
                  {plan}
                </h4>
                <p className="font-bold text-xl text-brand-500 my-1">BD {PLANS[plan]?.price}<span className="text-sm font-normal text-gray-400">/mo</span></p>
                <ul className="flex flex-col gap-1 mb-3">
                  {(PLAN_FEATURES[plan]?.features || []).slice(0, 3).map(f => (
                    <li key={f} className="text-xs text-gray-500 dark:text-gray-400 flex gap-1.5">
                      <span className="text-green-500 flex-shrink-0">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm" fullWidth
                  variant={plan === 'platinum' ? 'primary' : 'outline'}
                  onClick={() => handleUpgrade(plan)}
                >
                  Upgrade to {plan}
                </Button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Payment via Tap Payments · BenefitPay supported · Cancel anytime
          </p>
        </div>
      )}

      {/* One-time services */}
      <Card padding="md">
        <h3 className="font-display font-bold text-gray-900 dark:text-white mb-3">One-Time Services</h3>
        <div className="flex flex-col divide-y divide-gray-50 dark:divide-gray-800">
          {[
            { label: 'Single Job Post',          price: 2,  desc: 'Post one job without a subscription' },
            { label: 'Bulk Job Posts (×10)',      price: 15, desc: '10 job posts at a discounted rate'   },
            { label: 'Professional Portfolio Page', price: 5, desc: 'Standalone portfolio with custom URL' },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.label}</p>
                <p className="text-xs text-gray-400">{s.desc}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-brand-500">BD {s.price}</span>
                <Button size="xs" variant="outline" onClick={() => toast.info('Payment flow coming soon')}>Buy</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Invoice history */}
      {INVOICES.length > 0 && (
        <Card padding="none">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white">Invoice History</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                {['Date','Plan','Amount','Status',''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{formatDate(inv.date)}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900 dark:text-white">{inv.plan}</td>
                  <td className="px-5 py-3 font-bold text-brand-500">BD {inv.amount}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button className="text-xs text-brand-500 hover:text-brand-600 font-semibold">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
