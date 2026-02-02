'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  FileText, 
  Building2, 
  TrendingUp,
  Eye,
  Clock,
  Star,
  CheckCircle2,
  AlertCircle,
  Target,
  Lightbulb
} from 'lucide-react'
import ArticleCard from '@/components/ui/ArticleCard'

// Custom icons not available in lucide-react
const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

interface DashboardOverviewProps {
  profile: any
  stats?: any
  recentArticles: any[]
}

export default function DashboardOverview({ profile, stats, recentArticles }: DashboardOverviewProps) {
  const [dismissedOnboarding, setDismissedOnboarding] = useState(false)
  const [hasBusinessProfile, setHasBusinessProfile] = useState(false) // This should come from props/API
  
  const isAdmin = profile?.role === 'admin'
  const isEditor = profile?.role === 'editor'
  const isAuthor = profile?.role === 'author'
  const isBusinessOwner = profile?.role === 'business_owner'
  const isSubscriber = !isAdmin && !isEditor && !isAuthor && !isBusinessOwner
  
  // Filter articles to only show user's articles if they're author or business_owner
  const filteredArticles = (isAuthor || isBusinessOwner) && profile?.user
    ? recentArticles.filter((article: any) => article.author === profile.user || article.author_id === profile.user)
    : recentArticles

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  // Business Owner Onboarding Component
  const BusinessOwnerOnboarding = () => {
    if (dismissedOnboarding || hasBusinessProfile) return null
    
    return (
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <Star className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Welcome to Your Business Dashboard!</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Get started by creating your business profile and publishing your first article to reach local customers.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Create Business Profile</h4>
                  <p className="text-sm text-gray-600">Set up your business listing with contact info and services</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Write Your First Article</h4>
                  <p className="text-sm text-gray-600">Share news, promotions, or valuable content with your audience</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Link
                href="/businesses/create"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Building2 className="w-5 h-5" />
                <span>Create Business Profile</span>
              </Link>
              <Link
                href="/admin/articles/add"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FileText className="w-5 h-5" />
                <span>Write Article</span>
              </Link>
            </div>
          </div>
          <button
            onClick={() => setDismissedOnboarding(true)}
            className="text-gray-400 hover:text-gray-600 ml-4"
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Role-specific Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isBusinessOwner ? 'Business Dashboard' : 
             isAdmin ? 'Admin Dashboard' :
             isEditor ? 'Editor Dashboard' :
             isAuthor ? 'Content Dashboard' :
             'Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isBusinessOwner ? `Manage your business and content, ${profile?.first_name || 'Business Owner'}` :
             isAdmin ? 'System overview and management' :
             isEditor ? 'Content moderation and platform overview' :
             isAuthor ? `Welcome back, ${profile?.first_name || 'Author'}!` :
             `Welcome back, ${profile?.first_name || profile?.full_name || profile?.email || 'User'}!`}
          </p>
        </div>
        
        {/* Role-specific Quick Actions */}
        <div className="flex items-center space-x-3">
          {isBusinessOwner && !hasBusinessProfile && (
            <Link
              href="/businesses/create"
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
            >
              <Building2 className="w-5 h-5" />
              <span>Create Business</span>
            </Link>
          )}
          
          {(isBusinessOwner || isAuthor || isEditor || isAdmin) && (
            <Link
              href="/admin/articles/add"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>{isBusinessOwner ? 'Create Article' : 'New Article'}</span>
            </Link>
          )}
        </div>
      </div>
      
      {/* Business Owner Onboarding */}
      {isBusinessOwner && <BusinessOwnerOnboarding />}

      {/* Role-specific Stats Grid */}
      {isBusinessOwner && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Articles</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {filteredArticles.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Link
              href="/admin/articles"
              className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-flex items-center"
            >
              Manage content <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Business Profile</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {hasBusinessProfile ? 'Active' : 'Not Created'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${hasBusinessProfile ? 'bg-green-100' : 'bg-orange-100'}`}>
                <Building2 className={`w-6 h-6 ${hasBusinessProfile ? 'text-green-600' : 'text-orange-600'}`} />
              </div>
            </div>
            <Link
              href={hasBusinessProfile ? "/businesses" : "/businesses/create"}
              className={`text-sm mt-4 inline-flex items-center ${hasBusinessProfile ? 'text-green-600 hover:text-green-700' : 'text-orange-600 hover:text-orange-700'}`}
            >
              {hasBusinessProfile ? 'View profile' : 'Create now'} <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {filteredArticles.reduce((sum: number, article: any) => sum + (article.views || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <Link
              href="/admin/analytics"
              className="text-sm text-purple-600 hover:text-purple-700 mt-4 inline-flex items-center"
            >
              View analytics <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      )}
      
      {(isAdmin || isEditor) && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Articles</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalArticles?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Link
              href="/admin/articles"
              className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-flex items-center"
            >
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalUsers?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            {isAdmin && (
              <Link
                href="/admin/users"
                className="text-sm text-green-600 hover:text-green-700 mt-4 inline-flex items-center"
              >
                Manage users <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalBusinesses?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <Link
              href="/admin/businesses"
              className="text-sm text-purple-600 hover:text-purple-700 mt-4 inline-flex items-center"
            >
              View directory <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      )}

      {isAuthor && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Articles</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{filteredArticles.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Link
              href="/admin/articles"
              className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-flex items-center"
            >
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {filteredArticles.filter((a: any) => a.status === 'published').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {filteredArticles.reduce((sum: number, article: any) => sum + (article.views || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Growth Tips for Business Owners */}
      {isBusinessOwner && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-3">Business Growth Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <h4 className="font-medium mb-2">Content Ideas:</h4>
                  <ul className="space-y-1">
                    <li>• Write about your services and expertise</li>
                    <li>• Share customer success stories</li>
                    <li>• Announce special offers and events</li>
                    <li>• Show behind-the-scenes content</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Engagement Tips:</h4>
                  <ul className="space-y-1">
                    <li>• Post regularly to stay visible</li>
                    <li>• Include local keywords and references</li>
                    <li>• Add photos to your articles</li>
                    <li>• Respond to community feedback</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Articles with Enhanced Cards */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {isBusinessOwner ? 'My Articles' : 
             isAuthor ? 'My Recent Articles' :
             'Recent Articles'}
          </h2>
          {filteredArticles.length > 0 && (
            <Link
              href="/admin/articles"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all articles →
            </Link>
          )}
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isBusinessOwner ? 'Start creating content for your business' :
               isAuthor ? 'Ready to share your first article?' :
               'No articles yet'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {isBusinessOwner ? 'Attract customers by sharing articles about your services, expertise, and community involvement.' :
               isAuthor ? 'Share your knowledge, stories, and expertise with the community.' :
               'Articles will appear here once created.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3">
              {isBusinessOwner && !hasBusinessProfile && (
                <Link
                  href="/businesses/create"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Building2 className="w-5 h-5" />
                  <span>Create Business First</span>
                </Link>
              )}
              <Link
                href="/admin/articles/add"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Article</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.slice(0, 3).map((article: any) => (
              <ArticleCard
                key={article.id}
                article={article}
                profile={profile}
                onEdit={(article) => window.location.href = `/admin/articles/${article.slug || article.id}`}
                onDelete={async (id) => {
                  // This would typically call an API to delete
                  console.log('Delete article:', id)
                }}
                onDuplicate={(article) => {
                  // Navigate to create page with prefilled data
                  console.log('Duplicate article:', article)
                }}
                onPromote={(article) => {
                  // Business owner promotion features
                  console.log('Promote article:', article)
                }}
                compact={true}
                className="hover:shadow-sm"
              />
            ))}
            
            {filteredArticles.length > 3 && (
              <div className="text-center pt-4 border-t border-gray-100">
                <Link
                  href="/admin/articles"
                  className="inline-flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  <span>View {filteredArticles.length - 3} more articles</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

