import StaticInfoPage from '@/components/site/StaticInfoPage'

export default function PrivacyPage() {
  return (
    <StaticInfoPage
      title="Privacy Policy"
      intro="How Riverside Herald collects, uses, and protects your information."
    >
      <p>
        We only collect data needed to run accounts, publish content, and improve platform reliability. We do not sell
        personal data.
      </p>
      <p>
        For data requests or removal enquiries, contact <a href="mailto:admin@riversideherald.co.za">admin@riversideherald.co.za</a>.
      </p>
    </StaticInfoPage>
  )
}
