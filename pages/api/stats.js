// pages/api/stats.js
import { getSession, getUserStats, getRecentHistory, getActivityLast30Days, getBestReduction } from '../../lib/auth'

export default async function handler(req, res) {
  const session = getSession(req)
  if (!session) return res.status(401).json({ error: 'Não autenticado.' })

  const stats   = await getUserStats(session.id)
  const recent  = await getRecentHistory(session.id)
  const activity = await getActivityLast30Days(session.id)
  const best    = await getBestReduction(session.id)

  return res.json({ stats, recent, activity, best })
}
