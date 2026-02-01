## 📚 DOMAIN MODELS & CRUD APIs - COMPLETE IMPLEMENTATION

### ✅ What's Been Implemented

```
MODELS (4):
  ✅ Event.model.ts          - Event sponsorship events
  ✅ SponsorshipProposal.model.ts - Sponsorship bids from sponsors
  ✅ Collaboration.model.ts   - Active sponsorships (accepted proposals)
  ✅ Notification.model.ts    - User notifications

CONTROLLERS (4):
  ✅ event.controller.ts      - 8 CRUD operations
  ✅ proposal.controller.ts   - 5 CRUD operations
  ✅ collaboration.controller.ts - 3 operations
  ✅ notification.controller.ts - 5 operations

ROUTES (4):
  ✅ event.routes.ts
  ✅ proposal.routes.ts
  ✅ collaboration.routes.ts
  ✅ notification.routes.ts
```

---

## 📊 DATA FLOW & RELATIONSHIPS

```
User (Organizer) creates → Event
                           ↓
        Sponsor submits → SponsorshipProposal
                           ↓
        Organizer accepts → Collaboration created
                           ↓
                    Both parties → Notifications
```

### Model Relationships:

```
Event
├── organizer: User (ref)
└── many SponsorshipProposals

SponsorshipProposal
├── event: Event (ref)
├── sponsor: User (ref)
└── triggers Notification

Collaboration
├── event: Event (ref)
├── organizer: User (ref)
├── sponsor: User (ref)
├── proposal: SponsorshipProposal (ref)
└── triggers Notification

Notification
├── user: User (ref)
└── relatedEntity: { type, id }
```

---

## 🔌 API ENDPOINTS

### EVENTS API

#### Create Event (Organizer)
```
POST /api/events
Authorization: Bearer <token>
Role: organizer

Request Body:
{
  "title": "Tech Conference 2024",
  "description": "Annual tech conference",
  "category": "Technology",
  "startDate": "2024-06-15T09:00:00Z",
  "endDate": "2024-06-17T17:00:00Z",
  "location": "San Francisco, CA",
  "eventMode": "hybrid",
  "sponsorshipNeeds": {
    "amountRequired": 50000,
    "categories": ["Gold Sponsor", "Silver Sponsor"],
    "benefits": ["Booth", "Speaking slot", "Logo placement"]
  }
}

Response: 201 Created
{
  "success": true,
  "message": "Event created successfully",
  "data": { event details }
}
```

#### Get All Public Events
```
GET /api/events?category=Technology&eventMode=hybrid
No authentication required

Response: 200 OK
{
  "success": true,
  "data": [ published & approved events ],
  "count": 5
}
```

#### Get Single Event
```
GET /api/events/:id
Response: 200 OK
```

#### Get My Events (Organizer)
```
GET /api/events/organizer/my-events
Authorization: Bearer <token>
Role: organizer

Response: 200 OK - All events (draft/published) for organizer
```

#### Update Event (Organizer - draft only)
```
PUT /api/events/:id
Authorization: Bearer <token>
Role: organizer

Response: 200 OK
```

#### Delete Event (Organizer - draft only)
```
DELETE /api/events/:id
Authorization: Bearer <token>
Role: organizer

Response: 200 OK
```

#### Publish Event (Organizer)
```
POST /api/events/:id/publish
Authorization: Bearer <token>
Role: organizer

Response: 200 OK - Changes status from draft → published
```

#### Approve Event (Admin)
```
POST /api/events/:id/approve
Authorization: Bearer <token>
Role: admin

Request Body:
{
  "isApproved": true
}

Response: 200 OK
```

---

### SPONSORSHIP PROPOSALS API

#### Create Proposal (Sponsor)
```
POST /api/proposals
Authorization: Bearer <token>
Role: sponsor

Request Body:
{
  "eventId": "507f1f77bcf86cd799439011",
  "proposedAmount": 10000,
  "proposedBenefits": ["Booth", "Logo in materials"],
  "message": "We are interested in sponsoring your event"
}

Response: 201 Created
- Creates Notification for event organizer
```

#### Get Proposals for Event (Organizer)
```
GET /api/proposals?eventId=507f1f77bcf86cd799439011&status=pending
Authorization: Bearer <token>
Role: organizer

Response: 200 OK - All proposals for their event
```

