import Anthropic from '@anthropic-ai/sdk'
import { createRouteClient } from '@/lib/supabaseServer'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * POST /api/ai/proposal
 * Generates a winning freelance project proposal
 */
export async function POST(request) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { projectTitle, projectDescription, skills = [], freelancerBio = '' } = await request.json()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 768,
      messages: [{
        role: 'user',
        content: `You are an expert freelance proposal writer for the Bahrain market.

Write a professional, persuasive proposal for this freelance project.
The tone should be confident, specific, and professional — not generic.
Keep it between 150-200 words. Return ONLY the proposal text.

Project: ${projectTitle}
Project Details: ${projectDescription || 'Not provided'}
Freelancer Skills: ${skills.join(', ') || 'Not specified'}
${freelancerBio ? `About the Freelancer: ${freelancerBio}` : ''}`,
      }],
    })

    const proposal = message.content[0].text.trim()
    return Response.json({ success: true, data: { proposal } })

  } catch (error) {
    console.error('[AI Proposal Error]', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
