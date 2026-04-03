import { resolveCheckoutItem } from '@/lib/payments'
import { formatBD, formatDate } from '@/lib/utils'

export function buildReceipt({
  receiptNumber,
  amount,
  currency = 'BHD',
  methodLabel,
  status = 'Paid',
  itemName,
  itemDescription,
  itemType,
  itemId,
  customerName,
  customerEmail,
  paidAt,
}) {
  const resolved = itemName || resolveCheckoutItem(itemType, itemId)
  const title = typeof resolved === 'string' ? resolved : resolved?.name || 'ConnectHub Purchase'
  const description =
    itemDescription ||
    (typeof resolved === 'object' ? resolved?.description : '') ||
    'ConnectHub billing transaction'

  return {
    receiptNumber,
    amount: Number(amount || 0),
    currency,
    methodLabel,
    status,
    itemName: title,
    itemDescription: description,
    itemType,
    itemId,
    customerName: customerName || 'ConnectHub Customer',
    customerEmail: customerEmail || '',
    paidAt: paidAt || new Date().toISOString(),
  }
}

export function getReceiptText(receipt) {
  return {
    amount: receipt.currency === 'BHD' ? formatBD(receipt.amount) : `${receipt.amount} ${receipt.currency}`,
    paidAt: formatDate(receipt.paidAt),
  }
}

export function renderReceiptEmail({ receipt }) {
  const { amount, paidAt } = getReceiptText(receipt)

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ConnectHub Payment Confirmation</title>
      </head>
      <body style="margin:0;padding:0;background:#f4fbff;font-family:Arial,sans-serif;color:#0f172a;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4fbff;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid rgba(0,207,253,0.15);border-radius:24px;overflow:hidden;">
                <tr>
                  <td style="padding:24px 28px;background:linear-gradient(135deg,#0f172a 0%,#12344a 100%);color:#ffffff;">
                    <table role="presentation" width="100%">
                      <tr>
                        <td>
                          <div style="display:inline-block;padding:10px 14px;border-radius:14px;background:linear-gradient(135deg,#00cffd,#0099cc);font-weight:700;font-size:18px;line-height:1;color:#ffffff;">C</div>
                        </td>
                        <td align="right" style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.65);">
                          Payment Confirmation
                        </td>
                      </tr>
                    </table>
                    <h1 style="margin:22px 0 8px;font-size:30px;line-height:1.2;">Payment received</h1>
                    <p style="margin:0;color:rgba(255,255,255,0.75);font-size:14px;line-height:1.8;">
                      Your ConnectHub purchase has been confirmed. A receipt summary is included below for your records.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px;">
                    <div style="border:1px solid rgba(0,207,253,0.12);border-radius:20px;background:linear-gradient(135deg,rgba(0,207,253,0.08),rgba(0,153,204,0.06));padding:20px;">
                      <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#0099cc;">Receipt Summary</p>
                      <h2 style="margin:0 0 8px;font-size:24px;color:#0f172a;">${receipt.itemName}</h2>
                      <p style="margin:0;font-size:14px;line-height:1.8;color:#475569;">${receipt.itemDescription}</p>
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:20px;border-collapse:collapse;">
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e2f4fb;font-size:13px;color:#64748b;">Receipt Number</td>
                        <td align="right" style="padding:12px 0;border-bottom:1px solid #e2f4fb;font-size:13px;font-weight:600;color:#0f172a;">${receipt.receiptNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e2f4fb;font-size:13px;color:#64748b;">Paid By</td>
                        <td align="right" style="padding:12px 0;border-bottom:1px solid #e2f4fb;font-size:13px;font-weight:600;color:#0f172a;">${receipt.customerName}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e2f4fb;font-size:13px;color:#64748b;">Email</td>
                        <td align="right" style="padding:12px 0;border-bottom:1px solid #e2f4fb;font-size:13px;font-weight:600;color:#0f172a;">${receipt.customerEmail}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e2f4fb;font-size:13px;color:#64748b;">Payment Method</td>
                        <td align="right" style="padding:12px 0;border-bottom:1px solid #e2f4fb;font-size:13px;font-weight:600;color:#0f172a;">${receipt.methodLabel}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e2f4fb;font-size:13px;color:#64748b;">Paid On</td>
                        <td align="right" style="padding:12px 0;border-bottom:1px solid #e2f4fb;font-size:13px;font-weight:600;color:#0f172a;">${paidAt}</td>
                      </tr>
                      <tr>
                        <td style="padding:16px 0 0;font-size:13px;color:#64748b;">Total</td>
                        <td align="right" style="padding:16px 0 0;font-size:24px;font-weight:700;color:#0099cc;">${amount}</td>
                      </tr>
                    </table>

                    <div style="margin-top:26px;border-top:1px solid #e2f4fb;padding-top:18px;font-size:13px;line-height:1.8;color:#64748b;">
                      This message confirms your payment on ConnectHub. If you need help, reply through the platform or contact the ConnectHub support team.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}
