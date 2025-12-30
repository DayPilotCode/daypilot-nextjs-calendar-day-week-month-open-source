import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'shiftaware_session';
const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Get the stored password hash from environment variable
 */
export function getStoredPasswordHash(): string {
  const hash = process.env.AUTH_PASSWORD_HASH?.trim();
  if (!hash) {
    throw new Error('AUTH_PASSWORD_HASH environment variable is not set');
  }
  return hash;
}

/**
 * Verify login credentials
 */
export async function verifyLogin(password: string): Promise<boolean> {
  try {
    const storedHash = getStoredPasswordHash();
    return await verifyPassword(password, storedHash);
  } catch (error) {
    console.error('Login verification error:', error);
    return false;
  }
}

/**
 * Create a session by setting a cookie
 */
export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);
    return session?.value === 'authenticated';
  } catch (error) {
    return false;
  }
}

/**
 * Destroy session (logout)
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

