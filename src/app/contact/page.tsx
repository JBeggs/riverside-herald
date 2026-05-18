import StaticInfoPage from '@/components/site/StaticInfoPage'

export default function ContactPage() {
  return (
    <StaticInfoPage
      title="Contact"
      intro="Reach the Riverside Herald team for news tips, corrections, partnerships, or support."
    >
      <p>
        For general enquiries, please email <a href="mailto:admin@riversideherald.co.za">admin@riversideherald.co.za</a>.
      </p>
      <p>
        If your request is urgent, include a short subject line so the team can route it quickly.
      </p>
    </StaticInfoPage>
  )
}
