'use client'

import { useState } from 'react'
import { Building2, FileText, Lightbulb, Star, ArrowRight } from 'lucide-react'

interface ArticleTemplate {
  id: string
  title: string
  description: string
  category: string
  template: string
  icon: string
  tags: string[]
}

const businessArticleTemplates: ArticleTemplate[] = [
  {
    id: 'service-spotlight',
    title: 'Service Spotlight',
    description: 'Highlight a specific service or product offering',
    category: 'promotional',
    icon: '⭐',
    tags: ['services', 'business', 'promotional'],
    template: `# Spotlight: [Service/Product Name]

## What makes this special?

[Describe what makes this service or product unique and valuable to customers]

## How it helps our customers

[Share specific benefits and outcomes customers can expect]

## Customer story

[Include a brief testimonial or success story if available]

## Ready to learn more?

[Include a call-to-action with contact information or how to book/purchase]

---
*[Your Business Name] - [Your tagline or key message]*`
  },
  {
    id: 'behind-the-scenes',
    title: 'Behind the Scenes',
    description: 'Share the story behind your business and team',
    category: 'story',
    icon: '👥',
    tags: ['story', 'team', 'behind-the-scenes'],
    template: `# Behind the Scenes at [Your Business Name]

## Our story

[Share how your business started and what drives you]

## Meet the team

[Introduce key team members and their expertise]

## Our process

[Give readers insight into how you work and what sets you apart]

## What's next?

[Share upcoming projects, goals, or exciting developments]

---
*Get to know us better - visit [Your Business Name] at [location/website]*`
  },
  {
    id: 'community-involvement',
    title: 'Community Involvement',
    description: 'Share your business\' community activities and values',
    category: 'community',
    icon: '🤝',
    tags: ['community', 'values', 'local'],
    template: `# [Your Business Name] in the Community

## Our commitment

[Explain your business's commitment to the local community]

## Recent community activities

[Describe recent events, sponsorships, or volunteer work]

## Impact we're making

[Share specific examples of how your involvement benefits the community]

## Get involved

[Invite readers to participate in community activities or support local causes]

---
*[Your Business Name] - Proud to be part of the [City/Area] community*`
  },
  {
    id: 'seasonal-promotion',
    title: 'Seasonal Promotion',
    description: 'Announce special offers and seasonal services',
    category: 'promotional',
    icon: '🎉',
    tags: ['promotion', 'seasonal', 'offers'],
    template: `# [Season/Holiday] Special at [Your Business Name]

## Limited-time offer

[Describe your special promotion or seasonal service]

## What's included

[List specific benefits, discounts, or add-ons]

## Why now is the perfect time

[Explain the seasonal relevance and urgency]

## How to take advantage

[Clear instructions on how customers can redeem the offer]

**Valid until [date]** - Don't miss out!

---
*Contact [Your Business Name]: [phone] | [email] | [address]*`
  },
  {
    id: 'customer-success',
    title: 'Customer Success Story',
    description: 'Feature a customer testimonial or case study',
    category: 'testimonial',
    icon: '💬',
    tags: ['testimonial', 'success', 'customer'],
    template: `# Customer Success: [Project/Service Name]

## The challenge

[Describe the customer's initial problem or need]

## Our solution

[Explain how your business addressed their needs]

## The results

[Share specific outcomes and benefits the customer experienced]

## Customer feedback

> "[Include a direct quote from the satisfied customer]"
> 
> — [Customer name, title/role if relevant]

## Ready for similar results?

[Invite readers to contact you for similar services]

---
*[Your Business Name] - Creating success stories every day*`
  },
  {
    id: 'educational-tips',
    title: 'Educational Tips & Advice',
    description: 'Share expertise and helpful information',
    category: 'educational',
    icon: '📚',
    tags: ['tips', 'advice', 'educational'],
    template: `# [Topic]: Expert Tips from [Your Business Name]

## Why this matters

[Explain why this topic is important for your audience]

## Key tips

### Tip 1: [Title]
[Detailed explanation]

### Tip 2: [Title]
[Detailed explanation]

### Tip 3: [Title]
[Detailed explanation]

## Common mistakes to avoid

[List 2-3 common pitfalls related to your topic]

## When to seek professional help

[Explain when readers should consider using your services]

---
*Need personalized advice? Contact [Your Business Name] at [contact info]*`
  }
]

interface BusinessLinkedArticleCreatorProps {
  onTemplateSelect: (template: ArticleTemplate) => void
  onSkip: () => void
  businessProfile?: any
}

export default function BusinessLinkedArticleCreator({ 
  onTemplateSelect, 
  onSkip,
  businessProfile 
}: BusinessLinkedArticleCreatorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'All Templates', icon: '📋' },
    { id: 'promotional', name: 'Promotional', icon: '🎯' },
    { id: 'story', name: 'Story & Team', icon: '👥' },
    { id: 'community', name: 'Community', icon: '🤝' },
    { id: 'testimonial', name: 'Testimonials', icon: '💬' },
    { id: 'educational', name: 'Educational', icon: '📚' }
  ]

  const filteredTemplates = selectedCategory === 'all' 
    ? businessArticleTemplates 
    : businessArticleTemplates.filter(t => t.category === selectedCategory)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Business Article</h1>
            <p className="text-gray-600">
              {businessProfile ? 
                `Create content for ${businessProfile.name}` :
                'Choose a template to create engaging content for your business'
              }
            </p>
          </div>
        </div>
        
        {businessProfile && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="font-medium text-green-900">Linked to {businessProfile.name}</h3>
                <p className="text-sm text-green-700">
                  This article will automatically be associated with your business profile
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose a category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                p-3 rounded-lg text-center text-sm font-medium transition-colors border
                ${selectedCategory === category.id
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              <div className="text-2xl mb-1">{category.icon}</div>
              <div>{category.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Article Templates</h2>
          <button
            onClick={onSkip}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            Skip templates - start from scratch
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{template.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => onTemplateSelect(template)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <span>Use This Template</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Growth Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Lightbulb className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-3">Business Article Best Practices</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Content Tips:</h4>
                <ul className="space-y-1">
                  <li>• Focus on customer benefits</li>
                  <li>• Use local keywords and references</li>
                  <li>• Include clear calls-to-action</li>
                  <li>• Add personal stories and experiences</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Engagement Tips:</h4>
                <ul className="space-y-1">
                  <li>• Post regularly to stay visible</li>
                  <li>• Share articles on social media</li>
                  <li>• Respond to comments and questions</li>
                  <li>• Include relevant photos when possible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { businessArticleTemplates }
export type { ArticleTemplate }