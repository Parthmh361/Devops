import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
} from '../controllers/admin.user.controller';

const router: Router = express.Router();

/**
 * All routes require authentication and admin role
 */

// Get all users with filters and pagination
// Query params: role, isActive, isVerified, search, page, limit
router.get('/', authenticate, authorizeRoles('admin'), getAllUsers);

// Get single user by ID
router.get('/:id', authenticate, authorizeRoles('admin'), getUserById);

// Update user status (activate/deactivate)
router.patch('/:id/status', authenticate, authorizeRoles('admin'), updateUserStatus);

// Soft delete user
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteUser);

export default router;
