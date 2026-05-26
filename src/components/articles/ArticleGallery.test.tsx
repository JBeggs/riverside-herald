import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { ArticleGallery } from './ArticleGallery'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/components/ui/SafeImage', () => ({
  default: ({ alt }: { alt?: string }) => <img alt={alt || ''} data-testid="safe-image" />,
}))

vi.mock('@/lib/image-utils', () => ({
  getAbsoluteImageUrl: (url: string) => `https://cdn.example${url}`,
}))

describe('ArticleGallery', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('returns null when items are empty', () => {
    const { container } = render(<ArticleGallery items={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders featured single-image layout without Gallery heading', () => {
    render(
      <ArticleGallery
        items={[
          {
            id: '1',
            caption: 'A lone photo',
            media: {
              id: 'm1',
              file_url: '/media/one.jpg',
              thumbnail_url: '/media/one-thumb.jpg',
              alt_text: 'Single shot',
            },
          },
        ]}
      />,
    )

    expect(screen.queryByRole('heading', { name: 'Gallery' })).not.toBeInTheDocument()
    expect(screen.getByText('A lone photo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /View full size/i })).toBeInTheDocument()
  })

  it('renders multi-image grid with Gallery heading', () => {
    render(
      <ArticleGallery
        items={[
          {
            id: '1',
            media: { id: 'm1', file_url: '/media/a.jpg', alt_text: 'A' },
          },
          {
            id: '2',
            media: { id: 'm2', file_url: '/media/b.jpg', alt_text: 'B' },
          },
        ]}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Gallery' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Open image/i })).toHaveLength(2)
  })

  it('opens lightbox at clicked index for multi-image gallery', () => {
    render(
      <ArticleGallery
        items={[
          {
            id: '1',
            caption: 'First',
            media: { id: 'm1', file_url: '/media/a.jpg', alt_text: 'A' },
          },
          {
            id: '2',
            caption: 'Second',
            media: { id: 'm2', file_url: '/media/b.jpg', alt_text: 'B' },
          },
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Open image: Second/i }))

    const dialog = screen.getByRole('dialog', { name: 'Gallery image viewer' })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText('2 / 2')).toBeInTheDocument()
    expect(within(dialog).getByText('Second')).toBeInTheDocument()
  })

  it('opens lightbox from single featured image', () => {
    render(
      <ArticleGallery
        items={[
          {
            id: '1',
            caption: 'Featured caption',
            media: { id: 'm1', file_url: '/media/one.jpg', alt_text: 'One' },
          },
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /View full size/i }))

    const dialog = screen.getByRole('dialog', { name: 'Gallery image viewer' })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText('Featured caption')).toBeInTheDocument()
    expect(within(dialog).queryByText(/\d+ \/ \d+/)).not.toBeInTheDocument()
  })

  it('closes lightbox on Escape', () => {
    render(
      <ArticleGallery
        items={[
          {
            id: '1',
            media: { id: 'm1', file_url: '/media/a.jpg', alt_text: 'A' },
          },
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /View full size/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
