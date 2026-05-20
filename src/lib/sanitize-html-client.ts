/**
 * Browser-safe HTML sanitization for client components (no jsdom).
 */
import DOMPurify from 'dompurify'
import { SANITIZE_HTML_OPTIONS } from './sanitize-html-config'

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_HTML_OPTIONS)
}
