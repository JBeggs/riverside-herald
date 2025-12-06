# Django Tenanted Backend - Required Tables Analysis
## The Riverside Herald → Django CRM Integration

### Overview

This document outlines all tables/models that need to be created in the existing Django CRM backend to support The Riverside Herald news platform. The backend uses **multi-tenancy** via `EcommerceCompany` model, and businesses must register to access their data.

---

## Existing Django CRM Architecture

### Tenancy Model
- **Tenant Identifier**: `EcommerceCompany` model
- **Company Identification**: 
  1. `X-Company-Id` header (primary method for API requests)
  2. User's owned company (fallback)
  3. Query parameter `company_id` (superusers only)
- **Registration**: Businesses register via `/api/auth/register/` which creates both `User` and `EcommerceCompany`
- **Authentication**: JWT tokens via `djangorestframework-simplejwt`

### Existing Models (Reference)
- `EcommerceCompany` - Tenant/company identifier
- `User` - Django auth user (extends AbstractUser)
- `EcommerceProduct`, `Category`, `Cart`, `Order` - Multi-tenant e-commerce models

---

## Required Tables/Models for Riverside Herald

### 1. User & Profile Models

#### `Profile` (extends Django User)
**Tenancy**: ❌ **NOT tenant-scoped** (shared across all companies)
**Purpose**: User profiles with role-based access

```python
# apps/accounts/models.py or apps/news/models.py

class Profile(models.Model):
    """
    Extended user profile for news platform.
    NOT tenant-scoped - users can belong to multiple companies.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Basic Info
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    full_name = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    
    # Role (news platform specific)
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
        ('editor', 'Editor'),
        ('author', 'Author'),
        ('subscriber', 'Subscriber'),
        ('premium_subscriber', 'Premium Subscriber'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    is_verified = models.BooleanField(default=False)
    
    # Social & Preferences
    social_links = models.JSONField(default=dict, blank=True)
    preferences = models.JSONField(default=dict, blank=True)
    last_seen_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'news_profiles'
```

**Key Points**:
- Links to existing Django `User` model
- Role system for news platform (separate from company ownership)
- NOT scoped to `EcommerceCompany` - users are shared

---

### 2. Content Organization Models

#### `Category` (Article Categories)
**Tenancy**: ✅ **TENANT-SCOPED** (each company has their own categories)
**Purpose**: Organize articles by category

```python
class Category(models.Model):
    """
    Article categories - scoped to company.
    Each news organization has their own categories.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'ecommerce.EcommerceCompany',
        on_delete=models.CASCADE,
        related_name='news_categories',
        db_index=True
    )
    
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, db_index=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#3B82F6')
    
    # Hierarchy
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subcategories'
    )
    
    sort_order = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'news_categories'
        unique_together = [['company', 'slug']]
        indexes = [
            models.Index(fields=['company', 'slug']),
        ]
```

#### `Tag` (Article Tags)
**Tenancy**: ✅ **TENANT-SCOPED** (each company has their own tags)
**Purpose**: Tag articles for better organization

```python
class Tag(models.Model):
    """
    Article tags - scoped to company.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'ecommerce.EcommerceCompany',
        on_delete=models.CASCADE,
        related_name='news_tags',
        db_index=True
    )
    
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, db_index=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#6B7280')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'news_tags'
        unique_together = [['company', 'slug']]
```

---

### 3. Media Management Models

#### `Media` (File Storage)
**Tenancy**: ✅ **TENANT-SCOPED** (each company manages their own media)
**Purpose**: Store images, videos, documents

```python
class Media(models.Model):
    """
    Media files - scoped to company.
    Each company has isolated media storage.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'ecommerce.EcommerceCompany',
        on_delete=models.CASCADE,
        related_name='news_media',
        db_index=True
    )
    
    filename = models.CharField(max_length=255)
    original_filename = models.CharField(max_length=255, blank=True)
    file_path = models.CharField(max_length=500)  # Storage path
    file_url = models.URLField()  # Public URL
    file_size = models.IntegerField(null=True, blank=True)
    mime_type = models.CharField(max_length=100)
    
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('document', 'Document'),
        ('embed', 'Embed'),
    ]
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPE_CHOICES)
    
    # Image/Video metadata
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    duration_seconds = models.IntegerField(null=True, blank=True)
    
    # Metadata
    alt_text = models.CharField(max_length=255, blank=True)
    caption = models.TextField(blank=True)
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_media'
    )
    is_public = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'news_media'
        indexes = [
            models.Index(fields=['company', 'media_type']),
            models.Index(fields=['company', 'uploaded_by']),
        ]
```

