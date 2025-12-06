import { serverNewsApi } from '@/lib/api-server'
import FooterClient from './FooterClient'

async function getFooterData() {
  try {
    // Get site settings for footer content
    const settingsData = await serverNewsApi.siteSettings.list()
    const settingsArray = Array.isArray(settingsData) ? settingsData : (settingsData?.results || [])
    const settingsMap: Record<string, any> = {}
    
    settingsArray.forEach((setting: any) => {
      try {
        settingsMap[setting.key] = setting.type === 'json' 
          ? JSON.parse(setting.value) 
          : setting.value
      } catch {
        settingsMap[setting.key] = setting.value
      }
    })

    // For now, use hardcoded menu items (menus table not in news app yet)
    const menuItems = [
      { title: 'Articles', href: '/articles' },
      { title: 'Businesses', href: '/businesses' },
    ]

    return {
      siteName: settingsMap.site_name || 'The Riverside Herald',
      description: settingsMap.site_description || 'Your trusted source for local news',
      contact: {
        address: settingsMap.contact_address || '',
        phone: settingsMap.contact_phone || '',
        email: settingsMap.contact_email || ''
      },
      social: {
        facebook: settingsMap.social_facebook || '',
        twitter: settingsMap.social_twitter || '',
        instagram: settingsMap.social_instagram || ''
      },
      menuItems
    }
  } catch (error) {
    console.error('Error fetching footer data:', error)
    return {
      siteName: 'The Riverside Herald',
      description: 'Your trusted source for local news',
      contact: {
        address: '',
        phone: '',
        email: ''
      },
      social: {
        facebook: '',
        twitter: '',
        instagram: ''
      },
      menuItems: [
        { title: 'Articles', href: '/articles' },
        { title: 'Businesses', href: '/businesses' },
      ]
    }
  }
}

export async function Footer() {
  const { siteName, description, contact, social, menuItems } = await getFooterData()
  
  return (
    <FooterClient siteName={siteName} description={description} contact={contact} social={social} menuItems={menuItems} />
  )
}
