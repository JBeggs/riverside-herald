import StaticInfoPage from '@/components/site/StaticInfoPage'
import { getCompany } from '@/lib/company'

export default async function ContactPage() {
  const company = await getCompany()
  const contactEmail = company.contact.email.trim() || 'admin@riversideherald.co.za'

  return (
    <StaticInfoPage
      title="Contact"
      intro={`Reach ${company.name} for news tips, corrections, partnerships, or support.`}
    >
      <p>
        For general enquiries, please email{' '}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>
      <p>
        If your request is urgent, include a short subject line so the team can route it quickly.
      </p>
    </StaticInfoPage>
  )
}
