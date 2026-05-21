import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function AdminLogin({ onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={styles.viewWrapper}>
      <div className="animate-fade-in" style={styles.loginCard}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={styles.title}>System Authentication</h2>
          <p style={styles.subtitle}>Log in using your encrypted administration credentials.</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <span style={{ fontWeight: '600' }}>Access Denied:</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.formStructure}>
          <div style={styles.fieldContainer}>
            <label style={styles.inputLabel}>Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@system.com"
              required
              className="premium-input"
            />
          </div>

          <div style={styles.fieldContainer}>
            <label style={styles.inputLabel}>Security Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="premium-input"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={styles.actionBtn}>
            {loading ? 'Verifying Tokens...' : 'Authenticate'}
          </button>
        </form>

        <button onClick={onBack} style={styles.returnBtn}>
          ← Return to public client view
        </button>
      </div>
    </div>
  )
}

const styles = {
  viewWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '24px'
  },
  loginCard: {
    maxWidth: '400px',
    width: '100%',
    padding: '40px',
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)',
    border: '1px solid #e2e8f0'
  },
  title: { fontSize: '22px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em' },
  subtitle: { fontSize: '13px', color: '#64748b', marginTop: '6px', lineHeight: '1.4' },
  formStructure: { display: 'flex', flexDirection: 'column', gap: '18px' },
  fieldContainer: { display: 'flex', flexDirection: 'column', gap: '6px' },
  inputLabel: { fontSize: '12px', fontWeight: '600', color: '#475569' },
  actionBtn: { background: '#0f172a', boxShadow: 'none', marginTop: '6px' },
  errorAlert: {
    color: '#991b1b',
    background: '#fef2f2',
    border: '1px solid #fee2e2',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '13px',
    lineHeight: '1.4'
  },
  returnBtn: {
    marginTop: '28px',
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'block',
    width: '100%',
    textAlign: 'center'
  }
}