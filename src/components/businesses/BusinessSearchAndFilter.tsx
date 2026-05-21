'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, X, Building2, MapPin, Star } from 'lucide-react'
import { getLogoCardUrl, getMediaCardUrl, ARTICLE_IMAGE_PLACEHOLDER } from '@/lib/image-utils'
import Link from 'next/link'
import Image from 'next/image'
// Using any for now to handle the transformed business data structure
interface BusinessData {
  id: string
  name: string
  slug?: string
  description?: string
  industry?: string
  city?: string
  state?: string
  services?: string[]
  is_verified: boolean
  rating: number
  review_count: number
  logo?: { file_url: string; thumbnail_url?: string; alt_text: string } | null
  cover_image?: { file_url: string; thumbnail_url?: string; alt_text: string } | null
  website_url?: string
  phone?: string
}

interface BusinessSearchAndFilterProps {
  businesses: BusinessData[]
  industries: string[]
}

// Helper function to render stars for rating
function renderStars(rating: number) {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
    )
  }
  
  if (hasHalfStar) {
    stars.push(
      <div key="half" className="relative">
        <Star className="w-4 h-4 text-gray-300" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        </div>
      </div>
    )
  }
  
  const remainingStars = 5 - Math.ceil(rating)
  for (let i = 0; i < remainingStars; i++) {
    stars.push(
      <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
    )
  }
  
  return stars
}

export function BusinessSearchAndFilter({ businesses, industries }: BusinessSearchAndFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Filter businesses based on search term and selected industry
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(business => {
      const matchesSearch = !searchTerm || 
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (business as any).address_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.services?.some(service => 
          service.toLowerCase().includes(searchTerm.toLowerCase())
        )

      const matchesIndustry = !selectedIndustry || business.industry === selectedIndustry

      return matchesSearch && matchesIndustry
    })
  }, [businesses, searchTerm, selectedIndustry])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedIndustry('')
  }

  const hasActiveFilters = searchTerm || selectedIndustry

  return (
    <div className="bg-surface border-b border-border-default">
      <div className="container-wide py-6">
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
            <input
              type="text"
              placeholder="Search businesses by name, description, location, or services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border-default bg-bg text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex items-center space-x-4">
            {/* Industry Filter */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center space-x-2 px-4 py-3 border rounded-lg transition-colors ${
                  selectedIndustry 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-border-default hover:border-neutral-400 text-text'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {selectedIndustry || 'All Industries'}
                </span>
              </button>

              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-surface border border-border-default rounded-lg shadow-lg z-10">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-text mb-3">Filter by Industry</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      <button
                        onClick={() => {
                          setSelectedIndustry('')
                          setIsFilterOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          !selectedIndustry 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'hover:bg-[rgb(var(--color-surface-raised)/0.85)] text-text'
                        }`}
                      >
                        All Industries
                      </button>
                      {industries.map((industry) => (
                        <button
                          key={industry}
                          onClick={() => {
                            setSelectedIndustry(industry)
                            setIsFilterOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                            selectedIndustry === industry 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'hover:bg-[rgb(var(--color-surface-raised)/0.85)] text-text'
                          }`}
                        >
                          {industry}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-text-muted hover:text-text border border-border-default rounded-lg hover:bg-[rgb(var(--color-surface-raised)/0.85)]"
              >
                <X className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-text-muted mb-6">
          <span>
            Showing {filteredBusinesses.length} of {businesses.length} businesses
            {selectedIndustry && (
              <span className="ml-1">in {selectedIndustry}</span>
            )}
          </span>
          
          {hasActiveFilters && (
            <div className="flex items-center space-x-2">
              <span>Filters:</span>
              {searchTerm && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedIndustry && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  Industry: {selectedIndustry}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Filtered Results */}
        {filteredBusinesses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBusinesses.map((business) => (
              <article
                key={business.id}
              className="bg-surface rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-border-default"
              >
                {/* Business Image */}
                <div className="relative h-40 overflow-hidden">
                  {getMediaCardUrl(business.cover_image) ? (
                    <Image
                      src={getMediaCardUrl(business.cover_image)}
                      alt={business.cover_image?.alt_text || business.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-200"
                    />
                  ) : (() => {
                    const logoSrc = getLogoCardUrl(business.logo)
                    return logoSrc && logoSrc !== ARTICLE_IMAGE_PLACEHOLDER ? (
                    <div className="w-full h-full bg-[rgb(var(--color-surface-raised)/0.85)] flex items-center justify-center">
                      <Image
                        src={logoSrc}
                        alt={business.logo?.alt_text || business.name}
                        width={80}
                        height={80}
                        className="object-contain"
                      />
                    </div>
                    ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">
                        {business.name.charAt(0)}
                      </span>
                    </div>
                    )
                  })()}
                  
                  {/* Industry Badge */}
                  {business.industry && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded-full">
                        {business.industry}
                      </span>
                    </div>
                  )}

                  {/* Verification Badge */}
                  {business.is_verified && (
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded-full text-xs font-medium">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Verified</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Business Info */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-text mb-2 line-clamp-1">
                    {business.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center space-x-1">
                      {renderStars(business.rating)}
                    </div>
                    <span className="text-xs text-text-muted">
                      {business.rating.toFixed(1)} ({business.review_count})
                    </span>
                  </div>

                  {/* Description */}
                  {business.description && (
                    <p className="text-text-muted text-sm mb-3 line-clamp-2">
                      {business.description}
                    </p>
                  )}

                  {/* Location */}
                  {business.city && (
                    <div className="flex items-center space-x-1 mb-3">
                      <MapPin className="w-3 h-3 text-text-muted" />
                      <span className="text-xs text-text-muted">
                        {business.city}{business.state ? `, ${business.state}` : ''}
                      </span>
                    </div>
                  )}

                  {/* Services */}
                  {business.services && business.services.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {business.services.slice(0, 2).map((service, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-[rgb(var(--color-surface-raised)/0.85)] text-text-muted text-xs rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                        {business.services.length > 2 && (
                          <span className="px-2 py-1 bg-[rgb(var(--color-surface-raised)/0.85)] text-text-muted text-xs rounded-full">
                            +{business.services.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-3 border-t border-border-default">
                    {business.slug ? (
                      <Link 
                        href={`/businesses/${business.slug}`}
                        className="block w-full text-center px-4 py-2 bg-primary text-[rgb(var(--color-on-accent))] text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
                      >
                        View Details
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between">
                        {business.phone && (
                          <a 
                            href={`tel:${business.phone}`}
                            className="text-sm text-primary hover:opacity-80"
                          >
                            Call Now
                          </a>
                        )}
                        {business.website_url && (
                          <a 
                            href={business.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:opacity-80"
                          >
                            Visit Website
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* No Results */
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-text-muted mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-text mb-4">No Businesses Found</h3>
            <p className="text-text-muted mb-8">
              No businesses match your current search criteria. Try adjusting your filters or search terms.
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-6 py-3 bg-primary text-[rgb(var(--color-on-accent))] font-semibold rounded-lg hover:opacity-90 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Click outside to close filter */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  )
}