'use client'

import {
  useCallback,
  useLayoutEffect,
  useState,
  type CSSProperties,
} from 'react'

type SafeImageProps = {
  src: string
  alt?: string
  className?: string
  imgClassName?: string
  style?: CSSProperties
  /** fill parent (parent must be position: relative with size) */
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'auto' | 'sync'
  onLoad?: () => void
}

const PLACEHOLDER = '/image-placeholder.png'

/**
 * Hide image until loaded so alt text never flashes; skeleton beneath.
 * Native <img> avoids Next image optimizer timeouts on slow API hosts.
 */
export default function SafeImage({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  style,
  fill,
  width,
  height,
  sizes,
  loading = 'lazy',
  decoding = 'async',
  onLoad,
}: SafeImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src || PLACEHOLDER)

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const el = e.currentTarget
      if (el.complete && el.naturalHeight > 0) {
        setLoaded(true)
        onLoad?.()
      }
    },
    [onLoad],
  )

  const handleError = useCallback(() => {
    setCurrentSrc(PLACEHOLDER)
    setLoaded(true)
    onLoad?.()
  }, [onLoad])

  useLayoutEffect(() => {
    setCurrentSrc(src || PLACEHOLDER)
    setLoaded(false)
  }, [src])

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    const img = new window.Image()
    img.src = currentSrc
    if (img.complete && img.naturalHeight > 0) {
      setLoaded(true)
    }
  }, [currentSrc])

  const wrapperClass = [
    fill ? 'absolute inset-0 overflow-hidden' : 'relative overflow-hidden',
    'bg-[rgb(var(--color-surface-raised)/0.85)]',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const imageClass = [
    'transition-opacity duration-200',
    loaded ? 'opacity-100' : 'opacity-0',
    fill ? 'absolute inset-0 h-full w-full object-cover' : '',
    imgClassName,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={wrapperClass}
      style={style}
      aria-busy={!loaded}
      data-loaded={loaded}
    >
      {!loaded ? (
        <span
          className="absolute inset-0 animate-pulse bg-[rgb(var(--color-border)/0.35)]"
          aria-hidden
        />
      ) : null}
      <img
        src={currentSrc}
        alt={alt}
        className={imageClass}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        loading={loading}
        decoding={decoding}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}
