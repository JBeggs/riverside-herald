'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { FileText, Trash2, Search } from 'lucide-react'

const ImageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)
import { newsApi } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/contexts/ConfirmDialogContext'

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

interface MediaLibraryProps {
  profile: any
}

interface MediaFile {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
  uploadedBy?: string
}

function mapApiMediaToFile(media: any): MediaFile {
  return {
    id: media.id,
    name: media.original_filename || media.filename || 'Unknown',
    type: media.mime_type || 'application/octet-stream',
    size: media.file_size || 0,
    url: media.file_url || '',
    uploadedAt: media.created_at || new Date().toISOString(),
    uploadedBy: media.uploaded_by_name,
  }
}

export default function MediaLibrary({ profile }: MediaLibraryProps) {
  const { showError, showSuccess } = useToast()
  const { confirm } = useConfirm()
  const isBusinessOwner = profile?.role === 'business_owner'
  const [ownerTab, setOwnerTab] = useState<'shared' | 'private'>('shared')
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadMedia = useCallback(async () => {
    setLoading(true)
    try {
      const params: { media_type: string; is_public?: boolean } = { media_type: 'image' }
      if (isBusinessOwner) {
        params.is_public = ownerTab === 'shared'
      }
      const response: any = await newsApi.media.list(params)
      const list = Array.isArray(response) ? response : (response?.results || [])
      setFiles(list.map(mapApiMediaToFile))
    } catch (error: any) {
      console.error('Error loading media:', error)
      showError(error?.message || error?.details?.message || 'Failed to load media library')
      setFiles([])
    } finally {
      setLoading(false)
    }
  }, [isBusinessOwner, ownerTab, showError])

  useEffect(() => {
    loadMedia()
  }, [loadMedia])

  const allowUpload = !isBusinessOwner || ownerTab === 'private'

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles || selectedFiles.length === 0) return
    if (isBusinessOwner && ownerTab === 'shared') return

    setUploading(true)
    let successCount = 0
    let failCount = 0

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        if (!file.type.startsWith('image/')) {
          showError(`Skipping ${file.name}: not an image`)
          failCount++
          continue
        }
        if (file.size > 10 * 1024 * 1024) {
          showError(`Skipping ${file.name}: file too large (max 10MB)`)
          failCount++
          continue
        }
        try {
          const payload: Record<string, string> = {
            media_type: 'image',
            alt_text: file.name,
          }
          if (isBusinessOwner && ownerTab === 'private') {
            payload.is_public = 'false'
          }
          const mediaData = await newsApi.media.upload(file, payload) as any
          setFiles(prev => [mapApiMediaToFile(mediaData), ...prev])
          successCount++
        } catch (err: any) {
          console.error(`Upload failed for ${file.name}:`, err)
          failCount++
        }
      }

      if (successCount > 0) {
        showSuccess(`${successCount} file(s) uploaded successfully`)
      }
      if (failCount > 0) {
        showError(`${failCount} file(s) failed to upload`)
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      showError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (fileId: string) => {
    if (isBusinessOwner) return
    const ok = await confirm({
      message: 'Are you sure you want to delete this file? It may be in use by articles or businesses.',
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (!ok) return

    try {
      await newsApi.media.delete(fileId)
      setFiles(prev => prev.filter(file => file.id !== fileId))
      showSuccess('File deleted')
    } catch (error: any) {
      console.error('Error deleting file:', error)
      showError(error?.message || error?.details?.message || 'Failed to delete file')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    return type.startsWith('image/') ? (
      <ImageIcon className="w-5 h-5 text-blue-500" />
    ) : (
      <FileText className="w-5 h-5" />
    )
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const emptyTitle = (() => {
    if (searchQuery) return 'No files found'
    if (isBusinessOwner && ownerTab === 'shared') return 'No shared images yet'
    if (isBusinessOwner && ownerTab === 'private') return 'No private images yet'
    return 'No files uploaded yet'
  })()

  const emptySubtitle = (() => {
    if (searchQuery) return 'Try adjusting your search terms'
    if (isBusinessOwner && ownerTab === 'shared') {
      return 'Shared images are managed by the news team. You can still use them when editing content. Switch to “My private images” to upload your own.'
    }
    if (isBusinessOwner && ownerTab === 'private') {
      return 'Upload images below. Only you can see them in this folder; they will appear when you pick from the media library.'
    }
    return 'Upload your first image above to get started'
  })()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-1">
            {isBusinessOwner
              ? 'Browse shared images or upload private images only you can use.'
              : 'Upload and manage images for articles and businesses'}
          </p>
        </div>
        {allowUpload ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Plus className="w-5 h-5" />
            )}
            <span>{uploading ? 'Uploading...' : 'Upload Files'}</span>
          </button>
        ) : null}
      </div>

      {isBusinessOwner ? (
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1">
          <button
            type="button"
            onClick={() => setOwnerTab('shared')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              ownerTab === 'shared'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Shared library
          </button>
          <button
            type="button"
            onClick={() => setOwnerTab('private')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              ownerTab === 'private'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            My private images
          </button>
        </div>
      ) : null}

      {/* Upload Area */}
      {allowUpload ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
            }}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isBusinessOwner && ownerTab === 'private' ? 'Upload private images' : 'Upload Images'}
            </h3>
            <p className="text-gray-600 mb-4">
              {isBusinessOwner && ownerTab === 'private'
                ? 'These images are visible only to you in this library. They are not shared with everyone by default.'
                : 'Click to browse or drag and drop. Images are saved to the library and can be used in articles and business profiles.'}
            </p>
            <p className="text-sm text-gray-500">
              Supported: JPG, PNG, GIF, WebP (max 10MB each)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*"
          />
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-gray-700 text-sm">
          <p className="font-medium text-gray-900 mb-1">Shared library is read-only</p>
          <p>
            You can view and open shared images to use in your content. New shared assets are added by the editorial team.
            Switch to <strong>My private images</strong> to upload your own files.
          </p>
        </div>
      )}

      {/* Search and Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Files Display */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading media...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {emptyTitle}
            </h3>
            <p className="text-gray-600">
              {emptySubtitle}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredFiles.map((file) => (
              <div key={file.id} className="group relative bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="aspect-square bg-white rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="text-gray-400">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 text-xs"
                      title="View"
                    >
                      View
                    </a>
                    {!isBusinessOwner ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(file.id)}
                        className="p-1 bg-white border border-gray-200 rounded shadow-sm hover:bg-red-50 hover:border-red-200"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="text-gray-400">
                    {getFileIcon(file.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
                    title="View"
                  >
                    View
                  </a>
                  {!isBusinessOwner ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(file.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Media Library Tips</h3>
        {isBusinessOwner ? (
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You cannot delete shared media; contact the news team if something must be removed.</li>
            <li>• Use “My private images” for personal uploads that only you will see in the library list.</li>
            <li>• Use “Browse Media Library” in editors to pick both shared and your private images.</li>
          </ul>
        ) : (
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload images here to use them in articles and business profiles</li>
            <li>• Use the &quot;Browse Media Library&quot; option when editing articles or businesses to select existing images</li>
            <li>• Optimize images for web to reduce file sizes and improve load times</li>
          </ul>
        )}
      </div>
    </div>
  )
}
