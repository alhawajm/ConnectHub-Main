import Anthropic from '@anthropic-ai/sdk'
import { createRouteClient } from '@/lib/supabaseServer'
import { scoreApplicationForEmployer } from '@/lib/jobMatching'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * POST /api/ai/match
 *
 * Handles two modes:
 *  1. type: 'job_description' — optimise a job post description using AI
 *  2. type: 'candidate_match' — rate candidate fit against a job (0-100)
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
      const { jobTitle, jobSkills, jobLocation, candidateSkills, candidateHeadline, candidateLocation, coverLetter } = body

      const result = scoreApplicationForEmployer({
        cover_letter: coverLetter,
        profiles: {
          skills: candidateSkills,
          headline: candidateHeadline,
          location: candidateLocation,
        },
        jobs: {
          title: jobTitle,
          skills_required: jobSkills,
          location: jobLocation,
        },
        created_at: new Date().toISOString(),
      })

      return Response.json({
        success: true,
        data: {
          score: result.score,
          reasons: result.reasons,
          matchedSkills: result.matchedSkills,
          breakdown: result.breakdown,
          note: 'This is a comparison aid, not a hiring decision.',
        },
      })
    }

    return Response.json({ error: 'Invalid type' }, { status: 400 })

  } catch (error) {
    console.error('[AI Match Error]', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
