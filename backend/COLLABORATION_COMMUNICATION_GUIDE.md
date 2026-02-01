# Collaboration & Communication Features

Comprehensive implementation of collaboration state management, real-time messaging (REST), and document sharing for the Event Sponsorship Platform.

---

## 📋 Feature Overview

### 1. Collaboration State Machine
Manage sponsorship collaboration lifecycle with strict state transitions.

**States:**
- `pending` → `active` → `completed` or `terminated`

**State Transitions:**
- **Activate** (pending → active): Organizer only
- **Complete** (active → completed): Organizer or Sponsor
- **Terminate** (active → terminated): Organizer only

---

### 2. Messaging System
REST-based chat for collaboration participants with read tracking and pagination.

**Features:**
- Secure participant validation
- Read/unread tracking
- Message pagination
- Unread count endpoint
- Optional attachments metadata

---

### 3. Document Management
Upload, store, and share files with automatic organization and validation.

**Features:**
- Multer file upload integration
- File type validation (PDF, JPEG, PNG, DOCX)
- 10MB file size limit
- Local filesystem storage
- Document categorization
- Access control per collaboration
- Download with original filename

---

## 🏗️ Data Models

### Message Schema
```typescript
{
  collaboration: ObjectId,          // Reference to Collaboration
  sender: ObjectId,                 // Reference to User
  content: string,                  // 1-5000 chars
  attachments: [                    // Optional
    { fileName, fileUrl, fileType }
  ],
  isRead: boolean,                  // Default: false
  createdAt: Date                   // Indexed for sorting
}

// Indexes: (collaboration, createdAt)
```

### Document Schema
```typescript
{
  collaboration: ObjectId,          // Reference to Collaboration
  uploadedBy: ObjectId,             // Reference to User
  fileName: string,                 // Original filename
  fileType: string,                 // MIME type (validated)
  fileSize: number,                 // Bytes
  filePath: string,                 // Relative path from uploads/
  documentType: enum,               // agreement|invoice|deck|other
  createdAt: Date                   // Indexed
}

// Indexes: (collaboration, createdAt)
// Valid MIME types: application/pdf, image/jpeg, image/png, application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

### Collaboration Model (Updated)
```typescript
{
  // ... existing fields ...
  status: 'pending' | 'active' | 'completed' | 'terminated',
  startDate: Date,                  // Set on activation
  endDate: Date,                    // Set on completion/termination
}
```

---

## 🔌 API Endpoints

### Collaboration State Machine

#### Activate Collaboration
```http
PATCH /api/collaborations/:id/activate
Authorization: Bearer <organizer_token>

Response (200):
{
  "success": true,
  "message": "Collaboration activated successfully",
  "data": {
    "_id": "...",
    "status": "active",
    "startDate": "2024-02-01T10:00:00Z",
    "organizer": { "name": "John Org", "email": "john@org.com" },
    "sponsor": { "name": "Jane Sponsor", "email": "jane@sponsor.com" }
  }
}
```

#### Complete Collaboration
```http
PATCH /api/collaborations/:id/complete
Authorization: Bearer <participant_token>

Response (200):
{
  "success": true,
  "message": "Collaboration marked as completed",
  "data": {
    "_id": "...",
    "status": "completed",
    "endDate": "2024-02-15T15:30:00Z"
  }
}
```

#### Terminate Collaboration
```http
PATCH /api/collaborations/:id/terminate
Authorization: Bearer <organizer_token>
Content-Type: application/json

Body:
{
  "reason": "Sponsor failed to meet obligations"
}

