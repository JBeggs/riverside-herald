'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage, newsApi } from '@/lib/api'
import { MapPin, Phone, Mail, Globe, Check } from 'lucide-react'

// Custom icons not available in lucide-react
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const ArrowLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

interface BusinessTemplate {
  id: string
  name: string
  category: string
  description: string
  tags: string[]
  sampleServices: string[]
  icon: string
}

const businessTemplates: BusinessTemplate[] = [
  {
    id: 'restaurant',
    name: 'Restaurant',
    category: 'Food & Dining',
    description: 'Full-service restaurant with dine-in experience',
    tags: ['restaurant', 'dining', 'food', 'local'],
    sampleServices: ['Fine Dining', 'Takeout', 'Catering', 'Special Events'],
    icon: '🍽️'
  },
  {
    id: 'cafe',
    name: 'Café',
    category: 'Food & Dining', 
    description: 'Coffee shop and light meals',
    tags: ['cafe', 'coffee', 'breakfast', 'local'],
    sampleServices: ['Coffee & Beverages', 'Light Meals', 'Pastries', 'Wi-Fi'],
    icon: '☕'
  },
  {
    id: 'retail',
    name: 'Retail Store',
    category: 'Retail',
    description: 'Physical retail location',
    tags: ['retail', 'shopping', 'local'],
    sampleServices: ['In-Store Shopping', 'Online Orders', 'Customer Service', 'Returns'],
    icon: '🏪'
  },
  {
    id: 'services',
    name: 'Professional Services',
    category: 'Services',
    description: 'Professional service business',
    tags: ['services', 'professional', 'local'],
    sampleServices: ['Consulting', 'Professional Services', 'Client Support', 'Custom Solutions'],
    icon: '💼'
  },
  {
    id: 'health',
    name: 'Healthcare',
    category: 'Healthcare',
    description: 'Healthcare and wellness services',
    tags: ['healthcare', 'wellness', 'medical', 'local'],
    sampleServices: ['Consultations', 'Treatment', 'Wellness Programs', 'Emergency Care'],
    icon: '🏥'
  },
  {
    id: 'beauty',
    name: 'Beauty & Wellness',
    category: 'Beauty & Wellness',
    description: 'Beauty and personal care services',
    tags: ['beauty', 'wellness', 'personal care', 'local'],
    sampleServices: ['Hair Services', 'Beauty Treatments', 'Wellness Therapy', 'Personal Care'],
    icon: '💅'
  }
]

interface BusinessCreationWizardProps {
  onComplete?: (business: any) => void
  onCancel?: () => void
  inModal?: boolean
}

export default function BusinessCreationWizard({ onComplete, onCancel, inModal = false }: BusinessCreationWizardProps) {
  const router = useRouter()
  const { profile } = useAuth()
  const { showSuccess, showError } = useToast()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<BusinessTemplate | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    tags: [] as string[],
    services: [] as string[],
    hours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '', close: '', closed: true }
    }
  })

  const totalSteps = 4

  const handleTemplateSelect = (template: BusinessTemplate) => {
    setSelectedTemplate(template)
    setFormData(prev => ({
      ...prev,
      category: template.category,
      tags: template.tags,
      services: template.sampleServices,
      description: template.description
    }))
    setStep(2)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTagAdd = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const handleTagRemove = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleServiceAdd = (service: string) => {
    if (service && !formData.services.includes(service)) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, service]
      }))
    }
  }

  const handleServiceRemove = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== service)
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const businessData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        address_street: formData.address,
        address_city: '',
        address_province: '',
        address_postal_code: '',
        address_country: 'ZA',
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        tags: formData.tags,
        services: formData.services,
        hours: formData.hours,
        owner: profile?.user
      }

      const business: any = await newsApi.businesses.create(businessData)
      showSuccess('Business created successfully!')
      
      if (onComplete) {
        onComplete(business)
      } else {
        router.push(`/businesses/${business.slug}`)
      }
    } catch (error: any) {
      console.error('Error creating business:', error)
      showError(getApiErrorMessage(error, 'Failed to create business'))
    } finally {
      setLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
            ${step > index + 1 
              ? 'bg-green-600 text-white' 
              : step === index + 1 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }
          `}>
            {step > index + 1 ? <Check className="w-4 h-4" /> : index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div className={`w-12 h-1 mx-2 ${step > index + 1 ? 'bg-green-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Business Type</h2>
        <p className="text-gray-600">Select a template to get started quickly with pre-configured settings</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businessTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className="p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
          >
            <div className="text-4xl mb-3">{template.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-700">
              {template.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => setStep(2)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Skip template - start from scratch
        </button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Information</h2>
        <p className="text-gray-600">Tell us about your business</p>
      </div>

      {selectedTemplate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{selectedTemplate.icon}</span>
            <div>
              <h3 className="font-semibold text-blue-900">{selectedTemplate.name} Template</h3>
              <p className="text-sm text-blue-700">Pre-filled with common settings for your business type</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your business name"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your business"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select category</option>
            <option value="Food & Dining">Food & Dining</option>
            <option value="Retail">Retail</option>
            <option value="Services">Services</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Beauty & Wellness">Beauty & Wellness</option>
            <option value="Automotive">Automotive</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Education">Education</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Phone number"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Location & Contact</h2>
        <p className="text-gray-600">How can customers reach you?</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Business address"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="contact@business.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://your-website.com"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Services & Details</h2>
        <p className="text-gray-600">What services do you offer?</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Services
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.services.map((service) => (
              <span key={service} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {service}
                <button
                  onClick={() => handleServiceRemove(service)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add a service"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleServiceAdd((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = ''
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement
                handleServiceAdd(input.value)
                input.value = ''
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                {tag}
                <button
                  onClick={() => handleTagRemove(tag)}
                  className="ml-2 text-gray-600 hover:text-gray-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add a tag"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleTagAdd((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = ''
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement
                handleTagAdd(input.value)
                input.value = ''
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNavigationButtons = () => (
    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
      <button
        onClick={() => step > 1 ? setStep(step - 1) : onCancel?.()}
        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{step > 1 ? 'Back' : 'Cancel'}</span>
      </button>

      {step < totalSteps ? (
        <button
          onClick={() => setStep(step + 1)}
          disabled={step === 2 && !formData.name}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={loading || !formData.name}
          className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span>{loading ? 'Creating...' : 'Create Business'}</span>
        </button>
      )}
    </div>
  )

  const containerClasses = inModal
    ? "max-w-2xl mx-auto"
    : "max-w-4xl mx-auto p-6"

  return (
    <div className={containerClasses}>
      {!inModal && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Business</h1>
          <p className="text-gray-600 mt-2">Get your business listed in just a few steps</p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {renderStepIndicator()}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        {renderNavigationButtons()}
      </div>
    </div>
  )
}
