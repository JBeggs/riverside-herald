import StaticInfoPage from '@/components/site/StaticInfoPage'
import { getCompany } from '@/lib/company'
import { PLATFORM_CONTACT_EMAIL } from '@/lib/platform-contact-email'

export default async function TermsPage() {
  const company = await getCompany()
  const contactEmail = company.contact.email.trim() || PLATFORM_CONTACT_EMAIL

  return (
    <StaticInfoPage
      title="Terms of Service"
      intro={`The terms that govern use of ${company.name} services and content.`}
    >
      <p>
        By using this platform, you agree to use it lawfully and respect content ownership, moderation rules, and
        community standards.
      </p>
      <p>
        If you need clarification, contact <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>
    </StaticInfoPage>
  )
}
