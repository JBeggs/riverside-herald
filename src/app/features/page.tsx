import type { Metadata } from 'next'
import Link from 'next/link'
import { 
  UserPlus, 
  Building2, 
  FileText, 
  Search, 
  Bell, 
  CheckCircle
} from 'lucide-react'
import { RegistrationButtons } from '@/components/features/RegistrationButtons'

// Custom icon component for missing lucide-react icon
const MessageSquare = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

export const metadata: Metadata = {
  title: 'Features & Registration | The Riverside Herald',
  description: 'Learn about The Riverside Herald platform features and how to register as a user or business owner.',
}

export default function FeaturesPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-green-50 via-blue-50 to-white">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="heading-xl mb-4 text-gray-900">
              Welcome to The Riverside Herald
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your local news platform connecting communities, businesses, and readers
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/" className="btn btn-primary">
                Explore Articles
              </Link>
              <Link href="#registration" className="btn btn-secondary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Types */}
      <section id="registration" className="py-16 bg-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="heading-lg mb-4 text-gray-900">Choose Your Account Type</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We offer two types of accounts to suit your needs. Select the one that fits you best.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <RegistrationButtons />
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 bg-gray-50">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="heading-lg mb-4 text-gray-900">Platform Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover everything The Riverside Herald has to offer
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* News & Articles */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="heading-sm mb-2 text-gray-900">News & Articles</h3>
              <p className="body-sm text-gray-600">
                Stay informed with local news, breaking stories, and in-depth articles. Browse by category, 
                search for topics, and discover trending content.
              </p>
            </div>

            {/* Business Directory */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="heading-sm mb-2 text-gray-900">Business Directory</h3>
              <p className="body-sm text-gray-600">
                Explore local businesses, read reviews, and find services in your area. Business owners can 
                create listings and manage their profiles.
              </p>
            </div>

            {/* User Profiles */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="heading-sm mb-2 text-gray-900">User Profiles</h3>
              <p className="body-sm text-gray-600">
                Create your profile, customize your preferences, and track your reading history. 
                Different roles available: User, Subscriber, Premium Subscriber, Author, Editor, and Admin.
              </p>
            </div>

            {/* Content Management */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="heading-sm mb-2 text-gray-900">Content Management</h3>
              <p className="body-sm text-gray-600">
                Authors and editors can create, edit, and publish articles. Rich text editor with 
                media support, categories, tags, and scheduling options.
              </p>
            </div>

            {/* Search & Discovery */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="heading-sm mb-2 text-gray-900">Search & Discovery</h3>
              <p className="body-sm text-gray-600">
                Powerful search functionality to find articles, businesses, and content. Filter by 
                category, location, date, and more.
              </p>
            </div>

            {/* Comments & Engagement */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="heading-sm mb-2 text-gray-900">Comments & Engagement</h3>
              <p className="body-sm text-gray-600">
                Engage with content through comments, share articles, and interact with the community. 
                Moderation tools available for content creators.
              </p>
            </div>

            {/* Notifications */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="heading-sm mb-2 text-gray-900">Notifications</h3>
              <p className="body-sm text-gray-600">
                Stay updated with notifications for new articles, comments, business updates, and 
                important announcements.
              </p>
            </div>

            {/* Security & Privacy */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="heading-sm mb-2 text-gray-900">Security & Privacy</h3>
              <p className="body-sm text-gray-600">
                Secure authentication, data protection, and privacy controls. Your information is 
                safe and you control what's shared.
              </p>
            </div>

            {/* Customization */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="heading-sm mb-2 text-gray-900">Customization</h3>
              <p className="body-sm text-gray-600">
                Customize your experience with preferences, reading settings, and notification 
                preferences. Make the platform work for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="heading-lg mb-4 text-gray-900">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started is simple. Follow these steps to join The Riverside Herald community.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="heading-sm mb-2 text-gray-900">Choose Your Account Type</h3>
                  <p className="body-sm text-gray-600 mb-4">
                    Decide whether you want a regular user account (for reading and engaging) or a business 
                    owner account (for managing a business listing and creating content).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="heading-sm mb-2 text-gray-900">Sign Up</h3>
                  <p className="body-sm text-gray-600 mb-4">
                    <strong>Regular Users:</strong> Enter your email, password, and full name. Leave the company 
                    name field blank. You'll be automatically connected to The Riverside Herald.
                  </p>
                  <p className="body-sm text-gray-600">
                    <strong>Business Owners:</strong> Enter your email, password, full name, and company name. 
                    Your business will be created and you'll be set as the owner.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="heading-sm mb-2 text-gray-900">Account Activation</h3>
                  <p className="body-sm text-gray-600 mb-4">
                    <strong>Regular Users:</strong> Your account is activated immediately. You can start reading 
                    and engaging right away.
                  </p>
                  <p className="body-sm text-gray-600">
                    <strong>Business Owners:</strong> Your account will be pending approval. Our team will review 
                    your registration and activate it. You'll be notified once approved.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="heading-sm mb-2 text-gray-900">Start Using the Platform</h3>
                  <p className="body-sm text-gray-600">
                    Once logged in, you can browse articles, explore businesses, create content (if you're an author), 
                    manage your profile, and engage with the community. Your news profile is automatically created 
                    with the appropriate role and permissions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Roles */}
      <section className="py-16 bg-gray-50">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="heading-lg mb-4 text-gray-900">User Roles & Permissions</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Different roles provide different levels of access and functionality
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="card p-6">
              <h3 className="heading-sm mb-2 text-gray-900">User</h3>
              <p className="body-sm text-gray-600 mb-4">Default role for regular users. Can read published articles and engage with content.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Read published articles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Comment on articles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Browse businesses</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Search and discover content</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Manage profile and preferences</span>
                </li>
              </ul>
            </div>

            <div className="card p-6">
              <h3 className="heading-sm mb-2 text-gray-900">Subscriber</h3>
              <p className="body-sm text-gray-600 mb-4">Enhanced access for subscribers. Additional features and content.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>All User features</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Premium content access</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Newsletter subscription</span>
                </li>
              </ul>
            </div>

            <div className="card p-6">
              <h3 className="heading-sm mb-2 text-gray-900">Premium Subscriber</h3>
              <p className="body-sm text-gray-600 mb-4">Full access to all content and exclusive features.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>All Subscriber features</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Exclusive articles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Ad-free experience</span>
                </li>
              </ul>
            </div>

            <div className="card p-6">
              <h3 className="heading-sm mb-2 text-gray-900">Author</h3>
              <p className="body-sm text-gray-600 mb-4">Content creators who can write and publish articles. Authors can only see and edit their own drafts.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>All User features</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Create and publish articles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Edit own articles (including drafts)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>View own draft articles only</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Upload media and images</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Track article performance</span>
                </li>
              </ul>
            </div>

            <div className="card p-6">
              <h3 className="heading-sm mb-2 text-gray-900">Editor</h3>
              <p className="body-sm text-gray-600 mb-4">Content managers who can edit all articles and manage content across the platform. Can view all drafts.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>All Author features</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Edit all articles (including drafts)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>View all drafts from all authors</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Manage categories & tags</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Moderate comments</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Access dashboard statistics</span>
                </li>
              </ul>
            </div>

            <div className="card p-6">
              <h3 className="heading-sm mb-2 text-gray-900">Admin</h3>
              <p className="body-sm text-gray-600 mb-4">Full platform access and management capabilities. Complete control over all features.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>All Editor features</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>View all drafts and articles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Manage users & roles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Site settings & configuration</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Platform administration</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>System statistics & analytics</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="heading-lg mb-4 text-white">Ready to Get Started?</h2>
            <p className="text-xl text-green-50 mb-8">
              Join The Riverside Herald community today. Whether you're a reader or a business owner, 
              we have the perfect account type for you.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/" className="btn bg-white text-green-600 hover:bg-gray-100">
                Sign Up Now
                <span className="ml-2">→</span>
              </Link>
              <Link href="/articles" className="btn bg-transparent border-2 border-white text-white hover:bg-white/10">
                Browse Articles
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

