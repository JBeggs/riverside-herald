import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ArticleReactions } from './ArticleReactions'

const reactMock = vi.fn()

vi.mock('@/lib/api', () => ({
  newsApi: {
    articles: {
      react: (...args: unknown[]) => reactMock(...args),
    },
  },
}))

const VOTER_ID = 'test-voter-uuid'

describe('ArticleReactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    window.localStorage.setItem('rsh_article_voter_id', VOTER_ID)
    reactMock.mockResolvedValue({
      likes: 1,
      dislikes: 0,
      user_reaction: 'like',
    })
  })

  it('renders like and dislike counts', () => {
    render(<ArticleReactions articleId="article-1" initialLikes={3} initialDislikes={1} />)

    expect(screen.getByRole('button', { name: /Like article \(3\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Dislike article \(1\)/i })).toBeInTheDocument()
  })

  it('sends voter_id and reaction to API on like', async () => {
    render(<ArticleReactions articleId="article-1" initialLikes={0} initialDislikes={0} />)

    fireEvent.click(screen.getByRole('button', { name: 'Like article (0)' }))

    await waitFor(() => {
      expect(reactMock).toHaveBeenCalledWith('article-1', {
        voter_id: VOTER_ID,
        reaction: 'like',
      })
    })

    expect(screen.getByRole('button', { name: /Like article \(1\)/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('toggles like off when clicked again', async () => {
    window.localStorage.setItem(
      'rsh_article_reactions',
      JSON.stringify({ 'article-1': 'like' }),
    )
    reactMock.mockResolvedValue({
      likes: 0,
      dislikes: 0,
      user_reaction: null,
    })

    render(<ArticleReactions articleId="article-1" initialLikes={1} initialDislikes={0} />)

    fireEvent.click(screen.getByRole('button', { name: 'Like article (1)' }))

    await waitFor(() => {
      expect(reactMock).toHaveBeenCalledWith('article-1', {
        voter_id: VOTER_ID,
        reaction: null,
      })
    })
  })

  it('switches from like to dislike', async () => {
    window.localStorage.setItem(
      'rsh_article_reactions',
      JSON.stringify({ 'article-1': 'like' }),
    )
    reactMock.mockResolvedValue({
      likes: 0,
      dislikes: 1,
      user_reaction: 'dislike',
    })

    render(<ArticleReactions articleId="article-1" initialLikes={1} initialDislikes={0} />)

    fireEvent.click(screen.getByRole('button', { name: 'Dislike article (0)' }))

    await waitFor(() => {
      expect(reactMock).toHaveBeenCalledWith('article-1', {
        voter_id: VOTER_ID,
        reaction: 'dislike',
      })
    })
  })
})
