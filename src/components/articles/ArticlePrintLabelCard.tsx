'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import {
  labelAccentSoft,
  labelTypeScale,
  ARTICLE_PRINT_LABEL_CSS,
  type LabelPaperSize,
  type ArticlePrintLabelData,
} from '@/lib/article-print-label'

type ArticlePrintLabelCardProps = ArticlePrintLabelData & {
  paperSize?: LabelPaperSize
  thermalMode?: boolean
  previewWidth?: string
}

const LOW_RES_TARGET_WIDTH = 384

function isVectorSource(src: string): boolean {
  return /\.svg\b/i.test(src) || /image\/svg/i.test(src)
}

function downscaleToDataUrl(src: string, targetWidth: number): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const w = Math.min(targetWidth, img.naturalWidth || targetWidth)
        const scale = w / (img.naturalWidth || w)
        const h = Math.max(1, Math.round((img.naturalHeight || w) * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/png')
        resolve(dataUrl.startsWith('data:image') ? dataUrl : null)
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = src
  })
}

export default function ArticlePrintLabelCard({
  companyName,
  tagline,
  accent,
  logoSrc,
  articleTitle,
  blurb,
  contentExcerpt,
  imageSrc,
  articleUrl,
  authorName,
  publishedLabel,
  paperSize = '80mm',
  thermalMode = true,
  previewWidth = '80mm',
}: ArticlePrintLabelCardProps) {
  const [qrSvg, setQrSvg] = useState('')
  const [lowResImage, setLowResImage] = useState(imageSrc)
  const [lowResLogo, setLowResLogo] = useState(logoSrc)

  useEffect(() => {
    let cancelled = false
    void QRCode.toString(articleUrl, {
      type: 'svg',
      width: 180,
      margin: 1,
      errorCorrectionLevel: 'M',
    }).then((svg) => {
      if (!cancelled) setQrSvg(svg)
    })
    return () => {
      cancelled = true
    }
  }, [articleUrl])

  useEffect(() => {
    let cancelled = false
    setLowResImage(imageSrc)
    if (!imageSrc || isVectorSource(imageSrc)) return
    void downscaleToDataUrl(imageSrc, LOW_RES_TARGET_WIDTH).then((dataUrl) => {
      if (!cancelled && dataUrl) setLowResImage(dataUrl)
    })
    return () => {
      cancelled = true
    }
  }, [imageSrc])

  useEffect(() => {
    let cancelled = false
    setLowResLogo(logoSrc)
    if (!logoSrc || isVectorSource(logoSrc)) return
    void downscaleToDataUrl(logoSrc, LOW_RES_TARGET_WIDTH).then((dataUrl) => {
      if (!cancelled && dataUrl) setLowResLogo(dataUrl)
    })
    return () => {
      cancelled = true
    }
  }, [logoSrc])

  const soft = labelAccentSoft(accent)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ARTICLE_PRINT_LABEL_CSS }} />
      <div
        className="article-print-label-root mx-auto"
        data-thermal={thermalMode ? 'true' : 'false'}
        data-paper={paperSize}
        style={
          {
            '--label-accent': accent,
            '--label-accent-soft': soft,
            '--label-type-scale': labelTypeScale(paperSize),
            maxWidth: previewWidth,
            width: '100%',
          } as React.CSSProperties
        }
      >
        <div className="label">
          <div className="card">
            <section className="page page-brand">
              <div className="header">
                {lowResLogo ? <img className="logo" src={lowResLogo} alt={companyName} /> : null}
                <p className="brand-name">{companyName}</p>
                {tagline ? <p className="brand-tagline">{tagline}</p> : null}
              </div>
              {lowResImage ? (
                <div className="body">
                  <div className="photo-frame">
                    <img className="article-image" src={lowResImage} alt="" />
                  </div>
                </div>
              ) : null}
              {authorName || publishedLabel ? (
                <div className="meta">
                  {authorName ? (
                    <div className="meta-row">
                      <span className="meta-label">Author</span>
                      <span className="meta-value">{authorName}</span>
                    </div>
                  ) : null}
                  {publishedLabel ? (
                    <div className="meta-row">
                      <span className="meta-label">Published</span>
                      <span className="meta-value">{publishedLabel}</span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>

            <section className="page page-article">
              <div className="body">
                <h1>{articleTitle}</h1>
                {blurb ? <p className="desc">{blurb}</p> : null}
                {contentExcerpt ? <p className="content-excerpt">{contentExcerpt}</p> : null}
              </div>
            </section>

            <section className="page page-qr">
              <div className="footer">
                <div className="scan-label">Scan to read online</div>
                {qrSvg ? (
                  <div className="qr" role="img" aria-label="QR code" dangerouslySetInnerHTML={{ __html: qrSvg }} />
                ) : (
                  <div className="qr" aria-hidden="true" />
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
