import Link from 'next/link'
import StaticInfoPage from '@/components/site/StaticInfoPage'

export default function NewsletterPage() {
  return (
    <StaticInfoPage
      title="Newsletter"
      intro="Get top stories and local business highlights delivered to your inbox."
    >
      <p>
        Newsletter self-service is being finalized. In the meantime, you can manage content from the admin newsletter
        tools.
      </p>
      <p>
        <Link href="/admin/newsletter">Open newsletter tools</Link>
      </p>
    </StaticInfoPage>
  )
}
