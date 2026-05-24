'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { newsApi } from '@/lib/api'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Save, Loader2 } from 'lucide-react'
import {
  CUSTOM_CONTACT_EMAIL_SETTING,
  PLATFORM_CONTACT_EMAIL,
  isCustomContactEmailEnabled,
} from '@/lib/platform-contact-email'

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

interface SiteSetting {
  id: string
  key: string
  value: string
  type: string
  description?: string
}

const SETTING_GROUPS: { label: string; keys: { key: string; label: string; placeholder?: string }[] }[] = [
  {
    label: 'General',
    keys: [
      { key: 'site_name', label: 'Site Name', placeholder: 'Your site name' },
      { key: 'site_tagline', label: 'Tagline', placeholder: 'Your Local News Source' },
      { key: 'site_description', label: 'Description', placeholder: 'Your trusted source for local news' },
      { key: 'site_logo', label: 'Logo URL', placeholder: 'https://...' },
    ],
  },
  {
    label: 'Contact',
    keys: [
      { key: 'contact_address', label: 'Address', placeholder: '123 Main Street' },
      { key: 'contact_phone', label: 'Phone', placeholder: '+27 12 345 6789' },
    ],
  },
  {
    label: 'Social',
    keys: [
      { key: 'social_facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
      { key: 'social_twitter', label: 'Twitter/X URL', placeholder: 'https://twitter.com/...' },
      { key: 'social_instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
    ],
  },
]

function canManageSiteSettings(profileRole: string | undefined, isOwner: boolean): boolean {
  return profileRole === 'admin' || isOwner
}

export default function AdminSettingsPage() {
  const { user, profile, loading: authLoading, isCompanyOwner } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<Record<string, SiteSetting>>({})
  const [values, setValues] = useState<Record<string, string>>({})
  const [customContactEmailEnabled, setCustomContactEmailEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (
      !authLoading &&
      (!user || !profile || !canManageSiteSettings(profile.role, isCompanyOwner))
    ) {
      router.push('/dashboard')
    }
  }, [user, profile, authLoading, router, isCompanyOwner])

  useEffect(() => {
    if (profile && canManageSiteSettings(profile.role, isCompanyOwner)) {
      loadSettings()
    }
  }, [profile?.role, isCompanyOwner])

  const loadSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await newsApi.siteSettings.list() as unknown
      const arr = Array.isArray(data) ? data : ((data as { results?: unknown[] })?.results || [])
      const byKey: Record<string, SiteSetting> = {}
      const vals: Record<string, string> = {}
      arr.forEach((s: SiteSetting) => {
        byKey[s.key] = s
        vals[s.key] = s.value ?? ''
      })
      setSettings(byKey)
      setValues(vals)
      setCustomContactEmailEnabled(isCustomContactEmailEnabled(vals))
    } catch (err: unknown) {
      console.error('Error loading settings:', err)
      setError((err as { message?: string })?.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const upsertSetting = async (key: string, value: string, type = 'string', isPublic = true) => {
    const existing = settings[key]
    if (existing) {
      if (existing.value !== value) {
        await newsApi.siteSettings.update(existing.id, {
          key: existing.key,
          value,
          type: existing.type || type,
          description: existing.description ?? '',
          is_public: isPublic,
        })
      }
    } else if (value || type === 'boolean') {
      await newsApi.siteSettings.create({
        key,
        value,
        type,
        description: '',
        is_public: isPublic,
      })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      for (const group of SETTING_GROUPS) {
        for (const { key } of group.keys) {
          await upsertSetting(key, values[key] ?? '')
        }
      }

      const flagValue = customContactEmailEnabled ? 'true' : 'false'
      await upsertSetting(CUSTOM_CONTACT_EMAIL_SETTING, flagValue, 'boolean', false)

      if (customContactEmailEnabled) {
        await upsertSetting('contact_email', values.contact_email ?? '')
      }

      await loadSettings()
    } catch (err: unknown) {
      console.error('Error saving settings:', err)
      setError((err as { message?: string })?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-600">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!user || !profile || !canManageSiteSettings(profile.role, isCompanyOwner)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-4">
            You need admin access or to be the site owner to view this page.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <SettingsIcon className="w-8 h-8" />
              Site Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Configure site name, contact info, and social links
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-8">
            {SETTING_GROUPS.map((group) => (
              <div
                key={group.label}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  {group.label}
                </h2>
                <div className="space-y-4">
                  {group.keys.map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label
                        htmlFor={key}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        {label}
                      </label>
                      <input
                        id={key}
                        type="text"
                        value={values[key] ?? ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  ))}
                  {group.label === 'Contact' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      {!customContactEmailEnabled ? (
                        <>
                          <input
                            type="email"
                            readOnly
                            value={PLATFORM_CONTACT_EMAIL}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Temporary platform contact email shown on your site.
                          </p>
                        </>
                      ) : (
                        <input
                          id="contact_email"
                          type="email"
                          value={values.contact_email ?? ''}
                          onChange={(e) => handleChange('contact_email', e.target.value)}
                          placeholder="hello@example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                      <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customContactEmailEnabled}
                          onChange={(e) => setCustomContactEmailEnabled(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        Use my own contact email
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
