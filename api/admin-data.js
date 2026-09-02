import { ensureSchema, getSql, sendJson } from './_db.js';
import { isAdminRequest } from './_admin.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });
  if (!isAdminRequest(req)) return sendJson(res, 401, { error: 'Admin sign-in required.' });
  try {
    const sql = getSql();
    await ensureSchema(sql);
    if (req.method === 'GET') {
      const [orders, consultations, products] = await Promise.all([
        sql`SELECT data FROM adamaq_orders ORDER BY updated_at DESC`,
        sql`SELECT data FROM adamaq_consultations ORDER BY updated_at DESC`,
        sql`SELECT data FROM adamaq_products ORDER BY updated_at DESC`
      ]);
      return sendJson(res, 200, { orders: orders.map(x => x.data), consultations: consultations.map(x => x.data), products: products.map(x => x.data) });
    }
    if (req.method === 'POST') {
      const { action, record } = req.body || {};
      if (!record?.id) return sendJson(res, 400, { error: 'A record id is required.' });
      if (action === 'product') {
        await sql`INSERT INTO adamaq_products (id, data, updated_at) VALUES (${String(record.id)}, ${JSON.stringify(record)}::jsonb, NOW()) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`;
      } else if (action === 'delete-product') {
        await sql`DELETE FROM adamaq_products WHERE id = ${String(record.id)}`;
      } else if (action === 'order') {
        await sql`UPDATE adamaq_orders SET data = ${JSON.stringify(record)}::jsonb, updated_at = NOW() WHERE id = ${String(record.id)}`;
      } else if (action === 'consultation') {
        await sql`UPDATE adamaq_consultations SET data = ${JSON.stringify(record)}::jsonb, updated_at = NOW() WHERE id = ${String(record.id)}`;
      } else return sendJson(res, 400, { error: 'Unknown admin action.' });
      return sendJson(res, 200, { ok: true });
    }
    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: 'Admin data service unavailable.' });
  }
}

