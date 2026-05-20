import { describe, it, expect } from 'vitest'
import {
  DEFAULT_ARTICLE_HTML,
  DEFAULT_ARTICLE_EXCERPT,
  DEFAULT_ARTICLE_TITLE,
  isArticleContentEmpty,
} from './article-default-content'
import { sanitizeHtml } from './validation'

describe('article-default-content', () => {
  it('provides non-empty default HTML with expected structure', () => {
    expect(DEFAULT_ARTICLE_HTML.length).toBeGreaterThan(100)
    expect(DEFAULT_ARTICLE_HTML).toContain('<h2>')
    expect(DEFAULT_ARTICLE_HTML).toContain('<blockquote>')
    expect(DEFAULT_ARTICLE_HTML).toContain('<ul>')
    expect(DEFAULT_ARTICLE_HTML).not.toContain('<script')
  })

  it('default title and excerpt are set', () => {
    expect(DEFAULT_ARTICLE_TITLE.trim().length).toBeGreaterThan(0)
    expect(DEFAULT_ARTICLE_EXCERPT.trim().length).toBeGreaterThan(0)
  })

  it('isArticleContentEmpty detects blank content', () => {
    expect(isArticleContentEmpty('')).toBe(true)
    expect(isArticleContentEmpty('   ')).toBe(true)
    expect(isArticleContentEmpty('<p></p>')).toBe(true)
    expect(isArticleContentEmpty('<p>Hello</p>')).toBe(false)
  })

  it('default HTML survives sanitizeHtml', () => {
    const cleaned = sanitizeHtml(DEFAULT_ARTICLE_HTML)
    expect(cleaned).toContain('Lorem ipsum')
    expect(cleaned).toContain('<h2>')
  })
})
