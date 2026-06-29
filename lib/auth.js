// lib/auth.js
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { parse } from 'cookie'
import { getDB } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'
const COOKIE_NAME = 'jsminify_token'

// ── Token ──────────────────────────────────────────────
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function getSession(req) {
  const cookies = parse(req.headers.cookie || '')
  const token = cookies[COOKIE_NAME]
  if (!token) return null
  return verifyToken(token)
}

export function setCookieHeader(token) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
}

export function clearCookieHeader() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0`
}

// ── Users ──────────────────────────────────────────────
export async function registerUser(username, email, password) {
  const sql = getDB()

  if (username.length < 3 || username.length > 50)
    return { success: false, message: 'Username deve ter entre 3 e 50 caracteres.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { success: false, message: 'E-mail inválido.' }
  if (password.length < 6)
    return { success: false, message: 'Senha deve ter pelo menos 6 caracteres.' }

  const existing = await sql`SELECT id FROM users WHERE email=${email} OR username=${username}`
  if (existing.length > 0)
    return { success: false, message: 'E-mail ou username já cadastrado.' }

  const hash = await bcrypt.hash(password, 12)
  await sql`INSERT INTO users (username, email, password_hash) VALUES (${username}, ${email}, ${hash})`
  return { success: true, message: 'Conta criada com sucesso!' }
}

export async function loginUser(email, password) {
  const sql = getDB()
  const rows = await sql`SELECT id, username, password_hash FROM users WHERE email=${email}`
  const user = rows[0]

  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return { success: false, message: 'E-mail ou senha incorretos.' }

  await sql`UPDATE users SET last_login=NOW() WHERE id=${user.id}`
  const token = signToken({ id: user.id, username: user.username })
  return { success: true, token }
}

export async function getCurrentUser(userId) {
  const sql = getDB()
  const rows = await sql`SELECT id, username, email, created_at FROM users WHERE id=${userId}`
  return rows[0] || null
}

export async function updateProfile(userId, username, email) {
  const sql = getDB()
  if (username.length < 3) return { success: false, message: 'Username muito curto.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false, message: 'E-mail inválido.' }
  const conflict = await sql`SELECT id FROM users WHERE (email=${email} OR username=${username}) AND id!=${userId}`
  if (conflict.length > 0) return { success: false, message: 'Username ou e-mail já em uso.' }
  await sql`UPDATE users SET username=${username}, email=${email} WHERE id=${userId}`
  return { success: true, message: 'Perfil atualizado!' }
}

export async function updatePassword(userId, currentPw, newPw) {
  const sql = getDB()
  const rows = await sql`SELECT password_hash FROM users WHERE id=${userId}`
  if (!rows[0] || !(await bcrypt.compare(currentPw, rows[0].password_hash)))
    return { success: false, message: 'Senha atual incorreta.' }
  if (newPw.length < 6) return { success: false, message: 'Nova senha muito curta.' }
  const hash = await bcrypt.hash(newPw, 12)
  await sql`UPDATE users SET password_hash=${hash} WHERE id=${userId}`
  return { success: true, message: 'Senha alterada com sucesso!' }
}

// ── Stats ──────────────────────────────────────────────
export async function getUserStats(userId) {
  const sql = getDB()
  const rows = await sql`
    SELECT 
      COUNT(*) as total_minifications,
      COALESCE(SUM(original_size), 0) as total_original,
      COALESCE(SUM(minified_size), 0) as total_minified,
      COALESCE(AVG(reduction_percent), 0) as avg_reduction
    FROM minify_history WHERE user_id=${userId}
  `
  return rows[0]
}

export async function saveHistory(userId, origSize, minSize) {
  const sql = getDB()
  const reduction = origSize > 0 ? Math.round(((origSize - minSize) / origSize) * 10000) / 100 : 0
  await sql`INSERT INTO minify_history (user_id, original_size, minified_size, reduction_percent) VALUES (${userId}, ${origSize}, ${minSize}, ${reduction})`
}

export async function getRecentHistory(userId, limit = 10) {
  const sql = getDB()
  return await sql`
    SELECT original_size, minified_size, reduction_percent, created_at
    FROM minify_history WHERE user_id=${userId}
    ORDER BY created_at DESC LIMIT ${limit}
  `
}

export async function getActivityLast30Days(userId) {
  const sql = getDB()
  return await sql`
    SELECT 
      DATE(created_at) as day,
      COUNT(*) as count,
      SUM(original_size - minified_size) as bytes_saved,
      AVG(reduction_percent) as avg_reduction
    FROM minify_history
    WHERE user_id=${userId} AND created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at) ORDER BY day ASC
  `
}

export async function getBestReduction(userId) {
  const sql = getDB()
  const rows = await sql`
    SELECT original_size, minified_size, reduction_percent, created_at
    FROM minify_history WHERE user_id=${userId}
    ORDER BY reduction_percent DESC LIMIT 1
  `
  return rows[0] || null
}
