import StaticInfoPage from '@/components/site/StaticInfoPage'
import { getCompany } from '@/lib/company'

export default async function AdvertisePage() {
  const company = await getCompany()
  const contactEmail = company.contact.email.trim() || 'admin@riversideherald.co.za'

  return (
    <StaticInfoPage
      title="Advertise With Us"
      intro={`Promote your business to local readers through ${company.name} placements.`}
    >
      <p>
        To request advertising options, please email <a href={`mailto:${contactEmail}`}>{contactEmail}</a>{' '}
        with your business name, campaign goal, and preferred dates.
      </p>
    </StaticInfoPage>
  )
}
