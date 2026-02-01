'use client'

import Link from 'next/link'
import { Profile } from '@/lib/types'
import { 
  User, 
  FileText, 
  Building2, 
  Globe,
  Mail
} from 'lucide-react'

// Custom SVG icons for missing lucide-react icons
const PlusCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Tag = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
)

const LayoutDashboard = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
)

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 4.197a4 4 0 11-3-6.943 4 4 0 013 6.943z" />
  </svg>
)

// Custom SVG icons for missing lucide-react icons
const Shield = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 4.197a4 4 0 11-3-6.943 4 4 0 013 6.943z" />
  </svg>
)

const Settings = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const BarChart3 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v8m-6 0h6m6 0v2m0-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2z" />
    <rect x="3" y="12" width="4" height="8" rx="1" />
    <rect x="10" y="8" width="4" height="12" rx="1" />
    <rect x="17" y="4" width="4" height="16" rx="1" />
  </svg>
)

const AlertTriangle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)

const Crown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 16l3-8 5.5 3 3.5-6 1 16H4l1-5z" />
  </svg>
)

const Database = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
)

const Megaphone = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h1a1 1 0 011 1v2h3a1 1 0 011 1v6a1 1 0 01-1 1H9v3a1 1 0 01-1 1H7a1 1 0 01-1-1v-3H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 8.5l7-3v13l-7-3" />
  </svg>
)

interface AdminSectionProps {
  profile: Profile
  systemStats?: {
    totalArticles: number
    totalUsers: number
    totalBusinesses: number
  }
}