Response (200):
{
  "success": true,
  "message": "Collaboration terminated successfully",
  "data": {
    "_id": "...",
    "status": "terminated",
    "endDate": "2024-02-10T12:00:00Z",
    "notes": "Terminated: Sponsor failed to meet obligations"
  }
}
```

---

### Messaging Endpoints

#### Get Messages
```http
GET /api/messages/:collaborationId?page=1&limit=20
Authorization: Bearer <participant_token>

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "msg001",
      "collaboration": "collab123",
      "sender": {
        "_id": "user123",
        "name": "John Organizer",
        "email": "john@org.com"
      },
      "content": "Great sponsorship! Looking forward to working with you.",
      "attachments": [],
      "isRead": true,
      "createdAt": "2024-02-01T09:30:00Z"
    },
    {
      "_id": "msg002",
      "sender": {
        "_id": "user456",
        "name": "Jane Sponsor",
        "email": "jane@sponsor.com"
      },
      "content": "Thanks! We're excited to partner on this event.",
      "attachments": [],
      "isRead": false,
      "createdAt": "2024-02-01T10:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "pages": 1
  }
}
```

#### Send Message
```http
POST /api/messages/:collaborationId
Authorization: Bearer <participant_token>
Content-Type: application/json

Body:
{
  "content": "Let's schedule a meeting to discuss logistics.",
  "attachments": [
    {
      "fileName": "event_schedule.pdf",
      "fileUrl": "/uploads/schedules/event_schedule.pdf",
      "fileType": "application/pdf"
    }
  ]
}

Response (201):
{
  "success": true,
  "data": {
    "_id": "msg003",
    "collaboration": "collab123",
    "sender": {
      "_id": "user123",
      "name": "John Organizer",
      "email": "john@org.com"
    },
    "content": "Let's schedule a meeting to discuss logistics.",
    "attachments": [...],
    "isRead": false,
    "createdAt": "2024-02-01T11:00:00Z"
  }
}
```

#### Mark Message as Read
```http
PATCH /api/messages/:id/read
Authorization: Bearer <participant_token>

Response (200):
{
  "success": true,
  "message": "Message marked as read",
  "data": {
    "_id": "msg002",
    "isRead": true
  }
}
```

#### Get Unread Count
```http
GET /api/messages/:collaborationId/unread-count
Authorization: Bearer <participant_token>

Response (200):
{
  "success": true,
  "data": {
    "unreadCount": 3
  }
}
```

---

### Document Management Endpoints

#### Upload Document
```http
POST /api/documents/:collaborationId
Authorization: Bearer <participant_token>
Content-Type: multipart/form-data

Form Data:
- file: <binary file> (required)
- documentType: "agreement|invoice|deck|other" (optional, default: "other")

Curl Example:
curl -X POST http://localhost:5000/api/documents/collab123 \
  -H "Authorization: Bearer <token>" \
  -F "file=@contract.pdf" \
  -F "documentType=agreement"

Response (201):
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "_id": "doc001",
    "collaboration": "collab123",
    "uploadedBy": {
      "_id": "user123",
      "name": "John Organizer",
      "email": "john@org.com"
    },
    "fileName": "contract.pdf",
    "fileType": "application/pdf",
    "fileSize": 145678,
    "filePath": "documents/collab123/1706787600000-a1b2c3d4.pdf",
    "documentType": "agreement",
    "createdAt": "2024-02-01T12:00:00Z"
  }
}
```

#### List Documents
```http
GET /api/documents/:collaborationId?page=1&limit=10
Authorization: Bearer <participant_token>

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "doc001",
      "collaboration": "collab123",
      "uploadedBy": {
        "_id": "user123",
        "name": "John Organizer",
        "email": "john@org.com"
      },
      "fileName": "contract.pdf",
      "fileType": "application/pdf",
      "fileSize": 145678,
      "filePath": "documents/collab123/1706787600000-a1b2c3d4.pdf",
      "documentType": "agreement",
      "createdAt": "2024-02-01T12:00:00Z"
    },
    {
      "_id": "doc002",
      "fileName": "proposal_deck.pptx",
      "fileSize": 2456789,
      "documentType": "deck",
      "createdAt": "2024-02-01T13:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  }
}
```

#### Download Document
```http
GET /api/documents/download/:id
Authorization: Bearer <participant_token>

Response: Binary file download
Headers:
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="contract.pdf"
```

#### Delete Document
```http
DELETE /api/documents/:id
Authorization: Bearer <uploader_or_organizer_token>

