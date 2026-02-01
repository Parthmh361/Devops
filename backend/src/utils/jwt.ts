import jwt from 'jsonwebtoken';

/**
 * Interface for JWT payload containing user information
 */
export interface ITokenPayload {
  userId: string;
  email: string;
  role: 'organizer' | 'sponsor' | 'admin';
}

/**
 * Generate an access token with 7-day expiry
 * @param payload - User data to include in token
 * @returns JWT token string
 */
export const generateAccessToken = (payload: ITokenPayload): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';

  return jwt.sign(payload, secret, {
    expiresIn: '7d', // Token valid for 7 days
    algorithm: 'HS256',
  });
};

/**
 * Verify and decode an access token
 * @param token - JWT token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export const verifyAccessToken = (token: string): ITokenPayload => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';

  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    }) as ITokenPayload;

    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

/**
 * Extract token from Authorization header
 * Expected format: "Bearer <token>"
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};
