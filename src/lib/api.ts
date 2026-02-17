/**
 * API Client for Django REST API
 * Replaces Supabase client calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
const DEFAULT_COMPANY_SLUG = process.env.NEXT_PUBLIC_COMPANY_SLUG || 'riverside-herald'

export interface ApiError {
  message: string
  code?: string
  details?: any
  url?: string
  status?: number
}

export class ApiClient {
  private baseURL: string
  private token: string | null = null
  private companyId: string | null = null
  private refreshToken: string | null = null
  private isRefreshing: boolean = false
  private refreshPromise: Promise<string | null> | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    // Load refresh token from storage
    if (typeof window !== 'undefined') {
      this.refreshToken = localStorage.getItem('refresh_token')
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
        // Also set in cookie for server-side access
        document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`
      } else {
        localStorage.removeItem('auth_token')
        // Remove cookie
        document.cookie = 'auth_token=; path=/; max-age=0'
      }
    }
  }

  /**
   * Set refresh token
   */
  setRefreshToken(refreshToken: string | null) {
    this.refreshToken = refreshToken
    if (typeof window !== 'undefined') {
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken)
        // Also set in cookie for server-side access
        document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800; SameSite=Lax` // 7 days
      } else {
        localStorage.removeItem('refresh_token')
        // Remove cookie
        document.cookie = 'refresh_token=; path=/; max-age=0'
      }
    }
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    if (this.refreshToken) return this.refreshToken
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token')
    }
    return null
  }

  /**
   * Attempt to refresh the access token
   */
  private async attemptTokenRefresh(): Promise<string | null> {
    // If already refreshing, wait for that promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      return null
    }

    this.isRefreshing = true
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.access) {
            this.setToken(data.access)
            return data.access
          }
        } else {
          // Refresh token is invalid, clear everything
          this.setToken(null)
          this.setRefreshToken(null)
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          return null
        }
      } catch (error) {
        console.error('Token refresh failed:', error)
        this.setToken(null)
        this.setRefreshToken(null)
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return null
      } finally {
        this.isRefreshing = false
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  /**
   * Get authentication token from storage
   */
  getToken(): string | null {
    if (this.token) return this.token
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  /**
   * Set company ID for tenant context
   */
  setCompanyId(companyId: string | null) {
    this.companyId = companyId
    if (typeof window !== 'undefined') {
      if (companyId) {
        localStorage.setItem('company_id', companyId)
        // Also set in cookie for server-side access
        document.cookie = `company_id=${companyId}; path=/; max-age=86400; SameSite=Lax`
      } else {
        localStorage.removeItem('company_id')
        // Remove cookie
        document.cookie = 'company_id=; path=/; max-age=0'
      }
    }
  }

  /**
   * Get company ID from storage
   */
  getCompanyId(): string | null {
    if (this.companyId) return this.companyId
    if (typeof window !== 'undefined') {
      return localStorage.getItem('company_id')
    }
    return null
  }

  /**
   * Build headers for API requests
   */
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (includeAuth) {
      const token = this.getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const companyId = this.getCompanyId()
    if (companyId) {
      headers['X-Company-Id'] = companyId
    }
    
    // Always include company slug for tenant context
    headers['X-Company-Slug'] = DEFAULT_COMPANY_SLUG

    return headers
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response, retryRequest?: () => Promise<Response>): Promise<T> {
    if (!response.ok) {
      // If 401 and we have a refresh token, try to refresh
      if (response.status === 401 && this.getRefreshToken() && retryRequest) {
        const newToken = await this.attemptTokenRefresh()
        if (newToken) {
          // Retry the original request with new token
          const retryResponse = await retryRequest()
          return this.handleResponse<T>(retryResponse)
        }
      }

      let error: ApiError
      
      // Check if response has content before trying to parse
      const contentType = response.headers.get('content-type') || ''
      const hasJsonContent = contentType.includes('application/json')
      const text = await response.text()
      
      try {
        let data: any = {}
        
        // Only parse JSON if content type indicates JSON and there's actual content
        if (hasJsonContent && text.trim()) {
          try {
            data = JSON.parse(text)
          } catch (parseError) {
            // If JSON parsing fails, use text as message
            data = { message: text || `HTTP ${response.status}: ${response.statusText}` }
          }
        } else if (text.trim()) {
          // Non-JSON response with content
          data = { message: text }
        } else {
          // Empty response
          data = { message: `HTTP ${response.status}: ${response.statusText}` }
        }
        
        // Only log if there's meaningful error data
        if (Object.keys(data).length > 0 && (data.error || data.message || data.detail)) {
          console.error('[API ERROR RESPONSE]', {
            status: response.status,
            url: response.url,
            data: data
          })
        }
        
        // Django REST Framework returns validation errors directly in the response
        // Format: { "field_name": ["error1", "error2"], "non_field_errors": ["error"] }
        // OR: { "error": "message" } for custom errors
        // OR: { "detail": "message" } for generic errors
        let message = 'An error occurred'
        
        // Check for Django field validation errors (directly in data)
        const hasFieldErrors = Object.keys(data).some(key => 
          key !== 'error' && key !== 'detail' && key !== 'message' && 
          (Array.isArray(data[key]) || typeof data[key] === 'string')
        )
        
        if (hasFieldErrors) {
          // Format field errors
          const errorFields = Object.entries(data)
            .filter(([key]) => key !== 'error' && key !== 'detail' && key !== 'message')
            .map(([field, messages]: [string, any]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages]
              const formattedField = field.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')
              return `${formattedField}: ${messageArray.join(', ')}`
            })
          message = errorFields.join('; ')
        } else if (data.error) {
          // If error is an object with field errors, format it
          if (typeof data.error === 'object' && data.error !== null) {
            const errorFields = Object.entries(data.error).map(([field, messages]: [string, any]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages]
              return `${field}: ${messageArray.join(', ')}`
            })
            message = errorFields.join('; ')
          } else if (typeof data.error === 'string') {
            message = data.error
          }
        } else {
          message = data.message || data.detail || `HTTP ${response.status}: ${response.statusText}`
        }
        
        error = {
          message,
          code: data.code || `HTTP_${response.status}`,
          details: Object.keys(data).length > 0 ? data : undefined, // Include full data for field error extraction
          url: response.url,
          status: response.status,
        }
      } catch (e) {
        // Fallback error creation
        error = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          code: `HTTP_${response.status}`,
          url: response.url,
          status: response.status,
        }
      }
      throw error
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }
    return await response.text() as unknown as T
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const makeRequest = () => fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    })

    const response = await makeRequest()
    return this.handleResponse<T>(response, makeRequest)
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    // Log request details for registration endpoint
    if (endpoint.includes('/auth/register/')) {
      console.log('[REGISTER REQUEST]', {
        endpoint: `${this.baseURL}${endpoint}`,
        data,
        headers: this.getHeaders(includeAuth)
      })
    }
    
    const makeRequest = () => fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
    })

    const response = await makeRequest()
    
    // Log response details for registration endpoint
    if (endpoint.includes('/auth/register/')) {
      console.log('[REGISTER RESPONSE]', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      })
      
      // Clone response to read body without consuming it
      const clonedResponse = response.clone()
      if (!response.ok) {
        clonedResponse.json().then(body => {
          console.log('[REGISTER ERROR BODY]', body)
        }).catch(e => {
          console.log('[REGISTER ERROR] Could not parse response body:', e)
        })
      }
    }
    
    return this.handleResponse<T>(response, makeRequest)
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const makeRequest = () => fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })

    const response = await makeRequest()
    return this.handleResponse<T>(response, makeRequest)
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const makeRequest = () => fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })

    const response = await makeRequest()
    return this.handleResponse<T>(response, makeRequest)
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, data?: Record<string, any>): Promise<T> {
    const makeRequest = () => {
      const options: RequestInit = {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
      
      if (data) {
        options.headers = {
          ...options.headers,
          'Content-Type': 'application/json',
        }
        options.body = JSON.stringify(data)
      }

      return fetch(`${this.baseURL}${endpoint}`, options)
    }

    const response = await makeRequest()
    return this.handleResponse<T>(response, makeRequest)
  }

  /**
   * Upload file
   */
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const makeRequest = () => {
      const formData = new FormData()
      formData.append('file', file)
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, String(value))
        })
      }

      const headers: HeadersInit = {}
      const token = this.getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const companyId = this.getCompanyId()
      if (companyId) {
        headers['X-Company-Id'] = companyId
      }
      // Always include company slug
      headers['X-Company-Slug'] = DEFAULT_COMPANY_SLUG

      return fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      })
    }

    const response = await makeRequest()
    return this.handleResponse<T>(response, makeRequest)
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Auth API methods
export const authApi = {
  /**
   * Login with username and password
   */
  async login(username: string, password: string) {
    const response = await apiClient.post<{
      access: string
      refresh: string
      user: any
      company?: { id: string; name: string }
    }>('/auth/login/', { username, password }, false)

    if (response.access) {
      apiClient.setToken(response.access)
      if (response.refresh) {
        apiClient.setRefreshToken(response.refresh)
      }
      if (response.company?.id) {
        apiClient.setCompanyId(response.company.id)
      }
    }

    return response
  },

  /**
   * Register new user and company
   * If company_name is provided, creates business registration (new company)
   * Otherwise, creates user registration (connects to Riverside Herald)
   */
  async register(data: {
    email: string
    password: string
    company_name?: string  // Optional - if provided, creates business; otherwise connects to Riverside Herald
    company_email?: string
    first_name?: string    // Preferred - first name
    last_name?: string     // Preferred - last name  
    full_name?: string     // Fallback - will be split into first/last if first_name and last_name not provided
    password_confirm?: string
    role?: string  // Optional role for user registration (e.g., 'author')
  }) {
    // Build request data
    const requestData: any = {
      email: data.email,
      password: data.password,
      password_confirm: data.password_confirm || data.password,
    }
    
    // If company_name is provided, it's a business registration
    if (data.company_name) {
      // Business registration requires username and separate first_name/last_name
      // Generate username from email prefix, with timestamp suffix to ensure uniqueness
      const emailPrefix = data.email.split('@')[0]
      const timestamp = Date.now().toString().slice(-6) // Last 6 digits of timestamp
      requestData.username = `${emailPrefix}${timestamp}`
      requestData.company_name = data.company_name
      requestData.company_email = data.company_email || data.email
      
      // Use provided first_name and last_name, or split full_name if provided
      if (data.first_name && data.last_name) {
        requestData.first_name = data.first_name
        requestData.last_name = data.last_name
      } else if (data.full_name) {
        const nameParts = data.full_name.trim().split(/\s+/)
        requestData.first_name = nameParts[0] || ''
        requestData.last_name = nameParts.slice(1).join(' ') || ''
      }
    } else {
      // User registration uses first_name and last_name
      if (data.first_name && data.last_name) {
        requestData.first_name = data.first_name
        requestData.last_name = data.last_name
        requestData.full_name = `${data.first_name} ${data.last_name}`
      } else if (data.full_name) {
        const nameParts = data.full_name.trim().split(/\s+/)
        requestData.first_name = nameParts[0] || ''
        requestData.last_name = nameParts.slice(1).join(' ') || ''
        requestData.full_name = data.full_name
      } else if (data.first_name && data.last_name) {
        requestData.first_name = data.first_name
        requestData.last_name = data.last_name
        requestData.full_name = `${data.first_name} ${data.last_name}`
      }
      // Add role if provided (for author registration)
      if (data.role) {
        requestData.role = data.role
      }
    }
    
    const response = await apiClient.post<{
      user: any
      company: { id: string; name: string }
      tokens?: { access: string; refresh: string }
      profile?: { role: string; is_verified: boolean }
    }>('/auth/register/', requestData, false)

    if (response.tokens?.access) {
      apiClient.setToken(response.tokens.access)
      if (response.company?.id) {
        apiClient.setCompanyId(response.company.id)
      }
    }

    return response
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    const response = await apiClient.post<{ access: string }>(
      '/auth/refresh/',
      { refresh: refreshToken },
      false
    )
    
    if (response.access) {
      apiClient.setToken(response.access)
    }

    return response
  },

  /**
   * Logout
   */
  logout() {
    apiClient.setToken(null)
    apiClient.setCompanyId(null)
  },
}

// News API methods
export const newsApi = {
  // Articles
  articles: {
    list: (params?: { status?: string; category?: string; search?: string; page?: number }) =>
      apiClient.get('/news/articles/', params),
    get: (id: string) => apiClient.get(`/news/articles/${id}/`),
    getBySlug: (slug: string) => apiClient.get(`/news/articles/?slug=${slug}`),
    create: (data: any) => apiClient.post('/news/articles/', data),
    update: (id: string, data: any) => apiClient.put(`/news/articles/${id}/`, data),
    patch: (id: string, data: any) => apiClient.patch(`/news/articles/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/news/articles/${id}/`),
    incrementViews: (id: string) => apiClient.post(`/news/articles/${id}/increment_views/`),
    like: (id: string) => apiClient.post(`/news/articles/${id}/like/`),
    // Article media gallery management
    getMedia: (id: string) => apiClient.get(`/news/articles/${id}/media/`),
    addMedia: (id: string, mediaId: string, caption?: string) => 
      apiClient.post(`/news/articles/${id}/media/`, { media_id: mediaId, caption: caption || '' }),
    removeMedia: (id: string, mediaId: string) => 
      apiClient.delete(`/news/articles/${id}/media/`, { media_id: mediaId }),
  },

  // Categories
  categories: {
    list: () => apiClient.get('/news/categories/'),
    get: (id: string) => apiClient.get(`/news/categories/${id}/`),
    create: (data: any) => apiClient.post('/news/categories/', data),
    update: (id: string, data: any) => apiClient.put(`/news/categories/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/news/categories/${id}/`),
  },

  // Tags
  tags: {
    list: () => apiClient.get('/news/tags/'),
    get: (id: string) => apiClient.get(`/news/tags/${id}/`),
    create: (data: any) => apiClient.post('/news/tags/', data),
    update: (id: string, data: any) => apiClient.put(`/news/tags/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/news/tags/${id}/`),
  },

  // Media
  media: {
    list: (params?: { media_type?: string; is_public?: boolean }) =>
      apiClient.get('/news/media/', params),
    get: (id: string) => apiClient.get(`/news/media/${id}/`),
    upload: (file: File, data?: any) => apiClient.uploadFile('/news/media/', file, data),
    update: (id: string, data: any) => apiClient.put(`/news/media/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/news/media/${id}/`),
  },

  // Businesses
  businesses: {
    list: (params?: { industry?: string; is_verified?: boolean; search?: string; owner?: string; slug?: string }) =>
      apiClient.get('/news/businesses/', params),
    get: (id: string) => apiClient.get(`/news/businesses/${id}/`),
    getBySlug: (slug: string) => apiClient.get(`/news/businesses/?slug=${slug}`),
    myBusinesses: () => apiClient.get('/news/businesses/my_businesses/'),
    create: (data: any) => apiClient.post('/news/businesses/', data),
    update: (id: string, data: any) => apiClient.put(`/news/businesses/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/news/businesses/${id}/`),
  },

  // Business Reviews
  businessReviews: {
    list: (params?: { business?: string; is_approved?: boolean }) =>
      apiClient.get('/news/business-reviews/', params),
    get: (id: string) => apiClient.get(`/news/business-reviews/${id}/`),
    create: (data: any) => apiClient.post('/news/business-reviews/', data),
    update: (id: string, data: any) => apiClient.put(`/news/business-reviews/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/news/business-reviews/${id}/`),
  },

  // Comments
  comments: {
    list: (params?: { article?: string; is_approved?: boolean }) =>
      apiClient.get('/news/comments/', params),
    get: (id: string) => apiClient.get(`/news/comments/${id}/`),
    create: (data: any) => apiClient.post('/news/comments/', data),
    update: (id: string, data: any) => apiClient.put(`/news/comments/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/news/comments/${id}/`),
  },

  // Site Settings
  siteSettings: {
    list: () => apiClient.get('/news/site-settings/'),
    get: (key: string) => apiClient.get(`/news/site-settings/?key=${key}`),
    create: (data: any) => apiClient.post('/news/site-settings/', data),
    update: (id: string, data: any) => apiClient.put(`/news/site-settings/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/news/site-settings/${id}/`),
  },

  // Profile
  profile: {
    get: () => apiClient.get('/news/profiles/me/'),
    update: (data: any) => apiClient.put('/news/profiles/me/', data),
    patch: (data: any) => apiClient.patch('/news/profiles/me/', data),
  },

  // Stats
  stats: {
    dashboard: () => apiClient.get('/news/stats/dashboard/'),
  },

  // Notifications
  notifications: {
    list: (params?: { is_read?: boolean; type?: string }) =>
      apiClient.get('/news/notifications/', params),
    get: (id: string) => apiClient.get(`/news/notifications/${id}/`),
    markRead: (id: string) => apiClient.patch(`/news/notifications/${id}/`, { is_read: true }),
  },
}

export default apiClient

