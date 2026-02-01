# Admin Panel - Quick Reference Guide

## 🚀 Getting Started

### 1. Start Server
```bash
cd backend
npm run dev
```

### 2. Register Admin
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"Admin123","role":"admin"}'
```

### 3. Save Token
Copy the `token` from response and use it as `Bearer <token>` in Authorization header.

---

## 📋 API Endpoints

### User Management
```bash
# List all users
GET /api/admin/users?role=organizer&page=1&limit=20

# Get user details
GET /api/admin/users/:id

# Deactivate user
PATCH /api/admin/users/:id/status
Body: { "isActive": false }

# Delete user
DELETE /api/admin/users/:id
```

### Event Moderation
```bash
# List all events
GET /api/admin/events?status=published&isApproved=false

# Approve event
PATCH /api/admin/events/:id/approve

# Reject event
PATCH /api/admin/events/:id/reject
Body: { "reason": "Needs more details" }
```

### Analytics
```bash
# Platform overview
GET /api/admin/analytics/overview

# Growth trends
GET /api/admin/analytics/trends
```

---

## 🧪 Run Tests
```bash
node admin-test.js
```

---

## 📊 Sample Analytics Response

```json
{
  "users": {
    "total": 245,
    "byRole": {
      "organizer": { "total": 89, "active": 85, "verified": 72 },
      "sponsor": { "total": 142, "active": 138, "verified": 115 },
      "admin": { "total": 14, "active": 14, "verified": 14 }
    }
  },
  "events": {
    "total": 67,
    "totalApproved": 49
  },
  "proposals": {
    "total": 189,
    "byStatus": { "pending": 23, "accepted": 78, "rejected": 65 }
  },
  "collaborations": {
    "total": 78,
    "byStatus": { "active": 45, "completed": 18 }
  }
}
```

---

## 🔒 Business Rules

**User Management:**
- ❌ Cannot modify own status
- ❌ Cannot delete self
- ❌ Cannot delete other admins
- ✅ All deletes are soft (isActive=false)

**Event Moderation:**
- ❌ Can only approve published events
- ❌ Cannot re-approve approved events
- ✅ Rejection requires reason
- ✅ Rejected events → draft status

---

## 📁 Files Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── admin.user.controller.ts        ✅ User management
│   │   ├── admin.event.controller.ts       ✅ Event moderation
│   │   └── admin.analytics.controller.ts   ✅ Analytics
│   └── routes/
│       ├── admin.user.routes.ts            ✅ User routes
│       ├── admin.event.routes.ts           ✅ Event routes
│       └── admin.analytics.routes.ts       ✅ Analytics routes
├── ADMIN_API_DOCUMENTATION.md              📖 Full docs
├── ADMIN_IMPLEMENTATION_SUMMARY.md         📋 Summary
├── Admin_Panel_Postman_Collection.json     📮 Postman
└── admin-test.js                           🧪 Test suite
```

---

## ✅ Verification Checklist

- [x] All 3 controllers created
- [x] All 3 routes created
- [x] Routes registered in app.ts
- [x] All endpoints protected (auth + admin role)
- [x] 29 tests passing
- [x] TypeScript compilation successful
- [x] Documentation complete
- [x] Postman collection ready

---

## 💡 Tips

1. **Test with Postman:** Import `Admin_Panel_Postman_Collection.json`
2. **Run Full Tests:** `node admin-test.js` covers all scenarios
3. **Check Logs:** Server logs show all admin actions
4. **Use Filters:** Combine multiple query params for precise results
5. **Pagination:** Use `page` and `limit` for large datasets

---

## 🔍 Common Queries

```bash
# Active organizers only
GET /api/admin/users?role=organizer&isActive=true

# Pending approval events
GET /api/admin/events?status=published&isApproved=false

# Search by name
GET /api/admin/users?search=john

# Recent events
GET /api/admin/events?page=1&limit=10
```

---

**Status:** ✅ Production Ready  
**Tests:** ✅ 29/29 Passing  
**Documentation:** ✅ Complete
