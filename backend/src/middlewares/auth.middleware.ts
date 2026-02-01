import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyAccessToken, ITokenPayload } from '../utils/jwt';

/**
 * Extend Express Request to include user property
 */
declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 * Attaches decoded user payload to request
 * 
 * Usage: app.use(authenticate) or router.use(authenticate)
 * Or: router.get('/protected', authenticate, handler)
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No token provided. Use Authorization: Bearer <token>',
      });
      return;
    }

    // Verify and decode token
    const decoded = verifyAccessToken(token);

    // Attach user payload to request
    req.user = decoded;

    next();
  } catch (error: any) {
    console.error('Authentication error:', error.message);

    let statusCode = 401;
    let message = 'Authentication failed';

    if (error.message.includes('expired')) {
      statusCode = 401;
      message = 'Token has expired. Please login again.';
    } else if (error.message.includes('Invalid')) {
      statusCode = 401;
      message = 'Invalid token';
    }

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

/**
 * Optional authentication middleware
 * Attempts to attach user to request but does not fail if token is invalid
 * Useful for endpoints that work with or without authentication
 */
export const optionalAuthenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }
  } catch (error) {
    // Silently fail - user will be undefined
    console.debug('Optional authentication skipped');
  }

  next();
};
