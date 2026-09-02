import { isAdminRequest } from './_admin.js';
import { ensureSchema, getSql, sendJson } from './_db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });
  try {
    const sql = getSql();
    await ensureSchema(sql);
    if (req.method === 'GET') {
      const rows = await sql`SELECT data FROM adamaq_products ORDER BY updated_at DESC`;
      return sendJson(res, 200, { products: rows.map(row => row.data) });
    }
    if (!isAdminRequest(req)) return sendJson(res, 401, { error: 'Admin authorization required' });
    if (req.method === 'POST') {
      const products = Array.isArray(req.body) ? req.body : [req.body];
      for (const product of products) {
        if (!product?.id || !product?.name) continue;
        await sql`INSERT INTO adamaq_products (id, data, updated_at)
          VALUES (${String(product.id)}, ${JSON.stringify(product)}::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`;
      }
      return sendJson(res, 200, { ok: true });
    }
    if (req.method === 'DELETE') {
      if (!req.query?.id) return sendJson(res, 400, { error: 'Product id is required' });
      await sql`DELETE FROM adamaq_products WHERE id = ${String(req.query.id)}`;
      return sendJson(res, 200, { ok: true });
    }
    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: 'Products service unavailable' });
  }
}