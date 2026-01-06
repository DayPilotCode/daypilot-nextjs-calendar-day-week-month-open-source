import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "shiftaware_session";
const DEFAULT_TTL_MINUTES = Number(process.env.SESSION_TIMEOUT_MINUTES ?? "60");

const SESSION_SECRET = process.env.SESSION_SECRET?.trim();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH?.trim();

// Fail fast at module load if critical envs are missing so startup, not login, surfaces misconfiguration.
if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is not set");
}

if (!ADMIN_PASSWORD_HASH) {
  throw new Error("ADMIN_PASSWORD_HASH environment variable is not set");
}

const getSessionSecret = (): string => SESSION_SECRET;
const getStoredPasswordHash = (): string => ADMIN_PASSWORD_HASH;

const signPayload = (payload: string): string => {
  const secret = getSessionSecret();
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
};

const validateSessionValue = (value?: string): boolean => {
  if (!value) return false;
  const pieces = value.split(".");
  if (pieces.length < 2) return false;

  const lastDot = value.lastIndexOf(".");
  if (lastDot === -1) return false;

  const payload = value.slice(0, lastDot);
  const signature = value.slice(lastDot + 1);

  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");

  if (signature.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;

  const firstColon = payload.indexOf(":");
  if (firstColon === -1) return false;

  const expiresIso = payload.slice(firstColon + 1);
  const expiresAt = new Date(expiresIso);

  return !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() > Date.now();
};

const buildSessionValue = () => {
  const expiresAt = new Date(Date.now() + DEFAULT_TTL_MINUTES * 60 * 1000);
  const payload = `${crypto.randomUUID()}:${expiresAt.toISOString()}`;
  return { signed: signPayload(payload), expiresAt };
};

export async function verifyLogin(password: string): Promise<boolean> {
  const storedHash = getStoredPasswordHash();
  return bcrypt.compare(password, storedHash);
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  const session = buildSessionValue();

  cookieStore.set(SESSION_COOKIE_NAME, session.signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: session.expiresAt,
    path: "/",
  });
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);
    return validateSessionValue(session?.value);
  } catch {
    return false;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function validateSessionCookie(value?: string): boolean {
  return validateSessionValue(value);
}