#### Get My Proposals (Sponsor)
```
GET /api/proposals/my-proposals
Authorization: Bearer <token>
Role: sponsor

Response: 200 OK - All proposals sponsor submitted
```

#### Get Single Proposal
```
GET /api/proposals/:id
Authorization: Bearer <token>
Role: organizer or sponsor (only)

Response: 200 OK
```

#### Respond to Proposal (Organizer)
```
PUT /api/proposals/:id
Authorization: Bearer <token>
Role: organizer

Request Body:
{
  "status": "accepted" | "rejected" | "negotiation"
}

Response: 200 OK
- If accepted: Creates Collaboration & Notification
- If rejected: Creates rejection Notification
```

---

### COLLABORATION API

#### Get Collaborations
```
GET /api/collaborations
Authorization: Bearer <token>

Response: 200 OK
- Organizer sees: Their events' collaborations
- Sponsor sees: Their sponsorship collaborations
- Admin sees: All collaborations
```

#### Get Single Collaboration
```
GET /api/collaborations/:id
Authorization: Bearer <token>

Response: 200 OK - If user is organizer/sponsor/admin
```

#### Update Collaboration
```
PUT /api/collaborations/:id
Authorization: Bearer <token>

Request Body:
{
  "status": "active" | "completed" | "terminated",
  "endDate": "2024-06-17T17:00:00Z",
  "notes": "Collaboration notes"
}

Response: 200 OK
```

---

### NOTIFICATIONS API

#### Get Notifications
```
GET /api/notifications?limit=20&skip=0
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [ notifications ],
  "unreadCount": 3,
  "pagination": { total, limit, skip }
}
```

#### Get Unread Count
```
GET /api/notifications/unread-count
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "unreadCount": 3
}
```

#### Mark as Read
```
PUT /api/notifications/:id/read
Authorization: Bearer <token>

Response: 200 OK
```

#### Mark All as Read
```
PUT /api/notifications/read-all
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "modifiedCount": 5
}
```

#### Delete Notification
```
DELETE /api/notifications/:id
Authorization: Bearer <token>

Response: 200 OK
```

---

## 🔐 ACCESS CONTROL

### Event Routes:
```
GET /events           → Public
GET /events/:id       → Public (if published & approved)
POST /events          → Organizer only
GET /my-events        → Organizer only
PUT /events/:id       → Organizer (owner) only, draft only
DELETE /events/:id    → Organizer (owner) only, draft only
POST /publish         → Organizer (owner) only
POST /approve         → Admin only
```

### Proposal Routes:
```
POST /proposals       → Sponsor only
GET /proposals        → Organizer only (their event's proposals)
GET /my-proposals     → Sponsor only
GET /proposals/:id    → Organizer or Sponsor only
PUT /proposals/:id    → Organizer only (their event's proposals)
```

### Collaboration Routes:
```
GET /collaborations   → Authenticated (user sees their own, admin sees all)
GET /:id              → Organizer/Sponsor/Admin (if involved/admin)
PUT /:id              → Organizer or Sponsor only
```

### Notification Routes:
```
GET /notifications    → Authenticated user (their own)
GET /unread-count     → Authenticated user
PUT /:id/read         → Authenticated user (their own)
PUT /read-all         → Authenticated user (their all)
DELETE /:id           → Authenticated user (their own)
```

---

## 🔔 NOTIFICATION TRIGGERS

Notifications are automatically created when:

```
1. Sponsorship Proposal Submitted
   → Organizer gets: "New Sponsorship Proposal"
   → Type: proposal

2. Proposal Accepted
   → Sponsor gets: "Proposal Accepted" 
   → Type: proposal
   → Creates Collaboration

3. Proposal Rejected
   → Sponsor gets: "Proposal Rejected"
   → Type: proposal

4. Collaboration Created
   → Both parties: "Collaboration Started"
   → Type: collaboration
```

---

## 📝 EXAMPLE WORKFLOW

### Scenario: Sponsor wants to sponsor an event

