/** Theme-aware classes for profile / CMS dashboard pages. */

export const cmsCard = 'bg-surface border border-border-default rounded-lg shadow-card'
export const cmsCardPad = `${cmsCard} p-4 sm:p-6`
export const cmsPageTitle = 'text-2xl sm:text-3xl font-playfair font-semibold text-text'
export const cmsPageSubtitle = 'text-sm sm:text-base text-text-muted mt-1'
export const cmsSectionTitle = 'text-lg sm:text-xl font-playfair font-semibold text-text'
export const cmsInput =
  'w-full border border-border-default rounded-lg bg-[rgb(var(--color-surface))] text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-ring))]'
export const cmsInputWithIcon = `${cmsInput} pl-10 pr-4 py-2 min-h-[44px]`
export const cmsSelect = `${cmsInput} px-4 py-2 min-h-[44px]`
export const cmsTabActive = 'border-primary text-primary'
export const cmsTabInactive =
  'border-transparent text-text-muted hover:text-text hover:border-border-default'
export const cmsRaisedPanel = 'bg-[rgb(var(--color-surface-raised)/0.5)] border border-border-default rounded-lg'
export const cmsInfoBanner =
  'rounded-lg border border-border-default bg-[rgb(var(--color-surface-raised)/0.6)] p-4'

export const cmsLabel = 'block text-sm font-medium text-text mb-2'
export const cmsField =
  'w-full px-4 py-3 min-h-[44px] border border-border-default rounded-lg bg-[rgb(var(--color-surface))] text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-ring))]'
export const cmsFieldSm =
  'w-full px-3 py-2 min-h-[44px] border border-border-default rounded-md bg-[rgb(var(--color-surface))] text-text focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-ring))]'
export const cmsTextarea = `${cmsField} resize-y`
export const cmsEditorShell = 'w-full flex flex-col bg-surface text-text font-body'
export const cmsEditorBar =
  'px-3 sm:px-6 py-3 sm:py-4 border-b border-border-default bg-[rgb(var(--color-surface-raised)/0.5)] sticky z-20 shadow-sm'
export const cmsEditorFooter =
  'px-4 sm:px-6 py-4 sm:py-6 border-t border-border-default bg-[rgb(var(--color-surface-raised)/0.5)] z-20 shrink-0 max-md:pb-[max(1.25rem,env(safe-area-inset-bottom))]'
export const cmsStepBtnActive =
  'bg-primary text-[rgb(var(--color-on-accent))] shadow-md ring-2 ring-primary/25'
export const cmsStepBtnDone =
  'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200 border border-green-200 dark:border-green-900 hover:bg-green-200 dark:hover:bg-green-950/55'
export const cmsStepBtnIdle =
  'bg-surface text-text-muted hover:bg-[rgb(var(--color-surface-raised)/0.5)] border border-border-default'
export const cmsIconBtn =
  'p-2.5 rounded-lg bg-surface text-text-muted hover:bg-[rgb(var(--color-surface-raised)/0.5)] disabled:opacity-50 disabled:cursor-not-allowed border border-border-default shadow-sm min-w-[44px] min-h-[44px] flex items-center justify-center'
export const cmsDashedZone =
  'border-2 border-dashed border-border-default rounded-lg bg-[rgb(var(--color-surface-raised)/0.35)]'
export const cmsPanel =
  'rounded-lg border border-border-default p-4 bg-[rgb(var(--color-surface-raised)/0.35)]'
export const cmsModal = 'bg-surface rounded-xl shadow-card border border-border-default w-full max-w-md'
export const cmsWarningBanner =
  'rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-900 dark:text-amber-200'
export const cmsTagSelected =
  'inline-flex items-center px-3 py-1 bg-primary/15 text-primary text-sm font-medium rounded-full hover:bg-primary/25 transition-colors'
