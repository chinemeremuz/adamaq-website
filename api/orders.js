import { ensureSchema, getSql, sendJson } from './_db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });
  try {
    const sql = getSql();
    await ensureSchema(sql);
    if (req.method === 'GET') {
      const rows = await sql`SELECT data FROM adamaq_orders ORDER BY updated_at DESC`;
      return sendJson(res, 200, { orders: rows.map(row => row.data) });
    }
    if (req.method === 'POST') {
      const records = Array.isArray(req.body) ? req.body : [req.body];
      for (const order of records) {
        if (!order?.id) continue;
        await sql`
          INSERT INTO adamaq_orders (id, data, updated_at)
          VALUES (${String(order.id)}, ${JSON.stringify(order)}::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
        `;
      }
      return sendJson(res, 200, { ok: true });
    }
    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: 'Orders service unavailable' });
  }
}

