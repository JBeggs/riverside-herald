import StaticInfoPage from '@/components/site/StaticInfoPage'
import { getCompany } from '@/lib/company'
import { PLATFORM_CONTACT_EMAIL } from '@/lib/platform-contact-email'

export default async function CareersPage() {
  const company = await getCompany()
  const contactEmail = company.contact.email.trim() || PLATFORM_CONTACT_EMAIL

  return (
    <StaticInfoPage
      title="Careers"
      intro={`Opportunities to work with ${company.name} contributors and product teams.`}
    >
      <p>
        We are not actively hiring through an automated portal yet. To express interest, send your profile and role
        focus to <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>
    </StaticInfoPage>
  )
}
