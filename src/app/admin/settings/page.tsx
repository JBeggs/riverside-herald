'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { newsApi } from '@/lib/api'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Settings, Save, Loader2 } from 'lucide-react'

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
      { key: 'site_name', label: 'Site Name', placeholder: 'The Riverside Herald' },
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
      { key: 'contact_email', label: 'Email', placeholder: 'hello@example.com' },
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

export default function AdminSettingsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<Record<string, SiteSetting>>({})
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || !profile || profile.role !== 'admin')) {
      router.push('/dashboard')
    }
  }, [user, profile, authLoading, router])

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadSettings()
    }
  }, [profile?.role])

  const loadSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      const data: any = await newsApi.siteSettings.list()
      const arr = Array.isArray(data) ? data : (data?.results || [])
      const byKey: Record<string, SiteSetting> = {}
      const vals: Record<string, string> = {}
      arr.forEach((s: SiteSetting) => {
        byKey[s.key] = s
        vals[s.key] = s.value ?? ''
      })
      setSettings(byKey)
      setValues(vals)
    } catch (err: any) {
      console.error('Error loading settings:', err)
      setError(err?.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      for (const group of SETTING_GROUPS) {
        for (const { key } of group.keys) {
          const newVal = values[key] ?? ''
          const existing = settings[key]
          if (existing) {
            if (existing.value !== newVal) {
              await newsApi.siteSettings.update(existing.id, {
                key: existing.key,
                value: newVal,
                type: existing.type || 'string',
                description: existing.description ?? '',
                is_public: true,
              })
            }
          } else if (newVal) {
            await newsApi.siteSettings.create({
              key,
              value: newVal,
              type: 'string',
              description: '',
              is_public: true,
            })
          }
        }
      }
      await loadSettings()
    } catch (err: any) {
      console.error('Error saving settings:', err)
      setError(err?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !profile) return null

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-8 h-8" />
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
