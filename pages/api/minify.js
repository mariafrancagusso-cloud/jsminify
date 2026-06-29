// pages/api/minify.js
import { getSession, saveHistory } from '../../lib/auth'
import { minifyJS } from '../../lib/minifier'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' })

  const session = getSession(req)
  if (!session) return res.status(401).json({ error: 'Não autenticado.' })

  const { code } = req.body
  if (!code || !code.trim()) return res.status(400).json({ error: 'Código vazio.' })
  if (code.length > 1024 * 1024) return res.status(400).json({ error: 'Código muito grande (máx. 1MB).' })

  const minified = minifyJS(code)
  const origSize = Buffer.byteLength(code, 'utf8')
  const minSize  = Buffer.byteLength(minified, 'utf8')
  const reduction = origSize > 0 ? Math.round(((origSize - minSize) / origSize) * 10000) / 100 : 0

  await saveHistory(session.id, origSize, minSize)

  return res.json({ success: true, minified, original_size: origSize, minified_size: minSize, reduction })
}
