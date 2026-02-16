import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Line({ label, value, width = 'flex-1' }) {
  return (
    <div className="flex items-baseline gap-1 mb-[3px]">
      <span className="text-[9px] font-semibold whitespace-nowrap">{label}</span>
      <span className={`border-b border-gray-400 text-[9px] min-h-[14px] ${width} px-1`}>
        {value || ''}
      </span>
    </div>
  )
}

function InlineLine({ items }) {
  return (
    <div className="flex items-baseline gap-2 mb-[3px]">
      {items.map((item, i) => (
        <div key={i} className={`flex items-baseline gap-1 ${item.grow ? 'flex-1' : ''}`}>
          <span className="text-[9px] font-semibold whitespace-nowrap">{item.label}</span>
          <span className="border-b border-gray-400 text-[9px] min-h-[14px] flex-1 px-1">
            {item.value || ''}
          </span>
        </div>
      ))}
    </div>
  )
}

function Checkbox({ checked }) {
  return (
    <span className="inline-block w-[10px] h-[10px] border border-gray-600 text-center leading-[10px] text-[7px] align-middle mr-[2px]">
      {checked ? '✓' : ''}
    </span>
  )
}

function FichePage({ fiche }) {
  const data = fiche.data || {}

  return (
    <div className="print-page bg-white mx-auto" style={{ width: '297mm', height: '210mm', padding: '8mm 10mm', pageBreakAfter: 'always' }}>
        {/* En-tête */}
        <div className="flex items-start justify-between mb-2 border-b border-gray-300 pb-2">
          <div className="flex items-center gap-2">
            <div className="text-3xl leading-none">🐥</div>
            <div>
              <div className="text-[10px] italic leading-tight">La</div>
              <div className="text-[13px] font-bold leading-tight">maison</div>
              <div className="text-[10px] italic leading-tight">des <strong>enfants</strong></div>
            </div>
          </div>
          <div className="text-center flex-1">
            <h1 className="text-[14px] font-bold tracking-wide">FICHE SANITAIRE DE LIAISON</h1>
            <p className="text-[8px] text-gray-500 mt-[2px]">
              Ce document doit être remis aux responsables de la Maison des Enfants dès le premier jour d'accueil
            </p>
          </div>
          <div className="w-16"></div>
        </div>

        {/* 2 colonnes */}
        <div className="flex gap-4" style={{ height: 'calc(210mm - 38mm)' }}>
          {/* Colonne gauche */}
          <div className="flex-1 flex flex-col">
            {/* Section 1 */}
            <div className="mb-3">
              <h2 className="text-[10px] font-bold mb-1 underline">1 - RENSEIGNEMENTS FAMILIAUX</h2>
              <InlineLine items={[
                { label: 'NOM DE L\'ENFANT :', value: data.nomEnfant, grow: true },
                { label: 'Prénom :', value: data.prenomEnfant, grow: true },
              ]} />
              <InlineLine items={[
                { label: 'Date de naissance :', value: data.dateNaissance, grow: true },
                { label: 'Poids :', value: data.poids ? `${data.poids} kg` : '', grow: false },
              ]} />
              <div className="flex items-baseline gap-3 mb-[3px]">
                <span className="text-[9px] font-semibold">Fille</span>
                <Checkbox checked={data.sexe === 'F'} />
                <span className="text-[9px] font-semibold ml-2">Garçon</span>
                <Checkbox checked={data.sexe === 'M'} />
              </div>
              <Line label="NOM DES PARENTS (ou responsable de l'enfant) :" value={data.nomParents} />
              <Line label="Prénoms (Père et mère) :" value={data.prenomsParents} />
              <Line label="Adresse précise pendant le séjour : (Résidence, N° appartement...)" value={data.adresse} />
              <Line label="N° téléphone portable :" value={data.telephone} />
              <p className="text-[8px] italic text-gray-500 mb-1">N.B. vous vous engagez à être joignable sur ce numéro</p>
              <p className="text-[8px] font-semibold mb-1">
                Merci de préciser le nom et téléphone d'autres personnes éventuellement autorisées à venir chercher votre enfant (une carte d'identité leur sera demandée) :
              </p>
              <div className="border-b border-gray-400 min-h-[28px] text-[9px] px-1 mb-2">
                {data.personnesAutorisees || ''}
              </div>
            </div>

            {/* Section 2 */}
            <div className="mb-3">
              <h2 className="text-[10px] font-bold mb-1 underline">2 - RENSEIGNEMENTS MÉDICAUX</h2>
              <div className="flex items-baseline gap-2 mb-[3px]">
                <span className="text-[9px]">L'enfant suit-il un traitement médical pendant le séjour ?</span>
                <span className="text-[9px] font-semibold">Oui</span>
                <Checkbox checked={data.traitementMedical === 'oui'} />
                <span className="text-[9px] font-semibold ml-1">Non</span>
                <Checkbox checked={data.traitementMedical === 'non'} />
              </div>
              {data.traitementMedical === 'oui' && (
                <div className="text-[8px] italic mb-1">
                  <p>Merci de joindre une ordonnance médicale et les médicaments correspondant avec la notice.</p>
                  <div className="border-b border-gray-400 min-h-[14px] px-1 text-[9px]">{data.traitementDetail || ''}</div>
                </div>
              )}
              <p className="text-[9px] font-bold mt-2 mb-1">VACCINATIONS OBLIGATOIRES : CARNET DE SANTÉ À PRÉSENTER</p>
              <div className="border border-gray-400 p-1">
                <div className="flex gap-2">
                  <div className="flex-1 border-r border-gray-300 pr-2">
                    <p className="text-[8px] font-bold text-center mb-1 bg-gray-100 py-[2px]">ENFANT AVANT 2018</p>
                    <p className="text-[7px] mb-1">Vaccins contre la diphtérie, le tétanos et la poliomyélite (DTP)</p>
                    <Line label="Date de vaccination :" value={data.dateVaccinAvant2018} />
                  </div>
                  <div className="flex-1 pl-2">
                    <p className="text-[8px] font-bold text-center mb-1 bg-gray-100 py-[2px]">ENFANT NÉ APRÈS 2018</p>
                    <p className="text-[7px] mb-1">Vaccins contre la diphtérie, le tétanos et la poliomyélite (DTP), infections invasives à Haemophilus influenzae de Type b/ hépatite B/ infections invasives à pneumocoque/ méningocoque de sérogroupe C/ rougeole, oreillons, rubéole</p>
                    <Line label="Date de la vaccination :" value={data.dateVaccinApres2018} />
                  </div>
                </div>
              </div>
              <p className="text-[7px] italic mt-1">N.B. : Si non joindre un justificatif établi par le médecin</p>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="flex-1 flex flex-col">
            {/* Section 3 */}
            <div className="mb-3">
              <h2 className="text-[10px] font-bold mb-1 underline">3 - ALLERGIES</h2>
              <Line label="Asthme :" value={data.asthme} />
              <p className="text-[8px] italic text-gray-500 mb-[2px]">(En cas d'asthme j'autorise le personnel à administrer le traitement médical)</p>
              <Line label="Médicamenteuses :" value={data.allergiesMedicamenteuses} />
              <Line label="Alimentaires :" value={data.allergiesAlimentaires} />
              <InlineLine items={[
                { label: 'Autres :', value: data.autresAllergies, grow: true },
              ]} />
              <p className="text-[8px] italic mt-1 mb-[2px]">En cas d'allergie, ou de régime alimentaire particulier merci de préciser la cause et la conduite à tenir :</p>
              <div className="border-b border-gray-400 min-h-[28px] text-[9px] px-1 mb-2">
                {data.precisionAllergies || ''}
              </div>
            </div>

            {/* Section 4 */}
            <div className="mb-3">
              <h2 className="text-[10px] font-bold mb-1 underline">4 - DIFFICULTÉS DE SANTÉ ET/OU RECOMMANDATIONS PARTICULIÈRES</h2>
              <p className="text-[8px] italic mb-1">
                Merci d'indiquer les difficultés de santé (maladie, accidents, crises convulsives, hospitalisation, opérations...) en précisant les dates et les précautions à prendre, ou toutes recommandations :
              </p>
              <div className="border-b border-gray-400 min-h-[40px] text-[9px] px-1 mb-2">
                {data.difficulteSante || ''}
              </div>
            </div>

            {/* Section 5 */}
            <div className="flex-1">
              <h2 className="text-[10px] font-bold mb-1 underline">5 - AUTORISATIONS</h2>
              <p className="text-[8px] mb-2">
                Je soussigné(e) .......................................... responsable légal de l'enfant, déclare exacts les
                renseignements portés sur cette fiche et autorise les infirmières de la structure à prendre, en cas
                échéant, toutes mesures (traitement médical, hospitalisation, intervention chirurgicale) rendues
                nécessaires par l'état de l'enfant.
              </p>

              <div className="flex items-baseline gap-2 mb-[5px]">
                <span className="text-[9px]">J'autorise le personnel à utiliser avec mon enfant les transports en navette dans le cadre d'activités :</span>
              </div>
              <div className="flex items-center gap-4 mb-2 ml-4">
                <span className="text-[9px]">Oui</span> <Checkbox checked={data.autorisationTransport === 'oui'} />
                <span className="text-[9px] ml-2">Non</span> <Checkbox checked={data.autorisationTransport === 'non'} />
              </div>

              <div className="flex items-baseline gap-2 mb-[5px]">
                <span className="text-[9px]">J'autorise le personnel à prendre des photos de mon enfant, ces photos pourront être utilisées à des fins commerciales :</span>
              </div>
              <div className="flex items-center gap-4 mb-3 ml-4">
                <span className="text-[9px]">Oui</span> <Checkbox checked={data.autorisationPhotos === 'oui'} />
                <span className="text-[9px] ml-2">Non</span> <Checkbox checked={data.autorisationPhotos === 'non'} />
              </div>

              {/* Date et Signature */}
              <div className="flex gap-8 mt-auto pt-2">
                <div className="flex-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[9px] font-semibold">Fait le :</span>
                    <span className="border-b border-gray-400 flex-1 text-[9px] px-1 min-h-[14px]">
                      {data.date || ''}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-[9px] font-semibold">Signature :</span>
                  <div className="border-b border-gray-400 h-[50px] mt-1"></div>
                </div>
              </div>
            </div>

            {/* Footer ESF */}
            <div className="flex justify-end items-center mt-2 pt-1 border-t border-gray-200">
              <div className="text-right">
                <span className="text-[11px] font-bold text-esf-red tracking-wider">esf</span>
                <span className="text-[7px] text-gray-400 block">Réf. CIMAE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default function PrintView({ fiches, onBack }) {
  useEffect(() => {
    async function markAllPrinted() {
      const toMark = fiches.filter(f => f.status === 'rempli')
      for (const fiche of toMark) {
        await supabase
          .from('Fiche Sanitaire')
          .update({ status: 'imprime' })
          .eq('id', fiche.id)
      }
    }
    markAllPrinted()

    const timer = setTimeout(() => {
      window.print()
    }, 500)

    return () => clearTimeout(timer)
  }, [fiches])

  return (
    <div>
      {/* Print help bar */}
      <div className="no-print bg-purple-50 border-b border-purple-200 px-4 py-3 flex items-center justify-between">
        <div className="text-sm text-purple-700">
          {fiches.length > 1
            ? `Impression de ${fiches.length} fiches. `
            : ''}
          L'impression devrait se lancer automatiquement. Sinon : <strong>Ctrl+P</strong> (Windows) / <strong>Cmd+P</strong> (Mac)
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-esf-red hover:bg-esf-red-hover text-white text-sm rounded-lg transition-colors"
        >
          Retour au back-office
        </button>
      </div>

      {fiches.map((fiche, index) => (
        <FichePage key={fiche.id} fiche={fiche} />
      ))}
    </div>
  )
}
