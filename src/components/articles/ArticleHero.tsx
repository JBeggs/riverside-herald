'use client'

import SafeImage from '@/components/ui/SafeImage'

export function ArticleHero({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-full overflow-hidden rounded-xl bg-neutral-200 md:rounded-2xl">
      <SafeImage
        src={src}
        alt={alt}
        width={1200}
        height={630}
        className="w-full rounded-xl md:rounded-2xl"
        imgClassName="mx-auto block h-auto max-h-[min(70vh,560px)] w-full object-contain"
        loading="eager"
        decoding="sync"
      />
    </div>
  )
}
