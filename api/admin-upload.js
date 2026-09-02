import { isAdminRequest } from './_admin.js';
import { sendJson } from './_db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  if (!isAdminRequest(req)) return sendJson(res, 401, { error: 'Admin sign-in required.' });
  try {
    const { dataUrl, filename, contentType } = req.body || {};
    if (!dataUrl || !String(dataUrl).startsWith('data:image/')) return sendJson(res, 400, { error: 'Please choose a valid image.' });
    const match = String(dataUrl).match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
    if (!match) return sendJson(res, 400, { error: 'Only JPG, PNG, and WebP images are supported.' });
    const bytes = Buffer.from(match[2], 'base64');
    if (bytes.length > 4 * 1024 * 1024) return sendJson(res, 413, { error: 'Image is still too large. Please choose a smaller image.' });
    const safeName = String(filename || 'product-image').replace(/[^a-z0-9._-]/gi, '-').toLowerCase();
    if (!process.env.BLOB_READ_WRITE_TOKEN) return sendJson(res, 503, { error: 'Vercel Blob is not connected yet.' });
    const pathname = `products/${Date.now()}-${safeName}`;
    const blobResponse = await fetch(`https://blob.vercel-storage.com/${pathname.split('/').map(encodeURIComponent).join('/')}`, { method: 'PUT', headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`, 'x-api-version': '7', 'x-content-type': contentType || match[1], 'x-add-random-suffix': '1', 'x-cache-control-max-age': '31536000' }, body: bytes });
    const blob = await blobResponse.json();
    if (!blobResponse.ok || !blob.url) throw new Error(blob.error || 'Blob upload failed');
    return sendJson(res, 200, { ok: true, url: blob.url });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: 'Image upload failed. Confirm that Vercel Blob is connected.' });
  }
}

