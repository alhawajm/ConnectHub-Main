function toArray(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return value.split(',')
  return []
}

export function normalizeSkills(value) {
  return toArray(value)
    .map(item => String(item).trim())
    .filter(Boolean)
}

function normalizeComparable(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(value) {
  return normalizeComparable(value)
    .split(' ')
    .filter(token => token.length > 1)
}

function overlapRatio(a, b) {
  if (!a.length || !b.length) return 0
  const bSet = new Set(b)
  const overlap = a.filter(item => bSet.has(item)).length
  return overlap / Math.max(a.length, b.length)
}

function normalizeJobType(value) {
  return normalizeComparable(value)
}

function normalizeWorkModel(value) {
  return normalizeComparable(value)
}

function summarizeLocation(value) {
  const location = normalizeComparable(value)
  if (!location) return ''
  if (location.includes('bahrain')) return 'bahrain'
  return location
}

function computeSalaryAlignment(job, seekerProfile) {
  const jobMin = Number(job?.salary_min || 0)
  const jobMax = Number(job?.salary_max || jobMin || 0)
  const expectedMin = Number(seekerProfile?.salary_expectation_min || 0)
  const expectedMax = Number(seekerProfile?.salary_expectation_max || 0)

  if (!jobMin && !jobMax) return { score: 2, reason: 'Salary not listed yet' }
  if (!expectedMin && !expectedMax) return { score: 4, reason: 'Compensation range available' }

  const rangeMin = jobMin || jobMax
  const rangeMax = jobMax || jobMin
  const candidateMin = expectedMin || expectedMax
  const candidateMax = expectedMax || expectedMin || candidateMin

  const overlaps = rangeMax >= candidateMin && rangeMin <= candidateMax
  if (overlaps) return { score: 10, reason: 'Salary range aligns with your expectation' }
  if (rangeMax >= candidateMin * 0.9) return { score: 5, reason: 'Salary is close to your target range' }
  return { score: 0, reason: 'Salary is below your target range' }
}

function computeExperienceAlignment(job, seekerProfile) {
  const required = Number(job?.experience_min || 0)
  const actual = Number(seekerProfile?.experience_years || 0)

  if (!required) return { score: 4, reason: 'Role is open to a broad experience range' }
  if (actual >= required) return { score: 10, reason: 'Your experience meets the role requirement' }
  if (actual + 1 >= required) return { score: 5, reason: 'You are close to the experience target' }
  return { score: 0, reason: 'Experience requirement is above your current profile' }
}

function computeRecencyScore(job) {
  const createdAt = job?.created_at ? new Date(job.created_at).getTime() : 0
  if (!createdAt) return 0
  const ageDays = (Date.now() - createdAt) / (1000 * 60 * 60 * 24)
  if (ageDays <= 7) return 4
  if (ageDays <= 21) return 2
  return 0
}

export function scoreJobForSeeker(job, context = {}) {
  const { profile, seekerProfile, appliedJobIds = [], savedJobIds = [] } = context

  const profileSkills = normalizeSkills(profile?.skills).map(normalizeComparable)
  const requiredSkills = normalizeSkills(job?.skills_required).map(normalizeComparable)
  const jobText = normalizeComparable([
    job?.title,
    job?.description,
    job?.requirements,
    job?.department,
  ].filter(Boolean).join(' '))

  const textMatchedSkills = profileSkills.filter(skill => skill && jobText.includes(skill))
  const requiredSkillOverlap = requiredSkills.filter(skill => profileSkills.includes(skill))
  const uniqueMatchedSkills = Array.from(new Set([...requiredSkillOverlap, ...textMatchedSkills]))

  const titleTokens = tokenize(job?.title)
  const headlineTokens = tokenize(profile?.headline)
  const titleOverlap = overlapRatio(titleTokens, headlineTokens)

  const profileLocation = summarizeLocation(profile?.location)
  const jobLocation = summarizeLocation(job?.location)
  const locationScore = profileLocation && jobLocation
    ? (jobLocation.includes(profileLocation) || profileLocation.includes(jobLocation) ? 12 : 0)
    : (jobLocation === 'bahrain' ? 3 : 0)

  const preferredJobType = normalizeJobType(seekerProfile?.job_type_preference || profile?.job_type_preference)
  const jobType = normalizeJobType(job?.job_type || job?.type)
  const jobTypeScore = preferredJobType && jobType && preferredJobType === jobType ? 8 : 0

  const preferredWorkModel = normalizeWorkModel(seekerProfile?.work_model_preference || profile?.work_model_preference)
  const workModel = normalizeWorkModel(job?.work_model)
  const workModelScore = preferredWorkModel && workModel && preferredWorkModel === workModel ? 6 : 0

  const skillCoverage = requiredSkills.length
    ? requiredSkillOverlap.length / requiredSkills.length
    : uniqueMatchedSkills.length > 0
      ? Math.min(uniqueMatchedSkills.length / 5, 1)
      : 0
  const skillScore = Math.round(skillCoverage * 42)
  const titleScore = Math.round(Math.min(titleOverlap * 22, 16))
  const salary = computeSalaryAlignment(job, seekerProfile)
  const experience = computeExperienceAlignment(job, seekerProfile)
  const recencyScore = computeRecencyScore(job)
  const savedBonus = savedJobIds.includes(job?.id) ? 3 : 0
  const appliedPenalty = appliedJobIds.includes(job?.id) ? 45 : 0

  const rawScore = 18
    + skillScore
    + titleScore
    + locationScore
    + jobTypeScore
    + workModelScore
    + salary.score
    + experience.score
    + recencyScore
    + savedBonus
    - appliedPenalty

  const score = Math.max(0, Math.min(100, Math.round(rawScore)))

  const reasons = [
    uniqueMatchedSkills.length > 0
      ? `${uniqueMatchedSkills.length} matching skill${uniqueMatchedSkills.length > 1 ? 's' : ''}`
      : 'Profile needs stronger skill alignment',
    titleScore >= 8 ? 'Role closely matches your headline' : null,
    locationScore >= 12 ? 'Location aligns with your preference' : null,
    jobTypeScore > 0 ? 'Job type matches your preference' : null,
    workModelScore > 0 ? 'Work model matches your preference' : null,
    salary.score >= 5 ? salary.reason : null,
    experience.score >= 5 ? experience.reason : null,
    appliedPenalty > 0 ? 'Already applied to this role' : null,
  ].filter(Boolean).slice(0, 3)

  return {
    score,
    matchedSkills: uniqueMatchedSkills,
    reasons,
    breakdown: {
      skillScore,
      titleScore,
      locationScore,
      jobTypeScore,
      workModelScore,
      salaryScore: salary.score,
      experienceScore: experience.score,
      recencyScore,
      savedBonus,
      appliedPenalty,
    },
  }
}

export function getMatchTone(score) {
  if (score >= 80) return { label: 'Excellent Match', variant: 'green' }
  if (score >= 60) return { label: 'Strong Match', variant: 'blue' }
  if (score >= 40) return { label: 'Potential Match', variant: 'yellow' }
  return { label: 'Low Match', variant: 'gray' }
}

function computeCoverLetterScore(coverLetter) {
  const text = normalizeComparable(coverLetter)
  if (!text) return { score: 0, reason: 'No cover letter provided' }
  if (text.length >= 280) return { score: 10, reason: 'Detailed cover letter submitted' }
  if (text.length >= 140) return { score: 6, reason: 'Clear cover letter submitted' }
  return { score: 2, reason: 'Brief cover letter submitted' }
}

function computeCandidateLocationScore(candidateLocation, jobLocation) {
  const candidate = summarizeLocation(candidateLocation)
  const job = summarizeLocation(jobLocation)

  if (!candidate || !job) return { score: 3, reason: 'Location context is limited' }
  if (candidate.includes(job) || job.includes(candidate)) return { score: 10, reason: 'Location aligns with the role' }
  if (job === 'bahrain') return { score: 5, reason: 'Candidate is regionally relevant' }
  return { score: 0, reason: 'Location may require extra review' }
}

export function scoreApplicationForEmployer(application, jobOverride = null) {
  const candidate = application?.profiles || {}
  const job = jobOverride || application?.jobs || {}

  const candidateSkills = normalizeSkills(candidate?.skills).map(normalizeComparable)
  const requiredSkills = normalizeSkills(job?.skills_required).map(normalizeComparable)
  const candidateHeadlineTokens = tokenize(candidate?.headline)
  const jobTitleTokens = tokenize(job?.title)

  const skillMatches = requiredSkills.filter(skill => candidateSkills.includes(skill))
  const skillCoverage = requiredSkills.length
    ? skillMatches.length / requiredSkills.length
    : 0

  const skillScore = Math.round(skillCoverage * 52)
  const headlineScore = Math.round(Math.min(overlapRatio(candidateHeadlineTokens, jobTitleTokens) * 18, 18))
  const coverLetter = computeCoverLetterScore(application?.cover_letter)
  const location = computeCandidateLocationScore(candidate?.location, job?.location)
  const recencyScore = computeRecencyScore(application)

  const rawScore = 20 + skillScore + headlineScore + coverLetter.score + location.score + recencyScore
  const score = Math.max(0, Math.min(100, Math.round(rawScore)))

  const reasons = [
    skillMatches.length > 0
      ? `${skillMatches.length} required skill${skillMatches.length > 1 ? 's' : ''} matched`
      : 'Needs manual review for skill fit',
    headlineScore >= 8 ? 'Headline aligns with the role focus' : null,
    coverLetter.score >= 6 ? coverLetter.reason : null,
    location.score >= 5 ? location.reason : null,
  ].filter(Boolean).slice(0, 3)

  return {
    score,
    matchedSkills: skillMatches,
    reasons,
    breakdown: {
      skillScore,
      headlineScore,
      coverLetterScore: coverLetter.score,
      locationScore: location.score,
      recencyScore,
    },
  }
}

export function compareApplicationsForJob(applications = [], job = null) {
  const scored = applications.map(application => {
    const comparison = scoreApplicationForEmployer(application, job)
    return {
      ...application,
      comparisonScore: comparison.score,
      comparisonReasons: comparison.reasons,
      comparisonBreakdown: comparison.breakdown,
      comparisonMatchedSkills: comparison.matchedSkills,
    }
  })

  const sorted = [...scored].sort((a, b) => b.comparisonScore - a.comparisonScore)
  const averageScore = sorted.length
    ? Math.round(sorted.reduce((sum, item) => sum + item.comparisonScore, 0) / sorted.length)
    : 0

  return sorted.map((application, index) => ({
    ...application,
    comparisonRank: index + 1,
    comparisonAverage: averageScore,
    comparisonTier:
      application.comparisonScore >= 80 ? 'High alignment' :
      application.comparisonScore >= 60 ? 'Strong alignment' :
      application.comparisonScore >= 40 ? 'Moderate alignment' :
      'Needs review',
  }))
}
