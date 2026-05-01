/**
 * Unit tests for image-utils
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  ARTICLE_IMAGE_PLACEHOLDER,
  getAbsoluteImageUrl,
  getArticleImageUrl,
  getBusinessImageUrl,
} from './image-utils';

describe('image-utils', () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
  });

  describe('getAbsoluteImageUrl', () => {
    it('returns empty string for null/undefined', () => {
      expect(getAbsoluteImageUrl(null)).toBe('');
      expect(getAbsoluteImageUrl(undefined)).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(getAbsoluteImageUrl('')).toBe('');
    });

    it('returns absolute URL unchanged', () => {
      const url = 'https://example.com/image.jpg';
      expect(getAbsoluteImageUrl(url)).toBe(url);
    });

    it('returns http URL unchanged', () => {
      const url = 'http://example.com/image.jpg';
      expect(getAbsoluteImageUrl(url)).toBe(url);
    });

    it('converts relative URL to absolute', () => {
      const url = 'media/uploads/image.jpg';
      expect(getAbsoluteImageUrl(url)).toBe('http://localhost:8000/media/uploads/image.jpg');
    });

    it('converts relative URL with leading slash to absolute', () => {
      const url = '/media/uploads/image.jpg';
      expect(getAbsoluteImageUrl(url)).toBe('http://localhost:8000/media/uploads/image.jpg');
    });
  });

  describe('getArticleImageUrl', () => {
    it('returns placeholder when article is undefined', () => {
      expect(getArticleImageUrl(undefined)).toBe(ARTICLE_IMAGE_PLACEHOLDER);
    });

    it('returns placeholder when featured_media is missing', () => {
      expect(getArticleImageUrl({})).toBe(ARTICLE_IMAGE_PLACEHOLDER);
    });

    it('returns placeholder when file_url is missing', () => {
      expect(getArticleImageUrl({ featured_media: {} })).toBe(ARTICLE_IMAGE_PLACEHOLDER);
    });

    it('returns absolute URL when article has featured_media.file_url', () => {
      const article = {
        featured_media: { file_url: '/media/article.jpg' },
      };
      expect(getArticleImageUrl(article)).toBe('http://localhost:8000/media/article.jpg');
    });
  });

  describe('getBusinessImageUrl', () => {
    it('returns empty string when business is undefined', () => {
      expect(getBusinessImageUrl(undefined)).toBe('');
    });

    it('returns logo URL when type is logo and logo.file_url exists', () => {
      const business = {
        logo: { file_url: '/media/logo.png' },
      };
      expect(getBusinessImageUrl(business, 'logo')).toBe('http://localhost:8000/media/logo.png');
    });

    it('returns logo_url when type is logo and logo_url exists', () => {
      const business = { logo_url: '/media/logo.png' } as any;
      expect(getBusinessImageUrl(business, 'logo')).toBe('http://localhost:8000/media/logo.png');
    });

    it('returns cover image URL when type is cover', () => {
      const business = {
        cover_image: { file_url: '/media/cover.jpg' },
      };
      expect(getBusinessImageUrl(business, 'cover')).toBe('http://localhost:8000/media/cover.jpg');
    });

    it('returns empty string when no matching image', () => {
      expect(getBusinessImageUrl({}, 'logo')).toBe('');
      expect(getBusinessImageUrl({}, 'cover')).toBe('');
    });
  });
});
