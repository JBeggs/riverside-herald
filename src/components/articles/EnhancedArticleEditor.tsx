'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import {
  Edit3, Save, X, Loader2, Calendar, Search
} from 'lucide-react'

// Custom icons not available in lucide-react
const Trash2 = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const Upload = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const ImageIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const AlertTriangle = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
)

const Zap = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const Settings = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const Hash = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
  </svg>
)

const Plus = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

const ChevronLeft = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const ChevronRight = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)
import { newsApi, apiClient } from '@/lib/api'
import {
  toLocalDateTimeInput,
  nowLocalDateTimeInput,
  parseLocalDateTimeToIso,
} from '@/lib/date-utils'

interface Category {
  id: string
  name: string
  slug: string
  color: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

interface ArticleEditorProps {
  article: {
    id: string
    title: string
    slug?: string
    subtitle?: string
    content: string
    excerpt?: string
    featured_image_url?: string
    featured_media?: {
      id: string
      file_url: string
    } | null
    featured_media_id?: string
    author_id: string
    category?: {
      id: string
      name: string
      slug: string
      color: string
    }
    category_id?: string
    status: string
    content_type?: string
    is_premium?: boolean
    is_breaking_news?: boolean
    is_trending?: boolean
    seo_title?: string
    seo_description?: string
    published_at?: string
    scheduled_for?: string
    location_name?: string
    read_time_minutes?: number
  }
  onSave?: (newArticle?: any) => void
  onCancel?: () => void
  inModal?: boolean // If true, don't render the fixed overlay
}

type EditorStep = 'basic' | 'content' | 'media' | 'settings' | 'seo' | 'research' | 'publish'

export default function EnhancedArticleEditor({ article, onSave, onCancel, inModal = false }: ArticleEditorProps) {
  const { user, profile, isCompanyOwner } = useAuth()
  const { showError, showSuccess } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryFileInputRef = useRef<HTMLInputElement>(null)
  
  // If inModal, always start in editing mode (don't show "Edit Article" button)
  // Otherwise, only start in editing mode for new articles
  const [isEditing, setIsEditing] = useState(inModal || article.id === 'new')
  const [currentStep, setCurrentStep] = useState<EditorStep>('basic')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [researchBrief, setResearchBrief] = useState('')
  const [researchTextOnly, setResearchTextOnly] = useState(false)
  const [researchInfo, setResearchInfo] = useState<Record<string, unknown> | null>(null)
  const [researchPoll, setResearchPoll] = useState(false)
  const [isStartingResearch, setIsStartingResearch] = useState(false)
  const [isStoppingResearch, setIsStoppingResearch] = useState(false)
  const [heroImageMode, setHeroImageMode] = useState<'generate' | 'gallery'>('generate')
  const [heroGalleryMediaId, setHeroGalleryMediaId] = useState('')
  const [isUpdatingHeroImage, setIsUpdatingHeroImage] = useState(false)
  const [isRegeneratingHero, setIsRegeneratingHero] = useState(false)
  const [isGeneratingGallery, setIsGeneratingGallery] = useState(false)
  const [isSyncingCursorGallery, setIsSyncingCursorGallery] = useState(false)
  const prevHeroJobRef = useRef(false)
  const prevGalleryJobRef = useRef(false)
  
  const canManageArticleResearch = Boolean(profile?.role === 'admin' || isCompanyOwner)
  // Data states
  const [categories, setCategories] = useState<Category[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [galleryImages, setGalleryImages] = useState<any[]>([])
  const [isLoadingGallery] = useState(false)
  
  const [editData, setEditData] = useState({
    id: article.id,
    title: article.title,
    subtitle: article.subtitle || '',
    content: article.content,
    excerpt: article.excerpt || '',
    featured_image_url: article.featured_media?.file_url || article.featured_image_url || '',
    featured_media_id: article.featured_media?.id || article.featured_media_id || '',
    category_id: article.category_id || '',
    status: article.status || 'draft',
    content_type: article.content_type || 'article',
    is_premium: article.is_premium || false,
    is_breaking_news: article.is_breaking_news || false,
    is_trending: article.is_trending || false,
    seo_title: article.seo_title || '',
    seo_description: article.seo_description || '',
    published_at:
      article.id === 'new'
        ? nowLocalDateTimeInput()
        : toLocalDateTimeInput(article.published_at),
    scheduled_for: toLocalDateTimeInput(article.scheduled_for),
    location_name: article.location_name || '',
    read_time_minutes: article.read_time_minutes || null,
    created_at: (article as { created_at?: string | null }).created_at ?? null,
    updated_at: (article as { updated_at?: string | null }).updated_at ?? null,
  })

  // Update editData when article prop changes
  useEffect(() => {
    if (article && article.id !== 'new') {
      console.log('[DEBUG] Article prop changed, updating editData. Content length:', article.content?.length || 0)
      setEditData({
        title: article.title || '',
        subtitle: article.subtitle || '',
        content: article.content || '',
        excerpt: article.excerpt || '',
        featured_image_url: article.featured_media?.file_url || article.featured_image_url || '',
        featured_media_id: article.featured_media?.id || article.featured_media_id || '',
        category_id: article.category?.id || article.category_id || '',
        status: article.status || 'draft',
        content_type: article.content_type || 'article',
        is_premium: article.is_premium || false,
        is_breaking_news: article.is_breaking_news || false,
        is_trending: article.is_trending || false,
        seo_title: article.seo_title || '',
        seo_description: article.seo_description || '',
        published_at: toLocalDateTimeInput(article.published_at),
        scheduled_for: toLocalDateTimeInput(article.scheduled_for),
        location_name: article.location_name || '',
        read_time_minutes: article.read_time_minutes || null,
        id: article.id,
        created_at: (article as { created_at?: string | null }).created_at ?? null,
        updated_at: (article as { updated_at?: string | null }).updated_at ?? null,
      })
    }
  }, [article])

  // Check if user can edit this article
  // Normalize author_id - it might be in article.author.id or article.author_id
  const articleAuthorId = article.author_id || (article as any).author?.id || (article as any).author || ''
  const canEdit = user && profile && (
    profile.role === 'admin' || 
    profile.role === 'editor' || 
    profile.role === 'business_owner' ||
    profile.user === articleAuthorId ||
    String(profile.user) === String(articleAuthorId)
  )

  // If inModal, ensure we're always in editing mode
  useEffect(() => {
    if (inModal && !isEditing) {
      setIsEditing(true)
    }
  }, [inModal, isEditing])

  // Load categories and tags - load immediately for new articles, or when editing starts
  useEffect(() => {
    // For new articles, load categories immediately
    // For existing articles, load when editing starts or article data changes
    if (article.id === 'new' || isEditing) {
      loadCategoriesAndTags()
    }
  }, [isEditing, article.id, article]) // Added article to dependencies

  const loadCategoriesAndTags = async () => {
    try {
      // Load categories
      const categoriesData: any = await newsApi.categories.list()
      const categoriesList = categoriesData.results || categoriesData || []
      setCategories(categoriesList.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        color: cat.color
      })))
      
      // Load available tags
      const tagsData: any = await newsApi.tags.list()
      const tagsList = tagsData.results || tagsData || []
      setAvailableTags(tagsList.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug
      })))
      
      // Load article's current tags - need to get full article to see tags
      // Skip if creating new article
      if (article.id !== 'new') {
        const articleData: any = await newsApi.articles.get(article.id)
        if (articleData.tags) {
          setSelectedTags(articleData.tags.map((tag: any) => ({
            id: tag.id || tag,
            name: typeof tag === 'string' ? tag : tag.name,
            slug: typeof tag === 'string' ? tag : tag.slug
          })))
        }
        
        // Load gallery images
        try {
          const galleryData = await newsApi.articles.getMedia(article.id)
          setGalleryImages(Array.isArray(galleryData) ? galleryData : [])
        } catch (error: any) {
          console.error('Error loading gallery:', error)
          console.error('Error details:', error.details || error.message || error)
          console.error('Article ID:', article.id)
          // Don't show error to user if it's just an empty gallery (404 is OK)
          if (error.status !== 404) {
            console.warn('Gallery loading failed, but continuing...')
          }
          setGalleryImages([])
        }
      }
      
    } catch (error: any) {
      console.error('Error loading categories and tags:', error)
      showError('Failed to load categories. Please refresh the page.')
    }
  }

  const steps: { id: EditorStep; label: string; icon: any }[] = [
    { id: 'basic', label: 'Basic Info', icon: Edit3 },
    { id: 'content', label: 'Content', icon: Hash },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'research', label: 'Research', icon: Zap },
    { id: 'publish', label: 'Publish', icon: Calendar }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  const canGoNext = currentStepIndex < steps.length - 1
  const canGoPrev = currentStepIndex > 0

  useEffect(() => {
    if (currentStep !== 'research' || article.id === 'new' || !canManageArticleResearch) return
    let cancelled = false
    ;(async () => {
      try {
        const data: any = await newsApi.articles.researchStatus(article.id)
        if (cancelled) return
        setResearchInfo(data.research ?? null)
        if (data.research != null && 'apply_text_only' in data.research) {
          setResearchTextOnly(Boolean(data.research.apply_text_only))
        }
        if (data.article) {
          setEditData(prev => ({
            ...prev,
            subtitle: data.article.subtitle ?? prev.subtitle,
            excerpt: data.article.excerpt ?? prev.excerpt,
            content: data.article.content ?? prev.content,
            ...(data.article.featured_media
              ? {
                  featured_image_url:
                    data.article.featured_media.file_url ?? prev.featured_image_url,
                  featured_media_id:
                    data.article.featured_media.id ?? prev.featured_media_id,
                }
              : {}),
          }))
        }
        const heroJob =
          !!(data.research?.hero_regen_agent_id && data.research?.hero_regen_run_id)
        const galleryJob =
          !!(data.research?.gallery_gen_agent_id && data.research?.gallery_gen_run_id)
        prevHeroJobRef.current = heroJob
        prevGalleryJobRef.current = galleryJob
        const st = data.research?.status as string | undefined
        if (st === 'queued' || st === 'running' || heroJob || galleryJob)
          setResearchPoll(true)
        else setResearchPoll(false)
      } catch (e: any) {
        if (cancelled) return
        if (e?.status === 404) {
          setResearchInfo(null)
          setResearchPoll(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [currentStep, article.id, canManageArticleResearch])

  useEffect(() => {
    if (!researchPoll || article.id === 'new') return
    const tick = async () => {
      try {
        const data: any = await newsApi.articles.researchStatus(article.id)
        setResearchInfo(data.research ?? null)
        if (data.research != null && 'apply_text_only' in data.research) {
          setResearchTextOnly(Boolean(data.research.apply_text_only))
        }
        if (data.article) {
          setEditData(prev => ({
            ...prev,
            subtitle: data.article.subtitle ?? prev.subtitle,
            excerpt: data.article.excerpt ?? prev.excerpt,
            content: data.article.content ?? prev.content,
            ...(data.article.featured_media
              ? {
                  featured_image_url:
                    data.article.featured_media.file_url ?? prev.featured_image_url,
                  featured_media_id:
                    data.article.featured_media.id ?? prev.featured_media_id,
                }
              : {}),
          }))
        }
        const heroJob =
          !!(data.research?.hero_regen_agent_id && data.research?.hero_regen_run_id)
        const galleryJob =
          !!(data.research?.gallery_gen_agent_id && data.research?.gallery_gen_run_id)
        let closedHeroJob = false
        if (prevHeroJobRef.current && !heroJob) {
          closedHeroJob = true
          const err = data.research?.hero_regen_error as string | undefined
          if (err) showError(err)
          else showSuccess('New hero image applied from Cursor.')
        }
        let closedGalleryJob = false
        if (prevGalleryJobRef.current && !galleryJob) {
          closedGalleryJob = true
          const err = data.research?.gallery_gen_error as string | undefined
          if (err) showError(err)
          else {
            showSuccess('Gallery updated from Cursor.')
            try {
              const galleryData = await newsApi.articles.getMedia(article.id)
              setGalleryImages(Array.isArray(galleryData) ? galleryData : [])
            } catch {
              /* ignore */
            }
          }
        }
        prevHeroJobRef.current = heroJob
        prevGalleryJobRef.current = galleryJob
        const st = data.research?.status as string | undefined
        if (
          (st === 'finished' || st === 'failed' || st === 'cancelled') &&
          !heroJob &&
          !galleryJob
        ) {
          setResearchPoll(false)
          if (st === 'finished' && !closedHeroJob && !closedGalleryJob) {
            showSuccess('Research finished. Review excerpt and body below.')
          }
        }
      } catch {
        /* ignore transient poll errors */
      }
    }
    const id = setInterval(tick, 4000)
    return () => clearInterval(id)
  }, [researchPoll, article.id, showSuccess])

  if (!canEdit) {
    return null
  }

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  }

  // Validation helper function
  const validateArticle = () => {
    const title = editData.title?.trim()
    const content = editData.content?.trim()
    
    if (!title || title.length === 0) {
      return { valid: false, message: 'Please enter a title for the article.' }
    }

    if (!content || content.length === 0) {
      return { valid: false, message: 'Please add content to the article. Articles cannot be saved without content.' }
    }

    // Additional validation: content should have meaningful content (not just whitespace/HTML tags)
    const textContent = content.replace(/<[^>]*>/g, '').trim() // Remove HTML tags and check text
    if (textContent.length < 10) {
      return { valid: false, message: 'Please add more content to the article. Articles must have at least some meaningful text.' }
    }

    return { valid: true }
  }

  const handleRefreshResearch = async () => {
    if (article.id === 'new' || !canManageArticleResearch) return
    try {
      const data: any = await newsApi.articles.researchStatus(article.id)
      setResearchInfo(data.research ?? null)
      if (data.research != null && 'apply_text_only' in data.research) {
        setResearchTextOnly(Boolean(data.research.apply_text_only))
      }
      if (data.article) {
        setEditData(prev => ({
          ...prev,
          subtitle: data.article.subtitle ?? prev.subtitle,
          excerpt: data.article.excerpt ?? prev.excerpt,
          content: data.article.content ?? prev.content,
          ...(data.article.featured_media
            ? {
                featured_image_url:
                  data.article.featured_media.file_url ?? prev.featured_image_url,
                featured_media_id:
                  data.article.featured_media.id ?? prev.featured_media_id,
              }
            : {}),
        }))
      }
      const heroJob =
        !!(data.research?.hero_regen_agent_id && data.research?.hero_regen_run_id)
      const galleryJob =
        !!(data.research?.gallery_gen_agent_id && data.research?.gallery_gen_run_id)
      prevHeroJobRef.current = heroJob
      prevGalleryJobRef.current = galleryJob
      const st = data.research?.status as string | undefined
      if (st === 'queued' || st === 'running' || heroJob || galleryJob)
        setResearchPoll(true)
      else setResearchPoll(false)
    } catch (e: any) {
      if (e?.status === 404) {
        setResearchInfo(null)
        setResearchPoll(false)
      } else {
        showError(e?.message || 'Could not load research status')
      }
    }
  }

  const handleStartResearch = async () => {
    if (article.id === 'new' || !canManageArticleResearch) return
    setIsStartingResearch(true)
    try {
      const data: any = await newsApi.articles.researchStart(article.id, {
        context: researchBrief.trim(),
        apply_text_only: researchTextOnly,
      })
      setResearchInfo(data.research ?? null)
      if (data.research != null && 'apply_text_only' in data.research) {
        setResearchTextOnly(Boolean(data.research.apply_text_only))
      }
      if (data.article) {
        setEditData(prev => ({
          ...prev,
          subtitle: data.article.subtitle ?? prev.subtitle,
          excerpt: data.article.excerpt ?? prev.excerpt,
          content: data.article.content ?? prev.content,
          ...(data.article.featured_media
            ? {
                featured_image_url:
                  data.article.featured_media.file_url ?? prev.featured_image_url,
                featured_media_id:
                  data.article.featured_media.id ?? prev.featured_media_id,
              }
            : {}),
        }))
      }
      showSuccess(
        researchTextOnly
          ? 'Text update started. Hero and gallery will stay as they are when this finishes.'
          : 'Research started. This may take a few minutes.'
      )
      setResearchPoll(true)
    } catch (e: any) {
      const msg =
        e?.details?.detail || e?.message || 'Could not start research'
      showError(typeof msg === 'string' ? msg : 'Could not start research')
    } finally {
      setIsStartingResearch(false)
    }
  }

  const handleStopResearch = async () => {
    if (article.id === 'new' || !canManageArticleResearch) return
    setIsStoppingResearch(true)
    try {
      const data: any = await newsApi.articles.researchStop(article.id)
      setResearchInfo(data.research ?? null)
      setResearchPoll(false)
      showSuccess('Research stopped.')
    } catch (e: any) {
      showError(e?.message || 'Could not stop research')
    } finally {
      setIsStoppingResearch(false)
    }
  }

  const handleUpdateFeaturedHero = async () => {
    if (article.id === 'new' || !canManageArticleResearch) return
    if (heroImageMode === 'gallery' && !heroGalleryMediaId.trim()) {
      showError('Choose an image from the article gallery.')
      return
    }
    setIsUpdatingHeroImage(true)
    try {
      const payload =
        heroImageMode === 'gallery'
          ? { mode: 'gallery' as const, media_id: heroGalleryMediaId.trim() }
          : { mode: 'generate' as const }
      const updated: any = await newsApi.articles.researchFeaturedImage(article.id, payload)
      const fm = updated?.featured_media
      if (fm) {
        setEditData(prev => ({
          ...prev,
          featured_image_url: fm.file_url || prev.featured_image_url,
          featured_media_id: fm.id || prev.featured_media_id,
        }))
      }
      showSuccess('Featured image updated.')
    } catch (e: any) {
      const d = e?.details
      let msg = 'Could not update featured image.'
      if (typeof d?.detail === 'string') {
        msg = d.detail
      } else if (Array.isArray(d?.detail) && d.detail.length) {
        const x = d.detail[0] as { string?: string; message?: string } | string
        msg = typeof x === 'string' ? x : x?.string || x?.message || msg
      } else if (d?.media_id?.[0]) {
        msg = String(d.media_id[0])
      } else if (e?.message) {
        msg = e.message
      }
      showError(msg)
    } finally {
      setIsUpdatingHeroImage(false)
    }
  }

  const handleRegenerateHero = async () => {
    if (article.id === 'new' || !canManageArticleResearch) return
    setIsRegeneratingHero(true)
    try {
      const data: any = await newsApi.articles.researchRegenerateHero(article.id)
      setResearchInfo(data.research ?? null)
      if (data.article) {
        setEditData(prev => ({
          ...prev,
          ...(data.article.featured_media
            ? {
                featured_image_url:
                  data.article.featured_media.file_url ?? prev.featured_image_url,
                featured_media_id:
                  data.article.featured_media.id ?? prev.featured_media_id,
              }
            : {}),
        }))
      }
      const heroJob =
        !!(data.research?.hero_regen_agent_id && data.research?.hero_regen_run_id)
      prevHeroJobRef.current = heroJob
      setResearchPoll(true)
      showSuccess(
        'Cursor is generating a new hero image. This usually takes a few minutes; we will update the preview when it is ready.'
      )
    } catch (e: any) {
      const d = e?.details
      let msg = 'Could not start hero regeneration.'
      if (typeof d?.detail === 'string') {
        msg = d.detail
      } else if (e?.message) {
        msg = e.message
      }
      showError(msg)
    } finally {
      setIsRegeneratingHero(false)
    }
  }

  const handleGenerateGalleryCursor = async () => {
    if (article.id === 'new' || !canManageArticleResearch) return
    setIsGeneratingGallery(true)
    try {
      const data: any = await newsApi.articles.researchGenerateGallery(article.id)
      setResearchInfo(data.research ?? null)
      const galleryJob =
        !!(data.research?.gallery_gen_agent_id && data.research?.gallery_gen_run_id)
      prevGalleryJobRef.current = galleryJob
      setResearchPoll(true)
      showSuccess(
        'Cursor run started: one new gallery image. We will attach it when the run finishes (this tab polls automatically).'
      )
    } catch (e: any) {
      const d = e?.details
      let msg = 'Could not start gallery image generation.'
      if (typeof d?.detail === 'string') {
        msg = d.detail
      } else if (e?.message) {
        msg = e.message
      }
      showError(msg)
    } finally {
      setIsGeneratingGallery(false)
    }
  }

  const handleSyncCursorGallery = async () => {
    if (article.id === 'new' || !canManageArticleResearch) return
    setIsSyncingCursorGallery(true)
    try {
      const data: any = await newsApi.articles.researchCursorGallery(article.id)
      const n = data?.gallery_images_added
      const galleryData = await newsApi.articles.getMedia(article.id)
      setGalleryImages(Array.isArray(galleryData) ? galleryData : [])
      showSuccess(
        typeof n === 'number'
          ? `Added ${n} image(s) from Cursor to the article gallery.`
          : 'Gallery synced from Cursor.'
      )
    } catch (e: any) {
      const d = e?.details
      let msg = 'Could not sync gallery from Cursor.'
      if (typeof d?.detail === 'string') {
        msg = d.detail
      } else if (Array.isArray(d?.detail) && d.detail.length) {
        const x = d.detail[0] as { string?: string; message?: string } | string
        msg = typeof x === 'string' ? x : x?.string || x?.message || msg
      } else if (e?.message) {
        msg = e.message
      }
      showError(msg)
    } finally {
      setIsSyncingCursorGallery(false)
    }
  }

  const handleSave = async () => {
    // Validation: Check required fields
    const validation = validateArticle()
    if (!validation.valid) {
      showError(validation.message || 'Please fill in all required fields')
      return
    }

    const title = editData.title?.trim()
    const content = editData.content?.trim()

    setIsSaving(true)
    
    try {
      // Get author ID from profile
      const authorId = profile?.user
      if (!authorId && article.id === 'new') {
        throw new Error('Author ID is required. Please ensure you are logged in.')
      }
      
      // Note: Company ID is not required - backend will automatically set it to Riverside Herald
      // for business owners and other users creating articles

      // Generate slug if creating new article
      const slug = article.id === 'new' 
        ? generateSlug(editData.title || 'untitled-article')
        : article.slug || generateSlug(editData.title || 'untitled-article')

      // Prepare update data - use empty strings instead of null for blank fields
      const updateData: any = {
        title: title, // Already validated and trimmed
        slug: slug,
        subtitle: editData.subtitle || '',
        content: content, // Already validated and trimmed
        excerpt: editData.excerpt || '',
        author: authorId,
        status: editData.status || 'draft',
        content_type: editData.content_type || 'article',
        is_premium: editData.is_premium || false,
        is_breaking_news: editData.is_breaking_news || false,
        is_trending: editData.is_trending || false,
        seo_title: editData.seo_title || '',
        seo_description: editData.seo_description || '',
        location_name: editData.location_name || '',
      }

      // Note: Company is automatically set by backend to Riverside Herald in perform_create
      // No need to send company from frontend

      // Category: PATCH always include so we can set or clear FK (create omits when empty)
      if (article.id === 'new') {
        if (editData.category_id) {
          updateData.category = editData.category_id
        }
      } else {
        updateData.category = editData.category_id || null
      }

      // Add featured media if provided (must be Media ID, not URL)
      if (editData.featured_media_id) {
        updateData.featured_media = editData.featured_media_id
      }

      // Add read time if provided
      if (editData.read_time_minutes) {
        updateData.read_time_minutes = editData.read_time_minutes
      }
      
      // published_at only when publishing / scheduling (avoid draft + default picker sending bad dates)
      const st = editData.status || 'draft'
      if (st === 'published' || st === 'scheduled') {
        const pubIso = parseLocalDateTimeToIso(editData.published_at)
        if (pubIso) {
          updateData.published_at = pubIso
        }
      }
      const schedIso = parseLocalDateTimeToIso(editData.scheduled_for)
      if (schedIso) {
        updateData.scheduled_for = schedIso
      }

      // Update tags if any are selected
      if (selectedTags.length > 0) {
        updateData.tags = selectedTags.map(tag => tag.id)
      }

      // Check if creating new article or updating existing
      if (article.id === 'new') {
        // Create new article
        console.log('Creating article with data:', updateData)
        const newArticle: any = await newsApi.articles.create(updateData)
        showSuccess('Article created successfully!')
        
        // Update the article data to the newly created article so user can continue editing
        setEditData(prev => ({
          ...prev,
          id: newArticle.id,
          created_at: newArticle.created_at,
          updated_at: newArticle.updated_at
        }))
        
        // Update article prop by calling onSave with the new article
        // This allows the parent component to update its state
        if (onSave) {
          // Pass the new article to the callback so parent can update
          onSave(newArticle)
        }
        // NO REDIRECT - stay on same page
      } else {
        // Update existing article
        const updated: any = await newsApi.articles.patch(article.id, updateData)
        showSuccess('Article updated successfully!')
        if (updated && typeof updated === 'object') {
          setEditData(prev => ({
            ...prev,
            category_id: updated.category?.id || '',
            updated_at: updated.updated_at ?? prev.updated_at,
          }))
        }
        // If onSave callback provided, use it
        if (onSave) {
          onSave()
        }
        // NO RELOAD - stay on same page
      }
      
    } catch (error: any) {
      console.error('Error saving article:', error)
      console.error('Error details:', error?.details)
      console.error('Error structure:', JSON.stringify(error, null, 2))
      
      // Handle different error formats from API
      let errorMessage = 'Error saving article. Please try again.'
      
      if (error) {
        // Check for API error structure (from handleResponse)
        // Django REST Framework returns field errors directly in details
        if (error.details && typeof error.details === 'object') {
          // Check if details has field errors (Django validation format)
          const fieldErrors: string[] = []
          const nonFieldErrors: string[] = []
          
          Object.entries(error.details).forEach(([key, value]: [string, any]) => {
            if (key === 'message' || key === 'detail') {
              // Skip these, we'll use them as fallback
              return
            }
            
            if (key === 'non_field_errors' || key === 'nonFieldErrors') {
              // Non-field errors
              const messages = Array.isArray(value) ? value : [value]
              nonFieldErrors.push(...messages)
            } else {
              // Field-specific errors
              const messages = Array.isArray(value) ? value : [value]
              const formattedField = key.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')
              fieldErrors.push(`${formattedField}: ${messages.join(', ')}`)
            }
          })
          
          if (fieldErrors.length > 0 || nonFieldErrors.length > 0) {
            errorMessage = [...nonFieldErrors, ...fieldErrors].join('; ')
          } else if (error.details.message) {
            errorMessage = error.details.message
          } else if (error.details.detail) {
            errorMessage = error.details.detail
          } else {
            // Try to stringify the details
            const detailsStr = JSON.stringify(error.details)
            if (detailsStr !== '{}' && detailsStr !== 'null') {
              errorMessage = `Validation error: ${detailsStr}`
            }
          }
        }
        // Check for error.message (from API client)
        else if (error.message) {
          errorMessage = error.message
        }
        // Check for error.error (nested error object)
        else if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error
          } else if (typeof error.error === 'object') {
            const errorFields = Object.entries(error.error).map(([field, messages]: [string, any]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages]
              const formattedField = field.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')
              return `${formattedField}: ${messageArray.join(', ')}`
            })
            errorMessage = errorFields.join('; ')
          }
        }
        // Check for status code
        else if (error.status) {
          errorMessage = `Error ${error.status}: ${error.message || 'Request failed'}`
        }
        // String error
        else if (typeof error === 'string') {
          errorMessage = error
        }
      }
      
      console.error('Extracted error message:', errorMessage)
      showError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      title: article.title,
      subtitle: article.subtitle || '',
      content: article.content,
      excerpt: article.excerpt || '',
      featured_image_url: article.featured_media?.file_url || article.featured_image_url || '',
      featured_media_id: article.featured_media?.id || article.featured_media_id || '',
      category_id: article.category_id || '',
      status: article.status || 'draft',
      content_type: article.content_type || 'article',
      is_premium: article.is_premium || false,
      is_breaking_news: article.is_breaking_news || false,
      is_trending: article.is_trending || false,
      seo_title: article.seo_title || '',
      seo_description: article.seo_description || '',
      published_at:
        article.id === 'new'
          ? nowLocalDateTimeInput()
          : toLocalDateTimeInput(article.published_at),
      scheduled_for: toLocalDateTimeInput(article.scheduled_for),
      location_name: article.location_name || '',
      read_time_minutes: article.read_time_minutes || null,
      id: article.id,
      created_at: (article as { created_at?: string | null }).created_at ?? null,
      updated_at: (article as { updated_at?: string | null }).updated_at ?? null,
    })
    setCurrentStep('basic')
    setIsEditing(false)
    // If onCancel callback provided, use it
    if (onCancel) {
      onCancel()
    }
  }

  const handleDelete = async () => {
    // Don't allow deleting new articles
    if (article.id === 'new') {
      if (onCancel) {
        onCancel()
      }
      return
    }
    
    setIsDeleting(true)
    
    try {
      await newsApi.articles.delete(article.id)

      if (onCancel) {
        onCancel()
      }
      // NO REDIRECT - callback handles it
      
    } catch (error: any) {
      console.error('Error deleting article:', error)
      console.error('Error deleting article:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleFeaturedImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      console.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      console.error('Please select an image smaller than 5MB')
      return
    }

    setIsUploading(true)
    
    try {
      const companyId = apiClient.getCompanyId()
      if (!companyId) {
        throw new Error('Company ID is required. Please ensure you are logged in and associated with a company.')
      }

      // Upload image using API
      const mediaData = await newsApi.media.upload(file, {
        media_type: 'image',
        alt_text: `Featured image for ${article.title || 'article'}`,
      }) as any

      // Always set as featured image (for both new and existing articles)
      setEditData(prev => ({
        ...prev,
        featured_image_url: mediaData.file_url,
        featured_media_id: mediaData.id
      }))

      console.log('Featured image uploaded successfully')

    } catch (error: any) {
      console.error('Error uploading featured image:', error)
      let errorMessage = 'Error uploading image. Please try again.'
      if (error?.message && error.message !== 'An error occurred') {
        errorMessage = error.message
      } else if (error?.details) {
        const errorDetails = error.details
        const errorMessages: string[] = []
        Object.keys(errorDetails).forEach(key => {
          if (Array.isArray(errorDetails[key])) {
            errorMessages.push(`${key}: ${errorDetails[key].join(', ')}`)
          } else {
            errorMessages.push(`${key}: ${errorDetails[key]}`)
          }
        })
        if (errorMessages.length > 0) {
          errorMessage = `Upload failed: ${errorMessages.join('; ')}`
        }
      }
      console.error('Error:', errorMessage)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleGalleryImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    if (article.id === 'new') {
      showError('Please save the article first before adding images to the gallery. Save your article, then you can add multiple images.')
      // Reset file input
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = ''
      }
      return
    }

    setIsUploading(true)
    
    try {
      const companyId = apiClient.getCompanyId()
      if (!companyId) {
        throw new Error('Company ID is required. Please ensure you are logged in and associated with a company.')
      }

      let uploadedCount = 0
      let failedCount = 0

      // Process all selected files
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file
        if (!file.type.startsWith('image/')) {
          showError(`File "${file.name}" is not an image. Skipping.`)
          failedCount++
          continue
        }

        if (file.size > 5 * 1024 * 1024) {
          showError(`File "${file.name}" is too large (max 5MB). Skipping.`)
          failedCount++
          continue
        }

        try {
          // Upload image using API
          const mediaData = await newsApi.media.upload(file, {
            media_type: 'image',
            alt_text: `Gallery image for ${article.title || 'article'}`,
          }) as any

          // Add to gallery
          await newsApi.articles.addMedia(article.id, mediaData.id)
          uploadedCount++
        } catch (error: any) {
          console.error(`Error uploading ${file.name}:`, error)
          failedCount++
        }
      }

      // Reload gallery after all uploads
      if (uploadedCount > 0) {
        const galleryData = await newsApi.articles.getMedia(article.id)
        setGalleryImages(Array.isArray(galleryData) ? galleryData : [])
        
        if (failedCount === 0) {
          console.log(`Successfully added ${uploadedCount} image${uploadedCount > 1 ? 's' : ''} to gallery`)
        } else {
          console.warn(`Added ${uploadedCount} image${uploadedCount > 1 ? 's' : ''} to gallery. ${failedCount} failed.`)
        }
      } else if (failedCount > 0) {
        console.error(`Failed to upload ${failedCount} image${failedCount > 1 ? 's' : ''}`)
      }

    } catch (error: any) {
      console.error('Error uploading gallery image:', error)
      let errorMessage = 'Error uploading image. Please try again.'
      if (error?.message && error.message !== 'An error occurred') {
        errorMessage = error.message
      } else if (error?.details) {
        const errorDetails = error.details
        const errorMessages: string[] = []
        Object.keys(errorDetails).forEach(key => {
          if (Array.isArray(errorDetails[key])) {
            errorMessages.push(`${key}: ${errorDetails[key].join(', ')}`)
          } else {
            errorMessages.push(`${key}: ${errorDetails[key]}`)
          }
        })
        if (errorMessages.length > 0) {
          errorMessage = `Upload failed: ${errorMessages.join('; ')}`
        }
      }
      console.error('Error:', errorMessage)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = ''
      }
    }
  }

  const addTag = async () => {
    if (!newTagName.trim()) return
    
    try {
      const slug = newTagName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      
      const newTag = await newsApi.tags.create({
        name: newTagName.trim(),
        slug: slug
      })
      
      setAvailableTags(prev => [...prev, newTag as Tag])
      setSelectedTags(prev => [...prev, newTag as Tag])
      setNewTagName('')
      
    } catch (error: any) {
      console.error('Error creating tag:', error)
      console.error('Error creating tag:', error)
    }
  }

  const toggleTag = (tag: Tag) => {
    setSelectedTags(prev => {
      const exists = prev.find(t => t.id === tag.id)
      if (exists) {
        return prev.filter(t => t.id !== tag.id)
      } else {
        return [...prev, tag]
      }
    })
  }

  if (!isEditing) {
    return (
      <>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors w-full sm:w-auto justify-center"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Article</span>
          </button>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors w-full sm:w-auto justify-center"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Article</span>
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Delete Article
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to delete "{article.title}"? This action cannot be undone.
                </p>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Title *
              </label>
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                placeholder="Enter article title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={editData.subtitle}
                onChange={(e) => setEditData(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter article subtitle..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={editData.category_id}
                onChange={(e) => setEditData(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category...</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={editData.content_type}
                onChange={(e) => setEditData(prev => ({ ...prev, content_type: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="article">Article</option>
                <option value="gallery">Gallery</option>
                <option value="video">Video</option>
                <option value="podcast">Podcast</option>
                <option value="live_blog">Live Blog</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Excerpt
              </label>
              <textarea
                value={editData.excerpt}
                onChange={(e) => setEditData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                placeholder="Brief summary of the article..."
              />
            </div>
          </div>
        )

      case 'content':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Content *
              </label>
              <textarea
                value={editData.content}
                onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                rows={window.innerWidth < 640 ? 15 : 20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y font-mono text-sm"
                placeholder="Write your article content here..."
              />
              <p className="mt-2 text-sm text-gray-500">
                💡 You can use HTML tags like &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;em&gt; for formatting.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reading Time (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={editData.read_time_minutes || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, read_time_minutes: e.target.value ? parseInt(e.target.value) : null }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Estimated reading time..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                value={editData.location_name}
                onChange={(e) => setEditData(prev => ({ ...prev, location_name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Cape Town, South Africa"
              />
            </div>
          </div>
        )

      case 'media':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              
              {editData.featured_image_url && (
                <div className="mb-4">
                  <div className="relative inline-block">
                    <img
                      src={editData.featured_image_url}
                      alt="Featured image preview"
                      className="w-full max-w-sm h-48 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found'
                      }}
                    />
                    <button
                      onClick={() => setEditData(prev => ({ ...prev, featured_image_url: '' }))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto justify-center"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Image</span>
                    </>
                  )}
                </button>
                
                <span className="text-sm text-gray-500">or</span>
              </div>

              <input
                type="url"
                value={editData.featured_image_url}
                onChange={(e) => setEditData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter image URL..."
              />
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFeaturedImageUpload}
                className="hidden"
              />
            </div>

            {/* Gallery Section - Available to all authors and business owners */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Article Gallery {article.id !== 'new' && `(${galleryImages.length} images)`}
                </label>
                {article.id !== 'new' && (
                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Add Images</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={galleryFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryImageUpload}
                  className="hidden"
                  multiple
                />
              </div>
              
              {article.id === 'new' ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-2">Gallery Images</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Save your article first, then you can add multiple images to the gallery.
                  </p>
                  <p className="text-xs text-gray-400">
                    You can upload multiple images at once after saving.
                  </p>
                </div>
              ) : isLoadingGallery ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">Loading gallery...</p>
                </div>
              ) : galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map((item: any) => (
                    <div key={item.id || item.media?.id} className="relative group">
                      <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-300">
                        {item.media?.file_url && (
                          <img
                            src={item.media.file_url}
                            alt={item.media.alt_text || item.caption || 'Gallery image'}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button
                          onClick={async () => {
                            if (article.id !== 'new' && item.media?.id) {
                              try {
                                await newsApi.articles.removeMedia(article.id, item.media.id)
                                setGalleryImages(prev => prev.filter((img: any) => 
                                  (img.id || img.media?.id) !== (item.id || item.media?.id)
                                ))
                                showSuccess('Image removed from gallery')
                              } catch (error: any) {
                                console.error('Error removing image:', error)
                                showError(error?.message || 'Failed to remove image from gallery')
                              }
                            }
                          }}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove from gallery"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {item.caption && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-3">No images in gallery yet.</p>
                  <p className="text-xs text-gray-400 mb-4">You can upload multiple images at once.</p>
                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Images to Gallery</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={galleryFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryImageUpload}
                    className="hidden"
                    multiple
                  />
                </div>
              )}
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Status
              </label>
              <select
                value={editData.status}
                onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
                <option value="featured">Featured</option>
              </select>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Article Flags</h3>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={editData.is_premium}
                  onChange={(e) => setEditData(prev => ({ ...prev, is_premium: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Premium Content</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={editData.is_breaking_news}
                  onChange={(e) => setEditData(prev => ({ ...prev, is_breaking_news: e.target.checked }))}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Breaking News</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={editData.is_trending}
                  onChange={(e) => setEditData(prev => ({ ...prev, is_trending: e.target.checked }))}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Trending</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag)}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full hover:bg-blue-200 transition-colors"
                    >
                      {tag.name}
                      <X className="w-3 h-3 ml-1" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-3">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Add new tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {availableTags.length > 0 && (
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                  <div className="flex flex-wrap gap-1">
                    {availableTags.filter(tag => !selectedTags.find(st => st.id === tag.id)).map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag)}
                        className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors"
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'seo':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Title
              </label>
              <input
                type="text"
                value={editData.seo_title}
                onChange={(e) => setEditData(prev => ({ ...prev, seo_title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Custom title for search engines..."
              />
              <p className="mt-1 text-sm text-gray-500">Leave empty to use article title</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Description
              </label>
              <textarea
                value={editData.seo_description}
                onChange={(e) => setEditData(prev => ({ ...prev, seo_description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                placeholder="Description for search engine results..."
              />
              <p className="mt-1 text-sm text-gray-500">Recommended: 150-160 characters</p>
            </div>
          </div>
        )

      case 'research':
        if (!canManageArticleResearch) {
          return (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Only the Riverside Herald company owner or a news admin can run AI research.
            </div>
          )
        }
        if (article.id === 'new') {
          return (
            <div className="space-y-4">
              <p className="text-gray-700">
                Save the article first, then open this tab to run Cursor-backed research on the headline and subtitle.
              </p>
            </div>
          )
        }
        {
          const st = (researchInfo?.status as string) || ''
          const heroRegenBusy = !!(
            researchInfo?.hero_regen_agent_id && researchInfo?.hero_regen_run_id
          )
          const galleryGenBusy = !!(
            researchInfo?.gallery_gen_agent_id && researchInfo?.gallery_gen_run_id
          )
          const busy = st === 'running' || st === 'queued' || heroRegenBusy || galleryGenBusy
          const agentUrl = researchInfo?.agent_url as string | undefined
          return (
            <div className="space-y-6">
              <div className="rounded-lg border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-900">
                <p className="font-medium mb-1">AI research (Cursor Cloud Agent)</p>
                <p className="text-blue-800/90">
                  Uses the article title and subtitle from Basic Info. Add an optional editor brief below. Status refreshes every few seconds while the run is active.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Editor brief for the researcher (optional)
                </label>
                <textarea
                  value={researchBrief}
                  onChange={(e) => setResearchBrief(e.target.value)}
                  rows={4}
                  disabled={busy}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y text-sm"
                  placeholder="Angles, sources to check, local context, spellings, etc."
                />
              </div>
              <label className="flex items-start gap-2 cursor-pointer text-gray-800 max-w-xl">
                <input
                  type="checkbox"
                  checked={researchTextOnly}
                  onChange={(e) => setResearchTextOnly(e.target.checked)}
                  disabled={busy}
                  className="mt-1 rounded border-gray-300"
                />
                <span className="text-sm">
                  <span className="font-medium">Text only</span> — when the run finishes, update subtitle, excerpt,
                  and body from the new <code className="text-xs bg-gray-100 px-1 rounded">research/&lt;slug&gt;.md</code>
                  only. Leave the featured hero image unchanged (gallery is never touched by research apply).
                </span>
              </label>
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  type="button"
                  onClick={handleStartResearch}
                  disabled={isStartingResearch || busy}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isStartingResearch ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Starting…
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      {researchTextOnly ? 'Update text' : 'Start research'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleStopResearch}
                  disabled={isStoppingResearch || !busy}
                  className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  {isStoppingResearch ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Stopping…
                    </>
                  ) : (
                    'Stop research'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleRefreshResearch}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Refresh status
                </button>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 bg-gray-50 text-sm space-y-2">
                <p>
                  <span className="font-medium text-gray-700">Status:</span>{' '}
                  <span className="capitalize">{st || 'none'}</span>
                  {researchPoll && busy && (
                    <span className="ml-2 text-gray-500">(polling…)</span>
                  )}
                </p>
                {researchInfo?.error ? (
                  <p className="text-red-700">
                    <span className="font-medium">Error:</span> {String(researchInfo.error)}
                  </p>
                ) : null}
                {heroRegenBusy ? (
                  <p className="text-indigo-800 font-medium">Hero regeneration running in Cursor…</p>
                ) : null}
                {researchInfo?.hero_regen_error ? (
                  <p className="text-red-700">
                    <span className="font-medium">Hero regeneration:</span>{' '}
                    {String(researchInfo.hero_regen_error)}
                  </p>
                ) : null}
                {galleryGenBusy ? (
                  <p className="text-teal-900 font-medium">
                    Gallery image Cursor run in progress (one new file when it finishes)…
                  </p>
                ) : null}
                {researchInfo?.gallery_gen_error ? (
                  <p className="text-red-700">
                    <span className="font-medium">Gallery generation:</span>{' '}
                    {String(researchInfo.gallery_gen_error)}
                  </p>
                ) : null}
                {agentUrl ? (
                  <p>
                    <a
                      href={agentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline font-medium"
                    >
                      Open Cursor agent
                    </a>
                  </p>
                ) : null}
                {researchInfo?.artifact_path ? (
                  <p className="text-gray-600">
                    <span className="font-medium">Artifact:</span> {String(researchInfo.artifact_path)}
                  </p>
                ) : null}
                {researchInfo?.applied_at ? (
                  <p className="text-gray-600">
                    <span className="font-medium">Applied:</span> {String(researchInfo.applied_at)}
                  </p>
                ) : null}
              </div>
              <div className="rounded-lg border border-gray-200 p-4 bg-white text-sm space-y-4">
                <p className="font-medium text-gray-800">Featured / hero image</p>
                <p className="text-gray-600">
                  Lead image from <strong className="text-gray-800">research/&lt;slug&gt;-hero.png</strong> or{' '}
                  <strong className="text-gray-800">.jpg</strong> (GitHub / agent), from the gallery, or start a{' '}
                  <strong className="text-gray-800">new</strong> Cursor run that replaces the hero file (below).
                </p>
                {heroRegenBusy ? (
                  <p className="text-sm text-indigo-800">
                    Cursor is generating a new hero — preview will update when the run finishes.
                  </p>
                ) : null}
                {editData.featured_image_url ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={editData.featured_image_url}
                      alt=""
                      className="h-16 w-28 object-cover rounded border border-gray-200"
                    />
                    <span className="text-xs text-gray-500">Current featured image</span>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-800">
                    <input
                      type="radio"
                      name="heroImageMode"
                      checked={heroImageMode === 'generate'}
                      onChange={() => setHeroImageMode('generate')}
                      className="rounded-full border-gray-300"
                    />
                    Pull latest hero file
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-gray-800">
                    <input
                      type="radio"
                      name="heroImageMode"
                      checked={heroImageMode === 'gallery'}
                      onChange={() => setHeroImageMode('gallery')}
                      className="rounded-full border-gray-300"
                    />
                    Use gallery image
                  </label>
                </div>
                {heroImageMode === 'generate' ? (
                  <p className="text-sm text-gray-600">
                    Re-downloads <code className="text-xs bg-gray-100 px-1 rounded">research/&lt;slug&gt;-hero.*</code> from
                    the agent or GitHub. If that file was not changed, the picture will look the same — use{' '}
                    <strong className="font-medium text-gray-800">New hero image</strong> below for a fresh visual.
                  </p>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image from article gallery
                    </label>
                    <select
                      value={heroGalleryMediaId}
                      onChange={(e) => setHeroGalleryMediaId(e.target.value)}
                      className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">— Select an image —</option>
                      {galleryImages.map((item: any) => {
                        const id = item.media?.id as string | undefined
                        if (!id) return null
                        return (
                          <option key={id} value={id}>
                            {item.media?.alt_text || item.caption || id.slice(0, 8)}
                          </option>
                        )
                      })}
                    </select>
                    {galleryImages.length === 0 ? (
                      <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded px-2 py-1">
                        No gallery images yet. Add some on the Media tab first.
                      </p>
                    ) : null}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleUpdateFeaturedHero}
                  disabled={isUpdatingHeroImage || heroRegenBusy}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isUpdatingHeroImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Updating…
                    </>
                  ) : (
                    'Apply featured image'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleRegenerateHero}
                  disabled={isRegeneratingHero || heroRegenBusy || busy}
                  className="inline-flex items-center px-4 py-2 ml-0 sm:ml-2 mt-2 sm:mt-0 bg-violet-700 text-white rounded-lg hover:bg-violet-800 disabled:opacity-50"
                >
                  {isRegeneratingHero ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Starting…
                    </>
                  ) : (
                    'New hero image (Cursor)'
                  )}
                </button>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 bg-white text-sm space-y-3">
                <p className="font-medium text-gray-800">Article gallery (Cursor)</p>
                <p className="text-gray-600">
                  Nothing is added automatically. Use the buttons below only when <strong className="text-gray-800">you</strong>{' '}
                  choose: <strong className="text-gray-800">Generate one gallery image</strong> starts a Cursor run (one
                  new <code className="text-xs bg-gray-100 px-1 rounded">research/&lt;slug&gt;-gallery-N.*</code> per
                  click). When that run finishes, the new file is imported automatically. Or use{' '}
                  <strong className="text-gray-800">Import from GitHub / agent</strong> to pull every gallery file that
                  already exists on the branch or in artifacts — still only when you click.
                </p>
                {galleryGenBusy ? (
                  <p className="text-sm text-teal-900">
                    Cursor is creating one gallery image — the list below will refresh when the run completes.
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateGalleryCursor}
                    disabled={isGeneratingGallery || galleryGenBusy || busy}
                    className="inline-flex items-center px-4 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-900 disabled:opacity-50"
                  >
                    {isGeneratingGallery ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Starting…
                      </>
                    ) : (
                      'Generate one gallery image (Cursor)'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleSyncCursorGallery}
                    disabled={isSyncingCursorGallery || galleryGenBusy}
                    className="inline-flex items-center px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 disabled:opacity-50"
                  >
                    {isSyncingCursorGallery ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Importing…
                      </>
                    ) : (
                      'Import gallery from GitHub / agent'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )
        }

      case 'publish':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publish Date
              </label>
              <input
                type="datetime-local"
                value={editData.published_at}
                onChange={(e) => setEditData(prev => ({ ...prev, published_at: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">Leave empty for current date when publishing</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule For Later
              </label>
              <input
                type="datetime-local"
                value={editData.scheduled_for}
                onChange={(e) => setEditData(prev => ({ ...prev, scheduled_for: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">Set a future date to schedule publishing</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Publishing Summary</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Status:</span> {editData.status}</p>
                <p><span className="font-medium">Category:</span> {categories.find(c => c.id === editData.category_id)?.name || 'None'}</p>
                <p><span className="font-medium">Tags:</span> {selectedTags.length > 0 ? selectedTags.map(t => t.name).join(', ') : 'None'}</p>
                <p><span className="font-medium">Content Type:</span> {editData.content_type}</p>
                {editData.is_premium && <p className="text-amber-600">⭐ Premium Content</p>}
                {editData.is_breaking_news && <p className="text-red-600">🚨 Breaking News</p>}
                {editData.is_trending && <p className="text-orange-600">📈 Trending</p>}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full flex flex-col bg-white min-h-screen">
      {/* Step Navigation */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = step.id === currentStep
              const isCompleted = index < currentStepIndex
              
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all text-sm font-bold whitespace-nowrap ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md scale-105' 
                      : isCompleted 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200' 
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <StepIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              )
            })}
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              type="button"
              onClick={() => setCurrentStep(steps[currentStepIndex - 1].id)}
              disabled={!canGoPrev}
              className="p-2.5 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(steps[currentStepIndex + 1].id)}
              disabled={!canGoNext}
              className="p-2.5 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 p-6 sm:p-10 max-w-6xl mx-auto w-full">
        {renderStepContent()}
      </div>
      
      {/* Footer with Save/Cancel buttons */}
      <div className="px-4 sm:px-6 py-8 border-t border-gray-200 bg-gray-50 flex items-center justify-between flex-wrap gap-6 sticky bottom-0 z-20">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleCancel()
            }}
            className="flex items-center space-x-2 px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all font-bold shadow-sm active:scale-95"
          >
            <X className="w-5 h-5" />
            <span>Cancel & Exit</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* Mobile Navigation */}
          <div className="sm:hidden flex items-center space-x-4">
            <button
              type="button"
              onClick={() => canGoPrev && setCurrentStep(steps[currentStepIndex - 1].id)}
              disabled={!canGoPrev}
              className="p-3 rounded-xl bg-white text-gray-600 border-2 border-gray-200 disabled:opacity-50 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-gray-500">
              {currentStepIndex + 1} / {steps.length}
            </span>
            <button
              type="button"
              onClick={() => canGoNext && setCurrentStep(steps[currentStepIndex + 1].id)}
              disabled={!canGoNext}
              className="p-3 rounded-xl bg-white text-gray-600 border-2 border-gray-200 disabled:opacity-50 shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !validateArticle().valid}
            className="flex items-center space-x-3 px-12 py-4 bg-green-600 text-white hover:bg-green-700 rounded-xl transition-all font-black text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
            title={!validateArticle().valid ? validateArticle().message : 'Save article'}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                <span>Save Article</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}