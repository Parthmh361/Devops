import express, { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router: Router = express.Router();

/**
 * Public routes (no authentication required)
 */

/**
 * POST /api/auth/register
 * Register a new user
 * Body: { name, email, password, role?, phone?, organizationName? }
 */
router.post('/register', registerUser);

/**
 * POST /api/auth/login
 * Login user with email and password
 * Body: { email, password }
 */
router.post('/login', loginUser);

/**
 * POST /api/auth/logout
 * Logout user (stateless)
 */
router.post('/logout', logoutUser);

/**
 * Protected routes (authentication required)
 */

/**
 * GET /api/auth/profile
 * Get current user profile
 * Headers: { Authorization: "Bearer <token>" }
 */
router.get('/profile', authenticate, getCurrentUser);

export default router;
