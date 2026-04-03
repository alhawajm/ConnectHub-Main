'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, useToast } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import { getRolePlanMeta, roleHasSubscriptions } from '@/lib/utils'
import { ONE_TIME_SERVICES } from '@/lib/payments'
import {
  SAMPLE_INVOICES,
  SETTINGS_NOTIFICATION_DEFAULTS,
  SETTINGS_NOTIFICATION_FIELDS,
} from '@/components/dashboard/settings/constants'
import {
  Toggle,
  SecuritySection,
  FreeAccessCard,
  PaymentMethodsCard,
  CurrentPlanCard,
  UpgradePlansSection,
  OneTimeServicesCard,
  InvoiceHistoryCard,
  PaymentMethodModal,
} from '@/components/dashboard/settings/sections'

export function SettingsPage({ profile }) {
  const supabase = createClient()
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [notifs, setNotifs] = useState(SETTINGS_NOTIFICATION_DEFAULTS)

  const toggle = key => setNotifs(current => ({ ...current, [key]: !current[key] }))

  const saveNotifications = async () => {
    setSaving(true)
    setTimeout(() => {
      toast.success('Notification preferences saved')
      setSaving(false)
    }, 600)
  }

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Password changed')
    setShowPasswordModal(false)
    setNewPassword('')
  }

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <Card padding="md">
        <h3 className="mb-4 font-display font-bold text-gray-900 dark:text-white">Notifications</h3>
        {SETTINGS_NOTIFICATION_FIELDS.map(item => (
          <Toggle
            key={item.key}
            enabled={notifs[item.key]}
            onChange={() => toggle(item.key)}
            label={item.label}
            description={item.description}
          />
        ))}
        <Button className="mt-4" loading={saving} onClick={saveNotifications}>Save Preferences</Button>
      </Card>

      <SecuritySection
        profile={profile}
        showPasswordModal={showPasswordModal}
        setShowPasswordModal={setShowPasswordModal}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        onChangePassword={changePassword}
      />

      <Card padding="md" className="border-red-200 dark:border-red-900">
        <h3 className="mb-2 font-display font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button variant="danger" size="sm">Delete Account</Button>
      </Card>
    </div>
  )
}

export function BillingPage({ profile }) {
  const toast = useToast()
  const role = profile?.role
  const isEmployerBilling = roleHasSubscriptions(role)
  const currentPlan = profile?.plan || 'free'
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState('card')
  const [launchingCheckout, setLaunchingCheckout] = useState(false)
  const rolePlanMeta = getRolePlanMeta(profile)
  const availableServices = ONE_TIME_SERVICES.filter(service => {
    if (!service.audience?.length) return true
    return service.audience.includes(role)
  })

  const openCheckout = offer => {
    setSelectedOffer(offer)
    setSelectedMethod('card')
  }

  const closeCheckout = () => {
    if (!launchingCheckout) {
      setSelectedOffer(null)
    }
  }

  const launchCheckout = async () => {
    if (!selectedOffer) return

    setLaunchingCheckout(true)
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType: selectedOffer.itemType,
          itemId: selectedOffer.itemId,
          methodId: selectedMethod,
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || 'Could not start checkout.')
      }

      if (!payload?.data?.checkoutUrl) {
        throw new Error('Checkout URL was not returned.')
      }

      window.location.assign(payload.data.checkoutUrl)
    } catch (error) {
      setLaunchingCheckout(false)
      toast.error(error.message || 'Could not start checkout.')
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      {!isEmployerBilling && <FreeAccessCard role={role} />}
      <PaymentMethodsCard />
      <CurrentPlanCard currentPlan={currentPlan} isEmployerBilling={isEmployerBilling} planMeta={rolePlanMeta} role={role} />
      {isEmployerBilling && currentPlan !== 'platinum' && (
        <UpgradePlansSection currentPlan={currentPlan} onOpenCheckout={openCheckout} />
      )}
      {availableServices.length > 0 && <OneTimeServicesCard services={availableServices} onOpenCheckout={openCheckout} />}
      {isEmployerBilling && SAMPLE_INVOICES.length > 0 && <InvoiceHistoryCard invoices={SAMPLE_INVOICES} />}
      <PaymentMethodModal
        selectedOffer={selectedOffer}
        selectedMethod={selectedMethod}
        setSelectedMethod={setSelectedMethod}
        launchingCheckout={launchingCheckout}
        closeCheckout={closeCheckout}
        launchCheckout={launchCheckout}
      />
    </div>
  )
}
