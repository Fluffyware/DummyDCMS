import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { UserProfile, UserRole } from './mock-data';

const SESSION_SECRET =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.R2_SECRET_ACCESS_KEY ||
  'thi-server-auth-session-key-2026';

export const SESSION_COOKIE_NAME = 'qms_session';
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Secure server-side user registry (server-only, never sent to browser bundle)
const SERVER_USERS: (UserProfile & { passwordHash: string })[] = [
  {
    id: 'admin-rizal',
    username: 'rizal',
    name: 'Rizal',
    email: 'rizal@thi.co.id',
    role: 'admin',
    roleName: 'QMS',
    department: 'QHSE & QMS',
    position: 'Lead Quality & Management System',
    avatar: 'RZ',
    // SHA256 of '12345'
    passwordHash: '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
  },
  {
    id: 'admin-khabil',
    username: 'khabil',
    name: 'Khabil',
    email: 'khabil@thi.co.id',
    role: 'admin',
    roleName: 'QMS',
    department: 'QHSE & QMS',
    position: 'Document Controller & QMS',
    avatar: 'KB',
    passwordHash: '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
  },
  {
    id: 'staff-geo',
    username: 'GT',
    name: 'Staff Geotechnical',
    email: 'staff.geo@thi.co.id',
    role: 'staff',
    roleName: 'Staff',
    department: 'Geotechnical & Survey Operations',
    position: 'Operational Field Engineer',
    avatar: 'GT',
    passwordHash: '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
  },
  {
    id: 'staff-ops',
    username: 'OP',
    name: 'Staff Operations',
    email: 'staff.ops@thi.co.id',
    role: 'staff',
    roleName: 'Staff',
    department: 'Operations',
    position: 'Operations Coordinator',
    avatar: 'OP',
    passwordHash: '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
  },
  {
    id: 'staff-eng',
    username: 'EN',
    name: 'Staff Engineering',
    email: 'staff.eng@thi.co.id',
    role: 'staff',
    roleName: 'Staff',
    department: 'Engineering',
    position: 'Project Engineer',
    avatar: 'EN',
    passwordHash: '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
  },
  {
    id: 'staff-hr',
    username: 'HR',
    name: 'Staff HR & GA',
    email: 'staff.hr@thi.co.id',
    role: 'staff',
    roleName: 'Staff',
    department: 'Human Resources & General Affairs',
    position: 'HR Officer',
    avatar: 'HR',
    passwordHash: '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
  },
  {
    id: 'staff-fin',
    username: 'FA',
    name: 'Staff Finance',
    email: 'staff.fin@thi.co.id',
    role: 'staff',
    roleName: 'Staff',
    department: 'Finance & Accounting',
    position: 'Finance Specialist',
    avatar: 'FA',
    passwordHash: '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
  },
  {
    id: 'staff-it',
    username: 'IT',
    name: 'Staff IT',
    email: 'staff.it@thi.co.id',
    role: 'staff',
    roleName: 'Staff',
    department: 'Information Technology',
    position: 'System Administrator',
    avatar: 'IT',
    passwordHash: '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
  },
  {
    id: 'staff-env',
    username: 'EV',
    name: 'Staff Environment',
    email: 'staff.env@thi.co.id',
    role: 'staff',
    roleName: 'Staff',
    department: 'Environment',
    position: 'Environmental Specialist',
    avatar: 'EV',
    passwordHash: '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
  },
  {
    id: 'staff-com',
    username: 'CL',
    name: 'Staff Commercial',
    email: 'staff.com@thi.co.id',
    role: 'staff',
    roleName: 'Staff',
    department: 'Commercial & Logistics',
    position: 'Document Controller Commercial',
    avatar: 'CL',
    passwordHash: '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
  },
];

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
}

/**
 * Validates credentials on the server side.
 * Returns safe UserProfile without password if valid, or null.
 */
