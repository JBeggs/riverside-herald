import StaticInfoPage from '@/components/site/StaticInfoPage'
import { getCompany } from '@/lib/company'
import { PLATFORM_CONTACT_EMAIL } from '@/lib/platform-contact-email'

export default async function PrivacyPage() {
  const company = await getCompany()
  const contactEmail = company.contact.email.trim() || PLATFORM_CONTACT_EMAIL

  return (
    <StaticInfoPage
      title="Privacy Policy"
      intro={`How ${company.name} collects, uses, and protects your information.`}
    >
      <p>
        We only collect data needed to run accounts, publish content, and improve platform reliability. We do not sell
        personal data.
      </p>
      <p>
        For data requests or removal enquiries, contact{' '}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>
    </StaticInfoPage>
  )
}
