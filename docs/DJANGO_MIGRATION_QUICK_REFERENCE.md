# Django Migration Quick Reference

## TL;DR

**Current**: Next.js 15 + Supabase (PostgreSQL + Auth + Storage)  
**Target**: Next.js 15 + Django REST API + PostgreSQL  
**Estimated Time**: 4-6 months  
**Estimated Cost**: $90-380/month infrastructure + development costs

---

## Key Migration Points

### 1. Database (2-3 weeks)
- ✅ 15+ Django models to create
- ✅ Convert PostgreSQL enums → Django choices
- ✅ JSONB fields → Django JSONField
- ✅ RLS policies → Django permissions/querysets
- ✅ Triggers → Django signals

### 2. Authentication (1-2 weeks)
- ✅ Supabase Auth → Django JWT (djangorestframework-simplejwt)
- ✅ Update frontend AuthContext
- ✅ Replace all auth calls in components

### 3. API Layer (3-4 weeks)
- ✅ Create DRF serializers for all models
- ✅ Build ViewSets/APIViews for CRUD operations
- ✅ Implement filtering, pagination, search
- ✅ ~20+ API endpoints needed

### 4. File Storage (1-2 weeks)
- ✅ Supabase Storage → AWS S3/Cloudinary/local
- ✅ Create upload API endpoints
- ✅ Migrate existing files
- ✅ Update file references

### 5. Frontend Updates (2-3 weeks)
- ✅ Replace Supabase client → API client
- ✅ Update all components using Supabase
- ✅ Update AuthContext
- ✅ Handle JWT tokens

---

## Required Django Packages

```python
Django==4.2.x
djangorestframework==3.14.x
djangorestframework-simplejwt==5.3.x
psycopg2-binary==2.9.x
django-storages==1.14.x
celery==5.3.x
redis==5.0.x
django-cors-headers==4.3.x
django-filter==23.x
Pillow==10.x
```

---

## API Endpoints Needed

```
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/logout/
POST   /api/auth/refresh/

GET    /api/articles/
POST   /api/articles/
GET    /api/articles/{id}/
PUT    /api/articles/{id}/
DELETE /api/articles/{id}/

GET    /api/businesses/
POST   /api/businesses/
GET    /api/businesses/{id}/
PUT    /api/businesses/{id}/

POST   /api/media/upload/
GET    /api/media/

GET    /api/categories/
GET    /api/tags/

GET    /api/comments/
POST   /api/comments/

GET    /api/rss/sources/
POST   /api/rss/fetch/
```

---

## Migration Checklist

### Backend
- [ ] Set up Django project
- [ ] Create all models (15+)
- [ ] Set up migrations
- [ ] Implement authentication
- [ ] Create API endpoints
- [ ] Set up file storage
- [ ] Configure permissions
- [ ] Set up background tasks
- [ ] Write tests

### Frontend
- [ ] Create API client utility
- [ ] Update AuthContext
- [ ] Replace Supabase calls in components
- [ ] Update all pages
- [ ] Handle errors
- [ ] Test all features

### Data Migration
- [ ] Export data from Supabase
- [ ] Transform data
- [ ] Import to Django
- [ ] Migrate files
- [ ] Verify integrity

### Deployment
- [ ] Set up production environment
- [ ] Configure database
- [ ] Deploy backend
- [ ] Update frontend
- [ ] Monitor and debug

---

## Major Challenges

1. **Data Migration**: Moving all data safely
2. **Authentication**: Users need to re-login
3. **File Storage**: Moving files from Supabase
4. **Real-time**: Need Django Channels if using
5. **Performance**: Query optimization needed
6. **RLS**: Convert to Django permissions

---

## Cost Breakdown

### Infrastructure (Monthly)
- Hosting: $50-200
- Database: $20-100
- File Storage: $10-50
- Redis/Cache: $10-30
- **Total**: $90-380/month

### Development
- 4-6 months of development
- Team: 1-2 Django devs, 1 frontend dev, 1 DevOps, 1 QA

---

## Decision Matrix

### Migrate if:
- ✅ Need more backend control
- ✅ Want Django admin interface
- ✅ Have Python expertise
- ✅ Need complex business logic
- ✅ Want Django ecosystem

### Don't migrate if:
- ❌ Current system works well
- ❌ Need real-time features (Supabase better)
- ❌ Team is JS/TS focused
- ❌ Tight timeline/budget
- ❌ Happy with Supabase

---

## Quick Start (If Proceeding)

1. **Week 1-2**: Set up Django project, install packages
2. **Week 3-4**: Create all models
3. **Week 5-6**: Implement authentication
4. **Week 7-10**: Build API endpoints
5. **Week 11-12**: Advanced features
6. **Week 13**: File storage
7. **Week 14-16**: Frontend updates
8. **Week 17-18**: Testing
9. **Week 19-20**: Deployment
10. **Week 21**: Data migration

---

## Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [DRF Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- [Django Channels](https://channels.readthedocs.io/) (for WebSockets)

---

*See `DJANGO_MIGRATION_ANALYSIS.md` for detailed analysis.*

