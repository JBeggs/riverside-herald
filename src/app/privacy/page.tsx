import StaticInfoPage from '@/components/site/StaticInfoPage'
import { getCompany } from '@/lib/company'

export default async function PrivacyPage() {
  const company = await getCompany()
  const contactEmail = company.contact.email.trim() || 'admin@riversideherald.co.za'

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
