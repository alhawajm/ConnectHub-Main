import Anthropic from '@anthropic-ai/sdk'
import { createRouteClient } from '@/lib/supabaseServer'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * POST /api/ai/cv
 * Generates a profile summary draft for CVs and public profiles.
 */
export async function POST(request) {
  try {
    const supabase = createRouteClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { skills = [], headline = '', experienceYears = 0 } = await request.json()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `You are a professional profile-writing assistant specialising in Bahrain's job market.

Write a clear 3-4 sentence first-person profile summary draft for a job seeker.
The summary should highlight the provided skills and role focus, but it must not invent experience or certifications that were not supplied.
Return ONLY the summary draft text.

Headline/Role: ${headline || 'Professional'}
Skills: ${skills.join(', ') || 'Not specified'}
Years of Experience: ${experienceYears}`,
        },
      ],
    })

    const bio = message.content[0].text.trim()
    return Response.json({ success: true, data: { bio } })
  } catch (error) {
    console.error('[Profile Summary Error]', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
