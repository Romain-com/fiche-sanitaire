import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import HomePage from './components/HomePage'
import BackOffice from './components/BackOffice'
import ClientForm from './components/ClientForm'
import PrintView from './components/PrintView'

export default function App() {
  const [view, setView] = useState('home') // home | backoffice | form | print
  const [clientCode, setClientCode] = useState(null)
  const [printFiches, setPrintFiches] = useState(null)
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [resetMode, setResetMode] = useState(false)

  useEffect(() => {
    // Check for ?code=XXXXXX in URL (parent access)
    const params = new URLSearchParams(window.location.search)
    const codeParam = params.get('code')
    if (codeParam && codeParam.length === 6) {
      setClientCode(codeParam.toUpperCase())
      setView('form')
    }

    // Listen for auth state changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session && !codeParam) {
        setView('backoffice')
      }
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)

      if (event === 'PASSWORD_RECOVERY') {
        setResetMode(true)
      }

      if (event === 'SIGNED_IN' && !resetMode) {
        setView('backoffice')
      }

      if (event === 'SIGNED_OUT') {
        setView('home')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setView('home')
  }

  function handleCodeSubmit(code) {
    setClientCode(code)
    setView('form')
  }

  function handleBack() {
    setClientCode(null)
    setPrintFiches(null)
    window.history.replaceState({}, '', window.location.pathname)
    setView(session ? 'backoffice' : 'home')
  }

  function handlePrint(ficheOrFiches) {
    const fiches = Array.isArray(ficheOrFiches) ? ficheOrFiches : [ficheOrFiches]
    setPrintFiches(fiches)
    setView('print')
  }

  function handleBackFromPrint() {
    setPrintFiches(null)
    setView('backoffice')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-esf-bg flex items-center justify-center">
        <div className="text-gray-400 text-sm">Chargement...</div>
      </div>
    )
  }

  // Password reset mode
  if (resetMode) {
    return <ResetPasswordView onDone={() => { setResetMode(false); setView(session ? 'backoffice' : 'home') }} />
  }

  switch (view) {
    case 'backoffice':
      return session
        ? <BackOffice onLogout={handleLogout} onPrint={handlePrint} />
        : <HomePage onCodeSubmit={handleCodeSubmit} />
    case 'form':
      return <ClientForm code={clientCode} onBack={handleBack} />
    case 'print':
      return <PrintView fiches={printFiches} onBack={handleBackFromPrint} />
    default:
      return <HomePage onCodeSubmit={handleCodeSubmit} />
  }
}

function ResetPasswordView({ onDone }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(onDone, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-esf-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-block bg-white rounded-2xl shadow-md p-4">
            <img src="/logo-esf.png" alt="ESF Logo" className="h-20" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Nouveau mot de passe</h2>
          {success ? (
            <div className="text-center py-4">
              <div className="text-green-600 font-medium mb-2">Mot de passe mis à jour !</div>
              <p className="text-sm text-gray-500">Redirection...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-esf-red focus:border-transparent"
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-esf-red focus:border-transparent"
                />
              </div>
              {error && (
                <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-esf-red hover:bg-esf-red-hover text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
