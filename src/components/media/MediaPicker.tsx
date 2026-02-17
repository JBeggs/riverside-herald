'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { newsApi } from '@/lib/api'

export interface MediaItem {
  id: string
  file_url: string
  filename?: string
  original_filename?: string
  alt_text?: string
}

interface MediaPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (media: MediaItem) => void
  title?: string
}

export default function MediaPicker({ isOpen, onClose, onSelect, title = 'Choose image' }: MediaPickerProps) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadMedia()
    }
  }, [isOpen])

  const loadMedia = async () => {
    setLoading(true)
    try {
      const response: any = await newsApi.media.list({ media_type: 'image' })
      const list = Array.isArray(response) ? response : (response?.results || [])
      setMedia(list.map((m: any) => ({
        id: m.id,
        file_url: m.file_url,
        filename: m.filename,
        original_filename: m.original_filename,
        alt_text: m.alt_text,
      })))
    } catch (error) {
      console.error('Error loading media:', error)
      setMedia([])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Loading media...</p>
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600">No images in library. Upload images in Media Library first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {media.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item)
                    onClose()
                  }}
                  className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                >
                  <img
                    src={item.file_url}
                    alt={item.alt_text || item.original_filename || item.filename || 'Media'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                      Select
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