#### `Gallery` & `GalleryMedia`
**Tenancy**: ✅ **TENANT-SCOPED**
**Purpose**: Organize media into galleries

```python
class Gallery(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'ecommerce.EcommerceCompany',
        on_delete=models.CASCADE,
        related_name='news_galleries',
        db_index=True
    )
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    slug = models.SlugField(max_length=255, db_index=True)
    cover_image = models.ForeignKey(
        Media,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='gallery_covers'
    )
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    is_public = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'news_galleries'
        unique_together = [['company', 'slug']]

class GalleryMedia(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gallery = models.ForeignKey(Gallery, on_delete=models.CASCADE, related_name='gallery_items')
    media = models.ForeignKey(Media, on_delete=models.CASCADE)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'news_gallery_media'
        unique_together = [['gallery', 'media']]
```

---

### 4. Article Models

#### `Article` (Main Content)
**Tenancy**: ✅ **TENANT-SCOPED** (each company publishes their own articles)
**Purpose**: News articles and content

```python
class Article(models.Model):
    """
    News articles - scoped to company.
    Each news organization publishes their own articles.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'ecommerce.EcommerceCompany',
        on_delete=models.CASCADE,
        related_name='articles',
        db_index=True
    )
    
    # Basic Content
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, db_index=True)
    subtitle = models.CharField(max_length=300, blank=True)
    excerpt = models.TextField(blank=True)
    content = models.TextField()
    
    CONTENT_TYPE_CHOICES = [
        ('article', 'Article'),
        ('gallery', 'Gallery'),
        ('video', 'Video'),
        ('podcast', 'Podcast'),
        ('live_blog', 'Live Blog'),
    ]
    content_type = models.CharField(
        max_length=20,
        choices=CONTENT_TYPE_CHOICES,
        default='article'
    )
    
    # Relations
    featured_media = models.ForeignKey(
        Media,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='featured_articles'
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='authored_articles'
    )
    co_authors = models.ManyToManyField(
        User,
        blank=True,
        related_name='co_authored_articles'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='articles'
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name='articles')
    
    # Status
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('published', 'Published'),
        ('archived', 'Archived'),
        ('featured', 'Featured'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_premium = models.BooleanField(default=False)
    is_breaking_news = models.BooleanField(default=False)
    is_trending = models.BooleanField(default=False)
    
    # SEO
    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.TextField(blank=True)
    social_image = models.ForeignKey(
        Media,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='social_articles'
    )
    
    # Analytics
    views = models.IntegerField(default=0)
    likes = models.IntegerField(default=0)
    shares = models.IntegerField(default=0)
    read_time_minutes = models.IntegerField(null=True, blank=True)
    
    # Scheduling
    published_at = models.DateTimeField(null=True, blank=True)
    scheduled_for = models.DateTimeField(null=True, blank=True)
    
    # Geo-tagging (requires PostGIS extension)
    location_name = models.CharField(max_length=200, blank=True)
    # location_coords = models.PointField(null=True, blank=True)  # If PostGIS available
    
    # Versioning
    version = models.IntegerField(default=1)
    parent_version = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='versions'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'news_articles'
        unique_together = [['company', 'slug']]
        indexes = [
            models.Index(fields=['company', 'status', 'published_at']),
            models.Index(fields=['company', 'author']),
            models.Index(fields=['company', 'category']),
        ]
```

#### `ArticleTag` & `ArticleMedia` (Junction Tables)
**Tenancy**: ✅ **TENANT-SCOPED** (via Article)

```python
class ArticleTag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='article_tag_relations')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'news_article_tags'
        unique_together = [['article', 'tag']]

class ArticleMedia(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='article_media_relations')
    media = models.ForeignKey(Media, on_delete=models.CASCADE)
    sort_order = models.IntegerField(default=0)
    caption = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'news_article_media'
```

---

### 5. Business Directory Models

