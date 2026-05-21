import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import FeedbackForm from './FeedbackForm'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

export default function App() {
  const [session, setSession] = useState(undefined)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) setShowLogin(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc', color: '#64748b', fontSize: '14px', fontWeight: '500', fontFamily: 'system-ui, sans-serif' }}>
      Establishing Secure Protocol Handshake...
    </div>
  )

  if (session) return <AdminDashboard />

  if (showLogin) return <AdminLogin onBack={() => setShowLogin(false)} />

  return <FeedbackForm onAdminClick={() => setShowLogin(true)} />
}