# User Roles & Permissions Guide

This document provides a comprehensive overview of the different user types and their permissions within The Riverside Herald platform.

## 🔑 Site Owner / Site Manager (Admin)
The Site Owner and Site Manager both utilize the **Admin** role. This is the highest level of access, providing full control over the entire platform.

**Permissions:**
- **System Management**: Access to all system settings and configurations.
- **User Management**: Create, edit, delete users and assign/modify roles.
- **Content Oversight**: Manage all articles, businesses, categories, and tags across the site.
- **Business Verification**: Review and verify business listings.
- **Analytics**: Access to full system statistics and performance data.
- **Admin Panel**: Full access to the `/admin` dashboard.

---

## 📝 Authors
Authors are the primary content creators for the news platform.

**Permissions:**
- **Article Creation**: Create and edit their own articles.
- **Media Management**: Upload images and media for their content.
- **Personal Dashboard**: Access to the author dashboard to track their contributions.
- **Profile Management**: Update their own author bio and profile information.

---

## 🏢 Business Owners
Business Owners are users who manage one or more local business listings in the directory.

**Permissions:**
- **Business Management**: Create and update their own business listings (hours, services, contact info).
- **Media Galleries**: Manage image galleries for their businesses.
- **Engagement**: Respond to reviews and interact with customers.
- **Article Creation**: (Optional/Role-dependent) May have permissions to write articles related to their business or local area.

---

## 👤 Regular Users (Subscribers & Visitors)
Regular users include both anonymous visitors and registered subscribers.

**Permissions:**
- **Engagement**: Comment on articles and interact with the community.
- **Personalization**: Save/bookmark articles for later reading.
- **Newsletters**: Subscribe to and manage newsletter preferences.
- **Profile**: Basic profile management (avatar, display name).
- **Premium Features**: (If Premium Subscriber) Access to exclusive content and an ad-free experience.

---

## Role Hierarchy Summary

| Feature | Admin | Editor | Author | Business Owner | Subscriber |
|---------|-------|--------|--------|----------------|------------|
| Access `/admin` | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage All Articles | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Own Articles | ✅ | ✅ | ✅ | ✅* | ❌ |
| Manage All Businesses| ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Own Business | ✅ | ❌ | ❌ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ |

*\*Depending on specific site configuration.*
