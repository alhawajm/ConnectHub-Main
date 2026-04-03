import PublicHeader from '@/components/marketing/PublicHeader'
import PublicFooter from '@/components/marketing/PublicFooter'
import {
  AudienceSection,
  ContactSection,
  FeaturesSection,
  HeroSection,
  PricingSection,
  ServicesSection,
  TestimonialsSection,
} from '@/components/marketing/HomeSections'

export default function HomePage() {
  return (
    <div className="page-wrapper">
      <PublicHeader />

      <main>
        <HeroSection />
        <FeaturesSection />
        <AudienceSection />
        <ServicesSection />
        <PricingSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <PublicFooter />
    </div>
  )
}