#### `Business` (Business Listings)
**Tenancy**: ✅ **TENANT-SCOPED** (each company manages their own business directory)
**Purpose**: Local business listings

```python
class Business(models.Model):
    """
    Business directory listings - scoped to company.
    Each news organization manages their own business directory.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'ecommerce.EcommerceCompany',
        on_delete=models.CASCADE,
        related_name='businesses',
        db_index=True
    )
    
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, db_index=True)
    description = models.TextField(blank=True)
    long_description = models.TextField(blank=True)
    industry = models.CharField(max_length=100, blank=True)
    
    # Contact
    website_url = models.URLField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    
    # Address
    address = models.CharField(max_length=500, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    # coordinates = models.PointField(null=True, blank=True)  # If PostGIS available
    
    # Media
    logo = models.ForeignKey(
        Media,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='business_logos'
    )
    cover_image = models.ForeignKey(
        Media,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='business_covers'
    )
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_businesses'
    )
    
    # Business Details
    business_hours = models.JSONField(default=dict, blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    services = models.JSONField(default=list, blank=True)  # Array of strings
    
    # Verification & Ratings
    is_verified = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)
    review_count = models.IntegerField(default=0)
    
    # SEO
    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'news_businesses'
        unique_together = [['company', 'slug']]
        indexes = [
            models.Index(fields=['company', 'is_verified']),
            models.Index(fields=['company', 'industry']),
        ]
```

#### `BusinessMedia` & `BusinessReview`
**Tenancy**: ✅ **TENANT-SCOPED** (via Business)

```python
class BusinessMedia(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='business_media_relations')
    media = models.ForeignKey(Media, on_delete=models.CASCADE)
    media_type = models.CharField(max_length=20, blank=True)  # 'logo', 'cover', 'gallery'
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'news_business_media'

class BusinessReview(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='business_reviews'
    )
    reviewer_name = models.CharField(max_length=200, blank=True)
    reviewer_email = models.EmailField(blank=True)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200, blank=True)
    comment = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'news_business_reviews'
```

#### `Advertisement`
**Tenancy**: ✅ **TENANT-SCOPED** (via Business)

```python
class Advertisement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='advertisements')
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ForeignKey(
        Media,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='advertisements'
    )
    image_url = models.URLField(blank=True)  # Fallback for external images
    link_url = models.URLField(blank=True)
    
    POSITION_CHOICES = [
        ('header', 'Header'),
        ('sidebar', 'Sidebar'),
        ('content', 'Content'),
        ('footer', 'Footer'),
    ]
    position = models.CharField(max_length=20, choices=POSITION_CHOICES)
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('expired', 'Expired'),
        ('pending_approval', 'Pending Approval'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    impressions = models.IntegerField(default=0)
    clicks = models.IntegerField(default=0)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'news_advertisements'
```

---

### 6. Comments System

#### `Comment`
**Tenancy**: ✅ **TENANT-SCOPED** (via Article)

```python
class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )
    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='comments'
    )
    author_name = models.CharField(max_length=200, blank=True)
    author_email = models.EmailField(blank=True)
    content = models.TextField()
    is_approved = models.BooleanField(default=False)
    is_spam = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'news_comments'
        indexes = [
            models.Index(fields=['article', 'is_approved']),
        ]
```

---

### 7. RSS Feed Models

#### `RSSSource` & `RSSArticleTracking`
**Tenancy**: ✅ **TENANT-SCOPED** (each company manages their own RSS feeds)

```python
class RSSSource(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'ecommerce.EcommerceCompany',
        on_delete=models.CASCADE,
        related_name='rss_sources',
        db_index=True
    )
    
    name = models.CharField(max_length=200)
    url = models.URLField()
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('error', 'Error'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    last_fetched_at = models.DateTimeField(null=True, blank=True)
    last_error = models.TextField(blank=True)
    fetch_interval_minutes = models.IntegerField(default=60)
    max_articles_per_fetch = models.IntegerField(default=10)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'news_rss_sources'
        unique_together = [['company', 'url']]

class RSSArticleTracking(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rss_source = models.ForeignKey(RSSSource, on_delete=models.CASCADE, related_name='tracked_articles')
    external_id = models.CharField(max_length=500)  # RSS item GUID or link
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='rss_tracking')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'news_rss_article_tracking'
        unique_together = [['rss_source', 'external_id']]
```

