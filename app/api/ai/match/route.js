import Anthropic from '@anthropic-ai/sdk'
import { createRouteClient } from '@/lib/supabaseServer'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * POST /api/ai/match
 *
 * Handles two modes:
 *  1. type: 'job_description' — optimise a job post description using AI
 *  2. type: 'candidate_match' — score a candidate against a job (0-100)
 */
export async function POST(request) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { type } = body

    // ── Mode 1: Optimise job description ────────────────────────
    if (type === 'job_description') {
      const { title, description } = body

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `You are an expert Bahrain-based HR consultant and technical recruiter.

Optimise this job description to attract high-quality candidates in Bahrain's job market.
Make it clear, compelling, and specific. Use professional but approachable language.
Keep it under 300 words. Return ONLY the improved description, no preamble.

Job Title: ${title}
Current Description: ${description || 'Not provided — write a compelling description based on the title.'}`,
        }],
      })

      const optimised = message.content[0].text
      return Response.json({ success: true, data: { description: optimised } })
    }

    // ── Mode 2: Score candidate against job ─────────────────────
    if (type === 'candidate_match') {
      const { jobTitle, jobSkills, candidateSkills, experienceYears } = body

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: `You are an AI recruiter. Score how well this candidate matches the job.

Job: ${jobTitle}
Required Skills: ${jobSkills?.join(', ') || 'Not specified'}

Candidate Skills: ${candidateSkills?.join(', ') || 'Not specified'}
Experience: ${experienceYears || 0} years

Respond with ONLY a JSON object: {"score": <number 0-100>, "reason": "<one sentence>"}`,
        }],
      })

      const parsed = JSON.parse(message.content[0].text)
      return Response.json({ success: true, data: parsed })
    }

    return Response.json({ error: 'Invalid type' }, { status: 400 })

  } catch (error) {
    console.error('[AI Match Error]', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
