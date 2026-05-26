import { NextRequest } from 'next/server'
import { GET_fromSrcParam } from '@/lib/fetch-proxied-media'
import { MEDIA_PROXY_CACHE_PAGE } from '@/lib/media-proxy'

/** Proxies Django /media/* through the site origin for share sheets and caching. */
export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get('src')
  return GET_fromSrcParam(src, MEDIA_PROXY_CACHE_PAGE)
}
