/**
 * QUICK START: Authentication Integration
 * For Event Sponsorship & Collaboration Platform
 */

/**
 * =====================================
 * STEP 1: Install Dependencies
 * =====================================
 */

/*
✅ Already in package.json:
- jsonwebtoken@^9.0.0 (JWT generation)
- bcryptjs@^2.4.3 (password hashing)
- @types/jsonwebtoken@^9.0.7 (TypeScript types)
- @types/bcryptjs@^2.4.6 (TypeScript types)

No additional packages needed!
*/

/**
 * =====================================
 * STEP 2: Environment Setup
 * =====================================
 */

/*
Add to .env file:

JWT_SECRET=your-super-secret-key-min-32-chars-for-production
BCRYPT_SALT_ROUNDS=10
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
*/

/**
 * =====================================
 * STEP 3: Basic Route Protection
 * =====================================
 */

/*
Example: Protect an Events route

import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { organizerOrAdmin } from '../middlewares/role.middleware';

const router = Router();

// Create event (requires auth + organizer role)
router.post(
  '/events',
  authenticate,
  organizerOrAdmin,
  async (req, res) => {
    // req.user contains: { userId, email, role }
    const organizerId = req.user!.userId;
    // Create event logic...
  }
);

// Get all events (public route)
router.get('/events', async (req, res) => {
  // No authentication needed
});

// Get user's events (requires auth)
router.get(
  '/my-events',
  authenticate,
  async (req, res) => {
    const userId = req.user!.userId;
    // Fetch user's events
  }
);

export default router;
*/

/**
 * =====================================
 * STEP 4: Frontend Integration (Next.js)
 * =====================================
 */

/*
// utils/auth.ts
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// api/authService.ts
export const authService = {
  async register(data) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.data?.token) setAuthToken(json.data.token);
    return json;
  },

  async login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (json.data?.token) setAuthToken(json.data.token);
    return json;
  },

  async logout() {
    removeAuthToken();
  },

  async getProfile() {
    const res = await fetch('/api/auth/profile', {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },
};

// Protected API calls
const apiCall = async (endpoint, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(endpoint, { ...options, headers });

  if (response.status === 401) {
    // Token expired or invalid
    removeAuthToken();
    window.location.href = '/login';
  }

  return await response.json();
};
*/

/**
 * =====================================
 * STEP 5: Protected Route Example
 * =====================================
 */

/*
Backend: src/routes/sponsorship.routes.ts

import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

// Sponsors propose sponsorship
router.post(
  '/propose',
  authenticate,
  authorizeRoles('sponsor'),
  async (req, res) => {
    const sponsorId = req.user!.userId;
    const { eventId, amount, benefits } = req.body;
    // Save sponsorship proposal
    res.json({ success: true, sponsorshipId: '...' });
  }
);

// Organizers approve sponsorship
router.put(
  '/:id/approve',
  authenticate,
  authorizeRoles('organizer'),
  async (req, res) => {
    const organizerId = req.user!.userId;
    // Verify organizer owns the event
    // Update sponsorship status
    res.json({ success: true, message: 'Sponsorship approved' });
  }
);

// Admin can delete any sponsorship
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('admin'),
  async (req, res) => {
    // Delete sponsorship
    res.json({ success: true, message: 'Sponsorship deleted' });
  }
);

export default router;
*/

/**
 * =====================================
 * STEP 6: Error Handling
 * =====================================
 */

/*
Frontend: Handle auth errors

async function makeProtectedRequest(endpoint, options) {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or missing
      removeAuthToken();
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    if (response.status === 403) {
      // Insufficient permissions
      throw new Error('You do not have permission for this action.');
    }
    throw new Error(data.message || 'Request failed');
  }

  return data;
}
*/

/**
 * =====================================
 * STEP 7: Running the Application
 * =====================================
 */

/*
1. Install dependencies:
   npm install

2. Set environment variables:
   Create .env file with JWT_SECRET, etc.

3. Start MongoDB:
   mongod (or use MongoDB Atlas connection string)

4. Start backend:
   npm run dev

5. Test authentication:
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "Password123",
       "role": "organizer"
     }'

6. Copy the token and test protected route:
   curl http://localhost:5000/api/auth/profile \
     -H "Authorization: Bearer <token_here>"
*/

/**
 * =====================================
 * STEP 8: File Structure Summary
 * =====================================
 */

/*
backend/
├── src/
│   ├── utils/
│   │   ├── jwt.ts ..................... Token generation & verification
│   │   └── password.ts ................ Hashing & comparison
│   │
│   ├── controllers/
│   │   └── auth.controller.ts ......... Register, login, logout logic
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts ......... JWT verification
│   │   └── role.middleware.ts ......... Role-based access control
│   │
│   ├── routes/
│   │   ├── auth.routes.ts ............. Auth endpoints
│   │   └── examples.routes.ts ......... Example protected routes
│   │
│   ├── models/
│   │   └── User.model.ts .............. User schema with roles
│   │
│   ├── app.ts ........................ Express app with auth routes
│   └── server.ts ..................... Server startup
│
├── AUTHENTICATION_GUIDE.md ........... Complete documentation
├── QUICK_START.md ................... This file
├── .env ............................. Environment variables
└── package.json ..................... Dependencies

All files follow MVC pattern and TypeScript best practices!
*/

/**
 * =====================================
 * STEP 9: Common Issues & Solutions
 * =====================================
 */

/*
❌ "Token has expired"
✅ Frontend needs to re-authenticate user
   Implement login screen that appears when token expires

❌ "Invalid token" on valid token
✅ Check JWT_SECRET matches between generation and verification
   Check token format: "Bearer <token>" (not just token)

❌ "Access denied. Required role: admin"
✅ User doesn't have required role
   Check user.role in database
   Create admin user if needed

❌ CORS error
✅ Check FRONTEND_URL in .env matches origin
   Ensure credentials: true in CORS config

❌ "undefined" in req.user
✅ Missing authenticate middleware
   Always add authenticate before authorizeRoles
   Check middleware order in routes

❌ Password not hashing
✅ bcryptjs installed? npm install bcryptjs
   Check password field in User model has select: false
*/

export default {};
