'use client'

import { useState, useRef, useEffect } from 'react'
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

export default function MediaLibrary({ profile: _profile }: MediaLibraryProps) {
  const { showError, showSuccess } = useToast()
  const { confirm } = useConfirm()
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadMedia = async () => {
    setLoading(true)
    try {
      const response: any = await newsApi.media.list({ media_type: 'image' })
      const list = Array.isArray(response) ? response : (response?.results || [])
      setFiles(list.map(mapApiMediaToFile))
    } catch (error: any) {
      console.error('Error loading media:', error)
      showError(error?.message || error?.details?.message || 'Failed to load media library')
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMedia()
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

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
          const mediaData = await newsApi.media.upload(file, {
            media_type: 'image',
            alt_text: file.name,
          }) as any
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-1">Upload and manage images for articles and businesses</p>
        </div>
        <button
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
      </div>

      {/* Upload Area */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Images</h3>
          <p className="text-gray-600 mb-4">
            Click to browse or drag and drop. Images are saved to the library and can be used in articles and business profiles.
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
              {searchQuery ? 'No files found' : 'No files uploaded yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search terms' : 'Upload your first image above to get started'}
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
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-1 bg-white border border-gray-200 rounded shadow-sm hover:bg-red-50 hover:border-red-200"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
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
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Media Library Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload images here to use them in articles and business profiles</li>
          <li>• Use the &quot;Browse Media Library&quot; option when editing articles or businesses to select existing images</li>
          <li>• Optimize images for web to reduce file sizes and improve load times</li>
        </ul>
      </div>
    </div>
  )
}
