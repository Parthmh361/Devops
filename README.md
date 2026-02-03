# Event Sponsorship & Collaboration Platform

> A comprehensive full-stack application for managing event sponsorships, collaborations, and communications between sponsors, event organizers, and administrators.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Core Modules](#core-modules)
- [Security](#security)
- [Testing](#testing)
- [Contributing](#contributing)

---

## 🎯 Overview

The Event Sponsorship & Collaboration Platform connects event organizers with potential sponsors, streamlining the entire sponsorship lifecycle from event creation to proposal management, collaboration, and communication. Built with modern technologies and best practices, it provides a secure, scalable, and feature-rich solution for event sponsorship management.

### Key Capabilities

- **Multi-Role System**: Organizers, Sponsors, and Administrators with distinct permissions
- **Event Management**: Create, publish, and manage events with approval workflows
- **Sponsorship Proposals**: Submit, negotiate, and manage sponsorship requests
- **Collaboration Workflows**: State-managed collaboration lifecycle with messaging
- **Real-Time Communication**: In-platform messaging system with read tracking
- **Document Sharing**: Secure file uploads and sharing between collaborators
- **Admin Panel**: Comprehensive user management, event moderation, and analytics
- **Analytics Dashboard**: Platform-wide statistics and growth trends

---

## ✨ Features

### 🔐 Authentication & Authorization
- ✅ User registration and login with email validation
- ✅ JWT-based stateless authentication (7-day token expiry)
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcrypt
- ✅ Protected routes with middleware
- ✅ Account status management

### 👤 User Management
- ✅ User profiles with organization information
- ✅ Account activation/deactivation
- ✅ Email verification system
- ✅ Role-specific dashboards
- ✅ Profile updates and management

### 📅 Event Management
- ✅ Create and publish events (Organizers)
- ✅ Event discovery and browsing (Sponsors)
- ✅ Event moderation and approval (Admins)
- ✅ Event status tracking (draft, published, closed)
- ✅ Date validation and budget management
- ✅ Event filtering and pagination

### 💼 Sponsorship System
- ✅ Submit sponsorship proposals (Sponsors)
- ✅ Review and manage proposals (Organizers)
- ✅ Multi-state proposal workflow (pending, accepted, rejected, negotiation)
- ✅ Budget tracking and management
- ✅ Proposal filtering by status
- ✅ Automated notifications

### 🤝 Collaboration Management
- ✅ State machine-based collaboration lifecycle
- ✅ Collaboration activation by organizers
- ✅ Completion and termination workflows
- ✅ Participant validation and security
- ✅ State transition controls (pending → active → completed/terminated)

### 💬 Communication System
- ✅ In-platform messaging between collaborators
- ✅ Message read/unread tracking
- ✅ Message pagination with limit/skip
- ✅ Unread message counts
- ✅ Participant-only access control
- ✅ Optional message attachments metadata

### 📎 Document Management
- ✅ Secure file uploads (PDF, JPEG, PNG, DOCX)
- ✅ File size validation (10MB limit)
- ✅ Document categorization
- ✅ Access control per collaboration
- ✅ File download with original names
- ✅ Organized storage structure

### 🛡️ Admin Panel
- ✅ User management (list, view, activate/deactivate, delete)
- ✅ Event moderation (approve/reject with reasons)
- ✅ Platform analytics and statistics
- ✅ Growth trends (6-month analysis)
- ✅ User, event, proposal, and collaboration metrics
- ✅ Admin-only access protection

### 📊 Analytics & Reporting
- ✅ Platform overview statistics
- ✅ User statistics by role and status
- ✅ Event statistics by status and approval
- ✅ Proposal status distribution
- ✅ Collaboration status tracking
- ✅ Monthly growth trends

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 16.1.6** | React framework with App Router |
| **TypeScript 5.x** | Type-safe development |
| **React 19.2.3** | UI library |
| **Tailwind CSS 4.x** | Utility-first styling |
| **Axios 1.13.4** | HTTP client |
| **Lucide React** | Icon library |
| **ESLint** | Code linting |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js 4.18.2** | Web framework |
| **TypeScript 5.3.3** | Type-safe development |
| **MongoDB + Mongoose 8.0.0** | Database and ODM |
| **JWT (jsonwebtoken 9.0.0)** | Authentication tokens |
| **bcryptjs 2.4.3** | Password hashing |
| **Multer 1.4.5** | File upload handling |
| **Morgan 1.10.0** | HTTP request logging |
| **dotenv 16.3.1** | Environment configuration |
| **CORS 2.8.5** | Cross-origin requests |

---

## 📁 Project Structure

```
DevOps_1/
├── backend/                          # Express.js API Server
│   ├── src/
│   │   ├── app.ts                   # Express application setup
│   │   ├── server.ts                # Server entry point
│   │   ├── config/
│   │   │   └── db.ts               # MongoDB connection
│   │   ├── controllers/            # Route controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── event.controller.ts
│   │   │   ├── sponsorship.controller.ts
│   │   │   ├── proposal.controller.ts
│   │   │   ├── collaboration.controller.ts
│   │   │   ├── message.controller.ts
│   │   │   ├── document.controller.ts
│   │   │   ├── notification.controller.ts
│   │   │   ├── organizer.controller.ts
│   │   │   ├── sponsor.controller.ts
│   │   │   ├── admin.user.controller.ts
│   │   │   ├── admin.event.controller.ts
│   │   │   └── admin.analytics.controller.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts  # JWT authentication
│   │   │   ├── role.middleware.ts  # Role-based authorization
│   │   │   └── upload.middleware.ts # File upload configuration
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Event.ts
│   │   │   ├── Sponsorship.ts
│   │   │   ├── Proposal.ts
│   │   │   ├── Collaboration.ts
│   │   │   ├── Message.ts
│   │   │   ├── Document.ts
│   │   │   └── Notification.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── event.routes.ts
│   │   │   ├── sponsorship.routes.ts
│   │   │   ├── proposal.routes.ts
│   │   │   ├── collaboration.routes.ts
│   │   │   ├── message.routes.ts
│   │   │   ├── document.routes.ts
│   │   │   ├── notification.routes.ts
│   │   │   ├── organizer.routes.ts
│   │   │   ├── sponsor.routes.ts
│   │   │   ├── admin.user.routes.ts
│   │   │   ├── admin.event.routes.ts
│   │   │   ├── admin.analytics.routes.ts
│   │   │   └── health.ts
│   │   ├── services/               # Business logic
│   │   ├── types/                  # TypeScript definitions
│   │   │   └── express.d.ts       # Express type extensions
│   │   └── utils/
│   │       ├── jwt.ts             # JWT utilities
│   │       └── password.ts        # Password hashing
│   ├── uploads/                    # Uploaded files storage
│   │   ├── documents/
│   │   └── temp/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nodemon.json
│   ├── .env
│   └── Documentation/
│       ├── IMPLEMENTATION_SUMMARY.md
│       ├── AUTHENTICATION_GUIDE.md
│       ├── ADMIN_API_DOCUMENTATION.md
│       ├── COLLABORATION_COMMUNICATION_GUIDE.md
│       └── TESTING_QUICK_START.md
│
├── frontend/                        # Next.js Application
│   ├── app/
│   │   ├── (auth)/                 # Auth layout group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── admin/                  # Admin panel
│   │   │   ├── analytics/
│   │   │   ├── events/
│   │   │   └── users/
│   │   ├── dashboard/              # User dashboards
│   │   ├── events/                 # Event pages
│   │   ├── organizer/              # Organizer features
│   │   ├── sponsor/                # Sponsor features
│   │   ├── components/             # Page-specific components
│   │   ├── services/               # API service layer
│   │   ├── utils/                  # Utility functions
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   └── globals.css             # Global styles
│   ├── components/                 # Shared components
│   │   ├── common/
│   │   ├── events/
│   │   ├── layout/
│   │   └── ui/
│   ├── services/
│   │   ├── api.ts                  # Axios instance
│   │   ├── auth.service.ts         # Auth API calls
│   │   ├── event.service.ts        # Event API calls
│   │   └── sponsorshipService.ts   # Sponsorship API calls
│   ├── types/
│   │   ├── user.ts
│   │   ├── event.ts
│   │   └── sponsorship.ts
│   ├── utils/
│   │   ├── auth.ts                 # Auth utilities
│   │   ├── roles.ts                # Role utilities
│   │   └── cn.ts                   # Class name utilities
│   ├── public/
│   │   └── assets/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md                        # This file
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** v18.0.0 or later
- **npm** or **yarn**
- **MongoDB** (local installation or cloud instance)
- **Git**

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd DevOps_1
```

#### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
```

**Configure Backend Environment Variables** (`.env`):
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/event-sponsorship

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

**Start Backend Server:**
```bash
npm run dev          # Development with hot reload
npm run build        # Build for production
npm start            # Production mode
```

Backend will run at `http://localhost:5000`

#### 3. Frontend Setup

```bash
cd frontend
npm install

# Create environment file
cp .env.local.example .env.local
```

**Configure Frontend Environment Variables** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Start Frontend Development Server:**
```bash
npm run dev          # Development mode
npm run build        # Build for production
npm start            # Production mode
npm run lint         # Run linter
```

Frontend will run at `http://localhost:3000`

### Quick Start

1. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

2. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/health

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/logout` | Logout user | Yes |
| GET | `/auth/profile` | Get current user profile | Yes |

### Event Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/events` | Create event | Organizer |
| GET | `/events` | List all events | All |
| GET | `/events/:id` | Get event details | All |
| PUT | `/events/:id` | Update event | Organizer (owner) |
| DELETE | `/events/:id` | Delete event | Organizer (owner) |
| PATCH | `/events/:id/publish` | Publish event | Organizer (owner) |

### Sponsorship & Proposal Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/sponsorships` | Create sponsorship tier | Organizer |
| GET | `/sponsorships/event/:eventId` | Get event sponsorships | All |
| POST | `/proposals` | Submit proposal | Sponsor |
| GET | `/proposals/sponsor` | Get sponsor proposals | Sponsor |
| GET | `/proposals/organizer` | Get organizer proposals | Organizer |
| PATCH | `/proposals/:id/accept` | Accept proposal | Organizer |
| PATCH | `/proposals/:id/reject` | Reject proposal | Organizer |

### Collaboration Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/collaborations/:id` | Get collaboration | Participant |
| PATCH | `/collaborations/:id/activate` | Activate collaboration | Organizer |
| PATCH | `/collaborations/:id/complete` | Complete collaboration | Participant |
| PATCH | `/collaborations/:id/terminate` | Terminate collaboration | Organizer |

### Messaging Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/collaborations/:id/messages` | Send message | Participant |
| GET | `/collaborations/:id/messages` | Get messages | Participant |
| PATCH | `/messages/:id/read` | Mark as read | Participant |
| GET | `/collaborations/:id/unread` | Get unread count | Participant |

### Document Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/collaborations/:id/documents` | Upload document | Participant |
| GET | `/collaborations/:id/documents` | List documents | Participant |
| GET | `/documents/:id/download` | Download document | Participant |
| DELETE | `/documents/:id` | Delete document | Uploader |

### Admin Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/admin/users` | List all users | Admin |
| GET | `/admin/users/:id` | Get user details | Admin |
| PATCH | `/admin/users/:id/status` | Update user status | Admin |
| DELETE | `/admin/users/:id` | Soft delete user | Admin |
| GET | `/admin/events` | List all events | Admin |
| PATCH | `/admin/events/:id/approve` | Approve event | Admin |
| PATCH | `/admin/events/:id/reject` | Reject event | Admin |
| GET | `/admin/analytics/overview` | Platform statistics | Admin |
| GET | `/admin/analytics/trends` | Growth trends | Admin |

For detailed API documentation, see:
- [backend/ADMIN_API_DOCUMENTATION.md](backend/ADMIN_API_DOCUMENTATION.md)
- [backend/AUTHENTICATION_GUIDE.md](backend/AUTHENTICATION_GUIDE.md)
- [backend/COLLABORATION_COMMUNICATION_GUIDE.md](backend/COLLABORATION_COMMUNICATION_GUIDE.md)

---

## 👥 User Roles

### 1. Organizer
Event creators who seek sponsorships for their events.

**Capabilities:**
- Create and manage events
- Create sponsorship tiers
- Review sponsorship proposals
- Accept/reject proposals
- Activate collaborations
- Communicate with sponsors
- Share documents
- Complete/terminate collaborations

### 2. Sponsor
Companies or individuals offering sponsorships.

**Capabilities:**
- Browse available events
- Submit sponsorship proposals
- View proposal status
- Participate in collaborations
- Communicate with organizers
- Share documents
- Complete collaborations

### 3. Admin
Platform administrators with full control.

**Capabilities:**
- Manage all users
- Moderate events (approve/reject)
- View platform analytics
- Activate/deactivate accounts
- Delete users (soft delete)
- Access all platform data
- Monitor growth trends

---

## 🔧 Core Modules

### Authentication System
- JWT-based token authentication
- Token expiry: 7 days
- Password hashing with bcrypt (10 salt rounds)
- Account status validation
- Email uniqueness enforcement
- Protected route middleware

### Event Management
- Draft, Published, and Closed states
- Date validation (end date after start date)
- Budget tracking
- Approval workflow (published → approved)
- Pagination and filtering
- Owner-only modifications

### Proposal Workflow
States: `pending` → `accepted`/`rejected`/`negotiation`

- Sponsor submission
- Organizer review
- Budget validation
- Status tracking
- Automated collaboration creation on acceptance

### Collaboration State Machine
States: `pending` → `active` → `completed`/`terminated`

**Transitions:**
- **Activate**: Organizer only (pending → active)
- **Complete**: Any participant (active → completed)
- **Terminate**: Organizer only (active → terminated)

### Messaging System
- REST-based messaging (no WebSockets)
- Participant validation
- Read/unread tracking
- Pagination (limit/skip)
- Unread count endpoint
- Optional attachments metadata

### Document Management
- Multer integration for file uploads
- Supported types: PDF, JPEG, PNG, DOCX
- 10MB size limit
- Local filesystem storage
- Access control per collaboration
- Original filename preservation

---

## 🔒 Security

### Implemented Security Measures

- ✅ **Password Security**: bcrypt hashing with 10 salt rounds
- ✅ **JWT Authentication**: Signed tokens with expiry
- ✅ **Token Verification**: Signature and expiry validation
- ✅ **Role-Based Access Control**: Middleware-enforced permissions
- ✅ **Input Validation**: Request body validation
- ✅ **Account Status Checks**: Active and verified user validation
- ✅ **Email Uniqueness**: Duplicate prevention
- ✅ **Sensitive Data Protection**: Password exclusion from responses
- ✅ **File Upload Validation**: Type and size restrictions
- ✅ **MongoDB ObjectId Validation**: Prevent invalid IDs
- ✅ **Soft Deletes**: Data preservation
- ✅ **CORS Configuration**: Cross-origin request control
- ✅ **HTTP Status Codes**: Proper error signaling
- ✅ **TypeScript**: Type safety throughout

### Best Practices

- Environment variables for secrets
- No hardcoded credentials
- Middleware-based authentication
- Principle of least privilege
- Regular dependency updates
- Error handling without information leakage

---

## 🧪 Testing

### Available Test Files

```bash
backend/
├── test.js                    # General tests
├── auth-test.ps1             # PowerShell auth tests
├── admin-test.js             # Admin API tests
├── collaboration-test.js     # Collaboration tests
├── organizer-test.js         # Organizer tests
├── sponsor-test.js           # Sponsor tests
├── domain-test.js            # Domain logic tests
├── check-users.js            # User verification
└── clean-db.js               # Database cleanup
```

### Running Tests

```bash
# Backend tests
cd backend
node test.js
node admin-test.js
node collaboration-test.js

# PowerShell auth tests
.\test-auth.ps1

# Windows batch auth tests
.\run-auth-tests.bat
```

### Test Documentation

See [backend/TESTING_QUICK_START.md](backend/TESTING_QUICK_START.md) for comprehensive testing guide.

---

## 📖 Documentation

### Available Documentation Files

- **[IMPLEMENTATION_SUMMARY.md](backend/IMPLEMENTATION_SUMMARY.md)** - Complete implementation overview
- **[AUTHENTICATION_GUIDE.md](backend/AUTHENTICATION_GUIDE.md)** - Authentication system details
- **[ADMIN_API_DOCUMENTATION.md](backend/ADMIN_API_DOCUMENTATION.md)** - Admin API reference
- **[ADMIN_IMPLEMENTATION_SUMMARY.md](backend/ADMIN_IMPLEMENTATION_SUMMARY.md)** - Admin features summary
- **[COLLABORATION_COMMUNICATION_GUIDE.md](backend/COLLABORATION_COMMUNICATION_GUIDE.md)** - Collaboration & messaging
- **[TESTING_QUICK_START.md](backend/TESTING_QUICK_START.md)** - Testing guide
- **[QUICK_START.md](backend/QUICK_START.md)** - Quick setup guide
- **[ROUTE_PATTERNS.md](backend/ROUTE_PATTERNS.md)** - API route patterns
- **[START_HERE.txt](backend/START_HERE.txt)** - Implementation checklist

---

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Use ESLint for code linting
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for API changes
- Test new features before submitting PR

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Project Status

**Status**: ✅ Production Ready

**Completed Modules:**
- ✅ Authentication & Authorization
- ✅ User Management
- ✅ Event Management
- ✅ Sponsorship & Proposals
- ✅ Collaboration Workflows
- ✅ Messaging System
- ✅ Document Management
- ✅ Admin Panel
- ✅ Analytics Dashboard
- ✅ Notification System

**Lines of Code:** 3,000+ (Backend) | 2,000+ (Frontend)  
**API Endpoints:** 50+  
**Documentation:** 3,500+ lines

---

## 📞 Support

For issues, questions, or contributions, please:
- Open an issue on GitHub
- Review the documentation in `/backend` folder
- Check the [TESTING_QUICK_START.md](backend/TESTING_QUICK_START.md) for common issues

---

**Built with ❤️ using TypeScript, Next.js, and Express.js**

### Backend
```
/backend
├── /src
│   ├── /config
│   ├── /controllers
│   ├── /models
│   ├── /routes
│   ├── /middlewares
│   ├── /services
│   ├── /utils
│   ├── app.ts
│   └── server.ts
├── tsconfig.json
├── nodemon.json
└── package.json
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (if configured)

## License

MIT
