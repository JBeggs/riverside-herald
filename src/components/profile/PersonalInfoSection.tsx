'use client'

import { useState, useRef, useEffect } from 'react'
import { Profile } from '@/lib/types'
import { getApiErrorMessage, newsApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { 
  Edit3, 
  Save, 
  X, 
  Mail, 
  User as UserIcon, 
  Globe, 
  Calendar
} from 'lucide-react'

// User type from API
interface User {
  id: string
  email?: string
  username?: string
}

// Custom SVG icons for missing lucide-react icons
const Camera = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

interface PersonalInfoSectionProps {
  user: User
  profile: Profile
}

export default function PersonalInfoSection({ user, profile }: PersonalInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    full_name: profile.full_name || '',
    username: profile.username || '',
    bio: profile.bio || '',
    avatar_url: profile.avatar_url || '',
    social_links: profile.social_links || {}
  })
  const { refreshProfile } = useAuth()
  const { showError } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update form data when profile prop changes (e.g. after refreshProfile)
  useEffect(() => {
    setFormData({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      full_name: profile.full_name || '',
      username: profile.username || '',
      bio: profile.bio || '',
      avatar_url: profile.avatar_url || '',
      social_links: profile.social_links || {}
    })
  }, [profile])

  const handleSave = async () => {
    setLoading(true)

    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.first_name} ${formData.last_name}`.trim(),
        username: formData.username,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
        social_links: formData.social_links,
      }
      console.log('[DEBUG] Saving profile with payload:', payload)
      await newsApi.profile.update(payload)

      await refreshProfile()
      setIsEditing(false)
    } catch (error: any) {
      console.error('Error updating profile:', error)
      showError(getApiErrorMessage(error, 'Failed to update profile. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      full_name: profile.full_name || '',
      username: profile.username || '',
      bio: profile.bio || '',
      avatar_url: profile.avatar_url || '',
      social_links: profile.social_links || {}
    })
    setIsEditing(false)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      showError('Please upload a JPG, PNG, or GIF image.')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      showError('Image size must be less than 5MB.')
      return
    }

    setUploading(true)

    try {
      // Upload avatar using API
      const mediaData = await newsApi.media.upload(file, {
        media_type: 'image',
        alt_text: `Avatar for ${formData.full_name || user.email}`
      }) as { file_url: string }

      // Update form data with new avatar URL
      setFormData(prev => ({
        ...prev,
        avatar_url: mediaData.file_url
      }))

    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      showError(getApiErrorMessage(error, 'Failed to upload image. Please try again.'))
    } finally {
      setUploading(false)
    }
  }

  const handleChangePhoto = () => {
    fileInputRef.current?.click()
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Personal Information</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Picture */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          {(formData.avatar_url || profile.avatar_url) ? (
            <img 
              src={formData.avatar_url || profile.avatar_url} 
              alt="Profile" 
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-300 shadow-sm">
              <UserIcon className="w-10 h-10 text-gray-500" />
            </div>
          )}
          <div className="flex flex-col items-center sm:items-start">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button 
              onClick={handleChangePhoto}
              disabled={uploading}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : 'Change Photo'}</span>
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center sm:text-left">
              JPG, PNG or GIF. Max size 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your first name"
            />
          ) : (
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <UserIcon className="w-4 h-4 text-gray-500" />
              <span className="text-gray-900">{profile.first_name || 'Not provided'}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your last name"
            />
          ) : (
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <UserIcon className="w-4 h-4 text-gray-500" />
              <span className="text-gray-900">{profile.last_name || 'Not provided'}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Choose a username"
            />
          ) : (
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-500">@</span>
              <span className="text-gray-900">{profile.username || 'Not set'}</span>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-gray-900">{user.email}</span>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
              Cannot be changed
            </span>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg min-h-[80px]">
              <p className="text-gray-900">{profile.bio || 'No bio provided'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Social Links */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['twitter', 'linkedin', 'instagram', 'website'].map((platform) => (
            <div key={platform}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {platform}
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.social_links[platform] || ''}
                  onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Your ${platform} URL`}
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Globe className="w-4 h-4 text-gray-500" />
                  {formData.social_links[platform] ? (
                    <a 
                      href={formData.social_links[platform]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 truncate"
                    >
                      {formData.social_links[platform]}
                    </a>
                  ) : (
                    <span className="text-gray-500">Not provided</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Since
            </label>
            <div className="flex items-center space-x-2 p-3 bg-white rounded-lg">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-900">{formatDate(profile.created_at)}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Updated
            </label>
            <div className="flex items-center space-x-2 p-3 bg-white rounded-lg">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-900">{formatDate(profile.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
