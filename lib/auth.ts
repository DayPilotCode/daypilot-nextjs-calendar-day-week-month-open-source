import { cookies } from "next/headers";

/**
 * Simplified authentication per ShiftAware plan:
 * - Plain ADMIN_PASSWORD env variable (no hashing)
 * - Simple authenticated cookie (no signing)
 * - Configurable session timeout (default 60 minutes)
 */

const AUTH_COOKIE_NAME = "authenticated";
const DEFAULT_TTL_SECONDS = Number(process.env.SESSION_TIMEOUT_MINUTES ?? "60") * 60;

/**
 * Verify login password against ADMIN_PASSWORD env variable.
 * Per plan: direct string comparison (low-risk scope).
 */
export async function verifyLogin(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD environment variable is not set");
  }
  
  return password === adminPassword;
}

/**
 * Create authenticated session cookie.
 * Sets simple "authenticated" cookie with httpOnly flag.
 */
export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  const expiresAt = new Date(Date.now() + DEFAULT_TTL_SECONDS * 1000);
  
  cookieStore.set(AUTH_COOKIE_NAME, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: DEFAULT_TTL_SECONDS,
    expires: expiresAt,
    path: "/",
  });
}

/**
 * Check if user is authenticated by verifying authenticated cookie.
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
    return authCookie?.value === "true";
  } catch {
    return false;
  }
}

/**
 * Destroy authenticated session by deleting cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Validate session cookie value (for middleware compatibility).
 * Per simplified plan: just checks if value is "true".
 */
export function validateSessionCookie(value?: string): boolean {
  return value === "true";
}

