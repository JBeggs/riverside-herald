import Link from 'next/link'

type StaticInfoPageProps = {
  title: string
  intro: string
  children: React.ReactNode
}

export default function StaticInfoPage({ title, intro, children }: StaticInfoPageProps) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <section className="border-b border-border-default bg-[rgb(var(--color-surface-raised)/0.35)]">
        <div className="container-narrow py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-text">{title}</h1>
          <p className="mt-4 text-base md:text-lg text-text-muted">{intro}</p>
        </div>
      </section>
      <section className="container-narrow py-10 md:py-12">
        <div className="prose max-w-none text-text-muted">{children}</div>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-[rgb(var(--color-on-accent))] hover:opacity-90 transition-opacity"
          >
            Back to home
          </Link>
        </div>
      </section>
    </div>
  )
}
