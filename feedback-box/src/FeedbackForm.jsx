import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function FeedbackForm({ onAdminClick }) {
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState('General')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('feedback').insert({ message, category })
    if (!error) {
      setSubmitted(true)
      setMessage('')
      setCategory('General')
      setTimeout(() => setSubmitted(false), 3000)
    } else {
      alert('Error submitting feedback: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <span style={{ fontSize: '28px' }}>📬</span>
        </div>
        <h1 style={styles.title}>Anonymous Feedback</h1>
        <p style={styles.subtitle}>Share your thoughts freely — no account needed.</p>

        {submitted && (
          <div style={styles.successBox}>
            ✅ Feedback submitted successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={styles.input}
          >
            <option>General</option>
            <option>Bug</option>
            <option>Suggestion</option>
            <option>Complaint</option>
            <option>Other</option>
          </select>

          <label style={styles.label}>Your Feedback</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            placeholder="Write your feedback here..."
            rows={5}
            style={{ ...styles.input, resize: 'vertical' }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Submitting…' : 'Submit Feedback'}
          </button>
        </form>

        <button onClick={onAdminClick} style={styles.adminLink}>
          Admin Login
        </button>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 45%, #f093fb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    top: '-100px',
    right: '-100px',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
    bottom: '-80px',
    left: '-80px',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '480px',
    background: 'rgba(255,255,255,0.14)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '24px',
    padding: '2.5rem 2rem',
    boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
    color: '#fff',
  },
  iconWrap: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '26px',
    fontWeight: '600',
    margin: '0 0 6px',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.72)',
    marginBottom: '1.75rem',
  },
  successBox: {
    background: 'rgba(52,211,153,0.22)',
    border: '1px solid rgba(52,211,153,0.45)',
    color: '#6ee7b7',
    padding: '11px 14px',
    borderRadius: '12px',
    fontSize: '14px',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: '5px',
    marginTop: '10px',
    display: 'block',
  },
  input: {
    padding: '11px 14px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border 0.2s, background 0.2s',
  },
  submitBtn: {
    marginTop: '18px',
    padding: '13px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #fff 0%, #e0d7ff 100%)',
    color: '#5b21b6',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.15s, transform 0.1s',
    fontFamily: 'inherit',
  },
  adminLink: {
    marginTop: '18px',
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.45)',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'block',
    width: '100%',
    textAlign: 'center',
    fontFamily: 'inherit',
    transition: 'color 0.15s',
  },
}