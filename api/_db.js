import { neon } from '@neondatabase/serverless';

let schemaReady;

export function getSql() {
  const connection = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || process.env.NEON_DATABASE_URL || process.env.NEON_POSTGRES_URL || process.env.STORAGE_DATABASE_URL || process.env.STORAGE_POSTGRES_URL || process.env.STORAGE_URL;
  if (!connection) throw new Error('A Neon database connection is not configured.');
  return neon(connection);
}

export async function ensureSchema(sql) {
  if (!schemaReady) {
    schemaReady = Promise.all([
      sql`CREATE TABLE IF NOT EXISTS adamaq_orders (id TEXT PRIMARY KEY, data JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
      sql`CREATE TABLE IF NOT EXISTS adamaq_consultations (id TEXT PRIMARY KEY, data JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
      sql`CREATE TABLE IF NOT EXISTS adamaq_products (id TEXT PRIMARY KEY, data JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`
    ]);
  }
  await schemaReady;
}

export function sendJson(res, status, payload) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.status(status).json(payload);
}

