# Admin Panel API Documentation

## Overview
This document provides comprehensive documentation for the Admin Panel backend APIs of the Event Sponsorship & Collaboration Platform.

## Authentication
All admin endpoints require:
1. Valid JWT token in `Authorization` header: `Bearer <token>`
2. User must have `role: "admin"`

---

## 📋 1. USER MANAGEMENT APIs

### GET /api/admin/users
Get all users with filters and pagination.

**Query Parameters:**
- `role` (optional): Filter by role (`organizer`, `sponsor`, `admin`)
- `isActive` (optional): Filter by active status (`true`, `false`)
- `isVerified` (optional): Filter by verified status (`true`, `false`)
- `search` (optional): Search by name, email, or organization name
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/users?role=organizer&isActive=true&page=1&limit=20" \
  -H "Authorization: Bearer <admin_token>"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Organizer",
      "email": "john@techconf.com",
      "role": "organizer",
      "organizationName": "TechConf 2024",
      "phone": "+1-555-0100",
      "isActive": true,
      "isVerified": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-20T14:45:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### GET /api/admin/users/:id
Get single user by ID.

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/users/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <admin_token>"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Organizer",
    "email": "john@techconf.com",
    "role": "organizer",
    "organizationName": "TechConf 2024",
    "phone": "+1-555-0100",
    "isActive": true,
    "isVerified": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:45:00.000Z"
  }
}
```

---

### PATCH /api/admin/users/:id/status
Activate or deactivate a user.

**Request Body:**
```json
{
  "isActive": false
}
```

**Example Request:**
```bash
curl -X PATCH "http://localhost:5000/api/admin/users/507f1f77bcf86cd799439011/status" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

**Example Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Organizer",
    "email": "john@techconf.com",
    "isActive": false
  }
}
```

**Business Rules:**
- Admin cannot modify their own status
- Returns 403 if attempting to modify self

---

### DELETE /api/admin/users/:id
Soft delete a user (sets `isActive = false`).

**Example Request:**
```bash
curl -X DELETE "http://localhost:5000/api/admin/users/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <admin_token>"
```

**Example Response:**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Organizer",
    "email": "john@techconf.com",
    "isActive": false
  }
}
```

**Business Rules:**
- Admin cannot delete themselves
- Admin cannot delete other admins
- This is a soft delete (user record remains in database)

---

## 🎉 2. EVENT MODERATION APIs

### GET /api/admin/events
Get all events (any status) with filters and pagination.

