import { describe, expect, it } from 'vitest'
import { shouldShowExcerptWithSubtitle, trimArticleSubtitle } from './article-deck'

describe('article-deck', () => {
  it('trimArticleSubtitle trims whitespace', () => {
    expect(trimArticleSubtitle('  Deck line  ')).toBe('Deck line')
    expect(trimArticleSubtitle('')).toBe('')
    expect(trimArticleSubtitle(null)).toBe('')
  })

  it('shouldShowExcerptWithSubtitle hides duplicate excerpt', () => {
    expect(shouldShowExcerptWithSubtitle('Same line', 'Same line')).toBe(false)
    expect(shouldShowExcerptWithSubtitle('Deck', 'Longer standfirst text')).toBe(true)
    expect(shouldShowExcerptWithSubtitle('', 'Only excerpt')).toBe(true)
    expect(shouldShowExcerptWithSubtitle('Deck', '')).toBe(false)
  })
})
