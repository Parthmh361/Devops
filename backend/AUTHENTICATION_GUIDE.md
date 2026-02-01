/**
 * =====================================================
 * AUTHENTICATION & ROLE-BASED AUTHORIZATION GUIDE
 * =====================================================
 * 
 * Complete implementation for Event Sponsorship Platform
 * Using: Express + TypeScript + MongoDB + JWT
 */

/**
 * ============================
 * 1. ARCHITECTURE OVERVIEW
 * ============================
 */

/*
┌─────────────────────────────────────────────────────────────┐
│                     REQUEST FLOW                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Client sends request with Authorization header          │
│    → Authorization: Bearer <jwt_token>                     │
│                                                             │
│ 2. authenticate middleware extracts & verifies token       │
│    → Calls verifyAccessToken() from jwt.ts                │
│    → Attaches user payload to req.user                    │
│                                                             │
│ 3. authorizeRoles middleware checks user.role             │
│    → Compares with allowed roles                          │
│    → Allows or denies access                              │
│                                                             │
│ 4. Route handler processes authenticated request           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
*/

/**
 * ============================
 * 2. UTILITY FUNCTIONS
 * ============================
 */

/*
JWT Utilities (src/utils/jwt.ts):
- generateAccessToken(payload): Creates 7-day JWT token
- verifyAccessToken(token): Validates and decodes token
- extractTokenFromHeader(header): Parses "Bearer <token>"

Password Utilities (src/utils/password.ts):
- hashPassword(plain): Hashes password with bcrypt
- comparePasswords(plain, hashed): Validates password
*/

/**
 * ============================
 * 3. AUTHENTICATION FLOW
 * ============================
 */

/*
REGISTRATION:
POST /api/auth/register
Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "organizer",
  "organizationName": "TechConf 2024"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "66a1b2c3d4e5f6g7h8i9j0k1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "organizer",
      "organizationName": "TechConf 2024",
      "isActive": true,
      "isVerified": false,
      "createdAt": "2024-02-01T10:30:00Z",
      "updatedAt": "2024-02-01T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

LOGIN:
POST /api/auth/login
Request Body:
{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... same user object ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

LOGOUT:
POST /api/auth/logout
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Logout successful. Please delete the token from client."
}
*/

/**
 * ============================
 * 4. REQUEST HEADERS
 * ============================
 */

/*
For all authenticated requests, include:

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmExYjJjM2Q0ZTVmNmc3aDhpOWowazEiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoib3JnYW5pemVyIiwiaWF0IjoxNzA2Nzc0NjAwLCJleHAiOjE3MDczNzk0MDB9.xxxxxxxxxxxxx

Token Structure:
- Header: Algorithm (HS256)
- Payload: userId, email, role, iat (issued at), exp (expiry)
- Signature: HMAC-SHA256 hash

Token Expiry: 7 days from issuance
*/

/**
 * ============================
 * 5. ROLE-BASED ACCESS CONTROL
 * ============================
 */

/*
THREE USER ROLES:

1. ORGANIZER
   - Create and manage events
   - Submit sponsorship needs
   - Accept/reject sponsors
   - Permissions: create_event, manage_own_events, request_sponsorship

2. SPONSOR
   - Browse available events
   - Propose sponsorships
   - Manage sponsorship proposals
   - Permissions: browse_events, propose_sponsorship, manage_proposals

3. ADMIN
   - Full platform access
   - Manage all users
   - Manage all events and sponsorships
   - View analytics
   - Permissions: all

EXAMPLE USAGE:

// Admin-only endpoint
router.delete('/api/users/:id', authenticate, adminOnly, handler);

// Organizer and Admin
router.post(
  '/api/events',
  authenticate,
  organizerOrAdmin,
  handler
);

// Custom roles
router.put(
  '/api/sponsorships/:id',
  authenticate,
  authorizeRoles('sponsor', 'admin'),
  handler
);
*/

/**
 * ============================
 * 6. MIDDLEWARE USAGE
 * ============================
 */

/*
AUTHENTICATION MIDDLEWARE:
- authenticate: Requires valid JWT token
  Usage: router.get('/protected', authenticate, handler)

- optionalAuthenticate: Attempts to authenticate but doesn't fail
  Usage: router.get('/public', optionalAuthenticate, handler)

AUTHORIZATION MIDDLEWARE:
- authorizeRoles(...roles): Accept specific roles
  Usage: authorizeRoles('admin', 'organizer')

- adminOnly: Shorthand for authorizeRoles('admin')
  Usage: router.delete('/users/:id', authenticate, adminOnly, handler)

- organizerOrAdmin: Shorthand for organizer + admin
- sponsorOrAdmin: Shorthand for sponsor + admin

IMPORTANT: Always use authenticate BEFORE authorizeRoles
*/