**Query Parameters:**
- `status` (optional): Filter by status (`draft`, `published`, `closed`)
- `isApproved` (optional): Filter by approval status (`true`, `false`)
- `eventMode` (optional): Filter by mode (`online`, `offline`, `hybrid`)
- `search` (optional): Search by title or description
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/events?status=published&isApproved=false&page=1" \
  -H "Authorization: Bearer <admin_token>"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439022",
      "title": "TechConf 2024",
      "description": "Annual technology conference",
      "startDate": "2024-06-15T09:00:00.000Z",
      "endDate": "2024-06-17T18:00:00.000Z",
      "eventMode": "hybrid",
      "status": "published",
      "isApproved": false,
      "organizer": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Organizer",
        "email": "john@techconf.com",
        "organizationName": "TechConf 2024"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "totalPages": 1
  }
}
```

---

### PATCH /api/admin/events/:id/approve
Approve an event (makes it publicly visible).

**Example Request:**
```bash
curl -X PATCH "http://localhost:5000/api/admin/events/507f1f77bcf86cd799439022/approve" \
  -H "Authorization: Bearer <admin_token>"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Event approved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439022",
    "title": "TechConf 2024",
    "status": "published",
    "isApproved": true,
    "organizer": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Organizer",
      "email": "john@techconf.com"
    }
  }
}
```

**Business Rules:**
- Only published events can be approved
- Returns 400 if event is not published
- Returns 400 if event is already approved

---

### PATCH /api/admin/events/:id/reject
Reject an event with reason.

**Request Body:**
```json
{
  "reason": "Event description does not meet quality standards. Please provide more details about speakers and agenda."
}
```

**Example Request:**
```bash
curl -X PATCH "http://localhost:5000/api/admin/events/507f1f77bcf86cd799439022/reject" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Event description does not meet quality standards."}'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Event rejected successfully",
  "data": {
    "event": {
      "_id": "507f1f77bcf86cd799439022",
      "title": "TechConf 2024",
      "status": "draft",
      "isApproved": false,
      "organizer": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Organizer",
        "email": "john@techconf.com"
      }
    },
    "rejectionReason": "Event description does not meet quality standards."
  }
}
```

**Business Rules:**
- Rejection reason is required
- Sets event status back to `draft`
- Sets `isApproved` to `false`

---

## 📊 3. PLATFORM ANALYTICS APIs

### GET /api/admin/analytics/overview
Get platform overview statistics.

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/analytics/overview" \
  -H "Authorization: Bearer <admin_token>"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 245,
      "byRole": {
        "organizer": {
          "total": 89,
          "active": 85,
          "verified": 72
        },
        "sponsor": {
          "total": 142,
          "active": 138,
          "verified": 115
        },
        "admin": {
          "total": 14,
          "active": 14,
          "verified": 14
        }
      }
    },
    "events": {
      "total": 67,
      "byStatus": {
        "draft": {
          "total": 12,
          "approved": 0
        },
        "published": {
          "total": 48,
          "approved": 42
        },
        "closed": {
          "total": 7,
          "approved": 7
        }
      },
      "totalApproved": 49
    },
    "proposals": {
      "total": 189,
      "byStatus": {
        "pending": 23,
        "accepted": 78,
        "rejected": 65,
        "negotiation": 23
      }
    },
    "collaborations": {
      "total": 78,
      "byStatus": {
        "pending": 12,
        "active": 45,
        "completed": 18,
        "terminated": 3
      }
    },
    "generatedAt": "2024-02-01T10:30:00.000Z"
  }
}
```

---

