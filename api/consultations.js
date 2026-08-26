import { ensureSchema, getSql, sendJson } from './_db.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>\"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[char]));

async function notifyByEmail(consultation) {
  if (!process.env.RESEND_API_KEY || !process.env.CONSULTATION_RECIPIENT_EMAIL) return false;
  const subject = `New Adamaq consultation from ${consultation.name}`;
  const html = `<h2>New consultation request</h2><p><strong>Name:</strong> ${escapeHtml(consultation.name)}</p><p><strong>Email:</strong> ${escapeHtml(consultation.email)}</p><p><strong>Phone:</strong> ${escapeHtml(consultation.phone || 'Not provided')}</p><p><strong>Looking for:</strong> ${escapeHtml(consultation.need)}</p><p><strong>Bespoke dress:</strong> ${consultation.bespoke ? 'Yes' : 'No'}</p><p><strong>Message:</strong><br/>${escapeHtml(consultation.message).replace(/\n/g, '<br/>')}</p>${consultation.measurementSummary ? `<p><strong>Measurements:</strong><br/>${escapeHtml(consultation.measurementSummary)}</p>` : ''}`;
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.EMAIL_FROM || 'Adamaq Consultations <onboarding@resend.dev>', to: [process.env.CONSULTATION_RECIPIENT_EMAIL], subject, html }) });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  return true;
}

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
      let emailSent = 0;
      for (const consultation of records) {
        if (!consultation?.id) continue;
        const inserted = await sql`
          INSERT INTO adamaq_consultations (id, data, updated_at)
          VALUES (${String(consultation.id)}, ${JSON.stringify(consultation)}::jsonb, NOW())
          ON CONFLICT (id) DO NOTHING
          RETURNING id
        `;
        if (!inserted.length) {
          await sql`UPDATE adamaq_consultations SET data = ${JSON.stringify(consultation)}::jsonb, updated_at = NOW() WHERE id = ${String(consultation.id)}`;
          continue;
        }
        try { if (await notifyByEmail(consultation)) emailSent += 1; } catch (emailError) { console.error('Consultation email failed:', emailError); }
      }
      return sendJson(res, 200, { ok: true, emailSent });
    }
    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: 'Consultations service unavailable' });
  }
}

