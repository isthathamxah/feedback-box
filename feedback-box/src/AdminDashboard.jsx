import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function AdminDashboard() {
  const [feedback, setFeedback] = useState([])
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  async function fetchFeedback() {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setFeedback(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchFeedback()
    const channel = supabase
      .channel('realtime-feedback')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, () => {
        fetchFeedback()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function toggleReviewed(item) {
    await supabase
      .from('feedback')
      .update({ is_reviewed: !item.is_reviewed })
      .eq('id', item.id)
    fetchFeedback()
  }

  async function deleteFeedback(id) {
    if (!confirm('Delete this feedback?')) return
    await supabase.from('feedback').delete().eq('id', id)
    fetchFeedback()
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  const categories = ['All', ...new Set(feedback.map(f => f.category))]

  const filtered = feedback.filter(f => {
    const categoryMatch = categoryFilter === 'All' || f.category === categoryFilter
    const statusMatch = statusFilter === 'all' || (statusFilter === 'reviewed' ? f.is_reviewed : !f.is_reviewed)
    return categoryMatch && statusMatch
  })

  const reviewed = feedback.filter(f => f.is_reviewed).length
  const pending = feedback.filter(f => !f.is_reviewed).length

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.inner}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🛡️ Admin Dashboard</h1>
            <p style={styles.titleSub}>Real-time feedback management</p>
          </div>
          <button onClick={handleSignOut} style={styles.signOutBtn}>Sign Out</button>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={{ ...styles.statBox, background: 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.2))', borderColor: 'rgba(99,102,241,0.3)' }}>
            <span style={styles.statLabel}>Total</span>
            <strong style={{ ...styles.statNum, color: '#c4b5fd' }}>{feedback.length}</strong>
          </div>
          <div style={{ ...styles.statBox, background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.18))', borderColor: 'rgba(16,185,129,0.3)' }}>
            <span style={styles.statLabel}>Reviewed</span>
            <strong style={{ ...styles.statNum, color: '#6ee7b7' }}>{reviewed}</strong>
          </div>
          <div style={{ ...styles.statBox, background: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(217,119,6,0.18))', borderColor: 'rgba(245,158,11,0.3)' }}>
            <span style={styles.statLabel}>Pending</span>
            <strong style={{ ...styles.statNum, color: '#fcd34d' }}>{pending}</strong>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={styles.select}
          >
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>

        {/* Feedback List */}
        {loading ? (
          <p style={styles.emptyMsg}>Loading feedback…</p>
        ) : filtered.length === 0 ? (
          <p style={styles.emptyMsg}>No feedback found.</p>
        ) : (
          filtered.map(f => (
            <div
              key={f.id}
              style={{
                ...styles.card,
                borderLeftColor: f.is_reviewed ? 'rgba(16,185,129,0.7)' : 'rgba(245,158,11,0.7)',
              }}
            >
              <div style={styles.cardHeader}>
                <span style={styles.catBadge}>{f.category}</span>
                <span style={styles.timeLabel}>{new Date(f.created_at).toLocaleString()}</span>
              </div>
              <p style={styles.message}>{f.message}</p>
              <div style={styles.cardFooter}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: f.is_reviewed ? '#6ee7b7' : '#fcd34d',
                }}>
                  {f.is_reviewed ? '✅ Reviewed' : '🕐 Pending'}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => toggleReviewed(f)} style={styles.toggleBtn}>
                    {f.is_reviewed ? 'Unmark' : 'Mark Reviewed'}
                  </button>
                  <button onClick={() => deleteFeedback(f.id)} style={styles.deleteBtn}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    padding: '2rem 1rem',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'fixed',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
    top: '-100px',
    right: '-100px',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'fixed',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
    bottom: '-80px',
    left: '-80px',
    pointerEvents: 'none',
  },
  inner: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '780px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.75rem',
  },
  title: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#fff',
    margin: '0 0 4px',
  },
  titleSub: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.4)',
    margin: 0,
  },
  signOutBtn: {
    padding: '8px 18px',
    borderRadius: '10px',
    border: '1px solid rgba(239,68,68,0.4)',
    background: 'rgba(239,68,68,0.14)',
    color: '#fca5a5',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '1.5rem',
  },
  statBox: {
    borderRadius: '16px',
    padding: '16px',
    textAlign: 'center',
    border: '1px solid transparent',
  },
  statLabel: {
    display: 'block',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: '4px',
  },
  statNum: {
    display: 'block',
    fontSize: '28px',
    fontWeight: '600',
  },
  filters: {
    display: 'flex',
    gap: '10px',
    marginBottom: '1.5rem',
  },
  select: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
  },
  card: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderLeftWidth: '4px',
    borderRadius: '16px',
    padding: '16px 18px',
    marginBottom: '12px',
    color: '#e5e7eb',
    transition: 'background 0.15s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  catBadge: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    background: 'rgba(139,92,246,0.28)',
    color: '#c4b5fd',
    border: '1px solid rgba(139,92,246,0.4)',
    letterSpacing: '0.3px',
  },
  timeLabel: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.35)',
  },
  message: {
    fontSize: '14px',
    color: '#d1d5db',
    margin: '6px 0 12px',
    lineHeight: '1.6',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(99,102,241,0.45)',
    background: 'rgba(99,102,241,0.18)',
    color: '#a5b4fc',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s',
  },
  deleteBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(239,68,68,0.35)',
    background: 'rgba(239,68,68,0.12)',
    color: '#fca5a5',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s',
  },
  emptyMsg: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.35)',
    padding: '3rem',
    fontSize: '14px',
  },
}