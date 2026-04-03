function renderEmailShell({ eyebrow, title, body, details = [] }) {
  const detailRows = details
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e2f4fb;font-size:13px;color:#64748b;">${label}</td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid #e2f4fb;font-size:13px;font-weight:600;color:#0f172a;">${value}</td>
        </tr>
      `
    )
    .join('')

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ConnectHub Update</title>
      </head>
      <body style="margin:0;padding:0;background:#f4fbff;font-family:Arial,sans-serif;color:#0f172a;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4fbff;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid rgba(0,207,253,0.15);border-radius:24px;overflow:hidden;">
                <tr>
                  <td style="padding:24px 28px;background:linear-gradient(135deg,#0f172a 0%,#12344a 100%);color:#ffffff;">
                    <div style="display:inline-block;padding:10px 14px;border-radius:14px;background:linear-gradient(135deg,#00cffd,#0099cc);font-weight:700;font-size:18px;line-height:1;color:#ffffff;">CH</div>
                    <p style="margin:18px 0 8px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.65);">${eyebrow}</p>
                    <h1 style="margin:0;font-size:30px;line-height:1.2;">${title}</h1>
                    <p style="margin:12px 0 0;color:rgba(255,255,255,0.75);font-size:14px;line-height:1.8;">${body}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                      ${detailRows}
                    </table>
                    <div style="margin-top:22px;border-top:1px solid #e2f4fb;padding-top:18px;font-size:13px;line-height:1.8;color:#64748b;">
                      This message was sent by ConnectHub. You can continue the workflow inside your dashboard.
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

export function renderApplicationReceivedEmail({ seekerName, jobTitle, employerName }) {
  return renderEmailShell({
    eyebrow: 'Application received',
    title: 'A new application just arrived',
    body: `${seekerName || 'A candidate'} applied for ${jobTitle}. Review the profile, compare strengths, and move the application through your hiring pipeline.`,
    details: [
      { label: 'Candidate', value: seekerName || 'Candidate' },
      { label: 'Role', value: jobTitle || 'Open role' },
      { label: 'Hiring team', value: employerName || 'ConnectHub Employer' },
    ],
  })
}

export function renderApplicationStatusEmail({ seekerName, jobTitle, status, employerName, employerNotes }) {
  return renderEmailShell({
    eyebrow: 'Application update',
    title: 'Your application status changed',
    body: `${employerName || 'An employer'} updated your application for ${jobTitle} to ${status}.`,
    details: [
      { label: 'Applicant', value: seekerName || 'Job seeker' },
      { label: 'Role', value: jobTitle || 'Open role' },
      { label: 'New status', value: status || 'Updated' },
      { label: 'Employer notes', value: employerNotes || 'No note added' },
    ],
  })
}

export function renderMilestoneReviewedEmail({ freelancerName, milestoneTitle, contractTitle, outcome }) {
  return renderEmailShell({
    eyebrow: 'Milestone review',
    title: `Milestone ${outcome === 'released' ? 'approved' : 'updated'}`,
    body: `${freelancerName || 'Your freelancer'} had the milestone "${milestoneTitle}" reviewed for ${contractTitle}.`,
    details: [
      { label: 'Milestone', value: milestoneTitle || 'Milestone' },
      { label: 'Contract', value: contractTitle || 'Contract' },
      { label: 'Outcome', value: outcome || 'Reviewed' },
    ],
  })
}