---

### 8. System Models

#### `Notification`
**Tenancy**: ✅ **TENANT-SCOPED** (via User, but filtered by company context)
**Purpose**: User notifications

```python
class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    company = models.ForeignKey(
        'ecommerce.EcommerceCompany',
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True,
        help_text='Company context for this notification'
    )
    
    TYPE_CHOICES = [
        ('breaking_news', 'Breaking News'),
        ('new_article', 'New Article'),
        ('comment_reply', 'Comment Reply'),
        ('subscription_reminder', 'Subscription Reminder'),
    ]
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField(blank=True)
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'news_notifications'
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['company', 'created_at']),
        ]
```

#### `SiteSetting`
**Tenancy**: ✅ **TENANT-SCOPED** (each company has their own settings)
**Purpose**: Site configuration

```python
class SiteSetting(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'ecommerce.EcommerceCompany',
        on_delete=models.CASCADE,
        related_name='site_settings',
        db_index=True
    )
    
    key = models.CharField(max_length=100, db_index=True)
    value = models.TextField(blank=True)
    description = models.TextField(blank=True)
    
    TYPE_CHOICES = [
        ('string', 'String'),
        ('number', 'Number'),
        ('boolean', 'Boolean'),
        ('json', 'JSON'),
    ]
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='string')
    is_public = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'news_site_settings'
        unique_together = [['company', 'key']]
```

#### `UserSession`
**Tenancy**: ❌ **NOT tenant-scoped** (user-level analytics)
**Purpose**: Track user sessions

```python
class UserSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sessions'
    )
    session_id = models.CharField(max_length=255, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    page_views = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'news_user_sessions'
```

#### `TeamMember` & `Testimonial`
**Tenancy**: ✅ **TENANT-SCOPED** (company-specific content)

```python
class TeamMember(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'ecommerce.EcommerceCompany',
        on_delete=models.CASCADE,
        related_name='team_members',
        db_index=True
    )
    
    name = models.CharField(max_length=200)
    title = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    image = models.ForeignKey(
        Media,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='team_member_images'
    )
    social_links = models.JSONField(default=dict, blank=True)
    is_featured = models.BooleanField(default=False)
    sort_order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'news_team_members'

class Testimonial(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'ecommerce.EcommerceCompany',
        on_delete=models.CASCADE,
        related_name='testimonials',
        db_index=True
    )
    
    name = models.CharField(max_length=200)
    title = models.CharField(max_length=200, blank=True)
    company_name = models.CharField(max_length=200, blank=True)
    content = models.TextField()
    image = models.ForeignKey(
        Media,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='testimonial_images'
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    is_featured = models.BooleanField(default=False)
    sort_order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'news_testimonials'
```

#### `AudioRecording` & `ContentImport`
**Tenancy**: ✅ **TENANT-SCOPED** (via User, but company context needed)

```python
class AudioRecording(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='audio_recordings')
    company = models.ForeignKey(
        'ecommerce.EcommerceCompany',
        on_delete=models.CASCADE,
        related_name='audio_recordings',
        db_index=True
    )
    media = models.ForeignKey(
        Media,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audio_recordings'
    )
    audio_url = models.URLField()
    transcription = models.TextField(blank=True)
    duration_seconds = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'news_audio_recordings'

class ContentImport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='content_imports')
    company = models.ForeignKey(
        'ecommerce.EcommerceCompany',
        on_delete=models.CASCADE,
        related_name='content_imports',
        db_index=True
    )
    filename = models.CharField(max_length=255)
    file_url = models.URLField()
    imported_articles = models.IntegerField(default=0)
    total_articles = models.IntegerField(default=0)
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'news_content_imports'
```

---

## Summary: Tables by Tenancy

### ✅ Tenant-Scoped (Require `company` ForeignKey)
1. `Category` - Article categories
2. `Tag` - Article tags
3. `Media` - File storage
4. `Gallery` & `GalleryMedia` - Media galleries
5. `Article` & `ArticleTag` & `ArticleMedia` - Articles
6. `Business` & `BusinessMedia` & `BusinessReview` - Business directory
7. `Advertisement` - Advertisements
8. `Comment` - Comments (via Article)
9. `RSSSource` & `RSSArticleTracking` - RSS feeds
10. `Notification` - Notifications (with company context)
11. `SiteSetting` - Site settings
12. `TeamMember` - Team members
13. `Testimonial` - Testimonials
14. `AudioRecording` - Audio recordings
15. `ContentImport` - Content imports

