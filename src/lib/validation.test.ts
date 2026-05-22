/**
 * Unit tests for validation helpers
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeHtml,
  sanitizeText,
  validateFileUpload,
  checkRateLimit,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  articleSchema,
  businessSchema,
  profileUpdateSchema,
} from './validation';

describe('validation', () => {
  describe('sanitizeText', () => {
    it('removes angle brackets', () => {
      expect(sanitizeText('<script>alert(1)</script>')).not.toContain('<');
      expect(sanitizeText('<script>alert(1)</script>')).not.toContain('>');
    });

    it('removes javascript: protocol', () => {
      expect(sanitizeText('javascript:alert(1)')).not.toContain('javascript:');
    });

    it('removes event handlers', () => {
      expect(sanitizeText('onclick=evil()')).not.toContain('onclick=');
    });

    it('trims whitespace', () => {
      expect(sanitizeText('  hello  ')).toBe('hello');
    });
  });

  describe('sanitizeHtml', () => {
    it('allows safe tags', () => {
      const html = '<p>Hello <strong>world</strong></p>';
      expect(sanitizeHtml(html)).toContain('Hello');
      expect(sanitizeHtml(html)).toContain('world');
    });

    it('preserves reference links in lists', () => {
      const html =
        '<ul><li><a href="https://example.com/report" rel="noopener noreferrer" target="_blank">Example report</a></li></ul>';
      const cleaned = sanitizeHtml(html);
      expect(cleaned).toContain('href="https://example.com/report"');
      expect(cleaned).toContain('Example report');
    });

    it('strips javascript hrefs from links', () => {
      const html = '<p><a href="javascript:alert(1)">bad</a></p>';
      const cleaned = sanitizeHtml(html);
      expect(cleaned).not.toContain('javascript:');
    });

    it('strips script tags', () => {
      const html = '<p>Safe</p><script>alert(1)</script>';
      expect(sanitizeHtml(html)).not.toContain('script');
    });
  });

  describe('validateFileUpload', () => {
    it('rejects disallowed file types', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      const result = validateFileUpload(file, ALLOWED_IMAGE_TYPES);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('accepts allowed image types', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const result = validateFileUpload(file, ALLOWED_IMAGE_TYPES);
      expect(result.valid).toBe(true);
    });

    it('rejects files exceeding max size', () => {
      const largeFile = new File([new ArrayBuffer(MAX_FILE_SIZE + 1)], 'large.jpg', {
        type: 'image/jpeg',
      });
      const result = validateFileUpload(largeFile, ALLOWED_IMAGE_TYPES);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File size');
    });
  });

  describe('checkRateLimit', () => {
    beforeEach(() => {
      // Rate limit store is module-level; we use unique identifiers per test
    });

    it('allows first request', () => {
      expect(checkRateLimit('rate-test-1', 2, 60000)).toBe(true);
    });

    it('allows requests within limit', () => {
      const id = 'rate-test-2';
      expect(checkRateLimit(id, 3, 60000)).toBe(true);
      expect(checkRateLimit(id, 3, 60000)).toBe(true);
      expect(checkRateLimit(id, 3, 60000)).toBe(true);
    });

    it('rejects when over limit', () => {
      const id = 'rate-test-3';
      checkRateLimit(id, 2, 60000);
      checkRateLimit(id, 2, 60000);
      expect(checkRateLimit(id, 2, 60000)).toBe(false);
    });
  });

  describe('articleSchema', () => {
    it('validates valid article', () => {
      const result = articleSchema.safeParse({
        title: 'Test Article',
        slug: 'test-article',
        content: '<p>Content</p>',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty title', () => {
      const result = articleSchema.safeParse({
        title: '',
        slug: 'test',
        content: '<p>Content</p>',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid slug format', () => {
      const result = articleSchema.safeParse({
        title: 'Test',
        slug: 'Invalid Slug!',
        content: '<p>Content</p>',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('businessSchema', () => {
    it('validates valid business', () => {
      const result = businessSchema.safeParse({
        name: 'Test Business',
        description: 'A test business',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const result = businessSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
    });

    it('accepts valid email', () => {
      const result = businessSchema.safeParse({
        name: 'Test',
        email: 'test@example.com',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('profileUpdateSchema', () => {
    it('validates valid profile', () => {
      const result = profileUpdateSchema.safeParse({
        first_name: 'John',
        last_name: 'Doe',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty first name', () => {
      const result = profileUpdateSchema.safeParse({
        first_name: '',
        last_name: 'Doe',
      });
      expect(result.success).toBe(false);
    });
  });
});
