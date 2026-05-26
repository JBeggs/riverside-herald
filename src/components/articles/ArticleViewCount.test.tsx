import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ArticleViewCount } from './ArticleViewCount'

const incrementViewsMock = vi.fn()

vi.mock('@/lib/api', () => ({
  newsApi: {
    articles: {
      incrementViews: (...args: unknown[]) => incrementViewsMock(...args),
    },
  },
}))

const VOTER_ID = 'test-voter-uuid'

describe('ArticleViewCount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    window.localStorage.setItem('rsh_article_voter_id', VOTER_ID)
    incrementViewsMock.mockResolvedValue({ views: 11, counted: true })
  })

  it('records a view on first visit', async () => {
    render(<ArticleViewCount articleId="article-1" initialViews={10} />)

    await waitFor(() => {
      expect(incrementViewsMock).toHaveBeenCalledWith('article-1', {
        voter_id: VOTER_ID,
      })
    })

    expect(screen.getByText('11 views')).toBeInTheDocument()
    expect(window.localStorage.getItem('rsh_article_views')).toContain('article-1')
  })

  it('does not call API again after article was viewed', async () => {
    window.localStorage.setItem('rsh_article_views', JSON.stringify({ 'article-1': true }))

    render(<ArticleViewCount articleId="article-1" initialViews={10} />)

    await waitFor(() => {
      expect(incrementViewsMock).not.toHaveBeenCalled()
    })

    expect(screen.getByText('10 views')).toBeInTheDocument()
  })
})
