import Anthropic from '@anthropic-ai/sdk'
import { createRouteClient } from '@/lib/supabaseServer'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * POST /api/ai/proposal
 * Generates a proposal draft to help the freelancer respond faster.
 */
export async function POST(request) {
  try {
    const supabase = createRouteClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { projectTitle, projectDescription, skills = [], freelancerBio = '' } = await request.json()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 768,
      messages: [
        {
          role: 'user',
          content: `You are a freelance proposal drafting assistant for the Bahrain market.

Write a professional first draft for this freelance project proposal.
The draft should help the freelancer respond faster, but it must not invent claims, fake experience, or promise anything not supported by the provided details.
Keep it between 120-180 words. Return ONLY the proposal draft text.

Project: ${projectTitle}
Project Details: ${projectDescription || 'Not provided'}
Freelancer Skills: ${skills.join(', ') || 'Not specified'}
${freelancerBio ? `About the Freelancer: ${freelancerBio}` : ''}`,
        },
      ],
    })

    const proposal = message.content[0].text.trim()
    return Response.json({ success: true, data: { proposal } })
  } catch (error) {
    console.error('[Proposal Draft Error]', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
