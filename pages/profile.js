// pages/profile.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

function formatBytes(b) {
  b = Number(b)
  if (b >= 1048576) return (b / 1048576).toFixed(2) + ' MB'
  if (b >= 1024) return (b / 1024).toFixed(2) + ' KB'
  return b + ' B'
}

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [best, setBest] = useState(null)
  const [activity, setActivity] = useState([])
  const [profileForm, setProfileForm] = useState({ username: '', email: '' })
  const [pwForm, setPwForm] = useState({ current: '', newPassword: '' })
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState('')

  useEffect(() => {
    fetch('/api/auth?action=me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) { router.replace('/login'); return }
        setUser(data.user)
        setProfileForm({ username: data.user.username, email: data.user.email })
      })
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data.stats)
        setRecent(data.recent || [])
        setBest(data.best || null)
        setActivity(data.activity || [])
      })
  }, [])

  // Build 30-day chart data
  const chartData = (() => {
    const actMap = {}
    activity.forEach(r => { actMap[r.day?.split('T')[0] || r.day] = r })
    const labels = [], counts = [], saved = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      labels.push(label)
      counts.push(actMap[key] ? Number(actMap[key].count) : 0)
      saved.push(actMap[key] ? Number(actMap[key].bytes_saved) : 0)
    }
    return { labels, counts, saved }
  })()

  async function saveProfile(e) {
    e.preventDefault()
    setLoading('profile')
    const res = await fetch('/api/profile?action=update', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm)
    })
    const data = await res.json()
    setLoading('')
    setMsg({ text: data.message, type: data.success ? 'success' : 'error' })
    if (data.success) setUser(u => ({ ...u, ...profileForm }))
    setTimeout(() => setMsg({ text: '', type: '' }), 3000)
  }

  async function savePassword(e) {
    e.preventDefault()
    setLoading('pw')
    const res = await fetch('/api/profile?action=password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pwForm)
    })
    const data = await res.json()
    setLoading('')
    setMsg({ text: data.message, type: data.success ? 'success' : 'error' })
    if (data.success) setPwForm({ current: '', newPassword: '' })
    setTimeout(() => setMsg({ text: '', type: '' }), 3000)
  }

  async function logout() {
    await fetch('/api/auth?action=logout', { method: 'POST' })
    router.push('/login')
  }

  if (!user || !stats) return null

  const totalSaved = Number(stats.total_original) - Number(stats.total_minified)
  const memberDays = Math.max(1, Math.floor((Date.now() - new Date(user.created_at)) / 86400000))
  const maxCount = Math.max(...chartData.counts, 1)

  return (
    <>
      <Head>
        <title>Perfil — JSMinify</title>
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
            <Link href="/app" className="nav-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              Dashboard
            </Link>
            <Link href="/app#editor" className="nav-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 5l3 3-3 3M9 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Minificar
            </Link>
            <a href="#" className="nav-item active">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Perfil
            </a>
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="user-avatar">{user.username[0].toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={logout}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Sair
          </button>
        </div>
      </aside>

      <main className="profile-main">
        {msg.text && (
          <div className={`profile-toast ${msg.type}`}>{msg.text}</div>
        )}

        {/* Hero */}
        <section className="profile-hero">
          <div className="hero-avatar">{user.username[0].toUpperCase()}</div>
          <div className="hero-info">
            <h1>{user.username}</h1>
            <p>{user.email}</p>
            <div className="hero-badges">
              <span className="badge">Membro há {memberDays} dias</span>
              {Number(stats.total_minifications) >= 10 && <span className="badge badge-purple">⚡ Power User</span>}
            </div>
          </div>
        </section>

        {/* Stats row */}
        <section className="profile-stats">
          {[
            { label: 'Minificações', value: Number(stats.total_minifications).toLocaleString(), icon: '📦' },
            { label: 'Redução média', value: Number(stats.avg_reduction).toFixed(1) + '%', icon: '📉' },
            { label: 'Total economizado', value: formatBytes(totalSaved), icon: '💾' },
            { label: 'Melhor redução', value: best ? best.reduction_percent + '%' : '—', icon: '🏆' },
          ].map(s => (
            <div key={s.label} className="pstat-card">
              <span className="pstat-icon">{s.icon}</span>
              <span className="pstat-value">{s.value}</span>
              <span className="pstat-label">{s.label}</span>
            </div>
          ))}
        </section>

        {/* Activity chart */}
        <section className="profile-section">
          <div className="section-header"><h2>Atividade — últimos 30 dias</h2></div>
          <div className="chart-wrap">
            <div className="bar-chart">
              {chartData.labels.map((label, i) => (
                <div key={i} className="bar-col" title={`${label}: ${chartData.counts[i]} minificações`}>
                  <div className="bar-fill" style={{ height: `${(chartData.counts[i] / maxCount) * 100}%` }} />
                  {i % 7 === 0 && <span className="bar-label">{label}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent history */}
        {recent.length > 0 && (
          <section className="profile-section">
            <div className="section-header"><h2>Histórico recente</h2></div>
            <div className="history-table">
              <div className="history-head">
                <span>Original</span><span>Minificado</span><span>Redução</span><span>Data</span>
              </div>
              {recent.map((r, i) => (
                <div key={i} className="history-row">
                  <span>{formatBytes(r.original_size)}</span>
                  <span>{formatBytes(r.minified_size)}</span>
                  <span className="reduction-badge">-{Number(r.reduction_percent).toFixed(1)}%</span>
                  <span className="history-date">{new Date(r.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Edit profile */}
        <section className="profile-section">
          <div className="section-header"><h2>Editar perfil</h2></div>
          <form className="profile-form" onSubmit={saveProfile}>
            <div className="form-row">
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={profileForm.username}
                  onChange={e => setProfileForm({ ...profileForm, username: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input type="email" value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="btn-save" disabled={loading === 'profile'}>
              {loading === 'profile' ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </form>
        </section>

        {/* Change password */}
        <section className="profile-section">
          <div className="section-header"><h2>Alterar senha</h2></div>
          <form className="profile-form" onSubmit={savePassword}>
            <div className="form-row">
              <div className="form-group">
                <label>Senha atual</label>
                <input type="password" value={pwForm.current}
                  onChange={e => setPwForm({ ...pwForm, current: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Nova senha</label>
                <input type="password" value={pwForm.newPassword} minLength={6}
                  onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="btn-save" disabled={loading === 'pw'}>
              {loading === 'pw' ? 'Alterando...' : 'Alterar senha'}
            </button>
          </form>
        </section>
      </main>

      <style>{`
        .profile-main { margin-left: 240px; padding: 40px; max-width: 900px; }
        .profile-toast { position: fixed; top: 20px; right: 20px; background: #1E1E35; border: 1px solid #3D2B7A; color: #F1F0FF; padding: 12px 20px; border-radius: 10px; z-index: 100; }
        .profile-toast.success { border-color: #34D399; }
        .profile-toast.error { border-color: #F87171; }
        .profile-hero { display: flex; align-items: center; gap: 24px; margin-bottom: 32px; }
        .hero-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg,#5B21B6,#7C3AED); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; color: #fff; font-family: 'Space Grotesk',sans-serif; flex-shrink: 0; }
        .hero-info h1 { font-family: 'Space Grotesk',sans-serif; font-size: 26px; font-weight: 700; color: #F1F0FF; margin-bottom: 4px; }
        .hero-info p { color: #9CA3AF; font-size: 14px; margin-bottom: 10px; }
        .hero-badges { display: flex; gap: 8px; flex-wrap: wrap; }
        .badge { background: #13131F; border: 1px solid #1E1E35; color: #9CA3AF; font-size: 12px; padding: 4px 10px; border-radius: 20px; }
        .badge-purple { border-color: #5B21B6; color: #A78BFA; }
        .profile-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 32px; }
        .pstat-card { background: #13131F; border: 1px solid #1E1E35; border-radius: 14px; padding: 20px; text-align: center; }
        .pstat-icon { font-size: 24px; display: block; margin-bottom: 8px; }
        .pstat-value { display: block; font-family: 'Space Grotesk',sans-serif; font-size: 22px; font-weight: 700; color: #F1F0FF; margin-bottom: 4px; }
        .pstat-label { font-size: 12px; color: #6B7280; }
        .profile-section { background: #13131F; border: 1px solid #1E1E35; border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .section-header { margin-bottom: 20px; }
        .section-header h2 { font-family: 'Space Grotesk',sans-serif; font-size: 16px; font-weight: 600; color: #F1F0FF; }
        .chart-wrap { overflow-x: auto; }
        .bar-chart { display: flex; align-items: flex-end; gap: 3px; height: 100px; min-width: 600px; }
        .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; position: relative; }
        .bar-fill { width: 100%; background: linear-gradient(to top,#7C3AED,#A78BFA); border-radius: 3px 3px 0 0; min-height: 2px; transition: height .3s; }
        .bar-label { position: absolute; bottom: -18px; font-size: 9px; color: #6B7280; white-space: nowrap; }
        .history-table { display: flex; flex-direction: column; gap: 0; }
        .history-head,.history-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; padding: 10px 12px; font-size: 13px; }
        .history-head { color: #6B7280; border-bottom: 1px solid #1E1E35; font-size: 12px; }
        .history-row { color: #F1F0FF; border-bottom: 1px solid #0F0F1A; }
        .history-row:last-child { border-bottom: none; }
        .reduction-badge { color: #34D399; font-weight: 600; }
        .history-date { color: #6B7280; }
        .profile-form .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .profile-form .form-group { display: flex; flex-direction: column; gap: 6px; }
        .profile-form label { font-size: 13px; color: #9CA3AF; }
        .profile-form input { background: #0F0F1A; border: 1px solid #1E1E35; border-radius: 8px; padding: 10px 14px; color: #F1F0FF; font-size: 14px; outline: none; transition: border .2s; }
        .profile-form input:focus { border-color: #7C3AED; }
        .btn-save { background: linear-gradient(135deg,#5B21B6,#7C3AED); color: #fff; border: none; border-radius: 8px; padding: 10px 22px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        @media(max-width:768px){
          .profile-main{margin-left:0;padding:20px;}
          .profile-stats{grid-template-columns:1fr 1fr;}
          .profile-form .form-row{grid-template-columns:1fr;}
        }
      `}</style>
    </>
  )
}
