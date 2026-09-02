import crypto from 'node:crypto';

const secret = () => process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;

export function createAdminToken() {
  const key = secret();
  if (!key) throw new Error('Admin security is not configured.');
  const payload = Buffer.from(JSON.stringify({ sub: 'admin', exp: Date.now() + 1000 * 60 * 60 * 12 })).toString('base64url');
  const signature = crypto.createHmac('sha256', key).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function isAdminRequest(req) {
  const key = secret();
  const value = req.headers.authorization || '';
  const token = value.startsWith('Bearer ') ? value.slice(7) : '';
  if (!key || !token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = crypto.createHmac('sha256', key).update(payload).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.sub === 'admin' && data.exp > Date.now();
  } catch { return false; }
}

