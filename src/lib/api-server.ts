/**
 * Server-side API Client for Django REST API
 * For use in Next.js Server Components and Server Actions
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
const DEFAULT_COMPANY_SLUG = process.env.NEXT_PUBLIC_COMPANY_SLUG || 'riverside-herald'

class ServerApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    // Ensure baseURL doesn't end with /
    this.baseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL
  }

  private async getHeaders(customHeaders?: HeadersInit, skipTenant: boolean = false): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Merge custom headers
    if (customHeaders) {
      if (customHeaders instanceof Headers) {
        customHeaders.forEach((value, key) => {
          headers[key] = value
        })
      } else {
        Object.assign(headers, customHeaders)
      }
    }

    // Read cookies for auth token and company ID
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    
    // Add company ID from cookie or env, unless skipTenant is true
    if (!skipTenant) {
      const companyId = cookieStore.get('company_id')?.value || process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID
      if (companyId) {
        headers['X-Company-Id'] = companyId
      }
    }
    
    // Always include company slug for tenant context
    headers['X-Company-Slug'] = DEFAULT_COMPANY_SLUG
    
    // Add auth token from cookie if available and not already in headers
    const authToken = cookieStore.get('auth_token')?.value
    if (authToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    return headers
  }

  private buildUrl(endpoint: string): string {
    // If endpoint is already a full URL, return it
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint
    }
    
    // Remove baseURL if endpoint already includes it (prevent doubling)
    let cleanEndpoint = endpoint
    if (endpoint.includes(this.baseURL)) {
      cleanEndpoint = endpoint.replace(this.baseURL, '')
    }
    
    // Ensure endpoint starts with /
    if (!cleanEndpoint.startsWith('/')) {
      cleanEndpoint = `/${cleanEndpoint}`
    }
    
    // Simple concatenation - baseURL should not end with /, endpoint should start with /
    return `${this.baseURL}${cleanEndpoint}`
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    skipTenant: boolean = false
  ): Promise<T> {
    const url = this.buildUrl(endpoint)
    
    // Get headers
    const headers = await this.getHeaders(options.headers as HeadersInit, skipTenant)

    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${options.method || 'GET'} ${url}`)
      console.log(`[API] Headers:`, {
        'Authorization': headers['Authorization'] ? 'Bearer ***' : 'missing',
        'X-Company-Id': headers['X-Company-Id'] || 'missing',
        'X-Company-Slug': headers['X-Company-Slug'] || 'missing',
      })
    }

    const response = await fetch(url, {
      ...options,
      headers,
      cache: 'no-store', // Always fetch fresh data in server components
    })

    if (!response.ok) {
      let error: any
      try {
        const data = await response.json()
        error = {
          message: data.error || data.message || `HTTP ${response.status}: ${response.statusText}`,
          code: `HTTP_${response.status}`,
          details: data,
          url: url,
          status: response.status,
        }
      } catch {
        error = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          code: `HTTP_${response.status}`,
          url: url,
          status: response.status,
        }
      }
      
      // Log detailed error in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`[API Error] ${url}:`, {
          message: error.message,
          code: error.code,
          status: error.status,
          url: error.url,
          details: error.details || 'No details available',
          fullError: error
        })
      }
      
      throw error
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }
    return await response.text() as unknown as T
  }

  async get<T>(endpoint: string, params?: Record<string, any> | { headers?: HeadersInit; skipTenant?: boolean }): Promise<T> {
    let url = this.buildUrl(endpoint)
    let customHeaders: HeadersInit | undefined
    let skipTenant = false
    
    // Check if params contains headers or skipTenant
    if (params) {
      if ('headers' in params) {
        customHeaders = (params as any).headers
      }
      if ('skipTenant' in params) {
        skipTenant = !!(params as any).skipTenant
      }
      
      // Remove internal options from params for URL search params
      const { headers: _, skipTenant: __, ...urlParams } = params as any
      params = urlParams
    }
    
    // Add query params if any
    if (params && Object.keys(params).length > 0) {
      const urlObj = new URL(url)
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'headers' && key !== 'skipTenant') {
          urlObj.searchParams.append(key, String(value))
        }
      })
      url = urlObj.toString()
    }

    return this.request<T>(url, {
      method: 'GET',
      headers: customHeaders,
    }, skipTenant)
  }

  async post<T>(endpoint: string, data?: any, customHeaders?: HeadersInit, skipTenant: boolean = false): Promise<T> {
    const url = this.buildUrl(endpoint)
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: customHeaders,
    }, skipTenant)
  }
}

// Create singleton instance
export const serverApi = new ServerApiClient()

// Server-side API methods
export const serverNewsApi = {
  // Articles
  articles: {
    list: (params?: { status?: string; category?: string; search?: string; page?: number; author?: string; limit?: number; ordering?: string; slug?: string; skipTenant?: boolean }) =>
      serverApi.get('/news/articles/', params),
    getBySlug: async (slug: string) => {
      try {
        // Get by slug using filter - this returns list view, need detail view for full data
        // Don't filter by status for authenticated users - they should see all articles
        const results = await serverApi.get<any>('/news/articles/', { slug, skipTenant: true })
        // Handle paginated response
        const articles = Array.isArray(results) ? results : (results?.results || [])
        const article = articles?.[0] || null
        if (!article) {
          // Try without status filter in case article is not published
          const allResults = await serverApi.get<any>('/news/articles/', { slug, skipTenant: true })
          const allArticles = Array.isArray(allResults) ? allResults : (allResults?.results || [])
          const foundArticle = allArticles?.[0] || null
          if (!foundArticle) {
            throw new Error(`Article with slug "${slug}" not found`)
          }
          // Fetch full detail
          if (foundArticle.id) {
            try {
              const fullArticle = await serverApi.get<any>(`/news/articles/${foundArticle.id}/`, { skipTenant: true })
              return fullArticle
            } catch (error) {
              console.warn('Failed to fetch article detail, using list item:', error)
              return foundArticle
            }
          }
          return foundArticle
        }
        // If we got a list item, fetch the full detail to get article_media and all fields
        if (article.id) {
          try {
            const fullArticle = await serverApi.get<any>(`/news/articles/${article.id}/`, { skipTenant: true })
            return fullArticle
          } catch (error) {
            // If detail fetch fails, return the list item
            console.warn('Failed to fetch article detail, using list item:', error)
            return article
          }
        }
        return article
      } catch (error: any) {
        console.error(`Error fetching article by slug "${slug}":`, error)
        throw error
      }
    },
    incrementViews: async (id: string) => {
      return serverApi.post(`/news/articles/${id}/increment_views/`, {}, undefined, true)
    },
  },

  // Categories
  categories: {
    list: (params?: { skipTenant?: boolean }) => serverApi.get('/news/categories/', params),
  },

  // Tags
  tags: {
    list: (params?: { skipTenant?: boolean }) => serverApi.get('/news/tags/', params),
  },

  // Businesses
  businesses: {
    list: (params?: { industry?: string; is_verified?: boolean; search?: string; owner?: string; skipTenant?: boolean }) =>
      serverApi.get('/news/businesses/', params),
    listEnhanced: async (params?: { industry?: string; is_verified?: boolean; search?: string; owner?: string; skipTenant?: boolean; includeProducts?: boolean }) => {
      try {
        const businesses = await serverApi.get<any>('/news/businesses/', params)
        const businessesArray = Array.isArray(businesses) ? businesses : (businesses?.results || [])
        
        // If includeProducts is true, fetch products for each business
        if (params?.includeProducts) {
          const enhancedBusinesses = await Promise.all(
            businessesArray.map(async (business: any) => {
              try {
                // Try to fetch products for this business using direct API call
                const products = await serverApi.get(`/v1/public/${business.slug}/products/`, { skipTenant: true })
                return {
                  ...business,
                  products: Array.isArray(products) ? products.slice(0, 4) : (products?.results || []).slice(0, 4) // Limit to 4 products for homepage
                }
              } catch (error) {
                // If products fetch fails, continue without products
                console.warn(`Failed to fetch products for ${business.slug}:`, error)
                return {
                  ...business,
                  products: []
                }
              }
            })
          )
          return Array.isArray(businesses) ? enhancedBusinesses : { ...businesses, results: enhancedBusinesses }
        }
        
        return businesses
      } catch (error) {
        console.error('Error fetching enhanced businesses:', error)
        throw error
      }
    },
    getBySlug: async (slug: string) => {
      try {
        const results = await serverApi.get<any>('/news/businesses/', { slug, skipTenant: true })
        const businesses = Array.isArray(results) ? results : (results?.results || [])
        
        // Find the exact match by slug in the results
        const business = businesses.find((b: any) => b.slug === slug) || null
        
        if (business && business.id) {
          try {
            // Fetch full detail to get all fields
            return await serverApi.get<any>(`/news/businesses/${business.id}/`, { skipTenant: true })
          } catch (error) {
            console.warn('Failed to fetch business detail, using list item:', error)
            return business
          }
        }
        return business
      } catch (error) {
        console.error(`Error fetching business by slug "${slug}":`, error)
        throw error
      }
    },
  },

  // Business Reviews
  businessReviews: {
    list: (params?: { business?: string; is_approved?: boolean; skipTenant?: boolean }) =>
      serverApi.get('/news/business-reviews/', params),
  },

  // Products
  products: {
    list: (params?: { business?: string; category?: string; search?: string; is_active?: boolean; skipTenant?: boolean }) =>
      serverApi.get('/v1/public/products/', params),
    getByBusiness: (businessSlug: string) =>
      serverApi.get(`/v1/public/${businessSlug}/products/`, { skipTenant: true }),
    getBySlug: (businessSlug: string, slug: string) =>
      serverApi.get(`/v1/public/${businessSlug}/products/slug/${slug}/`, { skipTenant: true }),
  },

  // Site Settings
  siteSettings: {
    list: (params?: { skipTenant?: boolean }) => serverApi.get('/news/site-settings/', params),
    getByKey: async (key: string) => {
      const settings: any = await serverApi.get<any[]>('/news/site-settings/', { skipTenant: true })
      const settingsArray = Array.isArray(settings) ? settings : (settings?.results || [])
      return settingsArray.find((s: any) => s.key === key) || null
    },
  },

  // Profile (requires auth) - reads token from cookies automatically
  profile: {
    get: (customHeaders?: HeadersInit) => serverApi.get('/news/profiles/me/', { headers: customHeaders }),
    getMe: (customHeaders?: HeadersInit) => serverApi.get('/news/profiles/me', { headers: customHeaders }),
  },

  // Stats (requires auth) - reads token from cookies automatically
  stats: {
    dashboard: (customHeaders?: HeadersInit) => serverApi.get('/news/stats/dashboard/', { headers: customHeaders }),
  },

  // Pages (for dynamic page content)
  pages: {
    list: async (params?: { slug?: string; is_published?: boolean }): Promise<any> => {
      const result = await serverApi.get<any>('/news/pages/', params)
      return result as any
    },
    getBySlug: async (slug: string) => {
      const results: any = await serverApi.get<any[]>('/news/pages/', { slug, is_published: true })
      const resultsArray = Array.isArray(results) ? results : (results?.results || [])
      return resultsArray[0] || null
    },
  },
}

export default serverApi
