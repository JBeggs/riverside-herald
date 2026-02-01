'use client'

import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { newsApi } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

interface BusinessEditModalProps {
  businessId: string
  onClose: () => void
  onSuccess: () => void
  isFullPage?: boolean
}

interface BusinessData {
  name: string
  slug: string
  description: string
  long_description: string
  industry: string
  website_url: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  zip_code: string
  services: string[]
  business_hours: Record<string, string>
  social_links: Record<string, string>
  logo: string | null  // UUID of Media object
  cover_image: string | null  // UUID of Media object
  seo_title: string
  seo_description: string
}

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
]

const socialPlatforms = [
  'facebook',
  'twitter',
  'instagram',
  'linkedin',
  'youtube',
  'tiktok'
]

export function BusinessEditModal({ businessId, onClose, onSuccess, isFullPage = false }: BusinessEditModalProps) {
  const { showError, showSuccess } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [logoMedia, setLogoMedia] = useState<any>(null)
  const [coverMedia, setCoverMedia] = useState<any>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [availableMedia, setAvailableMedia] = useState<any[]>([])
  const [loadingMedia, setLoadingMedia] = useState(false)
  const [showMediaBrowser, setShowMediaBrowser] = useState(false)
  
  const [businessData, setBusinessData] = useState<BusinessData>({
    name: '',
    slug: '',
    description: '',
    long_description: '',
    industry: '',
    website_url: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    services: [],
    business_hours: {},
    social_links: {},
    logo: null,
    cover_image: null,
    seo_title: '',
    seo_description: ''
  })

  const [newService, setNewService] = useState('')
  const [newSocialPlatform, setNewSocialPlatform] = useState('')
  const [newSocialUrl, setNewSocialUrl] = useState('')

  const loadAvailableMedia = async () => {
    setLoadingMedia(true)
    try {
      const mediaList: any = await newsApi.media.list({ media_type: 'image' })
      setAvailableMedia(Array.isArray(mediaList) ? mediaList : (mediaList?.results || []))
    } catch (error: any) {
      console.error('Error loading media:', error)
      // Don't show error toast - media loading is optional
    } finally {
      setLoadingMedia(false)
    }
  }

  const handleImageUpload = async (file: File, type: 'logo' | 'cover') => {
    if (type === 'logo') {
      setUploadingLogo(true)
    } else {
      setUploadingCover(true)
    }

    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        showError('Please select an image file')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        showError('Image size must be less than 10MB')
        return
      }

      // Upload media
      const mediaData = await newsApi.media.upload(file, {
        media_type: 'image',
        alt_text: `${type === 'logo' ? 'Logo' : 'Cover image'} for business`,
      }) as any

      // Update business data
      if (type === 'logo') {
        handleInputChange('logo', mediaData.id)
        setLogoMedia(mediaData)
        showSuccess('Logo uploaded successfully!')
      } else {
        handleInputChange('cover_image', mediaData.id)
        setCoverMedia(mediaData)
        showSuccess('Cover image uploaded successfully!')
      }

      // Reload available media
      await loadAvailableMedia()
    } catch (error: any) {
      const errorMessage = error?.message || error?.details?.message || 'Error uploading image'
      showError(errorMessage)
    } finally {
      if (type === 'logo') {
        setUploadingLogo(false)
      } else {
        setUploadingCover(false)
      }
    }
  }

  useEffect(() => {
    fetchBusinessData()
  }, [businessId])

  useEffect(() => {
    if (activeTab === 'images') {
      loadAvailableMedia()
    }
  }, [activeTab])

  // Helper functions to convert business hours
  const formatHoursForDisplay = (hours: any): Record<string, string> => {
    if (!hours || typeof hours !== 'object') return {}
    
    const formatted: Record<string, string> = {}
    for (const [day, time] of Object.entries(hours)) {
      if (time && typeof time === 'object') {
        const timeObj = time as { open?: string; close?: string; closed?: boolean }
        if (timeObj.closed) {
          formatted[day] = 'Closed'
        } else if (timeObj.open && timeObj.close) {
          formatted[day] = `${timeObj.open} - ${timeObj.close}`
        } else {
          formatted[day] = ''
        }
      } else if (typeof time === 'string') {
        formatted[day] = time
      } else {
        formatted[day] = ''
      }
    }
    return formatted
  }

  const parseHoursForSaving = (hours: Record<string, string>): Record<string, any> => {
    const parsed: Record<string, any> = {}
    for (const [day, timeString] of Object.entries(hours)) {
      if (!timeString || timeString.toLowerCase() === 'closed') {
        parsed[day] = { closed: true }
      } else if (timeString.includes(' - ')) {
        const [open, close] = timeString.split(' - ')
        parsed[day] = { open: open.trim(), close: close.trim() }
      } else {
        parsed[day] = timeString // Keep as string if not in expected format
      }
    }
    return parsed
  }

  const fetchBusinessData = async () => {
    // If creating new business, skip fetch
    if (businessId === 'new') {
      setLoading(false)
      return
    }

    try {
      const business = await newsApi.businesses.get(businessId) as any

      setBusinessData({
        name: business.name || '',
        slug: business.slug || '',
        description: business.description || '',
        long_description: business.long_description || '',
        industry: business.industry || '',
        website_url: business.website_url || '',
        phone: business.phone || '',
        email: business.email || '',
        address: business.address || '',
        city: business.city || '',
        state: business.state || '',
        zip_code: business.zip_code || '',
        services: business.services || [],
        business_hours: formatHoursForDisplay(business.business_hours),
        social_links: business.social_links || {},
        logo: business.logo?.id || null,
        cover_image: business.cover_image?.id || null,
        seo_title: business.seo_title || '',
        seo_description: business.seo_description || ''
      })
      
      // Store media objects for display
      setLogoMedia(business.logo || null)
      setCoverMedia(business.cover_image || null)
    } catch (error: any) {
      const errorMessage = error?.message || error?.details?.message || 'Error fetching business data'
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
  }

  const handleInputChange = (field: keyof BusinessData, value: any) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-generate slug when name changes
    if (field === 'name') {
      setBusinessData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }
  }

  const addService = () => {
    if (newService.trim()) {
      setBusinessData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }))
      setNewService('')
    }
  }

  const removeService = (index: number) => {
    setBusinessData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }))
  }

  const addSocialLink = () => {
    if (newSocialPlatform && newSocialUrl.trim()) {
      setBusinessData(prev => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [newSocialPlatform]: newSocialUrl.trim()
        }
      }))
      setNewSocialPlatform('')
      setNewSocialUrl('')
    }
  }

  const removeSocialLink = (platform: string) => {
    setBusinessData(prev => {
      const newSocialLinks = { ...prev.social_links }
      delete newSocialLinks[platform]
      return {
        ...prev,
        social_links: newSocialLinks
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Validate required fields
    if (!businessData.name || !businessData.name.trim()) {
      showError('Business name is required')
      setSaving(false)
      return
    }

    try {
      // Generate slug if not provided
      const slug = businessData.slug || generateSlug(businessData.name)

      const businessPayload: any = {
        name: businessData.name.trim(),
        slug: slug,
        description: businessData.description || '',
        long_description: businessData.long_description || '',
        industry: businessData.industry || '',
        website_url: businessData.website_url || '',
        phone: businessData.phone || '',
        email: businessData.email || '',
        address: businessData.address || '',
        city: businessData.city || '',
        state: businessData.state || '',
        zip_code: businessData.zip_code || '',
        services: businessData.services || [],
        business_hours: parseHoursForSaving(businessData.business_hours),
        social_links: businessData.social_links || {},
        seo_title: businessData.seo_title || '',
        seo_description: businessData.seo_description || ''
      }

      // Include logo/cover_image using logo_id and cover_image_id (can be null to clear them)
      if (businessData.logo) {
        businessPayload.logo_id = businessData.logo
      } else {
        businessPayload.logo_id = null
      }
      if (businessData.cover_image) {
        businessPayload.cover_image_id = businessData.cover_image
      } else {
        businessPayload.cover_image_id = null
      }

      if (businessId === 'new') {
        // Create new business
        await newsApi.businesses.create(businessPayload)
        showSuccess('Business created successfully!')
      } else {
        // Update existing business
        await newsApi.businesses.update(businessId, businessPayload)
        showSuccess('Business updated successfully!')
      }

      onSuccess()
    } catch (error: any) {
      const errorMessage = error?.message || error?.details?.message || 'Error saving business data'
      showError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading && businessId !== 'new') {
    return (
      <div className={isFullPage ? "p-8" : "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"}>
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-600">Loading business data...</span>
          </div>
        </div>
      </div>
    )
  }

  const content = (
    <div className={`bg-white rounded-lg shadow-xl w-full overflow-hidden ${isFullPage ? '' : 'max-w-4xl max-h-[90vh]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">
          {businessId === 'new' ? 'Create New Business' : 'Edit Business Profile'}
        </h2>
        {!isFullPage && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex space-x-8 px-6 min-w-max">
          {[
            { id: 'basic', label: 'Basic Info' },
            { id: 'contact', label: 'Contact' },
            { id: 'services', label: 'Services' },
            { id: 'hours', label: 'Hours' },
            { id: 'social', label: 'Social Media' },
            { id: 'images', label: 'Images' },
            { id: 'seo', label: 'SEO' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className={`overflow-y-auto ${isFullPage ? '' : 'max-h-[calc(90vh-200px)]'}`}>
        <form onSubmit={handleSubmit} className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={businessData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={businessData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="business-name-url"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry/Category
                  </label>
                  <input
                    type="text"
                    value={businessData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Restaurant, Retail, Professional Services"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    value={businessData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of your business"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description
                  </label>
                  <textarea
                    value={businessData.long_description}
                    onChange={(e) => handleInputChange('long_description', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed description of your business, services, history, etc."
                  />
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={businessData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={businessData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="contact@business.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={businessData.website_url}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.yourbusiness.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={businessData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={businessData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={businessData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="CA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={businessData.zip_code}
                      onChange={(e) => handleInputChange('zip_code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Services Offered
                  </label>
                  <div className="flex space-x-2 mb-4">
                    <input
                      type="text"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      placeholder="Add a service"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                    />
                    <button
                      type="button"
                      onClick={addService}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="space-y-2">
                    {businessData.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <span>{service}</span>
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Hours Tab */}
            {activeTab === 'hours' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Business Hours
                  </label>
                  <div className="space-y-3">
                    {daysOfWeek.map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-4">
                        <div className="w-24 text-sm font-medium text-gray-700">{label}</div>
                        <input
                          type="text"
                          value={businessData.business_hours[key] || ''}
                          onChange={(e) => handleInputChange('business_hours', {
                            ...businessData.business_hours,
                            [key]: e.target.value
                          })}
                          placeholder="e.g. 9:00 AM - 5:00 PM or Closed"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Social Media Tab */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Media Links
                  </label>
                  <div className="flex space-x-2 mb-4">
                    <select
                      value={newSocialPlatform}
                      onChange={(e) => setNewSocialPlatform(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select platform</option>
                      {socialPlatforms.filter(platform => !businessData.social_links[platform]).map(platform => (
                        <option key={platform} value={platform}>
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="url"
                      value={newSocialUrl}
                      onChange={(e) => setNewSocialUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addSocialLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(businessData.social_links).map(([platform, url]) => (
                      <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <span className="font-medium capitalize">{platform}</span>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:text-blue-800 text-sm">
                            {url}
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSocialLink(platform)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="space-y-8">
                {/* Current Images */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Logo Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Current Logo
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {logoMedia?.file_url ? (
                        <div className="space-y-3">
                          <img 
                            src={logoMedia.file_url} 
                            alt="Current logo" 
                            className="mx-auto max-h-32 max-w-full object-contain rounded-lg shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                          <p className="text-sm text-gray-600">Current Logo</p>
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange('logo', null)
                              setLogoMedia(null)
                            }}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove Logo
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="mx-auto w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Logo</span>
                          </div>
                          <p className="text-sm text-gray-500">No logo selected</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cover Image Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Current Cover Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {coverMedia?.file_url ? (
                        <div className="space-y-3">
                          <img 
                            src={coverMedia.file_url} 
                            alt="Current cover" 
                            className="mx-auto max-h-32 max-w-full object-cover rounded-lg shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                          <p className="text-sm text-gray-600">Current Cover Image</p>
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange('cover_image', null)
                              setCoverMedia(null)
                            }}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove Cover
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="mx-auto w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Cover</span>
                          </div>
                          <p className="text-sm text-gray-500">No cover image selected</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upload New Images */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Upload New Images
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Logo
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleImageUpload(file, 'logo')
                            }
                          }}
                          disabled={uploadingLogo}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className={`flex flex-col items-center justify-center cursor-pointer ${
                            uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {uploadingLogo ? (
                            <>
                              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                              <span className="text-sm text-gray-600">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              <span className="text-sm text-gray-600">Click to upload logo</span>
                              <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Cover Image
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleImageUpload(file, 'cover')
                            }
                          }}
                          disabled={uploadingCover}
                          className="hidden"
                          id="cover-upload"
                        />
                        <label
                          htmlFor="cover-upload"
                          className={`flex flex-col items-center justify-center cursor-pointer ${
                            uploadingCover ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {uploadingCover ? (
                            <>
                              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                              <span className="text-sm text-gray-600">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              <span className="text-sm text-gray-600">Click to upload cover</span>
                              <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Select from Existing Media */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Select from Existing Media
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMediaBrowser(!showMediaBrowser)
                        if (!showMediaBrowser && availableMedia.length === 0) {
                          loadAvailableMedia()
                        }
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {showMediaBrowser ? 'Hide' : 'Browse Media Library'}
                    </button>
                  </div>
                  
                  {showMediaBrowser && (
                    <div className="mt-4">
                      {loadingMedia ? (
                        <div className="text-center py-8">
                          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Loading media...</p>
                        </div>
                      ) : availableMedia.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                          <p className="text-sm text-gray-600">No media found. Upload images above to get started.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
                          {availableMedia.map((media: any) => (
                            <div
                              key={media.id}
                              className="relative group cursor-pointer border-2 border-transparent hover:border-blue-300 rounded-lg overflow-hidden"
                            >
                              <img
                                src={media.file_url}
                                alt={media.alt_text || media.filename}
                                className="w-full h-24 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 space-x-2 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleInputChange('logo', media.id)
                                      setLogoMedia(media)
                                      showSuccess('Logo selected!')
                                    }}
                                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                  >
                                    Use as Logo
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleInputChange('cover_image', media.id)
                                      setCoverMedia(media)
                                      showSuccess('Cover image selected!')
                                    }}
                                    className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                  >
                                    Use as Cover
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

          </form>
        </div>

      {/* Footer */}
      <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {businessId === 'new' ? 'Creating...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {businessId === 'new' ? 'Create Business' : 'Save Changes'}
            </>
          )}
        </button>
      </div>
    </div>
  )

  if (isFullPage) {
    return content
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {content}
    </div>
  )
}