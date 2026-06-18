/**
 * Writing styles and reference-link density for the Research tab.
 *
 * Mirror of django-crm/news/services/research_writing_styles.py. Keep keys in sync with the
 * backend registry so the values posted to research-start validate server-side.
 */

export type WritingStyleKey =
  | 'neighbourhood'
  | 'wire'
  | 'deep_read'
  | 'column'
  | 'explainer'
  | 'riversideherald'

export interface WritingStyleOption {
  key: WritingStyleKey
  label: string
  description: string
}

export const DEFAULT_WRITING_STYLE: WritingStyleKey = 'neighbourhood'

export const WRITING_STYLE_OPTIONS: WritingStyleOption[] = [
  {
    key: 'neighbourhood',
    label: 'Neighbourhood Report',
    description: 'Warm local paper voice. 650–900 words. Hook, what happened, why it matters locally.',
  },
  {
    key: 'wire',
    label: 'Wire Brief',
    description: 'Tight news wire, no filler. 350–550 words. Inverted pyramid lead.',
  },
  {
    key: 'deep_read',
    label: 'Deep Read',
    description: 'Narrative, scene-first journalism. 900–1,200 words. Story-led subheadings.',
  },
  {
    key: 'column',
    label: "Editor's Column",
    description: 'Opinion / commentary with a clear thesis. 500–750 words.',
  },
  {
    key: 'explainer',
    label: 'Explainer',
    description: 'Plain-language, scannable guide. 600–800 words. Best for long pasted briefs.',
  },
  {
    key: 'riversideherald',
    label: 'Riverside Herald AI Author',
    description:
      'Minimal copy-edit. Keeps your text as close to the original as possible — spelling and grammar only.',
  },
]

export type ReferenceDensityKey = 'light' | 'moderate' | 'standard' | 'full'

export interface ReferenceDensityOption {
  key: ReferenceDensityKey
  label: string
  maxSources: number | null
  description: string
}

export const DEFAULT_REFERENCE_DENSITY: ReferenceDensityKey = 'moderate'

export const REFERENCE_DENSITY_OPTIONS: ReferenceDensityOption[] = [
  { key: 'light', label: 'Light', maxSources: 3, description: 'Up to 3 sources' },
  { key: 'moderate', label: 'Moderate', maxSources: 6, description: 'Up to 6 sources' },
  { key: 'standard', label: 'Standard', maxSources: 10, description: 'Up to 10 sources' },
  { key: 'full', label: 'Full', maxSources: null, description: 'No cap (legacy)' },
]