/**
 * ============================
 * 7. ERROR RESPONSES
 * ============================
 */

/*
Missing Token (401):
{
  "success": false,
  "message": "No token provided. Use Authorization: Bearer <token>"
}

Invalid Token (401):
{
  "success": false,
  "message": "Invalid token"
}

Expired Token (401):
{
  "success": false,
  "message": "Token has expired. Please login again."
}

Insufficient Permissions (403):
{
  "success": false,
  "message": "Access denied. Required role(s): admin. Your role: organizer"
}

Validation Error (400):
{
  "success": false,
  "message": "Name, email, and password are required"
}

Email Already Exists (409):
{
  "success": false,
  "message": "Email already registered"
}

Invalid Credentials (401):
{
  "success": false,
  "message": "Invalid email or password"
}

Inactive Account (403):
{
  "success": false,
  "message": "Account is inactive"
}
*/

/**
 * ============================
 * 8. IMPLEMENTATION CHECKLIST
 * ============================
 */

/*
✅ Core Files Created:
  ✅ src/utils/jwt.ts - JWT generation & verification
  ✅ src/utils/password.ts - Password hashing & comparison
  ✅ src/controllers/auth.controller.ts - Auth logic
  ✅ src/routes/auth.routes.ts - Auth endpoints
  ✅ src/middlewares/auth.middleware.ts - Token verification
  ✅ src/middlewares/role.middleware.ts - Role checking
  ✅ src/routes/examples.routes.ts - Example protected routes

✅ Integration:
  ✅ App.ts updated with auth routes
  ✅ TypeScript Request interface extended for user property
  ✅ Error handling for expired/invalid tokens

✅ Features:
  ✅ Bcrypt password hashing with salt rounds
  ✅ 7-day JWT token expiry
  ✅ Stateless authentication (no refresh tokens)
  ✅ Role-based access control
  ✅ Clean error messages
  ✅ TypeScript type safety
*/

/**
 * ============================
 * 9. ENVIRONMENT VARIABLES
 * ============================
 */

/*
Add to .env file:

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=7d

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=10

# Database
MONGODB_URI=mongodb://localhost:27017/event-sponsorship
NODE_ENV=development

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000
*/

/**
 * ============================
 * 10. TESTING EXAMPLES
 * ============================
 */

/*
Using cURL:

1. REGISTER USER:
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Organizer",
    "email": "alice@events.com",
    "password": "SecurePass123",
    "role": "organizer",
    "organizationName": "TechConf Organizers"
  }'

2. LOGIN:
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@events.com",
    "password": "SecurePass123"
  }'

3. GET PROFILE (with token):
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

4. ACCESS ADMIN-ONLY ROUTE:
curl http://localhost:5000/api/examples/admin-only \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

5. LOGOUT:
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
*/

/**
 * ============================
 * 11. FRONTEND INTEGRATION
 * ============================
 */

/*
Store token in localStorage:

// After login
const response = await fetch('/api/auth/login', { ... });
const data = await response.json();
localStorage.setItem('authToken', data.data.token);

// Send requests with token
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
};
fetch('/api/auth/profile', { headers });

// Logout
localStorage.removeItem('authToken');
*/

/**
 * ============================
 * 12. SECURITY BEST PRACTICES
 * ============================
 */

/*
✅ DO:
- Use HTTPS in production
- Store JWT_SECRET securely (use secrets manager)
- Hash passwords with bcrypt (never store plain)
- Validate all inputs
- Use httpOnly cookies for sensitive environments
- Implement rate limiting on auth endpoints
- Use strong JWT_SECRET (32+ characters)
- Set appropriate CORS origins
- Log failed authentication attempts
- Implement email verification for registration
- Add refresh token rotation mechanism

❌ DON'T:
- Store tokens in localStorage (vulnerable to XSS)
- Use weak JWT secrets
- Log passwords or tokens
- Skip validation
- Return detailed error messages (helps attackers)
- Hardcode secrets in code
- Mix auth header formats
*/

/**
 * ============================
 * 13. EXTENDING THE AUTH SYSTEM
 * ============================
 */

/*
Future Enhancements:

1. Email Verification:
   - Send verification link on registration
   - Update isVerified field after clicking link

2. Password Reset:
   - POST /api/auth/forgot-password
   - POST /api/auth/reset-password

3. Refresh Tokens:
   - Issue 7-day access token + 30-day refresh token
   - POST /api/auth/refresh for new access token

4. Two-Factor Authentication:
   - totp: Time-based OTP using 2FA apps
   - sms: Send OTP via SMS

5. Social Login:
   - Google OAuth
   - GitHub OAuth

6. Permission-based Access:
   - Fine-grained permissions beyond roles
   - Permission inheritance

7. Session Management:
   - Track active sessions
   - Logout from all devices
   - Device management
*/

export default {};
