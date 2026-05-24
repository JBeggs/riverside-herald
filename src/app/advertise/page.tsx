import StaticInfoPage from '@/components/site/StaticInfoPage'
import { getCompany } from '@/lib/company'
import { PLATFORM_CONTACT_EMAIL } from '@/lib/platform-contact-email'

export default async function AdvertisePage() {
  const company = await getCompany()
  const contactEmail = company.contact.email.trim() || PLATFORM_CONTACT_EMAIL

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
