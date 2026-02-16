import { useState } from 'react'
import { Eye, EyeOff, LogIn, FileText, X, ArrowLeft, Mail, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function HomePage({ onCodeSubmit }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  // Operator modal
  const [showOperator, setShowOperator] = useState(false)
  const [operatorMode, setOperatorMode] = useState('login') // login | register | forgot
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [operatorLoading, setOperatorLoading] = useState(false)
  const [operatorError, setOperatorError] = useState('')
  const [operatorSuccess, setOperatorSuccess] = useState('')

  const handleCodeSubmit = (e) => {
    e.preventDefault()
    if (code.trim().length !== 6) {
      setError('Le code doit contenir 6 caractères')
      return
    }
    setError('')
    onCodeSubmit(code.trim().toUpperCase())
  }

  function openOperator() {
    setShowOperator(true)
    setOperatorMode('login')
    setEmail('')
    setPassword('')
    setOperatorError('')
    setOperatorSuccess('')
  }

  function closeOperator() {
    setShowOperator(false)
    setOperatorError('')
    setOperatorSuccess('')
  }

  async function handleLogin(e) {
    e.preventDefault()
    setOperatorLoading(true)
    setOperatorError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setOperatorError('Email ou mot de passe incorrect.')
    }
    setOperatorLoading(false)
  }

  async function handleRegister(e) {
    e.preventDefault()
    setOperatorLoading(true)
    setOperatorError('')

    if (password.length < 6) {
      setOperatorError('Le mot de passe doit contenir au moins 6 caractères.')
      setOperatorLoading(false)
      return
    }

    // Check if email is invited
    const { data: invited } = await supabase.rpc('is_invited', { check_email: email.toLowerCase().trim() })
    if (!invited) {
      setOperatorError('Cette adresse email n\'a pas été invitée. Contactez un administrateur.')
      setOperatorLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
    })
    if (error) {
      setOperatorError(error.message)
    } else {
      setOperatorSuccess('Compte créé ! Vous pouvez maintenant vous connecter.')
      setTimeout(() => {
        setOperatorMode('login')
        setOperatorSuccess('')
        setPassword('')
      }, 2000)
    }
    setOperatorLoading(false)
  }

  async function handleForgotPassword(e) {
    e.preventDefault()
    setOperatorLoading(true)
    setOperatorError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
      redirectTo: window.location.origin,
    })
    if (error) {
      setOperatorError(error.message)
    } else {
      setOperatorSuccess('Un email de réinitialisation a été envoyé. Vérifiez votre boîte mail.')
    }
    setOperatorLoading(false)
  }

  return (
    <div className="min-h-screen bg-esf-bg flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-2xl shadow-md p-4">
            <img src="/logo-esf.png" alt="ESF Logo" className="h-20" />
          </div>
          <h1 className="text-2xl font-bold mt-4 text-gray-800">Fiche Sanitaire de Liaison</h1>
        </div>

        {/* Espace Parent */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText size={20} />
            Espace Parent
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Entrez le code à 6 caractères qui vous a été communiqué.
          </p>
          <form onSubmit={handleCodeSubmit}>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="EX: ABC123"
              maxLength={6}
              className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-esf-red focus:border-transparent uppercase"
            />
            <button
              type="submit"
              className="w-full mt-4 bg-esf-red hover:bg-esf-red-hover text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Accéder au formulaire
            </button>
          </form>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Bouton opérateur en bas à gauche */}
      <button
        onClick={openOperator}
        className="fixed bottom-4 left-4 flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        <LogIn size={14} />
        Opérateur
      </button>

      {/* Modal opérateur */}
      {showOperator && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm relative">
            <button
              onClick={closeOperator}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            {/* LOGIN */}
            {operatorMode === 'login' && (
              <>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <LogIn size={20} />
                  Connexion opérateur
                </h2>
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Email"
                      autoFocus
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-esf-red focus:border-transparent"
                    />
                  </div>
                  <div className="mb-3 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mot de passe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-esf-red focus:border-transparent pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {operatorError && (
                    <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                      {operatorError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={operatorLoading}
                    className="w-full bg-esf-red hover:bg-esf-red-hover text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {operatorLoading ? 'Connexion...' : 'Se connecter'}
                  </button>
                </form>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => { setOperatorMode('register'); setOperatorError(''); setOperatorSuccess('') }}
                    className="text-xs text-gray-500 hover:text-esf-red transition-colors flex items-center gap-1"
                  >
                    <UserPlus size={12} />
                    Première connexion
                  </button>
                  <button
                    onClick={() => { setOperatorMode('forgot'); setOperatorError(''); setOperatorSuccess('') }}
                    className="text-xs text-gray-500 hover:text-esf-red transition-colors flex items-center gap-1"
                  >
                    <Mail size={12} />
                    Mot de passe oublié
                  </button>
                </div>
              </>
            )}

            {/* REGISTER */}
            {operatorMode === 'register' && (
              <>
                <button
                  onClick={() => { setOperatorMode('login'); setOperatorError(''); setOperatorSuccess('') }}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-3"
                >
                  <ArrowLeft size={14} />
                  Retour
                </button>
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <UserPlus size={20} />
                  Première connexion
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  Créez votre compte avec l'email qui a été invité par un administrateur.
                </p>
                {operatorSuccess ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-3 rounded-lg text-sm text-center">
                    {operatorSuccess}
                  </div>
                ) : (
                  <form onSubmit={handleRegister}>
                    <div className="mb-3">
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
                        autoFocus
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-esf-red focus:border-transparent"
                      />
                    </div>
                    <div className="mb-3 relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Choisir un mot de passe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-esf-red focus:border-transparent pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {operatorError && (
                      <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                        {operatorError}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={operatorLoading}
                      className="w-full bg-esf-red hover:bg-esf-red-hover text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {operatorLoading ? 'Création...' : 'Créer mon compte'}
                    </button>
                  </form>
                )}
              </>
            )}

            {/* FORGOT PASSWORD */}
            {operatorMode === 'forgot' && (
              <>
                <button
                  onClick={() => { setOperatorMode('login'); setOperatorError(''); setOperatorSuccess('') }}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-3"
                >
                  <ArrowLeft size={14} />
                  Retour
                </button>
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Mail size={20} />
                  Mot de passe oublié
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  Entrez votre email pour recevoir un lien de réinitialisation.
                </p>
                {operatorSuccess ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-3 rounded-lg text-sm text-center">
                    {operatorSuccess}
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword}>
                    <div className="mb-3">
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
                        autoFocus
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-esf-red focus:border-transparent"
                      />
                    </div>
                    {operatorError && (
                      <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                        {operatorError}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={operatorLoading}
                      className="w-full bg-esf-red hover:bg-esf-red-hover text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {operatorLoading ? 'Envoi...' : 'Envoyer le lien'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
