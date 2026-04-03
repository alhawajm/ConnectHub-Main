export function contractProgress(contractId, milestonesByContract) {
  const milestones = milestonesByContract[contractId] || []
  if (!milestones.length) return 0
  const released = milestones.filter(item => item.status === 'released').length
  return Math.round((released / milestones.length) * 100)
}

export function currencyTotal(rows, statuses = []) {
  return (rows || [])
    .filter(row => !statuses.length || statuses.includes(row.status))
    .reduce((sum, row) => sum + Number(row.amount || 0), 0)
}

export function safeText(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback
}
