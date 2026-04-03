import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabaseServer'
import { roleHasSubscriptions } from '@/lib/utils'
import {
  getAppUrl,
  getPaymentMethod,
  getTapSourceId,
  formatTapAmount,
  resolveCheckoutItem,
} from '@/lib/payments'

function splitName(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] || 'ConnectHub',
    lastName: parts.slice(1).join(' ') || 'User',
  }
}

async function createTapCharge({ item, method, user, origin }) {
  const secretKey = process.env.TAP_SECRET_KEY
  if (!secretKey) {
    throw new Error('Tap Payments is not configured yet. Add TAP_SECRET_KEY to enable live checkout.')
  }

  const sourceId = getTapSourceId(method.id)
  if (!sourceId) {
    throw new Error('Unsupported payment method.')
  }

  const appUrl = getAppUrl(origin)
  const { firstName, lastName } = splitName(
    user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'ConnectHub User'
  )

  const response = await fetch('https://api.tap.company/v2/charges', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: formatTapAmount(item.amount),
      currency: 'BHD',
      customer_initiated: true,
      threeDSecure: true,
      save_card: false,
      description: `${item.name} on ConnectHub`,
      statement_descriptor: 'ConnectHub',
      metadata: {
        itemType: item.itemType,
        itemId: item.itemId,
        paymentMethod: method.id,
        recurrence: item.interval || 'one_time',
        userId: user.id,
      },
      customer: {
        first_name: firstName,
        last_name: lastName,
        email: user.email,
      },
      source: {
        id: sourceId,
      },
      redirect: {
        url: `${appUrl}/payment/return?provider=tap&method=${method.id}&itemType=${item.itemType}&itemId=${item.itemId}`,
      },
      post: {
        url: `${appUrl}/api/payments/tap/webhook`,
      },
    }),
  })

  const payload = await response.json()

  if (!response.ok) {
    const message =
      payload?.errors?.[0]?.description ||
      payload?.message ||
      'Could not initialize Tap checkout.'
    throw new Error(message)
  }

  const checkoutUrl = payload?.transaction?.url
  if (!checkoutUrl) {
    throw new Error('Tap checkout URL was not returned.')
  }

  return checkoutUrl
}

export async function POST(request) {
  try {
    const supabase = createRouteClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { itemType, itemId, methodId } = await request.json()
    const item = resolveCheckoutItem(itemType, itemId)
    const method = getPaymentMethod(methodId)

    if (!item) {
      return NextResponse.json({ error: 'Unknown payment item.' }, { status: 400 })
    }

    if (!method) {
      return NextResponse.json({ error: 'Unknown payment method.' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (itemType === 'plan' && !roleHasSubscriptions(profile?.role)) {
      return NextResponse.json(
        { error: 'Subscriptions are only available for employer accounts.' },
        { status: 403 }
      )
    }

    const checkoutUrl = await createTapCharge({
      item,
      method,
      user: session.user,
      origin: request.nextUrl.origin,
    })

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl,
        provider: method.provider,
        method: method.id,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Could not initialize checkout.' },
      { status: 500 }
    )
  }
}
