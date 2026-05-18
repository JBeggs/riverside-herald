import StaticInfoPage from '@/components/site/StaticInfoPage'

export default function SubmitStoryPage() {
  return (
    <StaticInfoPage
      title="Submit a Story"
      intro="Share local story tips and community updates with the editorial team."
    >
      <p>
        Send your story idea, location, and any supporting links or media to{' '}
        <a href="mailto:admin@riversideherald.co.za">admin@riversideherald.co.za</a>.
      </p>
      <p>
        Please include contact details so the team can follow up if clarification is needed.
      </p>
    </StaticInfoPage>
  )
}