### ❌ NOT Tenant-Scoped (Shared/User-level)
1. `Profile` - User profiles (extends User)
2. `UserSession` - User sessions (analytics)

---

## Registration & Authentication Flow

### Business Registration
1. **Frontend**: Business registers via `/api/auth/register/`
2. **Backend**: Creates:
   - Django `User` account
   - `EcommerceCompany` record (tenant)
   - `Profile` record (news platform profile)
3. **Response**: Returns JWT tokens + `company_id`
4. **Frontend**: Stores `company_id` for future API requests

### API Request Flow
1. **Frontend**: Sends request with:
   - `Authorization: Bearer <jwt_token>`
   - `X-Company-Id: <company_uuid>` header
2. **Backend**: 
   - Validates JWT token
   - Extracts company from `X-Company-Id` header
   - Verifies user has access to company
   - Filters queryset by `company`
3. **Response**: Returns company-scoped data

### Example API Usage

```javascript
// Frontend API client
const apiClient = axios.create({
  baseURL: 'https://api.example.com/api/news/',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'X-Company-Id': companyId  // Required for all requests
  }
});

// Get articles (automatically filtered by company)
const articles = await apiClient.get('/articles/');

// Create article (automatically assigned to company)
const newArticle = await apiClient.post('/articles/', {
  title: 'New Article',
  content: '...',
  // company is automatically set from X-Company-Id header
});
```

---

## Implementation Notes

### 1. Company Context Middleware
Create middleware to automatically extract and validate company from request:

```python
# apps/news/middleware.py
class CompanyContextMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        company = get_company_from_request(request)
        request.company = company  # Attach to request
        return self.get_response(request)
```

### 2. ViewSet Base Class
Create base ViewSet that automatically filters by company:

```python
# apps/news/views.py
class CompanyScopedViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = super().get_queryset()
        company = getattr(self.request, 'company', None)
        if company:
            return queryset.filter(company=company)
        return queryset.none()  # No company = no data
    
    def perform_create(self, serializer):
        company = getattr(self.request, 'company', None)
        if not company:
            raise PermissionDenied('Company context required')
        serializer.save(company=company)
```

### 3. Permissions
Create permission classes that check company access:

```python
# apps/news/permissions.py
class HasCompanyAccess(permissions.BasePermission):
    def has_permission(self, request, view):
        company = getattr(request, 'company', None)
        if not company:
            return False
        # Check user owns or is member of company
        return company.owner == request.user or request.user in company.users.all()
```

---

## Database Migration Strategy

### Phase 1: Core Models
1. `Profile` (extends User)
2. `Category`, `Tag`
3. `Media`, `Gallery`

### Phase 2: Content Models
4. `Article`, `ArticleTag`, `ArticleMedia`
5. `Comment`

### Phase 3: Business Directory
6. `Business`, `BusinessMedia`, `BusinessReview`
7. `Advertisement`

### Phase 4: System Models
8. `RSSSource`, `RSSArticleTracking`
9. `Notification`, `SiteSetting`
10. `TeamMember`, `Testimonial`
11. `AudioRecording`, `ContentImport`
12. `UserSession`

---

## Estimated Tables Summary

**Total Tables**: ~25 tables
- **Tenant-scoped**: ~23 tables
- **Shared**: ~2 tables

**Key Relationships**:
- All tenant-scoped tables link to `EcommerceCompany`
- User-related tables link to Django `User`
- Media relationships throughout

---

## Next Steps

1. ✅ Review this analysis
2. ⏳ Create Django app structure (`apps/news/`)
3. ⏳ Implement models with company foreign keys
4. ⏳ Create migrations
5. ⏳ Implement ViewSets with company filtering
6. ⏳ Create API endpoints
7. ⏳ Update frontend to use `X-Company-Id` header
8. ⏳ Test registration and data isolation

---

*Document created for discussion purposes - no backend changes made yet.*

