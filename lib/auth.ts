import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "shiftaware_session";
const DEFAULT_TTL_MINUTES = Number(process.env.SESSION_TIMEOUT_MINUTES ?? "60");
const IS_PROD = process.env.NODE_ENV === "production";

let DEV_HASH_CACHE: string | null = null;
let DEV_SESSION_SECRET: string | null = null;

const getSessionSecret = (): string => {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret) return secret;

  const allowInsecure = process.env.ALLOW_INSECURE_DEV_LOGIN === "true";
  const fallback =
    process.env.DEV_SESSION_SECRET?.trim() || "dev-session-secret-change-me";

  if (allowInsecure && !IS_PROD) {
    if (!DEV_SESSION_SECRET) {
      DEV_SESSION_SECRET = fallback;
      console.warn(
        "[auth] Using insecure dev session secret; set SESSION_SECRET for real deployments."
      );
    }
    return DEV_SESSION_SECRET;
  }

  throw new Error("SESSION_SECRET environment variable is not set");
};

const getStoredPasswordHash = (): string => {
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  
  if (hash) {
    // Validate hash format and length
    if (hash.length !== 60) {
      throw new Error(
        `ADMIN_PASSWORD_HASH has invalid length: ${hash.length} (expected 60). ` +
        `Hash may be truncated. Ensure it's quoted in .env file: ADMIN_PASSWORD_HASH="${hash}..."`
      );
    }
    
    if (!hash.startsWith("$2a$") && !hash.startsWith("$2b$") && !hash.startsWith("$2y$")) {
      throw new Error(
        `ADMIN_PASSWORD_HASH has invalid format. Expected bcrypt hash starting with $2a$, $2b$, or $2y$, ` +
        `got: ${hash.substring(0, Math.min(10, hash.length))}... (length: ${hash.length})`
      );
    }
    
    // Debug logging in development
    if (!IS_PROD) {
      console.log(`[auth] Loaded password hash: length=${hash.length}, prefix=${hash.substring(0, 7)}`);
    }
    
    return hash;
  }

  const allowInsecure = process.env.ALLOW_INSECURE_DEV_LOGIN === "true";
  const devPassword = process.env.DEV_ADMIN_PASSWORD || "changeme";

  if (allowInsecure && !IS_PROD) {
    if (!DEV_HASH_CACHE) {
      DEV_HASH_CACHE = bcrypt.hashSync(devPassword, 10);
      console.warn(
        "[auth] Using insecure dev password fallback; set ADMIN_PASSWORD_HASH for real deployments."
      );
    }
    return DEV_HASH_CACHE;
  }

  throw new Error("ADMIN_PASSWORD_HASH environment variable is not set");
};

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

  let secret: string;
  try {
    secret = getSessionSecret();
  } catch (error) {
    console.error("Session validation failed (secret missing):", error);
    return false;
  }

  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");

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

