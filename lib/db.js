// lib/db.js
// Usa Neon (Postgres serverless grátis) via @neondatabase/serverless
// Compatible com Vercel Edge/Serverless functions

import { neon } from '@neondatabase/serverless'

let sql

export function getDB() {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL não definida. Configure nas variáveis de ambiente da Vercel.')
    }
    sql = neon(process.env.DATABASE_URL)
  }
  return sql
}
