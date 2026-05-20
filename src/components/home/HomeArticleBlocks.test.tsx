import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HomeGridArticleBlock } from './HomeArticleBlocks'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/components/ui/SafeImage', () => ({
  default: () => null,
}))

describe('HomeGridArticleBlock', () => {
  const base = {
    id: '1',
    title: 'Headline',
    slug: 'headline',
    excerpt: 'Standfirst body text',
    published_at: '2026-05-01T12:00:00Z',
    author_name: 'Writer',
  }

  it('renders subtitle on latest-news style cards', () => {
    render(
      <HomeGridArticleBlock
        article={{ ...base, subtitle: 'Deck under the headline' }}
        imageUrl={null}
        locale="en-ZA"
      />
    )
    expect(screen.getByTestId('article-card-subtitle')).toHaveTextContent('Deck under the headline')
  })

  it('does not duplicate excerpt when it matches subtitle', () => {
    render(
      <HomeGridArticleBlock
        article={{ ...base, subtitle: 'Same line', excerpt: 'Same line' }}
        imageUrl={null}
        locale="en-ZA"
      />
    )
    expect(screen.getByTestId('article-card-subtitle')).toHaveTextContent('Same line')
    expect(screen.getAllByText('Same line')).toHaveLength(1)
  })
})
