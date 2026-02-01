import { Request, Response, NextFunction } from 'express';

/**
 * Role-based authorization middleware
 * Checks if user has one of the allowed roles
 * Must be used after authentication middleware
 * 
 * Usage examples:
 * router.post('/admin-only', authenticate, authorizeRoles('admin'), handler)
 * router.get('/organizer-sponsor', authenticate, authorizeRoles('organizer', 'sponsor'), handler)
 * 
 * @param allowedRoles - Roles that are allowed to access the route
 */
export const authorizeRoles = (...allowedRoles: Array<'organizer' | 'sponsor' | 'admin'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user is attached to request (by auth middleware)
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
        });
        return;
      }

      // User has required role
      next();
    } catch (error: any) {
      console.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization check failed',
      });
    }
  };
};

/**
 * Admin-only middleware
 * Shorthand for authorizeRoles('admin')
 * 
 * Usage: router.delete('/api/users/:id', authenticate, adminOnly, handler)
 */
export const adminOnly = authorizeRoles('admin');

/**
 * Organizer or Admin middleware
 * Shorthand for authorizeRoles('organizer', 'admin')
 */
export const organizerOrAdmin = authorizeRoles('organizer', 'admin');

/**
 * Sponsor or Admin middleware
 * Shorthand for authorizeRoles('sponsor', 'admin')
 */
export const sponsorOrAdmin = authorizeRoles('sponsor', 'admin');
