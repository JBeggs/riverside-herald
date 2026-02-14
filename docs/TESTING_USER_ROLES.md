# User Roles Testing Guide

This document provides a testing checklist for verifying role-based permissions in The Riverside Herald. Use this to validate that each user role has the correct access level.

## Prerequisites

1. Run the test user script to create users for each role:
   ```bash
   npx tsx scripts/add-test-users.ts
   ```

2. Ensure Supabase is configured and the database has the required tables.

## Role Testing Checklist

### Admin

| Test | Expected | Result |
|------|----------|--------|
| Access `/admin` dashboard | Full access | |
| Create/edit/delete any article | Allowed | |
| Create/edit/delete any business | Allowed | |
| Manage users and roles | Allowed | |
| Access all system settings | Allowed | |

**Test users:** mark.gray@example.com, jody.beggs@example.com

---

### Editor

| Test | Expected | Result |
|------|----------|--------|
| Access `/admin` dashboard | Limited (content only) | |
| Create/edit any article | Allowed | |
| Manage categories and tags | Allowed | |
| Manage users | Denied | |
| Manage businesses | Denied | |

**Note:** Add an editor test user via Supabase if not in add-test-users script.

---

### Author

| Test | Expected | Result |
|------|----------|--------|
| Access `/admin` | Denied or limited | |
| Create/edit own articles only | Allowed | |
| Edit another author's article | Denied | |
| Upload media for articles | Allowed | |
| Manage businesses | Denied | |

---

### Business Owner

| Test | Expected | Result |
|------|----------|--------|
| Access `/admin` | Denied | |
| Create/edit own business listing | Allowed | |
| Edit another business | Denied | |
| Manage media gallery for own business | Allowed | |
| Respond to reviews | Allowed | |

**Test users:** admin@fambrifarms.co.za, admin@paddlepower.co.za, admin@rustyfeather.co.za

---

### Subscriber

| Test | Expected | Result |
|------|----------|--------|
| Access `/admin` | Denied | |
| Comment on articles | Allowed | |
| Save/bookmark articles | Allowed | |
| Newsletter subscription | Allowed | |
| Create articles | Denied | |

---

### Premium Subscriber

| Test | Expected | Result |
|------|----------|--------|
| All Subscriber features | Allowed | |
| Access premium content | Allowed | |
| Ad-free experience | Yes | |

---

## Testing Procedure

1. **Create test users** for roles not covered by add-test-users (Editor, Author, Subscriber, Premium Subscriber)
2. **Log in** as each role and execute the checklist
3. **Record results** in the Result column
4. **Document any permission gaps** or RLS policy issues
5. **Fix** identified issues (e.g. avatar RLS - see [TODO_AVATAR_RLS.md](./TODO_AVATAR_RLS.md))

## Known Issues

- **Avatar RLS:** Profile avatar uploads may fail until storage RLS policies are configured. See [TODO_AVATAR_RLS.md](./TODO_AVATAR_RLS.md).

## Reference

- [USER_ROLES_GUIDE.md](./USER_ROLES_GUIDE.md) - Full role permissions reference
