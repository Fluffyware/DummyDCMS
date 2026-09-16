import crypto from 'crypto';

const AUTH_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.R2_SECRET_ACCESS_KEY || 'thi-qms-secure-token-salt-2026';

/**
 * Validates document key to prevent path traversal and arbitrary bucket access.
 * Allowed keys must start with "documents/" and contain only safe alphanumeric and standard filename characters.
 */
export function validateDocumentKey(key: string): { valid: boolean; error?: string } {
  if (!key || typeof key !== 'string') {
    return { valid: false, error: 'Key berkas tidak valid.' };
  }

  // Prevent null bytes
  if (key.indexOf('\0') !== -1) {
    return { valid: false, error: 'Key berkas mengandung karakter terlarang.' };
  }

  // Prevent directory traversal
  if (key.includes('..') || key.includes('\\') || key.startsWith('/') || key.startsWith('./')) {
    return { valid: false, error: 'Key berkas tidak diperbolehkan (path traversal terdeteksi).' };
  }

  // Enforce document storage prefix
  if (!key.startsWith('documents/')) {
    return { valid: false, error: 'Akses dibatasi hanya untuk folder documents/.' };
  }

  // Whitelist safe characters: letters, numbers, dash, underscore, dot, forward slash
  const safePathRegex = /^documents\/[a-zA-Z0-9_\-./]+$/;
  if (!safePathRegex.test(key)) {
    return { valid: false, error: 'Nama berkas mengandung karakter khusus yang tidak diizinkan.' };
  }

  return { valid: true };
}

/**
 * Generates an HMAC-SHA256 token for securely accessing a document via email link.
 * Token format: <timestamp>.<signature>
 */
export function generateSignedFileToken(key: string): string {
  const timestamp = Date.now().toString();
  const data = `${key}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('hex');
  return `${timestamp}.${hmac}`;
}

/**
 * Verifies a signed file access token.
 * Token is valid for 30 days.
 */
export function verifySignedFileToken(key: string, token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Max age: 30 days
  const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAgeMs) {
    return false;
  }

  if (!signature || signature.length !== 64 || !/^[0-9a-f]{64}$/i.test(signature)) {
    return false;
  }

  const expectedData = `${key}:${timestampStr}`;
  const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(expectedData).digest('hex');

  try {
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}
