/**
 * Extended Express Request Interface
 * Add this to your app.ts or create as separate file: src/types/express.d.ts
 * 
 * This ensures TypeScript knows about the 'user' property added by auth middleware
 */

import { ITokenPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      /**
       * User payload from JWT token
       * Attached by authenticate middleware
       * 
       * Properties:
       * - userId: MongoDB user ID
       * - email: User email address
       * - role: User role (organizer, sponsor, admin)
       */
      user?: ITokenPayload;
    }
  }
}

/**
 * USAGE EXAMPLES:
 * 
 * In your route handlers:
 * 
 * router.get('/profile', authenticate, (req, res) => {
 *   // TypeScript knows req.user exists and has these properties:
 *   const userId = req.user!.userId;      // ! asserts non-null
 *   const email = req.user?.email;        // optional chaining
 *   const role = req.user!.role as 'admin' | 'organizer' | 'sponsor';
 * });
 */

export {};
