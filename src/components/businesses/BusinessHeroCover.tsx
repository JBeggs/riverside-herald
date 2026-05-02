'use client'

import SafeImage from '@/components/ui/SafeImage'

/** Full-bleed cover inside a `relative` sized parent (`absolute inset-0`). */
export default function BusinessHeroCover({ src }: { src: string }) {
  return (
    <div className="absolute inset-0">
      <SafeImage src={src} alt="" fill loading="eager" imgClassName="object-cover" />
    </div>
  )
}
