/**
 * API Client unit tests for River Side Herald
 * Uses mocked fetch; aligns with Django API response shapes
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authApi, apiClient } from './api';

const API_BASE = 'http://localhost:8000/api';
const COMPANY_SLUG = 'riverside-herald';

function createMockResponse(body: any, ok = true, status = ok ? 200 : 400) {
  const base = {
    ok,
    status,
    statusText: ok ? 'OK' : 'Bad Request',
    url: `${API_BASE}/auth/login/`,
    headers: { get: (name: string) => (name === 'content-type' ? 'application/json' : null) },
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  };
  return {
    ...base,
    clone: () => ({ ...base, clone: () => ({ ...base }) }),
  } as unknown as Response;
}

describe('authApi', () => {
  beforeEach(() => {
    authApi.logout();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('POSTs to /auth/login/ with username, password, company_slug', async () => {
      const mockResponse = {
        access: 'new-access',
        refresh: 'new-refresh',
        user: { id: '1', username: 'testuser' },
        company: { id: 'company-1', name: 'Riverside Herald' },
      };
      const fetchMock = vi.fn().mockResolvedValue(createMockResponse(mockResponse));
      vi.stubGlobal('fetch', fetchMock);

      const result = await authApi.login('testuser', 'testpass');

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/auth/login/`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'testuser',
            password: 'testpass',
            company_slug: COMPANY_SLUG,
          }),
        })
      );
      expect(result.access).toBe('new-access');
      expect(result.refresh).toBe('new-refresh');
      expect(apiClient.getToken()).toBe('new-access');
      expect(apiClient.getRefreshToken()).toBe('new-refresh');
      expect(apiClient.getCompanyId()).toBe('company-1');
    });

    it('throws on non-200 response', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
        createMockResponse({ error: 'Invalid credentials' }, false)
      ));

      await expect(authApi.login('bad', 'bad')).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('sets tokens.access, tokens.refresh, company.id on success', async () => {
      const mockResponse = {
        tokens: { access: 'reg-access', refresh: 'reg-refresh' },
        user: { id: '2', email: 'new@test.com' },
        company: { id: 'company-1', name: 'Riverside Herald' },
      };
      const fetchMock = vi.fn().mockResolvedValue(createMockResponse(mockResponse));
      vi.stubGlobal('fetch', fetchMock);

      await authApi.register({
        email: 'new@test.com',
        password: 'pass123',
        password_confirm: 'pass123',
        first_name: 'Test',
        last_name: 'User',
        phone: '+15551234567',
      });

      expect(apiClient.getToken()).toBe('reg-access');
      expect(apiClient.getRefreshToken()).toBe('reg-refresh');
      expect(apiClient.getCompanyId()).toBe('company-1');
    });
  });


  describe('checkRegistrationEmail', () => {
    it('POSTs to /auth/check-registration-email/ with normalized email and company_slug', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        createMockResponse({ status: 'existing_can_link' }),
      )
      vi.stubGlobal('fetch', fetchMock)

      const result = await authApi.checkRegistrationEmail('User@Test.COM')

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/auth/check-registration-email/`,
        expect.objectContaining({ method: 'POST' }),
      )
      const postInit = fetchMock.mock.calls[0]?.[1] as RequestInit
      const parsed = JSON.parse(String(postInit.body)) as Record<string, unknown>
      expect(parsed.email).toBe('user@test.com')
      expect(parsed.company_slug).toBe(COMPANY_SLUG)
      expect(parsed.linkable).toBe(true)
      expect(result.status).toBe('existing_can_link')
    })

    it('passes linkable: false when requested', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        createMockResponse({ status: 'existing_no_link' }),
      )
      vi.stubGlobal('fetch', fetchMock)

      await authApi.checkRegistrationEmail('biz@test.com', { linkable: false })

      const postInit = fetchMock.mock.calls[0]?.[1] as RequestInit
      const parsed = JSON.parse(String(postInit.body)) as Record<string, unknown>
      expect(parsed.linkable).toBe(false)
    })
  })

  describe('linkTenantAccount', () => {
    it('POSTs to /auth/link-tenant/ and sets tokens on success', async () => {
      const mockResponse = {
        tokens: { access: 'link-access', refresh: 'link-refresh' },
        user: { id: '3', email: 'linked@test.com' },
        company: { id: 'company-1', name: 'Store' },
        account_linked: true,
      }
      const fetchMock = vi.fn().mockResolvedValue(createMockResponse(mockResponse))
      vi.stubGlobal('fetch', fetchMock)

      const result = await authApi.linkTenantAccount({
        email: 'Linked@Test.COM',
        password: 'secret',
      })

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/auth/link-tenant/`,
        expect.objectContaining({ method: 'POST' }),
      )
      const postInit = fetchMock.mock.calls[0]?.[1] as RequestInit
      const parsed = JSON.parse(String(postInit.body)) as Record<string, string>
      expect(parsed.email).toBe('linked@test.com')
      expect(parsed.password).toBe('secret')
      expect(parsed.company_slug).toBe(COMPANY_SLUG)
      expect(apiClient.getToken()).toBe('link-access')
      expect(result.account_linked).toBe(true)
    })
  })

  describe('logout', () => {
    it('clears token, refresh token, and company id', async () => {
      const mockResponse = {
        access: 'tok',
        refresh: 'ref',
        user: {},
        company: { id: 'c1' },
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createMockResponse(mockResponse)));

      await authApi.login('u', 'p');
      expect(apiClient.getToken()).toBeTruthy();
      authApi.logout();
      expect(apiClient.getToken()).toBeNull();
      expect(apiClient.getRefreshToken()).toBeNull();
      expect(apiClient.getCompanyId()).toBeNull();
    });
  });
});

describe('apiClient', () => {
  beforeEach(() => {
    authApi.logout();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('request headers', () => {
    it('adds Authorization Bearer and X-Company-Id when authenticated', async () => {
      const loginResponse = {
        access: 'my-token',
        refresh: 'my-refresh',
        user: {},
        company: { id: 'company-123' },
      };
      const fetchMock = vi.fn()
        .mockResolvedValueOnce(createMockResponse(loginResponse))
        .mockResolvedValueOnce(createMockResponse({ data: [] }));
      vi.stubGlobal('fetch', fetchMock);

      await authApi.login('u', 'p');
      await apiClient.get('/news/articles/');

      const getCall = fetchMock.mock.calls.find((c: [string, RequestInit]) =>
        c[0].includes('/news/articles/')
      );
      expect(getCall).toBeDefined();
      expect(getCall[1].headers).toMatchObject(
        expect.objectContaining({
          Authorization: 'Bearer my-token',
          'X-Company-Id': 'company-123',
        })
      );
    });
  });
});
