import { useState, useEffect } from 'react'
import { Plus, Eye, Printer, CheckCircle, Trash2, RefreshCw, LogOut, Copy, ExternalLink, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'

const STATUS_CONFIG = {
  envoye: { label: 'Envoyé', color: 'bg-yellow-100 text-yellow-800', dot: '🟡' },
  rempli: { label: 'Rempli', color: 'bg-blue-100 text-blue-800', dot: '🔵' },
  imprime: { label: 'Imprimé', color: 'bg-purple-100 text-purple-800', dot: '🟣' },
  signe: { label: 'Signé', color: 'bg-green-100 text-green-800', dot: '🟢' },
}

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default function BackOffice({ onLogout, onPrint }) {
  const [fiches, setFiches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newFiche, setNewFiche] = useState({ nom: '', prenom: '', email: '' })
  const [creating, setCreating] = useState(false)
  const [inviteModal, setInviteModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmSign, setConfirmSign] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteStatus, setInviteStatus] = useState({ type: '', msg: '' })

  useEffect(() => {
    fetchFiches()
  }, [])

  async function fetchFiches() {
    setLoading(true)
    const { data, error } = await supabase
      .from('Fiche Sanitaire')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setFiches(data || [])
    setLoading(false)
  }

  async function createFiche(e) {
    e.preventDefault()
    setCreating(true)
    const code = generateCode()
    const { data, error } = await supabase
      .from('Fiche Sanitaire')
      .insert({
        code,
        nom: newFiche.nom.trim(),
        prenom: newFiche.prenom.trim(),
        email: newFiche.email.trim(),
        status: 'envoye',
        data: {
          nomEnfant: newFiche.nom.trim(),
          prenomEnfant: newFiche.prenom.trim(),
        }
      })
      .select()
      .single()

    if (!error && data) {
      setNewFiche({ nom: '', prenom: '', email: '' })
      setShowCreate(false)
      setInviteModal(data)
      fetchFiches()
    }
    setCreating(false)
  }

  async function deleteFiche(id) {
    await supabase.from('Fiche Sanitaire').delete().eq('id', id)
    setConfirmDelete(null)
    fetchFiches()
  }

  async function markAsSigned(fiche) {
    await supabase
      .from('Fiche Sanitaire')
      .update({ status: 'signe', data: null })
      .eq('id', fiche.id)
    setConfirmSign(null)
    fetchFiches()
  }

  async function simulateFill(fiche) {
    const mockData = {
      nomEnfant: fiche.nom,
      prenomEnfant: fiche.prenom,
      dateNaissance: '2020-03-15',
      poids: 18,
      sexe: 'M',
      nomParents: 'Dupont',
      prenomsParents: 'Jean et Marie',
      adresse: '12 rue des Alpes, 73000 Chambéry',
      telephone: '06 12 34 56 78',
      personnesAutorisees: 'Grand-mère : Mme Dupont - 06 98 76 54 32',
      traitementMedical: 'non',
      traitementDetail: '',
      dateVaccinAvant2018: '',
      dateVaccinApres2018: '2021-06-15',
      asthme: '',
      allergiesMedicamenteuses: '',
      allergiesAlimentaires: '',
      autresAllergies: '',
      precisionAllergies: '',
      difficulteSante: '',
      autorisationTransport: 'oui',
      autorisationPhotos: 'oui',
      date: new Date().toISOString().split('T')[0],
    }
    await supabase
      .from('Fiche Sanitaire')
      .update({ status: 'rempli', data: mockData })
      .eq('id', fiche.id)
    fetchFiches()
  }

  async function inviteOperator(e) {
    e.preventDefault()
    setInviting(true)
    setInviteStatus({ type: '', msg: '' })
    const email = inviteEmail.toLowerCase().trim()
    if (!email) { setInviting(false); return }

    // Check if already invited
    const { data: existing } = await supabase.from('operators').select('id').eq('email', email).single()
    if (existing) {
      setInviteStatus({ type: 'error', msg: 'Cet email a déjà été invité.' })
      setInviting(false)
      return
    }

    const { error } = await supabase.from('operators').insert({ email })
    if (error) {
      setInviteStatus({ type: 'error', msg: 'Erreur lors de l\'invitation.' })
    } else {
      setInviteStatus({ type: 'success', msg: `${email} a été invité ! L'opérateur peut créer son compte via "Première connexion".` })
      setInviteEmail('')
    }
    setInviting(false)
  }

  function getInviteUrl(code) {
    return `${window.location.origin}?code=${code}`
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handlePrint(fiche) {
    onPrint(fiche)
  }

  return (
    <div className="min-h-screen bg-esf-bg">
      {/* Header */}
      <div className="bg-white shadow-sm no-print">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-esf.png" alt="ESF" className="h-10" />
            <div>
              <h1 className="text-lg font-bold text-gray-800">Back-Office</h1>
              <p className="text-xs text-gray-500">Maison des Enfants</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchFiches}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={16} />
              Actualiser
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-esf-red hover:bg-esf-red-hover text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Nouvelle fiche
          </button>
          <button
            onClick={() => { setShowInvite(true); setInviteStatus({ type: '', msg: '' }); setInviteEmail('') }}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-4 py-3 rounded-lg transition-colors"
          >
            <UserPlus size={18} />
            Inviter un opérateur
          </button>
        </div>

        {/* Modal Invitation Opérateur */}
        {showInvite && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                <UserPlus size={20} />
                Inviter un opérateur
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                L'opérateur invité pourra créer son compte via "Première connexion" sur la page d'accueil.
              </p>
              <form onSubmit={inviteOperator}>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email de l'opérateur</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    required
                    placeholder="operateur@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-esf-red"
                  />
                </div>
                {inviteStatus.msg && (
                  <div className={`mb-3 px-3 py-2 rounded-lg text-sm ${
                    inviteStatus.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {inviteStatus.msg}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInvite(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="flex-1 bg-esf-red hover:bg-esf-red-hover text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {inviting ? 'Invitation...' : 'Inviter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Création */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Nouvelle fiche sanitaire</h2>
              <form onSubmit={createFiche}>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'enfant</label>
                  <input
                    type="text"
                    value={newFiche.nom}
                    onChange={e => setNewFiche(prev => ({ ...prev, nom: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-esf-red"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom de l'enfant</label>
                  <input
                    type="text"
                    value={newFiche.prenom}
                    onChange={e => setNewFiche(prev => ({ ...prev, prenom: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-esf-red"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email du parent</label>
                  <input
                    type="email"
                    value={newFiche.email}
                    onChange={e => setNewFiche(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-esf-red"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-esf-red hover:bg-esf-red-hover text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {creating ? 'Création...' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Invitation */}
        {inviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-2">Invitation créée !</h2>
              <p className="text-sm text-gray-600 mb-4">
                Communiquez ce code ou ce lien au parent de <strong>{inviteModal.prenom} {inviteModal.nom}</strong>.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <p className="text-xs text-gray-500 mb-1">Code d'accès</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-mono font-bold tracking-[0.3em]">{inviteModal.code}</span>
                  <button
                    onClick={() => copyToClipboard(inviteModal.code)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-500 mb-1">Lien direct</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-600 break-all">{getInviteUrl(inviteModal.code)}</span>
                  <button
                    onClick={() => copyToClipboard(getInviteUrl(inviteModal.code))}
                    className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {copied && (
                <p className="text-sm text-green-600 mb-3 text-center">Copié dans le presse-papiers !</p>
              )}

              <button
                onClick={() => setInviteModal(null)}
                className="w-full bg-esf-red hover:bg-esf-red-hover text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Modal Confirmation Suppression */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-2 text-red-600">Confirmer la suppression</h2>
              <p className="text-sm text-gray-600 mb-4">
                Voulez-vous vraiment supprimer la fiche de <strong>{confirmDelete.prenom} {confirmDelete.nom}</strong> ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => deleteFiche(confirmDelete.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Confirmation Signature */}
        {confirmSign && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
              <div className="text-6xl mb-4 animate-bounce">⛷️</div>
              <h2 className="text-lg font-bold mb-2">Marquer comme signé ?</h2>
              <p className="text-sm text-gray-600 mb-4">
                En marquant cette fiche comme signée, toutes les données personnelles seront <strong className="text-red-600">définitivement supprimées</strong> conformément au RGPD.
              </p>
              <p className="text-sm font-medium text-gray-800 mb-4">
                Fiche de {confirmSign.prenom} {confirmSign.nom}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmSign(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => markAsSigned(confirmSign)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des fiches */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : fiches.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl">📋</span>
            <p className="text-gray-500 mt-2">Aucune fiche pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fiches.map(fiche => {
              const status = STATUS_CONFIG[fiche.status] || STATUS_CONFIG.envoye
              return (
                <div key={fiche.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{fiche.prenom} {fiche.nom}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                          {status.dot} {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{fiche.email}</p>
                      <p className="text-xs text-gray-400 font-mono">Code : {fiche.code}</p>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {fiche.status === 'envoye' && (
                        <>
                          <button
                            onClick={() => setInviteModal(fiche)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            title="Voir invitation"
                          >
                            <ExternalLink size={14} />
                            Invitation
                          </button>
                          <button
                            onClick={() => simulateFill(fiche)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Simuler remplissage"
                          >
                            <Eye size={14} />
                            Simuler
                          </button>
                        </>
                      )}
                      {(fiche.status === 'rempli' || fiche.status === 'imprime') && (
                        <button
                          onClick={() => handlePrint(fiche)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                          title="Imprimer"
                        >
                          <Printer size={14} />
                          {fiche.status === 'imprime' ? 'Réimprimer' : 'Imprimer'}
                        </button>
                      )}
                      {fiche.status === 'imprime' && (
                        <button
                          onClick={() => setConfirmSign(fiche)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          title="Marquer signé"
                        >
                          <CheckCircle size={14} />
                          Signé
                        </button>
                      )}
                      {fiche.status !== 'signe' && (
                        <button
                          onClick={() => setConfirmDelete(fiche)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