export function authenticateCredentials(usernameInput: string, passwordInput: string): UserProfile | null {
  const cleanUser = usernameInput.trim().toLowerCase();
  const inputHash = hashPassword(passwordInput);

  let target = SERVER_USERS.find(
    u => u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser
  );

  if (!target) {
    if (cleanUser === 'rizal') target = SERVER_USERS.find(u => u.id === 'admin-rizal');
    else if (cleanUser === 'khabil') target = SERVER_USERS.find(u => u.id === 'admin-khabil');
    else if (cleanUser === 'gt' || cleanUser === 'geotechnical' || cleanUser === 'geo') target = SERVER_USERS.find(u => u.id === 'staff-geo');
    else if (cleanUser === 'op' || cleanUser === 'operations' || cleanUser === 'ops') target = SERVER_USERS.find(u => u.id === 'staff-ops');
    else if (cleanUser === 'en' || cleanUser === 'engineering' || cleanUser === 'eng') target = SERVER_USERS.find(u => u.id === 'staff-eng');
    else if (cleanUser === 'hr' || cleanUser === 'ga' || cleanUser === 'hr.ga' || cleanUser === 'hr & general affairs') target = SERVER_USERS.find(u => u.id === 'staff-hr');
    else if (cleanUser === 'fa' || cleanUser === 'finance' || cleanUser === 'fin' || cleanUser === 'finance & accounting') target = SERVER_USERS.find(u => u.id === 'staff-fin');
    else if (cleanUser === 'it' || cleanUser === 'information technology') target = SERVER_USERS.find(u => u.id === 'staff-it');
    else if (cleanUser === 'ev' || cleanUser === 'environment' || cleanUser === 'env') target = SERVER_USERS.find(u => u.id === 'staff-env');
    else if (cleanUser === 'cl' || cleanUser === 'commercial' || cleanUser === 'com' || cleanUser === 'commercial & logistics') target = SERVER_USERS.find(u => u.id === 'staff-com');
  }

  if (!target) return null;

  // Constant-time password hash comparison
  const targetBuffer = Buffer.from(target.passwordHash, 'hex');
  const inputBuffer = Buffer.from(inputHash, 'hex');
  if (targetBuffer.length !== inputBuffer.length || !crypto.timingSafeEqual(targetBuffer, inputBuffer)) {
    return null;
  }

  // Strip password hash
  const { passwordHash: _, ...safeUser } = target;
  return safeUser;
}

/**
 * Creates a cryptographically signed session token.
 */
export function createSessionToken(user: UserProfile): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = JSON.stringify({
    id: user.id,
    role: user.role,
    username: user.username,
    name: user.name,
    email: user.email,
    department: user.department,
    exp: expiresAt,
  });

  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies a session token and returns the user profile if valid and unexpired.
 */
export function verifySessionToken(token: string | null | undefined): UserProfile | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  try {
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }

    const payloadJson = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson);

    if (!payload.exp || Date.now() > payload.exp) {
      return null; // Expired
    }

    const matchedUser = SERVER_USERS.find(u => u.id === payload.id);
    if (matchedUser) {
      const { passwordHash: _, ...safeUser } = matchedUser;
      return safeUser;
    }

    return {
      id: payload.id,
      username: payload.username,
      name: payload.name,
      email: payload.email,
      role: payload.role as UserRole,
      department: payload.department,
      position: payload.position || 'Staff',
      avatar: payload.avatar || 'TH',
    };
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the session user from an incoming NextRequest.
 */
export function getSessionUser(req: NextRequest): UserProfile | null {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) return null;
  return verifySessionToken(cookie.value);
}

/**
 * Sets an httpOnly secure session cookie on a NextResponse.
 */
export function setSessionCookie(res: NextResponse, user: UserProfile): void {
  const token = createSessionToken(user);
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
  });
}

/**
 * Clears the session cookie on a NextResponse.
 */
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}
