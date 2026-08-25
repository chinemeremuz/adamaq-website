import { ensureSchema, getSql, sendJson } from './_db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });
  try {
    const sql = getSql();
    await ensureSchema(sql);
    if (req.method === 'GET') {
      const rows = await sql`SELECT data FROM adamaq_consultations ORDER BY updated_at DESC`;
      return sendJson(res, 200, { consultations: rows.map(row => row.data) });
    }
    if (req.method === 'POST') {
      const records = Array.isArray(req.body) ? req.body : [req.body];
      for (const consultation of records) {
        if (!consultation?.id) continue;
        await sql`
          INSERT INTO adamaq_consultations (id, data, updated_at)
          VALUES (${String(consultation.id)}, ${JSON.stringify(consultation)}::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
        `;
      }
      return sendJson(res, 200, { ok: true });
    }
    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: 'Consultations service unavailable' });
  }
}

