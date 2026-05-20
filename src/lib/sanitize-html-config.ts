/** Shared DOMPurify options for article HTML (client + server). */
export const SANITIZE_HTML_OPTIONS = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote'],
  ALLOWED_ATTR: [] as string[],
  FORBID_TAGS: ['script', 'object', 'embed', 'base', 'link'],
}