Response (200):
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

## 🔐 Access Control Rules

### Collaboration State Transitions
| Action | Allowed Roles | From State | To State |
|--------|---|---|---|
| Activate | Organizer | pending | active |
| Complete | Organizer, Sponsor | active | completed |
| Terminate | Organizer | active | terminated |

### Messaging
- **Send Message**: Collaboration participants (organizer, sponsor, admin)
- **Read Messages**: Collaboration participants
- **Mark Read**: Collaboration participants

### Document Upload/Download
- **Upload**: Collaboration participants
- **Download**: Collaboration participants
- **Delete**: Document uploader, Organizer, or Admin

### Participant Access Checks
```
Valid participants = Organizer + Sponsor + Admin
```

---

## 📁 Directory Structure

```
backend/
├── src/
│   ├── models/
│   │   ├── Message.model.ts          (NEW)
│   │   ├── Document.model.ts         (NEW)
│   │   ├── Collaboration.model.ts    (updated)
│   │   └── ...
│   ├── controllers/
│   │   ├── message.controller.ts     (NEW)
│   │   ├── document.controller.ts    (NEW)
│   │   ├── collaboration.controller.ts (updated)
│   │   └── ...
│   ├── routes/
│   │   ├── message.routes.ts         (NEW)
│   │   ├── document.routes.ts        (NEW)
│   │   ├── collaboration.routes.ts   (updated)
│   │   └── ...
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   └── ...
│   └── app.ts                        (updated)
├── uploads/
│   ├── documents/
│   │   ├── <collaborationId>/
│   │   │   ├── 1706787600000-a1b2c3d4.pdf
│   │   │   ├── 1706787800000-b3c4d5e6.jpg
│   │   │   └── ...
│   │   └── ...
│   └── temp/                         (multer staging)
└── ...
```

---

## 🛠️ Configuration

### File Upload Settings (document.routes.ts)
```typescript
// Allowed MIME types
const VALID_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// File size limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Storage location
const UPLOAD_DIR = '/uploads/documents/<collaborationId>/';
```

---

## 📊 Collaboration Lifecycle Example

```
1. Proposal Accepted
   ↓
2. Collaboration Created (status: pending)
   ↓ [Organizer calls PATCH /:id/activate]
3. Collaboration Active (status: active)
   ├─→ Messages exchanged
   ├─→ Documents uploaded
   ├─→ Milestones tracked
   ↓
4a. Completion Path:
    [Either party calls PATCH /:id/complete]
    → Status: completed
    
4b. Termination Path:
    [Organizer calls PATCH /:id/terminate]
    → Status: terminated
```

---

## 🚀 Usage Examples

### Example 1: Complete Event Sponsorship Workflow

```bash
# 1. Create event (organizer)
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer <organizer_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Tech Summit 2024","startDate":"2024-03-01T09:00:00Z","endDate":"2024-03-02T18:00:00Z","eventMode":"hybrid"}'

# 2. Publish event
curl -X PATCH http://localhost:5000/api/events/event123/publish \
  -H "Authorization: Bearer <organizer_token>"

# 3. Sponsor submits proposal
curl -X POST http://localhost:5000/api/proposals \
  -H "Authorization: Bearer <sponsor_token>" \
  -H "Content-Type: application/json" \
  -d '{"eventId":"event123","proposedAmount":5000}'

# 4. Organizer accepts proposal (auto-creates collaboration)
curl -X PATCH http://localhost:5000/api/proposals/proposal123/accept \
  -H "Authorization: Bearer <organizer_token>"

# 5. Organizer activates collaboration
curl -X PATCH http://localhost:5000/api/collaborations/collab123/activate \
  -H "Authorization: Bearer <organizer_token>"

# 6. Exchange messages
curl -X POST http://localhost:5000/api/messages/collab123 \
  -H "Authorization: Bearer <organizer_token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Let'\''s finalize details"}'

# 7. Upload sponsorship agreement
curl -X POST http://localhost:5000/api/documents/collab123 \
  -H "Authorization: Bearer <organizer_token>" \
  -F "file=@sponsorship_agreement.pdf" \
  -F "documentType=agreement"

# 8. Download agreement to verify
curl -X GET http://localhost:5000/api/documents/download/doc001 \
  -H "Authorization: Bearer <sponsor_token>" \
  -o downloaded_agreement.pdf

# 9. Mark collaboration as completed
curl -X PATCH http://localhost:5000/api/collaborations/collab123/complete \
  -H "Authorization: Bearer <organizer_token>"
```

