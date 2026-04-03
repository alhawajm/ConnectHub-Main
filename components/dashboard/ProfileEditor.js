'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, Avatar, useToast } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/utils'

/**
 * ProfileEditor — shared profile editing UI for all 3 user roles
 *
 * Props:
 *   profile      — base profiles row
 *   roleProfile  — role-specific row (employer_profiles / seeker_profiles / freelancer_profiles)
 *   onSaved      — callback after successful save
 */
export default function ProfileEditor({ profile, roleProfile, onSaved }) {
  const supabase = createClient()
  const toast    = useToast()
  const [saving, setSaving] = useState(false)

  // Base profile fields
  const [fullName,    setFullName]    = useState(profile?.full_name    || '')
  const [headline,    setHeadline]    = useState(profile?.headline     || '')
  const [bio,         setBio]         = useState(profile?.bio          || '')
  const [location,    setLocation]    = useState(profile?.location     || 'Bahrain')
  const [phone,       setPhone]       = useState(profile?.phone        || '')
  const [website,     setWebsite]     = useState(profile?.website      || '')
  const [linkedin,    setLinkedin]    = useState(profile?.linkedin_url || '')
  const [skillsRaw,   setSkillsRaw]   = useState((profile?.skills || []).join(', '))

  // Employer-specific
  const [companyName, setCompanyName] = useState(roleProfile?.company_name  || '')
  const [industry,    setIndustry]    = useState(roleProfile?.industry       || '')
  const [companySize, setCompanySize] = useState(roleProfile?.company_size   || '')

  // Seeker-specific
  const [experience,  setExperience]  = useState(roleProfile?.experience_years || 0)
  const [education,   setEducation]   = useState(roleProfile?.education        || '')
  const [salaryMin,   setSalaryMin]   = useState(roleProfile?.salary_expectation_min || '')
  const [salaryMax,   setSalaryMax]   = useState(roleProfile?.salary_expectation_max || '')
  const [availability,setAvailability]= useState(roleProfile?.availability     || 'available')

  // Freelancer-specific
  const [hourlyRate,  setHourlyRate]  = useState(roleProfile?.hourly_rate    || '')
  const [categories,  setCategories]  = useState((roleProfile?.categories || []).join(', '))

  const role = profile?.role

  const handleSave = async () => {
    setSaving(true)
    try {
      const skills = skillsRaw.split(',').map(s => s.trim()).filter(Boolean)

      // 1. Update base profile
      const { error: profErr } = await supabase
        .from('profiles')
        .update({
          full_name:    fullName,
          headline,
          bio,
          location,
          phone,
          website,
          linkedin_url: linkedin,
          skills,
        })
        .eq('id', profile.id)

      if (profErr) throw profErr

      // 2. Update role-specific profile
      if (role === 'employer') {
        await supabase.from('employer_profiles').update({
          company_name: companyName,
          industry,
          company_size: companySize,
        }).eq('id', profile.id)

      } else if (role === 'seeker') {
        await supabase.from('seeker_profiles').update({
          experience_years:         parseInt(experience) || 0,
          education,
          availability,
          salary_expectation_min:   salaryMin ? parseInt(salaryMin) : null,
          salary_expectation_max:   salaryMax ? parseInt(salaryMax) : null,
        }).eq('id', profile.id)

      } else if (role === 'freelancer') {
        await supabase.from('freelancer_profiles').update({
          hourly_rate:  hourlyRate ? parseFloat(hourlyRate) : null,
          categories:   categories.split(',').map(s => s.trim()).filter(Boolean),
        }).eq('id', profile.id)
      }

      toast.success('Profile saved ✓')
      onSaved?.()
    } catch (err) {
      toast.error(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  // Profile completion score
  const fields = [fullName, headline, bio, location, phone, skillsRaw]
  const filled  = fields.filter(f => f?.trim().length > 0).length
  const score   = Math.round((filled / fields.length) * 100)

  return (
    <div className="max-w-2xl flex flex-col gap-5">

      {/* Completion banner */}
      <Card padding="md" className={cn(
        'border-2',
        score === 100 ? 'border-green-200 dark:border-green-800' : 'border-brand-200 dark:border-brand-800'
      )}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Profile {score === 100 ? 'complete! 🎉' : `${score}% complete`}
          </p>
          <span className="text-xs text-gray-400">{filled}/{fields.length} fields</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', score === 100 ? 'bg-green-500' : 'bg-brand-500')}
            style={{ width: `${score}%` }}
          />
        </div>
        {score < 100 && (
          <p className="text-xs text-gray-400 mt-1.5">
            Complete profiles get 3× more employer views
          </p>
        )}
      </Card>

      {/* Avatar + name header */}
      <Card padding="md">
        <div className="flex items-center gap-4 mb-5">
          <Avatar name={fullName || profile?.full_name} size="xl" />
          <div>
            <p className="font-display font-bold text-gray-900 dark:text-white">
              {fullName || 'Your Name'}
            </p>
            <p className="text-sm text-gray-400">{headline || 'Your headline'}</p>
            {/* Avatar upload placeholder */}
            <button className="text-xs text-brand-500 font-semibold mt-1 hover:text-brand-600">
              Change photo →
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Input label="Full Name *"  value={fullName}  onChange={e => setFullName(e.target.value)}  placeholder="Yusuf Al-Ahmed" />
          <Input label="Headline"     value={headline}  onChange={e => setHeadline(e.target.value)}  placeholder="Senior React Developer · 5 years experience" />
          <Input label="Bio"          as="textarea" rows={4} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell employers and clients about yourself…" />
        </div>
      </Card>

      {/* Contact info */}
      <Card padding="md">
        <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white mb-4">Contact & Links</h3>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Location" value={location} onChange={e => setLocation(e.target.value)} placeholder="Manama, Bahrain" />
            <Input label="Phone"    value={phone}    onChange={e => setPhone(e.target.value)}    placeholder="+973 3xxx xxxx" />
          </div>
          <Input label="Website"  value={website}  onChange={e => setWebsite(e.target.value)}  placeholder="https://yoursite.com" />
          <Input label="LinkedIn" value={linkedin}  onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourname" />
        </div>
      </Card>

      {/* Skills */}
      <Card padding="md">
        <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white mb-1">Skills</h3>
        <p className="text-xs text-gray-400 mb-3">Separate with commas — used for AI matching</p>
        <Input
          value={skillsRaw}
          onChange={e => setSkillsRaw(e.target.value)}
          placeholder="React, TypeScript, Node.js, Figma, Python…"
          helper={`${skillsRaw.split(',').filter(s => s.trim()).length} skills added`}
        />
        {/* Skill chips preview */}
        {skillsRaw && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {skillsRaw.split(',').filter(s => s.trim()).map(s => (
              <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                {s.trim()}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* ── Employer-specific ── */}
      {role === 'employer' && (
        <Card padding="md">
          <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white mb-4">Company Details</h3>
          <div className="flex flex-col gap-4">
            <Input label="Company Name *" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="TechMark Ltd." />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Industry" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Information Technology" />
              <Input label="Company Size" as="select" value={companySize} onChange={e => setCompanySize(e.target.value)}>
                <option value="">Select size</option>
                <option value="1-10">1–10 employees</option>
                <option value="11-50">11–50 employees</option>
                <option value="51-200">51–200 employees</option>
                <option value="200+">200+ employees</option>
              </Input>
            </div>
          </div>
        </Card>
      )}

      {/* ── Seeker-specific ── */}
      {role === 'seeker' && (
        <Card padding="md">
          <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white mb-4">Career Details</h3>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Years of Experience" type="number" value={experience} onChange={e => setExperience(e.target.value)} placeholder="3" />
              <Input label="Availability" as="select" value={availability} onChange={e => setAvailability(e.target.value)}>
                <option value="available">Available now</option>
                <option value="open">Open to offers</option>
                <option value="not_looking">Not looking</option>
              </Input>
            </div>
            <Input label="Education" value={education} onChange={e => setEducation(e.target.value)} placeholder="BSc Computer Science — University of Bahrain" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Min Salary Expectation" type="number" prefix="BD" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="1,500" />
              <Input label="Max Salary Expectation" type="number" prefix="BD" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} placeholder="2,500" />
            </div>
          </div>
        </Card>
      )}

      {/* ── Freelancer-specific ── */}
      {role === 'freelancer' && (
        <Card padding="md">
          <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white mb-4">Freelancer Details</h3>
          <div className="flex flex-col gap-4">
            <Input label="Hourly Rate" type="number" prefix="BD" suffix="/hr" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="15" />
            <Input
              label="Service Categories (comma-separated)"
              value={categories}
              onChange={e => setCategories(e.target.value)}
              placeholder="Web Development, UI/UX Design, Graphic Design"
            />
          </div>
        </Card>
      )}

      {/* Save button */}
      <div className="flex gap-3 pb-4">
        <Button onClick={handleSave} loading={saving} size="lg">
          💾 Save Changes
        </Button>
        <Button variant="ghost" size="lg" onClick={() => window.location.reload()}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