export default function AdminSection({ profile, systemStats }: AdminSectionProps) {
  const adminTools = [
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'blue'
    },
    {
      title: 'Content Management',
      description: 'Review, edit, and manage articles',
      icon: FileText,
      href: '/admin/articles',
      color: 'green'
    },
    {
      title: 'Business Directory',
      description: 'Manage business listings and verifications',
      icon: Building2,
      href: '/admin/businesses',
      color: 'purple'
    },
    {
      title: 'Site Settings',
      description: 'Configure global site settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'gray'
    },
    {
      title: 'Analytics',
      description: 'View site traffic and performance metrics',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'yellow'
    },
    {
      title: 'Newsletter',
      description: 'Manage newsletter campaigns and subscribers',
      icon: Mail,
      href: '/admin/newsletter',
      color: 'indigo'
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      gray: 'bg-gray-100 text-gray-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      indigo: 'bg-indigo-100 text-indigo-600'
    }
    return colorMap[color] || 'bg-gray-100 text-gray-600'
  }

  const canAccess = (tool: string) => {
    if (profile.role === 'admin') return true
    if (profile.role === 'editor') {
      return ['Content Management', 'Analytics', 'Newsletter'].includes(tool)
    }
    return false
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
        <Shield className="w-8 h-8 text-yellow-600" />
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Administration Panel</h2>
          <p className="text-sm text-gray-600">
            {profile.role === 'admin' ? 'Full system administration access' : 'Content management access'}
          </p>
        </div>
      </div>

      {/* System Overview */}
      {systemStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-600">{systemStats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="p-2 md:p-3 bg-blue-100 rounded-full">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">Total Articles</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600">{systemStats.totalArticles.toLocaleString()}</p>
              </div>
              <div className="p-2 md:p-3 bg-green-100 rounded-full">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">Total Businesses</p>
                <p className="text-2xl md:text-3xl font-bold text-purple-600">{systemStats.totalBusinesses.toLocaleString()}</p>
              </div>
              <div className="p-2 md:p-3 bg-purple-100 rounded-full">
                <Building2 className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center">
          <PlusCircle className="w-5 h-5 mr-2 text-blue-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Link
            href="/admin/articles/add"
            className="group flex flex-col p-4 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 hover:border-blue-200 transition-all min-h-[110px]"
          >
            <div className="p-2 bg-blue-500 text-white rounded-lg w-fit mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-bold text-blue-900 text-sm md:text-base">New Article</span>
            <span className="text-[10px] md:text-xs text-blue-700 mt-0.5">Create and publish news</span>
          </Link>

          <Link
            href="/admin/businesses/add"
            className="group flex flex-col p-4 bg-green-50 border border-green-100 rounded-xl hover:bg-green-100 hover:border-green-200 transition-all min-h-[110px]"
          >
            <div className="p-2 bg-green-500 text-white rounded-lg w-fit mb-2 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-green-900 text-sm md:text-base">Add Business</span>
            <span className="text-[10px] md:text-xs text-green-700 mt-0.5">Register local business</span>
          </Link>

          <Link
            href="/admin/articles?status=pending"
            className="group flex flex-col p-4 bg-orange-50 border border-orange-100 rounded-xl hover:bg-orange-100 hover:border-orange-200 transition-all min-h-[110px]"
          >
            <div className="p-2 bg-orange-500 text-white rounded-lg w-fit mb-2 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-orange-900 text-sm md:text-base">Review Content</span>
            <span className="text-[10px] md:text-xs text-orange-700 mt-0.5">Approve pending drafts</span>
          </Link>

          <Link
            href="/admin/categories"
            className="group flex flex-col p-4 bg-yellow-50 border border-yellow-100 rounded-xl hover:bg-yellow-100 hover:border-yellow-200 transition-all min-h-[110px]"
          >
            <div className="p-2 bg-yellow-500 text-white rounded-lg w-fit mb-2 group-hover:scale-110 transition-transform">
              <Tag className="w-5 h-5" />
            </div>
            <span className="font-bold text-yellow-900 text-sm md:text-base">Categories</span>
            <span className="text-[10px] md:text-xs text-yellow-700 mt-0.5">Manage article topics</span>
          </Link>

          <Link
            href="/admin/users"
            className="group flex flex-col p-4 bg-purple-50 border border-purple-100 rounded-xl hover:bg-purple-100 hover:border-purple-200 transition-all min-h-[110px]"
          >
            <div className="p-2 bg-purple-500 text-white rounded-lg w-fit mb-2 group-hover:scale-110 transition-transform">
              <UsersIcon className="w-5 h-5" />
            </div>
            <span className="font-bold text-purple-900 text-sm md:text-base">Manage Roles</span>
            <span className="text-[10px] md:text-xs text-purple-700 mt-0.5">Update user permissions</span>
          </Link>
        </div>
      </div>

      {/* Admin Tools */}
      <div>
        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-6 flex items-center">
          <LayoutDashboard className="w-5 h-5 mr-2 text-gray-600" />
          System Modules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {adminTools.map((tool) => {
            const Icon = tool.icon
            const canAccessTool = canAccess(tool.title)
            
            return (
              <div key={tool.title} className="relative">
                {canAccessTool ? (
                  <Link
                    href={tool.href}
                    className="block p-4 md:p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-gray-300 transition-all min-h-[80px] md:min-h-[100px]"
                  >
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className={`p-2 md:p-3 rounded-full flex-shrink-0 ${getColorClasses(tool.color)}`}>
                        <Icon className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base md:text-lg font-semibold text-gray-900 truncate">{tool.title}</h4>
                        <p className="text-xs md:text-sm text-gray-600 mt-0.5 line-clamp-1 md:line-clamp-none">{tool.description}</p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="relative p-4 md:p-6 bg-gray-50 border border-gray-200 rounded-lg opacity-50 min-h-[80px] md:min-h-[100px]">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className={`p-2 md:p-3 rounded-full flex-shrink-0 ${getColorClasses(tool.color)}`}>
                        <Icon className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base md:text-lg font-semibold text-gray-900 truncate">{tool.title}</h4>
                        <p className="text-xs md:text-sm text-gray-600 mt-0.5 line-clamp-1 md:line-clamp-none">{tool.description}</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <Shield className="w-4 h-4" />
                        <span>Admin only</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 rounded-full">
            <Database className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-green-900">System Status</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-800">Database: Operational</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-800">API: Healthy</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-800">Storage: Available</span>
          </div>
        </div>
      </div>

      {/* Admin Resources */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">📚 Admin Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Documentation</h4>
            <ul className="space-y-1 text-blue-700">
              <li>
                <Link href="/docs/USER_ROLES_GUIDE.md" className="hover:underline flex items-center">
                  <FileText className="w-3 h-3 mr-1" />
                  User Roles Guide
                </Link>
              </li>
              <li>• Content Moderation Policies</li>
              <li>• Site Configuration Manual</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Support</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Technical Support</li>
              <li>• Community Guidelines</li>
              <li>• Best Practices</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
