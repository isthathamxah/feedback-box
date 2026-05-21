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
    <div style={styles.viewWrapper}>
      <div className="animate-fade-in" style={styles.formContainer}>
        <div style={styles.headerZone}>
          <h1 style={styles.appTitle}>Submit Feedback</h1>
          <p style={styles.appSubtitle}>Your thoughts go directly to our team. Completely encrypted and anonymous.</p>
        </div>

        {submitted && (
          <div className="success-banner" style={{ marginBottom: '24px' }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Feedback dispatched securely.
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.formElement}>
          <div style={styles.fieldBlock}>
            <label style={styles.fieldLabel}>Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="premium-input"
              style={{ cursor: 'pointer' }}
            >
              <option>General</option>
              <option>Bug</option>
              <option>Suggestion</option>
              <option>Complaint</option>
              <option>Other</option>
            </select>
          </div>

          <div style={styles.fieldBlock}>
            <label style={styles.fieldLabel}>Message Content</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              placeholder="Provide clear details regarding your experience or issue..."
              rows={5}
              className="premium-input"
              style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '4px' }}>
            {loading ? 'Processing Submission...' : 'Send Anonymously'}
          </button>
        </form>

        <button onClick={onAdminClick} style={styles.portalToggleBtn}>
          Authorized Administrator Access
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
  formContainer: {
    maxWidth: '460px',
    width: '100%',
    background: '#ffffff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)',
    border: '1px solid #e2e8f0'
  },
  headerZone: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  appTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.02em',
    marginBottom: '8px'
  },
  appSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.5'
  },
  formElement: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  fieldBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  fieldLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155'
  },
  portalToggleBtn: {
    marginTop: '32px',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'block',
    width: '100%',
    textAlign: 'center',
    transition: 'color 0.2s ease',
  }
}