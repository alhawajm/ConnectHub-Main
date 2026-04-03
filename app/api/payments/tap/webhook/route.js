import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { buildReceipt, renderReceiptEmail } from '@/lib/paymentReceipts'
import { getPaymentMethod } from '@/lib/payments'
import { sendTransactionalEmail } from '@/lib/email'
import { verifyTapWebhookSignature } from '@/lib/tapWebhook'
import { recordAnalyticsEvent, recordServerError } from '@/lib/telemetry'

function isSuccessfulPayment(status = '') {
  return ['CAPTURED', 'AUTHORIZED'].includes(String(status).toUpperCase())
}

function isDuplicateWebhookInsert(error) {
  return error?.code === '23505'
}

function isMissingWebhookTable(error) {
  return error?.code === '42P01'
}

export async function POST(request) {
  try {
    const secretKey = process.env.TAP_SECRET_KEY
    const payload = await request.json()
    const charge = payload || {}
    const metadata = charge.metadata || {}
    const customer = charge.customer || {}
    const paymentMethod = getPaymentMethod(metadata.paymentMethod)
    const verification = verifyTapWebhookSignature(charge, request.headers, secretKey)

    if (!verification.ok) {
      await recordAnalyticsEvent({
        category: 'payments',
        action: 'webhook_rejected',
        level: 'error',
        route: '/api/payments/tap/webhook',
        message: verification.reason,
        metadata: {
          chargeId: charge.id || null,
          status: charge.status || null,
        },
        notify: true,
        notificationTitle: 'Tap webhook rejected',
        notificationBody: verification.reason,
      })

      return NextResponse.json({ received: false, error: verification.reason }, { status: 401 })
    }

    const supabase = createAdminClient()
    const webhookEventId = String(charge.id || charge.reference?.payment || '')

    if (!webhookEventId) {
      return NextResponse.json({ received: false, error: 'Webhook event id is missing.' }, { status: 400 })
    }

    const { error: webhookInsertError } = await supabase
      .from('payment_webhook_events')
      .insert({
        provider: 'tap',
        event_id: webhookEventId,
        event_type: charge.object || 'charge',
        status: charge.status || null,
        payload: charge,
      })

    if (isDuplicateWebhookInsert(webhookInsertError)) {
      await recordAnalyticsEvent({
        category: 'payments',
        action: 'webhook_duplicate_ignored',
        route: '/api/payments/tap/webhook',
        message: `Duplicate Tap webhook ignored for ${webhookEventId}.`,
        metadata: { chargeId: webhookEventId, status: charge.status || null },
      })
      return NextResponse.json({ received: true, duplicate: true })
    }

    if (isMissingWebhookTable(webhookInsertError)) {
      throw new Error(
        'Payment webhook persistence is not configured yet. Apply supabase/migrations/20260403_payment_webhook_hardening.sql before enabling live payment webhooks.'
      )
    }

    if (webhookInsertError) {
      throw webhookInsertError
    }

    if (!isSuccessfulPayment(charge.status)) {
      await recordAnalyticsEvent({
        category: 'payments',
        action: 'webhook_ignored',
        route: '/api/payments/tap/webhook',
        message: `Tap webhook for ${webhookEventId} was ignored because payment is ${charge.status || 'unknown'}.`,
        metadata: { chargeId: webhookEventId, status: charge.status || null },
      })
      return NextResponse.json({ received: true, ignored: true })
    }

    const receipt = buildReceipt({
      receiptNumber: charge.reference?.payment || charge.id || `CH-${Date.now()}`,
      amount: charge.amount,
      currency: charge.currency || 'BHD',
      methodLabel: paymentMethod?.title || metadata.paymentMethod || charge.source?.payment_method || 'Online payment',
      status: 'Paid',
      itemType: metadata.itemType,
      itemId: metadata.itemId,
      customerName: [customer.first_name, customer.last_name].filter(Boolean).join(' ') || 'ConnectHub Customer',
      customerEmail: customer.email || '',
      paidAt: charge.transaction?.created || charge.created || new Date().toISOString(),
    })

    if (metadata.userId) {
      await supabase.from('notifications').insert({
        user_id: metadata.userId,
        type: 'payment',
        title: `${receipt.itemName} payment confirmed`,
        body: `Receipt ${receipt.receiptNumber} was paid successfully via ${receipt.methodLabel}.`,
        link: `/payment/return?provider=tap&method=${metadata.paymentMethod || ''}&itemType=${metadata.itemType || ''}&itemId=${metadata.itemId || ''}`,
      })
    }

    if (receipt.customerEmail) {
      await sendTransactionalEmail({
        to: receipt.customerEmail,
        subject: `ConnectHub receipt ${receipt.receiptNumber}`,
        html: renderReceiptEmail({ receipt }),
      })
    }

    await recordAnalyticsEvent({
      category: 'payments',
      action: 'webhook_processed',
      route: '/api/payments/tap/webhook',
      message: `Tap webhook verified and processed for ${receipt.receiptNumber}.`,
      metadata: {
        chargeId: webhookEventId,
        paymentReference: charge.reference?.payment || null,
        amount: charge.amount || null,
        currency: charge.currency || null,
        paymentMethod: metadata.paymentMethod || null,
        itemType: metadata.itemType || null,
        itemId: metadata.itemId || null,
      },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    await recordServerError({
      category: 'payments',
      action: 'webhook_failed',
      error,
      route: '/api/payments/tap/webhook',
      notificationTitle: 'Tap webhook processing failed',
    })
    return NextResponse.json({ received: false, error: error.message }, { status: 400 })
  }
}