### GET /api/admin/analytics/trends
Get platform growth trends (last 6 months).

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/analytics/trends" \
  -H "Authorization: Bearer <admin_token>"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2023-08-01T10:30:00.000Z",
      "to": "2024-02-01T10:30:00.000Z"
    },
    "userTrends": [
      {
        "period": "August 2023",
        "year": 2023,
        "month": 8,
        "total": 42,
        "organizers": 15,
        "sponsors": 25,
        "admins": 2
      },
      {
        "period": "September 2023",
        "year": 2023,
        "month": 9,
        "total": 38,
        "organizers": 14,
        "sponsors": 24,
        "admins": 0
      },
      {
        "period": "October 2023",
        "year": 2023,
        "month": 10,
        "total": 51,
        "organizers": 18,
        "sponsors": 32,
        "admins": 1
      },
      {
        "period": "November 2023",
        "year": 2023,
        "month": 11,
        "total": 45,
        "organizers": 16,
        "sponsors": 28,
        "admins": 1
      },
      {
        "period": "December 2023",
        "year": 2023,
        "month": 12,
        "total": 33,
        "organizers": 12,
        "sponsors": 21,
        "admins": 0
      },
      {
        "period": "January 2024",
        "year": 2024,
        "month": 1,
        "total": 36,
        "organizers": 14,
        "sponsors": 22,
        "admins": 0
      }
    ],
    "eventTrends": [
      {
        "period": "August 2023",
        "year": 2023,
        "month": 8,
        "total": 8,
        "draft": 2,
        "published": 6,
        "approved": 5
      },
      {
        "period": "September 2023",
        "year": 2023,
        "month": 9,
        "total": 12,
        "draft": 3,
        "published": 9,
        "approved": 7
      },
      {
        "period": "October 2023",
        "year": 2023,
        "month": 10,
        "total": 15,
        "draft": 4,
        "published": 11,
        "approved": 9
      },
      {
        "period": "November 2023",
        "year": 2023,
        "month": 11,
        "total": 10,
        "draft": 2,
        "published": 8,
        "approved": 7
      },
      {
        "period": "December 2023",
        "year": 2023,
        "month": 12,
        "total": 7,
        "draft": 1,
        "published": 6,
        "approved": 5
      },
      {
        "period": "January 2024",
        "year": 2024,
        "month": 1,
        "total": 15,
        "draft": 3,
        "published": 12,
        "approved": 10
      }
    ],
    "generatedAt": "2024-02-01T10:30:00.000Z"
  }
}
```

---

## Admin Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN PANEL FLOW                         │
└─────────────────────────────────────────────────────────────┘

1. USER MANAGEMENT FLOW
   ┌──────────┐      ┌──────────────┐      ┌───────────┐
   │  Admin   │─────>│ Auth + Role  │─────>│   User    │
   │  Login   │      │  Middleware  │      │ Controller│
   └──────────┘      └──────────────┘      └───────────┘
                              │                    │
                              v                    v
                       ┌────────────┐      ┌───────────┐
                       │  Validate  │      │   User    │
                       │  Admin     │      │   Model   │
                       │  Role      │      └───────────┘
                       └────────────┘
   
   Operations:
   - List users with filters (role, status, verified)
   - View user details
   - Activate/Deactivate users (soft delete)
   - Cannot modify self or delete other admins

2. EVENT MODERATION FLOW
   ┌──────────┐      ┌──────────────┐      ┌───────────┐
   │ Organizer│─────>│    Event     │─────>│   Admin   │
   │  Creates │      │  Published   │      │  Reviews  │
   │  Event   │      │   (draft)    │      │           │
   └──────────┘      └──────────────┘      └───────────┘
                              │                    │
                              v                    v
                       ┌────────────┐      ┌────────────┐
                       │  Approve/  │      │  Publicly  │
                       │   Reject   │      │  Visible   │
                       └────────────┘      └────────────┘
   
   Operations:
   - View all events (any status)
   - Approve published events → becomes publicly visible
   - Reject events with reason → back to draft
   - Filter by status, approval, mode

3. ANALYTICS FLOW
   ┌──────────────┐      ┌─────────────────┐
   │   MongoDB    │─────>│   Aggregation   │
   │  Collections │      │    Pipelines    │
   └──────────────┘      └─────────────────┘
          │                       │
          v                       v
   ┌──────────────┐      ┌─────────────────┐
   │ Users, Events│      │  Overview Stats │
   │  Proposals,  │      │  Growth Trends  │
   │Collaborations│      │  (Last 6 months)│
   └──────────────┘      └─────────────────┘
   
   Metrics:
   - Total counts by status/role
   - Monthly growth trends
   - Active vs inactive counts
   - Read-only operations

4. SECURITY & AUTHORIZATION
   ┌──────────────┐      ┌─────────────────┐
   │  JWT Token   │─────>│  Authenticate   │
   │  Required    │      │   Middleware    │
   └──────────────┘      └─────────────────┘
          │                       │
          v                       v
   ┌──────────────┐      ┌─────────────────┐
   │  Verify      │      │  Authorize      │
   │  User Exists │      │  Admin Role     │
   └──────────────┘      └─────────────────┘
          │                       │
          v                       v
   ┌──────────────────────────────────────┐
   │  Execute Admin Controller Action     │
   └──────────────────────────────────────┘
```

---

## Error Responses

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (not admin or permission denied)
- `404` - Not Found
- `500` - Internal Server Error

---

## Performance Considerations

1. **Pagination**: All list endpoints support pagination to prevent memory issues
2. **Aggregation Pipelines**: Analytics use MongoDB aggregation for efficient computation
3. **Parallel Queries**: Multiple aggregations run in parallel using `Promise.all()`
4. **Index Usage**: Queries leverage existing indexes on `role`, `status`, `isActive`, `createdAt`
5. **Lean Queries**: Read operations use `.lean()` for better performance

---

## Testing the Admin APIs

1. **Register an admin user:**
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@platform.com",
    "password": "Admin123456",
    "role": "admin"
  }'
```

2. **Use the returned token for all admin endpoints**

3. **Test each endpoint with appropriate filters and pagination**

---

## Notes

- All dates are in ISO 8601 format
- ObjectIds are validated before database queries
- Soft deletes preserve data integrity
- Admin actions can be logged by adding audit trail middleware (future enhancement)
- Rejection reasons could be stored in a separate collection for history (future enhancement)
