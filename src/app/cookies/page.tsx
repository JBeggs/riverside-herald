import StaticInfoPage from '@/components/site/StaticInfoPage'
import { getCompany } from '@/lib/company'

export default async function CookiesPage() {
  const company = await getCompany()

  return (
    <StaticInfoPage
      title="Cookie Policy"
      intro="How cookies are used for authentication, preferences, and site performance."
    >
      <p>
        {company.name} uses essential cookies for secure login and session continuity, plus preference cookies such
        as theme selection.
      </p>
      <p>
        You can clear cookies in your browser at any time, but some features may require you to sign in again.
      </p>
    </StaticInfoPage>
  )
}
