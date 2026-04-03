import Anthropic from '@anthropic-ai/sdk'
import { createRouteClient } from '@/lib/supabaseServer'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * POST /api/ai/cv
 * Generates a professional bio for a job seeker's CV/profile
 */
export async function POST(request) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { skills = [], headline = '', experienceYears = 0 } = await request.json()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `You are a professional CV writer specialising in Bahrain's job market.

Write a compelling 3-4 sentence professional bio for a job seeker's profile.
It should be written in first person, highlight their skills, and appeal to Bahraini employers.
Return ONLY the bio text, nothing else.

Headline/Role: ${headline || 'Professional'}
Skills: ${skills.join(', ') || 'Not specified'}
Years of Experience: ${experienceYears}`,
      }],
    })

    const bio = message.content[0].text.trim()
    return Response.json({ success: true, data: { bio } })

  } catch (error) {
    console.error('[AI CV Error]', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
