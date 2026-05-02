import { serverNewsApi } from '@/lib/api-server'
import FooterClient from './FooterClient'
import {
  parseSiteSettingsRows,
  stringFromMap,
  parseSocialLinksJson,
  parseServicesLinksJson,
} from '@/lib/site-settings'

const DEFAULT_MENU = [
  { title: 'Articles', href: '/articles' },
  { title: 'Businesses', href: '/businesses' },
  { title: 'Testing', href: '/testing' },
]

const DEFAULT_SERVICES = [
  { label: 'Features & Registration', href: '/features' },
  { label: 'Advertise With Us', href: '/advertise' },
  { label: 'Newsletter', href: '/newsletter' },
  { label: 'Submit a Story', href: '/submit-story' },
  { label: 'Careers', href: '/careers' },
]

async function getFooterData() {
  try {
    const settingsData: unknown = await serverNewsApi.siteSettings.list()
    const settingsMap = parseSiteSettingsRows(settingsData)

    const siteName = stringFromMap(settingsMap, 'site_name') || 'News'
    const description =
      stringFromMap(settingsMap, 'site_description') || 'Your trusted source for local news'

    const contact = {
      address:
        stringFromMap(settingsMap, 'physical_address') ||
        stringFromMap(settingsMap, 'contact_address'),
      phone: stringFromMap(settingsMap, 'contact_phone'),
      email: stringFromMap(settingsMap, 'contact_email'),
    }

    const socialLinks = parseSocialLinksJson(settingsMap)
    const legacySocial =
      socialLinks.length > 0
        ? socialLinks
        : [
            stringFromMap(settingsMap, 'social_facebook')
              ? { platform: 'facebook', label: 'Facebook', url: stringFromMap(settingsMap, 'social_facebook') }
              : null,
            stringFromMap(settingsMap, 'social_twitter')
              ? { platform: 'twitter', label: 'Twitter', url: stringFromMap(settingsMap, 'social_twitter') }
              : null,
            stringFromMap(settingsMap, 'social_instagram')
              ? { platform: 'instagram', label: 'Instagram', url: stringFromMap(settingsMap, 'social_instagram') }
              : null,
          ].filter(Boolean) as { platform?: string; label: string; url: string }[]

    const servicesLinks = parseServicesLinksJson(settingsMap)
    const services = servicesLinks.length > 0 ? servicesLinks : DEFAULT_SERVICES

    return {
      siteName,
      description,
      contact,
      socialLinks: legacySocial,
      servicesLinks: services,
      menuItems: DEFAULT_MENU,
    }
  } catch (error) {
    console.error('Error fetching footer data:', error)
    return {
      siteName: 'News',
      description: 'Your trusted source for local news',
      contact: { address: '', phone: '', email: '' },
      socialLinks: [] as { platform?: string; label: string; url: string }[],
      servicesLinks: DEFAULT_SERVICES,
      menuItems: DEFAULT_MENU,
    }
  }
}

export async function Footer() {
  const data = await getFooterData()

  return <FooterClient {...data} />
}
