'use client'

import SafeImage from '@/components/ui/SafeImage'

export function ArticleHero({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-xl md:rounded-2xl overflow-hidden bg-neutral-200">
      <SafeImage
        src={src}
        alt={alt}
        fill
        className="rounded-xl md:rounded-2xl"
        imgClassName="object-cover"
        loading="eager"
        decoding="sync"
      />
    </div>
  )
}
