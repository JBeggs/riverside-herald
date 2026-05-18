import StaticInfoPage from '@/components/site/StaticInfoPage'

export default function TermsPage() {
  return (
    <StaticInfoPage
      title="Terms of Service"
      intro="The terms that govern use of Riverside Herald services and content."
    >
      <p>
        By using this platform, you agree to use it lawfully and respect content ownership, moderation rules, and
        community standards.
      </p>
      <p>
        If you need clarification, contact <a href="mailto:admin@riversideherald.co.za">admin@riversideherald.co.za</a>.
      </p>
    </StaticInfoPage>
  )
}
