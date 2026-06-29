// pages/register.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

function getStrength(pw) {
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^a-zA-Z0-9]/.test(pw)) score++
  const labels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte', 'Excelente']
  const colors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#10B981']
  return { score, label: labels[score] || 'força da senha', color: colors[score] || '#6B7280' }
}

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const strength = getStrength(form.password)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    const res = await fetch('/api/auth?action=register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) setSuccess(data.message)
    else setError(data.message)
  }

  return (
    <>
      <Head>
        <title>Cadastro — JSMinify</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <div className="bg-orbs">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="brand">
            <div className="brand-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M4 8h20M4 14h14M4 20h8" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="22" cy="20" r="4" fill="#7C3AED"/>
              </svg>
            </div>
            <span className="brand-name">JSMinify</span>
          </div>

          <div className="auth-header">
            <h1>Criar conta</h1>
            <p>Gratuito, sem cartão de crédito</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#F87171" strokeWidth="1.5"/>
                <path d="M8 5v3M8 11v.5" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#34D399" strokeWidth="1.5"/>
                <path d="M5 8l2 2 4-4" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {success} — <Link href="/login">Fazer login</Link>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5" r="3" stroke="#6B7280" strokeWidth="1.5"/>
                  <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input type="text" id="username" placeholder="seu_username" required
                  value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <div className="input-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4l6 5 6-5M2 4h12v9H2V4z" stroke="#6B7280" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                <input type="email" id="email" placeholder="seu@email.com" required
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha <span className="hint">(mín. 6 caracteres)</span></label>
              <div className="input-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="#6B7280" strokeWidth="1.5"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="#6B7280" strokeWidth="1.5"/>
                </svg>
                <input type={showPw ? 'text' : 'password'} id="password" placeholder="••••••••" required
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" className="toggle-pw" onClick={() => setShowPw(!showPw)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#6B7280" strokeWidth="1.5"/>
                    <circle cx="8" cy="8" r="2" stroke="#6B7280" strokeWidth="1.5"/>
                  </svg>
                </button>
              </div>
              {form.password && (
                <div className="pw-strength">
                  <div className="strength-bar">
                    <div className="strength-fill" style={{ width: `${strength.score * 20}%`, background: strength.color }} />
                  </div>
                  <span style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              <span>{loading ? 'Criando...' : 'Criar conta'}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </form>

          <div className="auth-footer">
            Já tem conta? <Link href="/login">Fazer login</Link>
          </div>
        </div>
      </div>
    </>
  )
}
