import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import SafeImage from '@/components/ui/SafeImage'

describe('SafeImage', () => {
  it('does not force object-cover when imgClassName sets object-contain', () => {
    render(
      <div className="relative h-40 w-full">
        <SafeImage src="/test.jpg" alt="Test" fill imgClassName="object-contain" />
      </div>,
    )

    const img = screen.getByAltText('Test')
    expect(img.className).toContain('object-contain')
    expect(img.className).not.toMatch(/\bobject-cover\b/)
  })

  it('defaults fill images to object-cover when no object-fit class is provided', () => {
    render(
      <div className="relative h-40 w-full">
        <SafeImage src="/test.jpg" alt="Cover default" fill />
      </div>,
    )

    const img = screen.getByAltText('Cover default')
    expect(img.className).toContain('object-cover')
  })

  it('supports non-fill images with natural height', () => {
    render(
      <SafeImage
        src="/hero.jpg"
        alt="Hero"
        width={1200}
        height={630}
        imgClassName="h-auto w-full object-contain"
      />,
    )

    const img = screen.getByAltText('Hero')
    expect(img.className).toContain('object-contain')
    expect(img.className).not.toContain('absolute inset-0')
  })
})
