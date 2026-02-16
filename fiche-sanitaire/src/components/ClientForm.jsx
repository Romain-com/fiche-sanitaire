import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { TextField, TextArea, RadioGroup } from './Field'
import LogoESF from './LogoESF'

const REQUIRED_FIELDS = ['nomEnfant', 'prenomEnfant', 'dateNaissance', 'sexe', 'nomParents', 'telephone', 'autorisationTransport', 'autorisationPhotos']

export default function ClientForm({ code, onBack }) {
  const [fiche, setFiche] = useState(null)
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchFiche()
  }, [code])

  async function fetchFiche() {
    setLoading(true)
    const { data: ficheData, error } = await supabase
      .from('Fiche Sanitaire')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (error || !ficheData) {
      setError('Code invalide ou fiche introuvable.')
      setLoading(false)
      return
    }

    if (ficheData.status === 'rempli' || ficheData.status === 'imprime' || ficheData.status === 'signe') {
      setError('Cette fiche a déjà été remplie.')
      setLoading(false)
      return
    }

    setFiche(ficheData)
    setData(ficheData.data || {
      nomEnfant: ficheData.nom,
      prenomEnfant: ficheData.prenom,
    })
    setLoading(false)
  }

  function updateField(field) {
    return (value) => {
      setData(prev => ({ ...prev, [field]: value }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const missing = REQUIRED_FIELDS.filter(f => !data[f])
    if (missing.length > 0) {
      setError('Veuillez remplir tous les champs obligatoires (marqués d\'un *).')
      return
    }

    setSubmitting(true)
    setError('')

    const { error: updateError } = await supabase
      .from('Fiche Sanitaire')
      .update({
        status: 'rempli',
        data: { ...data, date: data.date || new Date().toISOString().split('T')[0] }
      })
      .eq('id', fiche.id)

    if (updateError) {
      setError('Erreur lors de l\'enregistrement. Veuillez réessayer.')
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-esf-bg flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-esf-bg flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <span className="text-6xl">✅</span>
          <h2 className="text-xl font-bold mt-4 mb-2">Formulaire enregistré !</h2>
          <p className="text-gray-600 text-sm">
            Merci ! La fiche sanitaire de {data.prenomEnfant} a bien été enregistrée.
            L'équipe de la Maison des Enfants vous présentera le document pour signature.
          </p>
          <button
            onClick={onBack}
            className="mt-6 bg-esf-red hover:bg-esf-red-hover text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  if (error && !fiche) {
    return (
      <div className="min-h-screen bg-esf-bg flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <span className="text-6xl">❌</span>
          <h2 className="text-xl font-bold mt-4 mb-2">Erreur</h2>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={onBack}
            className="mt-6 bg-esf-red hover:bg-esf-red-hover text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-esf-bg py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <LogoESF size="md" />
          <h1 className="text-xl font-bold mt-3 text-gray-800">Fiche Sanitaire de Liaison</h1>
          <p className="text-sm text-gray-500 mt-1">Tous les champs marqués d'un <span className="text-red-500">*</span> sont obligatoires</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1 - Renseignements Familiaux */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h2 className="text-lg font-bold text-esf-red mb-4 border-b border-gray-100 pb-2">
              1. Renseignements Familiaux
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <TextField label="Nom de l'enfant" value={data.nomEnfant} onChange={updateField('nomEnfant')} required />
              <TextField label="Prénom de l'enfant" value={data.prenomEnfant} onChange={updateField('prenomEnfant')} required />
              <TextField label="Date de naissance" value={data.dateNaissance} onChange={updateField('dateNaissance')} type="date" required />
              <TextField label="Poids (kg)" value={data.poids} onChange={updateField('poids')} type="number" />
            </div>
            <RadioGroup
              label="Sexe"
              value={data.sexe}
              onChange={updateField('sexe')}
              options={[{ value: 'F', label: 'Féminin' }, { value: 'M', label: 'Masculin' }]}
              required
            />
            <TextField label="Nom des parents" value={data.nomParents} onChange={updateField('nomParents')} required />
            <TextField label="Prénoms des parents" value={data.prenomsParents} onChange={updateField('prenomsParents')} />
            <TextField label="Adresse" value={data.adresse} onChange={updateField('adresse')} />
            <TextField label="Téléphone" value={data.telephone} onChange={updateField('telephone')} required />
            <TextArea label="Personnes autorisées à récupérer l'enfant" value={data.personnesAutorisees} onChange={updateField('personnesAutorisees')} placeholder="Nom, lien de parenté et téléphone" />
          </div>

          {/* Section 2 - Renseignements Médicaux */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h2 className="text-lg font-bold text-esf-red mb-4 border-b border-gray-100 pb-2">
              2. Renseignements Médicaux
            </h2>
            <RadioGroup
              label="L'enfant suit-il un traitement médical ?"
              value={data.traitementMedical}
              onChange={updateField('traitementMedical')}
              options={[{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }]}
            />
            {data.traitementMedical === 'oui' && (
              <TextArea label="Précisez le traitement" value={data.traitementDetail} onChange={updateField('traitementDetail')} />
            )}
            <TextField label="Date dernier vaccin DT Polio (enfant né avant 2018)" value={data.dateVaccinAvant2018} onChange={updateField('dateVaccinAvant2018')} type="date" />
            <TextField label="Date dernier vaccin DT Polio (enfant né après 2018)" value={data.dateVaccinApres2018} onChange={updateField('dateVaccinApres2018')} type="date" />
          </div>

          {/* Section 3 - Allergies */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h2 className="text-lg font-bold text-esf-red mb-4 border-b border-gray-100 pb-2">
              3. Allergies
            </h2>
            <TextField label="Asthme" value={data.asthme} onChange={updateField('asthme')} placeholder="Précisez ou laissez vide si non concerné" />
            <TextField label="Allergies médicamenteuses" value={data.allergiesMedicamenteuses} onChange={updateField('allergiesMedicamenteuses')} />
            <TextField label="Allergies alimentaires" value={data.allergiesAlimentaires} onChange={updateField('allergiesAlimentaires')} />
            <TextField label="Autres allergies" value={data.autresAllergies} onChange={updateField('autresAllergies')} />
            <TextArea label="Précisions sur les allergies" value={data.precisionAllergies} onChange={updateField('precisionAllergies')} />
          </div>

          {/* Section 4 - Difficultés de Santé */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h2 className="text-lg font-bold text-esf-red mb-4 border-b border-gray-100 pb-2">
              4. Difficultés de Santé
            </h2>
            <TextArea
              label="Difficultés de santé particulières à signaler"
              value={data.difficulteSante}
              onChange={updateField('difficulteSante')}
              placeholder="Indiquez tout problème de santé que l'équipe doit connaître"
              rows={4}
            />
          </div>

          {/* Section 5 - Autorisations */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h2 className="text-lg font-bold text-esf-red mb-4 border-b border-gray-100 pb-2">
              5. Autorisations
            </h2>
            <RadioGroup
              label="Autorisez-vous le transport de votre enfant en cas d'urgence ?"
              value={data.autorisationTransport}
              onChange={updateField('autorisationTransport')}
              options={[{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }]}
              required
            />
            <RadioGroup
              label="Autorisez-vous la prise de photos de votre enfant ?"
              value={data.autorisationPhotos}
              onChange={updateField('autorisationPhotos')}
              options={[{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }]}
              required
            />
            <TextField label="Date" value={data.date} onChange={updateField('date')} type="date" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-4 py-3 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-esf-red hover:bg-esf-red-hover text-white font-semibold px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Envoi en cours...' : 'Envoyer la fiche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
