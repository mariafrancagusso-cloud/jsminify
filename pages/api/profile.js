// pages/api/profile.js
import { getSession, updateProfile, updatePassword } from '../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' })

  const session = getSession(req)
  if (!session) return res.status(401).json({ error: 'Não autenticado.' })

  const { action } = req.query

  if (action === 'update') {
    const { username, email } = req.body
    const result = await updateProfile(session.id, username, email)
    return res.json(result)
  }

  if (action === 'password') {
    const { current, newPassword } = req.body
    const result = await updatePassword(session.id, current, newPassword)
    return res.json(result)
  }

  return res.status(400).json({ error: 'Ação inválida.' })
}