---

## ✅ Validation & Error Handling

### Common Error Responses

```json
// 400 - Invalid collaboration ID
{
  "success": false,
  "message": "Invalid collaboration ID"
}

// 403 - Access denied
{
  "success": false,
  "message": "You do not have access to this collaboration"
}

// 400 - Invalid file type
{
  "success": false,
  "message": "Invalid file type. Allowed types: application/pdf, image/jpeg, image/png, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}

// 413 - File too large
{
  "success": false,
  "message": "File size exceeds maximum limit of 10MB"
}

// 400 - Invalid state transition
{
  "success": false,
  "message": "Cannot activate collaboration in active state. Must be in pending state."
}
```

---

## 🧪 Testing Endpoints

### Postman Collection Quick Reference

**Collaboration State Machine:**
- `PATCH /api/collaborations/:id/activate`
- `PATCH /api/collaborations/:id/complete`
- `PATCH /api/collaborations/:id/terminate`

**Messaging:**
- `GET /api/messages/:collaborationId` (pagination)
- `POST /api/messages/:collaborationId`
- `PATCH /api/messages/:id/read`
- `GET /api/messages/:collaborationId/unread-count`

**Documents:**
- `POST /api/documents/:collaborationId` (multipart/form-data)
- `GET /api/documents/:collaborationId` (pagination)
- `GET /api/documents/download/:id`
- `DELETE /api/documents/:id`

---

## 📝 Implementation Notes

### Performance Optimizations
- **Indexes**: Both Message and Document models have (collaboration, createdAt) indexes for efficient querying
- **Lean Queries**: Used on read-heavy endpoints to reduce memory footprint
- **Pagination**: All list endpoints support page/limit parameters

### Security Measures
- **Authentication**: All endpoints require JWT bearer token
- **Authorization**: Role-based access control enforced
- **Participant Validation**: Strict checks prevent unauthorized collaboration access
- **File Validation**: MIME type and size validation before storage
- **Path Traversal**: Secure file path handling prevents directory traversal attacks

### Database Considerations
- Collaboration documents required for messages/documents
- Cascade behavior: Deleting collaboration should clean up messages/documents (implement in production)
- TTL indexes: Consider adding to Message model for auto-cleanup of old messages

---

## 🔄 State Transition Diagram

```
┌─────────────┐
│   PENDING   │
│             │
│ (awaiting   │
│ activation) │
└──────┬──────┘
       │
       │ [Organizer activates]
       ↓
┌─────────────┐
│   ACTIVE    │◄──────────────┐
│             │              │
│ (running    │              │ [Can't transition back]
│ sponsorship)│              │
└──────┬──────┴─────┐        │
       │            │        │
       │ [Complete] │ [Terminate]
       │            │        │
       ↓            ↓        │
┌────────────┐  ┌───────────┐
│ COMPLETED  │  │TERMINATED │
│            │  │           │
│ (finished) │  │ (cancelled)
└────────────┘  └───────────┘
```

---

## 🎯 Next Steps / Enhancements

1. **Real-time Notifications**: Add Socket.io for instant message/status updates
2. **Email Notifications**: Send emails on collaboration state changes
3. **Message Search**: Full-text search in message content
4. **Document Versioning**: Track document revisions
5. **Collaborative Editing**: Real-time document collaboration
6. **Analytics Dashboard**: Track sponsorship metrics over time
7. **Webhooks**: External system notifications on collaboration events
8. **Audit Trail**: Log all state transitions and sensitive operations

