import { createAdminToken } from './_admin.js';
import { sendJson } from './_db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const expectedEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (!expectedEmail || !process.env.ADMIN_PASSWORD) return sendJson(res, 503, { error: 'Admin login is not configured yet.' });
  if (email !== expectedEmail || password !== process.env.ADMIN_PASSWORD) return sendJson(res, 401, { error: 'Incorrect email or password.' });
  return sendJson(res, 200, { ok: true, token: createAdminToken(), owner: email });
}

