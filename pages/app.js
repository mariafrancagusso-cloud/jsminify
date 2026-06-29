// pages/app.js
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

function formatBytes(b) {
  if (b >= 1024 * 1024) return (b / (1024 * 1024)).toFixed(2) + ' MB'
  if (b >= 1024) return (b / 1024).toFixed(2) + ' KB'
  return b + ' B'
}

export default function App() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({ total_minifications: 0, avg_reduction: 0, total_original: 0, total_minified: 0 })
  const [inputCode, setInputCode] = useState('')
  const [outputCode, setOutputCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  useEffect(() => {
    fetch('/api/auth?action=me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) { router.replace('/login'); return }
        setUser(data.user)
      })
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => { if (data.stats) setStats(data.stats) })
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') minify()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [inputCode])

  function showToast(msg) {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 3000)
  }

  async function minify() {
    if (!inputCode.trim()) { showToast('⚠️ Cole um código primeiro!'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/minify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inputCode })
      })
      const data = await res.json()
      if (data.error) { showToast('❌ ' + data.error); return }
      setOutputCode(data.minified)
      setResult(data)
      setStats(prev => ({
        ...prev,
        total_minifications: Number(prev.total_minifications) + 1,
        total_original: Number(prev.total_original) + data.original_size,
        total_minified: Number(prev.total_minified) + data.minified_size,
      }))
      showToast('✅ Código minificado com sucesso!')
    } catch {
      showToast('❌ Erro ao processar código.')
    } finally {
      setLoading(false)
    }
  }

  function copyOutput() {
    if (!outputCode) return
    navigator.clipboard.writeText(outputCode).then(() => showToast('📋 Copiado para a área de transferência!'))
  }

  function clearAll() {
    setInputCode(''); setOutputCode(''); setResult(null)
  }

  function downloadResult() {
    if (!outputCode) return
    const blob = new Blob([outputCode], { type: 'text/javascript' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'script.min.js'
    a.click()
    showToast('⬇️ Download iniciado!')
  }

  async function logout() {
    await fetch('/api/auth?action=logout', { method: 'POST' })
    router.push('/login')
  }

  const totalSaved = Number(stats.total_original) - Number(stats.total_minified)

  return (
    <>
      <Head>
        <title>JSMinify — Dashboard</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-icon">
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                <path d="M4 8h20M4 14h14M4 20h8" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="22" cy="20" r="4" fill="#7C3AED"/>
              </svg>
            </div>
            <span className="brand-name">JSMinify</span>
          </div>
          <nav className="sidebar-nav">
            <a href="#" className="nav-item active">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              Dashboard
            </a>
            <a href="#editor" className="nav-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 5l3 3-3 3M9 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Minificar
            </a>
            <Link href="/profile" className="nav-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Perfil
            </Link>
          </nav>
        </div>
        <div className="sidebar-bottom">
          {user && (
            <div className="user-card">
              <div className="user-avatar">{user.username[0].toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>
          )}
          <button className="btn-logout" onClick={logout}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Sair
          </button>
        </div>
      </aside>

      <main className="main-content">
        <section className="stats-row">
          <div className="stat-card">
            <div className="stat-icon purple">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M3 10h10M3 15h6" stroke="#A78BFA" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="stat-body">
              <span className="stat-value">{Number(stats.total_minifications).toLocaleString()}</span>
              <span className="stat-label">Minificações</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 16l4-8 4 4 3-5" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-body">
              <span className="stat-value">{Number(stats.avg_reduction).toFixed(1)}%</span>
              <span className="stat-label">Redução média</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7" stroke="#34D399" strokeWidth="1.8"/>
                <path d="M10 7v3l2 2" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="stat-body">
              <span className="stat-value">{formatBytes(totalSaved)}</span>
              <span className="stat-label">Total economizado</span>
            </div>
          </div>
        </section>

        <section className="editor-section" id="editor">
          <div className="editor-header">
            <div>
              <h2>Minificador de JavaScript</h2>
              <p>Cole seu código e clique em Minificar</p>
            </div>
            <div className="editor-actions">
              <button className="btn-ghost" onClick={clearAll}>Limpar</button>
              <button className="btn-copy" onClick={copyOutput} disabled={!outputCode}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 10V2.5A.5.5 0 012.5 2H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Copiar
              </button>
              <button className="btn-primary" onClick={minify} disabled={loading}>
                {loading ? (
                  <svg className="spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1.5A5.5 5.5 0 1112.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 4l4 3-4 3M8 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
                {loading ? 'Processando...' : 'Minificar'}
              </button>
            </div>
          </div>

          <div className="split-editor">
            <div className="editor-pane">
              <div className="pane-label">
                <span>INPUT</span>
                <span className="size-badge">{formatBytes(new Blob([inputCode]).size)}</span>
              </div>
              <textarea
                id="inputCode"
                placeholder={'// Cole seu JavaScript aqui...\nfunction helloWorld() {\n    var message = \'Hello, World!\';\n    console.log(message);\n    return message;\n}'}
                value={inputCode}
                onChange={e => setInputCode(e.target.value)}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file?.name.endsWith('.js')) {
                    const reader = new FileReader()
                    reader.onload = ev => { setInputCode(ev.target.result); showToast('📁 Arquivo carregado: ' + file.name) }
                    reader.readAsText(file)
                  } else showToast('⚠️ Arraste um arquivo .js')
                }}
              />
            </div>

            <div className="split-divider">
              <div className="divider-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6 10h8M11 7l3 3-3 3" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            <div className="editor-pane">
              <div className="pane-label">
                <span>OUTPUT</span>
                <span className="size-badge">{formatBytes(new Blob([outputCode]).size)}</span>
              </div>
              <textarea
                id="outputCode"
                placeholder="// Resultado aparecerá aqui..."
                value={outputCode}
                readOnly
              />
            </div>
          </div>

          {result && (
            <div className="result-bar" style={{ display: 'flex' }}>
              <div className="result-stat">
                <span className="result-label">Original</span>
                <span className="result-value">{formatBytes(result.original_size)}</span>
              </div>
              <div className="result-arrow">→</div>
              <div className="result-stat">
                <span className="result-label">Minificado</span>
                <span className="result-value">{formatBytes(result.minified_size)}</span>
              </div>
              <div className="result-badge">-{result.reduction}%</div>
              <button className="btn-download" onClick={downloadResult}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M6.5 1v7M3.5 5l3 3 3-3M2 11h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                .min.js
              </button>
            </div>
          )}
        </section>

        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-num">01</div>
            <h3>Remoção de comentários</h3>
            <p>Todos os comentários <code>//</code> e <code>{`/* */`}</code> são removidos automaticamente.</p>
          </div>
          <div className="tip-card">
            <div className="tip-num">02</div>
            <h3>Compressão de whitespace</h3>
            <p>Espaços, tabs e quebras de linha desnecessários são eliminados.</p>
          </div>
          <div className="tip-card">
            <div className="tip-num">03</div>
            <h3>Palavras-chave preservadas</h3>
            <p>Keywords JS como <code>return</code>, <code>const</code>, <code>async</code> são mantidas corretamente.</p>
          </div>
        </div>
      </main>

      {toast && <div className="toast show">{toast}</div>}

      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
