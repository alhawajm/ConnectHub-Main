import Link from 'next/link'
import { CheckCircle2, Clock3, Download, Mail, Wallet } from 'lucide-react'
import { getPaymentMethod, resolveCheckoutItem } from '@/lib/payments'
import { formatBD, formatDate } from '@/lib/utils'

export default function PaymentReturnPage({ searchParams }) {
  const provider = searchParams?.provider || 'payment'
  const method = searchParams?.method || 'checkout'
  const itemType = searchParams?.itemType || 'purchase'
  const itemId = searchParams?.itemId || ''
  const selectedMethod = getPaymentMethod(method)
  const checkoutItem = resolveCheckoutItem(itemType, itemId)
  const amount = checkoutItem?.amount || 0
  const title = checkoutItem?.name || 'ConnectHub Purchase'
  const description = checkoutItem?.description || 'Your payment is being finalized.'
  const receiptNumber = `CH-${String(itemId || itemType).toUpperCase()}`
  const paidOn = formatDate(new Date())

  return (
    <div className="page-wrapper flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <div className="surface-card-strong max-w-4xl p-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00cffd]/10 text-[#0099cc]">
              <Wallet className="h-8 w-8" />
            </div>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
              Payment confirmation
            </h1>
            <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
              You have returned from the {provider} checkout flow. We built the confirmation experience to match your ConnectHub dashboard language, and the same receipt structure is used for email delivery too.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="surface-card p-4">
                <div className="mb-2 flex items-center gap-2 text-[#0099cc]">
                  <CheckCircle2 className="h-4 w-4" />
                  <p className="text-sm font-semibold">Method</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selectedMethod?.title || method.replace(/_/g, ' ')}</p>
              </div>
              <div className="surface-card p-4">
                <div className="mb-2 flex items-center gap-2 text-[#0099cc]">
                  <Mail className="h-4 w-4" />
                  <p className="text-sm font-semibold">Email confirmation</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">A branded receipt email is ready to send once the provider confirms the charge.</p>
              </div>
              <div className="surface-card p-4">
                <div className="mb-2 flex items-center gap-2 text-[#0099cc]">
                  <Clock3 className="h-4 w-4" />
                  <p className="text-sm font-semibold">Status</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Redirected payments like Benefit may take a moment to finalize.</p>
              </div>
              <div className="surface-card p-4">
                <div className="mb-2 flex items-center gap-2 text-[#0099cc]">
                  <Download className="h-4 w-4" />
                  <p className="text-sm font-semibold">Receipt format</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">This page mirrors the receipt content used in email confirmations.</p>
              </div>
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#12344a_100%)] p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Receipt Preview</p>
              <h2 className="mt-2 font-display text-2xl font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-white/75">{description}</p>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#00cffd]/10 pb-3 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Receipt Number</span>
                <span className="font-semibold text-gray-900 dark:text-white">{receiptNumber}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#00cffd]/10 pb-3 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Payment Method</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedMethod?.title || method}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#00cffd]/10 pb-3 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Paid On</span>
                <span className="font-semibold text-gray-900 dark:text-white">{paidOn}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#00cffd]/10 pb-3 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Provider</span>
                <span className="font-semibold capitalize text-gray-900 dark:text-white">{provider}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                <span className="text-2xl font-bold text-[#0099cc]">{formatBD(amount)}</span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-[#00cffd]/20 px-4 py-3 text-xs leading-6 text-gray-500 dark:text-gray-400">
              Receipts and emails use the same order summary structure so billing stays consistent across the dashboard, inbox, and presentation flow.
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/pricing" className="btn-outline h-10 px-6">
            View pricing
          </Link>
          <Link href="/" className="btn-primary h-10 px-6">
            Back to ConnectHub
          </Link>
        </div>
      </div>
    </div>
  )
}
