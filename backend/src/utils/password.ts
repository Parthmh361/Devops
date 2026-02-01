import bcrypt from 'bcryptjs';

/**
 * Hash a plain text password using bcrypt
 * Uses salt rounds from environment or default of 10
 * @param plainPassword - Plain text password to hash
 * @returns Hashed password
 */
export const hashPassword = async (plainPassword: string): Promise<string> => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
  } catch (error: any) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
};

/**
 * Compare a plain text password with a hashed password
 * @param plainPassword - Plain text password to compare
 * @param hashedPassword - Hashed password from database
 * @returns true if passwords match, false otherwise
 */
export const comparePasswords = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error: any) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
};
