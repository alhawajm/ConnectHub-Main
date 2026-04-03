import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { buildReceipt, renderReceiptEmail } from '@/lib/paymentReceipts'
import { getPaymentMethod } from '@/lib/payments'
import { sendTransactionalEmail } from '@/lib/email'

function isSuccessfulPayment(status = '') {
  return ['CAPTURED', 'AUTHORIZED'].includes(String(status).toUpperCase())
}

export async function POST(request) {
  try {
    const payload = await request.json()
    const charge = payload || {}
    const metadata = charge.metadata || {}
    const customer = charge.customer || {}
    const paymentMethod = getPaymentMethod(metadata.paymentMethod)

    if (!isSuccessfulPayment(charge.status)) {
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
      const supabase = createAdminClient()
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

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json({ received: false, error: error.message }, { status: 400 })
  }
}
