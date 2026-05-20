'use client'

import Link from 'next/link'
import { FileText } from 'lucide-react'
import { useCompany } from '@/contexts/CompanyContext'

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

export function RegistrationButtons() {
  const { name: siteName } = useCompany()
  return (
    <>
      <div className="card-elevated p-8 border-2 border-green-100 hover:border-green-300 transition-colors">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="heading-md text-gray-900">Regular User Account</h3>
        </div>

        <p className="body-lg text-gray-700 mb-6">
          Perfect for readers who want to stay informed, engage with content, and be part of the community.
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold text-gray-900">Free Registration</p>
              <p className="text-sm text-gray-600">No company name required - just your personal details</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold text-gray-900">Connected to {siteName}</p>
              <p className="text-sm text-gray-600">Automatically connected to our main platform</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold text-gray-900">Access All Content</p>
              <p className="text-sm text-gray-600">Read articles, browse businesses, and engage with the community</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold text-gray-900">User Profile</p>
              <p className="text-sm text-gray-600">Create your profile with role: User, Subscriber, or Premium Subscriber</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>How it works:</strong> Sign up with your email, password, name, and cellphone. Choose Author unless you
            are registering a business.
          </p>
        </div>

        <Link href="/register?type=user" className="btn btn-primary w-full inline-flex items-center justify-center" data-cy="signup-user-button">
          Sign Up as User
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      <div className="card-elevated p-8 border-2 border-purple-100 hover:border-purple-300 transition-colors">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="heading-md text-gray-900">Author Account</h3>
        </div>

        <p className="body-lg text-gray-700 mb-6">
          Perfect for content creators who want to write articles, share stories, and contribute to the platform.
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold text-gray-900">Create Articles</p>
              <p className="text-sm text-gray-600">Write and publish your own articles</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold text-gray-900">Author Role</p>
              <p className="text-sm text-gray-600">Automatically assigned author role for content creation</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold text-gray-900">Manage Your Content</p>
              <p className="text-sm text-gray-600">Edit your own articles and view your own drafts</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold text-gray-900">Track Performance</p>
              <p className="text-sm text-gray-600">Monitor views, likes, and engagement on your articles</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>How it works:</strong> Open the registration page, choose <strong>Author</strong>, and complete the form
            (including cellphone).
          </p>
        </div>

        <Link href="/register?type=author" className="btn btn-primary w-full inline-flex items-center justify-center">
          Sign Up as Author
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      <div className="card-elevated p-8 border-2 border-blue-100 hover:border-blue-300 transition-colors">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="heading-md text-gray-900">Business Owner Account</h3>
        </div>

        <p className="body-lg text-gray-700 mb-6">
          Ideal for businesses that want to create a listing, manage content, and connect with local customers.
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold text-gray-900">Create Your Company</p>
              <p className="text-sm text-gray-600">Register with your company name and business details</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold text-gray-900">Own Your Business Listing</p>
              <p className="text-sm text-gray-600">Create and manage your business profile on the platform</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold text-gray-900">Content Management</p>
              <p className="text-sm text-gray-600">Create articles, manage your business information, and engage with customers</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold text-gray-900">Author Role</p>
              <p className="text-sm text-gray-600">Automatically assigned author role for content creation</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>How it works:</strong> Register with your email, password, name, company name, and cellphone. Your
            business will be created and you&apos;ll be set up as the owner.
          </p>
        </div>

        <Link href="/register?type=business_owner" className="btn btn-primary w-full inline-flex items-center justify-center">
          Register Your Business
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </>
  )
}
