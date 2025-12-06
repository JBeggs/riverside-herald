# Django Project Structure Example

This document shows what the Django backend structure would look like after migration.

## Project Structure

```
river_side_herald_backend/
├── manage.py
├── requirements.txt
├── .env
├── .gitignore
│
├── config/                          # Main project settings
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py                  # Base settings
│   │   ├── development.py           # Dev settings
│   │   └── production.py             # Prod settings
│   ├── urls.py                      # Root URL config
│   ├── wsgi.py
│   └── asgi.py
│
├── apps/
│   ├── accounts/                    # User management
│   │   ├── __init__.py
│   │   ├── models.py                # Profile model
│   │   ├── serializers.py
│   │   ├── views.py                 # Auth views
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   └── admin.py
│   │
│   ├── articles/                    # Article management
│   │   ├── __init__.py
│   │   ├── models.py                # Article, Category, Tag, Comment
│   │   ├── serializers.py
│   │   ├── views.py                 # Article CRUD
│   │   ├── urls.py
│   │   ├── filters.py               # Django-filter
│   │   ├── permissions.py
│   │   └── admin.py
│   │
│   ├── businesses/                  # Business directory
│   │   ├── __init__.py
│   │   ├── models.py                # Business, Review, Advertisement
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── filters.py
│   │   └── admin.py
│   │
│   ├── media/                       # Media management
│   │   ├── __init__.py
│   │   ├── models.py                # Media, Gallery
│   │   ├── serializers.py
│   │   ├── views.py                 # File upload
│   │   ├── urls.py
│   │   ├── storage.py               # Custom storage backend
│   │   └── admin.py
│   │
│   ├── subscriptions/              # Subscription system
│   │   ├── __init__.py
│   │   ├── models.py                # Plan, Subscription, Payment
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│   │
│   ├── rss/                         # RSS feed management
│   │   ├── __init__.py
│   │   ├── models.py                # RSSSource, RSSFetchLog
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── tasks.py                 # Celery tasks
│   │   └── admin.py
│   │
│   ├── notifications/              # Notification system
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│   │
│   └── analytics/                   # Analytics
│       ├── __init__.py
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       └── urls.py
│
├── utils/                           # Shared utilities
│   ├── __init__.py
│   ├── permissions.py              # Custom permission classes
│   ├── pagination.py                # Custom pagination
│   ├── filters.py                   # Custom filters
│   └── validators.py                # Field validators
│
├── tasks/                           # Celery tasks
│   ├── __init__.py
│   ├── rss_tasks.py                 # RSS fetching
│   ├── email_tasks.py                # Email sending
│   └── analytics_tasks.py            # Analytics aggregation
│
└── tests/                           # Test suite
    ├── __init__.py
    ├── test_articles.py
    ├── test_businesses.py
    ├── test_auth.py
    └── test_api.py
```

## Example Model (Article)

```python
# apps/articles/models.py

from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class ArticleStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    SCHEDULED = 'scheduled', 'Scheduled'
    PUBLISHED = 'published', 'Published'
    ARCHIVED = 'archived', 'Archived'
    FEATURED = 'featured', 'Featured'

class ContentType(models.TextChoices):
    ARTICLE = 'article', 'Article'
    GALLERY = 'gallery', 'Gallery'
    VIDEO = 'video', 'Video'
    PODCAST = 'podcast', 'Podcast'
    LIVE_BLOG = 'live_blog', 'Live Blog'

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#3B82F6')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    sort_order = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name

class Tag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#6B7280')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Article(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    subtitle = models.CharField(max_length=300, blank=True)
    excerpt = models.TextField(blank=True)
    content = models.TextField()
    content_type = models.CharField(
        max_length=20,
        choices=ContentType.choices,
        default=ContentType.ARTICLE
    )
    
    # Relations
    featured_media = models.ForeignKey(
        'media.Media',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='featured_articles'
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='articles'
    )
    co_authors = models.ManyToManyField(User, blank=True, related_name='co_authored_articles')
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='articles'
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name='articles')
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=ArticleStatus.choices,
        default=ArticleStatus.DRAFT
    )
    is_premium = models.BooleanField(default=False)
    is_breaking_news = models.BooleanField(default=False)
    is_trending = models.BooleanField(default=False)
    
    # SEO
    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.TextField(blank=True)
    social_image = models.ForeignKey(
        'media.Media',
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
    
    # Geo-tagging
    location_name = models.CharField(max_length=200, blank=True)
    location_coords = models.PointField(null=True, blank=True)  # Requires PostGIS
    
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
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['author', 'status']),
            models.Index(fields=['category', 'status']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
```

## Example Serializer

```python
# apps/articles/serializers.py

from rest_framework import serializers
from .models import Article, Category, Tag

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'color', 'is_featured']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'description', 'color']

class ArticleListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'excerpt', 'status',
            'category', 'tags', 'author_name',
            'views', 'likes', 'published_at', 'created_at'
        ]

class ArticleDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    author = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'views', 'likes', 'shares']
    
    def get_author(self, obj):
        return {
            'id': obj.author.id,
            'full_name': obj.author.get_full_name(),
            'avatar_url': obj.author.profile.avatar_url if hasattr(obj.author, 'profile') else None
        }
```

## Example ViewSet

```python
# apps/articles/views.py

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from .models import Article
from .serializers import ArticleListSerializer, ArticleDetailSerializer
from .permissions import IsAuthorOrReadOnly
from .filters import ArticleFilter

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.filter(status='published')
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ArticleFilter
    search_fields = ['title', 'excerpt', 'content']
    ordering_fields = ['published_at', 'created_at', 'views', 'likes']
    ordering = ['-published_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ArticleListSerializer
        return ArticleDetailSerializer
    
    def get_queryset(self):
        queryset = Article.objects.all()
        
        # Filter by status based on user permissions
        if self.request.user.is_authenticated:
            user = self.request.user
            if user.profile.role in ['admin', 'editor']:
                # Admins/editors can see all articles
                pass
            elif user.profile.role == 'author':
                # Authors can see their own articles + published
                queryset = queryset.filter(
                    models.Q(status='published') | 
                    models.Q(author=user)
                )
            else:
                # Regular users only see published
                queryset = queryset.filter(status='published')
        else:
            # Anonymous users only see published
            queryset = queryset.filter(status='published')
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        article = self.get_object()
        article.views += 1
        article.save(update_fields=['views'])
        return Response({'views': article.views})
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        article = self.get_object()
        article.likes += 1
        article.save(update_fields=['likes'])
        return Response({'likes': article.likes})
```

## Example URL Configuration

```python
# config/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'articles', ArticleViewSet, basename='article')
router.register(r'businesses', BusinessViewSet, basename='business')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'media', MediaViewSet, basename='media')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/', include(router.urls)),
]
```

## Example Settings

```python
# config/settings/base.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'storages',  # For S3
    
    # Local apps
    'apps.accounts',
    'apps.articles',
    'apps.businesses',
    'apps.media',
    'apps.subscriptions',
    'apps.rss',
    'apps.notifications',
    'apps.analytics',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://yourdomain.com",
]
```

---

This structure provides a clear roadmap for organizing the Django backend after migration.

