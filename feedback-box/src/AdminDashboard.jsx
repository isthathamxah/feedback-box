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

  return (
    <div style={styles.pageContext} className="animate-fade-in">
      {/* Top Application Bar */}
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.panelTitle}>Operations Dashboard</h1>
          <p style={styles.panelSubtitle}>Real-time systemic ingestion logs and review moderation utilities.</p>
        </div>
        <button onClick={handleSignOut} style={styles.logoutControl}>Terminate Session</button>
      </div>

      {/* Analytics Micro Grid */}
      <div style={styles.metricsGrid}>
        <div className="dashboard-card" style={styles.metaBox}>
          <span style={styles.metaLabel}>Inbound Stream</span>
          <strong style={{ ...styles.metaCount, color: '#0f172a' }}>{feedback.length}</strong>
        </div>
        <div className="dashboard-card" style={styles.metaBox}>
          <span style={styles.metaLabel}>Processed Logs</span>
          <strong style={{ ...styles.metaCount, color: '#10b981' }}>{feedback.filter(f => f.is_reviewed).length}</strong>
        </div>
        <div className="dashboard-card" style={styles.metaBox}>
          <span style={styles.metaLabel}>Outstanding Action</span>
          <strong style={{ ...styles.metaCount, color: '#f59e0b' }}>{feedback.filter(f => !f.is_reviewed).length}</strong>
        </div>
      </div>

      {/* Layout Grid Filters */}
      <div style={styles.controlBar}>
        <div style={styles.splitFilter}>
          <label style={styles.controlLabel}>Scope Taxonomy</label>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="premium-input" style={styles.dropdownCustom}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={styles.splitFilter}>
          <label style={styles.controlLabel}>Log Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="premium-input" style={styles.dropdownCustom}>
            <option value="all">All Indexed Logs</option>
            <option value="pending">Pending Review Only</option>
            <option value="reviewed">Archived / Reviewed</option>
          </select>
        </div>
      </div>

      {/* Operational Content Field */}
      {loading ? (
        <div style={styles.statusBox}>
          <div style={styles.loadingSpinner} />
          <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Synchronizing platform data schema...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.statusBox}>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>No entries found within current filtration matrix.</p>
        </div>
      ) : (
        <div style={styles.feedWrapper}>
          {filtered.map(f => (
            <div 
              key={f.id} 
              className="dashboard-card-interactive"
              style={{ 
                ...styles.logCard, 
                borderLeft: f.is_reviewed ? '4px solid #10b981' : '4px solid #f59e0b' 
              }}
            >
              <div style={styles.logCardHeader}>
                <span style={{
                  ...styles.taxBadge,
                  background: f.is_reviewed ? '#f0fdf4' : '#fffbeb',
                  color: f.is_reviewed ? '#15803d' : '#b45309',
                  border: f.is_reviewed ? '1px solid #bbf7d0' : '1px solid #fde68a'
                }}>{f.category}</span>
                <span style={styles.timestampLabel}>{new Date(f.created_at).toLocaleString()}</span>
              </div>
              
              <p style={styles.logMessage}>{f.message}</p>
              
              <div style={styles.logCardFooter}>
                <div style={styles.stateIdentifier}>
                  <span style={{ ...styles.stateIndicatorDot, backgroundColor: f.is_reviewed ? '#10b981' : '#f59e0b' }} />
                  <span style={{ color: f.is_reviewed ? '#15803d' : '#b45309', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    {f.is_reviewed ? 'Reviewed' : 'Awaiting Action'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => toggleReviewed(f)} 
                    style={{
                      ...styles.actionToggle,
                      background: f.is_reviewed ? '#f1f5f9' : '#e0e7ff',
                      color: f.is_reviewed ? '#475569' : '#4338ca'
                    }}
                  >
                    {f.is_reviewed ? 'Reopen Entry' : 'Resolve'}
                  </button>
                  <button onClick={() => deleteFeedback(f.id)} style={styles.actionPurge}>
                    Purge
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  pageContext: { maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px 24px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '24px' },
  panelTitle: { fontSize: '26px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.025em' },
  panelSubtitle: { fontSize: '14px', color: '#64748b', marginTop: '4px' },
  logoutControl: { padding: '8px 14px', background: '#ffffff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' },
  metricsGrid: { display: 'flex', gap: '16px', marginBottom: '32px' },
  metaBox: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '20px' },
  metaLabel: { fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  metaCount: { fontSize: '28px', fontWeight: '700' },
  controlBar: { display: 'flex', gap: '16px', marginBottom: '24px', background: '#f1f5f9', padding: '16px', borderRadius: '12px' },
  splitFilter: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
  controlLabel: { fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' },
  dropdownCustom: { padding: '8px 12px', fontSize: '13px', background: '#ffffff', cursor: 'pointer' },
  feedWrapper: { display: 'flex', flexDirection: 'column', gap: '16px' },
  logCard: { padding: '20px 24px' },
  logCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  taxBadge: { padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.03em' },
  timestampLabel: { fontSize: '12px', color: '#94a3b8' },
  logMessage: { margin: '0 0 20px 0', fontSize: '15px', color: '#334155', lineHeight: '1.6' },
  logCardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' },
  stateIdentifier: { display: 'flex', alignItems: 'center', gap: '8px' },
  stateIndicatorDot: { width: '6px', height: '6px', borderRadius: '50%' },
  actionToggle: { padding: '8px 14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' },
  actionPurge: { padding: '8px 14px', background: '#fff1f1', color: '#c53030', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' },
  statusBox: { textAlign: 'center', padding: '80px 24px', background: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1' },
  loadingSpinner: { width: '28px', height: '28px', border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 16px auto', cubicBezier: '(0.4, 0, 0.2, 1)', animation: 'spin 0.8s linear infinite' }
}