```
1. Organizer creates event
   POST /api/events
   → Status: draft
   → Can edit/delete

2. Organizer publishes event
   POST /api/events/:id/publish
   → Status: published
   → Admin can approve

3. Admin approves event
   POST /api/events/:id/approve { "isApproved": true }
   → isApproved: true
   → Visible to public

4. Sponsor views public events
   GET /api/events

5. Sponsor submits proposal
   POST /api/proposals
   { eventId, proposedAmount, benefits, message }
   → Status: pending
   → Organizer gets notification

6. Organizer reviews proposals
   GET /api/proposals?eventId=xxx
   → Lists all pending proposals

7. Organizer accepts proposal
   PUT /api/proposals/:id { "status": "accepted" }
   → Collaboration auto-created
   → Sponsor gets notification

8. Both parties view collaboration
   GET /api/collaborations
   → Organizer sees it
   → Sponsor sees it
```

---

## 🗄️ DATABASE INDICES

For optimal query performance:

```
Event:
  - title, description (text search)
  - organizer
  - status, isApproved (filter published events)

SponsorshipProposal:
  - (event, sponsor) unique (one proposal per sponsor per event)
  - status
  - sponsor

Collaboration:
  - event, organizer, sponsor (filter by participants)
  - status
  - proposal (unique - one collab per proposal)

Notification:
  - (user, isRead) (fetch unread)
  - (user, createdAt) (sort by date)
  - createdAt TTL (auto-delete after 30 days)
```

---

## 🚀 TESTING THE APIs

### 1. Start Server
```bash
npm run dev
```

### 2. Create Test Users (Different Roles)
```bash
# Organizer
POST /api/auth/register
{ "name": "John Organizer", "email": "organizer@event.com", "password": "Pass123", "role": "organizer" }

# Sponsor
POST /api/auth/register
{ "name": "Jane Sponsor", "email": "sponsor@company.com", "password": "Pass123", "role": "sponsor" }

# Admin
POST /api/auth/register
{ "name": "Admin User", "email": "admin@platform.com", "password": "Pass123", "role": "admin" }
```

### 3. Create Event (Organizer)
```bash
POST /api/events
Authorization: Bearer <organizer_token>
Body:
{
  "title": "DevOps Conference",
  "description": "Annual DevOps summit",
  "startDate": "2024-12-01T09:00:00Z",
  "endDate": "2024-12-03T17:00:00Z",
  "eventMode": "hybrid",
  "sponsorshipNeeds": {
    "amountRequired": 100000,
    "categories": ["Platinum", "Gold"],
    "benefits": ["Booth", "Speaking slot"]
  }
}
```

### 4. Publish & Approve Event
```bash
# Publish (Organizer)
POST /api/events/:id/publish
Authorization: Bearer <organizer_token>

# Approve (Admin)
POST /api/events/:id/approve
Authorization: Bearer <admin_token>
Body: { "isApproved": true }
```

### 5. View Event (Public)
```bash
GET /api/events/:id
(no auth needed)
```

### 6. Submit Proposal (Sponsor)
```bash
POST /api/proposals
Authorization: Bearer <sponsor_token>
Body:
{
  "eventId": "...",
  "proposedAmount": 50000,
  "proposedBenefits": ["Booth"],
  "message": "Interested in sponsoring"
}
```

### 7. Review Proposals (Organizer)
```bash
GET /api/proposals?eventId=...
Authorization: Bearer <organizer_token>
```

### 8. Accept Proposal (Organizer)
```bash
PUT /api/proposals/:id
Authorization: Bearer <organizer_token>
Body: { "status": "accepted" }
```

### 9. View Collaboration (Both)
```bash
GET /api/collaborations
Authorization: Bearer <organizer_or_sponsor_token>
```

### 10. Check Notifications
```bash
GET /api/notifications
Authorization: Bearer <user_token>
```

---

## 📦 SUMMARY

**Total Implementation:**
- 4 MongoDB Models with relationships
- 4 Controllers with 21 CRUD operations
- 4 Route files with proper middleware
- Full role-based access control
- Automatic notification system
- Clean TypeScript interfaces
- RESTful API design

**Lines of Code:**
- Models: ~400 lines
- Controllers: ~600 lines
- Routes: ~150 lines
- **Total: ~1150 lines of domain logic**

**Ready for:**
✅ Integration with frontend
✅ Production deployment
✅ Adding real-time updates
✅ Payment integration
✅ Advanced notifications (email, SMS)
