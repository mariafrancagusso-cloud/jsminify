// pages/api/auth.js
import {
  registerUser, loginUser,
  setCookieHeader, clearCookieHeader, getSession, getCurrentUser
} from '../../lib/auth'

export default async function handler(req, res) {
  const { action } = req.query

  if (action === 'me') {
    const session = getSession(req)
    if (!session) return res.status(401).json({ error: 'Não autenticado.' })
    const user = await getCurrentUser(session.id)
    return res.json({ user })
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' })

  if (action === 'register') {
    const { username, email, password } = req.body
    const result = await registerUser(username, email, password)
    return res.json(result)
  }

  if (action === 'login') {
    const { email, password } = req.body
    const result = await loginUser(email, password)
    if (result.success) {
      res.setHeader('Set-Cookie', setCookieHeader(result.token))
      return res.json({ success: true })
    }
    return res.json(result)
  }

  if (action === 'logout') {
    res.setHeader('Set-Cookie', clearCookieHeader())
    return res.json({ success: true })
  }

  return res.status(400).json({ error: 'Ação inválida.' })
}
