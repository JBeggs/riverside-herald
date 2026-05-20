/**
 * Default article skeleton for new drafts (HTML only — tags must match sanitizeHtml allowlist).
 */

export const DEFAULT_ARTICLE_TITLE = 'Article headline'

export const DEFAULT_ARTICLE_EXCERPT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this summary with your own lead.'

export const DEFAULT_ARTICLE_HTML = `<p><strong>Lorem ipsum dolor sit amet</strong>, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>

<h2>Background</h2>
<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
<p>Curabitur pretium tincidunt lacus. Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet.</p>

<blockquote>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula.</blockquote>

<h2>What happens next</h2>
<p>Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Cras ultricies ligula sed magna dictum porta. Key points for readers:</p>
<ul>
<li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
<li>Proin eget tortor risus. Mauris blandit aliquet elit.</li>
<li>Nulla quis lorem ut libero malesuada feugiat.</li>
</ul>

<h3>Further reading</h3>
<p>Donec rutrum congue leo eget malesuada. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Replace all placeholder text with your reporting before publishing.</p>`

/** True when content is empty or only whitespace / empty tags */
export function isArticleContentEmpty(content: string | null | undefined): boolean {
  if (!content?.trim()) return true
  const text = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim()
  return text.length === 0
}
