'use client'

import { useState, useEffect } from 'react'
// User type from API
interface User {
  id: string
  email?: string
  username?: string
  first_name?: string
  last_name?: string
}
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Profile } from '@/lib/types'
import { 
  User as UserIcon, 
  FileText, 
  Building2, 
  Bell,
  Edit3,
  Mail,
  Phone,
  MapPin,
  Globe,
  TrendingUp,
  Star
} from 'lucide-react'

// Custom SVG icons for missing lucide-react icons
const Settings = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const Crown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 16l3-8 5.5 3 3.5-6 1 16H4l1-5z" />
  </svg>
)

const Shield = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 4.197a4 4 0 11-3-6.943 4 4 0 013 6.943z" />
  </svg>
)

const Award = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="7" />
    <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" />
  </svg>
)
import PersonalInfoSection from './PersonalInfoSection'
import AuthorDashboard from './AuthorDashboard'
import BusinessOwnerSection from './BusinessOwnerSection'
import AdminSection from './AdminSection'
import SubscriberSection from './SubscriberSection'
import NotificationSettings from './NotificationSettings'

interface ProfilePageProps {
  user: User
  profile: Profile | null
  additionalData: {
    articles?: any[]
    ownedBusinesses?: any[]
    systemStats?: {
      totalArticles: number
      totalUsers: number
      totalBusinesses: number
    }
  }
}

type TabType = 'personal' | 'content' | 'businesses' | 'admin' | 'subscriber' | 'notifications'

export default function ProfilePage({ user: initialUser, profile: initialProfile, additionalData }: ProfilePageProps) {
  const router = useRouter()
  const { profile: authProfile, user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('personal')

  // Use auth profile if available, otherwise fallback to initial data from server
  const profile = authProfile || initialProfile
  const user = authUser || initialUser

  console.log('[DEBUG] ProfilePage rendering with profile:', {
    user: profile?.user,
    first_name: profile?.first_name,
    last_name: profile?.last_name,
    full_name: profile?.full_name
  })

  if (!profile) {
    return (
      <div className="container-wide py-8">
        <div className="text-center">
          <p className="text-gray-600">Profile not found. Please contact support.</p>
        </div>
      </div>
    )
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-5 h-5 text-yellow-600" />
      case 'editor':
        return <Edit3 className="w-5 h-5 text-blue-600" />
      case 'author':
        return <FileText className="w-5 h-5 text-green-600" />
      case 'premium_subscriber':
        return <Star className="w-5 h-5 text-purple-600" />
      case 'subscriber':
        return <Award className="w-5 h-5 text-gray-600" />
      default:
        return <UserIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'editor':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'author':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'premium_subscriber':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'subscriber':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300'
    }
  }

  const tabs = [
    { id: 'personal' as TabType, label: 'Personal Info', icon: UserIcon },
    ...(profile.role === 'author' || profile.role === 'admin' || profile.role === 'editor' || profile.role === 'business_owner' 
        ? [{ id: 'content' as TabType, label: 'My Content', icon: FileText }] 
        : []),
    ...(additionalData.ownedBusinesses && additionalData.ownedBusinesses.length > 0 
        ? [{ id: 'businesses' as TabType, label: 'My Businesses', icon: Building2 }] 
        : []),
    ...(profile.role === 'admin' || profile.role === 'editor' 
        ? [{ id: 'admin' as TabType, label: 'Administration', icon: Shield }] 
        : []),
    ...(profile.role === 'subscriber' || profile.role === 'premium_subscriber' 
        ? [{ id: 'subscriber' as TabType, label: 'Subscription', icon: Crown }] 
        : []),
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="container-wide py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name || 'Profile'} 
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-100 shadow-sm">
                  <UserIcon className="w-12 h-12 text-gray-500" />
                </div>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2 space-y-2 sm:space-y-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                  {profile.first_name || profile.last_name 
                    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
                    : profile.full_name || 'Anonymous User'}
                </h1>
                <div className="flex justify-center sm:justify-start">
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border text-sm font-medium ${getRoleColor(profile.role)}`}>
                    {getRoleIcon(profile.role)}
                    <span className="capitalize">
                      {profile.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {profile.is_verified && (
                  <div className="flex justify-center sm:justify-start">
                    <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      <Shield className="w-3 h-3" />
                      <span>Verified</span>
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 mb-2 break-all">{user.email}</p>
              
              {profile.bio && (
                <p className="text-gray-700 max-w-2xl mx-auto sm:mx-0">{profile.bio}</p>
              )}
              
              {profile.username && (
                <p className="text-sm text-gray-500 mt-2">@{profile.username}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'personal' && (
            <PersonalInfoSection user={user} profile={profile} />
          )}
          
          {activeTab === 'content' && (
            <AuthorDashboard 
              articles={additionalData.articles || []} 
              profile={profile}
              onNewArticle={() => router.push('/admin/articles/add')}
            />
          )}
          
          {activeTab === 'businesses' && (
            <BusinessOwnerSection 
              businesses={additionalData.ownedBusinesses || []} 
              profile={profile}
            />
          )}
          
          {activeTab === 'admin' && (
            <AdminSection 
              profile={profile}
              systemStats={additionalData.systemStats}
            />
          )}
          
          {activeTab === 'subscriber' && (
            <SubscriberSection profile={profile} />
          )}
          
          {activeTab === 'notifications' && (
            <NotificationSettings profile={profile} />
          )}
        </div>
      </div>
    </div>
  )
}