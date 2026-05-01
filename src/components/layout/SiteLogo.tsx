'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'

type SiteLogoProps = {
  src: string
  alt: string
}

/**
 * Header logo: 2× size on homepage (`/`) only; default size elsewhere.
 */
export function SiteLogo({ src, alt }: SiteLogoProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const remote = src.startsWith('http')

  if (isHome) {
    return (
      <Image
        src={src}
        alt={alt}
        width={400}
        height={96}
        className="h-24 w-auto object-contain"
        priority
        unoptimized={remote}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={200}
      height={48}
      className="h-12 w-auto object-contain"
      priority
      unoptimized={remote}
    />
  )
}
