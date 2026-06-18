import { describe, expect, it } from 'vitest'
import {
  WRITING_STYLE_OPTIONS,
  REFERENCE_DENSITY_OPTIONS,
  DEFAULT_WRITING_STYLE,
  DEFAULT_REFERENCE_DENSITY,
} from './research-writing-styles'

describe('research-writing-styles', () => {
  it('exposes the six writing styles with neighbourhood default', () => {
    expect(DEFAULT_WRITING_STYLE).toBe('neighbourhood')
    expect(WRITING_STYLE_OPTIONS.map((o) => o.key)).toEqual([
      'neighbourhood',
      'wire',
      'deep_read',
      'column',
      'explainer',
      'riversideherald',
    ])
    expect(WRITING_STYLE_OPTIONS.find((o) => o.key === DEFAULT_WRITING_STYLE)).toBeDefined()
    for (const opt of WRITING_STYLE_OPTIONS) {
      expect(opt.label.length).toBeGreaterThan(0)
      expect(opt.description.length).toBeGreaterThan(0)
    }
  })

  it('exposes reference density caps with moderate default', () => {
    expect(DEFAULT_REFERENCE_DENSITY).toBe('moderate')
    const caps = Object.fromEntries(
      REFERENCE_DENSITY_OPTIONS.map((o) => [o.key, o.maxSources])
    )
    expect(caps).toEqual({ light: 3, moderate: 6, standard: 10, full: null })
    expect(
      REFERENCE_DENSITY_OPTIONS.find((o) => o.key === DEFAULT_REFERENCE_DENSITY)
    ).toBeDefined()
  })
})
